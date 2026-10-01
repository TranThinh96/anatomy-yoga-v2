// Joint angles (degrees) for every pose. See semanticToQuat() in rig.js for
// the meaning and sign of each angle. Keys without a side (e.g. "hip") apply to
// both sides; keys with _L / _R refine one side (the model's own left/right).

const ARMS_DOWN = { shoulder: { abd: 6 } };

export const POSES = {
  // ---------------- Base positions ----------------
  tadasana: { ...ARMS_DOWN, ankle: { dorsi: 0 } },
  dandasana: {
    hip: { flex: 90 },
    ankle: { dorsi: 1 },
    lumbar: { flex: -4 },
    shoulder: { flex: -12, abd: 10 },
    wrist: { ext: 80 },
  },
  // Dandasana with the hands just lifted off the floor (elbows soft, palms still facing down):
  // the step before leaning back into Navasana. Going there directly, the wrist straightening from
  // 80° drives the fingers into the floor and props the body up off the sit bones.
  dandasana_hands_up: {
    hip: { flex: 90 },
    ankle: { dorsi: 1 },
    lumbar: { flex: -4 },
    shoulder: { flex: -30, abd: 10 },
    elbow: { flex: 75 },
    wrist: { ext: 90 },
  },
  supine: {
    root: { pitch: -90 },
    shoulder: { abd: 18 },
    ankle: { dorsi: -30 },
    hip: { rot: 15 },
  },
  supine_knees: {
    root: { pitch: -90 },
    hip: { flex: 47 },
    knee: { flex: 103 },
    ankle: { dorsi: 9 },
    shoulder: { abd: 14, rot: -80 },
  },
  prone: {
    root: { pitch: 86 },
    ankle: { dorsi: -51 },
    shoulder: { abd: 12, rot: -80 },
    neck: { flex: -10 },
  },
  prone_hands: {
    root: { pitch: 77 },
    ankle: { dorsi: -36 },
    shoulder: { flex: -58, abd: 12 },
    elbow: { flex: 135 },
    wrist: { ext: 70, pron: 180 },
    neck: { flex: -6 },
    hip: { flex: -13 },
    lumbar: { flex: 4 },
  },
  tabletop: {
    root: { pitch: 78 },
    hip: { flex: 83 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    shoulder: { flex: 75 },
    wrist: { ext: 101, pron: 180 },
    neck: { flex: -10 },
    head: { flex: -10 },
  },
  kneeling: {
    knee: { flex: 105 },
    ankle: { dorsi: -59 },
    ...ARMS_DOWN,
    hip: { flex: 17 },
  },

  // ---------------- Standing ----------------
  urdhva_hastasana: {
    shoulder: { flex: 172, abd: 4, rot: 0 },
    scapula: { elev: 10 },
    thorax: { flex: -4 },
    neck: { flex: -8 },
  },
  uttanasana: {
    root: { pitch: 104 },
    hip: { flex: 104 },
    lumbar: { flex: 20 },
    thorax: { flex: 15 },
    neck: { flex: 15 },
    shoulder: { flex: 100, abd: 34 },
    ankle: { dorsi: 0 },
    elbow: { flex: 5 },
    wrist: { ext: 90, pron: 180 },
  },
  ardha_uttanasana: {
    root: { pitch: 101 },
    hip: { flex: 101 },
    lumbar: { flex: -6 },
    thorax: { flex: -6 },
    neck: { flex: -12 },
    shoulder: { flex: 32, abd: -11 },
    elbow: { flex: 0 },
  },
  utkatasana: {
    root: { pitch: 38 },
    hip: { flex: 95 },
    knee: { flex: 85 },
    ankle: { dorsi: 28 },
    lumbar: { flex: -6 },
    thorax: { flex: -4 },
    shoulder: { flex: 160, abd: 4 },
    scapula: { elev: 8 },
  },
  vrksasana: {
    root: { roll: 0 },
    hip_R: { flex: 0, abd: 2 },
    hip_L: { flex: 75, abd: -26, rot: 76 },
    knee_L: { flex: 156 },
    ankle_L: { dorsi: -20 },
    shoulder: { flex: 170, abd: -4 },
    elbow: { flex: 6 },
    scapula: { elev: 8 },
  },
  virabhadrasana_1: {
    root: { pitch: 26 },
    hip_L: { flex: 85 },
    knee_L: { flex: 87 },
    ankle_L: { dorsi: 10 },
    hip_R: { flex: -13, abd: 4, rot: 40 },
    ankle_R: { dorsi: 31 },
    lumbar: { flex: -32 },
    thorax: { flex: -10 },
    neck: { flex: -10 },
    shoulder: { flex: 170, abd: 6 },
    scapula: { elev: 8 },
  },
  virabhadrasana_2: {
    root: { yaw: 33 },
    hip_L: { flex: 78, abd: 2, rot: 46 },
    knee_L: { flex: 86 },
    ankle_L: { dorsi: 7 },
    hip_R: { flex: -24, abd: 51, rot: 10 },
    ankle_R: { dorsi: 5 },
    lumbar: { rot: -12 },
    thorax: { rot: -20 },
    neck: { rot: 44 },
    shoulder: { abd: 90, rot: -90 },
  },
  trikonasana: {
    root: { roll: 42 },
    hip_L: { abd: 83, rot: 90 },
    hip_R: { abd: -19, rot: -18 },
    ankle_L: { dorsi: -38 },
    ankle_R: { dorsi: 2 },
    lumbar: { side: 12 },
    thorax: { side: 31, rot: -10 },
    neck: { rot: -35 },
    shoulder: { abd: 90, rot: -90 },
  },

  // ---------------- Kneeling / hands & knees ----------------
  marjaryasana: {
    // Cat
    root: { pitch: 44 },
    hip: { flex: 48 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    lumbar: { flex: 18 },
    thorax: { flex: 16 },
    shoulder: { flex: 74 },
    wrist: { ext: 74, pron: 180 },
    neck: { flex: 14 },
    head: { flex: 6 },
    scapula: { protract: 12 },
  },
  bitilasana: {
    // Cow
    root: { pitch: 101 },
    hip: { flex: 106 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    lumbar: { flex: -18 },
    thorax: { flex: -10 },
    shoulder: { flex: 70 },
    wrist: { ext: 103, pron: 180 },
    neck: { flex: -25 },
    head: { flex: -10 },
    scapula: { protract: -8 },
  },
  adho_mukha_svanasana: {
    root: { pitch: 132 },
    hip: { flex: 94 },
    knee: { flex: 0 },
    ankle: { dorsi: 42 },
    lumbar: { flex: -4 },
    thorax: { flex: -4 },
    shoulder: { flex: 177, rot: 20, abd: -6 },
    wrist: { ext: 42, pron: 180 },
    neck: { flex: 5 },
    scapula: { elev: 6 },
  },
  phalakasana: {
    root: { pitch: 69 },
    hip: { flex: 0 },
    ankle: { dorsi: 12 },
    shoulder: { flex: 69 },
    wrist: { ext: 80, pron: 180 },
    neck: { flex: -12 },
  },
  chaturanga: {
    root: { pitch: 81 },
    hip: { flex: 0 },
    ankle: { dorsi: 24 },
    shoulder: { flex: -8 },
    elbow: { flex: 80 },
    wrist: { ext: 86, pron: 180 },
    neck: { flex: -10 },
  },
  urdhva_mukha_svanasana: {
    root: { pitch: 63 },
    hip: { flex: -9 },
    ankle: { dorsi: -72 },
    lumbar: { flex: -18 },
    thorax: { flex: -12 },
    neck: { flex: -10 },
    shoulder: { flex: 23, abd: 4 },
    wrist: { ext: 85, pron: 180 },
    scapula: { elev: -4 },
  },
  balasana: {
    root: { pitch: 70 },
    hip: { flex: 138, abd: 8 },
    knee: { flex: 164 },
    ankle: { dorsi: -37 },
    lumbar: { flex: 16 },
    thorax: { flex: 12 },
    neck: { flex: 51 },
    shoulder: { flex: 166 },
    wrist: { ext: 15, pron: 180 },
  },
  ustrasana: {
    root: { pitch: -20 },
    hip: { flex: -20 },
    knee: { flex: 90 },
    ankle: { dorsi: -54 },
    lumbar: { flex: -32 },
    thorax: { flex: -30 },
    neck: { flex: -30 },
    head: { flex: -10 },
    shoulder: { flex: -55, abd: 12 },
    wrist: { ext: 20 },
  },

  // ---------------- Prone / supine ----------------
  bhujangasana: {
    root: { pitch: 90 },
    ankle: { dorsi: -30 },
    lumbar: { flex: -26 },
    thorax: { flex: -19 },
    neck: { flex: -14 },
    shoulder: { flex: -3, abd: 8 },
    elbow: { flex: 92 },
    wrist: { ext: 80, pron: 180 },
    scapula: { elev: -4 },
  },
  setu_bandha: {
    root: { pitch: -120 },
    hip: { flex: -10 },
    knee: { flex: 109 },
    ankle: { dorsi: -7 },
    lumbar: { flex: -10 },
    thorax: { flex: 12 },
    neck: { flex: 45 },
    shoulder: { flex: -31, abd: 6 },
    wrist: { pron: 90 },
  },

  // ---------------- Seated ----------------
  paschimottanasana: {
    root: { pitch: 42 },
    hip: { flex: 134 },
    ankle: { dorsi: 12 },
    lumbar: { flex: 20 },
    thorax: { flex: 18 },
    neck: { flex: 14 },
    shoulder: { flex: 168 },
    wrist: { ext: 10, pron: 90 },
  },
  navasana: {
    root: { pitch: -38 },
    hip: { flex: 95 },
    knee: { flex: 0 },
    ankle: { dorsi: -10 },
    lumbar: { flex: -2 },
    thorax: { flex: 4 },
    shoulder: { flex: 50 },
    neck: { flex: 6 },
  },

  // ---------------- Postural deviations (topics, see topics.js) ----------------
  // Illustrative 10° of extra anterior pelvic tilt: the pelvis tips forward, the hips flex by the
  // same amount so the thighs stay vertical, the lumbar spine extends so the trunk stays upright.
  anterior_pelvic_tilt: { ...ARMS_DOWN, root: { pitch: 10 }, hip: { flex: 10 }, lumbar: { flex: -10 } },

  // ---------------- Variants (for load comparison) ----------------
  phalakasana_knees: {
    root: { pitch: 51 },
    hip: { flex: 0 },
    knee: { flex: 90 },
    ankle: { dorsi: -40 },
    shoulder: { flex: 59 },
    wrist: { ext: 72, pron: 180 },
    neck: { flex: -12 },
  },
  chaturanga_knees: {
    root: { pitch: 72 },
    hip: { flex: 0 },
    knee: { flex: 90 },
    ankle: { dorsi: -40 },
    shoulder: { flex: 1 },
    elbow: { flex: 90 },
    wrist: { ext: 90, pron: 180 },
    neck: { flex: -10 },
  },
  adho_mukha_svanasana_bent: {
    root: { pitch: 140 },
    hip: { flex: 123 },
    knee: { flex: 35 },
    ankle: { dorsi: 35 },
    lumbar: { flex: -6 },
    thorax: { flex: -6 },
    shoulder: { flex: 180, rot: 20, abd: -7 },
    wrist: { ext: 42, pron: 180 },
    neck: { flex: 5 },
    scapula: { elev: 6 },
  },
  utkatasana_shallow: {
    root: { pitch: 22 },
    hip: { flex: 55 },
    knee: { flex: 48 },
    ankle: { dorsi: 18 },
    lumbar: { flex: -4 },
    shoulder: { flex: 160, abd: 4 },
    scapula: { elev: 8 },
  },
  uttanasana_bent: {
    root: { pitch: 101 },
    hip: { flex: 130 },
    knee: { flex: 35 },
    ankle: { dorsi: 16 },
    lumbar: { flex: 12 },
    thorax: { flex: 10 },
    neck: { flex: 15 },
    shoulder: { flex: 96, abd: 34 },
    elbow: { flex: 3 },
    wrist: { ext: 90, pron: 180 },
  },
  navasana_bent: {
    root: { pitch: -38 },
    hip: { flex: 110 },
    knee: { flex: 90 },
    ankle: { dorsi: -10 },
    lumbar: { flex: -2 },
    thorax: { flex: 4 },
    shoulder: { flex: 50 },
    neck: { flex: 6 },
  },
};

const SIDED = ['scapula', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle'];

/** Expands a pose so every entry is per-joint (hip -> hip_L + hip_R). */
export function expandPose(pose) {
  const out = {};
  for (const [k, v] of Object.entries(pose)) {
    if (SIDED.includes(k)) {
      out[`${k}_L`] = { ...(out[`${k}_L`] || {}), ...v };
      out[`${k}_R`] = { ...(out[`${k}_R`] || {}), ...v };
    }
  }
  for (const [k, v] of Object.entries(pose)) {
    if (SIDED.includes(k)) continue;
    const key = k === 'root' ? 'pelvis' : k;
    out[key] = { ...(out[key] || {}), ...v };
  }
  return out;
}

// Floor-contact constraints used by tools/fit-poses.mjs: `support` lists the
// segments that must touch the floor ("a|b" = either), `params` the angles the fitter may adjust
// ("joint.angle"; joints without a side move both sides together).
export const POSE_FIT = {
  ardha_uttanasana: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    // long flat back (about 25° above horizontal), hands resting just above the knees
    at: [['wrist_L', 'hip_L', [0, -0.33, 0.09]], ['wrist_R', 'hip_R', [0, -0.33, 0.09]]],
    dir: [['thorax', [0, 1, 0], [0, 0.45, 1]]],
    params: ['root.pitch&hip.flex', 'shoulder.flex', 'shoulder.abd', 'elbow.flex'],
  },
  dandasana: { support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['hip.flex', 'shoulder.flex', 'ankle.dorsi'] },
  prone: { support: ['pelvis', 'thorax', 'knee_L', 'knee_R', 'ankle_L', 'ankle_R'], params: ['root.pitch', 'hip.flex', 'ankle.dorsi'] },
  tabletop: {
    support: ['wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R'],
    flat: ['wrist_L', 'wrist_R'], // palms flat
    above: [['shoulder_L', 'wrist_L'], ['shoulder_R', 'wrist_R'], ['hip_L', 'knee_L'], ['hip_R', 'knee_R']], // hands under shoulders, knees under hips
    params: ['root.pitch&hip.flex&shoulder.flex', 'shoulder.flex', 'hip.flex', 'wrist.ext'],
  },
  kneeling: { support: ['hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R'], balance: true, params: ['ankle.dorsi', 'hip.flex', 'knee.flex'] },
  uttanasana: {
    support: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    // hinge at the hips (spine curve fixed), palms flat beside the feet
    balance: true,
    at: [['wrist_L', 'ankle_L', [0.06, -0.02, 0.13]], ['wrist_R', 'ankle_R', [-0.06, -0.02, 0.13]]],
    params: ['root.pitch&hip.flex', 'shoulder.flex', 'shoulder.abd'],
  },
  vrksasana: {
    support: ['ankle_R'],
    flat: ['ankle_R'],
    // sole against the inner thigh, well above the knee (never pressing on the knee joint)
    at: [['ankle_L', 'hip_R', [0.07, -0.16, 0.0]]],
    dir: [['hip_L', [0, -1, 0], [0.9, -0.45, 0.25]]], // knee opens out to the side, slightly forward
    params: ['hip_L.flex', 'hip_L.abd', 'hip_L.rot', 'knee_L.flex', 'ankle_L.dorsi'],
  },
  virabhadrasana_1: { support: ['ankle_L', 'ankle_R'], params: ['root.pitch&hip_L.flex&hip_R.flex&-lumbar.flex', 'hip_R.flex', 'knee_L.flex', 'ankle_R.dorsi', 'hip_L.flex'] },
  virabhadrasana_2: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    rel: [['ankle_L', 'ankle_R', [-1.0, 0]]], // ≈ 1.3 × leg length
    dir: [
      ['ankle_L', [0, 0, 1], [1, 0, 0]], // front foot points to the front of the mat
      ['ankle_R', [0, 0, 1], [0.3, 0, 1]], // back foot turned in slightly
      ['thorax', [0, 0, 1], [0, 0, 1]], // chest faces the long side
      ['thorax', [0, 1, 0], [0, 1, 0]], // trunk upright
    ],
    above: [['knee_L', 'ankle_L']],
    params: ['root.yaw', 'hip_L.flex', 'hip_L.abd', 'hip_L.rot', 'knee_L.flex', 'ankle_L.dorsi', 'hip_R.flex', 'hip_R.abd', 'hip_R.rot', 'ankle_R.dorsi', 'lumbar.rot', 'thorax.rot', 'root.roll'],
  },
  trikonasana: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    rel: [['ankle_L', 'ankle_R', [-0.9, 0]]], // about one leg length (straight legs)
    dir: [
      ['ankle_L', [0, 0, 1], [1, 0, 0]], // front foot points to the front of the mat
      ['ankle_R', [0, 0, 1], [0.3, 0, 1]], // back foot turned in slightly
      ['thorax', [0, 0, 1], [0, 0, 1]], // chest open to the long side, not turned to the floor
      ['shoulder_L', [0, -1, 0], [0, -1, 0]], // lower arm down to the shin
      ['thorax', [0, 1, 0], [1, 0.45, 0]], // trunk reaches out over the front leg (~25° above horizontal)
      ['shoulder_R', [0, -1, 0], [0, 1, 0]], // top arm vertical
    ],
    at: [['wrist_L', 'knee_L', [0.02, -0.2, 0.05]]], // lower hand on the front shin
    params: ['root.roll', 'hip_L.abd', 'hip_R.abd', 'hip_R.rot', 'ankle_L.dorsi', 'ankle_R.dorsi', 'lumbar.side', 'thorax.side', 'shoulder_L.abd', 'shoulder_R.abd'],
  },
  marjaryasana: {
    support: ['wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R'],
    flat: ['wrist_L', 'wrist_R'], // palms flat
    above: [['shoulder_L', 'wrist_L'], ['shoulder_R', 'wrist_R'], ['hip_L', 'knee_L'], ['hip_R', 'knee_R']], // hands under shoulders, knees under hips
    params: ['root.pitch&hip.flex&shoulder.flex', 'shoulder.flex', 'hip.flex', 'wrist.ext'],
  },
  bitilasana: {
    support: ['wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R'],
    flat: ['wrist_L', 'wrist_R'], // palms flat
    above: [['shoulder_L', 'wrist_L'], ['shoulder_R', 'wrist_R'], ['hip_L', 'knee_L'], ['hip_R', 'knee_R']], // hands under shoulders, knees under hips
    params: ['root.pitch&hip.flex&shoulder.flex', 'shoulder.flex', 'hip.flex', 'wrist.ext'],
  },
  adho_mukha_svanasana: {
    support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'],
    rel: [['wrist_R', 'wrist_L', [0.329, 0]]], // hands shoulder-width apart, as in tabletop / plank
    params: ['shoulder.flex', 'hip.flex', 'shoulder.abd'],
  },
  phalakasana: { support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], params: ['root.pitch&shoulder.flex'] },
  phalakasana_knees: { support: ['wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R'], params: ['root.pitch&shoulder.flex', 'root.pitch'] },
  chaturanga: {
    support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'],
    above: [['elbow_L', 'wrist_L'], ['elbow_R', 'wrist_R']], // forearms vertical
    dir: [['shoulder_L', [0, -1, 0], [0, 0, -1]], ['shoulder_R', [0, -1, 0], [0, 0, -1]]], // upper arms parallel to the floor
    params: ['wrist.ext', 'ankle.dorsi'],
  },
  chaturanga_knees: { support: ['wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R'], params: ['root.pitch&shoulder.flex', 'root.pitch'] },
  urdhva_mukha_svanasana: {
    support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'],
    rel: [['wrist_R', 'wrist_L', [0.329, 0]]], // hands shoulder-width apart, as in tabletop / plank
    params: ['root.pitch&shoulder.flex', 'hip.flex', 'shoulder.abd'],
  },
  adho_mukha_svanasana_bent: {
    support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'],
    rel: [['wrist_R', 'wrist_L', [0.329, 0]]], // hands shoulder-width apart, as in tabletop / plank
    params: ['shoulder.flex', 'hip.flex', 'shoulder.abd'],
  },
  balasana: {
    support: ['hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R', 'head', 'wrist_L', 'wrist_R'],
    // sit bones resting on the heels (a rest pose), forehead and forearms down
    at: [['pelvis', 'knee_L', [-0.07, -0.3, -0.1], 0.5], ['pelvis', 'knee_R', [0.07, -0.3, -0.1], 0.5]],
    params: ['root.pitch', 'hip.flex', 'shoulder.flex', 'ankle.dorsi', 'knee.flex', 'neck.flex', 'lumbar.flex', 'thorax.flex'],
  },
  ustrasana: { support: ['hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R'], balance: true, params: ['ankle.dorsi', 'root.pitch&hip.flex', 'knee.flex'] },
  bhujangasana: { support: ['pelvis', 'wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], above: [['shoulder_L', 'wrist_L'], ['shoulder_R', 'wrist_R']], params: ['elbow.flex', 'shoulder.flex', 'ankle.dorsi', 'thorax.flex', 'lumbar.flex'] },
  prone_hands: { support: ['lumbar', 'thorax', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['shoulder.flex', 'elbow.flex', 'ankle.dorsi', 'root.pitch&hip.flex', 'lumbar.flex'] },
  setu_bandha: {
    support: ['scapula_L', 'scapula_R', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['ankle_L', 'ankle_R'],
    above: [['knee_L', 'ankle_L'], ['knee_R', 'ankle_R']], // knees stacked over the ankles
    // upper back and shoulders on the mat, arms alongside the body, palms down
    params: ['root.pitch', 'knee.flex', 'hip.flex', 'ankle.dorsi', 'shoulder.flex', 'neck.flex'],
  },
  supine_knees: { support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R'], params: ['hip.flex', 'knee.flex', 'root.pitch&hip.flex', 'ankle.dorsi'] },
  paschimottanasana: { support: ['pelvis', 'ankle_L', 'ankle_R'], params: ['hip.flex'] },
  uttanasana_bent: {
    support: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    // hinge at the hips (spine curve fixed), palms flat beside the feet
    balance: true,
    at: [['wrist_L', 'ankle_L', [0.06, -0.02, 0.13]], ['wrist_R', 'ankle_R', [-0.06, -0.02, 0.13]]],
    params: ['root.pitch&hip.flex', 'root.pitch', 'shoulder.flex', 'shoulder.abd', 'ankle.dorsi', 'elbow.flex'],
  },
  navasana_bent: { support: ['pelvis'], params: [] },
};
