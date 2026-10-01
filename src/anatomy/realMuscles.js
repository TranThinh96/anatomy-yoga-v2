import * as THREE from 'three';
import { MODEL } from '../data/body-model.gen.js';
import { MUSCLE_COLOR } from './muscles.js';

const SIDED = new Set(['scapula', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle']);

/**
 * The real BodyParts3D muscle surfaces (public/models/bp3d/muscles.bin, written by
 * tools/bp3d-build.mjs), shown in anatomy mode. Positions are 16-bit quantised inside each part's
 * box (rest pose, left side); every vertex carries two rig segments and the weight of the second.
 * The right side is the mirror image. Meshes live in world space and are re-skinned (linear blend)
 * whenever the rig moves: fine for standing poses, not meant for deep flexion.
 */
export class RealMuscles {
  constructor(rig, buf) {
    this.rig = rig;
    this.group = new THREE.Group();
    this.group.name = 'real-muscles';
    this.meshes = [];
    const { segs, parts } = MODEL.muscleMeshes;
    for (const p of parts) {
      const q = new Uint16Array(buf, p.offset, p.vertices * 3);
      const skinOff = p.offset + p.vertices * 6;
      const skin = new Uint8Array(buf, skinOff, p.vertices * 4);
      const iOff = skinOff + p.vertices * 4;
      const index = p.index32 ? new Uint32Array(buf.slice(iOff, iOff + p.indices * 4)) : new Uint16Array(buf.slice(iOff, iOff + p.indices * 2));
      const rest = new Float32Array(p.vertices * 3);
      for (let i = 0; i < p.vertices; i++) {
        for (let k = 0; k < 3; k++) rest[i * 3 + k] = p.min[k] + (q[i * 3 + k] / 65535) * (p.max[k] - p.min[k]);
      }
      for (const side of ['L', 'R']) {
        const r = side === 'L' ? rest : rest.slice();
        let idx = index;
        if (side === 'R') {
          for (let i = 0; i < p.vertices; i++) r[i * 3] = -r[i * 3];
          idx = index.slice();
          for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
        }
        const joints = segs.map((s) => this.rig.joints[SIDED.has(s) ? `${s}_${side}` : s]);
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(r.slice(), 3).setUsage(THREE.DynamicDrawUsage));
        g.setIndex(new THREE.BufferAttribute(idx, 1));
        const mesh = new THREE.Mesh(
          g,
          new THREE.MeshStandardMaterial({ color: MUSCLE_COLOR.clone(), roughness: 0.55, metalness: 0, transparent: true, opacity: 1, emissive: new THREE.Color(0) }),
        );
        mesh.castShadow = true;
        mesh.userData = { kind: 'muscle', id: p.id, side, name: p.name, fma: p.fma };
        mesh.userData.skin = { rest: r, skin, joints, segs: segs.map((s) => (SIDED.has(s) ? `${s}_${side}` : s)) };
        this.group.add(mesh);
        this.meshes.push(mesh);
      }
    }
    this._sig = null;
    this._m = segs.map(() => new THREE.Matrix4());
    this._t = new THREE.Matrix4();
  }

  /** Re-skins every mesh if the rig moved since the last call. */
  update(force = false) {
    const sig = [];
    for (const name in this.rig.joints) sig.push(...this.rig.joints[name].matrixWorld.elements);
    if (!force && this._sig && this._sig.length === sig.length && this._sig.every((v, i) => v === sig[i])) return false;
    this._sig = sig;
    const cache = new Map(); // segment name -> skinning matrix (world × rest⁻¹)
    for (const mesh of this.meshes) {
      const { rest, skin, joints, segs } = mesh.userData.skin;
      const M = joints.map((j, k) => {
        if (!cache.has(segs[k])) {
          const r = this.rig.rest[segs[k]];
          cache.set(segs[k], new THREE.Matrix4().multiplyMatrices(j.matrixWorld, this._t.makeTranslation(-r.x, -r.y, -r.z)).elements);
        }
        return cache.get(segs[k]);
      });
      const pos = mesh.geometry.attributes.position;
      const out = pos.array;
      const n = rest.length / 3;
      for (let i = 0; i < n; i++) {
        const x = rest[i * 3];
        const y = rest[i * 3 + 1];
        const z = rest[i * 3 + 2];
        const a = M[skin[i * 4]];
        const w = skin[i * 4 + 2] / 255;
        let px = a[0] * x + a[4] * y + a[8] * z + a[12];
        let py = a[1] * x + a[5] * y + a[9] * z + a[13];
        let pz = a[2] * x + a[6] * y + a[10] * z + a[14];
        if (w > 0) {
          const b = M[skin[i * 4 + 1]];
          px += w * (b[0] * x + b[4] * y + b[8] * z + b[12] - px);
          py += w * (b[1] * x + b[5] * y + b[9] * z + b[13] - py);
          pz += w * (b[2] * x + b[6] * y + b[10] * z + b[14] - pz);
        }
        out[i * 3] = px;
        out[i * 3 + 1] = py;
        out[i * 3 + 2] = pz;
      }
      pos.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
      mesh.geometry.computeBoundingSphere();
      mesh.geometry.computeBoundingBox();
    }
    return true;
  }
}

export async function loadRealMuscles(url, rig) {
  if (!MODEL.muscleMeshes) throw new Error('muscle meshes: not in the generated model');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`muscle meshes: HTTP ${res.status}`);
  return new RealMuscles(rig, await res.arrayBuffer());
}
