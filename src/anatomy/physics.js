import * as THREE from 'three';
import { SEGMENTS, GRAVITY } from '../data/anthropometry.js';
import { baseOf, sideOf } from './rig.js';
import { strapStrands } from './props.js';

// Joints for which the static load (net joint moment) is reported, and what a
// positive / negative component means anatomically. `flexSign` converts the
// component about the joint's own x axis into "flexion positive" (see
// semanticToQuat in rig.js), `abdSign` does the same for ab/adduction (hip, shoulder).
export const LOAD_JOINTS = {
  lumbar: {
    name: 'Cột sống thắt lưng', flexSign: 1,
    flex: ['Cơ bụng (gập thân)', ['rectus_abdominis', 'external_oblique']],
    ext: ['Cơ dựng sống (duỗi lưng)', ['erector_spinae', 'quadratus_lumborum']],
  },
  thorax: {
    name: 'Cột sống ngực', flexSign: 1,
    flex: ['Cơ bụng (gập thân)', ['rectus_abdominis', 'external_oblique']],
    ext: ['Cơ dựng sống (duỗi lưng)', ['erector_spinae', 'rhomboids']],
  },
  neck: {
    name: 'Cột sống cổ', flexSign: 1,
    flex: ['Cơ gập cổ', ['sternocleidomastoid']],
    ext: ['Cơ duỗi cổ', ['trapezius', 'levator_scapulae', 'erector_spinae']],
  },
  shoulder: {
    name: 'Khớp vai', flexSign: -1, abd: true,
    flex: ['Cơ gập vai (delta trước, ngực lớn)', ['deltoid', 'pectoralis_major', 'biceps_brachii', 'serratus_anterior']],
    ext: ['Cơ duỗi vai (lưng rộng, delta sau)', ['latissimus_dorsi', 'triceps_brachii', 'deltoid']],
    abdPos: ['Cơ dang vai (delta, trên gai)', ['deltoid', 'supraspinatus', 'trapezius']],
    abdNeg: ['Cơ khép vai (ngực lớn, lưng rộng)', ['pectoralis_major', 'latissimus_dorsi']],
  },
  elbow: {
    name: 'Khớp khuỷu', flexSign: -1,
    flex: ['Cơ gập khuỷu (nhị đầu)', ['biceps_brachii']],
    ext: ['Cơ duỗi khuỷu (tam đầu)', ['triceps_brachii']],
  },
  wrist: {
    name: 'Cổ tay', flexSign: -1,
    flex: ['Cơ gập cổ tay – ngón', ['forearm_flexors']],
    ext: ['Cơ duỗi cổ tay – ngón', ['forearm_extensors']],
  },
  hip: {
    name: 'Khớp háng', flexSign: -1, abd: true,
    flex: ['Cơ gập háng (thắt lưng–chậu, thẳng đùi)', ['iliopsoas', 'rectus_femoris', 'tfl_itb', 'sartorius']],
    ext: ['Cơ duỗi háng (mông lớn, gân kheo)', ['gluteus_maximus', 'hamstrings', 'adductors']],
    abdPos: ['Cơ dang háng (mông nhỡ)', ['gluteus_medius', 'tfl_itb', 'piriformis']],
    abdNeg: ['Cơ khép háng', ['adductors']],
  },
  knee: {
    name: 'Khớp gối', flexSign: 1,
    flex: ['Cơ gập gối (gân kheo, bụng chân)', ['hamstrings', 'gastrocnemius']],
    ext: ['Cơ duỗi gối (tứ đầu)', ['rectus_femoris', 'vastus_lateralis', 'vastus_medialis']],
  },
  ankle: {
    name: 'Cổ chân', flexSign: -1,
    flex: ['Cơ gập mu (chày trước)', ['tibialis_anterior']],
    ext: ['Cơ gập lòng (bụng chân, dép)', ['gastrocnemius', 'soleus']],
  },
};

// Rough joint strength scale (N·m) used to normalise joint moments when choosing
// how the body pushes on the floor; only the ratios matter.
const STRENGTH = { lumbar: 200, thorax: 200, neck: 40, head: 30, scapula: 60, shoulder: 80, elbow: 70, wrist: 25, hip: 200, knee: 200, ankle: 150 };
const FRICTION = 0.8; // static friction coefficient of a yoga mat

const GROUP_OF_SEG = {
  ankle: 'Bàn chân', wrist: 'Bàn tay', knee: 'Gối / ống chân', hip: 'Đùi', elbow: 'Cẳng tay',
  shoulder: 'Cánh tay', scapula: 'Bả vai', pelvis: 'Mông / xương chậu', lumbar: 'Lưng dưới',
  thorax: 'Lưng / ngực', neck: 'Cổ', head: 'Đầu',
};
const SIDE_VI = { 1: ' trái', '-1': ' phải', 0: '' };

const TOUCH = 0.02; // a contact closer than 2 cm to the floor (or a prop) counts as support
// Body-to-body contacts (POSE_PROPS { type: 'touch', a, b }): each segment is a capsule around the
// line between its de Leva endpoints; these are rough soft-tissue radii (m) of the model, measured on
// its surface, not from a source. Two segments push on each other only while their capsules are
// within TOUCH_GAP of touching.
const CAPSULE_R = { hip: 0.07, knee: 0.05, ankle: 0.035, shoulder: 0.045, elbow: 0.035, wrist: 0.025, pelvis: 0.11, lumbar: 0.1, thorax: 0.11, head: 0.08 };
const TOUCH_GAP = 0.03;
const UP = new THREE.Vector3(0, 1, 0);
// relative willingness of each body part to carry weight (see solveSupport / solveContacts)
const SUPPORT_WEIGHT = {
  pelvis: 4, thorax: 3, lumbar: 3, scapula: 3, hip: 2, ankle: 2, knee: 2,
  elbow: 1.5, wrist: 1, shoulder: 1, head: 0.4, neck: 0.4,
};

/** 2-D convex hull (Andrew's monotone chain) of [{x, z}] points. */
export function convexHull(pts) {
  const p = pts.map((q) => ({ x: q.x, z: q.z })).sort((a, b) => a.x - b.x || a.z - b.z);
  if (p.length < 3) return p;
  const cross = (o, a, b) => (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
  const lower = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 1e-12) lower.pop();
    lower.push(q);
  }
  const upper = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 1e-12) upper.pop();
    upper.push(q);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

/** Closest points between segments p1–q1 and p2–q2 (Ericson, Real-Time Collision Detection 5.1.9). */
export function closestPoints(p1, q1, p2, q2) {
  const d1 = q1.clone().sub(p1);
  const d2 = q2.clone().sub(p2);
  const r = p1.clone().sub(p2);
  const a = d1.dot(d1);
  const e = d2.dot(d2);
  const f = d2.dot(r);
  let s = 0;
  let t = 0;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  if (a < 1e-12 && e < 1e-12) return [p1.clone(), p2.clone()];
  if (a < 1e-12) t = clamp(f / e);
  else {
    const c = d1.dot(r);
    if (e < 1e-12) s = clamp(-c / a);
    else {
      const b = d1.dot(d2);
      const den = a * e - b * b;
      s = den > 1e-12 ? clamp((b * f - c * e) / den) : 0;
      t = (b * s + f) / e;
      if (t < 0) {
        t = 0;
        s = clamp(-c / a);
      } else if (t > 1) {
        t = 1;
        s = clamp((b - c) / a);
      }
    }
  }
  return [p1.clone().addScaledVector(d1, s), p2.clone().addScaledVector(d2, t)];
}

function distToSegment(q, a, b) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const l2 = dx * dx + dz * dz || 1e-12;
  const t = Math.max(0, Math.min(1, ((q.x - a.x) * dx + (q.z - a.z) * dz) / l2));
  return Math.hypot(q.x - a.x - t * dx, q.z - a.z - t * dz);
}

/** Signed distance from q to the polygon boundary: > 0 inside, < 0 outside. */
export function signedMargin(q, hull) {
  if (!hull.length) return -Infinity;
  if (hull.length === 1) return -Math.hypot(q.x - hull[0].x, q.z - hull[0].z);
  let d = Infinity;
  let inside = hull.length >= 3;
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    d = Math.min(d, distToSegment(q, a, b));
    if (hull.length >= 3 && (b.x - a.x) * (q.z - a.z) - (b.z - a.z) * (q.x - a.x) < 0) inside = false;
  }
  return inside ? d : -d;
}

function inv3(m) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-14) return null;
  const k = 1 / det;
  return [A * k, -(b * i - c * h) * k, (b * f - c * e) * k, B * k, (a * i - c * g) * k, -(a * f - c * d) * k, C * k, -(a * h - b * g) * k, (a * e - b * d) * k];
}

/**
 * Vertical ground reaction forces at the contact points that keep the body in static
 * equilibrium: Σf = W and Σf·(x, z) = W·(x_com, z_com). The system is usually
 * under-determined, so we take the weighted minimum-norm solution
 * (minimise Σ f²/w  →  f = WAᵀ(AWAᵀ)⁻¹b) and drop contacts that would have to pull
 * on the floor (f < 0) until all are pushing. The weights w express how readily a
 * body part takes weight (trunk/seat > feet, knees > hands > head).
 */
export function solveSupport(points, com, W) {
  const w = points.map((p) => p.w ?? 1);
  let active = points.map((_, i) => i);
  const f = new Array(points.length).fill(0);
  for (let iter = 0; iter < points.length + 1 && active.length; iter++) {
    const M = new Array(9).fill(0);
    for (const i of active) {
      const { x, z } = points[i];
      const r = [1, x, z];
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) M[a * 3 + b] += w[i] * r[a] * r[b];
    }
    for (let a = 0; a < 3; a++) M[a * 4] += 1e-6; // regularise collinear supports
    const Mi = inv3(M);
    if (!Mi) break;
    const bv = [W, W * com.x, W * com.z];
    const lam = [0, 1, 2].map((r) => Mi[r * 3] * bv[0] + Mi[r * 3 + 1] * bv[1] + Mi[r * 3 + 2] * bv[2]);
    let worst = -1;
    let worstVal = -1e-9;
    f.fill(0);
    for (const i of active) {
      const { x, z } = points[i];
      f[i] = w[i] * (lam[0] + lam[1] * x + lam[2] * z);
      if (f[i] < worstVal) {
        worstVal = f[i];
        worst = i;
      }
    }
    if (worst < 0) return f;
    active = active.filter((i) => i !== worst);
  }
  // Fallback: nothing can hold the COM (it is outside the support) – put the
  // weight on the contact nearest to the COM projection.
  f.fill(0);
  let best = 0;
  let bd = Infinity;
  points.forEach((p, i) => {
    const d = Math.hypot(p.x - com.x, p.z - com.z);
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  if (points.length) f[best] = W;
  return f;
}

/** Dense Gaussian elimination with partial pivoting; returns null if singular. */
function solveDense(M, rhs) {
  const n = rhs.length;
  const A = M.map((row, i) => [...row, rhs[i]]);
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k;
    if (Math.abs(A[p][i]) < 1e-14) return null;
    [A[i], A[p]] = [A[p], A[i]];
    const piv = A[i][i];
    for (let k = i + 1; k < n; k++) {
      const f = A[k][i] / piv;
      if (f === 0) continue;
      for (let j = i; j <= n; j++) A[k][j] -= f * A[i][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let v = A[i][n];
    for (let j = i + 1; j < n; j++) v -= A[i][j] * x[j];
    x[i] = v / A[i][i];
  }
  return x;
}

// Contact frames as [tangent 1, normal, tangent 2] (world vectors). The floor's frame is the world
// frame, so floor contacts give exactly the floor-only solution.
const FLOOR_BASIS = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
function contactBasis(n) {
  if (!n || n.y > 0.9999) return FLOOR_BASIS;
  const N = n.clone().normalize();
  // first tangent horizontal (along a wall, or along a bolster's axis), second one completes the frame
  const t1 = new THREE.Vector3(0, 1, 0).cross(N);
  if (t1.lengthSq() < 1e-9) t1.set(1, 0, 0);
  t1.normalize();
  const t2 = t1.clone().cross(N).normalize();
  return [t1.toArray(), N.toArray(), t2.toArray()];
}

/**
 * Floor reaction forces. Static equilibrium (ΣF = 0, ΣM = 0 about the centre of mass) leaves
 * the forces undetermined as soon as the body touches the floor in more than one place, so
 * we choose the ones that minimise the sum of squared joint moments, each divided by a
 * strength scale: the body "relaxes" onto its supports, and a lying body needs (almost) no
 * muscle work. A small term Σ|F|²/w (w = SUPPORT_WEIGHT) splits the load between points on
 * the same segment. Forces may only push (Fy ≥ 0, active set) and, with `friction`, have
 * horizontal parts within the friction cone |Fh| ≤ μ·Fy (penalised, then scaled together).
 * Equality-constrained least squares, solved through its KKT system.
 *   points: [{p, w}], rows: [{J, sub: Set(pointIndex), segs: Set(segment), grav: Vector3, c}]
 * `ties` are straps: a tension T ≥ 0 between two body points, a (on segment segA) pulled toward b
 * (on segB) and b toward a – or, with a unit normal `u`, body-to-body contacts: a push T ≥ 0 on a
 * along u and on b along −u (no friction). Internal to the body, they do not enter the equilibrium
 * of the whole body, only the joint moments, and they are chosen with the floor forces (least joint
 * effort).
 * Returns [[Fx, Fy, Fz]] per point (with .tension = [T] per tie), or null if no pushing forces can
 * balance the body.
 */
export function solveContacts(points, com, W, rows, friction = true, ties = []) {
  let active = points.map((_, i) => i);
  // unit direction of each tie (a → b) and whether it may still pull (T < 0 drops it)
  // a strap pulls a toward b; a body contact pushes a along its normal u (away from b)
  const tieU = ties.map((s) => (s.u ? s.u.clone() : s.b.clone().sub(s.a).normalize()));
  let tieOn = ties.map(() => true);
  const dof = friction ? 3 : 1;
  // force components in each contact's own frame: 0, 2 = along the surface, 1 = along its normal
  const comp = friction ? [0, 1, 2] : [1];
  const basis = points.map((pt) => contactBasis(pt.n));
  // world component k of the unit force along local axis comp[j] at point pi, and cf · that axis
  const axis = (pi, j) => basis[pi][comp[j]];
  const dotAxis = (cf, pi, j) => cf[0] * axis(pi, j)[0] + cf[1] * axis(pi, j)[1] + cf[2] * axis(pi, j)[2];
  // a wall (or a bolster's side) pushes sideways: all three force and moment equations are needed
  const tilted = basis.some((b) => b !== FLOOR_BASIS);
  // a wall pushes only along its normal: no friction is assumed against it (no source for skin or
  // clothing on a wall), so its tangential forces are penalised away from the start
  const pen = points.map((pt) => (pt.wall ? 1e9 : 1));
  const LAMBDA = 0.1 / (W * W);
  for (let iter = 0; iter < 3 * points.length + 12 + ties.length && active.length; iter++) {
    const nc = active.length * dof;
    const tieIdx = [];
    tieOn.forEach((on, i) => on && tieIdx.push(i));
    const n = nc + tieIdx.length;
    const H = Array.from({ length: n }, () => new Array(n).fill(0));
    const g = new Array(n).fill(0);
    // joint effort: Σ |grav + Σ r × F|² / c²
    for (const row of rows) {
      for (let k = 0; k < 3; k++) {
        const a = new Array(n).fill(0);
        let any = false;
        active.forEach((pi, col) => {
          if (!row.sub.has(pi)) return;
          const r = points[pi].p.clone().sub(row.J);
          // (r × F)_k as coefficients of (Fx, Fy, Fz)
          const cf = k === 0 ? [0, -r.z, r.y] : k === 1 ? [r.z, 0, -r.x] : [-r.y, r.x, 0];
          comp.forEach((_, j) => (a[col * dof + j] = dotAxis(cf, pi, j) / row.c));
          any = true;
        });
        // a strap pulls its hand end along +u and its foot end along −u
        tieIdx.forEach((ti, q) => {
          const s = ties[ti];
          const u = tieU[ti];
          let v = 0;
          for (const [p, sign, seg] of [[s.a, 1, s.segA], [s.b, -1, s.segB]]) {
            if (!row.segs?.has(seg)) continue;
            const r = p.clone().sub(row.J);
            const m = k === 0 ? r.y * u.z - r.z * u.y : k === 1 ? r.z * u.x - r.x * u.z : r.x * u.y - r.y * u.x;
            v += sign * m;
          }
          if (v) {
            a[nc + q] = v / row.c;
            any = true;
          }
        });
        if (!any) continue;
        const b0 = row.grav.getComponent(k) / row.c;
        for (let i = 0; i < n; i++) {
          if (!a[i]) continue;
          g[i] += a[i] * b0;
          for (let j = 0; j < n; j++) if (a[j]) H[i][j] += a[i] * a[j];
        }
      }
    }
    active.forEach((pi, col) => {
      const w = points[pi].w ?? 1;
      comp.forEach((c, j) => {
        const cap = c === 1 ? 1 : pen[pi];
        H[col * dof + j][col * dof + j] += (LAMBDA * cap) / w;
      });
    });
    tieIdx.forEach((_, q) => (H[nc + q][nc + q] += LAMBDA));
    // equilibrium: ΣF = (0, W, 0), Σ (p − com) × F = 0
    const C = [];
    const d = [];
    const eqF = friction || tilted ? [0, 1, 2] : [1];
    for (const k of eqF) {
      const rowC = new Array(n).fill(0);
      active.forEach((pi, col) => comp.forEach((_, j) => (rowC[col * dof + j] = axis(pi, j)[k])));
      C.push(rowC);
      d.push(k === 1 ? W : 0);
    }
    const eqM = friction || tilted ? [0, 1, 2] : [0, 2];
    for (const k of eqM) {
      const rowC = new Array(n).fill(0);
      active.forEach((pi, col) => {
        const r = points[pi].p.clone().sub(com);
        const cf = k === 0 ? [0, -r.z, r.y] : k === 1 ? [r.z, 0, -r.x] : [-r.y, r.x, 0];
        comp.forEach((_, j) => (rowC[col * dof + j] = dotAxis(cf, pi, j)));
      });
      C.push(rowC);
      d.push(0);
    }
    const m = C.length;
    const K = Array.from({ length: n + m }, () => new Array(n + m).fill(0));
    const rhs = new Array(n + m).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) K[i][j] = H[i][j];
      for (let k = 0; k < m; k++) K[i][n + k] = C[k][i];
      rhs[i] = -g[i];
    }
    for (let k = 0; k < m; k++) {
      for (let j = 0; j < n; j++) K[n + k][j] = C[k][j];
      K[n + k][n + k] = -1e-9;
      rhs[n + k] = d[k];
    }
    const x = solveDense(K, rhs);
    if (!x) return null;
    // equality residual: if the COM cannot be held by these points, give up
    for (let k = 0; k < m; k++) {
      let v = -d[k];
      for (let j = 0; j < n; j++) v += C[k][j] * x[j];
      if (Math.abs(v) > 1e-3 * W) return null;
    }
    const fy = (col) => x[col * dof + (friction ? 1 : 0)];
    // pushing only: drop the contact pulling hardest and re-solve
    let worst = -1;
    let worstVal = -1e-6 * W;
    active.forEach((pi, col) => {
      if (fy(col) < worstVal) {
        worstVal = fy(col);
        worst = pi;
      }
    });
    if (worst >= 0) {
      active = active.filter((i) => i !== worst);
      continue;
    }
    // a strap only pulls: drop one that would have to push and re-solve
    const pushing = tieIdx.findIndex((_, q) => x[nc + q] < -1e-6 * W);
    if (pushing >= 0) {
      tieOn = tieOn.map((on, i) => on && i !== tieIdx[pushing]);
      continue;
    }
    // friction cone: penalise sliding contacts and re-solve
    let slide = false;
    if (friction) {
      active.forEach((pi, col) => {
        const h = Math.hypot(x[col * 3], x[col * 3 + 2]);
        if (h > FRICTION * Math.max(fy(col), 0) * 1.02 + 1e-6 * W) {
          pen[pi] *= 30;
          slide = true;
        }
      });
    }
    if (slide && iter < 3 * points.length + 10) continue;
    // forces in each contact's frame (along the surface, normal, along the surface)
    const loc = points.map(() => [0, 0, 0]);
    active.forEach((pi, col) => (loc[pi] = friction ? [x[col * 3], x[col * 3 + 1], x[col * 3 + 2]] : [0, x[col], 0]));
    if (friction) {
      // final safety: scale all tangential forces together into the friction cones
      let k = 1;
      loc.forEach(([fx, fyv, fz]) => {
        const h = Math.hypot(fx, fz);
        if (h > FRICTION * fyv) k = Math.min(k, (FRICTION * fyv) / h);
      });
      for (const f of loc) {
        f[0] *= k;
        f[2] *= k;
      }
    }
    // back to the world frame
    const out = loc.map((f, pi) => {
      const b = basis[pi];
      return [0, 1, 2].map((c) => f[0] * b[0][c] + f[1] * b[1][c] + f[2] * b[2][c]);
    });
    out.tension = ties.map((_, i) => {
      const q = tieIdx.indexOf(i);
      return q >= 0 ? Math.max(x[nc + q], 0) : 0;
    });
    return out;
  }
  return null;
}

export class Physics {
  constructor(rig, { mass = 60, sex = 'm' } = {}) {
    this.rig = rig;
    this.friction = true; // horizontal floor forces chosen to minimise joint effort
    this.mass = mass;
    this.sex = sex;
    // resolve segment centres of mass (both sides)
    this.segments = [];
    for (const s of SEGMENTS) {
      const sides = s.sided ? [['L', 1], ['R', -1]] : [['', 1]];
      for (const [side, mx] of sides) {
        const seg = side ? `${s.seg}_${side}` : s.seg;
        const prox = new THREE.Vector3(s.prox[0] * mx, s.prox[1], s.prox[2]);
        const dist = new THREE.Vector3(s.dist[0] * mx, s.dist[1], s.dist[2]);
        this.segments.push({ key: s.key, name: s.name, side, seg, def: s, prox, dist, local: new THREE.Vector3(), frac: 0 });
      }
    }
    this.setSubject({ mass, sex });
    // capsule axis of each segment (rest-local endpoints) for body-to-body contacts
    this.capsule = {};
    for (const sg of this.segments) {
      const r = CAPSULE_R[baseOf(sg.seg)];
      if (r) this.capsule[sg.seg] = { a: sg.prox.clone().sub(rig.rest[sg.seg]), b: sg.dist.clone().sub(rig.rest[sg.seg]), r };
    }
    // subtree (segment names distal to each joint, the joint included)
    this.subtree = {};
    for (const name in rig.joints) {
      const set = new Set();
      rig.joints[name].traverse((o) => {
        if (rig.joints[o.name] === o) set.add(o.name);
      });
      this.subtree[name] = set;
    }
    this._p = new THREE.Vector3();
  }

  setSubject({ mass = this.mass, sex = this.sex }) {
    this.mass = mass;
    this.sex = sex;
    const total = this.segments.reduce((a, s) => a + s.def.mass[sex], 0);
    for (const s of this.segments) {
      s.frac = s.def.mass[sex] / total;
      const c = s.prox.clone().lerp(s.dist, s.def.com[sex] / 100);
      s.local.copy(c).sub(this.rig.rest[s.seg]);
    }
  }

  centerOfMass(out = new THREE.Vector3()) {
    out.set(0, 0, 0);
    for (const s of this.segments) out.addScaledVector(this.rig.worldPoint(s.seg, s.local, this._p), s.frac);
    return out;
  }

  touchingContacts() {
    const out = [];
    const count = {};
    const env = this.rig.env;
    for (const c of env.empty ? this.rig.contacts : this.rig.wallContacts) {
      const p = this.rig.worldPoint(c.seg, c.local, new THREE.Vector3());
      // the floor or a prop under the point (normal up, or radial on a bolster) ...
      let n = null;
      let wall = false;
      if (env.empty) {
        if (p.y - c.r < TOUCH) n = UP;
      } else {
        const rest = env.onProps(c.seg) ? env.rest(p.x, p.z, c.r, p.y) : { y: c.r, n: UP };
        if (!c.only && p.y - rest.y < TOUCH) n = rest.n;
        // ... or a wall beside it (normal horizontal)
        const w = env.wallGap(p, c.r);
        if (!n && w.gap < TOUCH) {
          n = w.n;
          wall = true;
        }
      }
      if (n) {
        out.push({ seg: c.seg, p, x: p.x, z: p.z, n, wall });
        count[c.seg] = (count[c.seg] || 0) + 1;
      }
    }
    // a segment's weight is shared by its touching points so point count does not bias it
    for (const c of out) c.w = (SUPPORT_WEIGHT[baseOf(c.seg)] ?? 1) / count[c.seg];
    return out;
  }

  /**
   * Body-to-body contacts of the current pose (env touches whose capsules are within TOUCH_GAP):
   * [{ a, b, segA, segB, u, touch: true }] – a = b = the contact point, u = the push on segment a.
   */
  touches() {
    const out = [];
    for (const t of this.rig.env.touches || []) {
      const A = this.capsule[t.a];
      const B = this.capsule[t.b];
      if (!A || !B) continue;
      const w = (seg, v) => this.rig.worldPoint(seg, v, new THREE.Vector3());
      const a0 = w(t.a, A.a);
      const a1 = w(t.a, A.b);
      // `at`: where along a (0 = proximal end, 1 = distal) it rests – needed for neighbouring segments
      // (thigh on calf), whose axes meet at the joint
      const [pa, pb] = t.at == null ? closestPoints(a0, a1, w(t.b, B.a), w(t.b, B.b)) : closestPoints(a0.clone().lerp(a1, t.at), a0.clone().lerp(a1, t.at), w(t.b, B.a), w(t.b, B.b));
      const d = pa.distanceTo(pb);
      if (d - A.r - B.r > TOUCH_GAP || d < 1e-6) continue;
      const u = pa.clone().sub(pb).multiplyScalar(1 / d);
      // the contact point: halfway between the two surfaces along the line of centres
      const p = pb.clone().addScaledVector(u, (d - A.r + B.r) / 2);
      out.push({ a: p, b: p.clone(), segA: t.a, segB: t.b, u, touch: true });
    }
    return out;
  }

  /** Full static analysis of the current rig pose. */
  compute() {
    const rig = this.rig;
    const W = this.mass * GRAVITY;
    const com = this.centerOfMass();
    const segPos = this.segments.map((s) => rig.worldPoint(s.seg, s.local, new THREE.Vector3()));
    const contacts = this.touchingContacts();
    // base of support: what the body stands, sits or lies on (a wall beside it only leans)
    const hull = convexHull(contacts.filter((c) => !c.wall));
    const margin = signedMargin({ x: com.x, z: com.z }, hull);

    // gravity moment on each joint's distal subtree (independent of the floor forces)
    const rows = [];
    for (const name in rig.joints) {
      if (name === 'pelvis') continue;
      const sub = this.subtree[name];
      const J = rig.joints[name].getWorldPosition(new THREE.Vector3());
      const grav = new THREE.Vector3();
      const r0 = new THREE.Vector3();
      this.segments.forEach((s, i) => {
        if (!sub.has(s.seg)) return;
        r0.subVectors(segPos[i], J);
        grav.add(new THREE.Vector3().crossVectors(r0, new THREE.Vector3(0, -s.frac * W, 0)));
      });
      const subPts = new Set();
      contacts.forEach((c, i) => sub.has(c.seg) && subPts.add(i));
      rows.push({ name, J, sub: subPts, segs: sub, grav, c: STRENGTH[baseOf(name)] || 100 });
    }
    // straps: one strand (tie) per hand, from the palm to the ball of the foot
    const ties = [];
    for (const s of rig.env.straps || []) for (const st of strapStrands(rig, s)) ties.push({ a: st.a, b: st.b, segA: st.hand, segB: s.foot });
    // body-to-body contacts (a knee on the upper arm, a foot on the thigh): pushes, chosen the same way
    ties.push(...this.touches());
    // floor forces: equilibrium with the least joint effort; if the centre of mass is not
    // over the supports (between two poses) fall back to vertical forces near the COM
    // over the base of support – or held by a wall even when it is not (sitting back against it)
    const leaning = contacts.some((c) => c.wall);
    const F3 = margin > 0 || leaning ? solveContacts(contacts, com, W, rows, this.friction, ties) : null;
    ties.forEach((s, i) => {
      s.T = F3?.tension[i] || 0;
      s.F = (s.u ? s.u.clone() : s.b.clone().sub(s.a).normalize()).multiplyScalar(s.T); // the pull on the hand / push on a
    });
    if (F3) {
      contacts.forEach((c, i) => {
        c.f = F3[i][1];
        c.F = new THREE.Vector3(F3[i][0], F3[i][1], F3[i][2]);
      });
    } else {
      const fy = solveSupport(contacts, com, W);
      contacts.forEach((c, i) => {
        c.f = fy[i];
        c.F = new THREE.Vector3(0, fy[i], 0);
      });
    }

    // group support forces (per hand, per foot…)
    const groups = new Map();
    for (const c of contacts) {
      const s = sideOf(c.seg);
      // a part leaning on a wall is listed apart, with the size of its (horizontal) push
      const wall = c.wall;
      const label = (GROUP_OF_SEG[baseOf(c.seg)] || c.seg) + SIDE_VI[s] + (wall ? ' (tựa tường)' : '');
      if (!groups.has(label)) groups.set(label, { label, f: 0, F: new THREE.Vector3(), p: new THREE.Vector3(), n: 0 });
      const g = groups.get(label);
      g.f += wall ? c.F.length() : c.f;
      g.F.add(c.F);
      g.p.add(c.p);
      g.n++;
    }
    const support = [...groups.values()]
      .map((g) => ({ label: g.label, f: g.f, F: g.F, pct: (g.f / W) * 100, shear: (Math.hypot(g.F.x, g.F.z) / W) * 100, p: g.p.multiplyScalar(1 / g.n) }))
      .filter((g) => g.pct > 0.5)
      .sort((a, b) => b.pct - a.pct);

    // net joint moments (inverse statics on the distal subtree)
    const joints = [];
    const r = new THREE.Vector3();
    const F = new THREE.Vector3();
    const M = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    const xAxis = new THREE.Vector3();
    const zAxis = new THREE.Vector3();
    // moment the muscles (and passive tissue) must supply at every joint, world frame
    const moments = {};
    for (const name in rig.joints) {
      if (name === 'pelvis') continue;
      const info = LOAD_JOINTS[baseOf(name)];
      const sub = this.subtree[name];
      const J = rig.joints[name].getWorldPosition(new THREE.Vector3());
      M.set(0, 0, 0);
      this.segments.forEach((s, i) => {
        if (!sub.has(s.seg)) return;
        r.subVectors(segPos[i], J);
        F.set(0, -s.frac * W, 0);
        M.add(tmp.crossVectors(r, F));
      });
      for (const c of contacts) {
        if (!sub.has(c.seg) || !c.F) continue;
        r.subVectors(c.p, J);
        M.add(tmp.crossVectors(r, c.F));
      }
      for (const s of ties) {
        if (!s.T) continue;
        if (sub.has(s.segA)) M.add(tmp.crossVectors(r.subVectors(s.a, J), s.F));
        if (sub.has(s.segB)) M.add(tmp.crossVectors(r.subVectors(s.b, J), s.F.clone().negate()));
      }
      // the muscles must supply the opposite moment
      const Mm = M.clone().negate();
      moments[name] = Mm;
      if (!info) continue;
      const e = rig.joints[name].matrixWorld.elements;
      xAxis.set(e[0], e[1], e[2]).normalize();
      const flex = Mm.dot(xAxis) * info.flexSign;
      let abd = 0;
      if (info.abd) {
        const pe = rig.joints[name].parent.matrixWorld.elements;
        zAxis.set(pe[8], pe[9], pe[10]).normalize();
        abd = Mm.dot(zAxis) * (sideOf(name) || 1);
      }
      const side = sideOf(name);
      const demands = [];
      if (Math.abs(flex) > 0.05) {
        const [label, muscles] = flex > 0 ? info.flex : info.ext;
        demands.push({ label, muscles, value: Math.abs(flex) });
      }
      if (info.abd && Math.abs(abd) > 0.05) {
        const [label, muscles] = abd > 0 ? info.abdPos : info.abdNeg;
        demands.push({ label, muscles, value: Math.abs(abd) });
      }
      demands.sort((a, b) => b.value - a.value);
      joints.push({
        joint: name,
        name: info.name + SIDE_VI[side],
        side: side === 1 ? 'L' : side === -1 ? 'R' : '',
        total: M.length(),
        flex,
        abd,
        demands,
        pos: J,
      });
    }
    joints.sort((a, b) => b.total - a.total);
    return { W, com, contacts, hull, margin, stable: margin > 0 || (leaning && !!F3), leaning: leaning && !!F3, support, joints, moments, segPos, straps: ties.filter((t) => !t.touch), touches: ties.filter((t) => t.touch) };
  }

  /**
   * Load ("gravitational") stiffness of every joint for the result `r` of compute(): the
   * symmetric 3×3 matrix K (world frame, N·m/rad, row-major) such that turning the part of
   * the body that is free to rotate about the joint by a small angle δ·e changes the external
   * moment on it by δ·K·e; eᵀKe > 0 means the load tips further over (an inverted pendulum,
   * critical stiffness m·g·h – Winter et al. 1998, J Neurophysiol 80:1211).
   * The free part is the distal subtree when it carries no floor force (an arm in the air, the
   * trunk above the lumbar joint); otherwise the rest of the body rotates on the planted limb,
   * approximated as the floor force this limb carries acting at the COM of the rest of the body.
   * For a point force G at r from the joint: δM = (δ e × r) × G, so K = sym(r Gᵀ) − (G·r) I.
   */
  loadStiffness(r) {
    const { W, contacts, segPos } = r;
    const out = {};
    const add = (K, rv, G) => {
      const gr = G.dot(rv);
      const a = [rv.x, rv.y, rv.z];
      const g = [G.x, G.y, G.z];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) K[i * 3 + j] += 0.5 * (a[i] * g[j] + a[j] * g[i]) - (i === j ? gr : 0);
    };
    const rv = new THREE.Vector3();
    for (const name in this.rig.joints) {
      if (name === 'pelvis') continue;
      const sub = this.subtree[name];
      const J = this.rig.joints[name].getWorldPosition(new THREE.Vector3());
      const K = new Array(9).fill(0);
      let fy = 0;
      for (const c of contacts) if (sub.has(c.seg) && c.F) fy += c.F.y;
      if (fy < 1e-3 * W) {
        this.segments.forEach((s, i) => {
          if (sub.has(s.seg)) add(K, rv.subVectors(segPos[i], J), new THREE.Vector3(0, -s.frac * W, 0));
        });
      } else {
        const c = new THREE.Vector3();
        let w = 0;
        this.segments.forEach((s, i) => {
          if (sub.has(s.seg)) return;
          c.addScaledVector(segPos[i], s.frac);
          w += s.frac;
        });
        if (w > 0) add(K, rv.subVectors(c.multiplyScalar(1 / w), J), new THREE.Vector3(0, -fy, 0));
      }
      out[name] = K;
    }
    return out;
  }

  /**
   * "Ankle strategy": if a standing pose has its centre of mass outside (or at the
   * edge of) the feet, tilt the whole body about the feet – keeping the feet flat –
   * until the COM sits over the support (seated balances such as Navasana tilt the
   * whole body on the sit bones). Returns the corrected quaternions.
   */
  balance(quats) {
    const rig = this.rig;
    const q = {};
    for (const k in quats) q[k] = quats[k].clone();
    if (!q.pelvis) q.pelvis = new THREE.Quaternion();
    for (let iter = 0; iter < 6; iter++) {
      rig.applyQuats(q);
      rig.ground();
      const contacts = this.touchingContacts();
      if (!contacts.length) return q;
      // standing on the feet: tilt at the ankles; sitting on the pelvis (Navasana): tilt the whole body
      const onFeet = contacts.every((c) => baseOf(c.seg) === 'ankle');
      const onSeat = contacts.every((c) => c.seg === 'pelvis');
      if (!onFeet && !onSeat) return q;
      const com = this.centerOfMass();
      const hull = convexHull(contacts);
      if (signedMargin({ x: com.x, z: com.z }, hull) >= 0.03) return q;
      const cx = hull.reduce((a, p) => a + p.x, 0) / hull.length;
      const cz = hull.reduce((a, p) => a + p.z, 0) / hull.length;
      const h = Math.max(com.y, 0.3);
      const clampS = (v) => Math.max(-0.5, Math.min(0.5, v));
      let dx = cx - com.x;
      let dz = cz - com.z;
      // Two feet far apart: only tilt about the line through both feet, otherwise one foot would lift.
      const feetSegs = [...new Set(contacts.map((c) => c.seg))];
      if (onFeet && feetSegs.length === 2) {
        const mid = (seg) => {
          const pts = contacts.filter((c) => c.seg === seg);
          return { x: pts.reduce((a, c) => a + c.x, 0) / pts.length, z: pts.reduce((a, c) => a + c.z, 0) / pts.length };
        };
        const A = mid(feetSegs[0]);
        const B = mid(feetSegs[1]);
        const len = Math.hypot(B.x - A.x, B.z - A.z);
        if (len > 0.25) {
          const nx = -(B.z - A.z) / len;
          const nz = (B.x - A.x) / len;
          const d = dx * nx + dz * nz;
          dx = d * nx;
          dz = d * nz;
        }
      }
      const a = Math.asin(clampS(dz / h));
      const b = -Math.asin(clampS(dx / h));
      const R = new THREE.Quaternion().setFromEuler(new THREE.Euler(a, 0, b, 'XYZ'));
      const feet = onFeet ? feetSegs : [];
      const keep = feet.map((seg) => ({
        seg,
        world: rig.joints[seg].getWorldQuaternion(new THREE.Quaternion()),
        parentWorld: rig.joints[seg].parent.getWorldQuaternion(new THREE.Quaternion()),
      }));
      q.pelvis.premultiply(R);
      for (const k of keep) {
        const newParent = k.parentWorld.clone().premultiply(R);
        q[k.seg] = newParent.invert().multiply(k.world);
      }
    }
    return q;
  }
}
