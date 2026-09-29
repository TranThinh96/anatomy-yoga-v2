import * as THREE from 'three';
import { MODEL } from '../data/body-model.gen.js';

// Muscle paths measured on the BodyParts3D muscle meshes (tools/bp3d-build.mjs):
// stations = origin, via points (cross-section centroids), insertion; one polyline point per fibre.
const MUSCLE_GEOMETRY = MODEL.muscles;

const SIDED = new Set(['scapula', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle']);
const SAMPLES = 18;
const RADIAL = 9;

export const MUSCLE_COLOR = new THREE.Color('#b24a44');

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

    for (const def of MUSCLE_GEOMETRY) {
      for (const side of ['L', 'R']) this.muscles.push(this._build(def, side));
    }
    rig.root.updateMatrixWorld(true);
    this.update();
    for (const m of this.muscles) m.restLength = m.length;
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
      fibers.push({ stations, ctrl, curve, restLength: 0 });
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

  update() {
    const rig = this.rig;
    const T = new THREE.Vector3();
    const N = new THREE.Vector3();
    const B = new THREE.Vector3();
    const P = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    const samples = Array.from({ length: SAMPLES }, () => new THREE.Vector3());

    for (const m of this.muscles) {
      const pos = m.mesh.geometry.attributes.position.array;
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
        let len = 0;
        for (let i = 1; i < fb.ctrl.length; i++) len += fb.ctrl[i].distanceTo(fb.ctrl[i - 1]);
        fb.length = len;
        total += len;
      }
      m.length = total / m.fibers.length;
      m.ratio = m.restLength ? m.length / m.restLength : 1;
      const bulge = THREE.MathUtils.clamp(Math.sqrt(1 / m.ratio), 0.72, 1.4);

      m.fibers.forEach((fb, f) => {
        const R = (m.def.rs ? m.def.rs[f] : m.def.r) * bulge;
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
    }
  }
}
