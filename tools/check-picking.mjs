// Checks that muscles stay clickable after the pose changes (npm run check):
// muscle tubes are rebuilt for every pose, so their raycast bounds must follow them. A ray aimed at
// the belly of every muscle must hit that muscle in every pose – whatever pose was raycast first.
// The real muscle meshes (anatomy mode, public/models/bp3d/muscles.bin) must exist for every muscle
// on both sides and lie on its force path (Tadasana).
//   node tools/check-picking.mjs
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { RealMuscles } from '../src/anatomy/realMuscles.js';
import { Rig } from '../src/anatomy/rig.js';
import { MuscleSystem } from '../src/anatomy/muscles.js';
import { poseToQuats } from '../src/anatomy/animator.js';
import { ASANAS } from '../src/data/asanas.js';

const rig = new Rig();
const system = new MuscleSystem(rig);
const raycaster = new THREE.Raycaster();
const meshes = system.muscles.map((m) => m.mesh);

const poses = ['tadasana', ...new Set(ASANAS.flatMap((a) => a.steps.map((s) => s.pose)))];
const SAMPLES = 18;
const RADIAL = 9;
let failures = 0;
let rays = 0;

/** Ray from outside a muscle's belly towards its axis: origin 15 cm out along the surface normal. */
function beam(mesh) {
  const pos = mesh.geometry.attributes.position;
  const nor = mesh.geometry.attributes.normal;
  const k = Math.floor(SAMPLES / 2) * (RADIAL + 1); // middle ring of the first fibre
  const p = new THREE.Vector3().fromBufferAttribute(pos, k);
  const n = new THREE.Vector3().fromBufferAttribute(nor, k).normalize();
  return { origin: p.clone().addScaledVector(n, 0.15), dir: n.negate() };
}

for (const pose of poses) {
  rig.applyQuats(poseToQuats(pose));
  rig.ground();
  system.update();
  let missed = 0;
  for (const m of system.muscles) {
    const { origin, dir } = beam(m.mesh);
    raycaster.set(origin, dir);
    rays++;
    // other muscles may be in front of this one, so it only has to be among the hits
    if (!raycaster.intersectObjects(meshes, false).some((h) => h.object === m.mesh)) {
      missed++;
      if (missed <= 3) console.log(`✗ ${pose}: ray at ${m.id} (${m.side}) does not hit it`);
    }
  }
  if (missed) {
    failures += missed;
    console.log(`  ${pose}: ${missed} of ${system.muscles.length} muscles not hit`);
  }
}
console.log(`picking: ${rays} rays over ${poses.length} poses, ${failures} misses`);

// ---- real muscle meshes (anatomy mode: Tadasana)
const bin = readFileSync(new URL('../public/models/bp3d/muscles.bin', import.meta.url));
const real = new RealMuscles(rig, bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength));
rig.applyQuats(poseToQuats('tadasana'));
rig.ground();
system.update();
real.update(true);
// the middle of every fibre's path (the centre of its middle ring) must lie within REAL_TOL of the
// real mesh: both come from the same BodyParts3D muscle, so a misplaced mesh (wrong transform or
// source version – BodyParts3D 4.0 is shifted by 5–7 cm) fails. 4 cm, not less: a straight fan
// fibre cuts the chord of a curved sheet (external oblique: 35 mm inside the curve).
const REAL_TOL = 0.04;
let realFailures = 0;
let worst = 0;
const v = new THREE.Vector3();
for (const m of system.muscles) {
  const own = real.meshes.filter((r) => r.userData.id === m.id && r.userData.side === m.side);
  if (!own.length) {
    realFailures++;
    console.log(`✗ no real mesh for ${m.id} (${m.side})`);
    continue;
  }
  const pos = m.mesh.geometry.attributes.position;
  const ring = RADIAL + 1;
  for (let f = 0; f < pos.count / (SAMPLES * ring); f++) {
    const c = new THREE.Vector3();
    const k0 = (f * SAMPLES + Math.floor(SAMPLES / 2)) * ring;
    for (let j = 0; j < RADIAL; j++) c.add(v.fromBufferAttribute(pos, k0 + j));
    c.multiplyScalar(1 / RADIAL);
    let d = Infinity;
    for (const r of own) {
      const a = r.geometry.attributes.position;
      for (let i = 0; i < a.count; i++) d = Math.min(d, c.distanceTo(v.fromBufferAttribute(a, i)));
    }
    worst = Math.max(worst, d);
    if (d > REAL_TOL) {
      realFailures++;
      console.log(`✗ ${m.id} (${m.side}) fibre ${f}: its path is ${(d * 1000).toFixed(0)} mm from the real mesh`);
    }
  }
}
const realTris = real.meshes.reduce((a, r) => a + r.geometry.index.count / 3, 0);
console.log(`real muscle meshes: ${real.meshes.length} meshes, ${realTris} triangles, paths ≤ ${(worst * 1000).toFixed(0)} mm from them, ${realFailures} failures`);
process.exit(failures || realFailures ? 1 : 0);
