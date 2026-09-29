// Imports BodyParts3D bones (CC BY-SA 2.1 JP, © The Database Center for Life Science)
// for the hip region, measures joint centres from the bone surfaces and writes compact
// meshes for the web app.
//
//   node tools/bp3d-import.mjs <folder with FMA*.stl>
//
// Steps
//  1. read binary STL (millimetres, Z up, −Y anterior) → metres, Y up, +Z anterior
//  2. hip joint centre  = least-squares sphere fitted to the femoral head
//     (checked against a sphere fitted to the acetabulum of the hip bone)
//  3. knee flexion axis = line through spheres fitted to the two posterior condyles
//  4. uniform scale + translation so the model's hip/knee centres match the rig
//  5. simplify, quantise to 16 bit and write public/models/bp3d/*.bin + manifest.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';

const SRC = process.argv[2];
if (!SRC) {
  console.error('usage: node tools/bp3d-import.mjs <stl folder>');
  process.exit(1);
}
const OUT = new URL('../public/models/bp3d/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const PARTS = [
  { fma: 'FMA16587', id: 'pelvis', seg: 'pelvis', side: 'L', name: 'left hip bone', tris: 6000 },
  { fma: 'FMA16586', id: 'pelvis', seg: 'pelvis', side: 'R', name: 'right hip bone', tris: 6000 },
  { fma: 'FMA16202', id: 'sacrum', seg: 'pelvis', side: '', name: 'sacrum', tris: 5000 },
  { fma: 'FMA24475', id: 'femur', seg: 'hip_L', side: 'L', name: 'left femur', tris: 6000 },
  { fma: 'FMA24474', id: 'femur', seg: 'hip_R', side: 'R', name: 'right femur', tris: 6000 },
  { fma: 'FMA24487', id: 'patella', seg: 'hip_L', side: 'L', name: 'left patella', tris: 900 },
  { fma: 'FMA24486', id: 'patella', seg: 'hip_R', side: 'R', name: 'right patella', tris: 900 },
];

// ------------------------------------------------------------------ geometry io
function readStl(file) {
  const b = readFileSync(file);
  const n = b.readUInt32LE(80);
  const pos = new Float32Array(n * 9);
  for (let i = 0; i < n; i++) {
    for (let v = 0; v < 3; v++) {
      const o = 84 + i * 50 + 12 + v * 12;
      const X = b.readFloatLE(o);
      const Y = b.readFloatLE(o + 4);
      const Z = b.readFloatLE(o + 8);
      // BodyParts3D: mm, Z up, −Y anterior  →  m, Y up, +Z anterior
      pos.set([X / 1000, Z / 1000, -Y / 1000], i * 9 + v * 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return mergeVertices(g, 1e-6);
}
const verts = (g) => {
  const a = g.attributes.position;
  return Array.from({ length: a.count }, (_, i) => new THREE.Vector3().fromBufferAttribute(a, i));
};

// ------------------------------------------------------------------ math
/** Algebraic least-squares sphere: |p|² = 2c·p + (r² − |c|²). Solves a 4×4 normal system. */
function fitSphere(pts) {
  const A = Array.from({ length: 4 }, () => new Array(4).fill(0));
  const B = new Array(4).fill(0);
  for (const p of pts) {
    const row = [2 * p.x, 2 * p.y, 2 * p.z, 1];
    const rhs = p.lengthSq();
    for (let i = 0; i < 4; i++) {
      B[i] += row[i] * rhs;
      for (let j = 0; j < 4; j++) A[i][j] += row[i] * row[j];
    }
  }
  const x = solve(A, B);
  const c = new THREE.Vector3(x[0], x[1], x[2]);
  const r = Math.sqrt(x[3] + c.lengthSq());
  const rms = Math.sqrt(pts.reduce((s, p) => s + (p.distanceTo(c) - r) ** 2, 0) / pts.length);
  return { c, r, rms, n: pts.length };
}
function solve(A, B) {
  const n = B.length;
  const M = A.map((row, i) => [...row, B[i]]);
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    [M[i], M[p]] = [M[p], M[i]];
    for (let k = i + 1; k < n; k++) {
      const f = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) M[k][j] -= f * M[i][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}
const deg = (r) => (r * 180) / Math.PI;

// ------------------------------------------------------------------ femur analysis
function analyseFemur(g, side) {
  const P = verts(g);
  const s = side === 'L' ? 1 : -1;
  const ys = P.map((p) => p.y);
  const yMax = Math.max(...ys);
  const yMin = Math.min(...ys);
  const L = yMax - yMin;

  // femoral head: top 12 %, medial half
  let cand = P.filter((p) => p.y > yMax - 0.12 * L);
  const xs = cand.map((p) => p.x * s).sort((a, b) => a - b);
  const xMed = xs[Math.floor(xs.length * 0.45)];
  cand = cand.filter((p) => p.x * s < xMed);
  let head = fitSphere(cand);
  for (let it = 0; it < 4; it++) {
    const shell = P.filter((p) => Math.abs(p.distanceTo(head.c) - head.r) < 0.0035 && p.x * s < head.c.x * s + head.r * 0.35);
    head = fitSphere(shell);
  }

  // posterior condyles: bottom 4.5 %, split medial / lateral, posterior half
  const dist = P.filter((p) => p.y < yMin + 0.045 * L);
  const midX = dist.reduce((a, p) => a + p.x, 0) / dist.length;
  const midZ = dist.reduce((a, p) => a + p.z, 0) / dist.length;
  const condyle = (medial) => {
    let pts = dist.filter((p) => (medial ? p.x * s < midX * s : p.x * s > midX * s) && p.z < midZ + 0.005);
    let sph = fitSphere(pts);
    for (let it = 0; it < 3; it++) {
      pts = pts.filter((p) => Math.abs(p.distanceTo(sph.c) - sph.r) < 0.004);
      sph = fitSphere(pts);
    }
    return sph;
  };
  const med = condyle(true);
  const lat = condyle(false);
  const kneeCentre = med.c.clone().add(lat.c).multiplyScalar(0.5);
  const condAxis = lat.c.clone().sub(med.c).normalize();

  return {
    head,
    med,
    lat,
    kneeCentre,
    condAxis,
    length: L,
  };
}

// ------------------------------------------------------------------ main
const geos = {};
for (const p of PARTS) geos[p.fma] = readStl(`${SRC}/${p.fma}.stl`);

const fem = { L: analyseFemur(geos.FMA24475, 'L'), R: analyseFemur(geos.FMA24474, 'R') };
const fmt = (v) => `(${(v.x * 1000).toFixed(1)}, ${(v.y * 1000).toFixed(1)}, ${(v.z * 1000).toFixed(1)}) mm`;
for (const s of ['L', 'R']) {
  const f = fem[s];
  console.log(`femur ${s}: head r=${(f.head.r * 1000).toFixed(1)} mm (rms ${(f.head.rms * 1000).toFixed(2)} mm, n=${f.head.n}) centre ${fmt(f.head.c)}`);
  console.log(`   condyles r=${(f.med.r * 1000).toFixed(1)}/${(f.lat.r * 1000).toFixed(1)} mm, knee centre ${fmt(f.kneeCentre)}`);
  console.log(`   HJC–KJC ${(f.head.c.distanceTo(f.kneeCentre) * 1000).toFixed(0)} mm`);
}
// acetabulum check
for (const [s, fma] of [['L', 'FMA16587'], ['R', 'FMA16586']]) {
  const h = fem[s].head;
  let pts = verts(geos[fma]).filter((p) => Math.abs(p.distanceTo(h.c) - h.r) < 0.006);
  let ac = fitSphere(pts);
  for (let it = 0; it < 3; it++) {
    pts = pts.filter((p) => Math.abs(p.distanceTo(ac.c) - ac.r) < 0.003);
    ac = fitSphere(pts);
  }
  fem[s].acetabulum = ac;
  console.log(`acetabulum ${s}: r=${(ac.r * 1000).toFixed(1)} mm, centre offset from femoral head ${(ac.c.distanceTo(h.c) * 1000).toFixed(1)} mm`);
}

// registration to the rig: uniform scale from thigh length, translate mid-hip centre
const RIG = { hip: [0.087, 0.93, 0.0], knee: [0.095, 0.5, 0.0] };
const rigThigh = Math.hypot(RIG.hip[0] - RIG.knee[0], RIG.hip[1] - RIG.knee[1], RIG.hip[2] - RIG.knee[2]);
const bpThigh = (fem.L.head.c.distanceTo(fem.L.kneeCentre) + fem.R.head.c.distanceTo(fem.R.kneeCentre)) / 2;
const scale = rigThigh / bpThigh;
const midHip = fem.L.head.c.clone().add(fem.R.head.c).multiplyScalar(0.5);
const T = (p) => p.clone().sub(midHip).multiplyScalar(scale).add(new THREE.Vector3(0, RIG.hip[1], 0));
// Each femur (and its patella) is additionally rotated about its head centre so that its
// mechanical axis (hip centre → knee centre) lies on the rig's thigh line; this keeps the
// bone articulating at both the hip and the knee of the rig.
const femurTransform = {};
for (const s of ['L', 'R']) {
  const mx = s === 'L' ? 1 : -1;
  const H = T(fem[s].head.c);
  const K = T(fem[s].kneeCentre);
  const rigH = new THREE.Vector3(RIG.hip[0] * mx, RIG.hip[1], RIG.hip[2]);
  const rigK = new THREE.Vector3(RIG.knee[0] * mx, RIG.knee[1], RIG.knee[2]);
  const q = new THREE.Quaternion().setFromUnitVectors(K.clone().sub(H).normalize(), rigK.clone().sub(rigH).normalize());
  femurTransform[s] = (p) => T(p).sub(H).applyQuaternion(q).add(rigH);
  femurTransform[s].angle = deg(2 * Math.acos(Math.min(1, Math.abs(q.w))));
}
const derived = {};
for (const s of ['L', 'R']) derived[s] = { hip: T(fem[s].head.c), knee: T(fem[s].kneeCentre) };
console.log(`scale ${scale.toFixed(3)}  (thigh ${(bpThigh * 1000).toFixed(0)} mm → rig ${(rigThigh * 1000).toFixed(0)} mm)`);
for (const s of ['L', 'R']) console.log(`derived ${s}: hip ${fmt(derived[s].hip)}  knee ${fmt(derived[s].knee)}  (femur aligned to rig by ${femurTransform[s].angle.toFixed(1)}°)`);

// write meshes (positions in world rest metres; the app subtracts the segment's rest point)
const manifest = {
  source: 'BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution-Share Alike 2.1 Japan',
  license: 'CC BY-SA 2.1 JP',
  scale,
  derived: Object.fromEntries(Object.entries(derived).map(([s, d]) => [s, { hip: d.hip.toArray(), knee: d.knee.toArray() }])),
  measurements: Object.fromEntries(
    ['L', 'R'].map((s) => [
      s,
      {
        femoralHeadRadiusMm: +(fem[s].head.r * 1000).toFixed(1),
        sphereFitRmsMm: +(fem[s].head.rms * 1000).toFixed(2),
        acetabulumOffsetMm: +(fem[s].acetabulum.c.distanceTo(fem[s].head.c) * 1000).toFixed(1),
        condyleRadiiMm: [+(fem[s].med.r * 1000).toFixed(1), +(fem[s].lat.r * 1000).toFixed(1)],
        kneeBehindHipMm: +((fem[s].head.c.z - fem[s].kneeCentre.z) * 1000).toFixed(1),
        femurAlignDeg: +femurTransform[s].angle.toFixed(1),
      },
    ]),
  ),
  parts: [],
};
const simplifier = new SimplifyModifier();
for (const p of PARTS) {
  let g = geos[p.fma];
  const pos = g.attributes.position;
  const X = p.id === 'femur' || p.id === 'patella' ? femurTransform[p.side] : T;
  for (let i = 0; i < pos.count; i++) {
    const v = X(new THREE.Vector3().fromBufferAttribute(pos, i));
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  const before = g.index.count / 3;
  const remove = Math.max(0, pos.count - Math.round(pos.count * (p.tris / before)));
  if (remove > 0) g = await simplifier.modify(g, remove);
  if (g.attributes.normal) g.deleteAttribute('normal');
  g = mergeVertices(g, 1e-7);
  const P = g.attributes.position;
  const idx = g.index.array;
  g.computeBoundingBox();
  const { min, max } = g.boundingBox;
  const q = new Uint16Array(P.count * 3);
  for (let i = 0; i < P.count; i++) {
    for (let k = 0; k < 3; k++) {
      const lo = min.getComponent(k);
      const hi = max.getComponent(k);
      q[i * 3 + k] = Math.round(((P.getComponent(i, k) - lo) / (hi - lo || 1)) * 65535);
    }
  }
  const index = P.count < 65536 ? Uint16Array.from(idx) : Uint32Array.from(idx);
  const file = `${p.fma}.bin`;
  const buf = Buffer.concat([Buffer.from(q.buffer), Buffer.from(index.buffer)]);
  writeFileSync(new URL(file, OUT), buf);
  manifest.parts.push({
    file, fma: p.fma, id: p.id, seg: p.seg, side: p.side, name: p.name,
    vertices: P.count, indices: index.length, index32: index instanceof Uint32Array,
    min: min.toArray(), max: max.toArray(),
  });
  console.log(`${p.fma} ${p.name}: ${before} → ${index.length / 3} triangles, ${(buf.length / 1024).toFixed(0)} KB`);
}
writeFileSync(new URL('manifest.json', OUT), JSON.stringify(manifest, null, 2));
