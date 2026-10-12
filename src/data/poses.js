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
  // Savasana with a bolster under the knees: hips and knees softly bent, the lower back can settle
  supine_bolster: {
    root: { pitch: -90 },
    hip: { flex: 29, rot: 15 },
    knee: { flex: 62 },
    ankle: { dorsi: -28 },
    shoulder: { abd: 18, flex: -11, rot: 9 },
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
    ankle: { dorsi: -57 },
    shoulder: { abd: 12, rot: -80 },
    neck: { flex: -10 },
    lumbar: { flex: -8 },
    thorax: { flex: 10 },
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
  // Big toe pose (Padangusthasana): Uttanasana with the feet hip-width apart, the first two fingers
  // hooked around the big toes, elbows bent out to the sides drawing the trunk long toward the legs
  // (no finger–toe force in the physics: the hands are not a support).
  padangusthasana: {
    root: { pitch: 95 },
    hip: { flex: 107, abd: -7 },
    lumbar: { flex: 20 },
    thorax: { flex: 15 },
    neck: { flex: 15 },
    shoulder: { flex: 64, abd: 137, rot: 14 },
    ankle: { dorsi: 0 },
    elbow: { flex: 35 },
    wrist: { ext: 10, pron: 90 },
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
  // Chair with the palms together in front of the chest: the step before Revolved chair.
  utkatasana_prayer: {
    root: { pitch: 38 },
    hip: { flex: 95 },
    knee: { flex: 85 },
    ankle: { dorsi: 28 },
    lumbar: { flex: -6 },
    thorax: { flex: -4 },
    shoulder: { flex: 23, abd: 21, rot: -39 },
    elbow: { flex: 103 },
    wrist: { ext: 70 },
  },
  // Revolved chair (Parivrtta Utkatasana), turning to the right, palms together at the chest: the
  // knees stay level and the pelvis square, the turn comes from the chest (thoracic rotation). The
  // classic form hooks the left elbow outside the right knee – an arm-on-leg contact the physics
  // lacks, so the elbow hovers beside the knee here.
  parivrtta_utkatasana: {
    root: { pitch: 45 },
    hip: { flex: 100 },
    knee: { flex: 85 },
    ankle: { dorsi: 33 },
    lumbar: { flex: 0, rot: -8 },
    thorax: { flex: 5, rot: -40 },
    neck: { rot: -20 },
    shoulder: { flex: 21, abd: 19, rot: -38 },
    elbow: { flex: 103 },
    wrist: { ext: 70 },
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
  // Standing with the back against a wall, feet a step in front of it: the start of utkatasana_wall.
  tadasana_wall: {
    root: { pitch: -5 },
    hip: { flex: 23 },
    ankle: { dorsi: -25 },
    shoulder: { abd: 6 },
    lumbar: { flex: -2 },
    thorax: { flex: 22 },
  },
  // Utkatasana with the back against a wall: buttocks and back on the wall, feet forward, trunk
  // upright, arms up.
  utkatasana_wall: {
    root: { pitch: -6 },
    hip: { flex: 70 },
    knee: { flex: 84 },
    ankle: { dorsi: 11 },
    shoulder: { flex: 160, abd: 4 },
    scapula: { elev: 8 },
    lumbar: { flex: 5 },
    thorax: { flex: 10 },
  },
  // Extended hand-to-big-toe with a strap (Utthita Hasta Padangusthasana): standing on the right leg,
  // the straight left leg raised forward toward hip height, the strap around the ball of the left
  // foot held in the left hand, right hand on the hip, trunk upright.
  utthita_hasta_padangusthasana: {
    hip_L: { flex: 82 },
    knee_L: { flex: 0 },
    ankle_L: { dorsi: 10 },
    shoulder_L: { flex: 55, abd: 5 },
    elbow_L: { flex: 10 },
    wrist_L: { pron: 90 },
    shoulder_R: { abd: 35, rot: -20 },
    elbow_R: { flex: 100 },
    ankle_R: { dorsi: 3 },
  },
  // Standing on the right leg, left knee lifted, the strap around the left foot in the left hand:
  // passed through on the way into Utthita Hasta Padangusthasana.
  utthita_hasta_padangusthasana_knee: {
    hip_L: { flex: 80, rot: 0 },
    knee_L: { flex: 100 },
    ankle_L: { dorsi: 0 },
    shoulder_L: { flex: 35, abd: 5 },
    elbow_L: { flex: 30 },
    wrist_L: { pron: 90 },
    shoulder_R: { abd: 35, rot: -20 },
    elbow_R: { flex: 100 },
    ankle_R: { dorsi: 3 },
  },
  // Dancer (Natarajasana) with a strap: standing on the right leg, the left knee bent and the foot
  // lifted behind, the strap around the ball of the left foot held in the left hand behind; the trunk
  // tips forward as the foot presses back into the strap, right arm reaching forward.
  natarajasana: {
    root: { pitch: 32 },
    hip_R: { flex: 40 },
    hip_L: { flex: -13 },
    knee_L: { flex: 110 },
    ankle_L: { dorsi: 0 },
    lumbar: { flex: -14 },
    thorax: { flex: -8 },
    neck: { flex: -15 },
    shoulder_L: { flex: -40, abd: 10 },
    elbow_L: { flex: 15 },
    wrist_L: { pron: 90 },
    shoulder_R: { flex: 150 },
    ankle_R: { dorsi: -5 },
  },
  // Standing on the right leg, left heel drawn up behind toward the buttock, strap in the left hand:
  // passed through on the way into Natarajasana.
  natarajasana_knee: {
    hip_L: { flex: 0 },
    knee_L: { flex: 110 },
    ankle_L: { dorsi: -10 },
    shoulder_L: { flex: -20, abd: 10 },
    elbow_L: { flex: 20 },
    wrist_L: { pron: 90 },
    shoulder_R: { flex: 60 },
    ankle_R: { dorsi: 3 },
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
  // Warrior I in the stance of Sun Salutation B: the left foot where it stepped up between the
  // hands, the right heel dropped and turned out ~45° where the ball of the foot was.
  virabhadrasana_1_long: {
    root: { pitch: 33 },
    hip_L: { flex: 110 },
    knee_L: { flex: 77 },
    ankle_L: { dorsi: 0 },
    hip_R: { flex: -21, abd: 17, rot: 44 },
    ankle_R: { dorsi: 33 },
    lumbar: { flex: -38 },
    thorax: { flex: -10 },
    neck: { flex: -10 },
    shoulder: { flex: 170, abd: 6 },
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
  // Standing side bend: Urdhva Hastasana bending to the left, arms overhead, feet together.
  parsva_tadasana: {
    shoulder: { flex: 172, abd: 4, rot: 0 },
    scapula: { elev: 10 },
    lumbar: { side: 8 },
    thorax: { side: 18 },
    neck: { side: 6 },
    ankle: { dorsi: 3 },
  },
  // Side bend to the right (mirror of parsva_tadasana), for Chandra Namaskar.
  parsva_tadasana_R: {
    shoulder: { flex: 172, abd: 4, rot: 0 },
    scapula: { elev: 10 },
    lumbar: { side: -8 },
    thorax: { side: -18 },
    neck: { side: -6 },
    ankle: { dorsi: 3 },
  },
  // Pyramid stance: left foot forward, right foot about a leg length behind and turned out ~45°,
  // both legs straight, hips square to the front, trunk upright, hands on the hips area (arms down).
  parsvottanasana_stance: {
    ...ARMS_DOWN,
    hip_L: { flex: 32, abd: 8 },
    hip_R: { flex: -30, rot: 27, abd: 9 },
    ankle_L: { dorsi: -32 },
    ankle_R: { dorsi: 26 },
  },
  // Pyramid (Parsvottanasana): the pyramid stance, trunk folded long over the front leg from the
  // hips, palms on the floor either side of the front foot.
  parsvottanasana: {
    root: { pitch: 88 },
    // the stance legs (hip_L 32/8/0, hip_R −30/9/27) expressed for the pelvis pitched 88°
    hip_L: { flex: 120, abd: 0, rot: 8 },
    hip_R: { flex: 62, abd: -27, rot: 9 },
    ankle_L: { dorsi: -17 },
    ankle_R: { dorsi: 23 },
    lumbar: { flex: 12 },
    thorax: { flex: 12 },
    neck: { flex: 10 },
    shoulder: { flex: 108, abd: 13 },
    wrist: { ext: 80, pron: 180 },
    elbow: { flex: -1 },
  },
  // Wide-legged stance, feet parallel about 1.1 m apart, hands down: the start of Prasarita Padottanasana.
  // Revolved triangle (Parivrtta Trikonasana), left leg in front: the Pyramid stance with straight
  // legs, hips square, the trunk long and level over the front leg and turned to the left; the right
  // hand on a block (on its end) inside the left foot under the right shoulder, the left arm straight
  // up, chest open to the left. Legs as in parsvottanasana (angles for the pelvis pitched 88°).
  parivrtta_trikonasana: {
    root: { pitch: 88 },
    hip_L: { flex: 120, abd: 0, rot: 8 },
    hip_R: { flex: 62, abd: -27, rot: 9 },
    ankle_L: { dorsi: -33 },
    ankle_R: { dorsi: 24 },
    lumbar: { flex: -14, rot: 23 },
    thorax: { flex: -5, rot: 42 },
    neck: { rot: 25 },
    shoulder_R: { flex: 31, abd: 58 },
    wrist_R: { ext: 48, pron: 180 },
    shoulder_L: { flex: -11, abd: 97, rot: -90 },
  },
  prasarita_stance: {
    ...ARMS_DOWN,
    hip: { abd: 38, rot: -6 },
    ankle: { dorsi: 0 },
  },
  // Wide-legged forward fold: legs straight and wide, trunk folded from the hips, palms on the floor
  // between the feet under the shoulders, crown of the head toward the mat.
  prasarita_padottanasana: {
    root: { pitch: 100 },
    // the stance legs (abd 38, rot −6) expressed for the pelvis pitched 100°
    hip: { flex: 98, abd: -0, rot: 38 },
    lumbar: { flex: 11 },
    thorax: { flex: 24 },
    neck: { flex: 20 },
    shoulder: { flex: 65, abd: 48 },
    elbow: { flex: 47 },
    wrist: { ext: 85, pron: 180 },
    ankle: { dorsi: 0 },
  },
  // Wide stance with the toes turned out ~45°, legs straight: the start of the Goddess pose.
  // Side lunge (Skandasana), on the left leg: wide stance (as Prasarita), the left knee bent over
  // the toes (foot turned out ~30°), hips lowered toward the left heel; the right leg straight to the
  // side, heel down, toes and kneecap turned up; palms together in front of the chest. Hip angles
  // built from where the knees and feet should be (the stance is too narrow for the full-depth squat:
  // with the right leg straight the hips stay ~50 cm high).
  skandasana: {
    root: { pitch: 25 },
    hip_L: { flex: 87, abd: 8, rot: 44 },
    knee_L: { flex: 85 },
    ankle_L: { dorsi: 10 },
    hip_R: { flex: 39, abd: 32, rot: 49 },
    knee_R: { flex: 4 },
    ankle_R: { dorsi: 5 },
    lumbar: { flex: -5 },
    thorax: { flex: -5 },
    shoulder: { flex: 20, abd: 18, rot: -38 },
    elbow: { flex: 103 },
    wrist: { ext: 70 },
  },  // Side lunge to the right (mirror of skandasana), for Chandra Namaskar.
  skandasana_R: {
    root: { pitch: 25 },
    hip_R: { flex: 87, abd: 8, rot: 44 },
    knee_R: { flex: 85 },
    ankle_R: { dorsi: 10 },
    hip_L: { flex: 39, abd: 32, rot: 49 },
    knee_L: { flex: 4 },
    ankle_L: { dorsi: 5 },
    lumbar: { flex: -5 },
    thorax: { flex: -5 },
    shoulder: { flex: 20, abd: 18, rot: -38 },
    elbow: { flex: 103 },
    wrist: { ext: 70 },
  },

  // Garland / yogi squat (Malasana): feet a little wider than the hips, toes turned out, heels down,
  // hips sunk low between the knees, trunk leaning slightly forward and long, palms together at the
  // chest with the elbows inside the knees (the elbow-on-knee press is a contact the physics lacks).
  // Hip angles built from where the feet and knees go.
  malasana: {
    root: { pitch: 42 },
    hip: { flex: 145, abd: -42, rot: 30 },
    knee: { flex: 134 },
    ankle: { dorsi: 44 },
    lumbar: { flex: -27 },
    thorax: { flex: -5 },
    shoulder: { flex: 23, abd: 21, rot: -39 },
    elbow: { flex: 103 },
    wrist: { ext: 70 },
  },
  utkata_konasana_stance: {
    ...ARMS_DOWN,
    hip: { abd: 33, rot: 40 },
    ankle: { dorsi: -25 },
  },
  // Goddess: wide stance, toes turned out, knees bent over the ankles, thighs toward level, pelvis
  // straight down between the feet, trunk upright, arms in "cactus" (elbows at shoulder height, bent 90°).
  utkata_konasana: {
    hip: { flex: 66, abd: 30, rot: 57 },
    knee: { flex: 95 },
    ankle: { dorsi: -2 },
    shoulder: { abd: 90, rot: 90 },
    elbow: { flex: 90 },
    root: { pitch: -14 },
    lumbar: { flex: 14 },
  },
  // Warrior III: standing on the left leg, trunk, arms and the right leg in one level line.
  virabhadrasana_3: {
    root: { pitch: 79 },
    hip_L: { flex: 101 },
    knee_L: { flex: 4 },
    hip_R: { flex: -11 },
    ankle_R: { dorsi: 0 },
    shoulder: { flex: 175 },
    neck: { flex: -10 },
    ankle_L: { dorsi: -15 },
    lumbar: { flex: 11 },
  },
  // Warrior III with the hands on two blocks (on their ends) under the shoulders.
  virabhadrasana_3_blocks: {
    root: { pitch: 91 },
    hip_L: { flex: 84 },
    knee_L: { flex: 4 },
    hip_R: { flex: 1 },
    ankle_R: { dorsi: 0 },
    shoulder: { flex: 90 },
    wrist: { ext: 51, pron: 180 },
    neck: { flex: -10 },
    ankle_L: { dorsi: 15 },
  },
  // Reverse warrior: Warrior II legs, the trunk arching back over the back (right) leg, the right
  // hand resting on the back thigh, the left arm reaching up and back over the ear, gaze up.
  viparita_virabhadrasana: {
    root: { yaw: 33 },
    hip_L: { flex: 78, abd: 2, rot: 46 },
    knee_L: { flex: 86 },
    ankle_L: { dorsi: 7 },
    hip_R: { flex: -24, abd: 51, rot: 10 },
    ankle_R: { dorsi: 5 },
    lumbar: { side: -18, rot: -12 },
    thorax: { side: -12, rot: -17, flex: -6 },
    neck: { rot: 20, flex: -10 },
    shoulder_L: { abd: 167, rot: -90, flex: -7 },
    shoulder_R: { abd: 39, rot: -60, flex: 4 },
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
  // Extended side angle with the lower hand on a block (on its end) inside the front foot: the
  // trunk long over the front thigh, the lower arm straight down to the block.
  utthita_parsvakonasana_block: {
    root: { yaw: 33, roll: 21 },
    hip_L: { flex: 85, abd: 23, rot: 46 },
    knee_L: { flex: 94 },
    ankle_L: { dorsi: 8 },
    hip_R: { flex: -24, abd: 29, rot: 10 },
    ankle_R: { dorsi: 7 },
    lumbar: { side: 4, rot: -12 },
    thorax: { side: 32, rot: -39 },
    neck: { rot: -30 },
    shoulder_L: { abd: 76, flex: 13, rot: -90 },
    wrist_L: { ext: 49 },
    shoulder_R: { abd: 171, rot: -90, flex: 3 },
    scapula_R: { elev: 10 },
  },
  // Half moon (Ardha Chandrasana) on the left leg: standing leg straight, the trunk and the right
  // leg one level line over it, pelvis and chest open to the long side (+Z), the left hand on a
  // block under the shoulder, the right arm up, gaze forward. Static in the app: opening out of
  // Warrior III with the hand anchored on the block made the hand and the standing foot take turns
  // holding the body up mid-turn (a 5–7 cm jolt).
  ardha_chandrasana: {
    root: { roll: 79 },
    hip_L: { abd: 73, rot: 97 },
    hip_R: { abd: 14 },
    ankle_L: { dorsi: 9 },
    ankle_R: { dorsi: 0 },
    shoulder_L: { abd: 80, rot: -90 },
    shoulder_R: { abd: 101, rot: -90 },
    neck: { rot: 0 },
    wrist_L: { ext: 45 },
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
  // Low lunge, hands still down: the back (right) knee lowered from Ashwa Sanchalanasana onto the
  // mat, top of the back foot down. The step before the trunk lifts into Anjaneyasana.
  anjaneyasana_hands: {
    root: { pitch: 34 },
    lumbar: { flex: 18 },
    thorax: { flex: 14 },
    neck: { flex: -15 },
    hip_L: { flex: 149 },
    knee_L: { flex: 125 },
    ankle_L: { dorsi: 2 },
    hip_R: { flex: -10 },
    knee_R: { flex: 59 },
    ankle_R: { dorsi: -15 },
    shoulder: { flex: 72, abd: -3 },
    wrist: { ext: 80, pron: 180 },
  },
  // Low lunge (Anjaneyasana): back knee and top of the back foot on the mat, front knee over the
  // ankle, pelvis sinking forward, trunk upright, arms reaching up.
  anjaneyasana: {
    root: { pitch: 14 },
    lumbar: { flex: -10 },
    thorax: { flex: -8 },
    neck: { flex: -8 },
    hip_L: { flex: 123 },
    knee_L: { flex: 111 },
    ankle_L: { dorsi: 3 },
    hip_R: { flex: -22 },
    knee_R: { flex: 76 },
    ankle_R: { dorsi: 23 },
    shoulder: { flex: 170, abd: 4 },
    scapula: { elev: 8 },
  },  // Low lunge with the palms together in front of the chest: the step before the revolved lunge.
  anjaneyasana_prayer: {
    root: { pitch: 14 },
    lumbar: { flex: -10 },
    thorax: { flex: -8 },
    hip_L: { flex: 123 },
    knee_L: { flex: 111 },
    ankle_L: { dorsi: 3 },
    hip_R: { flex: -22 },
    knee_R: { flex: 76 },
    ankle_R: { dorsi: 25 },
    shoulder: { flex: 22, abd: 21, rot: -39 },
    elbow: { flex: 103 },
    wrist: { ext: 70 },
  },
  // Revolved side angle, back knee down (Parivrtta Parsvakonasana, the low-lunge form), left leg in
  // front: the trunk leans forward over the front thigh and turns to the left, palms together, the
  // right elbow beside the outer left knee (hooking it is an arm-on-leg contact the physics lacks).
  parivrtta_parsvakonasana: {
    root: { pitch: 50 },
    lumbar: { flex: 5, rot: 12 },
    thorax: { flex: 15, rot: 50 },
    neck: { flex: -15, rot: 20 },
    hip_L: { flex: 159 },
    knee_L: { flex: 111 },
    ankle_L: { dorsi: 3 },
    hip_R: { flex: 14 },
    knee_R: { flex: 76 },
    ankle_R: { dorsi: 25 },
    shoulder: { flex: 27, abd: 28, rot: -40 },
    elbow: { flex: 103 },
    wrist: { ext: 70 },
  },

  // High (crescent) lunge: the lunge legs of Ashwa Sanchalanasana, back leg straight on the ball of
  // the foot, trunk upright over the pelvis, arms reaching up.
  crescent_lunge: {
    root: { pitch: 18 },
    lumbar: { flex: -21 },
    thorax: { flex: -6 },
    neck: { flex: -8 },
    hip_L: { flex: 99 },
    knee_L: { flex: 80 },
    ankle_L: { dorsi: 2 },
    hip_R: { flex: -30 },
    knee_R: { flex: 16 },
    ankle_R: { dorsi: 40 },
    shoulder: { flex: 170, abd: 4 },
    scapula: { elev: 8 },
  },
  // Kneeling on the heels (Vajrasana): thighs resting on the calves, tops of the feet on the mat,
  // trunk upright, hands resting on the thighs.
  vajrasana: {
    hip: { flex: 91 },
    knee: { flex: 164 },
    ankle: { dorsi: -37 },
    shoulder: { flex: 14, abd: -10 },
    elbow: { flex: 9 },
    wrist: { pron: 160 },
    root: { pitch: 23 },
    lumbar: { flex: -16 },
    thorax: { flex: -2 },
  },
  // Hero pose (Virasana) sitting on a block (on its long edge) between the feet: knees together,
  // feet a little wider than the hips with the tops on the mat, trunk upright, hands on the thighs.
  // The model cannot sit on the floor between its heels (its knees would have to bend past 165°
  // around the thick calf and thigh), so the block is the default form here.
  virasana_block: {
    root: { pitch: 36 },
    hip: { flex: 105, abd: 24, rot: 5 },
    knee: { flex: 157 },
    ankle: { dorsi: -56 },
    lumbar: { flex: -29 },
    thorax: { flex: -2 },
    shoulder: { flex: 15, abd: -10 },
    elbow: { flex: 2 },
    wrist: { pron: 160 },
  },
  // Three-legged dog: Downward Dog with the left leg lifted in line with the trunk, hips level.
  eka_pada_adho_mukha_svanasana: {
    root: { pitch: 132 },
    hip_R: { flex: 94 },
    hip_L: { flex: 0 },
    knee: { flex: 0 },
    ankle_R: { dorsi: 38 },
    ankle_L: { dorsi: 0 },
    lumbar: { flex: -4 },
    thorax: { flex: -4 },
    shoulder: { flex: 177, rot: 20, abd: -6 },
    wrist: { ext: 42, pron: 180 },
    neck: { flex: 5 },
    scapula: { elev: 6 },
  },
  // Bird dog: from Tabletop the right arm reaches forward and the left leg back, both level with
  // the trunk; left hand, right knee and right foot stay down.
  dandayamana_bharmanasana: {
    root: { pitch: 78 },
    hip_R: { flex: 84, abd: 10 },
    knee_R: { flex: 90 },
    ankle_R: { dorsi: -70 },
    hip_L: { flex: -11 },
    knee_L: { flex: 0 },
    ankle_L: { dorsi: -20 },
    shoulder_L: { flex: 76, abd: -5 },
    wrist_L: { ext: 99, pron: 180 },
    shoulder_R: { flex: 168 },
    wrist_R: { pron: 90 },
    neck: { flex: -10 },
    head: { flex: -10 },
  },
  // Forearm plank: forearms parallel on the mat, elbows under the shoulders, body one straight
  // line on the toes.
  forearm_plank: {
    root: { pitch: 84 },
    hip: { flex: 0 },
    ankle: { dorsi: 26 },
    shoulder: { flex: 86 },
    elbow: { flex: 88 },
    wrist: { pron: 180 },
    neck: { flex: -12 },
  },
  forearm_plank_knees: {
    root: { pitch: 74 },
    hip: { flex: 0 },
    knee: { flex: 80 },
    ankle: { dorsi: -40 },
    shoulder: { flex: 76 },
    elbow: { flex: 88 },
    wrist: { pron: 180 },
    neck: { flex: -12 },
  },
  // All fours on the forearms: knees on the mat, elbows under the shoulders, forearms parallel,
  // toes tucked under – the start of Dolphin.
  tabletop_forearms_toes: {
    root: { pitch: 107 },
    hip: { flex: 109 },
    knee: { flex: 116 },
    ankle: { dorsi: 40 },
    shoulder: { flex: 113 },
    elbow: { flex: 83 },
    wrist: { pron: 180 },
    neck: { flex: -10 },
  },
  // halfway up: hips rising, knees just off the mat (passed through; keeps the forearms flat)
  ardha_pincha_mayurasana_mid: {
    root: { pitch: 129 },
    hip: { flex: 109 },
    knee: { flex: 60 },
    ankle: { dorsi: 25 },
    shoulder: { flex: 137 },
    elbow: { flex: 82 },
    wrist: { pron: 180 },
    neck: { flex: -20 },
    head: { flex: -8 },
  },
  // Handstand at the wall (Adho Mukha Vrksasana), chest to the wall (walked up from plank): hands
  // shoulder-width, arms straight overhead, body upside down and long, toes resting on the wall.
  adho_mukha_vrksasana_wall: {
    root: { pitch: 178 },
    hip: { flex: 0 },
    knee: { flex: 0 },
    ankle: { dorsi: -20 },
    lumbar: { flex: -5 },
    shoulder: { flex: 179, abd: 5 },
    elbow: { flex: 0 },
    wrist: { ext: 99, pron: 180 },
    neck: { flex: -20 },
  },
  // Forearm stand at the wall (Pincha Mayurasana), chest to the wall: forearms parallel on the mat as in
  // Dolphin, upper arms vertical, body upside down and long, toes resting on the wall.
  pincha_mayurasana_wall: {
    root: { pitch: 178 },
    hip: { flex: 0 },
    knee: { flex: 0 },
    ankle: { dorsi: -20 },
    lumbar: { flex: -5 },
    shoulder: { flex: 179 },
    elbow: { flex: 85 },
    wrist: { pron: 180 },
    neck: { flex: -45 },
    head: { flex: -20 },
  },
  ardha_pincha_mayurasana: {
    root: { pitch: 151 },
    hip: { flex: 109 },
    knee: { flex: 0 },
    ankle: { dorsi: -23 },
    shoulder: { flex: 160 },
    elbow: { flex: 82 },
    wrist: { pron: 180 },
    neck: { flex: -30 },
    head: { flex: -15 },
  },
  // Headstand prep (Salamba Sirsasana preparation): forearms down with the hands clasped (a triangle,
  // elbows shoulder-width), the crown of the head on the mat just in front of the hands; legs
  // straight, feet walked in so the hips rise over the shoulders.
  sirsasana_prep: {
    root: { pitch: 153 },
    hip: { flex: 113 },
    knee: { flex: 0 },
    ankle: { dorsi: -16 },
    shoulder: { flex: 156, abd: 12, rot: 35 },
    elbow: { flex: 80 },
    wrist: { pron: 90 },
    neck: { flex: 4 },
  },
  // Side plank (Vasisthasana) on the right hand: the Plank body turned onto its right side, chest
  // facing the model's left, right hand under the shoulder, feet staggered (left foot in front of
  // the right: stacking them needs the foot-on-foot contact the physics lacks), left arm up.
  // Wild thing (Camatkarasana): from side plank on the right hand, the left foot steps back behind
  // the right leg (knee bent, foot flat), the hips lift and the chest turns up into a backbend, the
  // left arm reaching overhead.
  camatkarasana: {
    root: { yaw: 90, roll: -79, pitch: -51 },
    hip_R: { flex: -25, abd: 13 },
    hip_L: { flex: -26, abd: -30 },
    knee_L: { flex: 54 },
    ankle_R: { dorsi: -61 },
    ankle_L: { dorsi: 15 },
    lumbar: { flex: 8 },
    thorax: { flex: -15 },
    neck: { flex: -15, rot: 10 },
    shoulder_R: { abd: 90, flex: -56 },
    wrist_R: { ext: 103, pron: 90 },
    shoulder_L: { abd: 150, flex: 20 },
  },
  vasisthasana: {
    root: { yaw: 90, roll: -60, pitch: 4 },
    hip_L: { flex: 13 },
    ankle: { dorsi: -7 },
    shoulder_R: { abd: 61, flex: -1 },
    wrist_R: { ext: 100, pron: 90 },
    shoulder_L: { abd: 119 },
    neck: { rot: 20 },
    hip: { abd: -7 },
  },
  // Side plank with the right knee down (shin back), left leg long, foot on the mat.
  vasisthasana_knee: {
    root: { yaw: 90, roll: -49, pitch: 25 },
    hip_R: { flex: 10 },
    knee_R: { flex: 90 },
    hip_L: { flex: 8 },
    ankle: { dorsi: 5 },
    shoulder_R: { abd: 49, flex: 21 },
    wrist_R: { ext: 97, pron: 90 },
    shoulder_L: { abd: 130 },
    neck: { rot: 20 },
    hip: { abd: 11 },
    ankle_L: { dorsi: 23 },
  },
  // Gate pose: kneeling on the right knee, left leg stretched out to the side with the foot flat,
  // trunk bending over the left leg, left hand on the shin, right arm reaching over the ear.
  parighasana: {
    hip_R: { flex: 1 },
    knee_R: { flex: 90 },
    ankle_R: { dorsi: -59 },
    hip_L: { abd: 67, rot: -6, flex: 9 },
    ankle_L: { dorsi: -11 },
    lumbar: { side: 32 },
    thorax: { side: 28 },
    neck: { rot: -15 },
    shoulder_L: { abd: 90, flex: 10 },
    shoulder_R: { abd: 152 },
    root: { roll: 6 },
  },
  // Kneeling on the right knee with the left foot planted out to the side, left knee bent up:
  // between kneeling and parighasana_prep (straightening the leg straight out of kneeling swept the
  // left foot through the mat).
  parighasana_knee_up: {
    hip_R: { flex: 16 },
    knee_R: { flex: 114 },
    ankle_R: { dorsi: -31 },
    hip_L: { flex: 53, abd: 46, rot: -5 },
    knee_L: { flex: 94 },
    ankle_L: { dorsi: 40 },
    shoulder: { abd: 45, rot: -90 },
  },
  // Kneeling with the left leg stretched out to the side, trunk upright, arms out: the step before the side bend.
  parighasana_prep: {
    hip_R: { flex: 2 },
    knee_R: { flex: 91 },
    ankle_R: { dorsi: -60 },
    hip_L: { abd: 57, rot: -6, flex: 35 },
    ankle_L: { dorsi: -36 },
    shoulder: { abd: 90, rot: -90 },
    root: { roll: 1, pitch: -1 },
  },
  // Puppy (Anahatasana): hips over the knees, arms stretched forward on the mat, chest sinking toward
  // the floor, forehead down.
  anahatasana: {
    root: { pitch: 127 },
    hip: { flex: 132 },
    knee: { flex: 90 },
    ankle: { dorsi: -70 },
    lumbar: { flex: 9 },
    thorax: { flex: -29 },
    neck: { flex: 17 },
    shoulder: { flex: 171 },
    wrist: { ext: 43, pron: 180 },
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

  // Camel with the hands on two blocks (on their ends) beside the heels: a smaller back bend, the
  // hands supported higher than the heels.
  ustrasana_blocks: {
    root: { pitch: -7 },
    hip: { flex: -7 },
    knee: { flex: 90 },
    ankle: { dorsi: -54 },
    lumbar: { flex: -26 },
    thorax: { flex: -22 },
    neck: { flex: -15 },
    shoulder: { flex: -55, abd: 15 },
    wrist: { ext: 58 },
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
  // Sphinx: lying prone, forearms on the mat with the elbows under the shoulders, chest lifted,
  // pelvis and legs down.
  salamba_bhujangasana: {
    root: { pitch: 76 },
    ankle: { dorsi: -52 },
    lumbar: { flex: -6 },
    thorax: { flex: -10 },
    neck: { flex: -8 },
    shoulder: { flex: 62, abd: 6 },
    elbow: { flex: 89 },
    wrist: { pron: 180 },
    hip: { flex: -11 },
  },
  // Locust: lying prone, chest, arms and straight legs lifted, arms alongside the body reaching
  // back, palms down; the weight on the belly and pelvis.
  salabhasana: {
    root: { pitch: 92 },
    hip: { flex: -14 },
    ankle: { dorsi: -45 },
    lumbar: { flex: -20 },
    thorax: { flex: -10 },
    neck: { flex: -6 },
    shoulder: { flex: -35, abd: 10 },
  },
  // Crocodile (Makarasana): lying prone, legs apart with the heels turned in, forearms folded in
  // front of the head, forehead resting near the hands (the head is not supported by the hands in
  // the physics: body-to-body contacts are not modelled).
  makarasana: {
    root: { pitch: 86 },
    hip: { abd: 12, rot: 30 },
    ankle: { dorsi: -55 },
    lumbar: { flex: -8 },
    thorax: { flex: 10 },
    neck: { flex: -10 },
    shoulder: { flex: 90, abd: 69, rot: 65 },
    elbow: { flex: 75 },
    wrist: { pron: 180 },
  },
  // Lying prone, knees bent with the heels toward the buttocks, arms reaching back to the strap around
  // the feet: the step before lifting into Dhanurasana.
  dhanurasana_prep: {
    root: { pitch: 82 },
    knee: { flex: 105 },
    ankle: { dorsi: -10 },
    neck: { flex: -10 },
    shoulder: { flex: -45, abd: 15 },
    elbow: { flex: 10 },
    hip: { flex: -3 },
  },
  // Bow (Dhanurasana) with a strap: lying on the belly, knees bent, the strap around the feet held in
  // both hands behind; the legs kick back into the strap and lift the chest and the thighs.
  dhanurasana: {
    root: { pitch: 90 },
    hip: { flex: -20 },
    knee: { flex: 100 },
    ankle: { dorsi: 0 },
    lumbar: { flex: -18 },
    thorax: { flex: -15 },
    neck: { flex: -10 },
    shoulder: { flex: -60, abd: 15 },
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

  // Halfway from supine_knees to supine: the heels sliding away along the mat, knees half bent.
  // Interpolating straight between the two pushed the heels into the mat and tipped the body up
  // off the pelvis and upper back by 2 cm.
  supine_heels_slide: {
    root: { pitch: -90 },
    hip: { flex: 24, rot: 8 },
    knee: { flex: 52 },
    ankle: { dorsi: -2 },
    shoulder: { flex: -12, abd: 12, rot: 5 },
    wrist: { pron: 45 },
  },
  // supine_knees with the hands lifted off the mat, elbows bent, arms half turned: passed through
  // between supine_knees (palms down) and supine_feet_together (arms turned in). Turning the arms
  // on the mat drove the hands into it and propped the body up on them.
  supine_knees_hands_up: {
    root: { pitch: -90 },
    hip: { flex: 49 },
    knee: { flex: 110 },
    ankle: { dorsi: -9 },
    shoulder: { flex: 10, abd: 10, rot: -40 },
    elbow: { flex: 50 },
    wrist: { pron: 45 },
  },
  // Supine twist (Supta Matsyendrasana), knees to the right: lying on the back, hips and knees bent
  // 90°, the pelvis turned 50° about the body's long axis so the knees fall to the right onto a
  // bolster, the spine turning back so the shoulder blades stay on the mat, arms out in a T, gaze
  // left. (The model's spine turns at most ~45°, so with the shoulders down the knees stay a
  // bolster's height above the mat.)
  supta_matsyendrasana: {
    root: { pitch: -28, yaw: -90, roll: -90 }, // = lying on the back, pelvis turned ~55° to the right
    hip: { flex: 105 },
    knee: { flex: 90 },
    ankle: { dorsi: -20 },
    lumbar: { rot: 10 },
    thorax: { rot: 35 },
    neck: { rot: 30 },
    shoulder: { abd: 28, flex: 38, rot: -100 },
  },
  // Reclined mountain (Supta Tadasana): lying on the back, arms overhead on the mat, palms facing
  // each other, legs together and long, feet flexed (heels pressing away).
  supine_arms_up: {
    root: { pitch: -90 },
    shoulder: { flex: 90, abd: 8 },
    ankle: { dorsi: -20 },
    hip: { rot: 8 },
  },
  supta_tadasana: {
    root: { pitch: -90 },
    shoulder: { flex: 180, abd: 10, rot: 38 },
    ankle: { dorsi: -15 },
    hip: { rot: 0 },
  },
  // Knees to chest (Apanasana): lying on the back, both knees drawn in toward the chest, hands on the
  // shins below the knees (no hand–shin force in the physics), head and shoulders on the mat.
  apanasana: {
    root: { pitch: -90 },
    hip: { flex: 120 },
    knee: { flex: 125 },
    ankle: { dorsi: -15 },
    shoulder: { flex: 34, abd: 1, rot: -13 },
    elbow: { flex: 15 },
    wrist: { pron: 90 },
  },
  // Reclined pigeon / figure 4 (Supta Kapotasana), left ankle over the right thigh: lying on the back,
  // right hip and knee bent 90° (shin level), the left ankle resting on the front of the right thigh
  // below the knee, left knee open to the side, hands clasped behind the right thigh. Left hip angles
  // built from where the ankle rests; the ankle-on-thigh and hands-on-thigh contacts carry no force in
  // the physics. Passed through on the way: the left knee drawn up, then the ankle crossed over the
  // right knee with the right foot still on the mat.
  supta_kapotasana_knee_up: {
    root: { pitch: -90 },
    hip_L: { flex: 90 },
    knee_L: { flex: 95 },
    ankle_L: { dorsi: 5 },
    hip_R: { flex: 47 },
    knee_R: { flex: 103 },
    ankle_R: { dorsi: 9 },
    shoulder: { flex: -8, abd: 6 },
    wrist: { pron: 90 },
  },
  supta_kapotasana_cross: {
    root: { pitch: -90 },
    hip_L: { flex: 128, abd: -93, rot: 37 },
    knee_L: { flex: 125 },
    ankle_L: { dorsi: 10 },
    hip_R: { flex: 47 },
    knee_R: { flex: 103 },
    ankle_R: { dorsi: 9 },
    shoulder: { flex: -8, abd: 6 },
    wrist: { pron: 90 },
  },
  supta_kapotasana: {
    root: { pitch: -90 },
    hip_L: { flex: 124, abd: -103, rot: -6 },
    knee_L: { flex: 128 },
    ankle_L: { dorsi: 10 },
    hip_R: { flex: 92 },
    knee_R: { flex: 90 },
    ankle_R: { dorsi: 5 },
    shoulder: { flex: 18, abd: -6, rot: -11 },
    elbow: { flex: 15 },
    wrist: { pron: 90 },
  },
  // One-knee hug (Eka Pada Pavanamuktasana): lying on the back, the left knee drawn to the chest,
  // hands clasped on the shin below the knee, right leg long on the mat.
  // the left heel slid halfway in along the mat
  pavanamuktasana_heel_slide: {
    root: { pitch: -90 },
    hip_L: { flex: 24 },
    knee_L: { flex: 52 },
    ankle_L: { dorsi: 5 },
    hip_R: { rot: 15 },
    ankle_R: { dorsi: -30 },
    shoulder: { abd: 18, flex: -11, rot: 9 },
    elbow: { flex: -4 },
  },
  pavanamuktasana_knee_up: {
    root: { pitch: -90 },
    hip_L: { flex: 46 },
    knee_L: { flex: 100 },
    ankle_L: { dorsi: -8 },
    hip_R: { rot: 15 },
    ankle_R: { dorsi: -30 },
    shoulder: { abd: 18, flex: -11, rot: 9 },
    elbow: { flex: 10 },
  },
  pavanamuktasana: {
    root: { pitch: -90 },
    hip_L: { flex: 125 },
    knee_L: { flex: 125 },
    ankle_L: { dorsi: -15 },
    hip_R: { rot: 15 },
    ankle_R: { dorsi: -30 },
    shoulder: { flex: 48, abd: 14, rot: -25 },
    elbow: { flex: -2 },
    wrist: { pron: 90 },
  },
  // Revolved abdomen (Jathara Parivartanasana): lying on the back, arms out in a T on the mat, hips
  // bent 90°; the legs swing over to the right while both shoulder blades stay down, so they stop
  // about halfway and hover (the active, core form). The pelvis turns ~45° about the body's long
  // axis, the spine turns back the same amount (about what the model's spine can turn).
  // lying on the back, knees bent, feet on the mat, arms out in a T: the start
  jathara_start: {
    root: { pitch: -90 },
    hip: { flex: 47 },
    knee: { flex: 103 },
    ankle: { dorsi: 9 },
    shoulder: { abd: 80, rot: -53, flex: -16 },
  },
  jathara_knees_up: {
    root: { pitch: -90 },
    hip: { flex: 90 },
    knee: { flex: 90 },
    ankle: { dorsi: -10 },
    shoulder: { abd: 80, rot: -53, flex: -16 },
  },
  jathara_legs_up: {
    root: { pitch: -90 },
    hip: { flex: 88 },
    knee: { flex: 0 },
    ankle: { dorsi: 0 },
    shoulder: { abd: 80, rot: -53, flex: -16 },
  },
  jathara_parivartanasana: {
    root: { pitch: -45, yaw: -90, roll: -90 }, // = lying on the back, pelvis turned 45° to the right
    hip: { flex: 88 },
    knee: { flex: 0 },
    ankle: { dorsi: 0 },
    lumbar: { rot: 10 },
    thorax: { rot: 35 },
    neck: { rot: 25 },
    shoulder: { abd: 80, rot: -53, flex: -16 },
  },
  // knees-bent form: the same turn with the knees bent 90°
  jathara_parivartanasana_knees: {
    root: { pitch: -45, yaw: -90, roll: -90 },
    hip: { flex: 90 },
    knee: { flex: 90 },
    ankle: { dorsi: -10 },
    lumbar: { rot: 10 },
    thorax: { rot: 35 },
    neck: { rot: 25 },
    shoulder: { abd: 80, rot: -53, flex: -16 },
  },
  // Lying on the back, left knee drawn toward the chest, the strap around the ball of the left foot
  // held in both hands, right leg long: the step before the leg straightens up.
  supta_padangusthasana_bent: {
    root: { pitch: -90 },
    hip_L: { flex: 105 },
    knee_L: { flex: 95 },
    ankle_L: { dorsi: 5 },
    hip_R: { rot: 10 },
    ankle_R: { dorsi: -29 },
    shoulder: { flex: 55, abd: 8 },
    elbow: { flex: 40 },
    wrist: { pron: 90 },
  },
  // Reclined hand-to-big-toe with a strap (Supta Padangusthasana): lying on the back, left leg
  // straight up toward vertical, the strap around the ball of the left foot held in both hands with
  // the arms long, shoulders on the mat, right leg long on the mat with the foot flexed.
  supta_padangusthasana: {
    root: { pitch: -90 },
    hip_L: { flex: 73 },
    knee_L: { flex: 0 },
    ankle_L: { dorsi: 12 },
    hip_R: { rot: 10 },
    ankle_R: { dorsi: -29 },
    shoulder: { flex: 50, abd: 8 },
    elbow: { flex: 10 },
    wrist: { pron: 90 },
  },
  // Happy baby (Ananda Balasana) with straps: lying on the back, knees drawn wide toward the armpits,
  // shins vertical, soles to the ceiling; a strap around the ball of each foot, held in the hand of
  // its side (holding the feet directly is a hand-on-foot contact the physics lacks).
  ananda_balasana: {
    root: { pitch: -90 },
    hip: { flex: 149, rot: 3, abd: -32 },
    knee: { flex: 60 },
    ankle: { dorsi: 10 },
    shoulder: { flex: 60, abd: 20 },
    elbow: { flex: 20 },
    wrist: { pron: 90 },
  },
  // Lying on the back, knees drawn in over the chest (Apanasana-like), hands holding the straps:
  // the step between supine_knees and Ananda Balasana.
  ananda_balasana_in: {
    root: { pitch: -90 },
    hip: { flex: 110 },
    knee: { flex: 110 },
    ankle: { dorsi: 0 },
    shoulder: { flex: 45, abd: 15 },
    elbow: { flex: 40 },
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
  // Legs on a chair (restorative): lying on the back, hips and knees bent 90°, the lower legs resting
  // on the seat of a chair, arms beside the body, palms up. The model's calf points lean on walls only,
  // so the heels rest on the seat here (the real load is spread along the calves).
  viparita_karani_chair: {
    root: { pitch: -90 },
    hip: { flex: 93 },
    knee: { flex: 93 },
    ankle: { dorsi: 0 },
    shoulder: { abd: 18, flex: -17, rot: 60 },
    elbow: { flex: -4 },
  },
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
  // Lying on the back, the hands slid palms down under the buttocks, elbows in by the waist: the
  // start of Fish pose.
  supine_hands_under: {
    root: { pitch: -90 },
    hip: { rot: 10 },
    ankle: { dorsi: -30 },
    shoulder: { flex: -12, abd: 4, rot: -20 },
    elbow: { flex: 8 },
    wrist: { pron: 90 },
  },
  // Fish (Matsyasana): legs long on the mat, forearms pressing down with the elbows under the ribs,
  // hands under the buttocks; the chest lifted into a thoracic backbend, the crown of the head
  // resting lightly on the mat (most of the weight on the forearms and the pelvis).
  matsyasana: {
    root: { pitch: -68 },
    hip: { flex: 23, rot: 10 },
    ankle: { dorsi: -30 },
    lumbar: { flex: 1 },
    thorax: { flex: -26 },
    neck: { flex: -32 },
    head: { flex: -8 },
    shoulder: { flex: -41, abd: 8, rot: -20 },
    elbow: { flex: 99 },
    wrist: { pron: 90 },
  },
  // Supported fish (a gentle chest opener): lying on the back over a block (flat) across the mat
  // under the shoulder blades, the back of the head on the mat, arms out to the sides, palms up.
  matsyasana_supported: {
    root: { pitch: -74 },
    hip: { rot: 15, flex: 16 },
    ankle: { dorsi: -30 },
    lumbar: { flex: -2 },
    thorax: { flex: -11 },
    neck: { flex: -42 },
    shoulder: { abd: 43, rot: 60, flex: -30 },
  },
  // Lying on a block under the sacrum (as setu_bandha_block) with the knees drawn in over the hips,
  // feet off the mat: passed through on the way to the legs up.
  setu_bandha_block_knees: {
    root: { pitch: -92 },
    hip: { flex: 105 },
    knee: { flex: 100 },
    ankle: { dorsi: 0 },
    lumbar: { flex: -11 },
    thorax: { flex: 4 },
    neck: { flex: 35 },
    shoulder: { flex: -16, abd: 6 },
    wrist: { pron: 90 },
  },
  // Supported legs up (Viparita Karani without a wall): the sacrum on a block lying flat, the legs
  // straight up over the hips, arms resting beside the body.
  viparita_karani_block: {
    root: { pitch: -92 },
    hip: { flex: 88 },
    knee: { flex: 5 },
    ankle: { dorsi: 0 },
    lumbar: { flex: -11 },
    thorax: { flex: 4 },
    neck: { flex: 35 },
    shoulder: { flex: -16, abd: 6 },
    wrist: { pron: 90 },
  },
  // ---------------- Seated ----------------
  // Seated, the right knee bent and dropped out to the side, the sole of the right foot against
  // the inner left thigh, left leg long, trunk upright, hands beside the hips: the start of Janu Sirsasana.
  janu_sirsasana_up: {
    hip_L: { flex: 91 },
    ankle_L: { dorsi: 1 },
    // thigh out to the side and forward, kneecap up and out, shin on the mat toward the left thigh
    // (built from those directions: the Euler angles look odd because abduction is the outermost angle)
    hip_R: { flex: 134, abd: -93, rot: 1 },
    knee_R: { flex: 153 },
    ankle_R: { dorsi: 0 },
    lumbar: { flex: -4 },
    shoulder: { flex: -16, abd: 10 },
    wrist: { ext: 80 },
  },
  // A third and two thirds of the way from ardha_matsyendrasana_knee_up to janu_sirsasana_up: the right foot sliding along the
  // mat toward the left thigh while the knee lowers out to the side. Interpolating straight between
  // the two swept the foot under the mat and lifted the body 10 cm.
  janu_sirsasana_knee_mid: {
    hip_L: { flex: 91 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 145, abd: -30, rot: -4 },
    knee_R: { flex: 113 },
    ankle_R: { dorsi: -35 },
    lumbar: { flex: -4 },
    shoulder: { flex: -16, abd: 10 },
    wrist: { ext: 80 },
  },
  janu_sirsasana_knee_out: {
    hip_L: { flex: 91 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 143, abd: -60, rot: -11 },
    knee_R: { flex: 146 },
    ankle_R: { dorsi: -20 },
    lumbar: { flex: -4 },
    shoulder: { flex: -16, abd: 10 },
    wrist: { ext: 80 },
  },
  // Revolved head-to-knee (Parivrtta Janu Sirsasana), beginner form: the left leg straight out to the
  // side, the right sole against the inner left thigh; the trunk bends sideways over the left leg with
  // the chest turned up, the left hand on the inner left shin, the right arm reaching over the ear
  // toward the left foot (no hand–shin force in the physics).
  parivrtta_janu_sirsasana: {
    hip_L: { flex: 91, rot: 35 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 134, abd: -93, rot: 1 },
    knee_R: { flex: 153 },
    ankle_R: { dorsi: 0 },
    lumbar: { flex: -2, side: 22, rot: -5 },
    thorax: { side: 32, rot: -18 },
    neck: { rot: -20 },
    shoulder_L: { flex: 16, abd: 76 },
    elbow_L: { flex: 50 },
    shoulder_R: { flex: -15, abd: 172, rot: -75 },
    elbow_R: { flex: 5 },
    root: { roll: 0 },
  },
  // Heron (Krounchasana) with a strap, beginner form: the right leg folded in as in Janu Sirsasana (the
  // model cannot fold the knee enough for the half-hero leg), the left leg raised straight in front,
  // a strap around the ball of the left foot held in both hands, the spine tall.
  krounchasana: {
    hip_L: { flex: 145 },
    knee_L: { flex: 0 },
    ankle_L: { dorsi: 10 },
    hip_R: { flex: 134, abd: -93, rot: 4 },
    knee_R: { flex: 114 },
    ankle_R: { dorsi: 10 },
    lumbar: { flex: -5 },
    shoulder_L: { flex: 90, abd: 97 },
    shoulder_R: { flex: 101, abd: 96 },
    elbow_L: { flex: 10 },
    elbow_R: { flex: 10 },
    wrist: { pron: 90 },
    root: { pitch: 0 },
  },
  // Head-to-knee (Janu Sirsasana): from janu_sirsasana_up the trunk folds from the hips over the
  // long left leg, chest turned toward it, hands resting on either side of the left shin.
  janu_sirsasana: {
    root: { pitch: 15 },
    // the legs of janu_sirsasana_up expressed for the pelvis pitched 15°
    hip_L: { flex: 107 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 119, abd: -93, rot: -14 },
    knee_R: { flex: 153 },
    ankle_R: { dorsi: 0 },
    lumbar: { flex: 22, rot: 6 },
    thorax: { flex: 22, rot: 8 },
    neck: { flex: 15 },
    shoulder: { flex: 78, abd: 55 },
    elbow: { flex: 47 },
    wrist: { ext: 20, pron: 180 },
  },
  // Seated with the legs wide apart (about 90° between them), kneecaps up, hands resting on the thighs:
  // the start of Upavistha Konasana.
  upavistha_konasana_up: {
    hip: { flex: 91, rot: 45 },
    ankle: { dorsi: 2 },
    lumbar: { flex: -4 },
    shoulder: { flex: 5, abd: 12 },
    elbow: { flex: 31 },
    wrist: { pron: 90 },
  },
  // Wide-angle seated forward fold: legs wide with the kneecaps up, trunk folded forward from the
  // hips, hands walked forward on the mat between the legs.
  upavistha_konasana: {
    root: { pitch: 20 },
    // the legs of upavistha_konasana_up expressed for the pelvis pitched 20°
    hip: { flex: 118, abd: -19, rot: 42 },
    ankle: { dorsi: 9 },
    lumbar: { flex: 18 },
    thorax: { flex: 18 },
    neck: { flex: 10 },
    shoulder: { flex: 92, abd: 0 },
    wrist: { ext: 65, pron: 180 },
  },
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
  // Marichyasana III steps: from Dandasana the right knee is drawn up, the foot flat on the floor in
  // front of the right sit bone, hands still beside the hips; then the trunk turns to the right, the
  // left elbow hooked against the outside of the right knee (no arm–knee force in the physics), the
  // right hand on the floor behind the pelvis.
  marichyasana_3_knee_up: {
    hip_L: { flex: 91 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 153, abd: 4 },
    knee_R: { flex: 134 },
    ankle_R: { dorsi: -20 },
    lumbar: { flex: -4 },
    shoulder: { flex: -16, abd: 10 },
    wrist: { ext: 80 },
  },
  // The left hand lifts off the floor before it reaches for the knee (as in Ardha Matsyendrasana).
  marichyasana_3_hand_off: {
    hip_L: { flex: 91 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 153, abd: 4 },
    knee_R: { flex: 134 },
    ankle_R: { dorsi: -20 },
    lumbar: { flex: -4 },
    shoulder: { flex: -16, abd: 10 },
    wrist: { ext: 80 },
    shoulder_L: { flex: -26 },
    wrist_L: { ext: 90 },
  },
  marichyasana_3_hand_up: {
    hip_L: { flex: 91 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 153, abd: 4 },
    knee_R: { flex: 134 },
    ankle_R: { dorsi: -20 },
    lumbar: { flex: -4 },
    shoulder: { flex: -16, abd: 10 },
    wrist: { ext: 80 },
    shoulder_L: { flex: -30 },
    elbow_L: { flex: 75 },
    wrist_L: { ext: 90 },
  },
  marichyasana_3: {
    hip_L: { flex: 91 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 157, abd: -8 },
    knee_R: { flex: 137 },
    ankle_R: { dorsi: -25 },
    lumbar: { flex: -2, rot: -5 },
    thorax: { rot: -42 },
    neck: { rot: -25 },
    shoulder_L: { flex: 70, abd: -1, rot: -25 },
    elbow_L: { flex: 109 },
    shoulder_R: { flex: -2, abd: 11 },
    wrist_R: { ext: 97 },
    elbow_R: { flex: 5 },
  },
  // Both hands lift off the floor before they reach for the shin (as on the way into Navasana).
  marichyasana_1_hands_off: {
    hip_L: { flex: 91 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 153, abd: 4 },
    knee_R: { flex: 134 },
    ankle_R: { dorsi: -20 },
    lumbar: { flex: -4 },
    shoulder: { flex: -24, abd: 10 },
    wrist: { ext: 90 },
  },
  marichyasana_1_hands_up: {
    hip_L: { flex: 91 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 153, abd: 4 },
    knee_R: { flex: 134 },
    ankle_R: { dorsi: -20 },
    lumbar: { flex: -4 },
    shoulder: { flex: -30, abd: 10 },
    elbow: { flex: 75 },
    wrist: { ext: 90 },
  },
  // Marichyasana I, preparation without the bind: the right knee up as in Marichyasana III, both arms
  // hugging the right shin just below the knee (hands clasped in front of it), the spine long and the
  // trunk tipped forward from the hips over the left leg (no hand–shin force in the physics).
  marichyasana_1: {
    root: { pitch: 10 },
    hip_L: { flex: 102 },
    ankle_L: { dorsi: 1 },
    hip_R: { flex: 156, abd: 5 },
    knee_R: { flex: 116 },
    ankle_R: { dorsi: -30 },
    lumbar: { flex: 2 },
    neck: { flex: -5 },
    shoulder_L: { flex: 20, abd: -39, rot: -4 },
    shoulder_R: { flex: 24, abd: -43, rot: 9 },
    elbow_L: { flex: 63 },
    elbow_R: { flex: 74 },
    wrist: { pron: 90 },
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
  // Paschimottanasana with a strap around both feet held in the hands: a shallower fold, the spine
  // long, arms reaching forward to the strap.
  paschimottanasana_strap: {
    root: { pitch: 30 },
    hip: { flex: 122 },
    ankle: { dorsi: 7 },
    lumbar: { flex: 14 },
    thorax: { flex: 12 },
    neck: { flex: 8 },
    shoulder: { flex: 65, abd: 10 },
    elbow: { flex: 90 },
    wrist: { pron: 90 },
  },
  // Reverse tabletop (Ardha Purvottanasana): hands under the shoulders with the fingers toward the
  // feet, knees bent 90° over the ankles, hips lifted to the height of the knees and shoulders,
  // chest open, head in line with the trunk.
  ardha_purvottanasana: {
    root: { pitch: -80 },
    hip: { flex: 0 },
    knee: { flex: 79 },
    ankle: { dorsi: 2 },
    shoulder: { flex: -81, abd: 8 },
    wrist: { ext: 90 },
    neck: { flex: 30 },
    head: { flex: 20 },
  },
  // Sitting with the knees bent, feet flat, the hands on the mat behind the hips (fingers forward):
  // the start of Reverse tabletop (and the way back down).
  dandasana_knees_back: {
    root: { pitch: -29 },
    hip: { flex: 119 },
    knee: { flex: 123 },
    ankle: { dorsi: -23 },
    shoulder: { flex: -55, abd: 4 },
    wrist: { ext: 80 },
  },
  // Upward plank (Purvottanasana): the body one straight line from shoulders to feet, hands under
  // the shoulders (fingers toward the feet), soles reaching for the mat, chest open.
  purvottanasana: {
    root: { pitch: -72 },
    hip: { flex: -8 },
    knee: { flex: 0 },
    ankle: { dorsi: -60 },
    shoulder: { flex: -74, abd: 8 },
    wrist: { ext: 99 },
    neck: { flex: 30 },
    head: { flex: 20 },
  },
  // Sitting with straight legs, leaning back on the hands placed behind the hips: the start of
  // Upward plank.
  dandasana_lean_back: {
    root: { pitch: -25 },
    hip: { flex: 66 },
    ankle: { dorsi: -16 },
    shoulder: { flex: -47, abd: 4 },
    wrist: { ext: 80 },
  },
  // Pigeon prep (Eka Pada Rajakapotasana, preparation) with the left leg in front: left shin across
  // the mat (foot toward the right hip), outer left thigh and knee down; right leg straight back,
  // top of the foot down; pelvis tipped forward and level, the lower back arched so the trunk is
  // upright, fingertips on the mat beside the hips. Hip angles built from the thigh and shin
  // directions.
  eka_pada_rajakapotasana: {
    root: { pitch: 47 },
    hip_L: { flex: 100, abd: -89, rot: -32 },
    knee_L: { flex: 122 },
    ankle_L: { dorsi: -18 },
    hip_R: { flex: -28 },
    knee_R: { flex: 12 },
    ankle_R: { dorsi: -60 },
    lumbar: { flex: -29 },
    thorax: { flex: -15 },
    shoulder: { flex: 22, abd: 12 },
    wrist: { ext: 83 },
  },  // Bharadvaja's twist (Bharadvajasana I): sitting with both knees bent and swung to the left, both
  // feet beside the right hip (left shin in front, turned out; right shin back, turned in), turning
  // to the left: right hand on the mat outside the left knee, left hand behind on the mat. Hip angles
  // built from the thigh and shin directions. (The left ankle resting in the right instep is a
  // foot-on-foot contact the physics lacks: the feet lie side by side.)
  bharadvajasana: {
    hip_L: { flex: 98, abd: -87, rot: 9 },
    knee_L: { flex: 117 },
    ankle_L: { dorsi: -30 },
    hip_R: { flex: 79, abd: 67, rot: -9 },
    knee_R: { flex: 152 },
    ankle_R: { dorsi: -50 },
    lumbar: { rot: 8 },
    thorax: { rot: 35 },
    neck: { rot: 25 },
    shoulder_R: { flex: 28, abd: -15, rot: 30 },
    elbow_R: { flex: -5 },
    wrist_R: { ext: 80 },
    shoulder_L: { flex: -11, abd: 9 },
    wrist_L: { ext: 80 },
    root: { roll: 3, pitch: -2 },
    elbow_L: { flex: -1 },
  },
  // Accomplished pose (Siddhasana): sitting upright, knees wide on the mat, the left heel drawn in
  // against the perineum, the right heel just in front of it (both shins along the front of the
  // mat), hands resting on the knees. Hip angles built from the thigh and shin directions.
  siddhasana: {
    hip_L: { flex: 127, abd: -97, rot: -4 },
    knee_L: { flex: 139 },
    ankle_L: { dorsi: -20 },
    hip_R: { flex: 127, abd: -97, rot: -5 },
    knee_R: { flex: 134 },
    ankle_R: { dorsi: -20 },
    root: { pitch: 5 },
    lumbar: { flex: -5 },
    shoulder: { flex: 37, abd: 8, rot: 13 },
    elbow: { flex: -5 },
    wrist: { pron: 90 },
  },
  // Easy seat (Sukhasana): sitting cross-legged, shins crossed (left shin behind, each foot under the
  // opposite shin), knees wide and a little above the mat, trunk upright, hands resting on the knees.
  // Hip angles built from the thigh and shin directions; the feet lie by the shins without a
  // foot-on-leg force (a contact the physics lacks).
  sukhasana: {
    hip_L: { flex: 117, abd: -95, rot: -1 },
    knee_L: { flex: 130 },
    ankle_L: { dorsi: -20 },
    hip_R: { flex: 117, abd: -99, rot: -3 },
    knee_R: { flex: 120 },
    ankle_R: { dorsi: -20 },
    root: { pitch: 5 },
    lumbar: { flex: -5 },
    shoulder: { flex: 38, abd: 8 },
    elbow: { flex: 5 },
    wrist: { pron: 90 },
  },
  // Seated side bend (Parsva Sukhasana) to the left: left hand on the mat beside the hip, right arm
  // up and over, the trunk bending to the left, both sit bones down.
  parsva_sukhasana: {
    hip_L: { flex: 117, abd: -95, rot: -1 },
    knee_L: { flex: 130 },
    ankle_L: { dorsi: -20 },
    hip_R: { flex: 117, abd: -99, rot: -3 },
    knee_R: { flex: 120 },
    ankle_R: { dorsi: -20 },
    root: { pitch: 5 },
    lumbar: { flex: -5, side: 10 },
    thorax: { side: 13 },
    neck: { side: 5 },
    shoulder_L: { flex: -25, abd: 12 },
    elbow_L: { flex: 10 },
    wrist_L: { ext: 93 },
    shoulder_R: { flex: -6, abd: 184, rot: -90 },
  },
  // Half lotus (Ardha Padmasana): the left foot resting on top of the right thigh near the hip crease,
  // sole turned up, the right leg folded under with its foot below the left knee (no foot–thigh force
  // in the physics). Hip angles built from the thigh and shin directions.
  ardha_padmasana: {
    hip_L: { flex: 99, abd: -103, rot: -13 },
    knee_L: { flex: 139 },
    ankle_L: { dorsi: -25 },
    hip_R: { flex: 116, abd: -99, rot: 1 },
    knee_R: { flex: 120 },
    ankle_R: { dorsi: -20 },
    root: { pitch: 5, roll: 8 },
    lumbar: { flex: -5, side: -12 },
    shoulder_L: { flex: 34, abd: -2 },
    shoulder_R: { flex: 33, abd: 9 },
    elbow_L: { flex: 8 },
    elbow_R: { flex: 8 },
    wrist: { pron: 90 },
  },
  // Fire log (Agnistambhasana): the shins stacked parallel to the front of the mat, the right shin on
  // the floor with its ankle under the left knee, the left shin on top with its ankle on the right knee
  // (no shin–shin force in the physics). Hip angles built from the thigh and shin directions.
  agnistambhasana: {
    hip_L: { flex: 106, abd: -90, rot: -15 },
    knee_L: { flex: 106 },
    ankle_L: { dorsi: 5 },
    hip_R: { flex: 106, abd: -90, rot: -3 },
    knee_R: { flex: 106 },
    ankle_R: { dorsi: 3 },
    root: { pitch: 5, roll: 1 },
    lumbar: { flex: -5 },
    shoulder_L: { flex: 36, abd: 0 },
    shoulder_R: { flex: 36, abd: 5 },
    elbow_L: { flex: 8 },
    elbow_R: { flex: 8 },
    wrist: { pron: 90 },
  },
  // Cow face (Gomukhasana): the right knee stacked over the left in front of the pelvis, the feet beside
  // the opposite hips; the right arm up with the elbow bent behind the head, the left arm down with the
  // back of the hand up the spine, the hands reaching for each other (no hand–hand or knee–knee force in
  // the physics). Hip angles built from the thigh and shin directions.
  gomukhasana: {
    hip_L: { flex: 77, abd: -90, rot: -2 },
    knee_L: { flex: 136 },
    ankle_L: { dorsi: -30 },
    hip_R: { flex: 78, abd: -85, rot: -18 },
    knee_R: { flex: 136 },
    ankle_R: { dorsi: -48 },
    root: { pitch: 5, roll: -2 },
    lumbar: { flex: -5 },
    shoulder_R: { flex: 188, abd: 21, rot: 53 },
    elbow_R: { flex: 125 },
    shoulder_L: { flex: 39, abd: 50, rot: -113 },
    elbow_L: { flex: 83 },
  },
  // Seated twist (Parivrtta Sukhasana) to the left: right hand on the left knee, left hand on the
  // mat behind the hips, the turn from the chest.
  parivrtta_sukhasana: {
    hip_L: { flex: 117, abd: -95, rot: -1 },
    knee_L: { flex: 130 },
    ankle_L: { dorsi: -20 },
    hip_R: { flex: 117, abd: -99, rot: -3 },
    knee_R: { flex: 120 },
    ankle_R: { dorsi: -20 },
    root: { pitch: 5 },
    lumbar: { flex: -5, rot: 8 },
    thorax: { rot: 35 },
    neck: { rot: 25 },
    shoulder_R: { flex: 31, abd: -14, rot: 9 },
    elbow_R: { flex: 20 },
    wrist_R: { pron: 90 },
    shoulder_L: { flex: -17, abd: 8 },
    elbow_L: { flex: 5 },
    wrist_L: { ext: 73 },
  },
  // Sitting with the knees bent up, feet flat and close together in front of the pelvis, hands on the
  // shins: the start of Bound angle (the knees then fall open).
  baddha_konasana_up: {
    hip: { flex: 140 },
    knee: { flex: 124 },
    ankle: { dorsi: -21 },
    root: { pitch: -8 },
    lumbar: { flex: -5 },
    shoulder: { flex: 55, abd: 8 },
    elbow: { flex: 30 },
    wrist: { pron: 90 },
  },
  // Bound angle (Baddha Konasana): sitting upright, soles together close to the pelvis, knees falling
  // out to the sides, hands holding the feet (no hand–foot force in the physics). Hip angles built from
  // where the feet rest; the model's ankle has no inversion, so the soles meet only partly.
  baddha_konasana: {
    hip_L: { flex: 148, abd: -76, rot: -4 },
    knee_L: { flex: 134 },
    ankle_L: { dorsi: -10 },
    hip_R: { flex: 148, abd: -76, rot: -4 },
    knee_R: { flex: 134 },
    ankle_R: { dorsi: -10 },
    root: { pitch: 5 },
    lumbar: { flex: -5 },
    shoulder: { flex: 30, abd: -6, rot: -11 },
    elbow: { flex: 10 },
    wrist: { pron: 90 },
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
  // a wall just behind the buttocks
  utkatasana_wall: [{ type: 'wall', at: [0, -0.105], normal: [0, 1] }],
  tadasana_wall: [{ type: 'wall', at: [0, -0.105], normal: [0, 1] }],
  // a block on its end inside the front (left) foot, under the lower hand
  utthita_parsvakonasana_block: [{ type: 'block', stand: 'end', at: [0.4, 0.15], yaw: 90 }],
  // a round bolster across the mat under the knees
  supine_bolster: [{ type: 'bolster', at: [0, 0.33] }],
  // a block on its end under the lower (left) hand, in front of the standing foot (half moon)
  ardha_chandrasana: [{ type: 'block', stand: 'end', at: [0.5, 0.0] }],
  // a block on its long edge inside the front (left) foot, under the right hand (revolved triangle)
  parivrtta_trikonasana: [{ type: 'block', stand: 'side', at: [0.04, 0.48], yaw: 90 }],
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
  // a block on its end under each hand, below the shoulders
  virabhadrasana_3_blocks: [
    { type: 'block', stand: 'end', at: [0.17, 0.5] },
    { type: 'block', stand: 'end', at: [-0.17, 0.5] },
  ],
  // a block lying flat under the sit bones, between the feet
  virasana_block: [{ type: 'block', stand: 'side', at: [0, -0.02], yaw: 90 }],
  // a bolster along the right side of the mat under the knees (supine twist)
  supta_matsyendrasana: [{ type: 'bolster', at: [-0.4, 0.2], yaw: 90 }],
  // a block on its end beside each heel, under the hands (camel)
  ustrasana_blocks: [
    { type: 'block', stand: 'end', at: [0.2, -0.32] },
    { type: 'block', stand: 'end', at: [-0.2, -0.32] },
  ],
  // a block lying flat across the mat under the shoulder blades (supported fish)
  matsyasana_supported: [{ type: 'block', stand: 'flat', at: [0, -0.45] }],
  // the block under the sacrum as in setu_bandha_block (legs up on the way to and in viparita_karani_block)
  setu_bandha_block_knees: [{ type: 'block', stand: 'flat', at: [0, 0.03] }],
  viparita_karani_block: [{ type: 'block', stand: 'flat', at: [0, 0.03] }],
  // a strap around the ball of the left foot, held in both hands
  supta_padangusthasana_bent: [{ type: 'strap', hands: ['wrist_L', 'wrist_R'], foot: 'ankle_L' }],
  supta_padangusthasana: [{ type: 'strap', hands: ['wrist_L', 'wrist_R'], foot: 'ankle_L' }],
  // a strap around the ball of each foot, held in the hand of its side
  ananda_balasana: [
    { type: 'strap', hands: ['wrist_L'], foot: 'ankle_L' },
    { type: 'strap', hands: ['wrist_R'], foot: 'ankle_R' },
  ],
  ananda_balasana_in: [
    { type: 'strap', hands: ['wrist_L'], foot: 'ankle_L' },
    { type: 'strap', hands: ['wrist_R'], foot: 'ankle_R' },
  ],
  // one strap around both feet (a strand from each hand to the foot of its side)
  dhanurasana_prep: [
    { type: 'strap', hands: ['wrist_L'], foot: 'ankle_L' },
    { type: 'strap', hands: ['wrist_R'], foot: 'ankle_R' },
  ],
  dhanurasana: [
    { type: 'strap', hands: ['wrist_L'], foot: 'ankle_L' },
    { type: 'strap', hands: ['wrist_R'], foot: 'ankle_R' },
  ],
  // a strap around the ball of the raised (left) foot, held in the left hand
  utthita_hasta_padangusthasana: [{ type: 'strap', hands: ['wrist_L'], foot: 'ankle_L' }],
  utthita_hasta_padangusthasana_knee: [{ type: 'strap', hands: ['wrist_L'], foot: 'ankle_L' }],
  // a strap around the ball of the lifted (left) foot behind, held in the left hand
  natarajasana: [{ type: 'strap', hands: ['wrist_L'], foot: 'ankle_L' }],
  natarajasana_knee: [{ type: 'strap', hands: ['wrist_L'], foot: 'ankle_L' }],
  // a strap around both feet (a strand from each hand to the foot of its side)
  paschimottanasana_strap: [
    { type: 'strap', hands: ['wrist_L'], foot: 'ankle_L' },
    { type: 'strap', hands: ['wrist_R'], foot: 'ankle_R' },
  ],
  // a block lying flat (its lowest height) under the sacrum
  setu_bandha_block: [{ type: 'block', stand: 'flat', at: [0, 0.03] }],
  // a block on its long edge under each outer thigh, along the thigh
  supta_baddha_konasana_blocks: [
    { type: 'block', stand: 'side', at: [0.3, 0.11], yaw: -37 },
    { type: 'block', stand: 'side', at: [-0.3, 0.11], yaw: 37 },
  ],
  // a chair facing the body, the lower legs on its seat
  viparita_karani_chair: [{ type: 'chair', at: [0, 0.3] }],
  // the wall a little beyond the buttocks (legs up the wall)
  // the wall in front of the chest, the toes resting on it
  adho_mukha_vrksasana_wall: [{ type: 'wall', at: [0, -0.14], normal: [0, 1] }],
  pincha_mayurasana_wall: [{ type: 'wall', at: [0, -0.14], normal: [0, 1] }],
  viparita_karani_bent: [{ type: 'wall', at: [0, 0.15], normal: [0, -1] }],
  viparita_karani: [{ type: 'wall', at: [0, 0.15], normal: [0, -1] }],
};

// Floor-contact constraints used by tools/fit-poses.mjs: `support` lists the
// segments that must touch the floor ("a|b" = either), `params` the angles the fitter may adjust
// ("joint.angle"; joints without a side move both sides together).
export const POSE_FIT = {
  tadasana_wall: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    wall: ['pelvis', 'thorax'], // leaning back on the wall
    // feet where they are in utkatasana_wall, so they stay put as the body slides down
    rel: [['pelvis', 'ankle_L', [0.08, 0.32]]],
    params: ['root.pitch&-ankle.dorsi', 'root.pitch&-lumbar.flex', 'hip.flex', 'ankle.dorsi', 'thorax.flex'],
  },
  utkatasana_wall: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    wall: ['pelvis', 'thorax'], // buttocks / sacrum and the mid back against the wall
    params: ['root.pitch', 'root.pitch&-lumbar.flex', 'hip.flex', 'knee.flex', 'ankle.dorsi', 'lumbar.flex', 'thorax.flex'],
  },
  ardha_uttanasana: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    // long flat back (about 25° above horizontal), hands resting just above the knees
    at: [['wrist_L', 'hip_L', [0, -0.33, 0.09]], ['wrist_R', 'hip_R', [0, -0.33, 0.09]]],
    dir: [['thorax', [0, 1, 0], [0, 0.45, 1]]],
    params: ['root.pitch&hip.flex', 'shoulder.flex', 'shoulder.abd', 'elbow.flex'],
  },
  dandasana: { support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['hip.flex', 'shoulder.flex', 'ankle.dorsi'] },
  prone: { support: ['pelvis', 'thorax', 'hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R'], params: ['root.pitch', 'hip.flex', 'ankle.dorsi', 'lumbar.flex', 'thorax.flex'] },
  tabletop: {
    support: ['wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R'],
    flat: ['wrist_L', 'wrist_R'], // palms flat
    above: [['shoulder_L', 'wrist_L'], ['shoulder_R', 'wrist_R'], ['hip_L', 'knee_L'], ['hip_R', 'knee_R']], // hands under shoulders, knees under hips
    params: ['root.pitch&hip.flex&shoulder.flex', 'shoulder.flex', 'hip.flex', 'wrist.ext'],
  },
  kneeling: { support: ['hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R'], balance: true, params: ['ankle.dorsi', 'hip.flex', 'knee.flex'] },
  padangusthasana: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    dir: [['shoulder_L', [0, -1, 0], [0.35, -0.9, 0.25]], ['shoulder_R', [0, -1, 0], [-0.35, -0.9, 0.25]]], // elbows bending out to the sides
    balance: true,
    rel: [['ankle_R', 'ankle_L', [0.2, 0]]], // feet hip-width apart
    at: [['wrist_L', 'ankle_L', [-0.02, 0.1, 0.12]], ['wrist_R', 'ankle_R', [0.02, 0.1, 0.12]]], // fingers around the big toes
    params: ['root.pitch&hip.flex', 'hip.flex', 'shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'hip.abd'],
  },
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
  virabhadrasana_1_long: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    balance: true,
    rel: [['ankle_L', 'ankle_R', [-0.158, -0.95]]], // the lunge stance, back heel down
    dir: [['ankle_R', [0, 0, 1], [-0.7, 0, 0.7]], ['thorax', [0, 1, 0], [0, 1, -0.1]]], // back foot out ~45°, trunk upright
    above: [['knee_L', 'ankle_L']],
    params: ['root.pitch&hip_L.flex&hip_R.flex&-lumbar.flex', 'hip_R.flex', 'hip_R.rot', 'hip_R.abd', 'knee_L.flex', 'ankle_R.dorsi', 'ankle_L.dorsi', 'hip_L.flex'],
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
  utthita_parsvakonasana_block: {
    support: ['ankle_L', 'ankle_R', 'wrist_L'],
    onProp: ['wrist_L'], // the hand on the block
    balance: true,
    flat: ['ankle_L', 'ankle_R', 'ankle_L', 'ankle_R'], // feet flat (weighted twice)
    rel: [['ankle_L', 'ankle_R', [-1.0, 0]], ['ankle_L', 'wrist_L', [0.01, 0.18]]], // the Warrior II stance; hand inside the foot
    dir: [
      ['ankle_L', [0, 0, 1], [1, 0, 0]],
      ['ankle_R', [0, 0, 1], [0.3, 0, 1]],
      ['thorax', [0, 0, 1], [0, 0, 1]], // chest open to the long side
      ['shoulder_R', [0, -1, 0], [0.75, 0.66, 0]], // top arm on the line of the back leg
      ['thorax', [0, 1, 0], [0.8, 0.6, 0]], // trunk long over the front thigh
      ['lumbar', [0, 1, 0], [0.7, 0.72, 0]],
    ],
    // the legs stay as in the forearm form (front knee at 90° over the ankle)
    params: ['ankle_L.dorsi', 'ankle_R.dorsi', 'lumbar.side', 'thorax.side', 'thorax.rot', 'shoulder_L.flex', 'shoulder_L.abd', 'wrist_L.ext', 'shoulder_R.abd', 'shoulder_R.flex'],
  },
  ardha_chandrasana: {
    support: ['ankle_L', 'wrist_L'],
    onProp: ['wrist_L'],
    flat: ['ankle_L'],
    balance: true,
    dir: [
      ['ankle_L', [0, 0, 1], [1, 0, 0]], // standing foot points to the front of the mat
      ['shoulder_L', [0, -1, 0], [0, -1, 0]], // lower arm straight down to the block
      ['shoulder_R', [0, -1, 0], [0, 1, 0]], // top arm straight up
      ['hip_R', [0, -1, 0], [-1, 0.05, 0]], // top leg level, reaching back
      ['hip_L', [0, -1, 0], [0, -1, 0]], // standing leg vertical, hip over the foot
    ],
    params: ['root.roll&-hip_L.abd', 'hip_L.abd', 'hip_L.rot', 'hip_R.abd', 'ankle_L.dorsi', 'shoulder_L.abd', 'shoulder_R.abd', 'wrist_L.ext'],
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
  supine_bolster: {
    support: ['pelvis', 'thorax', 'wrist_L', 'wrist_R', 'hip_L', 'hip_R', 'ankle_L', 'ankle_R'],
    onProp: ['hip_L', 'hip_R'], // the backs of the thighs on the bolster, heels on the mat
    params: ['hip.flex', 'knee.flex', 'ankle.dorsi', 'shoulder.flex'],
  },
  supine_knees: { support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['shoulder.flex'] },
  supine_heels_slide: { support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['hip.flex', 'knee.flex', 'ankle.dorsi', 'shoulder.flex'] },
  supine_knees_hands_up: { support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R'], params: ['root.pitch', 'hip.flex'] },
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
  viparita_karani_chair: {
    support: ['pelvis', 'scapula_L', 'scapula_R', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    onProp: ['ankle_L', 'ankle_R'], // the heels on the seat
    params: ['hip.flex', 'knee.flex', 'ankle.dorsi', 'shoulder.flex', 'shoulder.abd'],
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
  marichyasana_3_knee_up: {
    support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['ankle_R', 'wrist_L', 'wrist_R'],
    rel: [['pelvis', 'ankle_R', [-0.1, 0.3]], ['pelvis', 'wrist_L', [0.25, -0.12]], ['pelvis', 'wrist_R', [-0.25, -0.12]]],
    params: ['hip_L.flex', 'hip_R.flex', 'hip_R.abd', 'knee_R.flex', 'ankle_R.dorsi', 'shoulder.flex', 'wrist.ext'],
  },
  marichyasana_1_hands_off: { support: ['pelvis', 'ankle_L', 'ankle_R'], params: [] },
  marichyasana_1_hands_up: { support: ['pelvis', 'ankle_L', 'ankle_R'], params: [] },
  marichyasana_1: {
    support: ['pelvis', 'ankle_L', 'ankle_R'],
    flat: ['ankle_R'],
    at: [
      ['wrist_R', 'knee_R', [-0.04, -0.1, 0.09]], // hands clasped in front of the right shin
      ['wrist_L', 'knee_R', [0.04, -0.1, 0.09]],
    ],
    dir: [['thorax', [0, 1, 0], [0, 0.94, 0.34]]], // spine long, tipped about 20° forward
    params: ['hip_L.flex', 'hip_R.flex', 'hip_R.abd', 'knee_R.flex', 'ankle_R.dorsi', 'shoulder_R.flex', 'shoulder_R.abd', 'shoulder_R.rot', 'elbow_R.flex', 'shoulder_L.flex', 'shoulder_L.abd', 'shoulder_L.rot', 'elbow_L.flex'],
  },

  marichyasana_3_hand_off: { support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_R'], params: [] },
  marichyasana_3_hand_up: { support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_R'], params: [] },
  marichyasana_3: {
    support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_R'],
    flat: ['ankle_R', 'wrist_R'],
    rel: [['pelvis', 'ankle_R', [-0.1, 0.3]], ['pelvis', 'wrist_R', [-0.2, -0.17]]],
    at: [['elbow_L', 'knee_R', [-0.09, 0.03, 0.02]]], // left elbow against the outside of the right knee
    dir: [
      ['thorax', [0, 1, 0], [0, 1, 0]], // spine tall
      ['thorax', [0, 0, 1], [-0.6, 0, 0.8]], // chest turned about 35° to the right
      ['elbow_L', [0, -1, 0], [0, 1, 0]], // left forearm pointing up
    ],
    params: ['hip_R.flex', 'knee_R.flex', 'ankle_R.dorsi', 'thorax.rot', 'shoulder_L.flex', 'shoulder_L.abd', 'shoulder_L.rot', 'elbow_L.flex', 'shoulder_R.flex', 'shoulder_R.abd', 'wrist_R.ext'],
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
  viparita_virabhadrasana: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    rel: [['ankle_L', 'ankle_R', [-1.059, 0.014]]], // feet where they are in Warrior II (measured)
    dir: [
      ['ankle_L', [0, 0, 1], [1, 0, 0]],
      ['ankle_R', [0, 0, 1], [0.3, 0, 1]],
      ['thorax', [0, 0, 1], [0, 0, 1]], // chest open to the long side
      ['thorax', [0, 1, 0], [-0.35, 0.94, 0]], // trunk arching back over the back leg
      ['shoulder_L', [0, -1, 0], [-0.4, 0.92, 0]], // top arm up and back over the ear
    ],
    above: [['knee_L', 'ankle_L']],
    at: [['wrist_R', 'hip_R', [-0.06, -0.3, 0]]], // back hand resting on the outside of the back thigh
    // the legs stay as in Warrior II: only the spine and arms move
    params: ['ankle_L.dorsi', 'ankle_R.dorsi', 'lumbar.side', 'thorax.side', 'thorax.rot', 'shoulder_L.abd', 'shoulder_L.flex', 'shoulder_R.abd', 'shoulder_R.flex', 'elbow_R.flex'],
  },
  anjaneyasana_hands: {
    support: ['wrist_L', 'wrist_R', 'ankle_L', 'hip_R|knee_R', 'ankle_R'],
    flat: ['ankle_L', 'wrist_L', 'wrist_R'],
    balance: true,
    // hands and front foot where they are in Ashwa Sanchalanasana
    rel: [['wrist_R', 'wrist_L', [0.33, 0]], ['wrist_L', 'ankle_L', [-0.087, -0.201]]],
    params: ['root.pitch', 'hip_L.flex', 'knee_L.flex', 'ankle_L.dorsi', 'hip_R.flex', 'knee_R.flex', 'ankle_R.dorsi', 'shoulder.flex', 'lumbar.flex'],
  },
  anjaneyasana: {
    support: ['ankle_L', 'hip_R|knee_R', 'ankle_R'],
    flat: ['ankle_L'],
    balance: true,
    rel: [['ankle_L', 'knee_R', [-0.152, -0.6]]], // front foot and back knee where they are in anjaneyasana_hands
    dir: [
      ['thorax', [0, 1, 0], [0, 1, -0.08]], // trunk upright (a little lifted back)
      ['pelvis', [0, 1, 0], [0, 1, 0]], // pelvis upright (tailbone down): the stretch goes into the back hip
    ],
    above: [['knee_L', 'ankle_L']],
    params: ['root.pitch', 'hip_L.flex', 'knee_L.flex', 'ankle_L.dorsi', 'hip_R.flex', 'knee_R.flex', 'ankle_R.dorsi', 'lumbar.flex', 'thorax.flex'],
  },
  crescent_lunge: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L'],
    balance: true,
    rel: [['ankle_L', 'ankle_R', [-0.158, -1.036]]], // feet where they are in Ashwa Sanchalanasana
    dir: [['thorax', [0, 1, 0], [0, 1, -0.05]]], // trunk upright
    above: [['knee_L', 'ankle_L']],
    // front knee kept near 90° (out of the params): the back knee softens instead
    params: ['root.pitch', 'hip_L.flex', 'ankle_L.dorsi', 'hip_R.flex', 'knee_R.flex', 'ankle_R.dorsi', 'lumbar.flex'],
  },
  vajrasana: {
    support: ['hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R'],
    balance: true,
    // sit bones on the heels (as in Balasana), trunk upright, hands on the thighs
    at: [
      ['pelvis', 'knee_L', [-0.07, -0.3, -0.1], 0.5],
      ['pelvis', 'knee_R', [0.07, -0.3, -0.1], 0.5],
      ['wrist_L', 'hip_L', [0, -0.2, 0.09]],
      ['wrist_R', 'hip_R', [0, -0.2, 0.09]],
    ],
    dir: [['thorax', [0, 1, 0], [0, 1, 0]], ['lumbar', [0, 1, 0], [0, 1, 0]]],
    params: ['root.pitch&hip.flex', 'lumbar.flex', 'thorax.flex', 'shoulder.flex', 'shoulder.abd', 'elbow.flex'],
  },
  eka_pada_adho_mukha_svanasana: {
    support: ['wrist_L', 'wrist_R', 'ankle_R'],
    balance: true,
    // hands and standing foot where they are in Downward Dog
    rel: [['wrist_R', 'wrist_L', [0.329, 0]], ['wrist_L', 'ankle_R', [-0.24, -1.368]]],
    params: ['shoulder.flex', 'hip_R.flex', 'ankle_R.dorsi', 'root.roll', 'hip_L.flex'],
  },
  dandayamana_bharmanasana: {
    support: ['wrist_L', 'hip_R|knee_R', 'ankle_R'],
    flat: ['wrist_L'],
    balance: true,
    rel: [['wrist_L', 'knee_R', [-0.238, -0.5]]], // hand and knee where they are in Tabletop
    dir: [
      ['shoulder_R', [0, -1, 0], [0, 0, 1]], // arm forward, level with the trunk
      ['hip_L', [0, -1, 0], [0, 0, -1]], // leg back, level with the trunk
    ],
    params: ['root.roll', 'shoulder_L.flex', 'shoulder_L.abd', 'hip_R.flex', 'hip_R.abd', 'shoulder_R.flex', 'hip_L.flex', 'wrist_L.ext'],
  },
  tabletop_forearms_toes: {
    support: ['elbow_L', 'elbow_R', 'wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R'],
    params: ['root.pitch&hip.flex&shoulder.flex', 'ankle.dorsi', 'knee.flex'],
  },
  ardha_pincha_mayurasana_mid: {
    support: ['elbow_L', 'elbow_R', 'wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'],
    flat: ['elbow_L', 'elbow_R'],
    params: ['root.pitch&shoulder.flex', 'shoulder.flex', 'elbow.flex', 'ankle.dorsi'],
  },
  adho_mukha_vrksasana_wall: {
    support: ['wrist_L', 'wrist_R'],
    flat: ['wrist_L', 'wrist_R'],
    wall: ['ankle_L', 'ankle_R'], // toes on the wall
    rel: [['wrist_R', 'wrist_L', [0.33, 0]]],
    params: ['wrist.ext'],
  },
  pincha_mayurasana_wall: {
    support: ['elbow_L', 'elbow_R', 'wrist_L', 'wrist_R'],
    flat: ['elbow_L', 'elbow_R'],
    wall: ['ankle_L', 'ankle_R'], // toes on the wall
    dir: [['shoulder_L', [0, -1, 0], [0, -1, 0.1]], ['shoulder_R', [0, -1, 0], [0, -1, 0.1]]], // upper arms near vertical
    params: ['root.pitch', 'shoulder.flex', 'elbow.flex'],
  },
  ardha_pincha_mayurasana: {
    support: ['elbow_L', 'elbow_R', 'wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'],
    flat: ['elbow_L', 'elbow_R'], // the whole forearm down
    // upper arms near vertical (elbows under the shoulders), so the head hangs clear of the mat
    dir: [['shoulder_L', [0, -1, 0], [0, -1, 0.15]], ['shoulder_R', [0, -1, 0], [0, -1, 0.15]]],
    params: ['root.pitch&shoulder.flex', 'shoulder.flex', 'hip.flex', 'knee.flex', 'ankle.dorsi', 'elbow.flex'],
  },
  sirsasana_prep: {
    support: ['elbow_L', 'elbow_R', 'wrist_L', 'wrist_R', 'head', 'ankle_L', 'ankle_R'],
    rel: [['wrist_L', 'wrist_R', [-0.06, 0]]], // hands clasped
    params: ['root.pitch&shoulder.flex', 'shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'elbow.flex', 'neck.flex', 'hip.flex', 'ankle.dorsi'],
  },
  forearm_plank: {
    support: ['elbow_L', 'elbow_R', 'wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'],
    above: [['shoulder_L', 'elbow_L'], ['shoulder_R', 'elbow_R']], // elbows under the shoulders
    params: ['root.pitch&shoulder.flex', 'shoulder.flex', 'ankle.dorsi', 'elbow.flex'],
  },
  forearm_plank_knees: {
    support: ['elbow_L', 'elbow_R', 'wrist_L', 'wrist_R', 'hip_L|knee_L', 'hip_R|knee_R'],
    above: [['shoulder_L', 'elbow_L'], ['shoulder_R', 'elbow_R']],
    params: ['root.pitch&shoulder.flex', 'shoulder.flex', 'elbow.flex', 'knee.flex'],
  },
  salamba_bhujangasana: {
    support: ['pelvis', 'hip_L|knee_L', 'hip_R|knee_R', 'elbow_L', 'elbow_R', 'wrist_L', 'wrist_R', 'ankle_L', 'ankle_R'],
    above: [['shoulder_L', 'elbow_L'], ['shoulder_R', 'elbow_R']], // elbows under the shoulders
    params: ['shoulder.flex', 'elbow.flex', 'root.pitch&hip.flex', 'root.pitch', 'hip.flex', 'lumbar.flex', 'ankle.dorsi'],
  },
  salabhasana: {
    support: ['pelvis', 'lumbar'], // belly and pelvis; chest, arms and legs lifted
    params: ['root.pitch', 'hip.flex', 'lumbar.flex'],
  },
  makarasana: {
    // legs turned out: the inner knees rest on the mat (no contact points there), the feet on their inner edges
    support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], // forearms rest ~2 cm up on the stacked hands
    // forearms folded in front of the forehead, hands stacked near the midline
    rel: [['head', 'wrist_L', [0.04, 0.17]], ['head', 'wrist_R', [-0.04, 0.17]], ['head', 'elbow_L', [0.26, 0.1]], ['head', 'elbow_R', [-0.26, 0.1]]],
    params: ['root.pitch', 'shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'elbow.flex', 'ankle.dorsi'],
  },
  parsva_tadasana: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    params: ['ankle.dorsi'],
  },
  parsva_tadasana_R: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    params: ['ankle.dorsi'],
  },
  parsvottanasana_stance: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    rel: [['ankle_L', 'ankle_R', [-0.16, -0.75]]], // about a leg length, hip width apart
    dir: [
      ['pelvis', [0, 1, 0], [0, 1, 0]],
      ['pelvis', [0, 0, 1], [0, 0, 1]], // hips square to the front
      ['ankle_L', [0, 0, 1], [0, 0, 1]], // front foot points forward
      ['ankle_R', [0, 0, 1], [-0.6, 0, 0.8]], // back foot turned out ~40°
      ['thorax', [0, 1, 0], [0, 1, 0]],
    ],
    params: ['root.pitch', 'hip_L.flex', 'hip_R.flex', 'hip_R.rot', 'hip_R.abd', 'hip_L.abd', 'ankle_L.dorsi', 'ankle_R.dorsi', 'lumbar.flex'],
  },
  parsvottanasana: {
    support: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    balance: true,
    rel: [['ankle_L', 'ankle_R', [-0.16, -0.75]]], // the stance stays
    // palms either side of the front foot
    at: [['wrist_L', 'ankle_L', [0.11, -0.02, 0.12]], ['wrist_R', 'ankle_L', [-0.11, -0.02, 0.12]]],
    // folded from the hips (legs as in the stance), the spine curve kept
    // legs as in the stance (root.pitch&hip.flex would not keep abducted / rotated legs: the hip's
    // abduction is its outermost angle), spine curve kept: only the arms and ankles adjust
    params: ['shoulder.flex', 'shoulder.abd', 'elbow.flex', 'ankle_L.dorsi', 'ankle_R.dorsi', 'lumbar.flex'],
  },
  parivrtta_trikonasana: {
    support: ['ankle_L', 'ankle_R', 'wrist_R'],
    onProp: ['wrist_R'],
    flat: ['ankle_L', 'ankle_R', 'wrist_R'], // palm flat on the block
    balance: true,
    rel: [['ankle_L', 'ankle_R', [-0.16, -0.75]]], // the Pyramid stance
    dir: [['shoulder_R', [0, -1, 0], [0, -1, 0]], ['shoulder_L', [0, -1, 0], [0, 1, 0]]], // arms one vertical line
    params: ['thorax.rot', 'lumbar.rot', 'shoulder_R.flex', 'shoulder_R.abd', 'shoulder_L.flex', 'shoulder_L.abd', 'wrist_R.ext', 'ankle_L.dorsi', 'ankle_R.dorsi', 'lumbar.flex'],
  },
  prasarita_stance: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    rel: [['ankle_L', 'ankle_R', [-1.1, 0]]],
    dir: [['ankle_L', [0, 0, 1], [0, 0, 1]], ['ankle_R', [0, 0, 1], [0, 0, 1]]], // feet parallel
    params: ['hip.abd', 'hip.rot', 'ankle.dorsi'],
  },
  prasarita_padottanasana: {
    support: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    balance: true,
    // the stance stays; hands shoulder-width apart, a little in front of the line of the feet (a
    // base of support with some depth)
    rel: [['ankle_L', 'ankle_R', [-1.1, 0]], ['wrist_R', 'wrist_L', [0.33, 0]], ['ankle_L', 'wrist_L', [-0.385, 0.12]]],
    params: ['shoulder.flex', 'shoulder.abd', 'elbow.flex', 'ankle.dorsi', 'lumbar.flex', 'thorax.flex'],
  },
  skandasana: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L'],
    balance: true,
    rel: [['ankle_L', 'ankle_R', [-1.1, 0]]], // the Prasarita stance
    at: [['wrist_L', 'thorax', [0.03, 0.12, 0.2]], ['wrist_R', 'thorax', [-0.03, 0.12, 0.2]]], // palms together at the chest
    params: ['ankle_L.dorsi', 'ankle_R.dorsi', 'hip_L.flex', 'knee_L.flex', 'hip_R.abd', 'hip_R.flex', 'hip_R.rot', 'root.roll', 'shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'elbow.flex'],
  },  skandasana_R: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_R'],
    balance: true,
    rel: [['ankle_L', 'ankle_R', [-1.1, 0]]],
    at: [['wrist_L', 'thorax', [0.03, 0.12, 0.2]], ['wrist_R', 'thorax', [-0.03, 0.12, 0.2]]],
    params: [],
  },

  malasana: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    balance: true,
    at: [['wrist_L', 'thorax', [0.03, 0.12, 0.2]], ['wrist_R', 'thorax', [-0.03, 0.12, 0.2]]], // palms together at the chest
    params: ['ankle.dorsi', 'root.pitch&-lumbar.flex', 'shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'elbow.flex'],
  },
  utkata_konasana_stance: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    rel: [['ankle_L', 'ankle_R', [-0.95, 0]]],
    dir: [['ankle_L', [0, 0, 1], [0.7, 0, 0.7]], ['ankle_R', [0, 0, 1], [-0.7, 0, 0.7]]], // toes out ~45°
    params: ['hip.abd', 'hip.rot', 'ankle.dorsi'],
  },
  utkata_konasana: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    rel: [['ankle_L', 'ankle_R', [-0.95, 0]]],
    dir: [
      ['ankle_L', [0, 0, 1], [0.7, 0, 0.7]],
      ['ankle_R', [0, 0, 1], [-0.7, 0, 0.7]],
      ['hip_L', [0, -1, 0], [0.7, -0.35, 0.6]], // knees open toward the toes, thighs toward level
      ['hip_R', [0, -1, 0], [-0.7, -0.35, 0.6]],
      ['thorax', [0, 1, 0], [0, 1, 0]],
    ],
    above: [['knee_L', 'ankle_L'], ['knee_R', 'ankle_R']],
    params: ['hip.flex', 'hip.abd', 'hip.rot', 'ankle.dorsi', 'root.pitch&-lumbar.flex'],
  },
  virabhadrasana_3: {
    support: ['ankle_L'],
    flat: ['ankle_L'],
    balance: true,
    dir: [['thorax', [0, 1, 0], [0, 0, 1]], ['hip_R', [0, -1, 0], [0, 0, -1]]], // trunk and back leg level
    params: ['root.pitch&hip_L.flex', 'hip_L.flex', 'hip_R.flex', 'ankle_L.dorsi', 'lumbar.flex'],
  },
  virabhadrasana_3_blocks: {
    support: ['ankle_L', 'wrist_L', 'wrist_R'],
    onProp: ['wrist_L', 'wrist_R'],
    flat: ['ankle_L'],
    balance: true,
    dir: [['thorax', [0, 1, 0], [0, 0, 1]], ['hip_R', [0, -1, 0], [0, 0, -1]], ['shoulder_L', [0, -1, 0], [0, -1, 0]], ['shoulder_R', [0, -1, 0], [0, -1, 0]]],
    params: ['root.pitch&hip_L.flex', 'hip_L.flex', 'hip_R.flex', 'ankle_L.dorsi', 'shoulder.flex', 'wrist.ext'],
  },
  camatkarasana: {
    support: ['wrist_R', 'ankle_R', 'ankle_L'],
    flat: ['wrist_R', 'ankle_L'],
    balance: true,
    above: [['shoulder_R', 'wrist_R']], // hand under the shoulder
    rel: [['ankle_R', 'ankle_L', [-0.25, 0.3]]], // left foot planted behind the right leg
    dir: [['thorax', [0, 0, 1], [0.45, 0.75, 0.5]]], // chest turned up toward the ceiling
    params: ['root.roll', 'root.pitch', 'lumbar.flex', 'hip_R.flex', 'hip_R.abd', 'hip_L.flex', 'hip_L.abd', 'knee_L.flex', 'ankle_L.dorsi', 'ankle_R.dorsi', 'shoulder_R.abd', 'shoulder_R.flex', 'wrist_R.ext'],
  },
  vasisthasana: {
    support: ['wrist_R', 'ankle_R', 'ankle_L'],
    flat: ['wrist_R'],
    balance: true,
    above: [['shoulder_R', 'wrist_R']], // hand under the shoulder
    dir: [['shoulder_L', [0, -1, 0], [0, 1, 0]]], // top arm vertical
    params: ['root.roll', 'root.pitch', 'hip.abd', 'hip_L.flex', 'ankle.dorsi', 'shoulder_R.abd', 'shoulder_R.flex', 'shoulder_L.abd', 'wrist_R.ext'],
  },
  vasisthasana_knee: {
    support: ['wrist_R', 'hip_R|knee_R', 'ankle_L'],
    flat: ['wrist_R'],
    balance: true,
    above: [['shoulder_R', 'wrist_R']],
    dir: [['shoulder_L', [0, -1, 0], [0, 1, 0]]],
    params: ['root.roll', 'root.pitch', 'hip.abd', 'hip_L.flex', 'hip_R.flex', 'ankle_L.dorsi', 'shoulder_R.abd', 'shoulder_R.flex', 'shoulder_L.abd', 'wrist_R.ext'],
  },
  parighasana_prep: {
    support: ['hip_R|knee_R', 'ankle_R', 'ankle_L'],
    flat: ['ankle_L'],
    balance: true,
    dir: [['thorax', [0, 1, 0], [0, 1, 0]], ['ankle_L', [0, 0, 1], [0, 0, 1]]], // trunk upright, left foot pointing forward
    params: ['hip_L.abd', 'hip_L.rot', 'hip_L.flex', 'ankle_L.dorsi', 'hip_R.flex', 'knee_R.flex', 'ankle_R.dorsi', 'root.roll', 'root.pitch'],
  },
  parighasana: {
    support: ['hip_R|knee_R', 'ankle_R', 'ankle_L'],
    flat: ['ankle_L'],
    balance: true,
    at: [['wrist_L', 'knee_L', [0.03, -0.22, 0.05]]], // left hand resting on the shin
    dir: [['shoulder_R', [0, -1, 0], [0.6, 0.8, 0]], ['ankle_L', [0, 0, 1], [0, 0, 1]]], // top arm reaching over toward the left
    params: ['hip_L.abd', 'hip_L.rot', 'hip_L.flex', 'ankle_L.dorsi', 'hip_R.flex', 'root.roll', 'lumbar.side', 'thorax.side', 'shoulder_L.abd', 'shoulder_L.flex', 'shoulder_R.abd'],
  },
  anahatasana: {
    support: ['hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R', 'head'],
    flat: ['wrist_L', 'wrist_R'],
    above: [['hip_L', 'knee_L'], ['hip_R', 'knee_R']], // hips stay over the knees
    rel: [['wrist_R', 'wrist_L', [0.33, 0]]],
    params: ['root.pitch&hip.flex', 'hip.flex', 'lumbar.flex', 'thorax.flex', 'neck.flex', 'shoulder.flex', 'wrist.ext'],
  },
  virasana_block: {
    support: ['pelvis', 'hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R'],
    onProp: ['pelvis'],
    balance: true,
    rel: [['knee_R', 'knee_L', [0.12, 0]], ['pelvis', 'ankle_L', [0.17, 0]], ['pelvis', 'ankle_R', [-0.17, 0]]],
    at: [['wrist_L', 'hip_L', [0, -0.2, 0.09]], ['wrist_R', 'hip_R', [0, -0.2, 0.09]]],
    dir: [['thorax', [0, 1, 0], [0, 1, 0]]],
    params: ['hip.flex', 'hip.abd', 'hip.rot', 'knee.flex', 'ankle.dorsi', 'root.pitch&-lumbar.flex', 'shoulder.flex', 'elbow.flex'],
  },
  janu_sirsasana_up: {
    support: ['pelvis', 'ankle_L', 'hip_R|knee_R', 'wrist_L', 'wrist_R'],
    flat: ['wrist_L', 'wrist_R'],
    at: [['ankle_R', 'hip_L', [-0.07, -0.18, 0]]], // sole against the inner left thigh
    rel: [['pelvis', 'wrist_L', [0.25, -0.12]], ['pelvis', 'wrist_R', [-0.25, -0.12]]], // hands where they are in Dandasana
    params: ['hip_R.flex', 'hip_R.rot', 'knee_R.flex', 'ankle_R.dorsi', 'shoulder.flex', 'wrist.ext'],
  },
  parivrtta_janu_sirsasana: {
    support: ['pelvis', 'ankle_L', 'hip_R|knee_R'],
    at: [
      ['wrist_L', 'knee_L', [-0.05, -0.12, 0.05]], // left hand on the inner left shin
    ],
    dir: [['shoulder_R', [0, -1, 0], [0.85, 0.5, 0.15]]], // top arm reaching over toward the left foot
    params: ['hip_L.flex', 'root.roll', 'shoulder_L.flex', 'shoulder_L.abd', 'elbow_L.flex', 'shoulder_R.abd', 'shoulder_R.flex', 'shoulder_R.rot'],
  },
  krounchasana: {
    support: ['pelvis', 'hip_R|knee_R', 'ankle_R'],
    balance: true,
    dir: [
      ['hip_L', [0, -1, 0], [0, 0.82, 0.57]], // leg about 55° up
      ['thorax', [0, 1, 0], [0, 0.99, -0.1]], // spine tall
    ],
    at: [['wrist_L', 'pelvis', [0.1, 0.52, 0.33]], ['wrist_R', 'pelvis', [-0.02, 0.52, 0.33]]], // hands on the strap, short of the foot
    params: ['root.pitch', 'hip_L.flex', 'ankle_R.dorsi', 'knee_R.flex', 'hip_R.rot', 'shoulder_L.flex', 'shoulder_L.abd', 'shoulder_R.flex', 'shoulder_R.abd'],
  },
  janu_sirsasana: {
    support: ['pelvis', 'ankle_L', 'hip_R|knee_R'],
    // hands resting on either side of the left shin (on the leg: not a support in the physics)
    at: [['wrist_L', 'knee_L', [0.07, -0.2, 0.03]], ['wrist_R', 'knee_L', [-0.07, -0.2, 0.03]]],
    params: ['hip_L.flex', 'hip_R.flex', 'shoulder.flex', 'shoulder.abd', 'elbow.flex'],
  },
  upavistha_konasana_up: {
    support: ['pelvis', 'ankle_L', 'ankle_R'],
    rel: [['ankle_R', 'ankle_L', [1.24, 0]]],
    // hands resting on the thighs (on the legs: no support), so they reach forward from above the mat
    at: [['wrist_L', 'hip_L', [0, -0.25, 0.09]], ['wrist_R', 'hip_R', [0, -0.25, 0.09]]],
    params: ['hip.rot', 'shoulder.flex', 'shoulder.abd', 'elbow.flex', 'ankle.dorsi'],
  },
  upavistha_konasana: {
    support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['wrist_L', 'wrist_R'],
    rel: [['wrist_R', 'wrist_L', [0.33, 0]]],
    params: ['hip.flex', 'shoulder.flex', 'shoulder.abd', 'elbow.flex', 'wrist.ext', 'lumbar.flex', 'thorax.flex', 'ankle.dorsi'],
  },
  supta_matsyendrasana: {
    // the left shoulder blade lifts a few cm: the spine cannot turn back the whole pelvis turn
    support: ['scapula_R', 'hip_R', 'wrist_L', 'wrist_R'],
    onProp: ['hip_R'], // the outer right thigh on the bolster
    params: ['root.pitch', 'shoulder.abd', 'shoulder.flex', 'shoulder.rot', 'hip.flex', 'knee.flex'],
  },
  ustrasana_blocks: {
    support: ['hip_L|knee_L', 'hip_R|knee_R', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    onProp: ['wrist_L', 'wrist_R'],
    balance: true,
    dir: [['hip_L', [0, -1, 0], [0, -1, 0.05]]], // thighs about vertical: hips over the knees
    params: ['root.pitch&hip.flex', 'shoulder.flex', 'shoulder.abd', 'lumbar.flex', 'thorax.flex', 'wrist.ext', 'ankle.dorsi'],
  },
  supine_hands_under: {
    support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    params: ['shoulder.flex', 'shoulder.abd', 'elbow.flex'],
  },
  matsyasana: {
    support: ['pelvis', 'ankle_L', 'ankle_R', 'elbow_L', 'elbow_R', 'head'],
    params: ['shoulder.flex', 'elbow.flex', 'neck.flex', 'head.flex', 'root.pitch&hip.flex', 'root.pitch&-lumbar.flex', 'thorax.flex'],
  },
  matsyasana_supported: {
    support: ['pelvis', 'scapula_L', 'scapula_R', 'head', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    onProp: ['scapula_L', 'scapula_R'], // the shoulder blades on the block
    params: ['root.pitch', 'hip.flex', 'neck.flex', 'thorax.flex', 'shoulder.flex', 'shoulder.abd', 'ankle.dorsi'],
  },
  setu_bandha_block_knees: {
    support: ['pelvis', 'scapula_L', 'scapula_R', 'wrist_L', 'wrist_R'],
    params: ['root.pitch', 'neck.flex', 'shoulder.flex'],
  },
  viparita_karani_block: {
    support: ['pelvis', 'scapula_L', 'scapula_R', 'wrist_L', 'wrist_R'],
    dir: [['hip_L', [0, -1, 0], [0, 1, 0]]], // legs vertical
    params: ['root.pitch', 'hip.flex', 'neck.flex', 'shoulder.flex'],
  },
  janu_sirsasana_knee_out: {
    support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    rel: [['pelvis', 'wrist_L', [0.25, -0.12]], ['pelvis', 'wrist_R', [-0.25, -0.12]]],
    params: ['hip_R.flex', 'hip_R.rot', 'knee_R.flex', 'ankle_R.dorsi'],
  },
  janu_sirsasana_knee_mid: {
    support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    rel: [['pelvis', 'wrist_L', [0.25, -0.12]], ['pelvis', 'wrist_R', [-0.25, -0.12]]],
    params: ['hip_R.flex', 'knee_R.flex', 'ankle_R.dorsi'],
  },
  parighasana_knee_up: {
    support: ['hip_R|knee_R', 'ankle_R', 'ankle_L'],
    flat: ['ankle_L'],
    balance: true,
    params: ['knee_R.flex', 'ankle_R.dorsi', 'hip_L.flex', 'hip_L.abd', 'hip_L.rot', 'knee_L.flex', 'ankle_L.dorsi', 'hip_R.flex'],
  },
  supine_arms_up: { support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R'], params: [] },
  supta_tadasana: {
    support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    params: ['shoulder.flex', 'shoulder.abd', 'shoulder.rot'],
  },
  apanasana: {
    support: ['pelvis', 'scapula_L', 'scapula_R'],
    at: [['wrist_L', 'knee_L', [0.0, -0.1, 0.06]], ['wrist_R', 'knee_R', [0.0, -0.1, 0.06]]], // hands on the shins
    params: ['shoulder.flex', 'shoulder.abd', 'shoulder.rot'],
  },
  supta_kapotasana_knee_up: { support: ['pelvis', 'scapula_L', 'scapula_R', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['ankle_R.dorsi'] },
  supta_kapotasana_cross: { support: ['pelvis', 'scapula_L', 'scapula_R', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['ankle_R.dorsi'] },
  supta_kapotasana: {
    support: ['pelvis', 'scapula_L', 'scapula_R'],
    at: [['wrist_L', 'hip_R', [0.03, -0.3, -0.07]], ['wrist_R', 'hip_R', [-0.05, -0.3, -0.07]]], // hands clasped behind the right thigh
    params: ['shoulder.flex', 'shoulder.abd', 'shoulder.rot'],
  },
  pavanamuktasana_heel_slide: { support: ['pelvis', 'scapula_L', 'scapula_R', 'ankle_R', 'ankle_L'], params: ['hip_L.flex', 'ankle_L.dorsi'] },
  pavanamuktasana_knee_up: { support: ['pelvis', 'scapula_L', 'scapula_R', 'ankle_R', 'ankle_L'], params: ['hip_L.flex', 'ankle_L.dorsi'] },
  pavanamuktasana: {
    support: ['pelvis', 'scapula_L', 'scapula_R', 'ankle_R'],
    // hands clasped on the front of the left shin, below the knee
    at: [['wrist_L', 'knee_L', [0.06, -0.1, 0.06]], ['wrist_R', 'knee_L', [-0.06, -0.1, 0.06]]],
    params: ['shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'elbow.flex'],
  },
  jathara_start: { support: ['pelvis', 'thorax', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], params: ['ankle.dorsi'] },
  jathara_knees_up: { support: ['pelvis', 'scapula_L', 'scapula_R', 'wrist_L', 'wrist_R'], params: ['shoulder.abd', 'shoulder.rot', 'shoulder.flex'] },
  jathara_legs_up: { support: ['pelvis', 'scapula_L', 'scapula_R', 'wrist_L', 'wrist_R'], params: ['shoulder.abd', 'shoulder.rot', 'shoulder.flex'] },
  jathara_parivartanasana: {
    support: ['scapula_L', 'scapula_R', 'pelvis', 'wrist_L', 'wrist_R'],
    params: ['root.pitch', 'shoulder.abd', 'shoulder.flex', 'shoulder.rot', 'thorax.rot'],
  },
  jathara_parivartanasana_knees: {
    support: ['scapula_L', 'scapula_R', 'pelvis', 'wrist_L', 'wrist_R'],
    params: ['root.pitch', 'shoulder.abd', 'shoulder.flex', 'shoulder.rot', 'thorax.rot'],
  },
  supta_padangusthasana_bent: {
    support: ['pelvis', 'scapula_L', 'scapula_R', 'ankle_R'],
    params: ['shoulder.flex', 'elbow.flex', 'ankle_R.dorsi'],
  },
  supta_padangusthasana: {
    support: ['pelvis', 'scapula_L', 'scapula_R', 'ankle_R'],
    dir: [['hip_L', [0, -1, 0], [0, 0.95, 0.3]]], // the raised leg near vertical
    params: ['hip_L.flex', 'ankle_R.dorsi'],
  },
  ananda_balasana: {
    support: ['pelvis', 'scapula_L', 'scapula_R'],
    dir: [
      ['knee_L', [0, -1, 0], [0, 1, 0]], // shins vertical, soles up
      ['knee_R', [0, -1, 0], [0, 1, 0]],
      ['hip_L', [0, -1, 0], [0.55, 0.5, -0.67]], // knees wide, toward the armpits
      ['hip_R', [0, -1, 0], [-0.55, 0.5, -0.67]],
    ],
    params: ['hip.flex', 'hip.abd', 'hip.rot', 'knee.flex', 'ankle.dorsi'],
  },
  ananda_balasana_in: { support: ['pelvis', 'scapula_L', 'scapula_R'], params: [] },
  dhanurasana_prep: {
    support: ['pelvis', 'thorax', 'hip_L|knee_L', 'hip_R|knee_R'],
    params: ['root.pitch', 'hip.flex', 'shoulder.flex'],
  },
  dhanurasana: {
    support: ['pelvis', 'lumbar'], // rocking on the belly
    params: ['root.pitch', 'hip.flex', 'lumbar.flex'],
  },
  utthita_hasta_padangusthasana: {
    support: ['ankle_R'],
    flat: ['ankle_R'],
    dir: [['hip_L', [0, -1, 0], [0, -0.15, 1]], ['thorax', [0, 1, 0], [0, 1, 0]]], // leg about hip height, trunk upright
    params: ['hip_L.flex', 'ankle_R.dorsi', 'lumbar.flex'],
  },
  utthita_hasta_padangusthasana_knee: { support: ['ankle_R'], flat: ['ankle_R'], params: ['ankle_R.dorsi'] },
  natarajasana: {
    support: ['ankle_R'],
    flat: ['ankle_R'],
    balance: true,
    dir: [['hip_R', [0, -1, 0], [0, -1, 0]]], // standing leg vertical
    params: ['hip_R.flex', 'ankle_R.dorsi', 'root.pitch&hip_R.flex&hip_L.flex'],
  },
  natarajasana_knee: { support: ['ankle_R'], flat: ['ankle_R'], params: ['ankle_R.dorsi'] },
  eka_pada_rajakapotasana: {
    support: ['hip_L', 'ankle_L', 'hip_R|knee_R', 'ankle_R', 'wrist_L', 'wrist_R'],
    params: ['hip_R.flex', 'knee_R.flex', 'ankle_R.dorsi', 'ankle_L.dorsi', 'shoulder.flex', 'shoulder.abd', 'wrist.ext', 'hip_L.flex', 'knee_L.flex', 'root.pitch&-lumbar.flex'],
  },
  bharadvajasana: {
    support: ['pelvis', 'hip_L|knee_L', 'hip_R|knee_R', 'wrist_L', 'wrist_R'],
    flat: ['wrist_L', 'wrist_R'],
    at: [['wrist_R', 'knee_L', [0.12, 0.0, 0.0]]], // right hand on the mat outside the left knee
    rel: [['pelvis', 'wrist_L', [0.12, -0.25]]], // left hand behind the left hip
    params: ['root.roll', 'root.pitch', 'hip_R.rot', 'hip_R.abd', 'ankle.dorsi', 'shoulder_R.flex', 'shoulder_R.abd', 'shoulder_R.rot', 'elbow_R.flex', 'shoulder_L.flex', 'shoulder_L.abd', 'elbow_L.flex', 'wrist.ext'],
  },
  siddhasana: {
    support: ['pelvis', 'hip_L', 'hip_R'],
    // the backs of the hands on the knees (no hand–knee force in the physics)
    at: [['wrist_L', 'knee_L', [0.0, 0.06, 0.08]], ['wrist_R', 'knee_R', [0.0, 0.06, 0.08]]],
    dir: [['thorax', [0, 1, 0], [0, 1, 0]]], // trunk upright
    params: ['ankle.dorsi', 'shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'elbow.flex'],
  },
  utkatasana_prayer: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    at: [['wrist_L', 'thorax', [0.03, 0.12, 0.2]], ['wrist_R', 'thorax', [-0.03, 0.12, 0.2]]], // palms together at the chest
    params: ['shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'elbow.flex'],
  },
  parivrtta_utkatasana: {
    support: ['ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    balance: true,
    at: [['wrist_L', 'thorax', [0.03, 0.12, 0.2]], ['wrist_R', 'thorax', [-0.03, 0.12, 0.2]]],
    params: ['shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'elbow.flex', 'root.pitch&hip.flex', 'ankle.dorsi'],
  },
  anjaneyasana_prayer: {
    support: ['ankle_L', 'hip_R|knee_R', 'ankle_R'],
    flat: ['ankle_L'],
    balance: true,
    rel: [['ankle_L', 'knee_R', [-0.152, -0.6]]],
    at: [['wrist_L', 'thorax', [0.03, 0.12, 0.2]], ['wrist_R', 'thorax', [-0.03, 0.12, 0.2]]], // palms together at the chest
    params: ['shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'elbow.flex', 'ankle_R.dorsi'],
  },
  parivrtta_parsvakonasana: {
    support: ['ankle_L', 'hip_R|knee_R', 'ankle_R'],
    flat: ['ankle_L'],
    balance: true,
    rel: [['ankle_L', 'knee_R', [-0.152, -0.6]]],
    at: [
      ['wrist_L', 'thorax', [0.03, 0.12, 0.2]], // palms together at the chest
      ['wrist_R', 'thorax', [-0.03, 0.12, 0.2]],
    ],
    params: ['shoulder.flex', 'shoulder.abd', 'shoulder.rot', 'elbow.flex', 'ankle_R.dorsi'],
  },
  sukhasana: { support: ['pelvis', 'hip_L', 'hip_R'], params: ['ankle.dorsi'] },
  parsva_sukhasana: {
    support: ['pelvis', 'hip_L', 'hip_R', 'wrist_L'],
    flat: ['wrist_L'],
    dir: [['shoulder_R', [0, -1, 0], [0.55, 0.83, 0]]], // top arm reaching up and over to the left
    params: ['shoulder_L.flex', 'shoulder_L.abd', 'wrist_L.ext', 'shoulder_R.abd', 'shoulder_R.flex', 'thorax.side', 'ankle.dorsi'],
  },
  ardha_padmasana: {
    support: ['pelvis', 'hip_R', 'ankle_R'],
    dir: [['thorax', [0, 1, 0], [0, 1, 0]]], // trunk upright over the tilted pelvis
    at: [['wrist_L', 'pelvis', [0.15, 0.13, 0.38]], ['wrist_R', 'pelvis', [-0.22, 0.06, 0.36]]], // hands resting on the knees
    params: ['root.roll', 'hip_R.flex', 'hip_R.rot', 'knee_R.flex', 'ankle_R.dorsi', 'lumbar.side', 'shoulder_L.flex', 'shoulder_L.abd', 'shoulder_R.flex', 'shoulder_R.abd'],
  },
  agnistambhasana: {
    support: ['pelvis', 'hip_R', 'ankle_R'],
    at: [['wrist_L', 'pelvis', [0.16, 0.13, 0.38]], ['wrist_R', 'pelvis', [-0.2, 0.13, 0.38]]], // hands resting on the top knee and foot
    params: ['root.roll', 'ankle_R.dorsi', 'knee_R.flex', 'hip_R.rot', 'shoulder_L.flex', 'shoulder_L.abd', 'shoulder_R.flex', 'shoulder_R.abd'],
  },
  gomukhasana: {
    support: ['pelvis', 'hip_L', 'ankle_L', 'ankle_R'],
    at: [
      ['wrist_R', 'thorax', [-0.0, 0.2, -0.14]], // top hand between the shoulder blades
      ['wrist_L', 'thorax', [0.0, -0.08, -0.15]], // bottom hand on the back of the waist
    ],
    dir: [
      ['shoulder_R', [0, -1, 0], [0, 1, 0]], // top upper arm pointing straight up, elbow beside the head
      ['shoulder_L', [0, -1, 0], [0.2, -0.85, -0.5]], // bottom upper arm down and back
      ['elbow_L', [0, -1, 0], [-0.9, 0.4, 0]], // bottom forearm across the back
    ],
    params: ['root.roll', 'ankle_R.dorsi', 'shoulder_R.flex', 'shoulder_R.abd', 'shoulder_R.rot', 'elbow_R.flex', 'shoulder_L.flex', 'shoulder_L.abd', 'shoulder_L.rot', 'elbow_L.flex'],
  },
  parivrtta_sukhasana: {
    support: ['pelvis', 'hip_L', 'hip_R', 'wrist_L'],
    flat: ['wrist_L'],
    at: [['wrist_R', 'knee_L', [0.0, 0.06, 0.08]]], // right hand on the left knee (no force)
    rel: [['pelvis', 'wrist_L', [0.1, -0.25]]], // left hand behind the hips
    params: ['shoulder_R.flex', 'shoulder_R.abd', 'shoulder_R.rot', 'shoulder_L.flex', 'shoulder_L.abd', 'wrist_L.ext', 'ankle.dorsi'],
  },
  baddha_konasana_up: {
    support: ['pelvis', 'ankle_L', 'ankle_R'],
    flat: ['ankle_L', 'ankle_R'],
    rel: [['pelvis', 'ankle_L', [0.08, 0.38]]], // heels a little in front of the sit bones
    params: ['hip.flex', 'knee.flex', 'ankle.dorsi', 'shoulder.flex'],
  },
  baddha_konasana: {
    support: ['pelvis', 'ankle_L', 'ankle_R'],
    at: [['wrist_L', 'ankle_L', [0.0, -0.02, 0.1]], ['wrist_R', 'ankle_R', [0.0, -0.02, 0.1]]], // hands on the feet
    params: ['ankle.dorsi', 'shoulder.flex', 'shoulder.abd', 'shoulder.rot'],
  },
  paschimottanasana_strap: { support: ['pelvis', 'ankle_L', 'ankle_R'], params: ['hip.flex', 'ankle.dorsi'] },
  ardha_purvottanasana: {
    support: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    above: [['shoulder_L', 'wrist_L'], ['shoulder_R', 'wrist_R'], ['knee_L', 'ankle_L'], ['knee_R', 'ankle_R']],
    params: ['shoulder.flex', 'knee.flex', 'ankle.dorsi', 'root.pitch&-shoulder.flex'],
  },
  dandasana_knees_back: {
    support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    rel: [['wrist_L', 'ankle_L', [-0.102, 0.855]]], // hands and feet where they are in Reverse tabletop
    params: ['root.pitch&hip.flex', 'shoulder.flex', 'hip.flex', 'knee.flex', 'ankle.dorsi', 'shoulder.abd'],
  },
  dandasana_lean_back: {
    support: ['pelvis', 'ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['wrist_L', 'wrist_R'],
    rel: [['wrist_L', 'ankle_L', [-0.111, 1.133]]], // hands and feet where they are in Upward plank
    params: ['root.pitch&hip.flex', 'shoulder.flex', 'ankle.dorsi', 'shoulder.abd'],
  },
  purvottanasana: {
    support: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'],
    flat: ['wrist_L', 'wrist_R'],
    above: [['shoulder_L', 'wrist_L'], ['shoulder_R', 'wrist_R']],
    params: ['root.pitch', 'shoulder.flex', 'ankle.dorsi'],
  },
};
