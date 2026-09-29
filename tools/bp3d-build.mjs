// Builds the whole-body model from BodyParts3D (CC BY-SA 2.1 JP, © The Database Center
// for Life Science):
//
//   node tools/bp3d-build.mjs <BodyParts3D_data folder containing stl/ and parts_list_e.txt>
//
// Output
//   src/data/body-model.gen.js   joint centres, floor-contact points, segment landmarks,
//                                joint markers, muscle paths, measurements, mesh index
//   public/models/bp3d/skeleton.bin   simplified, 16-bit quantised bone meshes
//
// Method (all on the left side + midline; the right side is the mirror image)
//   • joint centres from the bone surfaces: least-squares spheres on the femoral and
//     humeral heads, spheres on the posterior femoral condyles, midpoints of the
//     malleoli / epicondyles / styloid processes, intervertebral-disc centroids …
//   • the upper limb is rotated about the shoulder centre so the arm hangs vertically
//     (the rig's neutral), everything else keeps the scanned standing posture
//   • muscle attachments = where each muscle mesh touches its origin / insertion
//     bones; the path (via points) = centroids of cross-sections of the muscle mesh;
//     the belly radius = mean radius of those cross-sections
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const DATA = process.argv[2];
if (!DATA) {
  console.error('usage: node tools/bp3d-build.mjs <BodyParts3D_data folder>');
  process.exit(1);
}
const ROOT = new URL('../', import.meta.url);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const deg = (r) => (r * 180) / Math.PI;
const log = (...a) => console.log(...a);

// ------------------------------------------------------------------ part names
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const THORACIC = ORD.map((o) => `${o} thoracic vertebra`);
const LUMBAR = ORD.slice(0, 5).map((o) => `${o} lumbar vertebra`);
const CERVICAL = ['atlas', 'axis', ...ORD.slice(2, 7).map((o) => `${o} cervical vertebra`)];
const RIBS = ORD.map((o) => `left ${o} rib`);
const CARTILAGE = [...ORD.slice(0, 7).map((o) => `left ${o} costal cartilage`), 'left costal cartilage'];
const TOES = ['big toe', 'second toe', 'third toe', 'fourth toe', 'little toe'];
const FINGERS = ['thumb', 'index finger', 'middle finger', 'ring finger', 'little finger'];
const phal = (side, list) =>
  ['proximal', 'middle', 'distal'].flatMap((p) => list.map((t) => `${p} phalanx of ${side} ${t}`)).filter((n) => !/middle phalanx of left (big toe|thumb)/.test(n));
const FOOT = [
  'left talus', 'left calcaneus', 'navicular bone of left foot', 'left cuboid bone', 'left medial cuneiform bone',
  'left intermediate cuneiform bone', 'left lateral cuneiform bone', ...ORD.slice(0, 5).map((o) => `left ${o} metatarsal bone`), ...phal('left', TOES),
];
const HAND = [
  'left scaphoid', 'left lunate', 'left pisiform', 'left trapezium', 'left trapezoid', 'left capitate', 'left hamate',
  ...ORD.slice(0, 5).map((o) => `left ${o} metacarpal bone`), ...phal('left', FINGERS),
];
const SKULL_MID = ['frontal bone', 'occipital bone', 'mandible'];
const SKULL_L = ['left parietal bone', 'left temporal bone', 'left maxilla', 'left zygomatic bone', 'left nasal bone'];
const STERNUM = ['manubrium', 'body of sternum'];
const DISKS = {
  L5S1: 'intervertebral disk of fifth lumbar vertebra',
  L4: 'intervertebral disk of fourth lumbar vertebra',
  L3: 'intervertebral disk of third lumbar vertebra',
  T12L1: 'intervertebral disk of twelfth thoracic vertebra',
  C7T1: 'intervertebral disk of seventh cervical vertebra',
};

// display bones: [names, segment, info id, mirrored?]
const BONE_GROUPS = [
  [SKULL_MID, 'head', 'skull', false],
  [SKULL_L, 'head', 'skull', true],
  [CERVICAL, 'neck', 'cervical_spine', false],
  [THORACIC, 'thorax', 'thoracic_spine', false],
  [[...RIBS, ...CARTILAGE], 'thorax', 'ribcage', true],
  [STERNUM, 'thorax', 'sternum', false],
  [LUMBAR, 'lumbar', 'lumbar_spine', false],
  [['sacrum'], 'pelvis', 'sacrum', false],
  [['left hip bone'], 'pelvis', 'pelvis', true],
  [['left clavicle'], 'scapula', 'clavicle', true],
  [['left scapula'], 'scapula', 'scapula', true],
  [['left humerus'], 'shoulder', 'humerus', true],
  [['left radius', 'left ulna'], 'elbow', 'radius_ulna', true],
  [HAND, 'wrist', 'hand', true],
  [['left femur'], 'hip', 'femur', true],
  [['left patella'], 'hip', 'patella', true],
  [['left tibia', 'left fibula'], 'knee', 'tibia_fibula', true],
  [FOOT, 'ankle', 'foot', true],
];
const SIDED_SEG = new Set(['scapula', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle']);

// ------------------------------------------------------------------ loading
const ids = {};
for (const line of readFileSync(`${DATA}/parts_list_e.txt`, 'utf8').split('\n').slice(1)) {
  const [id, name] = line.split('\t');
  if (id && name) ids[name.trim()] = id.trim();
}
const cache = {};
function part(name) {
  if (cache[name]) return cache[name];
  const id = ids[name];
  if (!id) throw new Error(`unknown part "${name}"`);
  const b = readFileSync(`${DATA}/stl/${id}.stl`);
  const n = b.readUInt32LE(80);
  const pos = new Float32Array(n * 9);
  for (let i = 0; i < n; i++) {
    for (let v = 0; v < 3; v++) {
      const o = 84 + i * 50 + 12 + v * 12;
      // BodyParts3D: mm, Z up, −Y anterior → m, Y up, +Z anterior; left = +X in both
      pos[i * 9 + v * 3] = b.readFloatLE(o) / 1000;
      pos[i * 9 + v * 3 + 1] = b.readFloatLE(o + 8) / 1000;
      pos[i * 9 + v * 3 + 2] = -b.readFloatLE(o + 4) / 1000;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = mergeVertices(g, 1e-7);
  const a = m.attributes.position;
  const verts = Array.from({ length: a.count }, (_, i) => V().fromBufferAttribute(a, i));
  cache[name] = { name, id, verts, index: m.index.array, tris: m.index.count / 3 };
  return cache[name];
}
const vertsOf = (names) => names.flatMap((n) => part(n).verts);

// ------------------------------------------------------------------ geometry helpers
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
  const c = V(x[0], x[1], x[2]);
  const r = Math.sqrt(x[3] + c.lengthSq());
  const rms = Math.sqrt(pts.reduce((s, p) => s + (p.distanceTo(c) - r) ** 2, 0) / pts.length);
  return { c, r, rms, n: pts.length };
}
function refineSphere(all, sph, tol = 0.0035, keep = () => true) {
  for (let it = 0; it < 4; it++) {
    const shell = all.filter((p) => Math.abs(p.distanceTo(sph.c) - sph.r) < tol && keep(p, sph));
    if (shell.length < 30) break;
    sph = fitSphere(shell);
  }
  return sph;
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
const minOf = (a) => a.reduce((m, x) => (x < m ? x : m), Infinity);
const maxOf = (a) => a.reduce((m, x) => (x > m ? x : m), -Infinity);
const centroid = (pts) => pts.reduce((a, p) => a.add(p), V()).multiplyScalar(1 / Math.max(pts.length, 1));
const argmax = (pts, f) => pts.reduce((best, p) => (f(p) > f(best) ? p : best), pts[0]).clone();
const argmin = (pts, f) => argmax(pts, (p) => -f(p));
function bbox(pts) {
  const b = new THREE.Box3();
  for (const p of pts) b.expandByPoint(p);
  return b;
}
function principalAxis(pts) {
  const m = centroid(pts);
  const C = new Array(9).fill(0);
  for (const p of pts) {
    const d = [p.x - m.x, p.y - m.y, p.z - m.z];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i * 3 + j] += d[i] * d[j];
  }
  let v = V(0.3, 1, 0.2).normalize();
  for (let k = 0; k < 60; k++) v = V(C[0] * v.x + C[1] * v.y + C[2] * v.z, C[3] * v.x + C[4] * v.y + C[5] * v.z, C[6] * v.x + C[7] * v.y + C[8] * v.z).normalize();
  return { mean: m, dir: v };
}

/** Uniform grid for nearest-neighbour queries over labelled points. */
class Grid {
  constructor(cell = 0.006) {
    this.cell = cell;
    this.map = new Map();
  }
  key(x, y, z) {
    return `${x},${y},${z}`;
  }
  add(p, label) {
    const c = this.cell;
    const k = this.key(Math.floor(p.x / c), Math.floor(p.y / c), Math.floor(p.z / c));
    if (!this.map.has(k)) this.map.set(k, []);
    this.map.get(k).push([p, label]);
  }
  /** nearest point within maxD (metres) → { p, label, d } or null */
  nearest(q, maxD) {
    const c = this.cell;
    const R = Math.ceil(maxD / c);
    const cx = Math.floor(q.x / c);
    const cy = Math.floor(q.y / c);
    const cz = Math.floor(q.z / c);
    let best = null;
    for (let i = -R; i <= R; i++)
      for (let j = -R; j <= R; j++)
        for (let k = -R; k <= R; k++) {
          const list = this.map.get(this.key(cx + i, cy + j, cz + k));
          if (!list) continue;
          for (const [p, label] of list) {
            const d = p.distanceTo(q);
            if (d <= maxD && (!best || d < best.d)) best = { p, label, d };
          }
        }
    return best;
  }
}
function gridOf(names, cell = 0.006) {
  const g = new Grid(cell);
  for (const n of names) for (const p of part(n).verts) g.add(p, n);
  return g;
}

// ------------------------------------------------------------------ joint centres
function femurAnalysis() {
  const P = part('left femur').verts;
  const yMax = maxOf(P.map((p) => p.y));
  const yMin = minOf(P.map((p) => p.y));
  const L = yMax - yMin;
  let cand = P.filter((p) => p.y > yMax - 0.12 * L);
  const xs = cand.map((p) => p.x).sort((a, b) => a - b);
  cand = cand.filter((p) => p.x < xs[Math.floor(xs.length * 0.45)]); // medial half (left side: smaller x)
  const head = refineSphere(P, fitSphere(cand), 0.0035, (p, s) => p.x < s.c.x + s.r * 0.35);
  const dist = P.filter((p) => p.y < yMin + 0.045 * L);
  const midX = centroid(dist).x;
  const midZ = centroid(dist).z;
  const condyle = (medial) => {
    const pts = dist.filter((p) => (medial ? p.x < midX : p.x > midX) && p.z < midZ + 0.005);
    return refineSphere(pts, fitSphere(pts), 0.004);
  };
  const med = condyle(true);
  const lat = condyle(false);
  return { head, med, lat, knee: med.c.clone().add(lat.c).multiplyScalar(0.5) };
}
function humerusAnalysis() {
  const P = part('left humerus').verts;
  const yMax = maxOf(P.map((p) => p.y));
  const yMin = minOf(P.map((p) => p.y));
  const L = yMax - yMin;
  // humeral head: top 14 %, medial–posterior part (the tubercles are lateral/anterior)
  let cand = P.filter((p) => p.y > yMax - 0.14 * L);
  const xs = cand.map((p) => p.x).sort((a, b) => a - b);
  cand = cand.filter((p) => p.x < xs[Math.floor(xs.length * 0.5)]);
  const head = refineSphere(P, fitSphere(cand), 0.0035, (p, s) => p.x < s.c.x + s.r * 0.3);
  const distal = P.filter((p) => p.y < yMin + 0.08 * L);
  const medEpi = argmin(distal, (p) => p.x);
  const latEpi = argmax(distal, (p) => p.x);
  return { head, medEpi, latEpi, elbow: medEpi.clone().add(latEpi).multiplyScalar(0.5) };
}

log('loading bones …');
const fem = femurAnalysis();
const hum = humerusAnalysis();
const acet = (() => {
  let pts = part('left hip bone').verts.filter((p) => Math.abs(p.distanceTo(fem.head.c) - fem.head.r) < 0.006);
  let s = fitSphere(pts);
  s = refineSphere(pts, s, 0.003);
  return s;
})();
const glenoid = (() => {
  let pts = part('left scapula').verts.filter((p) => Math.abs(p.distanceTo(hum.head.c) - hum.head.r) < 0.008);
  return pts.length > 30 ? refineSphere(pts, fitSphere(pts), 0.004) : null;
})();
const tibia = part('left tibia').verts;
const fibula = part('left fibula').verts;
const tibMinY = minOf(tibia.map((p) => p.y));
const fibMinY = minOf(fibula.map((p) => p.y));
const medMall = argmin(tibia.filter((p) => p.y < tibMinY + 0.03), (p) => p.x);
const latMall = argmax(fibula.filter((p) => p.y < fibMinY + 0.03), (p) => p.x);
const ankle = medMall.clone().add(latMall).multiplyScalar(0.5);
const radius = part('left radius').verts;
const ulna = part('left ulna').verts;
const radStyloid = argmin(radius, (p) => p.y);
const ulnStyloid = argmin(ulna, (p) => p.y);
const wrist = radStyloid.clone().add(ulnStyloid).multiplyScalar(0.5);
const clav = part('left clavicle').verts;
const scJoint = argmin(clav, (p) => p.x);
const disk = (k) => centroid(part(DISKS[k]).verts);
const atlasV = part('atlas').verts;
const atlasTopY = maxOf(atlasV.map((p) => p.y));
const headJoint = centroid(atlasV.filter((p) => p.y > atlasTopY - 0.006 && Math.abs(p.x) < 0.03));
headJoint.x = 0;

const J = {
  hip: fem.head.c.clone(),
  knee: fem.knee.clone(),
  ankle,
  shoulder: hum.head.c.clone(),
  elbow: hum.elbow.clone(),
  wrist,
  scapula: scJoint,
  lumbar: disk('L5S1'),
  thorax: disk('T12L1'),
  neck: disk('C7T1'),
  head: headJoint,
};
for (const k of ['lumbar', 'thorax', 'neck']) J[k].x = 0;
J.pelvis = V(0, J.hip.y, J.hip.z);

// upper limb: rotate about the shoulder centre so the upper arm hangs vertically (frontal plane)
const armAbd = Math.atan2(J.elbow.x - J.shoulder.x, J.shoulder.y - J.elbow.y);
const armQ = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), -armAbd);
const ARM_SEGS = new Set(['shoulder', 'elbow', 'wrist']);
const armX = (p) => p.clone().sub(J.shoulder).applyQuaternion(armQ).add(J.shoulder);
for (const k of ['elbow', 'wrist']) J[k] = armX(J[k]);
log(`arm abduction in the scan ${deg(armAbd).toFixed(1)}° → rotated to vertical`);

// global frame: midline x = 0, floor y = 0, hip centres at z = 0
const footAll = vertsOf(FOOT);
const floorY = minOf(footAll.map((p) => p.y));
const ORIGIN = V(0, floorY, J.hip.z);
/** segment-aware transform from scan space into model space */
const X = (p, seg) => (ARM_SEGS.has(seg) ? armX(p) : p.clone()).sub(ORIGIN);
const jointOut = {};
for (const [k, p] of Object.entries(J)) jointOut[k] = p.clone().sub(ORIGIN);

// ------------------------------------------------------------------ bones: segment lookup
const BONE_SEG = {};
for (const [names, seg] of BONE_GROUPS) for (const n of names) BONE_SEG[n] = seg;
const ALL_BONES = BONE_GROUPS.flatMap(([names]) => names);
log('indexing bone surfaces …');
const allBoneGrid = gridOf(ALL_BONES, 0.008);
const spineGrid = gridOf([...CERVICAL, ...THORACIC, ...LUMBAR, 'sacrum'], 0.01);
/** segment of the bone nearest to p (scan space) */
function segAt(p, grid = allBoneGrid) {
  for (const d of [0.02, 0.05, 0.1, 0.2]) {
    const hit = grid.nearest(p, d);
    if (hit) return BONE_SEG[hit.label];
  }
  return 'pelvis';
}

// ------------------------------------------------------------------ muscles
// mode: 'fan' – one mesh spread into n fibres; 'parts' – one fibre per listed part group
const M = (id, parts, origin, insertion, o = {}) => ({ id, parts, origin, insertion, mode: 'parts', vias: 3, ...o });
const RIB_RANGE = (a, b) => RIBS.slice(a - 1, b);
const MUSCLES = [
  M('rectus_abdominis', [['left rectus abdominis']], ['left hip bone'], [...CARTILAGE.slice(4), ...RIB_RANGE(5, 7), 'body of sternum'], { mode: 'fan', fibers: 2, viaSeg: 'spine' }),
  M('external_oblique', [['left external oblique']], RIB_RANGE(5, 12), ['left hip bone'], { mode: 'fan', fibers: 3, viaSeg: 'spine' }),
  M('erector_spinae', [['left longissimus thoracis'], ['left iliocostalis lumborum', 'left iliocostalis thoracis']], ['sacrum', 'left hip bone'], [...THORACIC.slice(0, 8), ...RIB_RANGE(1, 8)], { viaSeg: 'spine', vias: 4 }),
  M('quadratus_lumborum', [['left quadratus lumborum']], ['left hip bone'], ['left twelfth rib'], { viaSeg: 'spine' }),
  M('iliopsoas', [['left psoas major'], ['left iliacus']], [...LUMBAR, 'twelfth thoracic vertebra', 'left hip bone'], ['left femur']),
  M('latissimus_dorsi', [['left latissimus dorsi']], [...THORACIC.slice(6), ...LUMBAR, 'sacrum', 'left hip bone', ...RIB_RANGE(9, 12)], ['left humerus'], { mode: 'fan', fibers: 5 }),
  M('trapezius', [['descending part of left trapezius'], ['transverse part of left trapezius'], ['ascending part of left trapezius']], ['occipital bone', ...CERVICAL, ...THORACIC], ['left clavicle', 'left scapula'], { vias: 2 }),
  M('pectoralis_major', [['clavicular part of left pectoralis major'], ['sternocostal part of left pectoralis major'], ['abdominal part of left pectoralis major']], ['left clavicle', ...STERNUM, ...CARTILAGE, ...RIB_RANGE(1, 7)], ['left humerus'], { vias: 2 }),
  M('pectoralis_minor', [['left pectoralis minor']], RIB_RANGE(2, 6), ['left scapula'], { mode: 'fan', fibers: 2, vias: 2 }),
  M('serratus_anterior', [['left serratus anterior']], RIB_RANGE(1, 9), ['left scapula'], { mode: 'fan', fibers: 4 }),
  M('rhomboids', [['left rhomboid minor'], ['left rhomboid major']], [...CERVICAL, ...THORACIC.slice(0, 6)], ['left scapula'], { vias: 2 }),
  M('levator_scapulae', [['left levator scapulae']], CERVICAL.slice(0, 4), ['left scapula']),
  M('sternocleidomastoid', [['left sternocleidomastoid']], ['manubrium', 'left clavicle'], ['left temporal bone', 'occipital bone']),
  M('deltoid', [['clavicular part of left deltoid'], ['acromial part of left deltoid'], ['spinal part of left deltoid']], ['left clavicle', 'left scapula'], ['left humerus']),
  M('supraspinatus', [['left supraspinatus']], ['left scapula'], ['left humerus']),
  M('infraspinatus', [['left infraspinatus muscle']], ['left scapula'], ['left humerus'], { mode: 'fan', fibers: 2 }),
  M('biceps_brachii', [['long head of left biceps brachii'], ['short head of left biceps brachii']], ['left scapula'], ['left radius', 'left ulna'], { insertAt: 'radialTuber' }),
  M('triceps_brachii', [['long head of left triceps brachii'], ['lateral head of left triceps brachii', 'medial head of left triceps brachii']], ['left scapula', 'left humerus'], ['left ulna']),
  M('forearm_flexors', [['left flexor carpi radialis'], ['humeral head of left flexor carpi ulnaris']], ['left humerus'], HAND),
  M('forearm_extensors', [['left extensor carpi radialis longus'], ['left extensor digitorum']], ['left humerus'], HAND),
  M('gluteus_maximus', [['left gluteus maximus']], ['left hip bone', 'sacrum'], ['left femur'], { mode: 'fan', fibers: 4 }),
  M('gluteus_medius', [['left gluteus medius']], ['left hip bone'], ['left femur'], { mode: 'fan', fibers: 3 }),
  M('piriformis', [['left piriformis']], ['sacrum'], ['left femur']),
  M('tfl_itb', [['left tensor fasciae latae', 'left iliotibial tract']], ['left hip bone'], ['left tibia'], { vias: 4 }),
  M('rectus_femoris', [['left rectus femoris']], ['left hip bone'], ['left patella'], { extraEnd: 'tuberosity' }),
  M('vastus_lateralis', [['left vastus lateralis']], ['left femur'], ['left patella'], { extraEnd: 'tuberosity' }),
  M('vastus_medialis', [['left vastus medialis']], ['left femur'], ['left patella'], { extraEnd: 'tuberosity' }),
  M('hamstrings', [['long head of left biceps femoris'], ['left semitendinosus'], ['left semimembranosus']], ['left hip bone'], ['left tibia', 'left fibula']),
  M('adductors', [['left adductor longus'], ['left adductor brevis'], ['left adductor magnus']], ['left hip bone'], ['left femur']),
  M('sartorius', [['left sartorius']], ['left hip bone'], ['left tibia'], { vias: 5 }),
  // the Achilles tendon is not in BodyParts3D: insert on the calcaneal tuberosity
  M('gastrocnemius', [['medial head of left gastrocnemius'], ['lateral head of left gastrocnemius']], ['left femur'], ['left calcaneus'], { insertAt: 'calcTuber' }),
  M('soleus', [['left soleus']], ['left tibia', 'left fibula'], ['left calcaneus'], { insertAt: 'calcTuber' }),
  M('tibialis_anterior', [['left tibialis anterior']], ['left tibia'], ['left medial cuneiform bone', 'left first metatarsal bone']),
];

const tuberosity = (() => {
  const top = maxOf(tibia.map((p) => p.y));
  return argmax(tibia.filter((p) => p.y < top - 0.035 && p.y > top - 0.075), (p) => p.z);
})();

// Achilles insertion: most posterior point of the middle third of the calcaneus' height
const calcTuber = (() => {
  const c = part('left calcaneus').verts;
  const y0 = minOf(c.map((p) => p.y));
  const h = maxOf(c.map((p) => p.y)) - y0;
  return argmin(c.filter((p) => p.y > y0 + 0.3 * h && p.y < y0 + 0.6 * h), (p) => p.z);
})();
// biceps tendon (not in BodyParts3D): radial tuberosity, 2.5–4.5 cm below the radial head,
// on its anteromedial side
const radialTuber = (() => {
  const r = part('left radius').verts;
  const top = maxOf(r.map((p) => p.y));
  return argmax(r.filter((p) => p.y < top - 0.025 && p.y > top - 0.045), (p) => p.z - p.x);
})();
const INSERT_AT = { calcTuber: { p: calcTuber, seg: 'ankle' }, radialTuber: { p: radialTuber, seg: 'elbow' } };

/**
 * Attachment regions of one muscle mesh: vertices near the origin (insertion) bones in
 * the first (last) part of the muscle along its long axis.
 */
function attachments(verts, originBones, insertionBones) {
  const gO = gridOf(originBones);
  const gI = gridOf(insertionBones);
  const oC = centroid(vertsOf(originBones).filter((_, i) => i % 7 === 0));
  const iC = centroid(vertsOf(insertionBones).filter((_, i) => i % 7 === 0));
  const ax = principalAxis(verts);
  if (ax.dir.dot(iC.clone().sub(oC)) < 0) ax.dir.negate();
  const t = verts.map((p) => p.clone().sub(ax.mean).dot(ax.dir));
  const tMin = minOf(t);
  const tMax = maxOf(t);
  const u = t.map((x) => (x - tMin) / (tMax - tMin || 1));
  const region = (grid, bones, atStart) => {
    const pick = (x, f) => (atStart ? x <= f : x >= 1 - f);
    for (const [d, frac] of [[0.004, 0.35], [0.007, 0.45], [0.012, 0.6]]) {
      const pts = [];
      verts.forEach((p, i) => {
        if (!pick(u[i], frac)) return;
        const hit = grid.nearest(p, d);
        if (hit) pts.push({ p, bone: hit.label });
      });
      if (pts.length >= 6) return pts;
    }
    // tendon gap (e.g. Achilles tendon): bone point nearest to the muscle's end
    let end = 0;
    u.forEach((x, i) => {
      if (atStart ? x < u[end] : x > u[end]) end = i;
    });
    const hit = grid.nearest(verts[end], 0.25);
    if (hit) return [{ p: hit.p, bone: hit.label, tendon: true }];
    return [{ p: centroid(vertsOf(bones)), bone: bones[0], tendon: true }];
  };
  const O = region(gO, originBones, true);
  const I = region(gI, insertionBones, false);
  return { O, I };
}

/** splits attachment points into n bins along the principal axis of `ref` */
function bins(pts, n, axis) {
  if (n === 1) return [pts];
  const s = pts.map((q) => ({ q, t: q.p.clone().dot(axis) })).sort((a, b) => a.t - b.t);
  return Array.from({ length: n }, (_, i) => s.slice(Math.floor((i * s.length) / n), Math.max(Math.floor(((i + 1) * s.length) / n), Math.floor((i * s.length) / n) + 1)).map((e) => e.q));
}
const majority = (arr) => {
  const c = {};
  for (const a of arr) c[a] = (c[a] || 0) + 1;
  return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
};

function buildMuscle(def) {
  const groups = def.parts.map((g) => g.flatMap((n) => part(n).verts));
  const fibres = []; // { o:{p,seg}, i:{p,seg}, vias:[{p,seg}], r }
  const makeFibres = (verts, n) => {
    const { O, I } = attachments(verts, def.origin, def.insertion);
    const Oc = centroid(O.map((q) => q.p));
    const Ic = centroid(I.map((q) => q.p));
    const axis = principalAxis(O.length > 3 ? O.map((q) => q.p) : verts).dir;
    const oBins = bins(O, n, axis);
    const iBins = bins(I, n, axis);
    // cross-sections along the origin → insertion line
    const L = Ic.clone().sub(Oc);
    const len2 = L.lengthSq();
    const tv = verts.map((p) => p.clone().sub(Oc).dot(L) / len2);
    const vias = [];
    let rSum = 0;
    let rN = 0;
    for (let k = 1; k <= def.vias; k++) {
      const t = k / (def.vias + 1);
      const sl = verts.filter((_, i) => Math.abs(tv[i] - t) < 0.5 / (def.vias + 1) * 0.6);
      const base = Oc.clone().lerp(Ic, t);
      if (sl.length < 10) {
        vias.push({ t, off: V() });
        continue;
      }
      const c = centroid(sl);
      const rad = sl.reduce((a, p) => a + p.distanceTo(c), 0) / sl.length;
      rSum += rad;
      rN++;
      vias.push({ t, off: c.sub(base) });
    }
    const r = rN ? (rSum / rN) * 0.8 : 0.01;
    for (let f = 0; f < n; f++) {
      const o = centroid(oBins[f].map((q) => q.p));
      const i = centroid(iBins[f].map((q) => q.p));
      fibres.push({
        o: { p: o, seg: BONE_SEG[majority(oBins[f].map((q) => q.bone))] },
        i: def.insertAt ? INSERT_AT[def.insertAt] : { p: i, seg: BONE_SEG[majority(iBins[f].map((q) => q.bone))] },
        vias: vias.map((v) => {
          const p = o.clone().lerp(i, v.t).add(v.off);
          return { p, seg: def.viaSeg === 'spine' ? segAt(p, spineGrid) : segAt(p) };
        }),
        r: n > 1 ? r / Math.sqrt(n) * 1.3 : r,
        tendon: !!(oBins[f][0].tendon || iBins[f][0].tendon),
      });
    }
  };
  if (def.mode === 'fan') makeFibres(groups.flat(), def.fibers);
  else for (const g of groups) makeFibres(g, 1);

  const stations = [];
  const nSt = fibres[0].vias.length + 2 + (def.extraEnd ? 1 : 0);
  for (let s = 0; s < nSt; s++) {
    stations.push(
      fibres.map((fb) => {
        let q;
        if (s === 0) q = fb.o;
        else if (s <= fb.vias.length) q = fb.vias[s - 1];
        else if (s === fb.vias.length + 1) q = fb.i;
        else q = { p: tuberosity, seg: 'knee' };
        const out = X(q.p, q.seg);
        return [q.seg, [+out.x.toFixed(4), +out.y.toFixed(4), +out.z.toFixed(4)]];
      }),
    );
  }
  const rs = fibres.map((fb) => +Math.min(0.035, Math.max(0.006, fb.r)).toFixed(4));
  return { id: def.id, fibers: fibres.length, r: +maxOf(rs).toFixed(4), rs, stations, tendon: fibres.some((f) => f.tendon) };
}

log('analysing muscles …');
const muscles = [];
for (const def of MUSCLES) {
  const m = buildMuscle(def);
  muscles.push(m);
  log(`  ${def.id.padEnd(20)} fibres ${m.fibers}  r ${(m.r * 1000).toFixed(0)} mm  ${m.stations[0].map((s) => s[0]).join('/')} → ${m.stations[m.stations.length - 1].map((s) => s[0]).join('/')}${m.tendon ? '  (tendon gap bridged)' : ''}`);
}

// ------------------------------------------------------------------ contacts (floor)
const P = (name) => part(name).verts;
const low = (pts, dy = 0.004) => {
  const m = minOf(pts.map((p) => p.y));
  return pts.filter((p) => p.y < m + dy);
};
const calc = P('left calcaneus');
const calcLow = low(calc, 0.008);
const met = (k) => P(`left ${ORD[k - 1]} metatarsal bone`);
const metHead = (k) => argmin(met(k).filter((p) => p.z > maxOf(met(k).map((q) => q.z)) - 0.015), (p) => p.y);
const muscleVerts = (n) => P(n);
const atY = (pts, y, dy = 0.02) => pts.filter((p) => Math.abs(p.y - y) < dy);
const kneeY = J.knee.y;
const hipY = J.hip.y;
const midThigh = (hipY + kneeY) / 2;
const midShin = (kneeY + J.ankle.y) / 2;
const contactsRaw = [
  // [seg, point (scan space), radius (soft tissue), mirrored]
  ['ankle', argmin(calc, (p) => p.z * 3 + p.y), 0.012, true], // heel
  ['ankle', argmin(calcLow, (p) => p.x), 0.012, true], // heel medial
  ['ankle', argmax(calcLow, (p) => p.x), 0.012, true], // heel lateral
  ['ankle', argmax(P('distal phalanx of left big toe'), (p) => p.z), 0.006, true], // big-toe tip
  ['ankle', metHead(1), 0.01, true], // ball of big toe
  ['ankle', metHead(2), 0.01, true], // ball of foot
  ['ankle', metHead(5), 0.01, true], // ball of little toe
  ['ankle', argmax(vertsOf(['navicular bone of left foot', 'left intermediate cuneiform bone']), (p) => p.y), 0.012, true], // top of foot
  ['ankle', argmax(met(2), (p) => p.y * 0.3 + p.z * 0.2), 0.008, true], // top of forefoot
  ['knee', tuberosity, 0.012, true], // kneeling point
  ['hip', argmax(P('left patella'), (p) => p.z), 0.008, true], // knee cap
  ['knee', argmax(atY(tibia, midShin), (p) => p.z), 0.006, true], // shin
  ['hip', argmin(atY(muscleVerts('long head of left biceps femoris'), midThigh, 0.03), (p) => p.z), 0.0, true], // back of thigh
  ['hip', argmax(atY(muscleVerts('left rectus femoris'), midThigh, 0.03), (p) => p.z), 0.0, true], // front of thigh
  ['wrist', argmin(P('distal phalanx of left middle finger'), (p) => p.y), 0.004, true], // finger tip
  ['wrist', argmax(P('left pisiform'), (p) => p.z), 0.014, true], // heel of hand (ulnar)
  ['wrist', argmax(P('left scaphoid'), (p) => p.z), 0.014, true], // heel of hand (radial)
  ['wrist', argmax(P('left second metacarpal bone').filter((p) => p.y < minOf(P('left second metacarpal bone').map((q) => q.y)) + 0.012), (p) => p.z), 0.01, true],
  ['wrist', argmax(P('left fifth metacarpal bone').filter((p) => p.y < minOf(P('left fifth metacarpal bone').map((q) => q.y)) + 0.012), (p) => p.z), 0.01, true],
  ['elbow', argmin(ulna.filter((p) => p.y > maxOf(ulna.map((q) => q.y)) - 0.03), (p) => p.z), 0.008, true], // olecranon
  ['elbow', argmin(atY(ulna, (J.elbow.y + J.wrist.y) / 2, 0.02), (p) => p.z), 0.012, true], // forearm
  ['scapula', argmin(P('left scapula'), (p) => p.z), 0.012, true], // shoulder blade
  ['pelvis', argmin(P('left hip bone'), (p) => p.y), 0.018, true], // sit bone
  ['pelvis', argmin(P('left gluteus maximus'), (p) => p.z), 0.0, true], // buttock
  ['pelvis', argmin(P('sacrum'), (p) => p.z), 0.01, false], // sacrum
  ['pelvis', argmax(P('left hip bone').filter((p) => p.x < 0.02), (p) => p.z), 0.015, true], // pubis
  ['lumbar', argmax(atY(P('left rectus abdominis'), disk('L3').y, 0.02), (p) => p.z), 0.0, true], // belly
  ['thorax', argmin(P('eighth thoracic vertebra'), (p) => p.z), 0.01, false], // mid back
  ['thorax', argmax(P('body of sternum'), (p) => p.z), 0.01, false], // chest
  ['head', argmin(P('occipital bone'), (p) => p.z), 0.006, false], // back of head
  ['head', argmax(P('frontal bone'), (p) => p.z * 2 + p.y), 0.006, false], // forehead
  ['head', argmax(P('left parietal bone'), (p) => p.y), 0.006, false], // crown
];
const contacts = contactsRaw.map(([seg, p, r, mirror]) => {
  const q = X(p, seg);
  if (!mirror) q.x = 0;
  return { seg, p: q.toArray().map((v) => +v.toFixed(4)), r, mirror };
});

// ------------------------------------------------------------------ landmarks (de Leva endpoints)
const skullTop = argmax(P('left parietal bone'), (p) => p.y);
skullTop.x = 0;
const xiphoid = argmin(P('body of sternum'), (p) => p.y);
const spineDepth = (y) => {
  // points on the trunk axis ~4.5 cm in front of the vertebral bodies
  const d = [disk('C7T1'), disk('T12L1'), disk('L3'), disk('L5S1')];
  const z = d.reduce((best, q) => (Math.abs(q.y - y) < Math.abs(best.y - y) ? q : best), d[0]).z;
  return z + 0.045;
};
const at = (y) => V(0, y, spineDepth(y));
const met3 = argmin(P('left third metacarpal bone'), (p) => p.y);
const heelBack = argmin(calc, (p) => p.z);
const toeTip = argmax(P('distal phalanx of left second toe'), (p) => p.z);
const navelY = disk('L3').y;
const LM = {
  head: [skullTop, J.neck, 'head'],
  upper_trunk: [at(J.neck.y), at(xiphoid.y), 'thorax'],
  middle_trunk: [at(xiphoid.y), at(navelY), 'lumbar'],
  lower_trunk: [at(navelY), V(0, J.hip.y, J.hip.z), 'pelvis'],
  upper_arm: [J.shoulder, hum.elbow, 'shoulder'],
  forearm: [hum.elbow, wrist, 'elbow'],
  hand: [wrist, met3, 'wrist'],
  thigh: [J.hip, J.knee, 'hip'],
  shank: [J.knee, latMall, 'knee'],
  foot: [V(heelBack.x, heelBack.y + 0.03, heelBack.z), V(toeTip.x, heelBack.y + 0.03, toeTip.z), 'ankle'],
};
const landmarks = Object.fromEntries(
  Object.entries(LM).map(([k, [a, b, seg]]) => [k, { prox: X(a, seg).toArray().map((v) => +v.toFixed(4)), dist: X(b, seg).toArray().map((v) => +v.toFixed(4)) }]),
);

// ------------------------------------------------------------------ joint markers
const sacrumGrid = gridOf(['left hip bone'], 0.006);
const siPts = P('sacrum').filter((p) => p.x > 0 && sacrumGrid.nearest(p, 0.004));
const si = siPts.length ? centroid(siPts) : V(0.04, J.lumbar.y - 0.05, J.lumbar.z);
const pubisPts = P('left hip bone').filter((p) => p.x < 0.012);
const pubis = centroid(pubisPts);
pubis.x = 0;
const scapC = centroid(P('left scapula'));
const markers = [
  ['lumbar', 'lumbar_spine_joint', 0.02, J.lumbar, false],
  ['thorax', 'thoracic_spine_joint', 0.018, J.thorax, false],
  ['neck', 'cervical_spine_joint', 0.015, J.neck, false],
  ['head', 'atlanto_occipital', 0.014, J.head, false],
  ['scapula', 'scapulothoracic', 0.016, scapC, true],
  ['scapula', 'sternoclavicular', 0.012, J.scapula, true],
  ['shoulder', 'glenohumeral', hum.head.r * 1.15, J.shoulder, true],
  ['elbow', 'elbow', 0.022, hum.elbow, true],
  ['wrist', 'wrist', 0.018, wrist, true],
  ['pelvis', 'sacroiliac', 0.016, si, true],
  ['pelvis', 'pubic_symphysis', 0.012, pubis, false],
  ['hip', 'hip', fem.head.r * 1.15, J.hip, true],
  ['knee', 'knee', 0.03, fem.knee, true],
  ['ankle', 'ankle', 0.022, ankle, true],
].map(([seg, id, r, p, mirror]) => ({ seg, id, r: +r.toFixed(4), p: X(p, seg).toArray().map((v) => +v.toFixed(4)), mirror }));

// ------------------------------------------------------------------ bone meshes
/** vertex clustering: snap vertices to a grid of cell h and drop degenerate triangles */
function cluster(verts, index, h) {
  const map = new Map();
  const out = [];
  const acc = [];
  const remap = new Int32Array(verts.length);
  verts.forEach((p, i) => {
    const k = `${Math.floor(p.x / h)},${Math.floor(p.y / h)},${Math.floor(p.z / h)}`;
    let j = map.get(k);
    if (j === undefined) {
      j = out.length;
      map.set(k, j);
      out.push(V());
      acc.push(0);
    }
    out[j].add(p);
    acc[j]++;
    remap[i] = j;
  });
  out.forEach((p, j) => p.multiplyScalar(1 / acc[j]));
  const tris = [];
  const seen = new Set();
  for (let t = 0; t < index.length; t += 3) {
    const a = remap[index[t]];
    const b = remap[index[t + 1]];
    const c = remap[index[t + 2]];
    if (a === b || b === c || a === c) continue;
    const key = [a, b, c].sort((x, y) => x - y).join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    tris.push(a, b, c);
  }
  return { verts: out, index: tris };
}
function simplify(pt, target) {
  if (pt.tris <= target) return { verts: pt.verts, index: Array.from(pt.index) };
  let lo = 0.0003;
  let hi = 0.02;
  let best = null;
  for (let i = 0; i < 18; i++) {
    const h = Math.sqrt(lo * hi);
    const r = cluster(pt.verts, pt.index, h);
    if (r.index.length / 3 > target) lo = h;
    else {
      hi = h;
      best = r;
    }
  }
  return best || cluster(pt.verts, pt.index, hi);
}

log('simplifying bone meshes …');
const BUDGET = 90000; // triangles for the left side + midline (the right side is mirrored at runtime)
const displayParts = [];
for (const [names, seg, id, mirror] of BONE_GROUPS) for (const n of names) displayParts.push({ name: n, seg, id, mirror });
const totalTris = displayParts.reduce((a, d) => a + part(d.name).tris, 0);
const chunks = [];
const meshIndex = [];
let offset = 0;
let outTris = 0;
for (const d of displayParts) {
  const pt = part(d.name);
  const target = Math.max(100, Math.min(4000, Math.round((pt.tris / totalTris) * BUDGET * 1.6)));
  const s = simplify(pt, target);
  const vs = s.verts.map((p) => X(p, d.seg));
  const box = bbox(vs);
  const q = new Uint16Array(vs.length * 3);
  vs.forEach((p, i) => {
    for (let k = 0; k < 3; k++) {
      const lo = box.min.getComponent(k);
      const hi = box.max.getComponent(k);
      q[i * 3 + k] = Math.round(((p.getComponent(k) - lo) / (hi - lo || 1)) * 65535);
    }
  });
  const idx32 = vs.length > 65535;
  const index = idx32 ? Uint32Array.from(s.index) : Uint16Array.from(s.index);
  let buf = Buffer.concat([Buffer.from(q.buffer), Buffer.from(index.buffer)]);
  if (buf.length % 4) buf = Buffer.concat([buf, Buffer.alloc(4 - (buf.length % 4))]);
  chunks.push(buf);
  meshIndex.push({
    name: d.name, fma: pt.id, seg: d.seg, id: d.id, mirror: d.mirror,
    offset, vertices: vs.length, indices: index.length, index32: idx32,
    min: box.min.toArray().map((v) => +v.toFixed(5)), max: box.max.toArray().map((v) => +v.toFixed(5)),
  });
  offset += buf.length;
  outTris += index.length / 3;
}
mkdirSync(new URL('public/models/bp3d/', ROOT), { recursive: true });
writeFileSync(new URL('public/models/bp3d/skeleton.bin', ROOT), Buffer.concat(chunks));
log(`bones: ${displayParts.length} parts, ${totalTris} → ${outTris} triangles, ${(offset / 1024).toFixed(0)} KB`);

// ------------------------------------------------------------------ report + write
const stature = maxOf(P('left parietal bone').map((p) => p.y)) - floorY;
const measurements = {
  statureM: +stature.toFixed(3),
  femoralHead: { radiusMm: +(fem.head.r * 1000).toFixed(1), rmsMm: +(fem.head.rms * 1000).toFixed(2), acetabulumOffsetMm: +(acet.c.distanceTo(fem.head.c) * 1000).toFixed(1) },
  humeralHead: { radiusMm: +(hum.head.r * 1000).toFixed(1), rmsMm: +(hum.head.rms * 1000).toFixed(2), glenoidOffsetMm: glenoid ? +(glenoid.c.distanceTo(hum.head.c) * 1000).toFixed(1) : null },
  condyleRadiiMm: [+(fem.med.r * 1000).toFixed(1), +(fem.lat.r * 1000).toFixed(1)],
  armAbductionInScanDeg: +deg(armAbd).toFixed(1),
  segmentLengthsMm: {
    thigh: +(J.hip.distanceTo(J.knee) * 1000).toFixed(0),
    shank: +(J.knee.distanceTo(J.ankle) * 1000).toFixed(0),
    upperArm: +(J.shoulder.distanceTo(J.elbow) * 1000).toFixed(0),
    forearm: +(J.elbow.distanceTo(J.wrist) * 1000).toFixed(0),
    hipWidth: +(2 * Math.abs(J.hip.x) * 1000).toFixed(0),
    shoulderWidth: +(2 * Math.abs(J.shoulder.x) * 1000).toFixed(0),
  },
};
log('measurements', JSON.stringify(measurements));
for (const [k, v] of Object.entries(jointOut)) log(`  joint ${k.padEnd(9)} ${v.toArray().map((x) => (x * 1000).toFixed(0)).join(', ')} mm`);

const r4 = (v) => v.toArray().map((x) => +x.toFixed(4));
const model = {
  source: 'BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution-Share Alike 2.1 Japan',
  license: 'CC BY-SA 2.1 JP',
  measurements,
  joints: Object.fromEntries(Object.entries(jointOut).map(([k, v]) => [k, r4(v)])),
  contacts,
  landmarks,
  markers,
  muscles,
  meshes: meshIndex,
};
writeFileSync(
  new URL('src/data/body-model.gen.js', ROOT),
  `// GENERATED by tools/bp3d-build.mjs from BodyParts3D (CC BY-SA 2.1 JP) – do not edit by hand.\n// Coordinates: metres, rest pose, left = +X, up = +Y, anterior = +Z, floor y = 0.\nexport const MODEL = ${JSON.stringify(model)};\n`,
);
log('wrote src/data/body-model.gen.js');
