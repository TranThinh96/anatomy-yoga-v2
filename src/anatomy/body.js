import * as THREE from 'three';
import { Rig, baseOf } from './rig.js';
import { buildSkeleton, BONE_COLOR } from './skeleton.js';
import { MuscleSystem, MUSCLE_COLOR } from './muscles.js';

// Which rig joints are shown as clickable joint markers, and their info id.
const JOINT_MARKERS = [
  ['lumbar', 'lumbar_spine_joint', 0.022, [0, 0, 0]],
  ['thorax', 'thoracic_spine_joint', 0.02, [0, 0, 0]],
  ['neck', 'cervical_spine_joint', 0.017, [0, 0, 0]],
  ['head', 'atlanto_occipital', 0.016, [0, 0, 0]],
  ['scapula_L', 'scapulothoracic', 0.016, [0.07, 0.0, -0.15]],
  ['scapula_R', 'scapulothoracic', 0.016, [-0.07, 0.0, -0.15]],
  ['scapula_L', 'sternoclavicular', 0.012, [-0.01, 0.0, 0.025]],
  ['scapula_R', 'sternoclavicular', 0.012, [0.01, 0.0, 0.025]],
  ['shoulder_L', 'glenohumeral', 0.03, [0, 0, 0]],
  ['shoulder_R', 'glenohumeral', 0.03, [0, 0, 0]],
  ['elbow_L', 'elbow', 0.024, [0, 0, 0]],
  ['elbow_R', 'elbow', 0.024, [0, 0, 0]],
  ['wrist_L', 'wrist', 0.02, [0, 0, 0]],
  ['wrist_R', 'wrist', 0.02, [0, 0, 0]],
  ['pelvis', 'sacroiliac', 0.018, [0.045, 0.05, -0.075]],
  ['pelvis', 'sacroiliac', 0.018, [-0.045, 0.05, -0.075]],
  ['pelvis', 'pubic_symphysis', 0.014, [0, -0.05, 0.08]],
  ['hip_L', 'hip', 0.034, [0, 0, 0]],
  ['hip_R', 'hip', 0.034, [0, 0, 0]],
  ['knee_L', 'knee', 0.032, [0, 0.01, 0]],
  ['knee_R', 'knee', 0.032, [0, 0.01, 0]],
  ['ankle_L', 'ankle', 0.025, [0, 0, 0]],
  ['ankle_R', 'ankle', 0.025, [0, 0, 0]],
];

export const JOINT_COLOR = new THREE.Color('#39c6b5');

export class Body {
  constructor(scene) {
    this.rig = new Rig();
    scene.add(this.rig.root);
    this.bones = buildSkeleton(this.rig);
    this.muscleSystem = new MuscleSystem(this.rig);
    scene.add(this.muscleSystem.group);
    this.muscles = this.muscleSystem.muscles.map((m) => m.mesh);

    this.jointMarkers = JOINT_MARKERS.map(([seg, id, r, off]) => {
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
      m.position.set(...off);
      m.renderOrder = 2;
      const side = seg.endsWith('_L') ? 'L' : seg.endsWith('_R') ? 'R' : off[0] > 0 ? 'L' : off[0] < 0 ? 'R' : '';
      m.userData = { kind: 'joint', id, side, rigJoint: seg };
      this.rig.joints[seg].add(m);
      return m;
    });

    this.layers = { bones: true, muscles: true, joints: true };
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
