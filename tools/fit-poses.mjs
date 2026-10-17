// Adjusts selected joint angles of each pose so that the segments listed in
// POSE_FIT[pose].support touch the floor, then writes the angles back into
// src/data/poses.js.
//   Usage: node tools/fit-poses.mjs [--dry] [--restarts N] <pose ...>   |   node tools/fit-poses.mjs [--dry] --all
// Name the poses you changed: refitting every pose rewrites angles that were already tuned.
// --restarts N also starts the descent from N random perturbations of the authored angles (each
// param ±30°, deterministic) and keeps the best: for poses where one-angle-at-a-time descent stalls
// (a body coming down onto a prop needs several angles to move together).
import { readFileSync, writeFileSync } from 'node:fs';
import * as THREE from 'three';
import { Rig } from '../src/anatomy/rig.js';
import { Physics, convexHull, signedMargin } from '../src/anatomy/physics.js';
import { poseToQuats, poseEnv } from '../src/anatomy/animator.js';
import { POSES, POSE_FIT } from '../src/data/poses.js';

const FILE = new URL('../src/data/poses.js', import.meta.url);
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const ri = args.indexOf('--restarts');
const restarts = ri >= 0 ? parseInt(args[ri + 1], 10) : 0;
const only = args.filter((a, i) => !a.startsWith('--') && !(ri >= 0 && i === ri + 1));
if (args.includes('--help') || args.includes('-h') || (!only.length && !args.includes('--all'))) {
  console.log('Usage: npm run fit-poses -- [--dry] <pose ...>   (or --all to refit every pose in POSE_FIT)');
  process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
}
const unknown = only.filter((p) => !POSE_FIT[p]);
if (unknown.length) {
  console.log(`No POSE_FIT entry for: ${unknown.join(', ')} (add one in src/data/poses.js)`);
  process.exit(1);
}
const rig = new Rig();
const physics = new Physics(rig, { mass: 60, sex: 'f' });

function supportHeights(pose, support) {
  rig.applyQuats(poseToQuats(pose));
  rig.ground();
  // "hip_L|knee_L" = either segment may touch (e.g. kneecap or tibial tuberosity)
  return support.map((spec) => {
    const segs = spec.split('|');
    let h = Infinity;
    for (const c of rig.contacts) if (segs.includes(c.seg)) h = Math.min(h, rig.clearance(c, rig.worldPoint(c.seg, c.local)));
    return h;
  });
}

const get = (pose, [k, f]) => (pose[k] && pose[k][f]) || 0;
const set = (pose, [k, f], v) => ({ ...pose, [k]: { ...(pose[k] || {}), [f]: v } });

// A parameter is one or more "joint.angle" terms joined by "&" that move
// together by the same amount ("-" flips the sign), e.g.
// "root.pitch&hip.flex&-lumbar.flex" = tilt the pelvis forward while the thighs
// and the trunk keep their orientation.
function parseParam(str) {
  return str.split('&').map((t) => {
    const neg = t.startsWith('-');
    const [k, f] = t.replace(/^-/, '').split('.');
    return { key: [k, f], sign: neg ? -1 : 1 };
  });
}
function shift(pose, param, d) {
  let out = pose;
  for (const t of param) out = set(out, t.key, get(out, t.key) + t.sign * d);
  return out;
}

// Approximate physiological limits (degrees) – the fitter is penalised beyond them.
const ROM = {
  hip: { flex: [-20, 150], abd: [-30, 70] },
  knee: { flex: [0, 160] },
  lumbar: { flex: [-35, 50], side: [-25, 25], rot: [-10, 10] },
  thorax: { flex: [-30, 45], side: [-30, 30], rot: [-35, 35] },
  shoulder: { flex: [-60, 185] },
  elbow: { flex: [0, 150] },
  ankle: { dorsi: [-60, 40] },
  wrist: { ext: [-80, 95] },
  neck: { flex: [-60, 50] },
  head: { flex: [-25, 25] },
};
function romPenalty(pose) {
  let e = 0;
  for (const [k, v] of Object.entries(pose)) {
    const lim = ROM[k.replace(/_(L|R)$/, '')];
    if (!lim || typeof v !== 'object') continue;
    for (const [f, [lo, hi]] of Object.entries(lim)) {
      const a = v[f] ?? 0;
      if (a < lo) e += 0.2 * (lo - a) ** 2;
      if (a > hi) e += 0.2 * (a - hi) ** 2;
    }
  }
  return e;
}

const wp = (seg) => rig.joints[seg].getWorldPosition(new THREE.Vector3());
const wdir = (seg, v) => new THREE.Vector3(...v).transformDirection(rig.joints[seg].matrixWorld);

// Optional geometric goals (all errors in cm or degrees-ish, squared):
//   flat:  segments whose every contact point must touch (e.g. a whole foot)
//   wall:  segments that lean on a wall of POSE_PROPS (their nearest point touches it)
//   onProp: segments that rest on a prop (a block, not the floor beside it)
//   rel:   [segA, segB, [dx, dz]] horizontal offset of joint B from joint A (m)
//   dir:   [seg, localVector, worldVector] a segment axis should point this way
//   above: [upper, lower] joint `upper` stacked vertically over joint `lower`
//   at:    [joint, seg, [dx, dy, dz], weight?] put a joint on a point riding on segment `seg`:
//          seg's joint centre + offset (m, rest-pose axes of seg) – a hand on the shin, a foot
//          against the inner thigh, the sit bones on the heels
//   balance: centre of mass at least 3 cm inside the base of support
//   lift:  segments held at least LIFT clear of the floor and props (feet off the mat in an arm
//          balance: without it the balance goal is met by putting them down)
const LIFT = 0.04;
function goals(fit) {
  let e = 0;
  if (fit.balance) {
    const com = physics.centerOfMass();
    const margin = signedMargin({ x: com.x, z: com.z }, convexHull(physics.touchingContacts()));
    if (margin < 0.03) e += ((0.03 - Math.max(margin, -0.5)) * 100) ** 2 * 3;
  }
  for (const seg of fit.lift || []) {
    for (const c of rig.contacts) {
      if (c.seg !== seg) continue;
      const h = rig.clearance(c, rig.worldPoint(c.seg, c.local));
      if (h < LIFT) e += ((LIFT - h) * 100) ** 2 * 3;
    }
  }
  for (const seg of fit.flat || []) {
    for (const c of rig.contacts) if (c.seg === seg) e += (rig.clearance(c, rig.worldPoint(c.seg, c.local)) * 100) ** 2 * 0.3;
  }
  // segments that must rest on a prop (not on the floor beside it)
  for (const seg of fit.onProp || []) {
    let gap = Infinity;
    for (const c of rig.contacts) if (c.seg === seg) gap = Math.min(gap, Math.abs(rig.env.propClearance(rig.worldPoint(c.seg, c.local), c.r)));
    e += Math.min(gap * 100, 30) ** 2;
  }
  // nothing goes through a wall
  for (const c of rig.env.empty ? [] : rig.wallContacts) {
    const gap = rig.env.wallGap(rig.worldPoint(c.seg, c.local), c.r).gap;
    if (gap < 0) e += (gap * 100) ** 2 * 3;
  }
  for (const seg of fit.wall || []) {
    let gap = Infinity;
    for (const c of rig.wallContacts) if (c.seg === seg) gap = Math.min(gap, rig.env.wallGap(rig.worldPoint(c.seg, c.local), c.r).gap);
    e += (gap * 100) ** 2;
  }
  for (const [a, b, [dx, dz]] of fit.rel || []) {
    const A = wp(a);
    const B = wp(b);
    e += ((B.x - A.x - dx) * 100) ** 2 + ((B.z - A.z - dz) * 100) ** 2;
  }
  for (const [seg, lv, wv] of fit.dir || []) {
    const d = wdir(seg, lv);
    const t = new THREE.Vector3(...wv).normalize();
    e += 400 * (1 - d.dot(t));
  }
  for (const [j, seg, off, w = 1] of fit.at || []) {
    const target = rig.worldPoint(seg, new THREE.Vector3(...off));
    e += w * (wp(j).distanceTo(target) * 100) ** 2;
  }
  for (const [u, l] of fit.above || []) {
    const U = wp(u);
    const L = wp(l);
    e += ((U.x - L.x) * 100) ** 2 + ((U.z - L.z) * 100) ** 2;
  }
  return e;
}

function cost(pose, fit, start) {
  const hs = supportHeights(pose, fit.support);
  let e = hs.reduce((a, h) => a + (h * 100) ** 2, 0); // cm²
  e += goals(fit);
  for (const p of fit.params) for (const t of p) e += 0.002 * (get(pose, t.key) - get(start, t.key)) ** 2; // stay close to the authored pose
  return e + romPenalty(pose) - romPenalty(start);
}

let text = readFileSync(FILE, 'utf8');
function patch(poseName, [key, field], value) {
  const start = text.indexOf(`\n  ${poseName}: {`);
  const end = text.indexOf('\n  },', start);
  let block = text.slice(start, end);
  const lineRe = new RegExp(`\\n(\\s+)${key}: \\{([^}]*)\\},`);
  const m = block.match(lineRe);
  if (m) {
    let inner = m[2];
    const fRe = new RegExp(`\\b${field}: -?[\\d.]+`);
    inner = fRe.test(inner) ? inner.replace(fRe, `${field}: ${value}`) : `${inner.trimEnd()}, ${field}: ${value} `;
    block = block.replace(lineRe, `\n${m[1]}${key}: {${inner}},`);
  } else {
    block += `\n    ${key}: { ${field}: ${value} },`;
  }
  text = text.slice(0, start) + block + text.slice(end);
}

for (const [name, fit] of Object.entries(POSE_FIT)) {
  if (only.length && !only.includes(name)) continue;
  rig.env = poseEnv(name);
  const start = POSES[name];
  const params = fit.params.map(parseParam);
  const keys = [...new Map(params.flat().map((t) => [t.key.join('.'), t.key])).values()];
  const before = supportHeights(start, fit.support);
  const descend = (from) => {
    let pose = from;
    let e = cost(pose, { ...fit, params }, start);
    for (const step of [8, 4, 2, 1, 0.5]) {
      let improved = true;
      for (let guard = 0; improved && guard < 60; guard++) {
        improved = false;
        for (const p of params) {
          for (const d of [step, -step]) {
            const cand = shift(pose, p, d);
            const ce = cost(cand, { ...fit, params }, start);
            if (ce < e - 1e-9) {
              pose = cand;
              e = ce;
              improved = true;
            }
          }
        }
      }
    }
    return { pose, e };
  };
  let best = descend(start);
  let seed = 1;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let r = 0; r < restarts; r++) {
    let from = start;
    for (const p of params) from = shift(from, p, Math.round((rand() * 2 - 1) * 30));
    const res = descend(from);
    if (res.e < best.e) best = res;
  }
  const pose = best.pose;
  const after = supportHeights(pose, fit.support);
  const fmt = (hs) => hs.map((h) => (h * 100).toFixed(1)).join('/');
  const changed = keys.filter((p) => Math.round(get(pose, p)) !== Math.round(get(start, p)));
  const changes = changed.map((p) => `${p.join('.')} ${get(start, p)}→${Math.round(get(pose, p))}`);
  console.log(`${name.padEnd(26)} gap cm ${fmt(before)} → ${fmt(after)}  ${changes.join(', ')}`);
  if (!dry) for (const p of changed) patch(name, p, Math.round(get(pose, p)));
}
if (!dry) writeFileSync(FILE, text);
