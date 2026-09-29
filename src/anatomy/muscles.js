import * as THREE from 'three';
import { MODEL } from '../data/body-model.gen.js';
import { JOINT_DEFS } from './rig.js';

// Muscle paths measured on the BodyParts3D muscle meshes (tools/bp3d-build.mjs):
// stations = origin, via points (cross-section centroids), insertion; one polyline point per fibre.
const MUSCLE_GEOMETRY = MODEL.muscles;

const SIDED = new Set(['scapula', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle']);
const SAMPLES = 18;
const RADIAL = 9;

export const MUSCLE_COLOR = new THREE.Color('#b24a44');

/**
 * Wrapping surfaces. A straight line between two stations can cut through bone when a
 * joint bends (triceps over the olecranon, quadriceps over the femoral condyles, deltoid
 * over the humeral head). Where a fibre crosses `joint`, its path is kept on the side of
 * the joint where it lies in the rest pose, at least `r` from the joint centre (cylinder
 * along the hinge axis, or sphere), attached to segment `body` – the classic "wrapping
 * object" of OpenSim-style models. Radii from the bone surfaces (condyle 18 mm, humeral
 * head 21.5 mm, femoral head 23 mm) plus tendon / patella thickness.
 */
// side: for spheres, the preferred side of the joint (body frame, left side), blended with
// the side seen in the rest pose (or used as is when `fixed`)
const WRAPS = [
  { joint: 'knee', body: 'hip', type: 'cylinder', axis: [1, 0, 0], r: 0.034, muscles: ['rectus_femoris', 'vastus_lateralis', 'vastus_medialis'] },
  { joint: 'knee', body: 'hip', type: 'cylinder', axis: [1, 0, 0], r: 0.024, muscles: ['hamstrings', 'gastrocnemius'] },
  { joint: 'elbow', body: 'shoulder', type: 'cylinder', axis: [1, 0, 0], r: 0.02, muscles: ['triceps_brachii'] },
  { joint: 'elbow', body: 'shoulder', type: 'cylinder', axis: [1, 0, 0], r: 0.016, muscles: ['biceps_brachii'] },
  // via points riding on a bone right next to the joint would swing through the other bone
  // when the joint moves (a real belly slides); within `drop` of the centre they are skipped
  { joint: 'shoulder', body: 'shoulder', type: 'sphere', r: 0.026, drop: 0.05, side: [1, 0.3, 0], muscles: ['deltoid', 'supraspinatus', 'infraspinatus'] },
  // iliopsoas: over the front of the femoral head (the brim via point is replaced by the wrap)
  { joint: 'hip', body: 'hip', type: 'sphere', r: 0.028, drop: 0.04, side: [0, 0, 1], fixed: true, muscles: ['iliopsoas'] },
];
const ARC_STEP = 0.35; // rad between points on a wrapped arc

/**
 * Shortest path from P to S (2-D, circle of radius R at the origin) that stays on the +x
 * side of the circle. Returns null if the straight line already does, else the tangent
 * angles and travel direction.
 */
function wrap2D(px, py, sx, sy, R, fAng) {
  const lp = Math.hypot(px, py);
  const ls = Math.hypot(sx, sy);
  R = Math.min(R, 0.95 * lp, 0.95 * ls);
  if (R < 1e-4) return null;
  // closest point of the segment to the centre
  const dx = sx - px;
  const dy = sy - py;
  const t = Math.max(0, Math.min(1, -(px * dx + py * dy) / (dx * dx + dy * dy || 1e-12)));
  const cx = px + t * dx;
  const cy = py + t * dy;
  if (cx > 0 && Math.hypot(cx, cy) >= R) return null;
  const ap = Math.atan2(py, px);
  const as = Math.atan2(sy, sx);
  const bp = Math.acos(R / lp);
  const bs = Math.acos(R / ls);
  // travel direction: never through the bone itself (angle fAng, e.g. the femoral shaft
  // for the knee), preferably past the +x side (angle 0), otherwise the shorter arc
  const along = (t1, sg, ang) => {
    let z = (sg * (ang - t1)) % (2 * Math.PI);
    if (z < 0) z += 2 * Math.PI;
    return z;
  };
  let best = null;
  for (const sg of [1, -1]) {
    const t1 = ap + sg * bp;
    const t2 = as - sg * bs;
    let d = (sg * (t2 - t1)) % (2 * Math.PI);
    if (d < 0) d += 2 * Math.PI;
    const score = (fAng !== null && along(t1, sg, fAng) <= d ? -100 : 0) + (along(t1, sg, 0) <= d ? 10 : 0) - d;
    if (!best || score > best.score) best = { t1, sg, d, R, score };
  }
  return best;
}

function segName(seg, side) {
  return SIDED.has(seg) ? `${seg}_${side}` : seg;
}

/**
 * Muscles are tubes whose control points ride on the bones, so every muscle
 * lengthens, shortens and bulges automatically as the skeleton moves.
 */
export class MuscleSystem {
  constructor(rig) {
    this.rig = rig;
    this.group = new THREE.Group();
    this.group.name = 'muscles';
    this.muscles = [];
    this._w = new THREE.Vector3();
    this._w2 = new THREE.Vector3();

    // segments distal to each joint (to find where a fibre crosses it)
    this._sub = {};
    for (const name in rig.joints) {
      const set = new Set();
      rig.joints[name].traverse((o) => rig.joints[o.name] === o && set.add(o.name));
      this._sub[name] = set;
    }
    for (const def of MUSCLE_GEOMETRY) {
      for (const side of ['L', 'R']) this.muscles.push(this._build(def, side));
    }
    rig.root.updateMatrixWorld(true);
    this.update();
    for (const m of this.muscles) m.restLength = m.length;
  }

  /** Wrapping objects of one fibre: [{ at: station index, body, type, c, a, d, r }] */
  _wrapsFor(id, side, stations) {
    const out = [];
    const rest = (st) => {
      const p = st.a.local.clone().add(this.rig.rest[st.a.seg]);
      if (st.t > 0) p.lerp(st.b.local.clone().add(this.rig.rest[st.b.seg]), st.t);
      return p;
    };
    for (const w of WRAPS) {
      if (!w.muscles.includes(id)) continue;
      const joint = `${w.joint}_${side}`;
      const body = `${w.body}${w.body === 'pelvis' ? '' : `_${side}`}`;
      const sub = this._sub[joint];
      const inSub = (st) => (1 - st.t) * (sub.has(st.a.seg) ? 1 : 0) + st.t * (sub.has(st.b.seg) ? 1 : 0);
      const J = this.rig.rest[joint];
      const skip = new Set();
      if (w.drop) {
        stations.forEach((st, i) => {
          if (i > 0 && i < stations.length - 1 && rest(st).distanceTo(J) < w.drop) skip.add(i);
        });
      }
      let at = -1;
      let prev = 0;
      stations.forEach((st, i) => {
        if (skip.has(i) || at >= 0) return;
        if (i > 0 && Math.abs(inSub(st) - inSub(stations[prev])) > 1e-9) at = i;
        else prev = i;
      });
      if (at < 0) continue;
      const c = J.clone().sub(this.rig.rest[body]); // centre in the body frame
      const a = w.axis ? new THREE.Vector3(...w.axis).normalize() : null;
      // side of the joint where the fibre runs in the rest pose
      const P = rest(stations[prev]).sub(J);
      const S = rest(stations[at]).sub(J);
      if (a) {
        P.addScaledVector(a, -P.dot(a));
        S.addScaledVector(a, -S.dot(a));
      }
      const D = S.clone().sub(P);
      const t = THREE.MathUtils.clamp(-P.dot(D) / (D.lengthSq() || 1e-12), 0, 1);
      const d = P.clone().addScaledVector(D, t);
      if (d.lengthSq() < 1e-8) d.copy(P).add(S);
      d.normalize();
      // spheres: blend with a preferred side in the body frame (left side; mirrored for the right)
      if (w.side) {
        const pref = new THREE.Vector3(w.side[0] * (side === 'R' ? -1 : 1), w.side[1], w.side[2]).normalize();
        if (w.fixed) d.copy(pref);
        else d.add(pref).normalize();
      }
      // direction of the bone carrying the wrap (towards its other joint): paths never cross it
      const other = w.body === w.joint ? JOINT_DEFS.find((j) => j.parent === body)?.name : body;
      const f = this.rig.rest[other].clone().sub(J);
      if (a) f.addScaledVector(a, -f.dot(a));
      f.normalize();
      out.push({ at, skip, body, type: w.type, c, a, d, f, r: w.r, st: { a: { seg: body }, b: { seg: body }, t: 0 } });
    }
    return out;
  }

  _build(def, side) {
    const mirror = side === 'R' ? -1 : 1;
    const fibers = [];
    for (let f = 0; f < def.fibers; f++) {
      const u = def.fibers === 1 ? 0.5 : f / (def.fibers - 1);
      const stations = def.stations.map((poly) => {
        const pts = poly.map(([seg, p]) => {
          const s = segName(seg, side);
          return { seg: s, local: this.rig.local(s, [p[0] * mirror, p[1], p[2]]) };
        });
        if (pts.length === 1) return { a: pts[0], b: pts[0], t: 0 };
        const x = u * (pts.length - 1);
        const i = Math.min(Math.floor(x), pts.length - 2);
        return { a: pts[i], b: pts[i + 1], t: x - i };
      });
      const ctrl = stations.map(() => new THREE.Vector3());
      const curve = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal');
      // path = stations plus points on wrapping surfaces; pathSt[i] says which segment(s) carry path[i]
      fibers.push({ stations, ctrl, curve, wraps: this._wrapsFor(def.id, side, stations), path: [], pathSt: [], pool: [], length: 0 });
    }

    const vertsPerFiber = SAMPLES * (RADIAL + 1);
    const pos = new Float32Array(def.fibers * vertsPerFiber * 3);
    const uv = new Float32Array(def.fibers * vertsPerFiber * 2);
    const index = [];
    for (let f = 0; f < def.fibers; f++) {
      const base = f * vertsPerFiber;
      for (let i = 0; i < SAMPLES; i++) {
        for (let j = 0; j <= RADIAL; j++) {
          const k = base + i * (RADIAL + 1) + j;
          uv[k * 2] = j / RADIAL;
          uv[k * 2 + 1] = i / (SAMPLES - 1);
          if (i < SAMPLES - 1 && j < RADIAL) {
            const a = k;
            const b = k + RADIAL + 1;
            index.push(a, b, a + 1, b, b + 1, a + 1);
          }
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(index);

    const mat = new THREE.MeshStandardMaterial({
      color: MUSCLE_COLOR.clone(),
      roughness: 0.48,
      metalness: 0.0,
      transparent: true,
      opacity: 1,
      emissive: new THREE.Color(0x000000),
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    mesh.userData = { kind: 'muscle', id: def.id, side };
    this.group.add(mesh);
    return { id: def.id, side, def, fibers, mesh, length: 0, restLength: 0, ratio: 1 };
  }

  /** Muscle paths (stations + wrapping) and lengths for the rig's current pose. */
  computePaths() {
    const rig = this.rig;
    const inv = new Map();
    const invOf = (seg) => {
      if (!inv.has(seg)) inv.set(seg, rig.joints[seg].matrixWorld.clone().invert());
      return inv.get(seg);
    };
    const P = new THREE.Vector3();
    const S = new THREE.Vector3();
    const e1 = new THREE.Vector3();
    const e2 = new THREE.Vector3();
    const n = new THREE.Vector3();
    for (const m of this.muscles) {
      let total = 0;
      for (const fb of m.fibers) {
        fb.stations.forEach((st, i) => {
          rig.worldPoint(st.a.seg, st.a.local, this._w);
          if (st.t > 0) {
            rig.worldPoint(st.b.seg, st.b.local, this._w2);
            this._w.lerp(this._w2, st.t);
          }
          fb.ctrl[i].copy(this._w);
        });
        const path = fb.path;
        const pathSt = fb.pathSt;
        path.length = 0;
        pathSt.length = 0;
        let used = 0;
        const take = () => fb.pool[used++] || (fb.pool[used - 1] = new THREE.Vector3());
        fb.stations.forEach((st, i) => {
          if (fb.wraps.some((w) => w.skip.has(i))) return;
          for (const w of fb.wraps) {
            if (w.at !== i) continue;
            // wrap between the previous path point and this station, in the body frame
            const M = invOf(w.body);
            P.copy(path[path.length - 1]).applyMatrix4(M).sub(w.c);
            S.copy(fb.ctrl[i]).applyMatrix4(M).sub(w.c);
            let zp = 0;
            let zs = 0;
            if (w.type === 'cylinder') {
              zp = P.dot(w.a);
              zs = S.dot(w.a);
              e1.copy(w.d);
              e2.crossVectors(w.a, e1);
            } else {
              n.crossVectors(P, S);
              if (n.lengthSq() < 1e-12) continue;
              n.normalize();
              e1.copy(w.d).addScaledVector(n, -w.d.dot(n));
              if (e1.lengthSq() < 1e-6) continue;
              e1.normalize();
              e2.crossVectors(n, e1);
            }
            const px = P.dot(e1);
            const py = P.dot(e2);
            const sx = S.dot(e1);
            const sy = S.dot(e2);
            const fx = w.f.dot(e1);
            const fy = w.f.dot(e2);
            const wr = wrap2D(px, py, sx, sy, w.r, Math.hypot(fx, fy) > 0.3 ? Math.atan2(fy, fx) : null);
            if (!wr) continue;
            const R = wr.R;
            const l1 = Math.hypot(px - R * Math.cos(wr.t1), py - R * Math.sin(wr.t1));
            const t2 = wr.t1 + wr.sg * wr.d;
            const l2 = Math.hypot(sx - R * Math.cos(t2), sy - R * Math.sin(t2));
            const la = R * wr.d;
            const tot = l1 + la + l2 || 1;
            const k = Math.max(1, Math.ceil(wr.d / ARC_STEP));
            const M1 = rig.joints[w.body].matrixWorld;
            for (let j = 0; j <= k; j++) {
              const th = wr.t1 + (wr.sg * wr.d * j) / k;
              const z = zp + ((zs - zp) * (l1 + (la * j) / k)) / tot;
              const q = take()
                .copy(e1)
                .multiplyScalar(R * Math.cos(th))
                .addScaledVector(e2, R * Math.sin(th))
                .add(w.c);
              if (w.a) q.addScaledVector(w.a, z);
              q.applyMatrix4(M1);
              path.push(q);
              pathSt.push(w.st);
            }
          }
          path.push(take().copy(fb.ctrl[i]));
          pathSt.push(st);
        });
        let len = 0;
        for (let i = 1; i < path.length; i++) len += path[i].distanceTo(path[i - 1]);
        fb.length = len;
        total += len;
      }
      m.length = total / m.fibers.length;
      m.ratio = m.restLength ? m.length / m.restLength : 1;
    }
  }

  update() {
    const T = new THREE.Vector3();
    const N = new THREE.Vector3();
    const B = new THREE.Vector3();
    const P = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    const samples = Array.from({ length: SAMPLES }, () => new THREE.Vector3());

    this.computePaths();
    for (const m of this.muscles) {
      const pos = m.mesh.geometry.attributes.position.array;
      const bulge = THREE.MathUtils.clamp(Math.sqrt(1 / m.ratio), 0.72, 1.4);

      m.fibers.forEach((fb, f) => {
        const R = (m.def.rs ? m.def.rs[f] : m.def.r) * bulge;
        fb.curve.points = fb.path;
        for (let i = 0; i < SAMPLES; i++) fb.curve.getPoint(i / (SAMPLES - 1), samples[i]);
        const base = f * SAMPLES * (RADIAL + 1);
        for (let i = 0; i < SAMPLES; i++) {
          const a = samples[Math.max(i - 1, 0)];
          const b = samples[Math.min(i + 1, SAMPLES - 1)];
          T.subVectors(b, a).normalize();
          if (i === 0) {
            tmp.set(0, 1, 0);
            if (Math.abs(T.dot(tmp)) > 0.9) tmp.set(1, 0, 0);
            N.crossVectors(T, tmp).normalize();
          } else {
            N.addScaledVector(T, -T.dot(N)).normalize();
          }
          B.crossVectors(T, N);
          const t = i / (SAMPLES - 1);
          const r = R * (0.16 + 0.84 * Math.pow(Math.sin(Math.PI * t), 0.75));
          for (let j = 0; j <= RADIAL; j++) {
            const ang = (j / RADIAL) * Math.PI * 2;
            P.copy(samples[i])
              .addScaledVector(N, Math.cos(ang) * r)
              .addScaledVector(B, Math.sin(ang) * r);
            const k = (base + i * (RADIAL + 1) + j) * 3;
            pos[k] = P.x;
            pos[k + 1] = P.y;
            pos[k + 2] = P.z;
          }
        }
      });
      m.mesh.geometry.attributes.position.needsUpdate = true;
      m.mesh.geometry.computeVertexNormals();
      // the tube moves with the pose; a stale bounding sphere makes the raycaster (clicks, hover) miss it
      m.mesh.geometry.computeBoundingSphere();
    }
  }
}
