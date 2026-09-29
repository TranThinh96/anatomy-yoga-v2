// Joint angles (degrees) for every pose. See semanticToQuat() in rig.js for
// the meaning and sign of each angle. Keys without a side (e.g. "hip") apply to
// both sides; keys with _L / _R refine one side (the model's own left/right).

const ARMS_DOWN = { shoulder: { abd: 6 } };

export const POSES = {
  // ---------------- Base positions ----------------
  tadasana: { ...ARMS_DOWN, ankle: { dorsi: 0 } },
  dandasana: {
    hip: { flex: 90 },
    ankle: { dorsi: -5 },
    lumbar: { flex: -4 },
    shoulder: { flex: -18, abd: 10 },
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
    knee: { flex: 101 },
    ankle: { dorsi: 9 },
    shoulder: { abd: 14, rot: -80 },
  },
  prone: {
    root: { pitch: 86 },
    ankle: { dorsi: -62 },
    shoulder: { abd: 12, rot: -80 },
    neck: { flex: -10 },
  },
  prone_hands: {
    root: { pitch: 85 },
    ankle: { dorsi: -26 },
    shoulder: { flex: -33, abd: 12 },
    elbow: { flex: 124 },
    wrist: { ext: 70, pron: 180 },
    neck: { flex: -6 },
    hip: { flex: -5 },
    lumbar: { flex: 4 },
  },
  tabletop: {
    root: { pitch: 82 },
    hip: { flex: 82 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    shoulder: { flex: 82 },
    wrist: { ext: 88, pron: 180 },
    neck: { flex: -10 },
    head: { flex: -10 },
  },
  kneeling: {
    knee: { flex: 90 },
    ankle: { dorsi: -47 },
    ...ARMS_DOWN,
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
    shoulder: { flex: 176, abd: 8 },
    ankle: { dorsi: 0 },
    elbow: { flex: 7 },
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
    root: { pitch: 27 },
    hip_L: { flex: 87 },
    knee_L: { flex: 90 },
    ankle_L: { dorsi: 10 },
    hip_R: { flex: -20, abd: 4, rot: 40 },
    ankle_R: { dorsi: 33 },
    lumbar: { flex: -34 },
    thorax: { flex: -10 },
    neck: { flex: -10 },
    shoulder: { flex: 170, abd: 6 },
    scapula: { elev: 8 },
  },
  virabhadrasana_2: {
    root: { yaw: 34 },
    hip_L: { flex: 80, abd: 0, rot: 35 },
    knee_L: { flex: 83 },
    ankle_L: { dorsi: 2 },
    hip_R: { flex: -24, abd: 57, rot: 19 },
    ankle_R: { dorsi: 0 },
    lumbar: { rot: -14 },
    thorax: { rot: -20 },
    neck: { rot: 44 },
    shoulder: { abd: 90, rot: -90 },
  },
  trikonasana: {
    root: { yaw: 0, roll: 48 },
    hip_L: { flex: 0, abd: 88, rot: 70 },
    hip_R: { flex: 0, abd: -27 },
    ankle_R: { dorsi: 0 },
    lumbar: { side: 8, rot: 10 },
    thorax: { side: 6, rot: 20 },
    neck: { rot: 60 },
    shoulder: { abd: 90, rot: -90 },
  },

  // ---------------- Kneeling / hands & knees ----------------
  marjaryasana: {
    // Cat
    root: { pitch: 50 },
    hip: { flex: 50 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    lumbar: { flex: 18 },
    thorax: { flex: 16 },
    shoulder: { flex: 84 },
    wrist: { ext: 70, pron: 180 },
    neck: { flex: 14 },
    head: { flex: 6 },
    scapula: { protract: 12 },
  },
  bitilasana: {
    // Cow
    root: { pitch: 105 },
    hip: { flex: 105 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    lumbar: { flex: -18 },
    thorax: { flex: -10 },
    shoulder: { flex: 77 },
    wrist: { ext: 100, pron: 180 },
    neck: { flex: -25 },
    head: { flex: -10 },
    scapula: { protract: -8 },
  },
  adho_mukha_svanasana: {
    root: { pitch: 132 },
    hip: { flex: 86 },
    knee: { flex: 0 },
    ankle: { dorsi: 42 },
    lumbar: { flex: -4 },
    thorax: { flex: -4 },
    shoulder: { flex: 170, rot: 20 },
    wrist: { ext: 42, pron: 180 },
    neck: { flex: 5 },
    scapula: { elev: 6 },
  },
  phalakasana: {
    root: { pitch: 73 },
    hip: { flex: 0 },
    ankle: { dorsi: 12 },
    shoulder: { flex: 73 },
    wrist: { ext: 80, pron: 180 },
    neck: { flex: -12 },
  },
  chaturanga: {
    root: { pitch: 86 },
    hip: { flex: 0 },
    ankle: { dorsi: 5 },
    shoulder: { flex: 1 },
    elbow: { flex: 90 },
    wrist: { ext: 92, pron: 180 },
    neck: { flex: -10 },
  },
  urdhva_mukha_svanasana: {
    root: { pitch: 58 },
    hip: { flex: -20 },
    ankle: { dorsi: -72 },
    lumbar: { flex: -18 },
    thorax: { flex: -12 },
    neck: { flex: -10 },
    shoulder: { flex: 18 },
    wrist: { ext: 85, pron: 180 },
    scapula: { elev: -4 },
  },
  balasana: {
    root: { pitch: 70 },
    hip: { flex: 141, abd: 8 },
    knee: { flex: 162 },
    ankle: { dorsi: -41 },
    lumbar: { flex: 16 },
    thorax: { flex: 12 },
    neck: { flex: 34 },
    shoulder: { flex: 165 },
    wrist: { ext: 15, pron: 180 },
  },
  ustrasana: {
    root: { pitch: -22 },
    hip: { flex: -22 },
    knee: { flex: 90 },
    ankle: { dorsi: -47 },
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
    ankle: { dorsi: -34 },
    lumbar: { flex: -26 },
    thorax: { flex: -22 },
    neck: { flex: -14 },
    shoulder: { flex: 46, abd: 8 },
    elbow: { flex: 69 },
    wrist: { ext: 80, pron: 180 },
    scapula: { elev: -4 },
  },
  setu_bandha: {
    root: { pitch: -120 },
    hip: { flex: -8 },
    knee: { flex: 82 },
    ankle: { dorsi: 2 },
    lumbar: { flex: -6 },
    thorax: { flex: 12 },
    neck: { flex: 45 },
    shoulder: { flex: -38, abd: 8, rot: -80 },
  },

  // ---------------- Seated ----------------
  paschimottanasana: {
    root: { pitch: 42 },
    hip: { flex: 130 },
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
    knee: { flex: 95 },
    ankle: { dorsi: -40 },
    shoulder: { flex: 51 },
    wrist: { ext: 72, pron: 180 },
    neck: { flex: -12 },
  },
  chaturanga_knees: {
    root: { pitch: 72 },
    hip: { flex: 0 },
    knee: { flex: 95 },
    ankle: { dorsi: -40 },
    shoulder: { flex: -7 },
    elbow: { flex: 90 },
    wrist: { ext: 90, pron: 180 },
    neck: { flex: -10 },
  },
  adho_mukha_svanasana_bent: {
    root: { pitch: 140 },
    hip: { flex: 110 },
    knee: { flex: 35 },
    ankle: { dorsi: 35 },
    lumbar: { flex: -6 },
    thorax: { flex: -6 },
    shoulder: { flex: 176, rot: 20 },
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
    shoulder: { flex: 174, abd: 8 },
    elbow: { flex: 16 },
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
// segments that must touch the floor, `params` the angles the fitter may adjust
// ("joint.angle"; joints without a side move both sides together).
export const POSE_FIT = {
  dandasana: { support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['hip.flex', 'shoulder.flex', 'ankle.dorsi'] },
  prone: { support: ['pelvis', 'thorax', 'knee_L', 'knee_R', 'ankle_L', 'ankle_R'], params: ['root.pitch', 'hip.flex', 'ankle.dorsi'] },
  tabletop: { support: ['wrist_L', 'wrist_R', 'knee_L', 'knee_R'], params: ['root.pitch&hip.flex&shoulder.flex'] },
  kneeling: { support: ['knee_L', 'knee_R', 'ankle_L', 'ankle_R'], params: ['ankle.dorsi'] },
  uttanasana: { support: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['shoulder.flex', 'elbow.flex'] },
  vrksasana: { support: ['ankle_R'], params: [] },
  virabhadrasana_1: { support: ['ankle_L', 'ankle_R'], params: ['root.pitch&hip_L.flex&hip_R.flex&-lumbar.flex', 'hip_R.flex', 'knee_L.flex', 'ankle_R.dorsi', 'hip_L.flex'] },
  virabhadrasana_2: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    rel: [['ankle_L', 'ankle_R', [-1.15, 0]]],
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
  marjaryasana: { support: ['wrist_L', 'wrist_R', 'knee_L', 'knee_R'], params: ['root.pitch&hip.flex&shoulder.flex'] },
  bitilasana: { support: ['wrist_L', 'wrist_R', 'knee_L', 'knee_R'], params: ['root.pitch&hip.flex&shoulder.flex'] },
  adho_mukha_svanasana: { support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], params: ['shoulder.flex', 'hip.flex'] },
  phalakasana: { support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], params: ['root.pitch&shoulder.flex'] },
  phalakasana_knees: { support: ['wrist_L', 'wrist_R', 'knee_L', 'knee_R'], params: ['root.pitch&shoulder.flex'] },
  chaturanga: { support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], params: ['root.pitch&shoulder.flex'] },
  chaturanga_knees: { support: ['wrist_L', 'wrist_R', 'knee_L', 'knee_R'], params: ['root.pitch&shoulder.flex'] },
  urdhva_mukha_svanasana: { support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], params: ['root.pitch&shoulder.flex', 'hip.flex'] },
  adho_mukha_svanasana_bent: { support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], params: ['shoulder.flex', 'hip.flex'] },
  balasana: { support: ['knee_L', 'knee_R', 'ankle_L', 'ankle_R', 'head', 'wrist_L', 'wrist_R'], params: ['root.pitch', 'hip.flex', 'shoulder.flex', 'ankle.dorsi', 'knee.flex', 'neck.flex'] },
  ustrasana: { support: ['knee_L', 'knee_R', 'ankle_L', 'ankle_R'], params: ['ankle.dorsi'] },
  bhujangasana: { support: ['pelvis', 'wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'], params: ['elbow.flex', 'shoulder.flex', 'ankle.dorsi'] },
  prone_hands: { support: ['lumbar', 'thorax', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['shoulder.flex', 'elbow.flex', 'ankle.dorsi', 'root.pitch&hip.flex', 'lumbar.flex'] },
  setu_bandha: { support: ['scapula_L', 'scapula_R', 'ankle_L', 'ankle_R'], params: ['root.pitch', 'knee.flex'] },
  supine_knees: { support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R'], params: ['hip.flex', 'knee.flex', 'root.pitch&hip.flex', 'ankle.dorsi'] },
  paschimottanasana: { support: ['pelvis', 'ankle_L', 'ankle_R'], params: ['hip.flex'] },
  uttanasana_bent: { support: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['shoulder.flex', 'elbow.flex'] },
  navasana_bent: { support: ['pelvis'], params: [] },
};
