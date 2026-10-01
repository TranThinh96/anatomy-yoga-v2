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

// Anchored pairs whose distance apart is held during a move: [end segment, limb root].
const LIMB_PAIRS = [
  ['wrist', 'shoulder'],
  ['ankle', 'hip'],
];

/** Solves the 3×3 system A·x = b (Cramer's rule). */
function solve3(A, b) {
  const det = (m) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const d = det(A);
  return [0, 1, 2].map((i) => det(A.map((row, r) => row.map((v, j) => (j === i ? b[r] : v)))) / d);
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Cubic Hermite basis at t ∈ [0, 1]: weights of p0, m0, p1, m1. */
const hermite = (t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return [2 * t3 - 3 * t2 + 1, t3 - 2 * t2 + t, -2 * t3 + 3 * t2, t3 - t2];
};

/**
 * Plays a sequence of poses. Each step: { pose, move (s), hold (s), anchor: [segments], via }.
 * The anchor (e.g. the feet) stays fixed on the floor during the move into that step,
 * which is what makes a transition read like a real movement.
 * A `via` step is a pose the body passes through without stopping (e.g. lifting the knee on
 * the way into Tree): the moves into it and out of it form one eased curve, a monotone Hermite
 * spline through the poses, instead of two moves that each slow to a halt.
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
    for (const s of this.steps) if (s.via) s.hold = 0;
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
    this._computeChains();
    this._computeOffsets();
    this.time = 0;
    this.render();
  }

  /** Groups each run of moves joined by `via` steps into one chain with a shared easing. */
  _computeChains() {
    const steps = this.steps;
    for (const s of steps) s.chain = null;
    for (let i = 1; i < steps.length; i++) {
      if (!steps[i].via || steps[i - 1].via) continue;
      let j = i;
      while (j + 1 < steps.length && steps[j].via && steps[j + 1].moveDur > 0) j++;
      if (j === i) continue;
      const members = steps.slice(i, j + 1);
      const keys = [steps[i - 1], ...members];
      const dur = members.reduce((a, m) => a + m.moveDur, 0);
      // key parameters along the chain: cumulative share of its duration
      const u = [0];
      for (const m of members) u.push(u[u.length - 1] + m.moveDur / dur);
      u[u.length - 1] = 1;
      const chain = { start: steps[i].start, dur, keys, u };
      for (const m of members) m.chain = chain;
    }
  }

  /** Joint rotations along a chain at parameter u (C1 Hermite spline through the key poses, per quaternion component). */
  _chainQuats(chain, n, local) {
    const { keys, u } = chain;
    const quats = {};
    const at = (key, name) => key.quats[name] || new THREE.Quaternion();
    const h = hermite(local);
    const du = u[n + 1] - u[n];
    for (const name in this.rig.joints) {
      // sign-align the key quaternions so the spline takes the short way round
      const q = keys.map((k) => at(k, name).clone());
      for (let i = 1; i < q.length; i++) if (q[i].dot(q[i - 1]) < 0) q[i].set(-q[i].x, -q[i].y, -q[i].z, -q[i].w);
      const v = (i) => [q[i].x, q[i].y, q[i].z, q[i].w];
      // tangent at key i (d quat / d u): the secant at the ends; inside, monotone (PCHIP,
      // Fritsch–Butland) so a joint that holds still before a via pose does not start the next
      // move early (leaning back into Navasana while the hands are still being lifted) and a
      // component never overshoots the keys
      const slope = (i) => v(i + 1).map((x, c) => (x - v(i)[c]) / (u[i + 1] - u[i]));
      const tangent = (i) => {
        if (i === 0) return slope(0);
        if (i === q.length - 1) return slope(i - 1);
        const [d0, d1] = [slope(i - 1), slope(i)];
        const [h0, h1] = [u[i] - u[i - 1], u[i + 1] - u[i]];
        const [w0, w1] = [2 * h1 + h0, h1 + 2 * h0];
        return d0.map((a, c) => (a * d1[c] <= 0 ? 0 : (w0 + w1) / (w0 / a + w1 / d1[c])));
      };
      const p0 = v(n);
      const p1 = v(n + 1);
      const m0 = tangent(n);
      const m1 = tangent(n + 1);
      const r = p0.map((x, c) => h[0] * x + h[1] * du * m0[c] + h[2] * p1[c] + h[3] * du * m1[c]);
      quats[name] = new THREE.Quaternion(...r).normalize();
    }
    return quats;
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
      s.width = s.anchor ? this._anchorWidth(prev, s) : null;
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
   * Both hands (or both feet) as the anchor: their distance apart in both poses. Interpolating
   * the shoulder angles swings the arms through an arc (Upward → Downward Dog spreads the hands
   * from 33 to 54 cm and back), so _keepWidth holds the distance during the move.
   */
  _anchorWidth(prev, s) {
    const pair = LIMB_PAIRS.find(([end]) => s.anchor.includes(`${end}_L`) && s.anchor.includes(`${end}_R`));
    if (!pair) return null;
    const [end, root] = pair;
    const width = (quats) => {
      this.rig.applyQuats(quats);
      return this._horizontal(`${end}_L`, `${end}_R`).length();
    };
    return { end, root, w0: width(prev.quats), w1: width(s.quats) };
  }

  /** Horizontal vector from joint b to joint a in the current rig state. */
  _horizontal(a, b) {
    const pa = this.rig.worldPoint(a, new THREE.Vector3(), new THREE.Vector3());
    const pb = this.rig.worldPoint(b, new THREE.Vector3(), new THREE.Vector3());
    return pa.sub(pb).setY(0);
  }

  /** Rotates the limb roots (shoulders / hips) in `quats` so the anchored pair keeps its interpolated width. */
  _keepWidth(quats, { end, root, w0, w1 }, k) {
    const want = w0 + (w1 - w0) * k;
    const rig = this.rig;
    const parentQ = new THREE.Quaternion();
    const rot = new THREE.Quaternion();
    for (let it = 0; it < 3; it++) {
      rig.applyQuats(quats);
      const lat = this._horizontal(`${end}_L`, `${end}_R`);
      const err = want - lat.length();
      if (Math.abs(err) < 5e-4) break;
      lat.normalize();
      for (const [side, sign] of [['_L', 1], ['_R', -1]]) {
        // move this end by err/2 along the left-right line, by turning the limb about its root
        const v = rig.worldPoint(`${end}${side}`, new THREE.Vector3(), new THREE.Vector3()).sub(rig.worldPoint(`${root}${side}`, new THREE.Vector3(), new THREE.Vector3()));
        const d = lat.clone().multiplyScalar((sign * err) / 2);
        const axis = v.clone().cross(d);
        if (axis.lengthSq() < 1e-12) continue;
        rot.setFromAxisAngle(axis.normalize(), d.length() / v.length());
        // world-space rotation → local: parent⁻¹ · R · parent · q
        rig.joints[`${root}${side}`].parent.getWorldQuaternion(parentQ);
        const local = parentQ.clone().invert().multiply(rot).multiply(parentQ);
        quats[`${root}${side}`] = local.multiply(quats[`${root}${side}`]);
      }
    }
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
   * across it, so that _keepOnFloor can hold them during the move. Segments that rest on the
   * floor at the start but not at the end (heels lifting into Navasana) are returned as `leaving`:
   * the body may tilt them up, they must not prop it up. A segment whose neighbour takes over the
   * contact (shin → kneecap on the thigh in Plank on the knees) is not leaving: it stays a pivot.
   */
  _floorTargets(prev, s) {
    this.rig.applyQuats(prev.quats, prev.offset);
    this.rig.ground();
    const l0 = this._lowestPoints();
    this.rig.applyQuats(s.quats, s.offset);
    this.rig.ground();
    const l1 = this._lowestPoints();
    const targets = [];
    targets.leaving = new Set();
    for (const seg in l0) {
      const anchor = s.anchor.includes(seg);
      if (!anchor && l0[seg].y < ON_FLOOR && l1[seg].y >= ON_FLOOR && !this._neighbours(seg).some((n) => l1[n]?.y < ON_FLOOR)) targets.leaving.add(seg);
      const resting = l0[seg].y < ON_FLOOR && l1[seg].y < ON_FLOOR && Math.hypot(l0[seg].pos.x - l1[seg].pos.x, l0[seg].pos.z - l1[seg].pos.z) < STAYS;
      if (anchor || resting) targets.push({ seg, h0: l0[seg].y, h1: l1[seg].y, w: anchor ? 1 : CONTACT_WEIGHT });
    }
    return targets;
  }

  /** Parent and child segments of `seg` in the rig. */
  _neighbours(seg) {
    const j = this.rig.joints[seg];
    return [j.parent, ...j.children].map((g) => g?.name).filter((n) => n in this.rig.joints);
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
      for (const seg in low) if (low[seg].y < minY + 0.005 && !keep.leaving?.has(seg)) pivots.add(seg);
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
    if (s.chain) {
      // the eased chain parameter, not the clock, decides which move of the chain is playing
      const { chain } = s;
      const w = ease(THREE.MathUtils.clamp((t - chain.start) / chain.dur, 0, 1));
      let n = 0;
      while (n < chain.keys.length - 2 && w > chain.u[n + 1]) n++;
      const local = THREE.MathUtils.clamp((w - chain.u[n]) / (chain.u[n + 1] - chain.u[n]), 0, 1);
      return { quats: this._chainQuats(chain, n, local), s: chain.keys[n + 1], prev: chain.keys[n], k: local };
    }
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
      if (s.width && k > 0 && k < 1) this._keepWidth(quats, s.width, k);
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
