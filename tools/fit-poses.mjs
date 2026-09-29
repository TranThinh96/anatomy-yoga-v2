// Adjusts selected joint angles of each pose so that the segments listed in
// POSE_FIT[pose].support touch the floor, then writes the angles back into
// src/data/poses.js.   Usage: node tools/fit-poses.mjs [--dry] [pose ...]
import { readFileSync, writeFileSync } from 'node:fs';
import * as THREE from 'three';
import { Rig } from '../src/anatomy/rig.js';
import { poseToQuats } from '../src/anatomy/animator.js';
import { POSES, POSE_FIT } from '../src/data/poses.js';

const FILE = new URL('../src/data/poses.js', import.meta.url);
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const only = args.filter((a) => !a.startsWith('--'));
const rig = new Rig();

function supportHeights(pose, support) {
  rig.applyQuats(poseToQuats(pose));
  rig.ground();
  return support.map((seg) => {
    let h = Infinity;
    for (const c of rig.contacts) if (c.seg === seg) h = Math.min(h, rig.worldPoint(c.seg, c.local).y - c.r);
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
  hip: { flex: [-20, 140], abd: [-30, 70] },
  knee: { flex: [0, 160] },
  lumbar: { flex: [-35, 50] },
  thorax: { flex: [-30, 45] },
  shoulder: { flex: [-60, 180] },
  elbow: { flex: [0, 150] },
  ankle: { dorsi: [-60, 40] },
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
//   rel:   [segA, segB, [dx, dz]] horizontal offset of joint B from joint A (m)
//   dir:   [seg, localVector, worldVector] a segment axis should point this way
//   above: [upper, lower] joint `upper` stacked vertically over joint `lower`
function goals(fit) {
  let e = 0;
  for (const seg of fit.flat || []) {
    for (const c of rig.contacts) if (c.seg === seg) e += ((rig.worldPoint(c.seg, c.local).y - c.r) * 100) ** 2 * 0.3;
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
  const start = POSES[name];
  const params = fit.params.map(parseParam);
  const keys = [...new Map(params.flat().map((t) => [t.key.join('.'), t.key])).values()];
  let pose = start;
  let e = cost(pose, { ...fit, params }, start);
  const before = supportHeights(pose, fit.support);
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
  const after = supportHeights(pose, fit.support);
  const fmt = (hs) => hs.map((h) => (h * 100).toFixed(1)).join('/');
  const changed = keys.filter((p) => Math.round(get(pose, p)) !== Math.round(get(start, p)));
  const changes = changed.map((p) => `${p.join('.')} ${get(start, p)}→${Math.round(get(pose, p))}`);
  console.log(`${name.padEnd(26)} gap cm ${fmt(before)} → ${fmt(after)}  ${changes.join(', ')}`);
  if (!dry) for (const p of changed) patch(name, p, Math.round(get(pose, p)));
}
if (!dry) writeFileSync(FILE, text);
