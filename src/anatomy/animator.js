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

// A segment counts as resting on the floor when it is within this height (m) of it ...
const ON_FLOOR = 0.015;
// ... and as staying put when it moves less than this (m) across the floor between two poses.
const STAYS = 0.1;
// Floor contacts weigh less than the anchor when they cannot all be kept down.
const CONTACT_WEIGHT = 0.25;
// Lifts smaller than this (m) are left alone (soft tissue; avoids rocking between heel and toes).
const TOLERANCE = 0.005;
// Largest tilt (rad) per iteration: the least-squares step is linearised.
const MAX_STEP = 0.05;

/** Solves the 3×3 system A·x = b (Cramer's rule). */
function solve3(A, b) {
  const det = (m) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const d = det(A);
  return [0, 1, 2].map((i) => det(A.map((row, r) => row.map((v, j) => (j === i ? b[r] : v)))) / d);
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Plays a sequence of poses. Each step: { pose, move (s), hold (s), anchor: [segments] }.
 * The anchor (e.g. the feet) stays fixed on the floor during the move into that step,
 * which is what makes a transition read like a real movement.
 */
export class Animator {
  constructor(rig, onFrame, { prepare = null } = {}) {
    this.rig = rig;
    this.onFrame = onFrame;
    // optional hook to post-process a pose's quaternions (e.g. static balance)
    this.prepare = prepare;
    this._cache = new Map();
    this.speed = 1;
    this.playing = true;
    this.time = 0;
    this.setSequence([{ pose: 'tadasana', hold: 1 }]);
  }

  setSequence(steps, { loop = 'cycle' } = {}) {
    this.loop = loop;
    this.steps = steps.map((s) => ({ move: 1.6, hold: 1.5, anchor: null, ...s, quats: this.quatsFor(s.pose) }));
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

  quatsFor(pose) {
    if (!this._cache.has(pose)) {
      const q = poseToQuats(pose);
      this._cache.set(pose, this.prepare ? this.prepare(q) : q);
    }
    return this._cache.get(pose);
  }

  /** Call after changing anything that affects `prepare` (e.g. body mass model). */
  clearCache() {
    this._cache.clear();
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
      s.keep = s.anchor ? this._floorTargets(prev, s) : null;
    }
    // Centre the whole sequence around the origin (use the most "important" step).
    const key = this.steps[Math.min(1, this.steps.length - 1)];
    this.center = { x: key.offset.x, z: key.offset.z };
  }

  /** Lowest contact height of each segment in the current rig state. */
  _segmentHeights() {
    const h = {};
    const p = new THREE.Vector3();
    for (const c of this.rig.contacts) {
      const y = this.rig.worldPoint(c.seg, c.local, p).y - c.r;
      if (!(c.seg in h) || y < h[c.seg]) h[c.seg] = y;
    }
    return h;
  }

  /** Lowest contact point (y and world position) of each segment in the current rig state. */
  _lowestPoints() {
    const low = {};
    const p = new THREE.Vector3();
    for (const c of this.rig.contacts) {
      const y = this.rig.worldPoint(c.seg, c.local, p).y - c.r;
      if (!low[c.seg] || y < low[c.seg].y) low[c.seg] = { y, pos: p.clone() };
    }
    return low;
  }

  /**
   * Interpolating joint angles does not keep the supports on the floor: going from tabletop to
   * Downward Dog the slerped arms and legs no longer reach the floor together, so grounding the
   * lowest point (the feet) lifts the hands and the whole body "jumps". This records the height
   * of the anchor, and of every other segment resting on the floor in both poses without moving
   * across it, so that _keepOnFloor can hold them during the move.
   */
  _floorTargets(prev, s) {
    this.rig.applyQuats(prev.quats, prev.offset);
    this.rig.ground();
    const l0 = this._lowestPoints();
    this.rig.applyQuats(s.quats, s.offset);
    this.rig.ground();
    const l1 = this._lowestPoints();
    const targets = [];
    for (const seg in l0) {
      const anchor = s.anchor.includes(seg);
      const resting = l0[seg].y < ON_FLOOR && l1[seg].y < ON_FLOOR && Math.hypot(l0[seg].pos.x - l1[seg].pos.x, l0[seg].pos.z - l1[seg].pos.z) < STAYS;
      if (anchor || resting) targets.push({ seg, h0: l0[seg].y, h1: l1[seg].y, w: anchor ? 1 : CONTACT_WEIGHT });
    }
    return targets;
  }

  /**
   * Tilts (pitch / roll) and lifts the grounded rig so the recorded segments are as close as
   * possible to their interpolated heights (weighted least squares, linearised and iterated),
   * keeping the anchor fixed in x/z; ground() then keeps everything above the floor.
   */
  _keepOnFloor(keep, k, anchor, target) {
    const rig = this.rig;
    const pel = rig.pelvis;
    const p = new THREE.Vector3();
    const rot = new THREE.Quaternion();
    const qx = new THREE.Quaternion();
    const X = new THREE.Vector3(1, 0, 0);
    const Z = new THREE.Vector3(0, 0, 1);
    const pivots = new Set();
    for (let it = 0; it < 6; it++) {
      const low = this._lowestPoints();
      const c = new THREE.Vector3();
      for (const seg of anchor) c.add(low[seg].pos);
      c.multiplyScalar(1 / anchor.length);
      // unknowns u = [dy, ax, az]: a rotation ax about X lowers a point by ax·dz, az about Z raises it by az·dx
      const A = [[1e-6, 0, 0], [0, 1e-4, 0], [0, 0, 1e-4]];
      const b = [0, 0, 0];
      // whatever rests (or rested in an earlier iteration) on the floor is the pivot: it should stay there
      const minY = Math.min(...Object.values(low).map((l) => l.y));
      for (const seg in low) if (low[seg].y < minY + 0.005) pivots.add(seg);
      const rows = keep.map((t) => ({ seg: t.seg, want: t.h0 + (t.h1 - t.h0) * k, w: t.w }));
      for (const seg of pivots) if (!rows.some((t) => t.seg === seg)) rows.push({ seg, want: 0, w: CONTACT_WEIGHT });
      let worst = 0;
      for (const t of rows) {
        const l = low[t.seg];
        // only pull segments down: one lower than its target (a thigh rising off the floor
        // more slowly than in the end pose) is not floating
        const r = keep.some((x) => x.seg === t.seg) ? Math.max(0, l.y - t.want - TOLERANCE) : l.y;
        if (keep.some((x) => x.seg === t.seg)) worst = Math.max(worst, r * t.w);
        const J = [1, -(l.pos.z - c.z), l.pos.x - c.x];
        for (let i = 0; i < 3; i++) {
          b[i] -= t.w * J[i] * r;
          for (let j = 0; j < 3; j++) A[i][j] += t.w * J[i] * J[j];
        }
      }
      if (worst < 5e-4) break;
      let [, ax, az] = solve3(A, b);
      const step = Math.hypot(ax, az);
      if (step > MAX_STEP) [ax, az] = [(ax * MAX_STEP) / step, (az * MAX_STEP) / step];
      rot.setFromAxisAngle(X, ax).multiply(qx.setFromAxisAngle(Z, az));
      pel.quaternion.premultiply(rot);
      pel.position.sub(c).applyQuaternion(rot).add(c);
      rig.root.updateMatrixWorld(true);
      // hold the anchor where it was, then put the body back on the floor
      c.set(0, 0, 0);
      for (const seg of anchor) c.add(rig.worldPoint(seg, new THREE.Vector3(), p));
      c.multiplyScalar(1 / anchor.length);
      pel.position.x += target.x - c.x;
      pel.position.z += target.z - c.z;
      rig.root.updateMatrixWorld(true);
      rig.ground();
    }
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
      this.rig.ground();
      if (s.keep && k > 0 && k < 1) this._keepOnFloor(s.keep, k, s.anchor, { x: s.anchorTarget.x - cx, z: s.anchorTarget.z - cz });
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
