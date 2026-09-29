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
    root: { pitch: 75 },
    hip: { flex: 75 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    shoulder: { flex: 75 },
    wrist: { ext: 88, pron: 180 },
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
    thorax: { flex: -8 },
    neck: { flex: -8 },
  },
  uttanasana: {
    root: { pitch: 118 },
    hip: { flex: 118 },
    lumbar: { flex: 18 },
    thorax: { flex: 14 },
    neck: { flex: 12 },
    shoulder: { flex: 183, abd: 8 },
    ankle: { dorsi: 0 },
    elbow: { flex: 5 },
  },
  ardha_uttanasana: {
    root: { pitch: 78 },
    hip: { flex: 78 },
    lumbar: { flex: -6 },
    thorax: { flex: -6 },
    neck: { flex: -15 },
    shoulder: { flex: 60, abd: 6 },
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
    hip_L: { flex: 78, abd: -34, rot: 59 },
    knee_L: { flex: 140 },
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
    root: { yaw: 0, roll: 48 },
    hip_L: { flex: 0, abd: 88, rot: 70 },
    hip_R: { flex: 0, abd: -30 },
    ankle_R: { dorsi: 0 },
    lumbar: { side: 8, rot: 10 },
    thorax: { side: 6, rot: 20 },
    neck: { rot: 60 },
    shoulder: { abd: 90, rot: -90 },
  },

  // ---------------- Kneeling / hands & knees ----------------
  marjaryasana: {
    // Cat
    root: { pitch: 44 },
    hip: { flex: 44 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    lumbar: { flex: 18 },
    thorax: { flex: 16 },
    shoulder: { flex: 78 },
    wrist: { ext: 70, pron: 180 },
    neck: { flex: 14 },
    head: { flex: 6 },
    scapula: { protract: 12 },
  },
  bitilasana: {
    // Cow
    root: { pitch: 101 },
    hip: { flex: 101 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    lumbar: { flex: -18 },
    thorax: { flex: -10 },
    shoulder: { flex: 73 },
    wrist: { ext: 100, pron: 180 },
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
    shoulder: { flex: 177, rot: 20 },
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
    root: { pitch: 83 },
    hip: { flex: 0 },
    ankle: { dorsi: 5 },
    shoulder: { flex: -2 },
    elbow: { flex: 90 },
    wrist: { ext: 92, pron: 180 },
    neck: { flex: -10 },
  },
  urdhva_mukha_svanasana: {
    root: { pitch: 63 },
    hip: { flex: -9 },
    ankle: { dorsi: -72 },
    lumbar: { flex: -18 },
    thorax: { flex: -12 },
    neck: { flex: -10 },
    shoulder: { flex: 23 },
    wrist: { ext: 85, pron: 180 },
    scapula: { elev: -4 },
  },
  balasana: {
    root: { pitch: 70 },
    hip: { flex: 136, abd: 8 },
    knee: { flex: 162 },
    ankle: { dorsi: -37 },
    lumbar: { flex: 16 },
    thorax: { flex: 12 },
    neck: { flex: 68 },
    shoulder: { flex: 165 },
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
    hip: { flex: -8 },
    knee: { flex: 101 },
    ankle: { dorsi: 2 },
    lumbar: { flex: -6 },
    thorax: { flex: 12 },
    neck: { flex: 45 },
    shoulder: { flex: -38, abd: 8, rot: -80 },
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
    shoulder: { flex: 179, rot: 20 },
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
    root: { pitch: 125 },
    hip: { flex: 140 },
    knee: { flex: 40 },
    ankle: { dorsi: 18 },
    lumbar: { flex: 12 },
    thorax: { flex: 10 },
    neck: { flex: 12 },
    shoulder: { flex: 172, abd: 8 },
    elbow: { flex: 21 },
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
  dandasana: { support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['hip.flex', 'shoulder.flex', 'ankle.dorsi'] },
  prone: { support: ['pelvis', 'thorax', 'knee_L', 'knee_R', 'ankle_L', 'ankle_R'], params: ['root.pitch', 'hip.flex', 'ankle.dorsi'] },
  tabletop: { support: ['wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R'], params: ['root.pitch&hip.flex&shoulder.flex'] },
  kneeling: { support: ['hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R'], balance: true, params: ['ankle.dorsi', 'hip.flex', 'knee.flex'] },
  uttanasana: { support: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['shoulder.flex', 'elbow.flex'] },
  vrksasana: { support: ['ankle_R'], params: [] },
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
  trikonasana: { support: ['ankle_L', 'ankle_R'], params: ['hip_R.abd', 'root.roll'] },
  marjaryasana: { support: ['wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R'], params: ['root.pitch&hip.flex&shoulder.flex'] },
  bitilasana: { support: ['wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R'], params: ['root.pitch&hip.flex&shoulder.flex'] },
  adho_mukha_svanasana: { support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], params: ['shoulder.flex', 'hip.flex'] },
  phalakasana: { support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], params: ['root.pitch&shoulder.flex'] },
  phalakasana_knees: { support: ['wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R'], params: ['root.pitch&shoulder.flex', 'root.pitch'] },
  chaturanga: { support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], params: ['root.pitch&shoulder.flex'] },
  chaturanga_knees: { support: ['wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R'], params: ['root.pitch&shoulder.flex', 'root.pitch'] },
  urdhva_mukha_svanasana: { support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], params: ['root.pitch&shoulder.flex', 'hip.flex'] },
  adho_mukha_svanasana_bent: { support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], params: ['shoulder.flex', 'hip.flex'] },
  balasana: { support: ['hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R', 'head', 'wrist_L', 'wrist_R'], params: ['root.pitch', 'hip.flex', 'shoulder.flex', 'ankle.dorsi', 'knee.flex', 'neck.flex'] },
  ustrasana: { support: ['hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R'], balance: true, params: ['ankle.dorsi', 'root.pitch&hip.flex', 'knee.flex'] },
  bhujangasana: { support: ['pelvis', 'wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], above: [['shoulder_L', 'wrist_L'], ['shoulder_R', 'wrist_R']], params: ['elbow.flex', 'shoulder.flex', 'ankle.dorsi', 'thorax.flex', 'lumbar.flex'] },
  prone_hands: { support: ['lumbar', 'thorax', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['shoulder.flex', 'elbow.flex', 'ankle.dorsi', 'root.pitch&hip.flex', 'lumbar.flex'] },
  setu_bandha: { support: ['scapula_L', 'scapula_R', 'ankle_L', 'ankle_R'], params: ['root.pitch', 'knee.flex'] },
  supine_knees: { support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R'], params: ['hip.flex', 'knee.flex', 'root.pitch&hip.flex', 'ankle.dorsi'] },
  paschimottanasana: { support: ['pelvis', 'ankle_L', 'ankle_R'], params: ['hip.flex'] },
  uttanasana_bent: { support: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['shoulder.flex', 'elbow.flex'] },
  navasana_bent: { support: ['pelvis'], params: [] },
};
