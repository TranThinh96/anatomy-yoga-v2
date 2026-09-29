// Checks that muscles stay clickable after the pose changes (npm run check):
// muscle tubes are rebuilt for every pose, so their raycast bounds must follow them. A ray aimed at
// the belly of every muscle must hit that muscle in every pose – whatever pose was raycast first.
//   node tools/check-picking.mjs
import * as THREE from 'three';
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
process.exit(failures ? 1 : 0);
