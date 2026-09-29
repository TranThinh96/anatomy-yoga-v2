// Checks of the muscle model (npm run check):
//  1. moment arms: analytic (virtual work) = −dL/dθ by finite differences, for every fibre
//  2. moment-arm signs agree with textbook muscle actions in the anatomical position, and
//     keep their sign over the range of motion used by the poses (wrapping surfaces work)
//  3. static optimisation: muscle + reserve moments reproduce the joint moments exactly,
//     activations stay within [0, 1]; prints the most active muscles of every pose
//   node tools/check-muscles.mjs [--verbose]
import * as THREE from 'three';
import { Rig, semanticToQuat, baseOf } from '../src/anatomy/rig.js';
import { MuscleSystem } from '../src/anatomy/muscles.js';
import { Physics } from '../src/anatomy/physics.js';
import { MuscleForces, JOINT_AXES } from '../src/anatomy/muscleForces.js';
import { poseToQuats } from '../src/anatomy/animator.js';
import { ASANAS } from '../src/data/asanas.js';

const verbose = process.argv.includes('--verbose');
const rig = new Rig();
const system = new MuscleSystem(rig);
const physics = new Physics(rig, { mass: 60, sex: 'f' });
const mf = new MuscleForces(rig, system);
let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`✗ ${msg}`);
};

// ---- 1. finite differences
{
  const axis = new THREE.Vector3(0.36, 0.78, -0.51).normalize();
  const v = new THREE.Vector3();
  let worst = 0;
  rig.applyQuats({ hip_L: semanticToQuat('hip_L', { flex: 40, abd: 10 }), knee_L: semanticToQuat('knee_L', { flex: 70 }), shoulder_L: semanticToQuat('shoulder_L', { flex: 60, abd: 20 }), elbow_L: semanticToQuat('elbow_L', { flex: 60 }) });
  for (const f of mf.fibres) {
    if (f.muscle.side !== 'L') continue;
    for (const cr of f.crosses) {
      mf.updatePoints();
      const L0 = f.length;
      const arm = mf.momentArm(f, cr, v).dot(axis);
      const j = rig.joints[cr.joint];
      const q0 = j.quaternion.clone();
      const pw = j.parent.getWorldQuaternion(new THREE.Quaternion());
      const h = 1e-4;
      const R = new THREE.Quaternion().setFromAxisAngle(axis, h);
      j.quaternion.copy(pw.clone().invert().multiply(R).multiply(pw).multiply(q0));
      rig.root.updateMatrixWorld(true);
      mf.updatePoints();
      const fd = -(f.length - L0) / h;
      j.quaternion.copy(q0);
      rig.root.updateMatrixWorld(true);
      const err = Math.abs(fd - arm);
      worst = Math.max(worst, err);
      if (err > 0.002) fail(`moment arm ${f.muscle.id}[${f.index}] @ ${cr.joint}: analytic ${(arm * 100).toFixed(2)} cm vs finite difference ${(fd * 100).toFixed(2)} cm`);
    }
  }
  console.log(`moment arms vs finite differences: worst error ${(worst * 1000).toFixed(2)} mm`);
}

// ---- 2. signs
const arm = (id, fibre, joint, dof) => {
  mf.updatePoints();
  const v = new THREE.Vector3();
  const e = new THREE.Vector3();
  const out = [];
  for (const f of mf.fibres) {
    if (f.muscle.id !== id || f.muscle.side !== 'L' || (fibre !== null && f.index !== fibre)) continue;
    const cr = f.crosses.find((c) => c.joint === joint);
    if (!cr) continue;
    mf.momentArm(f, cr, v);
    const d = JOINT_AXES[baseOf(joint)].dofs.find((x) => x.key === dof);
    const src = d.axis[0] === 'p' ? rig.joints[joint].parent : rig.joints[joint];
    const el = src.matrixWorld.elements;
    const k = { x: 0, y: 4, z: 8 }[d.axis[1]];
    e.set(el[k], el[k + 1], el[k + 2]).normalize();
    const s = d.sign === 's' ? 1 : d.sign === '-s' ? -1 : d.sign;
    out.push({ v: v.dot(e) * s, fmax: f.fmax });
  }
  if (!out.length) return null;
  return out.reduce((a, o) => a + o.v * o.fmax, 0) / out.reduce((a, o) => a + o.fmax, 0);
};
// [muscle, fibre (null = strength-weighted mean), joint, dof, expected sign, reference action]
const ACTIONS = [
  ['iliopsoas', null, 'hip_L', 'flex', 1],
  ['rectus_femoris', null, 'hip_L', 'flex', 1],
  ['rectus_femoris', null, 'knee_L', 'flex', -1],
  ['vastus_lateralis', null, 'knee_L', 'flex', -1],
  ['vastus_medialis', null, 'knee_L', 'flex', -1],
  ['hamstrings', 0, 'hip_L', 'flex', -1],
  ['hamstrings', 1, 'hip_L', 'flex', -1],
  ['hamstrings', 2, 'hip_L', 'flex', -1],
  ['hamstrings', null, 'knee_L', 'flex', 1],
  ['gluteus_maximus', null, 'hip_L', 'flex', -1],
  ['gluteus_maximus', null, 'hip_L', 'rot', 1],
  ['gluteus_medius', null, 'hip_L', 'abd', 1],
  ['tfl_itb', null, 'hip_L', 'abd', 1],
  ['piriformis', null, 'hip_L', 'rot', 1],
  ['adductors', null, 'hip_L', 'abd', -1],
  ['sartorius', null, 'hip_L', 'flex', 1],
  ['gastrocnemius', null, 'knee_L', 'flex', 1],
  ['gastrocnemius', null, 'ankle_L', 'dorsi', -1],
  ['soleus', null, 'ankle_L', 'dorsi', -1],
  ['tibialis_anterior', null, 'ankle_L', 'dorsi', 1],
  ['deltoid', 0, 'shoulder_L', 'flex', 1],
  ['deltoid', 1, 'shoulder_L', 'abd', 1],
  ['deltoid', 2, 'shoulder_L', 'flex', -1],
  ['supraspinatus', null, 'shoulder_L', 'abd', 1],
  ['infraspinatus', null, 'shoulder_L', 'rot', 1],
  ['latissimus_dorsi', null, 'shoulder_L', 'abd', -1],
  ['latissimus_dorsi', null, 'shoulder_L', 'flex', -1],
  ['pectoralis_major', 0, 'shoulder_L', 'flex', 1],
  ['pectoralis_major', null, 'shoulder_L', 'abd', -1],
  ['biceps_brachii', null, 'elbow_L', 'flex', 1],
  ['triceps_brachii', null, 'elbow_L', 'flex', -1],
  ['forearm_flexors', null, 'wrist_L', 'flex', 1],
  ['forearm_extensors', null, 'wrist_L', 'flex', -1],
  ['serratus_anterior', null, 'scapula_L', 'protract', 1],
  ['rhomboids', null, 'scapula_L', 'protract', -1],
  ['levator_scapulae', null, 'scapula_L', 'elev', 1],
  ['pectoralis_minor', null, 'scapula_L', 'elev', -1],
  ['latissimus_dorsi', null, 'scapula_L', 'elev', -1],
  ['rectus_abdominis', null, 'lumbar', 'flex', 1],
  ['external_oblique', null, 'lumbar', 'flex', 1],
  ['erector_spinae', null, 'lumbar', 'flex', -1],
  ['erector_spinae', null, 'thorax', 'flex', -1],
  ['quadratus_lumborum', null, 'lumbar', 'side', 1],
  ['sternocleidomastoid', null, 'neck', 'flex', 1],
];
rig.applyQuats({});
for (const [id, fibre, joint, dof, sign] of ACTIONS) {
  const a = arm(id, fibre, joint, dof);
  if (a === null) fail(`${id} does not cross ${joint}`);
  else if (a * sign <= 0.002) fail(`${id}${fibre !== null ? `[${fibre}]` : ''} ${joint}.${dof}: ${(a * 100).toFixed(1)} cm, expected ${sign > 0 ? '+' : '−'}`);
}
// over the range of motion used by the poses
const RANGES = [
  ['knee_L', 'flex', [0, 30, 60, 90, 120, 150], [['vastus_lateralis', 'flex', -1], ['rectus_femoris', 'flex', -1], ['hamstrings', 'flex', 1]]],
  ['knee_L', 'flex', [0, 30, 60, 90], [['gastrocnemius', 'flex', 1]]],
  ['hip_L', 'flex', [-20, 0, 30, 60, 90, 120], [['gluteus_maximus', 'flex', -1], ['iliopsoas', 'flex', 1], ['rectus_femoris', 'flex', 1]]],
  ['hip_L', 'flex', [0, 30, 60, 90, 120], [['hamstrings', 'flex', -1]]],
  ['hip_L', 'abd', [-20, 0, 20, 40], [['adductors', 'abd', -1]]],
  ['hip_L', 'abd', [-20, 0, 20], [['gluteus_medius', 'abd', 1]]],
  ['elbow_L', 'flex', [0, 30, 60, 90, 120, 140], [['triceps_brachii', 'flex', -1]]],
  ['elbow_L', 'flex', [0, 30, 60, 90, 120], [['biceps_brachii', 'flex', 1]]],
  ['ankle_L', 'dorsi', [-40, -20, 0, 20, 30], [['soleus', 'dorsi', -1], ['gastrocnemius', 'dorsi', -1], ['tibialis_anterior', 'dorsi', 1]]],
  ['shoulder_L', 'abd', [0, 45, 90], [['deltoid', 'abd', 1, 1]]],
  ['lumbar', 'flex', [-30, 0, 30], [['erector_spinae', 'flex', -1], ['rectus_abdominis', 'flex', 1]]],
];
for (const [joint, key, angles, list] of RANGES) {
  for (const ang of angles) {
    rig.applyQuats({ [joint]: semanticToQuat(joint, { [key]: ang }) });
    for (const [id, dof, sign, fibre = null] of list) {
      const a = arm(id, fibre, joint, dof);
      if (a === null || a * sign <= 0.002) fail(`${id} ${joint}.${dof} at ${key} ${ang}°: ${a === null ? 'n/a' : (a * 100).toFixed(1)} cm, expected ${sign > 0 ? '+' : '−'}`);
    }
  }
}

// ---- 3. static optimisation on every pose
const poses = new Set();
for (const a of ASANAS) {
  for (const s of a.steps) poses.add(s.pose);
  for (const v of a.variants || []) poses.add(v.pose);
}
const NAMES = { L: 'T', R: 'P' };
for (const pose of poses) {
  rig.applyQuats(physics.balance(poseToQuats(pose)));
  rig.ground();
  const r = physics.compute();
  const t0 = performance.now();
  const sol = mf.solve(r.moments);
  const ms = performance.now() - t0;
  // equilibrium: Σ muscle moment + reserve = demanded moment, per joint axis
  let worst = 0;
  const v = new THREE.Vector3();
  const got = new Map();
  for (const { fibre, force } of sol.fibres) {
    if (!force) continue;
    for (const cr of fibre.crosses) {
      mf.momentArm(fibre, cr, v);
      if (!got.has(cr.joint)) got.set(cr.joint, new THREE.Vector3());
      got.get(cr.joint).addScaledVector(v, force);
    }
  }
  for (const row of sol.reserves) {
    const need = (r.moments[row.joint] || new THREE.Vector3()).dot(row.e);
    const have = (got.get(row.joint) || new THREE.Vector3()).dot(row.e) + row.raw;
    worst = Math.max(worst, Math.abs(have - need));
  }
  if (worst > 0.05) fail(`${pose}: joint moments not reproduced (error ${worst.toFixed(2)} N·m)`);
  if (sol.fibres.some((f) => f.a < -1e-6 || f.a > 1 + 1e-6)) fail(`${pose}: activation outside [0, 1]`);
  const top = [...sol.muscles.values()].sort((a, b) => b.a - a.a).slice(0, verbose ? 10 : 5);
  const reserve = sol.reserves.filter((x) => Math.abs(x.value) >= 2).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  console.log(
    `${pose.padEnd(28)} ${top.map((m) => `${m.id}${m.side ? `_${NAMES[m.side]}` : ''}${m.part ? `(${m.part})` : ''} ${Math.round(m.a * 100)}%`).join(', ')}` +
      (reserve.length ? `\n${''.padEnd(29)}reserve: ${reserve.slice(0, 4).map((x) => `${x.joint}.${x.dof.key} ${x.value.toFixed(0)} N·m`).join(', ')}` : '') +
      (verbose ? `  [${sol.iters} it, ${ms.toFixed(1)} ms]` : ''),
  );
}
console.log(failures ? `\n${failures} muscle-model problem(s)` : `✓ muscle model OK (${mf.fibres.length} fibres, ${poses.size} poses)`);
process.exit(failures ? 1 : 0);
