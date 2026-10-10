// Joint angles (degrees) for every pose. See semanticToQuat() in rig.js for
// the meaning and sign of each angle. Keys without a side (e.g. "hip") apply to
// both sides; keys with _L / _R refine one side (the model's own left/right).

const ARMS_DOWN = { shoulder: { abd: 6 } };

export const POSES = {
  // ---------------- Base positions ----------------
  tadasana: { ...ARMS_DOWN, ankle: { dorsi: 0 } },
  // Sit bones, heels and palms all on the floor. With hip 90° / shoulder −12° the hands and heels
  // propped the sit bones 15 mm up, and the body dropped onto them on the way into Navasana. The
  // fitter cannot find this alone: it needs hip and shoulder to change together.
  dandasana: {
    hip: { flex: 91 },
    ankle: { dorsi: 1 },
    lumbar: { flex: -4 },
    shoulder: { flex: -16, abd: 10 },
    wrist: { ext: 80 },
  },
  // Dandasana with the hands lifted a few cm by extending the shoulders, arms straight: the first
  // pose passed through on the way into Navasana. Bending the elbows while the hands are still
  // down drives the fingers into the floor and props the sit bones up (~2 cm).
  dandasana_hands_off: {
    hip: { flex: 91 },
    ankle: { dorsi: 1 },
    lumbar: { flex: -4 },
    shoulder: { flex: -24, abd: 10 },
    wrist: { ext: 90 },
  },
  // Then the elbows bend, palms still facing down: the second pose passed through before leaning
  // back into Navasana. Going there directly, the wrist straightening from 80° drives the fingers
  // into the floor and props the body up off the sit bones.
  dandasana_hands_up: {
    hip: { flex: 91 },
    ankle: { dorsi: 1 },
    lumbar: { flex: -4 },
    shoulder: { flex: -30, abd: 10 },
    elbow: { flex: 75 },
    wrist: { ext: 90 },
  },
  supine: {
    root: { pitch: -90 },
    shoulder: { abd: 18, flex: -11, rot: 9 },
    ankle: { dorsi: -30 },
    hip: { rot: 15 },
    elbow: { flex: -4 },
  },
  supine_knees: {
    root: { pitch: -90 },
    hip: { flex: 47 },
    knee: { flex: 103 },
    ankle: { dorsi: 9 },
    // arms along the body, palms down, as they stay when the hips lift into Setu Bandha
    shoulder: { flex: -8, abd: 6 },
    wrist: { pron: 90 },
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
  // Uttanasana with the palms shoulder-width apart (as wide as in Plank) beside the feet: where the
  // hands land in Surya Namaskar, so they do not slide apart while the legs step back.
  uttanasana_hands_wide: {
    root: { pitch: 104 },
    hip: { flex: 104 },
    lumbar: { flex: 20 },
    thorax: { flex: 15 },
    neck: { flex: 15 },
    shoulder: { flex: 91, abd: 0 },
    ankle: { dorsi: 0 },
    elbow: { flex: 29 },
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
  // Standing on the right leg with the left knee lifted in front: the step before opening the knee
  // into Vrksasana. Going there directly, the slerped hip rotation and knee bend drive the left
  // toes into the floor before the foot leaves it, and the body rocks onto the standing foot late.
  vrksasana_knee_up: {
    ...ARMS_DOWN,
    hip_L: { flex: 75, rot: 20 },
    knee_L: { flex: 100 },
    ankle_L: { dorsi: 0 },
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
  // Extended side angle, forearm on the front thigh: Warrior II legs, the trunk tipped over the
  // front (left) thigh, top arm reaching over the ear on the line of the back leg, gaze up.
  utthita_parsvakonasana: {
    root: { yaw: 33, roll: 21 },
    hip_L: { flex: 85, abd: 23, rot: 46 },
    knee_L: { flex: 94 },
    ankle_L: { dorsi: 8 },
    hip_R: { flex: -24, abd: 29, rot: 10 },
    ankle_R: { dorsi: 5 },
    lumbar: { side: 8, rot: -12 },
    thorax: { side: 22, rot: -29 },
    neck: { rot: -30 },
    shoulder_L: { abd: 15, flex: -29, rot: -92 },
    elbow_L: { flex: 87 },
    wrist_L: { pron: 90 },
    shoulder_R: { abd: 167, rot: -90, flex: -7 },
    scapula_R: { elev: 10 },
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

  // Trikonasana with the lower hand on a block (standing on its end) in front of and inside the front
  // foot: the heel of the hand on the block, the fingers reaching past it.
  trikonasana_block: {
    root: { roll: 42 },
    hip_L: { abd: 83, rot: 90 },
    hip_R: { abd: -19, rot: -17 },
    ankle_L: { dorsi: -37 },
    ankle_R: { dorsi: 0 },
    lumbar: { side: 11 },
    thorax: { side: 30, rot: -10 },
    neck: { rot: -35 },
    shoulder: { abd: 90, rot: -90 },
    shoulder_L: { flex: -12 },
    wrist_L: { ext: 74 },
  },
  // trikonasana_block with the trunk a little higher (less side bend): the hand just above the block,
  // so the last part of the move lowers it straight down onto the block.
  trikonasana_block_above: {
    root: { roll: 42 },
    hip_L: { abd: 83, rot: 90 },
    hip_R: { abd: -19, rot: -17 },
    ankle_L: { dorsi: -37 },
    ankle_R: { dorsi: 0 },
    lumbar: { side: 4 },
    thorax: { side: 24, rot: -10 },
    neck: { rot: -35 },
    shoulder: { abd: 90, rot: -90 },
    shoulder_L: { flex: -12 },
    wrist_L: { ext: 74 },
  },
  // The lower hand lifted off the shin (elbow bent, arm turned out) to above and in front of the
  // block: passed through between Trikonasana and trikonasana_block, so the hand comes down onto the
  // block from above (swinging the straight arm forward slid the hand into the block's side).
  trikonasana_block_reach: {
    root: { roll: 42 },
    hip_L: { abd: 83, rot: 90 },
    hip_R: { abd: -19, rot: -18 },
    ankle_L: { dorsi: -38 },
    ankle_R: { dorsi: 0 },
    lumbar: { side: 12 },
    thorax: { side: 31, rot: -10 },
    neck: { rot: -35 },
    shoulder: { abd: 90, rot: -90 },
    shoulder_L: { rot: 20 },
    elbow_L: { flex: 60 },
    wrist_L: { ext: 40 },
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
  // Low lunge with the hands down (Ashwa Sanchalanasana), left foot forward between the hands,
  // right leg straight back on the toes: the step between Uttanasana and Plank in Surya Namaskar,
  // so the legs step back one at a time. The front foot sits where it is in Uttanasana and the back
  // foot where it is in Plank, so the hands and the standing foot stay put during each step.
  ashwa_sanchalanasana: {
    root: { pitch: 58 },
    lumbar: { flex: 12 },
    thorax: { flex: 16 },
    neck: { flex: -15 },
    hip_L: { flex: 146 },
    knee_L: { flex: 97 },
    ankle_L: { dorsi: 11 },
    hip_R: { flex: -7 },
    ankle_R: { dorsi: 1 },
    shoulder: { flex: 88, abd: -3 },
    wrist: { ext: 80, pron: 180 },
  },
  // Halfway between Uttanasana (hands wide) and the lunge, hips half lowered, hands and left foot
  // down: the pose the body passes through while the right leg steps back (or forward again).
  // Interpolating straight from the fold to the lunge does not keep the hands and the standing foot
  // on the floor together; holding them there made the hips hang high and then drop 36 cm in
  // 0.4 s. The right leg is steered by the animator while it steps (Animator._liftSteps).
  surya_step_mid: {
    root: { pitch: 85 },
    lumbar: { flex: 16 },
    thorax: { flex: 15 },
    neck: { flex: 0 },
    hip_L: { flex: 133 },
    knee_L: { flex: 63 },
    ankle_L: { dorsi: 9 },
    hip_R: { flex: 55 },
    shoulder: { flex: 89 },
    elbow: { flex: 15 },
    wrist: { ext: 85, pron: 180 },
    ankle_R: { dorsi: 35 },
  },
  // A quarter and three quarters of the way from Uttanasana to the lunge (hands and left foot down,
  // fitted): with surya_step_mid they keep the hands and the standing foot within the animator's
  // floor tolerance while the right leg steps back, so the body is not tilted to fix them.
  surya_step_q1: {
    root: { pitch: 99 },
    lumbar: { flex: 19 },
    thorax: { flex: 15 },
    neck: { flex: 7 },
    shoulder: { flex: 90 },
    elbow: { flex: 22 },
    wrist: { ext: 88, pron: 180 },
    hip_L: { flex: 117 },
    hip_R: { flex: 81 },
    knee_L: { flex: 31 },
    ankle_L: { dorsi: 11 },
    ankle_R: { dorsi: 22 },
  },
  surya_step_q3: {
    root: { pitch: 73 },
    lumbar: { flex: 14 },
    thorax: { flex: 16 },
    neck: { flex: -7 },
    shoulder: { flex: 87 },
    elbow: { flex: 7 },
    wrist: { ext: 83, pron: 180 },
    hip_L: { flex: 137 },
    hip_R: { flex: 29 },
    knee_L: { flex: 81 },
    ankle_L: { dorsi: 13 },
    ankle_R: { dorsi: 35 },
  },
  // The same lunge with the ball of the back foot where it is in Downward Dog (6 cm further back
  // than in Plank): the step on the way forward from Downward Dog.
  ashwa_sanchalanasana_long: {
    root: { pitch: 58 },
    lumbar: { flex: 12 },
    thorax: { flex: 18 },
    neck: { flex: -15 },
    hip_L: { flex: 148 },
    knee_L: { flex: 95 },
    ankle_L: { dorsi: 2 },
    hip_R: { flex: -2 },
    knee_R: { flex: 11 },
    ankle_R: { dorsi: 3 },
    shoulder: { flex: 93, abd: 0 },
    wrist: { ext: 80, pron: 180 },
  },
  // Halfway through the left leg's step between the lunge and Plank (back) and between Downward
  // Dog and the long lunge (forward): hands and right foot down, left knee drawn in with the ankle
  // ~8 cm above its path. Interpolating straight between the ends swept the left foot 36 cm
  // under the floor, and lifting it out made the leg whip through at ~1000°/s.
  surya_step_back_L: {
    root: { pitch: 72 },
    lumbar: { flex: 6 },
    thorax: { flex: 8 },
    neck: { flex: -13 },
    shoulder: { flex: 88, abd: -1 },
    wrist: { ext: 80, pron: 180 },
    hip_L: { flex: 107 },
    hip_R: { flex: 11 },
    knee_L: { flex: 129 },
    ankle_L: { dorsi: -27 },
    ankle_R: { dorsi: 6 },
  },
  surya_step_up_L: {
    root: { pitch: 95 },
    lumbar: { flex: 4 },
    thorax: { flex: 7 },
    neck: { flex: -5 },
    scapula: { elev: 3 },
    shoulder: { flex: 133, rot: 10, abd: -3 },
    wrist: { ext: 61, pron: 180 },
    hip_L: { flex: 150 },
    hip_R: { flex: 45 },
    knee_L: { flex: 130 },
    knee_R: { flex: 6 },
    ankle_L: { dorsi: 14 },
    ankle_R: { dorsi: 5 },
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
  // Supported child's pose: knees wide, a bolster lengthwise between the thighs, belly, chest and
  // forehead resting on it, forearms on the mat on either side of it (restorative).
  balasana_bolster: {
    root: { pitch: 28 },
    hip: { flex: 85, rot: 35 },
    knee: { flex: 157 },
    ankle: { dorsi: -37 },
    lumbar: { flex: 28 },
    thorax: { flex: 28 },
    neck: { flex: 30 },
    shoulder: { flex: 66, abd: -31, rot: 6 },
    elbow: { flex: 70 },
    wrist: { pron: 90 },
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

  // Lying on the back, knees bent, the soles together on the mat: the start of Supta Baddha Konasana.
  supine_feet_together: {
    root: { pitch: -90 },
    hip: { flex: 51, abd: 0 },
    knee: { flex: 117 },
    ankle: { dorsi: -21 },
    shoulder: { abd: 14, rot: -80, flex: -35 },
  },
  // Reclined bound angle: soles together close to the pelvis, knees falling open, feet on their
  // outer edges, arms resting beside the body.
  supta_baddha_konasana: {
    root: { pitch: -90 },
    hip: { flex: 50, abd: 8, rot: 62 },
    knee: { flex: 121 },
    ankle: { dorsi: -25 },
    shoulder: { abd: 18, rot: -80, flex: -35 },
  },
  // Supta Baddha Konasana with a block (on its long edge) under each outer thigh: the hips rest
  // open without being held, the restorative form.
  supta_baddha_konasana_blocks: {
    root: { pitch: -90 },
    hip: { flex: 50, abd: 8, rot: 61 },
    knee: { flex: 120 },
    ankle: { dorsi: -25 },
    shoulder: { abd: 45, rot: -80, flex: -35 },
  },
  // Legs up the wall, knees bent and soles flat on the wall: the start (and the way out).
  viparita_karani_bent: {
    root: { pitch: -90 },
    hip: { flex: 124 },
    knee: { flex: 81 },
    ankle: { dorsi: 17 },
    shoulder: { abd: 52, rot: 80, flex: -45 },
  },
  // Legs up the wall: heels and calves resting on the wall, buttocks a little away from it, knees
  // soft, arms out to the sides, palms up.
  viparita_karani: {
    root: { pitch: -90 },
    hip: { flex: 90 },
    knee: { flex: 7 },
    ankle: { dorsi: -10 },
    shoulder: { abd: 52, rot: 80, flex: -45 },
  },
  // Supported bridge: the sacrum rests on a block lying flat, hips lower than in Setu
  // Bandha, the legs and back let go (restorative).
  setu_bandha_block: {
    root: { pitch: -93 },
    hip: { flex: 39 },
    knee: { flex: 130 },
    ankle: { dorsi: 1 },
    lumbar: { flex: -11 },
    thorax: { flex: 4 },
    neck: { flex: 35 },
    shoulder: { flex: -17, abd: 6 },
    wrist: { pron: 90 },
  },
  // ---------------- Seated ----------------
  // The steps into Ardha Matsyendrasana: right knee drawn up with the foot flat on its own side,
  // the foot lifted over the left shin (via), then planted outside the left knee, trunk still facing
  // forward, hands beside the hips. Going straight from Dandasana swept the foot through the left leg.
  ardha_matsyendrasana_knee_up: {
    hip_L: { flex: 91 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 129 },
    knee_R: { flex: 79 },
    ankle_R: { dorsi: -47 },
    lumbar: { flex: -4 },
    shoulder: { flex: -19, abd: 10 },
    wrist: { ext: 74 },
  },
  ardha_matsyendrasana_lift: {
    root: { pitch: -17 },
    hip_L: { flex: 74 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 131, abd: -40, rot: -15 },
    knee_R: { flex: 113 },
    ankle_R: { dorsi: -10 },
    lumbar: { flex: 4 },
    shoulder: { flex: -16, abd: 10 },
    wrist: { ext: 96 },
  },
  ardha_matsyendrasana_crossed: {
    root: { pitch: -4 },
    hip_L: { flex: 87 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 127, abd: -31, rot: -29 },
    knee_R: { flex: 117 },
    ankle_R: { dorsi: -23 },
    lumbar: { flex: 1 },
    shoulder: { flex: -15, abd: 10 },
    wrist: { ext: 80 },
    shoulder_L: { abd: 9 },
    shoulder_R: { abd: 9 },
  },
  // The left hand leaves the floor before it reaches for the right knee, as in Navasana: first the
  // shoulder extends a little (hand lifted, arm straight), then the elbow bends. Swinging the arm
  // straight from the floor to the knee swept the fingers through the floor and lifted the body.
  ardha_matsyendrasana_hand_off: {
    root: { pitch: -6 },
    hip_L: { flex: 85 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 125, abd: -31, rot: -29 },
    knee_R: { flex: 117 },
    ankle_R: { dorsi: -23 },
    lumbar: { flex: 3 },
    shoulder: { flex: -16, abd: 10 },
    shoulder_L: { flex: -26 },
    wrist: { ext: 80 },
    wrist_L: { ext: 90 },
  },
  ardha_matsyendrasana_hand_up: {
    root: { pitch: -6 },
    hip_L: { flex: 85 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 125, abd: -31, rot: -29 },
    knee_R: { flex: 117 },
    ankle_R: { dorsi: -23 },
    lumbar: { flex: 3 },
    shoulder: { flex: -16, abd: 10 },
    shoulder_L: { flex: -30 },
    elbow_L: { flex: 75 },
    wrist: { ext: 80 },
    wrist_L: { ext: 90 },
  },
  // Half lord of the fishes, beginner form (bottom leg straight): from Dandasana the right foot is
  // planted outside the left knee, the trunk turns to the right, the left hand holds the outside of
  // the right knee, the right hand rests on the floor behind the pelvis.
  ardha_matsyendrasana: {
    hip_L: { flex: 85 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 125, abd: -33, rot: -29 },
    knee_R: { flex: 117 },
    ankle_R: { dorsi: -29 },
    lumbar: { flex: 2, rot: -5 },
    thorax: { rot: -28 },
    neck: { rot: -25 },
    shoulder_L: { flex: 24, abd: -17, rot: 1 },
    elbow_L: { flex: 53 },
    shoulder_R: { flex: -24, abd: 6 },
    wrist_R: { ext: 87 },
    elbow_R: { flex: 16 },
    root: { pitch: -6 },
  },
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
  // Dandasana and Paschimottanasana sitting on a folded blanket: the sit bones raised a few cm so
  // the pelvis can tip forward over the thighs.
  dandasana_blanket: {
    hip: { flex: 87 },
    ankle: { dorsi: -1 },
    lumbar: { flex: -4 },
    shoulder: { flex: -4, abd: 10 },
    wrist: { ext: 71 },
    scapula: { elev: -1 },
  },
  paschimottanasana_blanket: {
    root: { pitch: 46 },
    hip: { flex: 133 },
    ankle: { dorsi: 14 },
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

// Props a pose rests on (blocks, bolster, folded blanket, wall – see src/anatomy/props.js), in the
// pose's own frame: pelvis at x = z = 0, floor at y = 0, body facing +Z, the model's left +X.
export const POSE_PROPS = {
  // a block on its end in front of and inside the front (left) foot, under the lower hand
  trikonasana_block: [{ type: 'block', stand: 'end', at: [0.56, 0.12], yaw: 90 }],
  // a folded blanket under the sit bones, lengthwise
  dandasana_blanket: [{ type: 'blanket', at: [0, -0.1], yaw: 90 }],
  paschimottanasana_blanket: [{ type: 'blanket', at: [0, -0.1], yaw: 90 }],
  // a round bolster lengthwise between the knees, under the belly, chest and forehead, raised on a
  // flat block under each end
  balasana_bolster: [
    { type: 'block', stand: 'flat', at: [0, 0.16], yaw: 90 },
    { type: 'block', stand: 'flat', at: [0, 0.64], yaw: 90 },
    { type: 'bolster', at: [0, 0.4], yaw: 90, y: 0.075 },
  ],
  // a block lying flat (its lowest height) under the sacrum
  setu_bandha_block: [{ type: 'block', stand: 'flat', at: [0, 0.03] }],
  // a block on its long edge under each outer thigh, along the thigh
  supta_baddha_konasana_blocks: [
    { type: 'block', stand: 'side', at: [0.3, 0.11], yaw: -37 },
    { type: 'block', stand: 'side', at: [-0.3, 0.11], yaw: 37 },
  ],
  // the wall a little beyond the buttocks (legs up the wall)
  viparita_karani_bent: [{ type: 'wall', at: [0, 0.15], normal: [0, -1] }],
  viparita_karani: [{ type: 'wall', at: [0, 0.15], normal: [0, -1] }],
};

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
  uttanasana_hands_wide: {
    support: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    balance: true,
    // palms beside the feet, as wide as in Plank (see ashwa_sanchalanasana)
    rel: [['wrist_R', 'wrist_L', [0.33, 0]], ['wrist_L', 'ankle_L', [-0.086, -0.2]]],
    params: ['root.pitch&hip.flex', 'shoulder.flex', 'shoulder.abd', 'elbow.flex'],
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
  utthita_parsvakonasana: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    rel: [['ankle_L', 'ankle_R', [-1.0, 0]]], // the Warrior II stance
    dir: [
      ['ankle_L', [0, 0, 1], [1, 0, 0]], // front foot points to the front of the mat
      ['ankle_R', [0, 0, 1], [0.3, 0, 1]], // back foot turned in slightly
      ['thorax', [0, 0, 1], [0, 0, 1]], // chest open to the long side
      ['shoulder_R', [0, -1, 0], [0.75, 0.66, 0]], // top arm on the line of the back leg
      ['thorax', [0, 1, 0], [0.75, 0.66, 0]], // trunk on the same line (not curled up over the thigh)
      ['lumbar', [0, 1, 0], [0.7, 0.72, 0]], // the pelvis tilts with it: a long side, no banana curve
    ],
    above: [['knee_L', 'ankle_L']],
    // forearm resting along the front thigh: elbow just above the knee, wrist toward the hip
    at: [['elbow_L', 'hip_L', [0, -0.3, 0.09]], ['wrist_L', 'hip_L', [0, -0.08, 0.1]]],
    params: ['root.roll&hip_L.abd&-hip_R.abd', 'hip_L.flex', 'knee_L.flex', 'ankle_L.dorsi', 'hip_R.flex', 'hip_R.abd', 'ankle_R.dorsi', 'lumbar.side', 'thorax.side', 'thorax.rot', 'shoulder_L.flex', 'shoulder_L.abd', 'shoulder_L.rot', 'elbow_L.flex', 'shoulder_R.abd', 'shoulder_R.flex'],
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
  trikonasana_block: {
    support: ['ankle_L', 'ankle_R', 'wrist_L'],
    onProp: ['wrist_L'], // the hand on the block, not on the floor beside it
    flat: ['ankle_L', 'ankle_R', 'ankle_L', 'ankle_R'], // feet flat (weighted twice)
    rel: [['ankle_L', 'ankle_R', [-0.9, 0]], ['ankle_L', 'wrist_L', [0.07, 0.12]]],
    dir: [
      ['ankle_L', [0, 0, 1], [1, 0, 0]],
      ['ankle_R', [0, 0, 1], [0.3, 0, 1]],
      ['thorax', [0, 0, 1], [0, 0, 1]],
      ['shoulder_R', [0, -1, 0], [0, 1, 0]],
      ['shoulder_L', [0, -1, 0], [0, -1, 0]], // lower arm hangs straight down to the block
    ],
    params: ['root.roll', 'hip_L.abd', 'hip_R.abd', 'hip_R.rot', 'ankle_L.dorsi', 'ankle_R.dorsi', 'lumbar.side', 'thorax.side', 'shoulder_L.abd', 'shoulder_L.flex', 'shoulder_R.abd', 'wrist_L.ext'],
  },
  trikonasana_block_above: { support: ['ankle_L', 'ankle_R'], flat: ['ankle_L', 'ankle_R'], params: ['ankle_L.dorsi', 'ankle_R.dorsi'] },
  trikonasana_block_reach: { support: ['ankle_L', 'ankle_R'], flat: ['ankle_L', 'ankle_R'], params: ['ankle_L.dorsi', 'ankle_R.dorsi'] },
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
  ashwa_sanchalanasana: {
    support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'wrist_L', 'wrist_R'],
    balance: true,
    // hands as wide as in Plank, front foot where it is in uttanasana_hands_wide, ball of the back
    // foot where it is in Plank (the ankle joint target is offset for the foot angle)
    rel: [['wrist_R', 'wrist_L', [0.33, 0]], ['wrist_L', 'ankle_L', [-0.086, -0.2]], ['wrist_L', 'ankle_R', [-0.244, -1.2]]],
    params: ['root.pitch', 'hip_L.flex', 'knee_L.flex', 'ankle_L.dorsi', 'hip_R.flex', 'ankle_R.dorsi', 'shoulder.flex', 'shoulder.abd', 'lumbar.flex', 'thorax.flex'],
  },
  surya_step_mid: {
    support: ['wrist_L', 'wrist_R', 'ankle_L'],
    flat: ['ankle_L', 'wrist_L', 'wrist_R'],
    rel: [['wrist_R', 'wrist_L', [0.33, 0]], ['wrist_L', 'ankle_L', [-0.086, -0.2]]],
    // arms held at their interpolated angles so every joint moves one way through the step
    params: ['root.pitch', 'hip_L.flex', 'knee_L.flex', 'ankle_L.dorsi', 'lumbar.flex'],
  },
  surya_step_q1: {
    support: ['wrist_L', 'wrist_R', 'ankle_L'],
    flat: ['ankle_L', 'wrist_L', 'wrist_R'],
    rel: [['wrist_R', 'wrist_L', [0.33, 0]], ['wrist_L', 'ankle_L', [-0.086, -0.2]]],
    // arms held at their interpolated angles so every joint moves one way through the step
    params: ['root.pitch', 'hip_L.flex', 'knee_L.flex', 'ankle_L.dorsi', 'lumbar.flex'],
  },
  surya_step_q3: {
    support: ['wrist_L', 'wrist_R', 'ankle_L'],
    flat: ['ankle_L', 'wrist_L', 'wrist_R'],
    rel: [['wrist_R', 'wrist_L', [0.33, 0]], ['wrist_L', 'ankle_L', [-0.086, -0.2]]],
    // arms held at their interpolated angles so every joint moves one way through the step
    params: ['root.pitch', 'hip_L.flex', 'knee_L.flex', 'ankle_L.dorsi', 'lumbar.flex'],
  },
  ashwa_sanchalanasana_long: {
    support: ['wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'wrist_L', 'wrist_R'],
    balance: true,
    // hands as wide as in Plank, front foot where it is in uttanasana_hands_wide, ball of the back
    // foot where it is in Downward Dog (heel down there, on the toes here: the ankle sits 10 cm further forward)
    rel: [['wrist_R', 'wrist_L', [0.33, 0]], ['wrist_L', 'ankle_L', [-0.086, -0.2]], ['wrist_L', 'ankle_R', [-0.244, -1.269]]],
    params: ['root.pitch', 'hip_L.flex', 'knee_L.flex', 'ankle_L.dorsi', 'hip_R.flex', 'knee_R.flex', 'ankle_R.dorsi', 'shoulder.flex', 'shoulder.abd', 'lumbar.flex', 'thorax.flex'],
  },

  surya_step_back_L: {
    support: ['wrist_L', 'wrist_R', 'ankle_R'],
    flat: ['wrist_L', 'wrist_R'],
    rel: [['wrist_R', 'wrist_L', [0.33, 0]]],
    params: ['root.pitch', 'shoulder.flex', 'hip_R.flex', 'ankle_R.dorsi'],
  },
  surya_step_up_L: {
    support: ['wrist_L', 'wrist_R', 'ankle_R'],
    flat: ['wrist_L', 'wrist_R'],
    rel: [['wrist_R', 'wrist_L', [0.33, 0]]],
    params: ['root.pitch', 'shoulder.flex', 'hip_R.flex', 'ankle_R.dorsi'],
  },
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
  balasana_bolster: {
    support: ['hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R', 'lumbar', 'head', 'wrist_L', 'wrist_R'],
    onProp: ['lumbar', 'thorax', 'head'], // belly, chest (within ~2 cm) and forehead on the bolster
    // sit bones toward the heels (weakly: with the knees wide they sink between the feet)
    at: [['pelvis', 'knee_L', [-0.07, -0.3, -0.1], 0.2], ['pelvis', 'knee_R', [0.07, -0.3, -0.1], 0.2]],
    // forearms on the mat on either side of the bolster, hands forward
    rel: [['pelvis', 'wrist_L', [0.27, 0.5]], ['pelvis', 'wrist_R', [-0.27, 0.5]]],
    params: ['shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'elbow.flex', 'root.pitch', 'hip.flex', 'neck.flex', 'lumbar.flex&thorax.flex'],
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
  // hands resting on the mat beside the body
  supine: { support: ['pelvis', 'thorax', 'wrist_L', 'wrist_R'], params: ['shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'elbow.flex'] },
  supine_knees: { support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['shoulder.flex'] },
  supine_feet_together: {
    support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['ankle_L', 'ankle_R'],
    // the feet side by side where they rest in Supta Baddha Konasana, so they do not slide as the knees open
    rel: [['ankle_R', 'ankle_L', [0.16, 0]], ['pelvis', 'ankle_L', [0.08, 0.4]]],
    params: ['hip.flex', 'hip.abd', 'knee.flex', 'ankle.dorsi', 'shoulder.flex'],
  },
  supta_baddha_konasana: {
    support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    // soles touching where they were with the knees up, heels toward the pelvis
    rel: [['ankle_R', 'ankle_L', [0.16, 0]]],
    dir: [
      ['hip_L', [0, -1, 0], [0.75, 0.35, 0.55]], // knees fall open
      ['hip_R', [0, -1, 0], [-0.75, 0.35, 0.55]],
      ['ankle_L', [0, -1, 0], [-0.85, -0.5, 0]], // soles face each other, feet on their outer edges
      ['ankle_R', [0, -1, 0], [0.85, -0.5, 0]],
    ],
    params: ['hip.abd', 'hip.rot', 'hip.flex', 'knee.flex', 'ankle.dorsi', 'shoulder.flex'],
  },
  setu_bandha_block: {
    support: ['pelvis', 'scapula_L', 'scapula_R', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], // sacrum on the block
    flat: ['ankle_L', 'ankle_R'],
    above: [['knee_L', 'ankle_L'], ['knee_R', 'ankle_R']],
    params: ['root.pitch&hip.flex', 'root.pitch', 'knee.flex', 'hip.flex', 'ankle.dorsi', 'shoulder.flex', 'neck.flex'],
  },
  supta_baddha_konasana_blocks: {
    support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R', 'hip_L', 'hip_R', 'wrist_L', 'wrist_R'], // the thighs on the blocks
    rel: [['ankle_R', 'ankle_L', [0.16, 0]]],
    params: ['hip.abd', 'hip.rot', 'shoulder.flex'],
  },
  viparita_karani_bent: {
    support: ['pelvis', 'thorax', 'head', 'wrist_L', 'wrist_R'],
    wall: ['ankle_L', 'ankle_R'], // soles on the wall
    params: ['hip.flex', 'knee.flex', 'ankle.dorsi', 'shoulder.flex', 'shoulder.abd', 'elbow.flex'],
  },
  viparita_karani: {
    support: ['pelvis', 'thorax', 'head', 'wrist_L', 'wrist_R'],
    wall: ['ankle_L', 'ankle_R'], // heels on the wall (the calves come within a few cm)
    params: ['hip.flex', 'knee.flex', 'shoulder.flex', 'shoulder.abd', 'elbow.flex'],
  },
  ardha_matsyendrasana_knee_up: {
    support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['ankle_R', 'wrist_L', 'wrist_R'],
    // right foot beside the left shin, just below the knee; hands where they are in Dandasana
    rel: [['knee_L', 'ankle_R', [-0.15, 0.2]], ['pelvis', 'wrist_L', [0.25, -0.12]], ['pelvis', 'wrist_R', [-0.25, -0.12]]],
    params: ['hip_R.flex', 'knee_R.flex', 'ankle_R.dorsi', 'shoulder.flex', 'wrist.ext'],
  },
  ardha_matsyendrasana_lift: {
    support: ['pelvis', 'ankle_L', 'wrist_L', 'wrist_R'],
    flat: ['wrist_L', 'wrist_R'],
    rel: [['pelvis', 'wrist_L', [0.25, -0.12]], ['pelvis', 'wrist_R', [-0.25, -0.12]]], // hands stay where they are in Dandasana
    params: ['shoulder.flex', 'wrist.ext', 'root.pitch&hip_L.flex&hip_R.flex', 'hip_L.flex'],
  },
  ardha_matsyendrasana_crossed: {
    support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['ankle_R', 'wrist_L', 'wrist_R'],
    params: ['root.pitch&hip_L.flex&hip_R.flex&-lumbar.flex', 'hip_R.flex', 'hip_R.abd', 'knee_R.flex', 'ankle_R.dorsi', 'shoulder.flex', 'shoulder_L.abd', 'shoulder_R.abd', 'wrist.ext'],
    rel: [['knee_L', 'ankle_R', [0.1, -0.04]], ['pelvis', 'wrist_L', [0.25, -0.12]], ['pelvis', 'wrist_R', [-0.25, -0.12]]],
  },
  ardha_matsyendrasana_hand_off: { support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_R'], params: [] },
  ardha_matsyendrasana_hand_up: { support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_R'], params: [] },
  ardha_matsyendrasana: {
    support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_R'],
    flat: ['ankle_R', 'wrist_R'],
    rel: [
      ['knee_L', 'ankle_R', [0.12, -0.02]], // right foot planted just outside the left knee
      ['pelvis', 'wrist_R', [-0.12, -0.22]], // right hand on the floor behind the right hip
    ],
    at: [['wrist_L', 'knee_R', [-0.07, 0.02, 0]]], // left hand on the outside of the right knee
    dir: [
      ['thorax', [0, 1, 0], [0, 1, 0]], // spine tall
      ['thorax', [0, 0, 1], [-0.6, 0, 0.8]], // chest turned about 35° to the right
    ],
    params: ['root.pitch&hip_L.flex&hip_R.flex&-lumbar.flex', 'hip_R.flex', 'hip_R.abd', 'hip_R.rot', 'knee_R.flex', 'ankle_R.dorsi', 'hip_L.flex', 'lumbar.rot', 'thorax.rot', 'shoulder_L.flex', 'shoulder_L.abd', 'shoulder_L.rot', 'elbow_L.flex', 'shoulder_R.flex', 'shoulder_R.abd', 'elbow_R.flex', 'wrist_R.ext'],
  },
  dandasana_blanket: {
    support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    onProp: ['pelvis'], // sit bones on the blanket
    params: ['hip.flex', 'shoulder.flex', 'ankle.dorsi', 'scapula.elev', 'wrist.ext'],
  },
  paschimottanasana_blanket: {
    support: ['pelvis', 'ankle_L', 'ankle_R'],
    onProp: ['pelvis'],
    params: ['hip.flex', 'root.pitch&hip.flex', 'ankle.dorsi'],
  },
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
