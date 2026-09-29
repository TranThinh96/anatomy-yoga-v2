import * as THREE from 'three';
import { MODEL } from '../data/body-model.gen.js';

/**
 * Loads the BodyParts3D bone meshes written by tools/bp3d-build.mjs (one binary file,
 * 16-bit positions quantised inside each part's bounding box, rest-pose world metres).
 * Returns [{ part, geometry, mirrored }] – parts flagged `mirror` also get a copy
 * reflected to the right side (x → −x, winding flipped).
 */
export async function loadSkeleton(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`skeleton: HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  const out = [];
  for (const p of MODEL.meshes) {
    const q = new Uint16Array(buf, p.offset, p.vertices * 3);
    const iOff = p.offset + p.vertices * 6;
    const index = p.index32 ? new Uint32Array(buf.slice(iOff, iOff + p.indices * 4)) : new Uint16Array(buf.slice(iOff, iOff + p.indices * 2));
    const pos = new Float32Array(p.vertices * 3);
    for (let i = 0; i < p.vertices; i++) {
      for (let k = 0; k < 3; k++) pos[i * 3 + k] = p.min[k] + (q[i * 3 + k] / 65535) * (p.max[k] - p.min[k]);
    }
    out.push({ part: p, geometry: makeGeometry(pos, index), mirrored: false });
    if (p.mirror) {
      const mpos = pos.slice();
      for (let i = 0; i < p.vertices; i++) mpos[i * 3] = -mpos[i * 3];
      const midx = index.slice();
      for (let t = 0; t < midx.length; t += 3) [midx[t + 1], midx[t + 2]] = [midx[t + 2], midx[t + 1]];
      out.push({ part: p, geometry: makeGeometry(mpos, midx), mirrored: true });
    }
  }
  return out;
}

function makeGeometry(pos, index) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(new THREE.BufferAttribute(index, 1));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}
