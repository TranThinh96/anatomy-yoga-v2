// Checks the animated transitions of every asana (and variant) – the static checks cannot see them:
//   node tools/check-transitions.mjs [asana-id …] [--verbose] [--steps]
// Plays each sequence at 60 fps (as the app does: every pose balanced, anchored moves corrected)
// and fails on:
// - wobble: the pelvis leaving its own smoothed path (0.1 s moving average) by more than 6 mm –
//   a bounce, a hitch or a jump (a smooth fast move stays well under it)
// - anchor lift: an anchored segment that rests on the floor at both ends of a move (hands / feet
//   that should stay down) more than 15 mm off it during the move
// - joint jump: any joint turning faster than 900 °/s (a quick step peaks at ~500 °/s; jumps
//   between solutions were 1000–5000 °/s)
// - hyperextension: a knee or elbow below −5° flexion (bent backwards)
// - stepping foot: a foot that steps to a new place clearing the floor by less than 5 cm
// Limits were set from the sequences after the fixes in the git log (Vrksasana, Navasana, Surya
// Namaskar stepping); see the add-asana skill for what each failure usually means.
import * as THREE from 'three';
import { Rig } from '../src/anatomy/rig.js';
import { Physics } from '../src/anatomy/physics.js';
import { Animator } from '../src/anatomy/animator.js';
import { ASANAS } from '../src/data/asanas.js';

const LIMITS = { wobble: 0.006, anchorLift: 0.015, jointSpeed: 900, hyperext: -5, clearance: 0.05 };
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const listSteps = args.includes('--steps'); // print when each move starts and ends (for review-poses --at)
const only = args.filter((a) => !a.startsWith('--'));
const rig = new Rig();
const physics = new Physics(rig, { mass: 60, sex: 'f' });
const dt = 1 / 60;
const W = 3; // moving-average half window (frames)
const flexOf = (q) => (2 * Math.atan2(q.x, q.w) * 180) / Math.PI; // single-axis joints (knee, elbow)
let failures = 0;

for (const a of ASANAS) {
  if (only.length && !only.includes(a.id)) continue;
  for (const v of [null, ...(a.variants || [])]) {
    const name = `${a.id}${v ? ` / ${v.pose}` : ''}`;
    const steps = a.steps.map((s, i) => (v && i === a.steps.length - 1 ? { ...s, pose: v.pose } : s));
    const anim = new Animator(rig, null, { prepare: (q) => physics.balance(q) });
    anim.setSequence(steps, { loop: a.loop });
    if (anim.duration <= 0 || anim.steps.length < 2) continue;
    if (listSteps)
      for (const [i, s] of anim.steps.entries())
        if (s.moveDur) console.log(`  ${name} step ${i} → ${s.pose}${s.via ? ' (via)' : ''}: move ${s.start.toFixed(2)}–${(s.start + s.moveDur).toFixed(2)} s`);
    const pelvis = [];
    let prevQ = null;
    const worst = { wobble: [0], anchorLift: [0], jointSpeed: [0], hyperext: [0] };
    const clear = new Map(); // stepping move -> highest point of its stepping foot
    for (let t = 0; t <= anim.duration + 1e-9; t += dt) {
      anim.seek(t);
      pelvis.push(rig.pelvis.position.clone());
      const { index, alpha } = anim.locate(t);
      const s = anim.steps[index];
      const moving = s.anchor && s.moveDur > 0 && alpha > 0 && alpha < 1;
      const low = moving ? anim._lowestPoints() : null;
      if (moving) {
        // anchors that rest on the floor at both ends of the move (the thighs in Navasana are an
        // anchor for position but rise with the legs)
        const keep = s.chain?.keep || s.keep || [];
        for (const g of s.anchor) {
          const k = keep.find((x) => x.seg === g);
          if (k && k.h0 < 0.015 && k.h1 < 0.015 && low[g].y > worst.anchorLift[0]) worst.anchorLift = [low[g].y, t, g];
        }
        const move = s.chain || s;
        const paths = s.chain?.stepPaths || s.stepPaths;
        for (const { foot } of paths || []) clear.set(move, { foot, t, y: Math.max(clear.get(move)?.y ?? 0, low[foot].y) });
      }
      const q = {};
      for (const j in rig.joints) {
        q[j] = rig.joints[j].quaternion.clone();
        if (prevQ) {
          const w = (2 * Math.acos(Math.min(1, Math.abs(q[j].dot(prevQ[j])))) * 180) / Math.PI / dt;
          if (w > worst.jointSpeed[0]) worst.jointSpeed = [w, t, j];
        }
        if (/^(knee|elbow)_/.test(j)) {
          const f = j.startsWith('knee') ? flexOf(q[j]) : -flexOf(q[j]);
          if (f < worst.hyperext[0]) worst.hyperext = [f, t, j];
        }
      }
      prevQ = q;
    }
    for (let i = W; i < pelvis.length - W; i++) {
      const m = new THREE.Vector3();
      for (let j = -W; j <= W; j++) m.add(pelvis[i + j]);
      const d = pelvis[i].distanceTo(m.multiplyScalar(1 / (2 * W + 1)));
      if (d > worst.wobble[0]) worst.wobble = [d, i * dt];
    }
    const at = (w) => `at ${w[1]?.toFixed(2)} s${w[2] ? ` (${w[2]})` : ''}`;
    const problems = [];
    if (worst.wobble[0] > LIMITS.wobble) problems.push(`pelvis wobbles ${(worst.wobble[0] * 1000).toFixed(1)} mm off its smooth path ${at(worst.wobble)}`);
    if (worst.anchorLift[0] > LIMITS.anchorLift) problems.push(`anchor ${(worst.anchorLift[0] * 1000).toFixed(0)} mm off the floor ${at(worst.anchorLift)}`);
    if (worst.jointSpeed[0] > LIMITS.jointSpeed) problems.push(`joint turns ${worst.jointSpeed[0].toFixed(0)} °/s ${at(worst.jointSpeed)}`);
    if (worst.hyperext[0] < LIMITS.hyperext) problems.push(`${worst.hyperext[2]} bent backwards to ${worst.hyperext[0].toFixed(0)}° ${at(worst.hyperext)}`);
    for (const { foot, t, y } of clear.values()) if (y < LIMITS.clearance) problems.push(`${foot} steps but clears only ${(y * 100).toFixed(1)} cm (move ending ${t.toFixed(2)} s)`);
    for (const p of problems) {
      failures++;
      console.log(`✗ ${name}: ${p}`);
    }
    if (verbose)
      console.log(
        `  ${name.padEnd(46)} wobble ${(worst.wobble[0] * 1000).toFixed(1)} mm, anchor lift ${(worst.anchorLift[0] * 1000).toFixed(0)} mm, ` +
          `joint ${worst.jointSpeed[0].toFixed(0)} °/s, knee/elbow ≥ ${worst.hyperext[0].toFixed(0)}°` +
          [...clear.values()].map((c) => `, ${c.foot} clears ${(c.y * 100).toFixed(1)} cm`).join(''),
      );
  }
}
console.log(failures ? `\n${failures} transition problem(s)` : '✓ transitions OK');
process.exit(failures ? 1 : 0);
