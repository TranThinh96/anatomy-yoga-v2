import * as THREE from 'three';
import { Rig, baseOf } from './rig.js';
import { MuscleSystem, MUSCLE_COLOR } from './muscles.js';
import { loadSkeleton } from './bp3d.js';
import { MODEL } from '../data/body-model.gen.js';

export const BONE_COLOR = new THREE.Color('#e9dfc8');
const SIDED = new Set(['scapula', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle']);

// Clickable joint markers (positions measured on the bones by tools/bp3d-build.mjs).
const JOINT_MARKERS = MODEL.markers.flatMap(({ seg, id, r, p, mirror }) => {
  const [x, y, z] = p;
  if (SIDED.has(seg)) return [[`${seg}_L`, id, r, [x, y, z], 'L'], [`${seg}_R`, id, r, [-x, y, z], 'R']];
  if (mirror) return [[seg, id, r, [x, y, z], 'L'], [seg, id, r, [-x, y, z], 'R']];
  return [[seg, id, r, [x, y, z], '']];
});

export const JOINT_COLOR = new THREE.Color('#39c6b5');

export class Body {
  constructor(scene) {
    this.rig = new Rig();
    scene.add(this.rig.root);
    this.bones = []; // filled by loadBones()
    this.muscleSystem = new MuscleSystem(this.rig);
    scene.add(this.muscleSystem.group);
    this.muscles = this.muscleSystem.muscles.map((m) => m.mesh);

    this.jointMarkers = JOINT_MARKERS.map(([seg, id, r, world, side]) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(r, 20, 14),
        new THREE.MeshStandardMaterial({
          color: JOINT_COLOR.clone(),
          roughness: 0.3,
          transparent: true,
          opacity: 0.85,
          emissive: JOINT_COLOR.clone().multiplyScalar(0.25),
          depthTest: true,
        }),
      );
      m.position.set(...world);
      m.renderOrder = 2;
      m.userData = { kind: 'joint', id, side, rigJoint: seg };
      this.rig.attach(seg, m);
      return m;
    });

    this.layers = { bones: true, muscles: true, joints: true };
    this.model = MODEL;
  }

  /** Loads the BodyParts3D skeleton and attaches every bone to its rig segment. */
  async loadBones(url) {
    const parts = await loadSkeleton(url);
    for (const { part, geometry, mirrored } of parts) {
      const side = SIDED.has(part.seg) ? (mirrored ? 'R' : 'L') : '';
      const seg = side ? `${part.seg}_${side}` : part.seg;
      const m = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ color: BONE_COLOR, roughness: 0.62, metalness: 0, emissive: new THREE.Color(0) }),
      );
      m.castShadow = true;
      m.userData = { kind: 'bone', id: part.id, side: side === 'L' ? 1 : side === 'R' ? -1 : 0, fma: part.fma, name: part.name };
      this.rig.attach(seg, m);
      m.visible = this.layers.bones;
      this.bones.push(m);
    }
    return this.bones;
  }

  get pickables() {
    return [...this.bones, ...this.muscles, ...this.jointMarkers];
  }

  update() {
    this.muscleSystem.update();
  }

  setLayer(layer, on) {
    this.layers[layer] = on;
    const list = layer === 'bones' ? this.bones : layer === 'muscles' ? this.muscles : this.jointMarkers;
    for (const m of list) m.visible = on;
  }

  /** Resets all materials to their neutral colours. */
  resetColors({ muscleOpacity = 1 } = {}) {
    for (const b of this.bones) {
      b.material.emissive.setRGB(0, 0, 0);
      if (b.userData.baseColor) b.material.color.set(b.userData.baseColor);
      else b.material.color.copy(BONE_COLOR);
    }
    for (const m of this.muscleSystem.muscles) {
      m.mesh.material.color.copy(MUSCLE_COLOR);
      m.mesh.material.emissive.setRGB(0, 0, 0);
      m.mesh.material.opacity = muscleOpacity;
      m.mesh.material.depthWrite = muscleOpacity > 0.95;
    }
    for (const j of this.jointMarkers) {
      j.material.color.copy(JOINT_COLOR);
      j.material.emissive.copy(JOINT_COLOR).multiplyScalar(0.25);
      j.scale.setScalar(1);
    }
  }

  musclesById(id, side) {
    return this.muscleSystem.muscles.filter((m) => m.id === id && (!side || m.side === side));
  }
}

export { baseOf };
