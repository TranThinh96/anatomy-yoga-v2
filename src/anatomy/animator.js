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

// A contact counts as "on the floor" when it is within this height (m) of it.
const ON_FLOOR = 0.015;
// Contacts closer together than this (m) cannot tilt the body against each other.
const MIN_SPAN = 0.3;

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
      s.keep = s.anchor ? this._floorPair(prev, s) : null;
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

  /**
   * Interpolating joint angles does not keep every contact on the floor: going from tabletop to
   * Downward Dog the slerped legs and arms no longer reach the floor together, so grounding the
   * lowest point (the feet) lifts the hands and the whole body "jumps". Segments resting on the
   * floor in both poses are split into two far-apart groups; during the move the body is tilted
   * so both groups keep their height difference (see _keepOnFloor).
   */
  _floorPair(prev, s) {
    this.rig.applyQuats(prev.quats, prev.offset);
    this.rig.ground();
    const h0 = this._segmentHeights();
    this.rig.applyQuats(s.quats, s.offset);
    this.rig.ground();
    const h1 = this._segmentHeights();
    const common = Object.keys(h0).filter((seg) => h0[seg] < ON_FLOOR && h1[seg] < ON_FLOOR);
    if (common.length < 2) return null;
    // split by the farthest pair (positions in the target pose)
    const pos = Object.fromEntries(common.map((seg) => [seg, this.rig.worldPoint(seg, new THREE.Vector3(), new THREE.Vector3())]));
    const dist = (a, b) => Math.hypot(pos[a].x - pos[b].x, pos[a].z - pos[b].z);
    let best = [null, null, 0];
    for (const a of common) for (const b of common) if (dist(a, b) > best[2]) best = [a, b, dist(a, b)];
    if (best[2] < MIN_SPAN) return null;
    const g1 = common.filter((seg) => dist(seg, best[0]) <= dist(seg, best[1]));
    const g2 = common.filter((seg) => !g1.includes(seg));
    const gap = (h) => Math.min(...g2.map((x) => h[x])) - Math.min(...g1.map((x) => h[x]));
    return { g1, g2, d0: gap(h0), d1: gap(h1) };
  }

  /** Tilts the grounded rig so the two floor groups of `keep` stay down, anchor fixed in x/z. */
  _keepOnFloor(keep, k, anchor, target) {
    const rig = this.rig;
    const centroid = (segs) => {
      const c = new THREE.Vector3();
      for (const seg of segs) c.add(rig.worldPoint(seg, new THREE.Vector3(), new THREE.Vector3()));
      return c.multiplyScalar(1 / segs.length);
    };
    const want = keep.d0 + (keep.d1 - keep.d0) * k;
    const rot = new THREE.Quaternion();
    for (let it = 0; it < 4; it++) {
      const h = this._segmentHeights();
      const err = Math.min(...keep.g2.map((x) => h[x])) - Math.min(...keep.g1.map((x) => h[x])) - want;
      if (Math.abs(err) < 5e-4) break;
      const c1 = centroid(keep.g1);
      const dir = centroid(keep.g2).sub(c1).setY(0);
      const len = dir.length();
      if (len < 1e-3) break;
      // a positive rotation about up × dir lowers group 2 relative to group 1
      rot.setFromAxisAngle(new THREE.Vector3(dir.z, 0, -dir.x).normalize(), Math.atan2(err, len));
      const pel = rig.pelvis;
      pel.quaternion.premultiply(rot);
      pel.position.sub(c1).applyQuaternion(rot).add(c1);
      rig.root.updateMatrixWorld(true);
      // hold the anchor where it was, then put the body back on the floor
      const a = centroid(anchor);
      pel.position.x += target.x - a.x;
      pel.position.z += target.z - a.z;
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
