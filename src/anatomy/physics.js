import * as THREE from 'three';
import { SEGMENTS, GRAVITY } from '../data/anthropometry.js';
import { baseOf, sideOf } from './rig.js';

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
const STRENGTH = { lumbar: 200, thorax: 200, neck: 40, shoulder: 80, elbow: 70, wrist: 25, hip: 200, knee: 200, ankle: 150 };
const FRICTION = 0.8; // static friction coefficient of a yoga mat

const GROUP_OF_SEG = {
  ankle: 'Bàn chân', wrist: 'Bàn tay', knee: 'Gối / ống chân', hip: 'Đùi', elbow: 'Cẳng tay',
  shoulder: 'Cánh tay', scapula: 'Bả vai', pelvis: 'Mông / xương chậu', lumbar: 'Lưng dưới',
  thorax: 'Lưng / ngực', neck: 'Cổ', head: 'Đầu',
};
const SIDE_VI = { 1: ' trái', '-1': ' phải', 0: '' };

const TOUCH = 0.02; // a contact closer than 2 cm to the floor counts as support
// relative willingness of each body part to carry weight (see solveSupport)
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

/**
 * Horizontal (friction) ground forces. The vertical forces come from solveSupport;
 * any horizontal forces that sum to zero (ΣFx = ΣFz = 0, no net twist about the
 * vertical) keep the body in equilibrium, so we choose the ones that minimise the sum
 * of squared joint moments, each divided by a strength scale – the pushing strategy
 * that costs the muscles least (e.g. the feet pressing outward in a wide stance).
 * Equality-constrained least squares solved through its KKT system; forces outside
 * the friction cone (|Fh| ≤ μ·Fy) are penalised and re-solved.
 *   points: [{p, f}], jointRows: [{J, sub: Set(pointIndex), M0: Vector3, c}]
 * M0 = joint moment from gravity and the vertical forces alone.
 */
export function solveFriction(points, W, jointRows) {
  const idx = [];
  points.forEach((pt, i) => pt.f > 1e-3 * W && idx.push(i));
  const m = idx.length * 2;
  if (idx.length < 2) return points.map(() => [0, 0]);
  const pen = idx.map(() => 1);
  let h = null;
  for (let iter = 0; iter < 6; iter++) {
    const Hm = Array.from({ length: m }, () => new Array(m).fill(0));
    const g = new Array(m).fill(0);
    for (const row of jointRows) {
      for (let k = 0; k < 3; k++) {
        // (r × (Fx, 0, Fz))_k as a row over (Fx, Fz)
        const a = new Array(m).fill(0);
        let any = false;
        idx.forEach((pi, col) => {
          if (!row.sub.has(pi)) return;
          const r = points[pi].p.clone().sub(row.J);
          const sk = k === 0 ? [0, r.y] : k === 1 ? [r.z, -r.x] : [-r.y, 0];
          a[col * 2] = sk[0] / row.c;
          a[col * 2 + 1] = sk[1] / row.c;
          any = true;
        });
        if (!any) continue;
        const bk = -row.M0.getComponent(k) / row.c;
        for (let i = 0; i < m; i++) {
          if (!a[i]) continue;
          g[i] -= a[i] * bk;
          for (let j = 0; j < m; j++) if (a[j]) Hm[i][j] += a[i] * a[j];
        }
      }
    }
    // small penalty on horizontal force, larger where the vertical force is small
    idx.forEach((pi, col) => {
      const cap = FRICTION * points[pi].f + 1e-3 * W;
      const w = (1e-6 * pen[col]) / (cap * cap);
      Hm[col * 2][col * 2] += w;
      Hm[col * 2 + 1][col * 2 + 1] += w;
    });
    // constraints: ΣFx = 0, ΣFz = 0, Σ (z·Fx − x·Fz) = 0
    const C = [new Array(m).fill(0), new Array(m).fill(0), new Array(m).fill(0)];
    idx.forEach((pi, col) => {
      const p = points[pi].p;
      C[0][col * 2] = 1;
      C[1][col * 2 + 1] = 1;
      C[2][col * 2] = p.z;
      C[2][col * 2 + 1] = -p.x;
    });
    const N = m + 3;
    const K = Array.from({ length: N }, () => new Array(N).fill(0));
    const rhs = new Array(N).fill(0);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) K[i][j] = Hm[i][j];
      for (let k = 0; k < 3; k++) K[i][m + k] = C[k][i];
      rhs[i] = -g[i]; // normal equations: AᵀA·h = −Aᵀ·m0
    }
    for (let k = 0; k < 3; k++) {
      for (let j = 0; j < m; j++) K[m + k][j] = C[k][j];
      K[m + k][m + k] = -1e-12;
    }
    const x = solveDense(K, rhs);
    if (!x) break;
    h = x;
    let ok = true;
    idx.forEach((pi, col) => {
      if (Math.hypot(x[col * 2], x[col * 2 + 1]) > FRICTION * points[pi].f * 1.02) {
        pen[col] *= 25;
        ok = false;
      }
    });
    if (ok) break;
  }
  const out = points.map(() => [0, 0]);
  if (!h) return out;
  // final safety: scale all horizontal forces together (keeps them in equilibrium)
  // so that every contact is inside its friction cone
  let k = 1;
  idx.forEach((pi, col) => {
    const mag = Math.hypot(h[col * 2], h[col * 2 + 1]);
    const lim = FRICTION * points[pi].f;
    if (mag > lim) k = Math.min(k, lim / mag);
  });
  idx.forEach((pi, col) => (out[pi] = [h[col * 2] * k, h[col * 2 + 1] * k]));
  return out;
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
    for (const c of this.rig.contacts) {
      const p = this.rig.worldPoint(c.seg, c.local, new THREE.Vector3());
      if (p.y - c.r < TOUCH) {
        out.push({ seg: c.seg, p, x: p.x, z: p.z });
        count[c.seg] = (count[c.seg] || 0) + 1;
      }
    }
    // a segment's weight is shared by its touching points so point count does not bias it
    for (const c of out) c.w = (SUPPORT_WEIGHT[baseOf(c.seg)] ?? 1) / count[c.seg];
    return out;
  }

  /** Full static analysis of the current rig pose. */
  compute() {
    const rig = this.rig;
    const W = this.mass * GRAVITY;
    const com = this.centerOfMass();
    const segPos = this.segments.map((s) => rig.worldPoint(s.seg, s.local, new THREE.Vector3()));
    const contacts = this.touchingContacts();
    const hull = convexHull(contacts);
    const margin = signedMargin({ x: com.x, z: com.z }, hull);

    // gravity moment on each joint's distal subtree (independent of the floor forces)
    const rows = [];
    for (const name in rig.joints) {
      const info = LOAD_JOINTS[baseOf(name)];
      if (!info) continue;
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
      rows.push({ name, J, sub: subPts, grav, c: STRENGTH[baseOf(name)] || 100 });
    }
    // floor forces: vertical from equilibrium, then friction that minimises joint effort
    const fy = solveSupport(contacts, com, W);
    contacts.forEach((c, i) => (c.f = fy[i]));
    for (const row of rows) {
      row.M0 = row.grav.clone();
      for (const i of row.sub) row.M0.add(new THREE.Vector3().crossVectors(contacts[i].p.clone().sub(row.J), new THREE.Vector3(0, contacts[i].f, 0)));
    }
    const fh = this.friction && margin > 0 ? solveFriction(contacts, W, rows) : contacts.map(() => [0, 0]);
    contacts.forEach((c, i) => (c.F = new THREE.Vector3(fh[i][0], c.f, fh[i][1])));

    // group support forces (per hand, per foot…)
    const groups = new Map();
    for (const c of contacts) {
      const s = sideOf(c.seg);
      const label = (GROUP_OF_SEG[baseOf(c.seg)] || c.seg) + SIDE_VI[s];
      if (!groups.has(label)) groups.set(label, { label, f: 0, F: new THREE.Vector3(), p: new THREE.Vector3(), n: 0 });
      const g = groups.get(label);
      g.f += c.f;
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
    for (const name in rig.joints) {
      const info = LOAD_JOINTS[baseOf(name)];
      if (!info) continue;
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
      // the muscles must supply the opposite moment
      const Mm = M.clone().negate();
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
    return { W, com, contacts, hull, margin, stable: margin > 0, support, joints };
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
