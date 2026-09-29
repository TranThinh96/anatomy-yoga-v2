import * as THREE from 'three';
import { baseOf, sideOf } from './rig.js';
import { fibreStrength, MUSCLE_STRENGTH } from '../data/muscle-strength.js';

/**
 * Muscle moment arms and static optimisation.
 *
 * Moment arms. A fibre is a polyline through its stations P₀…Pₙ (origin, via points,
 * insertion), each riding on a rig segment. For a joint J, let wᵢ ∈ [0, 1] be how much of
 * station i moves with the distal side of J (1 = on a segment distal to J). Rotating the
 * distal side by a small angle δ about a unit axis e moves Pᵢ by wᵢ·δ·e × rᵢ (rᵢ = Pᵢ − J),
 * so the length changes by
 *     dL/dδ = e · Σᵢ [ wᵢ rᵢ × uᵢ − wᵢ₋₁ rᵢ₋₁ × uᵢ ],   uᵢ = (Pᵢ − Pᵢ₋₁)/|Pᵢ − Pᵢ₋₁|.
 * The moment-arm vector is r = −∇L = Σᵢ [wᵢ₋₁ rᵢ₋₁ − wᵢ rᵢ] × uᵢ: the moment one newton of
 * tension exerts on the distal side about J (the virtual-work definition of An et al. 1984
 * / Sherman et al. 2013, exact for this path).
 *
 * Static optimisation (Crowninshield & Brand 1981; Anderson & Pandy 2001). With the net
 * joint moments τ from the static analysis, find fibre activations a ∈ [0, 1] with
 *     Σ_f a_f · Fmax_f · (r_f · e_k) + τ0 · ρ_k = τ · e_k   for every joint axis e_k,
 * minimising Σ a_f² + Σ ρ_k². ρ are "reserve" actuators with strength τ0 per joint axis: they
 * stand for the muscles the model does not contain (deep neck and spinal muscles, rotator
 * cuff, brachialis, finger muscles, deep hip rotators, peroneals …) and for passive tissue,
 * cost the same as a muscle of that strength, and are reported so it is visible when the
 * modelled muscles are not enough.
 * Solved exactly through its dual: a = clip(Aᵀλ, 0, 1), ρ = Aᵀλ, Newton on λ with a line
 * search on the (concave, piecewise quadratic) dual function.
 */

// Strength (N·m) of the reserve actuator of each joint axis: roughly the moment the muscles
// missing from the model could supply. Small where the model already has the main muscles.
const RESERVE = {
  lumbar: { flex: 30, side: 30, rot: 30 },
  thorax: { flex: 20, side: 20, rot: 20 },
  neck: { flex: 15, side: 15, rot: 10 },
  head: { flex: 15, side: 10, rot: 10 },
  // the scapula also rests on the rib cage (scapulothoracic contact), which the rig – a
  // clavicle–scapula segment pivoting at the sternoclavicular joint – does not have
  scapula: { elev: 10, protract: 10, tilt: 60 },
  shoulder: { flex: 10, abd: 10, rot: 25 },
  elbow: { flex: 25 },
  wrist: { flex: 15 },
  hip: { flex: 10, abd: 10, rot: 30 },
  knee: { flex: 5 },
  ankle: { dorsi: 20 },
};
const tau0 = (joint, dof) => RESERVE[baseOf(joint)]?.[dof.key] ?? 10;

// Axes of every joint, in the anatomical sense of semanticToQuat (rig.js).
// axis: c* = the joint's own frame, p* = its parent's; sign turns the component into
// "positive = first label" (flexion, abduction, external rotation, to own left …).
const SPINE = [
  { key: 'flex', axis: 'cx', sign: 1, pos: 'gập', neg: 'duỗi' },
  { key: 'side', axis: 'cz', sign: -1, pos: 'nghiêng trái', neg: 'nghiêng phải' },
  { key: 'rot', axis: 'cy', sign: 1, pos: 'xoay trái', neg: 'xoay phải' },
];
const BALL = [
  { key: 'flex', axis: 'cx', sign: -1, pos: 'gập', neg: 'duỗi' },
  { key: 'abd', axis: 'pz', sign: 's', pos: 'dang', neg: 'khép' },
  { key: 'rot', axis: 'cy', sign: 's', pos: 'xoay ngoài', neg: 'xoay trong' },
];
export const JOINT_AXES = {
  lumbar: { name: 'thắt lưng', dofs: SPINE },
  thorax: { name: 'cột sống ngực', dofs: SPINE },
  neck: { name: 'cổ', dofs: SPINE },
  head: { name: 'đầu (khớp đội–chẩm)', dofs: SPINE },
  scapula: {
    name: 'đai vai',
    dofs: [
      { key: 'elev', axis: 'cz', sign: 's', pos: 'nâng', neg: 'hạ' },
      { key: 'protract', axis: 'cy', sign: '-s', pos: 'đưa ra trước', neg: 'kéo ra sau' },
      { key: 'tilt', axis: 'cx', sign: 1, pos: 'nghiêng trước', neg: 'nghiêng sau' },
    ],
  },
  shoulder: { name: 'vai', dofs: BALL },
  hip: { name: 'háng', dofs: BALL },
  elbow: { name: 'khuỷu', dofs: [{ key: 'flex', axis: 'cx', sign: -1, pos: 'gập', neg: 'duỗi' }] },
  wrist: { name: 'cổ tay', dofs: [{ key: 'flex', axis: 'cx', sign: -1, pos: 'gập', neg: 'duỗi' }] },
  knee: { name: 'gối', dofs: [{ key: 'flex', axis: 'cx', sign: 1, pos: 'gập', neg: 'duỗi' }] },
  ankle: { name: 'cổ chân', dofs: [{ key: 'dorsi', axis: 'cx', sign: -1, pos: 'gập mu', neg: 'gập lòng' }] },
};

function axisOf(joint, axis, out) {
  const src = axis[0] === 'p' ? joint.parent : joint;
  const e = src.matrixWorld.elements;
  const k = { x: 0, y: 4, z: 8 }[axis[1]];
  return out.set(e[k], e[k + 1], e[k + 2]).normalize();
}
function signOf(dof, s) {
  if (dof.sign === 's') return s;
  if (dof.sign === '-s') return -s;
  return dof.sign;
}

/** Solves the dense symmetric positive definite system H x = g (Cholesky). */
function cholSolve(H, g, n) {
  const L = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s = H[i * n + j];
      for (let k = 0; k < j; k++) s -= L[i * n + k] * L[j * n + k];
      if (i === j) L[i * n + i] = Math.sqrt(Math.max(s, 1e-12));
      else L[i * n + j] = s / L[j * n + j];
    }
  }
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let s = g[i];
    for (let k = 0; k < i; k++) s -= L[i * n + k] * y[k];
    y[i] = s / L[i * n + i];
  }
  const x = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i];
    for (let k = i + 1; k < n; k++) s -= L[k * n + i] * x[k];
    x[i] = s / L[i * n + i];
  }
  return x;
}

/**
 * min ½Σx² s.t. A x = b, 0 ≤ x_i ≤ 1 for i < nb (bounded), x free for i ≥ nb.
 * A is m×N (row-major rows of length N). The free columns must span Rᵐ (reserves do).
 */
export function solveBoundedLS(A, b, m, N, nb, lam0) {
  const lam = lam0 && lam0.length === m ? Float64Array.from(lam0) : new Float64Array(m);
  const s = new Float64Array(N);
  const x = new Float64Array(N);
  const primal = () => {
    for (let j = 0; j < N; j++) {
      let v = 0;
      for (let i = 0; i < m; i++) v += A[i * N + j] * lam[i];
      s[j] = v;
      x[j] = j < nb ? Math.min(1, Math.max(0, v)) : v;
    }
  };
  const dual = () => {
    let d = 0;
    for (let i = 0; i < m; i++) d += lam[i] * b[i];
    for (let j = 0; j < N; j++) {
      const v = s[j];
      if (j >= nb) d -= 0.5 * v * v;
      else if (v >= 1) d -= v - 0.5;
      else if (v > 0) d -= 0.5 * v * v;
    }
    return d;
  };
  const grad = new Float64Array(m);
  const H = new Float64Array(m * m);
  let iters = 0;
  const scale = 1 + Math.sqrt(b.reduce((a, v) => a + v * v, 0));
  primal();
  for (; iters < 200; iters++) {
    let gn = 0;
    for (let i = 0; i < m; i++) {
      let v = b[i];
      for (let j = 0; j < N; j++) v -= A[i * N + j] * x[j];
      grad[i] = v;
      gn += v * v;
    }
    if (Math.sqrt(gn) < 1e-7 * scale) break;
    H.fill(0);
    for (let j = 0; j < N; j++) {
      if (j < nb && (s[j] <= 0 || s[j] >= 1)) continue; // at a bound: no curvature
      for (let i = 0; i < m; i++) {
        const ai = A[i * N + j];
        if (!ai) continue;
        for (let k = 0; k <= i; k++) H[i * m + k] += ai * A[k * N + j];
      }
    }
    for (let i = 0; i < m; i++) {
      H[i * m + i] += 1e-10;
      for (let k = 0; k < i; k++) H[k * m + i] = H[i * m + k];
    }
    const dir = cholSolve(H, grad, m);
    const d0 = dual();
    let slope = 0;
    for (let i = 0; i < m; i++) slope += dir[i] * grad[i];
    const base = Float64Array.from(lam);
    let t = 1;
    for (let k = 0; k < 30; k++) {
      for (let i = 0; i < m; i++) lam[i] = base[i] + t * dir[i];
      primal();
      if (dual() >= d0 + 1e-4 * t * slope) break;
      t *= 0.5;
    }
  }
  return { x, lam, iters };
}

export class MuscleForces {
  /** @param rig Rig  @param system MuscleSystem (fibre stations) */
  constructor(rig, system) {
    this.rig = rig;
    this.system = system;
    // subtree membership of every segment for every joint
    const joints = Object.keys(rig.joints).filter((n) => n !== 'pelvis' && JOINT_AXES[baseOf(n)]);
    this.jointNames = joints;
    const inSub = {};
    for (const j of joints) {
      const set = new Set();
      rig.joints[j].traverse((o) => rig.joints[o.name] === o && set.add(o.name));
      inSub[j] = set;
    }
    this.inSub = inSub;
    // fibres (actuators); crossings found from the stations (wrap points never add one)
    this.fibres = [];
    for (const m of system.muscles) {
      const fmax = fibreStrength(m.def);
      const strength = MUSCLE_STRENGTH[m.def.id];
      m.fibers.forEach((fb, f) => {
        const crosses = [];
        for (const j of joints) {
          const w = fb.stations.map((st) => this._weight(st, j));
          if (w.some((v) => Math.abs(v - w[0]) > 1e-9)) crosses.push({ joint: j });
        }
        this.fibres.push({
          muscle: m,
          index: f,
          fb,
          part: strength && strength.names ? strength.names[f] : null,
          fmax: fmax[f],
          crosses,
          get length() {
            return fb.length;
          },
          restLength: 0,
        });
      });
    }
    // constraint rows: one per joint axis
    this.rows = [];
    for (const j of joints) {
      JOINT_AXES[baseOf(j)].dofs.forEach((dof) => this.rows.push({ joint: j, dof, e: new THREE.Vector3() }));
    }
    this.rowIndex = {};
    this.rows.forEach((r, i) => (this.rowIndex[`${r.joint}.${r.dof.key}`] = i));
    this._lam = null;
    this._w = new THREE.Vector3();
    this.updatePoints();
    this.fibres.forEach((f) => (f.restLength = f.length));
  }

  /** How much of a path point moves with the distal side of joint j (0…1). */
  _weight(st, j) {
    const sub = this.inSub[j];
    return (1 - st.t) * (sub.has(st.a.seg) ? 1 : 0) + (st.t ? st.t * (sub.has(st.b.seg) ? 1 : 0) : 0);
  }

  /** Muscle paths (with wrapping) and lengths for the rig's current pose. */
  updatePoints() {
    this.system.computePaths();
  }

  /** Moment-arm vector (m, per newton of tension) of fibre f about joint j – world frame. */
  momentArm(f, cross, out = new THREE.Vector3()) {
    out.set(0, 0, 0);
    const J = this.rig.joints[cross.joint].getWorldPosition(this._w);
    const u = new THREE.Vector3();
    const r = new THREE.Vector3();
    const c = new THREE.Vector3();
    const pts = f.fb.path;
    const w = f.fb.pathSt.map((st) => this._weight(st, cross.joint));
    for (let i = 1; i < pts.length; i++) {
      u.subVectors(pts[i], pts[i - 1]);
      const len = u.length();
      if (len < 1e-9) continue;
      u.multiplyScalar(1 / len);
      if (w[i - 1]) out.add(c.crossVectors(r.subVectors(pts[i - 1], J), u).multiplyScalar(w[i - 1]));
      if (w[i]) out.sub(c.crossVectors(r.subVectors(pts[i], J), u).multiplyScalar(w[i]));
    }
    return out;
  }

  /** Anatomical moment arms (m) of one muscle side: [{joint, dof, value}] */
  muscleMomentArms(id, side) {
    this.updatePoints();
    const out = new Map();
    const v = new THREE.Vector3();
    const e = new THREE.Vector3();
    for (const f of this.fibres) {
      if (f.muscle.id !== id || f.muscle.side !== side) continue;
      for (const cr of f.crosses) {
        this.momentArm(f, cr, v);
        const joint = this.rig.joints[cr.joint];
        const s = sideOf(cr.joint) || 1;
        for (const dof of JOINT_AXES[baseOf(cr.joint)].dofs) {
          const val = v.dot(axisOf(joint, dof.axis, e)) * signOf(dof, s) * (f.fmax);
          const key = `${cr.joint}.${dof.key}`;
          if (!out.has(key)) out.set(key, { joint: cr.joint, dof, sum: 0, w: 0 });
          const o = out.get(key);
          o.sum += val;
          o.w += f.fmax;
        }
      }
    }
    // strength-weighted mean over the fibres
    return [...out.values()].map((o) => ({ joint: o.joint, dof: o.dof, value: o.sum / o.w }));
  }

  /**
   * Muscle forces that balance the joint moments `moments` (joint name → Vector3, world,
   * what the muscles must supply). Returns fibre activations and per-muscle summaries.
   */
  solve(moments) {
    this.updatePoints();
    const rig = this.rig;
    const nb = this.fibres.length;
    const m = this.rows.length;
    const N = nb + m;
    const A = new Float64Array(m * N);
    const b = new Float64Array(m);
    this.rows.forEach((row, i) => {
      axisOf(rig.joints[row.joint], row.dof.axis, row.e);
      const M = moments[row.joint];
      b[i] = M ? M.dot(row.e) : 0;
      A[i * N + nb + i] = tau0(row.joint, row.dof);
    });
    const v = new THREE.Vector3();
    this.fibres.forEach((f, j) => {
      for (const cr of f.crosses) {
        this.momentArm(f, cr, v);
        for (const dof of JOINT_AXES[baseOf(cr.joint)].dofs) {
          const i = this.rowIndex[`${cr.joint}.${dof.key}`];
          A[i * N + j] = f.fmax * v.dot(this.rows[i].e);
        }
      }
    });
    const { x, lam, iters } = solveBoundedLS(A, b, m, N, nb, this._lam);
    this._lam = lam;

    const fibres = this.fibres.map((f, j) => ({ fibre: f, a: x[j], force: x[j] * f.fmax }));
    const reserves = this.rows.map((row, i) => {
      const s = sideOf(row.joint) || 1;
      // value / demand: anatomical sign (+ = flexion, abduction …); raw: along row.e
      const t = tau0(row.joint, row.dof);
      return { joint: row.joint, dof: row.dof, a: Math.abs(x[nb + i]), value: x[nb + i] * t * signOf(row.dof, s), demand: b[i] * signOf(row.dof, s), raw: x[nb + i] * t, e: row.e.clone() };
    });
    // per muscle side: strongest fibre (and its part name), total force
    const muscles = new Map();
    for (const r of fibres) {
      const key = `${r.fibre.muscle.id}|${r.fibre.muscle.side}`;
      if (!muscles.has(key)) muscles.set(key, { id: r.fibre.muscle.id, side: r.fibre.muscle.side, a: 0, part: null, force: 0, fibres: [] });
      const o = muscles.get(key);
      o.force += r.force;
      o.fibres.push(r);
      if (r.a > o.a) {
        o.a = r.a;
        o.part = r.fibre.part;
      }
    }
    return { fibres, muscles, reserves, iters };
  }

  /**
   * Normalised fibre-length velocity (rest lengths per second) between the current pose
   * and `quatsAhead` (joint quaternions `dt` seconds later). The rig is restored.
   */
  velocities(quatsAhead, dt) {
    const rig = this.rig;
    this.updatePoints();
    const L0 = this.fibres.map((f) => f.length);
    const saved = {};
    for (const n in rig.joints) saved[n] = rig.joints[n].quaternion.clone();
    for (const n in rig.joints) if (n !== 'pelvis' && quatsAhead[n]) rig.joints[n].quaternion.copy(quatsAhead[n]);
    rig.root.updateMatrixWorld(true);
    this.updatePoints();
    const v = this.fibres.map((f, i) => (f.length - L0[i]) / dt / f.restLength);
    for (const n in rig.joints) rig.joints[n].quaternion.copy(saved[n]);
    rig.root.updateMatrixWorld(true);
    this.updatePoints();
    return v;
  }
}

export const CONTRACTION = {
  concentric: { label: 'Co đồng tâm', short: 'co ngắn', color: '#ff4d2e' },
  eccentric: { label: 'Co ly tâm', short: 'co dài', color: '#b25cff' },
  isometric: { label: 'Co đẳng trường', short: 'giữ', color: '#ffb020' },
};
const MOVING = 0.03; // rest lengths per second
const ACTIVE = 0.02;

/** Contraction type of a muscle summary given fibre velocities (indexed like fibres). */
export function contractionOf(muscle, vel, fibreIndex) {
  if (muscle.a < ACTIVE) return null;
  // activation-weighted fibre velocity
  let sv = 0;
  let sa = 0;
  for (const r of muscle.fibres) {
    const v = vel ? vel[fibreIndex.get(r.fibre)] : 0;
    sv += r.a * v;
    sa += r.a;
  }
  const v = sa ? sv / sa : 0;
  if (v < -MOVING) return 'concentric';
  if (v > MOVING) return 'eccentric';
  return 'isometric';
}
