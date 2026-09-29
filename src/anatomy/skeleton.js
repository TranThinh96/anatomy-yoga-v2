import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);
const V = (a) => new THREE.Vector3(...a);

export const BONE_COLOR = new THREE.Color('#e9dfc8');

function boneMaterial() {
  return new THREE.MeshStandardMaterial({
    color: BONE_COLOR,
    roughness: 0.62,
    metalness: 0.0,
    emissive: new THREE.Color(0x000000),
  });
}

/** Lathe "long bone" from a to b with knobbly ends. */
function longBoneGeo(len, r, r0 = r * 1.8, r1 = r * 1.8) {
  const prof = [
    [0.0, 0.0],
    [r0 * 0.75, 0.01],
    [r0, 0.045],
    [r0 * 0.9, 0.09],
    [r * 1.15, 0.2],
    [r, 0.35],
    [r * 0.95, 0.5],
    [r, 0.65],
    [r * 1.15, 0.8],
    [r1 * 0.9, 0.91],
    [r1, 0.955],
    [r1 * 0.75, 0.99],
    [0.0, 1.0],
  ].map(([x, y]) => new THREE.Vector2(x, y * len));
  return new THREE.LatheGeometry(prof, 14);
}

function orientBetween(mesh, a, b) {
  const dir = new THREE.Vector3().subVectors(b, a);
  mesh.position.copy(a);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  return mesh;
}

export function buildSkeleton(rig) {
  const meshes = [];
  const add = (seg, id, geo, pos, opts = {}) => {
    const m = new THREE.Mesh(geo, boneMaterial());
    if (opts.quat) m.quaternion.copy(opts.quat);
    if (opts.scale) m.scale.set(...opts.scale);
    m.position.copy(pos);
    m.userData = { kind: 'bone', id, side: opts.side || 0 };
    m.castShadow = true;
    rig.attach(seg, m);
    meshes.push(m);
    return m;
  };
  const long = (seg, id, a, b, r, r0, r1, side) => {
    const A = V(a);
    const B = V(b);
    const geo = longBoneGeo(A.distanceTo(B), r, r0, r1);
    const tmp = orientBetween(new THREE.Object3D(), A, B);
    return add(seg, id, geo, A, { quat: tmp.quaternion, side });
  };
  const ellipsoid = (seg, id, c, s, side, seg2 = 16) =>
    add(seg, id, new THREE.SphereGeometry(1, seg2, Math.round(seg2 * 0.75)), V(c), { scale: s, side });
  const tube = (seg, id, pts, r, side, closed = false) => {
    const curve = new THREE.CatmullRomCurve3(pts.map(V), closed);
    return add(seg, id, new THREE.TubeGeometry(curve, 24, r, 6, closed), new THREE.Vector3(), { side });
  };

  // ---------- Skull ----------
  ellipsoid('head', 'skull', [0, 1.675, -0.005], [0.078, 0.092, 0.1], 0, 24);
  ellipsoid('head', 'skull', [0, 1.615, 0.05], [0.058, 0.05, 0.055], 0, 16); // maxilla/face
  // mandible as a curved tube
  tube('head', 'skull', [
    [0.055, 1.62, -0.01], [0.052, 1.57, 0.02], [0.03, 1.55, 0.075], [0, 1.548, 0.09],
    [-0.03, 1.55, 0.075], [-0.052, 1.57, 0.02], [-0.055, 1.62, -0.01],
  ], 0.011, 0);
  for (const s of [1, -1]) {
    // orbits (eye sockets) – darker insets
    const orb = ellipsoid('head', 'skull', [0.03 * s, 1.675, 0.078], [0.021, 0.018, 0.012], 0, 12);
    orb.material.color.set('#5a4d3f');
    orb.userData.baseColor = '#5a4d3f';
    // cheekbone
    tube('head', 'skull', [[0.03 * s, 1.645, 0.085], [0.062 * s, 1.64, 0.05], [0.07 * s, 1.645, 0.0]], 0.008, 0);
  }

  // ---------- Spine ----------
  const vert = (seg, id, y0, y1, n, z0, z1, r0, r1, curve = 0) => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const y = y0 + (y1 - y0) * t;
      const z = z0 + (z1 - z0) * t + curve * Math.sin(Math.PI * t);
      const r = r0 + (r1 - r0) * t;
      const h = ((y1 - y0) / n) * 0.62;
      add(seg, id, new THREE.CylinderGeometry(r, r, h, 12), V([0, y, z]));
      // spinous process
      const sp = add(seg, id, new THREE.BoxGeometry(r * 0.35, h * 0.9, r * 1.7), V([0, y - h * 0.3, z - r * 1.5]));
      sp.rotation.x = 0.5;
      // transverse processes
      add(seg, id, new THREE.BoxGeometry(r * 2.8, h * 0.5, r * 0.4), V([0, y, z - r * 0.6]));
    }
  };
  vert('lumbar', 'lumbar_spine', 1.035, 1.2, 5, -0.05, -0.06, 0.024, 0.021, 0.015);
  vert('thorax', 'thoracic_spine', 1.2, 1.47, 12, -0.06, -0.065, 0.018, 0.014, -0.02);
  vert('neck', 'cervical_spine', 1.47, 1.58, 7, -0.06, -0.035, 0.013, 0.011, 0.012);

  // ---------- Rib cage ----------
  for (let i = 0; i < 12; i++) {
    const y = 1.44 - i * 0.021;
    const k = Math.sin(((i + 2.2) / 13) * Math.PI * 0.72); // width profile
    const w = 0.065 + 0.085 * k;
    const d = 0.06 + 0.045 * k;
    const drop = 0.03 + i * 0.006;
    const floating = i >= 10;
    for (const s of [1, -1]) {
      const pts = [
        [0.012 * s, y, -0.065],
        [w * 0.55 * s, y + 0.005, -0.1],
        [w * s, y - drop * 0.3, -0.035],
        [w * 0.95 * s, y - drop * 0.65, 0.035],
      ];
      if (!floating) {
        pts.push([w * 0.55 * s, y - drop, d + 0.02]);
        pts.push([0.02 * s, y - drop * 1.1 - (i > 6 ? (i - 6) * 0.01 : 0), d + 0.035]);
      }
      tube('thorax', 'ribcage', pts, 0.0055, 0);
    }
  }
  // sternum
  add('thorax', 'sternum', new THREE.BoxGeometry(0.035, 0.17, 0.012), V([0, 1.335, 0.105]), {}).rotation.x = -0.18;

  // ---------- Shoulder girdle ----------
  for (const [s, side] of [[1, 'L'], [-1, 'R']]) {
    const seg = `scapula_${side}`;
    tube(seg, 'clavicle', [[0.02 * s, 1.43, 0.085], [0.07 * s, 1.445, 0.075], [0.13 * s, 1.455, 0.035], [0.17 * s, 1.46, -0.01]], 0.008, s);
    // scapula: triangle plate on the back
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); // superior angle
    shape.lineTo(0.105, -0.03); // glenoid side (lateral)
    shape.lineTo(0.02, -0.16); // inferior angle
    shape.lineTo(-0.005, -0.08);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 1 });
    const sc = add(seg, 'scapula', geo, V([0.075 * s, 1.44, -0.1]), { side: s });
    sc.rotation.y = s > 0 ? -0.35 : Math.PI + 0.35;
    // spine of scapula and acromion
    tube(seg, 'scapula', [[0.08 * s, 1.415, -0.105], [0.14 * s, 1.43, -0.085], [0.175 * s, 1.455, -0.04], [0.172 * s, 1.462, -0.005]], 0.007, s);
    // glenoid
    ellipsoid(seg, 'scapula', [0.172 * s, 1.4, -0.03], [0.012, 0.022, 0.018], s);
    // coracoid
    tube(seg, 'scapula', [[0.15 * s, 1.425, -0.02], [0.155 * s, 1.425, 0.02], [0.145 * s, 1.41, 0.035]], 0.006, s);
  }

  // ---------- Arms ----------
  for (const [s, side] of [[1, 'L'], [-1, 'R']]) {
    ellipsoid(`shoulder_${side}`, 'humerus', [0.195 * s, 1.4, -0.015], [0.026, 0.026, 0.026], s);
    long(`shoulder_${side}`, 'humerus', [0.2 * s, 1.39, -0.015], [0.2 * s, 1.1, -0.02], 0.011, 0.02, 0.026, s);
    // forearm: radius (thumb side, lateral) and ulna (medial)
    long(`elbow_${side}`, 'radius_ulna', [0.215 * s, 1.095, -0.015], [0.228 * s, 0.84, 0.0], 0.0075, 0.011, 0.016, s);
    long(`elbow_${side}`, 'radius_ulna', [0.188 * s, 1.11, -0.035], [0.195 * s, 0.84, -0.005], 0.0072, 0.015, 0.01, s);
    // hand: palm faces +Z (anatomical position), thumb lateral
    add(`wrist_${side}`, 'hand', new THREE.BoxGeometry(0.05, 0.03, 0.022), V([0.21 * s, 0.825, 0.0]), { side: s });
    for (let f = 0; f < 4; f++) {
      const x = (0.192 + f * 0.012) * s;
      const len = [0.16, 0.175, 0.17, 0.145][3 - f];
      long(`wrist_${side}`, 'hand', [x, 0.81, 0.0], [x, 0.81 - len, 0.008], 0.0045, 0.006, 0.005, s);
    }
    long(`wrist_${side}`, 'hand', [0.23 * s, 0.82, 0.008], [0.255 * s, 0.73, 0.03], 0.005, 0.007, 0.005, s); // thumb
  }

  // ---------- Pelvis ----------
  for (const s of [1, -1]) {
    // ilium: curved wing opening forward, from the sacrum round to the ASIS
    const D2R = Math.PI / 180;
    const wing = new THREE.SphereGeometry(1, 22, 10, 130 * D2R, 165 * D2R, Math.PI * 0.2, Math.PI * 0.34);
    const w = add('pelvis', 'pelvis', wing, V([0.045 * s, 0.955, -0.02]), { scale: [0.1 * s, 0.125, 0.085] });
    w.material.side = THREE.DoubleSide;
    // iliac crest rim
    tube('pelvis', 'pelvis', [[0.05 * s, 1.02, -0.085], [0.11 * s, 1.06, -0.06], [0.145 * s, 1.065, 0.0], [0.13 * s, 1.03, 0.065]], 0.009, 0);
    // pubic ramus, ischium ring (obturator)
    tube('pelvis', 'pelvis', [[0.12 * s, 1.015, 0.07], [0.1 * s, 0.97, 0.04], [0.075 * s, 0.93, 0.035], [0.02 * s, 0.9, 0.075], [0.05 * s, 0.86, 0.02], [0.065 * s, 0.87, -0.045], [0.09 * s, 0.93, -0.035], [0.1 * s, 0.97, 0.02]], 0.011, 0);
    // acetabulum
    ellipsoid('pelvis', 'pelvis', [0.1 * s, 0.93, 0.0], [0.025, 0.028, 0.028], 0);
    // ischial tuberosity
    ellipsoid('pelvis', 'pelvis', [0.063 * s, 0.868, -0.045], [0.014, 0.016, 0.02], 0);
    // sacro-iliac joint area
    ellipsoid('pelvis', 'pelvis', [0.045 * s, 1.0, -0.075], [0.018, 0.035, 0.018], 0);
  }
  // sacrum + coccyx
  const sac = add('pelvis', 'sacrum', new THREE.ConeGeometry(0.048, 0.13, 10, 1), V([0, 0.965, -0.08]));
  sac.rotation.x = Math.PI + 0.45;
  sac.scale.z = 0.5;
  long('pelvis', 'sacrum', [0, 0.91, -0.085], [0, 0.88, -0.07], 0.005, 0.007, 0.004);

  // ---------- Legs ----------
  for (const [s, side] of [[1, 'L'], [-1, 'R']]) {
    const hip = `hip_${side}`;
    const knee = `knee_${side}`;
    const ankle = `ankle_${side}`;
    // femur head, neck, greater trochanter, shaft, condyles
    ellipsoid(hip, 'femur', [0.09 * s, 0.93, 0.0], [0.024, 0.024, 0.024], s);
    long(hip, 'femur', [0.09 * s, 0.93, 0.0], [0.145 * s, 0.9, -0.01], 0.013, 0.013, 0.02, s);
    ellipsoid(hip, 'femur', [0.155 * s, 0.915, -0.012], [0.02, 0.028, 0.022], s);
    long(hip, 'femur', [0.14 * s, 0.9, -0.01], [0.1 * s, 0.53, 0.0], 0.0145, 0.02, 0.022, s);
    ellipsoid(hip, 'femur', [0.075 * s, 0.515, -0.005], [0.02, 0.022, 0.03], s);
    ellipsoid(hip, 'femur', [0.118 * s, 0.515, -0.005], [0.02, 0.022, 0.03], s);
    // patella
    ellipsoid(hip, 'patella', [0.097 * s, 0.525, 0.045], [0.02, 0.024, 0.01], s);
    // tibia (with plateau) and fibula
    ellipsoid(knee, 'tibia_fibula', [0.095 * s, 0.485, 0.0], [0.042, 0.016, 0.032], s);
    long(knee, 'tibia_fibula', [0.095 * s, 0.48, 0.005], [0.085 * s, 0.1, -0.005], 0.0135, 0.03, 0.02, s);
    long(knee, 'tibia_fibula', [0.132 * s, 0.46, -0.012], [0.125 * s, 0.085, -0.015], 0.0055, 0.01, 0.011, s);
    ellipsoid(knee, 'tibia_fibula', [0.085 * s, 0.525 - 0.075, 0.035], [0.012, 0.018, 0.01], s); // tibial tuberosity
    // foot
    ellipsoid(ankle, 'foot', [0.09 * s, 0.07, -0.01], [0.022, 0.018, 0.028], s); // talus
    ellipsoid(ankle, 'foot', [0.09 * s, 0.04, -0.045], [0.02, 0.028, 0.035], s); // calcaneus
    ellipsoid(ankle, 'foot', [0.085 * s, 0.055, 0.035], [0.03, 0.017, 0.028], s); // tarsals
    for (let t = 0; t < 5; t++) {
      const x0 = (0.07 + t * 0.011) * s;
      const x1 = (0.07 + t * 0.017) * s;
      const len = [0.1, 0.095, 0.09, 0.085, 0.075][t];
      long(ankle, 'foot', [x0, 0.05, 0.05], [x1 + 0.002 * s, 0.02, 0.05 + len], t === 0 ? 0.0065 : 0.0045, 0.007, 0.007, s);
      long(ankle, 'foot', [x1 + 0.002 * s, 0.02, 0.05 + len], [x1 + 0.004 * s, 0.012, 0.075 + len * 0.9 - t * 0.004], t === 0 ? 0.006 : 0.0038, 0.006, 0.005, s);
    }
  }
  return meshes;
}
