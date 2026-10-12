// Sanity checks for the static analysis of every asana pose:
//   node tools/check-physics.mjs      (npm run check)
// - vertical floor forces add up to body weight, horizontal ones cancel
// - the centre of mass lies over the base of support
// - the segments listed in POSE_FIT[pose].support touch the floor (or a prop), those in .wall a wall
// - symmetric poses give (nearly) symmetric joint loads
import * as THREE from 'three';
import { Rig } from '../src/anatomy/rig.js';
import { Physics } from '../src/anatomy/physics.js';
import { poseToQuats, poseEnv } from '../src/anatomy/animator.js';
import { POSE_FIT } from '../src/data/poses.js';
import { ASANAS } from '../src/data/asanas.js';

const rig = new Rig();
const physics = new Physics(rig, { mass: 60, sex: 'f' });
const poses = new Set();
for (const a of ASANAS) {
  for (const s of a.steps) poses.add(s.pose);
  for (const v of a.variants || []) for (const st of v.steps || [{ pose: v.pose }]) poses.add(st.pose);
}
const ASYMMETRIC = /vrksasana|matsyendrasana|virabhadrasana|trikonasana|parsvakonasana|ashwa_sanchalanasana|surya_step|anjaneyasana|crescent_lunge|eka_pada|bharmanasana|parsvottanasana|janu_sirsasana|parsva_tadasana|vasisthasana|parighasana|padangusthasana|natarajasana|pavanamuktasana|jathara_parivartanasana|skandasana|ardha_chandrasana|rajakapotasana|bharadvajasana|parivrtta_utkatasana|parivrtta_trikonasana|parivrtta_parsvakonasana|virabhadrasana_1_long|parsva_sukhasana|parivrtta_sukhasana|marichyasana|supta_kapotasana|agnistambhasana|gomukhasana|parivrtta_janu_sirsasana|camatkarasana/;
let failures = 0;
const fail = (pose, msg) => {
  failures++;
  console.log(`✗ ${pose}: ${msg}`);
};

for (const pose of poses) {
  rig.env = poseEnv(pose);
  rig.applyQuats(physics.balance(poseToQuats(pose)));
  rig.ground();
  const r = physics.compute();
  const sum = r.contacts.reduce((a, c) => a.add(c.F), new THREE.Vector3());
  if (Math.abs(sum.y - r.W) > 0.01 * r.W) fail(pose, `vertical force ${sum.y.toFixed(0)} N ≠ weight ${r.W.toFixed(0)} N`);
  if (Math.hypot(sum.x, sum.z) > 0.01 * r.W) fail(pose, `horizontal forces do not cancel (${Math.hypot(sum.x, sum.z).toFixed(1)} N)`);
  if (r.margin < -0.005 && !r.leaning) fail(pose, `centre of mass ${(-r.margin * 100).toFixed(1)} cm outside the base of support (and no wall holds it)`);
  for (const spec of POSE_FIT[pose]?.support || []) {
    const segs = spec.split('|');
    if (!r.contacts.some((c) => segs.includes(c.seg))) fail(pose, `${spec} should touch the floor`);
  }
  for (const seg of POSE_FIT[pose]?.wall || []) {
    if (!r.contacts.some((c) => c.seg === seg && c.wall)) fail(pose, `${seg} should lean on the wall`);
  }
  if (!ASYMMETRIC.test(pose)) {
    const by = Object.fromEntries(r.joints.map((j) => [j.joint, j.total]));
    for (const [k, v] of Object.entries(by)) {
      if (!k.endsWith('_L')) continue;
      const w = by[k.replace(/_L$/, '_R')];
      if (Math.abs(v - w) > Math.max(3, 0.15 * Math.max(v, w))) fail(pose, `${k} ${v.toFixed(0)} vs _R ${w.toFixed(0)} N·m (asymmetric)`);
    }
  }
}
console.log(failures ? `\n${failures} problem(s) in ${poses.size} poses` : `✓ ${poses.size} poses OK`);
process.exit(failures ? 1 : 0);
