import * as THREE from 'three';

/**
 * Loads the BodyParts3D bone meshes produced by tools/bp3d-import.mjs.
 * Positions are quantised to 16 bit inside each part's bounding box and are in
 * rest-pose world metres, so they attach to rig segments like the procedural bones.
 */
export async function loadBP3D(baseUrl) {
  const res = await fetch(`${baseUrl}manifest.json`);
  if (!res.ok) throw new Error(`BodyParts3D manifest: HTTP ${res.status}`);
  const manifest = await res.json();
  const parts = await Promise.all(
    manifest.parts.map(async (p) => {
      const buf = await (await fetch(`${baseUrl}${p.file}`)).arrayBuffer();
      const q = new Uint16Array(buf, 0, p.vertices * 3);
      const index = p.index32 ? new Uint32Array(buf, p.vertices * 6, p.indices) : new Uint16Array(buf, p.vertices * 6, p.indices);
      const pos = new Float32Array(p.vertices * 3);
      for (let i = 0; i < p.vertices; i++) {
        for (let k = 0; k < 3; k++) pos[i * 3 + k] = p.min[k] + (q[i * 3 + k] / 65535) * (p.max[k] - p.min[k]);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setIndex(new THREE.BufferAttribute(index.slice(), 1));
      g.computeVertexNormals();
      return { ...p, geometry: g };
    }),
  );
  return { manifest, parts };
}
