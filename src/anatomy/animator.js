import * as THREE from 'three';
import { semanticToQuat } from './rig.js';
import { POSES, expandPose } from '../data/poses.js';

const JOINT_ALIAS = { pelvis: 'pelvis' };

export function poseToQuats(poseId) {
  const pose = typeof poseId === 'string' ? POSES[poseId] : poseId;
  if (!pose) throw new Error(`Unknown pose ${poseId}`);
  const exp = expandPose(pose);
  const q = {};
  for (const [joint, angles] of Object.entries(exp)) q[JOINT_ALIAS[joint] || joint] = semanticToQuat(joint, angles);
  return q;
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Plays a sequence of poses. Each step: { pose, move (s), hold (s), anchor: [segments] }.
 * The anchor (e.g. the feet) stays fixed on the floor during the move into that step,
 * which is what makes a transition read like a real movement.
 */
export class Animator {
  constructor(rig, onFrame) {
    this.rig = rig;
    this.onFrame = onFrame;
    this.speed = 1;
    this.playing = true;
    this.time = 0;
    this.setSequence([{ pose: 'tadasana', hold: 1 }]);
  }

  setSequence(steps, { loop = 'cycle' } = {}) {
    this.loop = loop;
    this.steps = steps.map((s) => ({ move: 1.6, hold: 1.5, anchor: null, ...s, quats: poseToQuats(s.pose) }));
    if (loop === 'pingpong' && this.steps.length > 1) {
      const back = this.steps
        .slice(0, -1)
        .reverse()
        .map((s, i, arr) => ({ ...s, move: this.steps[this.steps.length - 1 - i].move, anchor: this.steps[this.steps.length - 1 - i].anchor }));
      this.steps = [...this.steps, ...back];
    }
    // timings
    let t = 0;
    this.steps.forEach((s, i) => {
      s.start = t;
      s.moveDur = i === 0 ? 0 : s.move;
      t += s.moveDur + s.hold;
      s.end = t;
    });
    this.duration = t;
    this._computeOffsets();
    this.time = 0;
    this.render();
  }

  _anchorXZ(quats, offset, anchor) {
    this.rig.applyQuats(quats, offset);
    this.rig.ground();
    const p = new THREE.Vector3();
    const acc = new THREE.Vector3();
    for (const seg of anchor) acc.add(this.rig.worldPoint(seg, new THREE.Vector3(), p));
    return acc.multiplyScalar(1 / anchor.length);
  }

  _computeOffsets() {
    let off = { x: 0, z: 0 };
    this.steps[0].offset = off;
    for (let i = 1; i < this.steps.length; i++) {
      const s = this.steps[i];
      const prev = this.steps[i - 1];
      if (s.anchor) {
        const a0 = this._anchorXZ(prev.quats, prev.offset, s.anchor);
        const a1 = this._anchorXZ(s.quats, { x: 0, z: 0 }, s.anchor);
        s.anchorTarget = a0;
        off = { x: a0.x - a1.x, z: a0.z - a1.z };
      } else {
        off = { ...prev.offset };
      }
      s.offset = off;
    }
    // Centre the whole sequence around the origin (use the most "important" step).
    const key = this.steps[Math.min(1, this.steps.length - 1)];
    this.center = { x: key.offset.x, z: key.offset.z };
  }

  /** Returns { index, alpha } of the step being moved into / held at time t. */
  locate(t) {
    for (let i = 0; i < this.steps.length; i++) {
      const s = this.steps[i];
      if (t < s.end || i === this.steps.length - 1) {
        const alpha = s.moveDur > 0 ? THREE.MathUtils.clamp((t - s.start) / s.moveDur, 0, 1) : 1;
        return { index: i, alpha };
      }
    }
    return { index: 0, alpha: 1 };
  }

  /** Index of the step whose pose is currently dominant (for highlighting). */
  get currentStep() {
    const { index, alpha } = this.locate(this.time);
    return alpha < 0.5 && index > 0 ? index - 1 : index;
  }

  poseAt(t) {
    const { index, alpha } = this.locate(t);
    const s = this.steps[index];
    const prev = this.steps[Math.max(index - 1, 0)];
    const k = ease(alpha);
    const quats = {};
    const q = new THREE.Quaternion();
    for (const name in this.rig.joints) {
      const a = prev.quats[name] || q.identity();
      const b = s.quats[name] || new THREE.Quaternion();
      quats[name] = new THREE.Quaternion().copy(a).slerp(b, k);
    }
    return { quats, s, prev, k };
  }

  render() {
    const { quats, s, prev, k } = this.poseAt(this.time);
    const cx = this.center.x;
    const cz = this.center.z;
    if (s.anchor && s !== prev) {
      // keep the anchor where it was at the start of the move
      this.rig.applyQuats(quats, { x: 0, z: 0 });
      this.rig.ground();
      const p = new THREE.Vector3();
      const acc = new THREE.Vector3();
      for (const seg of s.anchor) acc.add(this.rig.worldPoint(seg, new THREE.Vector3(), p));
      acc.multiplyScalar(1 / s.anchor.length);
      this.rig.applyQuats(quats, { x: s.anchorTarget.x - acc.x - cx, z: s.anchorTarget.z - acc.z - cz });
    } else {
      const ox = prev.offset.x + (s.offset.x - prev.offset.x) * k;
      const oz = prev.offset.z + (s.offset.z - prev.offset.z) * k;
      this.rig.applyQuats(quats, { x: ox - cx, z: oz - cz });
    }
    this.rig.ground();
    this.onFrame?.();
  }

  tick(dt) {
    if (!this.playing || this.duration <= 0) return;
    this.time += dt * this.speed;
    if (this.time > this.duration) this.time = this.time % this.duration;
    this.render();
  }

  seek(t) {
    this.time = THREE.MathUtils.clamp(t, 0, this.duration);
    this.render();
  }

  /** Jump to the hold phase of step i. */
  seekStep(i) {
    const s = this.steps[i];
    this.seek(s.start + s.moveDur + 0.01);
  }
}
