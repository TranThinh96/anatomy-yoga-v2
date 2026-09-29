// Joint angles (degrees) for every pose. See semanticToQuat() in rig.js for
// the meaning and sign of each angle. Keys without a side (e.g. "hip") apply to
// both sides; keys with _L / _R refine one side (the model's own left/right).

const ARMS_DOWN = { shoulder: { abd: 6 } };

export const POSES = {
  // ---------------- Base positions ----------------
  tadasana: { ...ARMS_DOWN, ankle: { dorsi: 0 } },
  dandasana: {
    hip: { flex: 90 },
    ankle: { dorsi: 10 },
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
    hip: { flex: 55 },
    knee: { flex: 105 },
    ankle: { dorsi: 5 },
    shoulder: { abd: 14, rot: -80 },
  },
  prone: {
    root: { pitch: 90 },
    ankle: { dorsi: -75 },
    shoulder: { abd: 12, rot: -80 },
    neck: { flex: -10 },
  },
  prone_hands: {
    root: { pitch: 90 },
    ankle: { dorsi: -75 },
    shoulder: { flex: 10, abd: 10 },
    elbow: { flex: 100 },
    wrist: { ext: 70, pron: 180 },
    neck: { flex: -6 },
  },
  tabletop: {
    root: { pitch: 90 },
    hip: { flex: 90 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    shoulder: { flex: 90 },
    wrist: { ext: 88, pron: 180 },
    neck: { flex: -10 },
    head: { flex: -10 },
  },
  kneeling: {
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
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
    shoulder: { flex: 158, abd: 8 },
    ankle: { dorsi: 0 },
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
    root: { pitch: 6 },
    hip_L: { flex: 80 },
    knee_L: { flex: 88 },
    ankle_L: { dorsi: 10 },
    hip_R: { flex: -38, abd: 4, rot: 40 },
    ankle_R: { dorsi: 18 },
    lumbar: { flex: -14 },
    thorax: { flex: -10 },
    neck: { flex: -10 },
    shoulder: { flex: 170, abd: 6 },
    scapula: { elev: 8 },
  },
  virabhadrasana_2: {
    root: { yaw: 48 },
    hip_L: { flex: 80, abd: 38, rot: 18 },
    knee_L: { flex: 90 },
    ankle_L: { dorsi: 12 },
    hip_R: { flex: -16, abd: 42, rot: -8 },
    ankle_R: { dorsi: 6 },
    lumbar: { rot: -20 },
    thorax: { rot: -26 },
    neck: { rot: 44 },
    shoulder: { abd: 90, rot: -90 },
  },
  trikonasana: {
    root: { yaw: 0, roll: 60 },
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
    root: { pitch: 78 },
    hip: { flex: 78 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    lumbar: { flex: 18 },
    thorax: { flex: 16 },
    shoulder: { flex: 112 },
    wrist: { ext: 70, pron: 180 },
    neck: { flex: 14 },
    head: { flex: 6 },
    scapula: { protract: 12 },
  },
  bitilasana: {
    // Cow
    root: { pitch: 104 },
    hip: { flex: 104 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    lumbar: { flex: -18 },
    thorax: { flex: -10 },
    shoulder: { flex: 76 },
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
    shoulder: { flex: 172, rot: 20 },
    wrist: { ext: 42, pron: 180 },
    neck: { flex: 5 },
    scapula: { elev: 6 },
  },
  phalakasana: {
    root: { pitch: 80 },
    hip: { flex: 0 },
    ankle: { dorsi: 12 },
    shoulder: { flex: 80 },
    wrist: { ext: 80, pron: 180 },
    neck: { flex: -12 },
  },
  chaturanga: {
    root: { pitch: 90 },
    hip: { flex: 0 },
    ankle: { dorsi: 5 },
    shoulder: { flex: 5 },
    elbow: { flex: 90 },
    wrist: { ext: 92, pron: 180 },
    neck: { flex: -10 },
  },
  urdhva_mukha_svanasana: {
    root: { pitch: 62 },
    hip: { flex: -22 },
    ankle: { dorsi: -72 },
    lumbar: { flex: -18 },
    thorax: { flex: -12 },
    neck: { flex: -10 },
    shoulder: { flex: 22 },
    wrist: { ext: 85, pron: 180 },
    scapula: { elev: -4 },
  },
  balasana: {
    root: { pitch: 79 },
    hip: { flex: 151, abd: 8 },
    knee: { flex: 162 },
    ankle: { dorsi: -75 },
    lumbar: { flex: 16 },
    thorax: { flex: 12 },
    neck: { flex: 8 },
    shoulder: { flex: 176 },
    wrist: { ext: 15, pron: 180 },
  },
  ustrasana: {
    root: { pitch: -22 },
    hip: { flex: -22 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
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
    ankle: { dorsi: -75 },
    lumbar: { flex: -26 },
    thorax: { flex: -22 },
    neck: { flex: -14 },
    shoulder: { flex: 22, abd: 8 },
    elbow: { flex: 45 },
    wrist: { ext: 80, pron: 180 },
    scapula: { elev: -4 },
  },
  setu_bandha: {
    root: { pitch: -128 },
    hip: { flex: -8 },
    knee: { flex: 100 },
    ankle: { dorsi: 2 },
    lumbar: { flex: -6 },
    thorax: { flex: 12 },
    neck: { flex: 45 },
    shoulder: { flex: -38, abd: 8, rot: -80 },
  },

  // ---------------- Seated ----------------
  paschimottanasana: {
    root: { pitch: 42 },
    hip: { flex: 132 },
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
