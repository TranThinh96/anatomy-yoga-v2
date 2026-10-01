---
name: add-asana
description: Add a new yoga asana (or a variant of an existing one) to the app – joint angles, floor-contact fitting, asana entry with muscle roles and Vietnamese cues, checks and a screenshot. Use when the user asks to add, create or model a pose / asana / variant, or to fix how an existing pose looks (feet floating, wrong support, unbalanced).
---

# Add an asana

An asana needs three things: a **pose** (joint angles, `src/data/poses.js`), a **fit** entry that makes
the right body parts touch the floor (`POSE_FIT` in the same file), and an **asana entry**
(`src/data/asanas.js`) that animates into the pose and describes it. Work through the steps in
order; do not skip the fitter or the checks – a pose that "looks right" in numbers often floats,
sinks into the floor or falls over.

Read `CLAUDE.md` first for the axis and angle conventions.

## 1. Decide the movement

- Start pose (usually an existing one: `tadasana`, `tabletop`, `prone`, `supine`, `dandasana`, `kneeling`…)
  and target pose. Symmetric or one-sided? One-sided poses are done on the model's **left** side first
  (left leg forward, like the existing Warriors).
- Which body parts touch the floor in the target pose → the `support` list.
- Which segments stay fixed during the transition → `anchor` (e.g. `['ankle_R']` for the back foot,
  `HANDS`, `FEET`, `[...HANDS, ...KNEES]`). Anchor what a teacher keeps planted: anchoring the feet
  from Plank to Chaturanga slid the hands 17 cm; a one-leg step anchors the hands *and* the standing
  foot (`[...HANDS, 'ankle_L']`).
- Plan the path, not just the end pose: how does a person really get there? Feet step one at a
  time (never both at once), a knee lifts before it opens out (Tree), hands leave the floor before
  the body leans back (Navasana). Each of those is an intermediate `via` pose (section 4).

## 2. Joint angles (`POSES`)

Add `my_pose: { … }` in the section that fits (standing / forward folds / backbends / arm support /
prone-supine / seated). Angles in degrees; only list non-zero ones.

| joint | angles (sign) |
|---|---|
| `root` | `pitch` (+ tip forward), `yaw` (+ turn to own left), `roll` (+ tip toward own left) |
| `lumbar`, `thorax`, `neck`, `head` | `flex` (+ forward), `side` (+ toward own left), `rot` (+ turn to own left) |
| `scapula` | `elev` (+ up), `protract` (+ forward) |
| `shoulder`, `hip` | `flex`, `abd`, `rot` (+ external) |
| `elbow`, `knee` | `flex` |
| `wrist` | `ext` (+ dorsiflexion), `pron` (+ pronation; hands flat on the floor usually need `pron: 180` with the forearm pronated) |
| `ankle` | `dorsi` (+ toes up) |

`hip: {…}` applies to both sides, `hip_L: {…}` overrides the left. Copy the closest existing pose and
edit it rather than starting from zero. Rough ranges: hip flex −30…130, knee 0…150, shoulder flex −60…180,
spine flex per joint −35…45 (split a back bend or a fold between `lumbar` and `thorax`).

## 3. Floor contacts (`POSE_FIT`) and fitting

```js
my_pose: {
  support: ['ankle_L', 'ankle_R', 'wrist_L', 'wrist_R'], // must touch; 'hip_L|knee_L' = kneecap OR shin
  params: ['shoulder.flex', 'root.pitch&hip.flex'],       // angles the fitter may change
  // optional goals
  flat: ['ankle_L'],                     // every contact of this segment down (whole foot flat)
  rel: [['ankle_L', 'ankle_R', [-1.0, 0]]], // joint B offset from joint A on the floor, metres (x, z)
  dir: [['thorax', [0, 1, 0], [0, 1, 0]]],  // a segment axis points this way (trunk upright)
  above: [['shoulder_L', 'wrist_L']],   // stack a joint over another (shoulders over wrists)
  at: [['wrist_L', 'knee_L', [0.02, -0.2, 0.05]]], // put a joint ON a body part: point on segment
                                         // `knee_L` = its joint centre + offset (m, rest-pose axes)
  balance: true,                         // COM ≥ 3 cm inside the base of support (kneeling, one leg,
                                         // folds with the hands down – hands don't auto-balance)
},
```

- A param `a&b&-c` moves several angles together by the same amount (`-` = opposite) – e.g.
  `root.pitch&hip.flex` tilts the whole body while keeping the hip angle to the floor.
- Give the fitter only the angles that should move; everything else stays as you wrote it.
- `at` examples that worked (offsets are in the rest-pose axes of the named segment; x + = the
  model's left, so mirror x for the right side):
  - palms beside the feet: `['wrist_L', 'ankle_L', [0.06, -0.02, 0.13]]`
  - hands just above the knees: `['wrist_L', 'hip_L', [0, -0.33, 0.09]]`
  - lower hand on the front shin: `['wrist_L', 'knee_L', [0.02, -0.2, 0.05]]`
  - sole on the upper inner thigh (tree): `['ankle_L', 'hip_R', [0.07, -0.16, 0]]`
  - sit bones on the heels (child's pose): `['pelvis', 'knee_L', [-0.07, -0.3, -0.1], 0.5]`
- Hands on the floor: add the wrists to `flat` so the palm is flat (otherwise the fitter may leave
  the hand on its fingertips) – the fitter keeps wrist extension ≤ 95°.
- The fitter finds the *nearest* way to meet the goals, which is not always the teachable one:
  it will round the spine or bend the elbows instead of hinging at the hips. Leave the angles that
  define the pose's form (spine curve, knee angle of a variant) out of `params`.
- Complex asymmetric poses (Trikonasana): build the start pose geometrically first (pelvis tilt,
  hip abduction / rotation, stance width ≈ one leg length ≈ 0.9 m) and let the fitter adjust a
  few angles; with 15+ free angles it lands in odd local minima (twisted spine, pointed feet).

Then run, **naming only your poses**:

```bash
npm run fit-poses -- --dry my_pose   # look at the gaps (cm) before → after
npm run fit-poses -- my_pose         # writes the fitted angles into poses.js
```

Gaps should end near 0.0 for every support. If not, add or change params rather than forcing angles.

- The fitter changes one param at a time, so it stalls when two angles must move together:
  Dandasana's sit bones floated 15 mm (propped on hands and heels) until hip *and* shoulder were
  changed together (hip 91°, shoulder −16°). If a gap will not close, try a few combined values by
  hand (or a seed: set the angle near the expected answer, e.g. a back knee at 25°, and refit).
- Check *every* support in the dry run, also ones the pose "obviously" rests on – a 1.5 cm gap
  under the sit bones becomes a visible drop when the next move starts.
- Poses the body moves between must agree on where planted parts are: the same hand width
  (`rel: [['wrist_R', 'wrist_L', [0.33, 0]]]`, as Plank / Dog), the front foot in the same place
  relative to the hands, the **ball** of a back foot where it was (on the toes the ankle sits
  ~10 cm further forward than with the heel down, so offset the ankle target). Otherwise the
  planted hand or foot slides during the move. Compare with `rel` values measured on the
  neighbouring poses.

## 4. Asana entry (`ASANAS` in `src/data/asanas.js`)

```js
{
  id: 'my_asana',                 // snake_case, unique
  sanskrit: 'Parsvottanasana',
  vi: 'Tư thế Kéo giãn một bên',
  en: 'Intense Side Stretch',
  category: 'Gập người',          // one of CATEGORIES (not 'Tất cả')
  level: 'Cơ bản',                // 'Cơ bản' | 'Trung bình'
  steps: [{ pose: 'tadasana' }, { pose: 'my_pose', anchor: ['ankle_R'], move: 2.2 }],
  loop: 'pingpong',               // 'static' (one pose), 'pingpong' (in and out), 'cycle' (sequence)
  variants: [{ label: 'Tay chạm khối', pose: 'my_pose_blocks' }], // optional, replaces the last step's pose
  roles: {
    contract: ['hamstrings_R'],   // muscle ids from src/data/muscles.js; _L/_R = one side only
    stretch: ['hamstrings_L', 'gastrocnemius_L'],
    stabilize: ['gluteus_medius', 'erector_spinae'],
  },
  joints: [['hip_L', 'Gập háng sâu, giữ chậu vuông']], // ids from src/data/joints.js (+ optional _L/_R)
  cues: ['…'], benefits: ['…'], cautions: ['…'],      // Vietnamese, short, practical
  // optional: view: [x, y, z] camera direction, thumbStep: index of the step used for the thumbnail
}
```

- Muscle ids: rectus_abdominis external_oblique erector_spinae quadratus_lumborum iliopsoas
  latissimus_dorsi trapezius pectoralis_major pectoralis_minor serratus_anterior rhomboids
  levator_scapulae sternocleidomastoid deltoid supraspinatus infraspinatus biceps_brachii
  triceps_brachii forearm_flexors forearm_extensors gluteus_maximus gluteus_medius piriformis tfl_itb
  rectus_femoris vastus_lateralis vastus_medialis hamstrings adductors sartorius gastrocnemius soleus
  tibialis_anterior.
- Joint ids: atlanto_occipital cervical_spine_joint thoracic_spine_joint lumbar_spine_joint sacroiliac
  pubic_symphysis scapulothoracic sternoclavicular glenohumeral elbow wrist hip knee ankle.
- Roles come from anatomy / EMG literature, not from the model. Cite a study in a comment if you use
  one; never invent EMG numbers.
- A muscle under `stretch` must really lengthen in the target pose (≥ 2.5 % longer than in
  Tadasana) – `npm run check` fails otherwise. Typical traps: calves are not stretched in a fold
  with vertical shins or in Dandasana with neutral ankles; the back hip is *adducted* in Trikonasana
  (its adductors shorten); Cobra / Up Dog stretch the abdominals more than the pectorals.
- Interpolating joint angles in one go is often not how a body moves: a foot dips into the floor
  before it lifts, a hand digs in, a leg sweeps under the floor. Add an intermediate pose marked
  `via: true`, e.g. Tree: `{ pose: 'vrksasana_knee_up', anchor: ['ankle_R'], move: 1.2, via: true }`.
  The body passes through it without stopping (one eased spline through the poses); a step *without*
  `via` eases to a halt there (and `hold` adds a pause) – Tree stopped at the lifted knee that way.
  - A via pose must itself be fitted: planted parts on the floor (a `POSE_FIT` entry with the
    planted hands / feet as `support`), lifted parts clear of it (Navasana's first via pose still had
    the sit bones off the floor and the body bounced 2 cm).
  - Order the sub-movements as a person does: lift the hands by extending the shoulders *before*
    bending the elbows (bending them on the floor drives the fingers in), lift the knee *before*
    opening it, draw a stepping knee in *before* the leg extends back.
  - Keep each joint moving one way through the via poses where you can (hold the arms at their
    interpolated angles and let the trunk / legs fit): a joint that reverses at a via pose stops
    there, and the body lurches around it.
  - Split the chain's time by how far the body moves in each part (pelvis travel), not evenly:
    a part with most of the travel squeezed into a short time is a lurch.
- Stepping: a foot that moves to a new place on the floor while the other foot is in the `anchor`
  is stepped by the animator (`Animator._liftSteps` bends hip and knee to clear it ~8 cm on an arc),
  so anchor the standing foot for one-leg steps (`[...HANDS, 'ankle_L']` while the right leg steps
  back in Surya Namaskar). The lift only corrects the interpolated leg; when that leg sweeps far
  under the floor (a deep lunge's front leg going back to Plank) add a via pose with the knee drawn
  in and the foot ~8 cm up halfway (`surya_step_back_L`), or the leg whips through at ~1000 °/s.
  Put the landing foot of the end pose where its ball / heel should land (fit it with `rel`),
  otherwise it slides on landing.
- Flows (sequences): `flow: true`, `loop: 'cycle'`, each step with a `label` and `roles: '<asana id>'`
  to borrow that asana's roles for the step.
- New pose ids used only as a variant still need a `POSE_FIT` entry and fitting.

## 5. Check

```bash
npm run check    # data ids, equilibrium, COM over the supports, supports touch, L/R symmetry,
                 # muscle model, picking, animated transitions – all must pass
npm run build
```

`check-physics` treats poses whose id matches `vrksasana|virabhadrasana|trikonasana|ashwa_sanchalanasana|surya_step`
as asymmetric; add your one-sided pose (and one-sided via poses) to that regex in
`tools/check-physics.mjs` if the symmetry check fails for it.

`tools/check-transitions.mjs` (part of `npm run check`) plays every sequence at 60 fps and fails on
what static checks and key-pose screenshots cannot see – every bug users reported in animations so
far was one of these:

| failure | what it was in the past | usual fix |
|---|---|---|
| pelvis wobbles > 6 mm off its smooth path | Tree: the lifting foot dipped 23 mm into the floor, the body pivoted on it and dropped onto the standing foot; Navasana: body propped on heels / fingers, then dropped 2 cm | a `via` pose that lifts the limb first; fit the supports of every pose in the chain |
| anchor > 15 mm off the floor | hands lifted 12 cm from tabletop to Down Dog (feet grounded instead); body propped on a dragging foot | anchor what stays planted; via pose / stepping (section 4) |
| joint > 900 °/s | stepping IK jumping between "leg straight back" and "knee bent" solutions | look at the frames around the time; usually a missing via pose |
| knee / elbow bent backwards | stepping IK with an unconstrained knee | keep solvers inside the joint range |
| stepping foot clears < 5 cm | both feet sliding at once; a foot dragging along the mat | step one foot at a time, anchor the other |

`node tools/check-transitions.mjs my_asana --verbose --steps` prints the numbers and when each move
runs. Passing is necessary, not sufficient: also look at frames in the middle of each move
(section 6). Check the joint angles too, not only where hands and feet end up – a foot can land
exactly right with the knee bent backwards.

## 6. Look at it – workshop quality

```bash
node tools/review-poses.mjs /tmp/review my_asana --views front,left,top   # framed on the body, UI hidden
node tools/review-poses.mjs /tmp/review my_asana --views left --at 2.0,2.4 # mid-transition frames (s)
node tools/shot.mjs asana/my_asana /tmp/b.png --hold --cm act --view left  # with the UI, activation colours
```

Screenshots show one instant; the user sees the motion. For every move look at 2–3 frames in the
middle (`--at`, times from `check-transitions --steps`): a stepping foot lifted and the knee bent
forwards, planted hands and feet still down, nothing through the floor or the body.

The app is used to teach anatomy in workshops (balanced / restorative yoga), so a pose must read
like the textbook form from the front AND the side. Checklist:

- [ ] The shape a teacher would demonstrate: e.g. Uttanasana hinges at the hips with palms beside
      the feet; Trikonasana both legs straight, lower hand on the shin, top arm vertical, chest open
      to the long side; Tree foot on the inner thigh or calf, never on the knee; Child's pose sit
      bones on the heels.
- [ ] Alignment cues are visible in the model: hands under shoulders and knees under hips on all
      fours, knee over ankle in lunges / Warrior / Bridge, neutral neck unless the pose looks up.
- [ ] Palms and soles flat on the mat, nothing floating or sunk, no limb through the body.
- [ ] Gaze matches the cue (Trikonasana looks up at the top hand, Warrior II over the front hand).
- [ ] Stable (margin > 0), weight distribution plausible (review-poses prints it).
- [ ] Roles agree with the model lengths (`npm run check`) and with the cues text.
- [ ] Cues, benefits and cautions are safe for a restorative context: offer a supported / easier
      variant (props, bent knees, knees down) for demanding poses.

Compare the model's most active muscles ("Hoạt động", experimental) with `roles.contract`; if they
disagree strongly, look for a pose error first, then mention the disagreement to the user (the
model has no passive tension and lacks some deep muscles – see README "Giới hạn").

## Common problems

| symptom | fix |
|---|---|
| feet or hands float / sink after fitting | the support segment is missing from `params` reach – add the angle that lowers it (`ankle.dorsi`, `shoulder.flex`, `root.pitch&…`) |
| check says "should touch the floor" for a knee | use `'hip_L|knee_L'` (kneecap is on the thigh segment, shin on `knee_L`) |
| COM outside the base of support in a kneeling / one-leg pose | add `balance: true` and a param that moves the trunk (`root.pitch&hip.flex`, `hip.flex`) |
| wide stance collapses into a squat | fix the stance with `rel` (distance between the feet) and keep the knee angle out of `params` |
| hands reach forward instead of under the shoulders | `above: [['shoulder_L','wrist_L'], …]` |
| whole body tips forward/back in a standing pose | normal – `physics.balance` tilts it at the ankles; if it looks wrong, the pose itself is unbalanced |
| symmetry check fails on a one-sided pose | add the id to the ASYMMETRIC regex in `tools/check-physics.mjs` |
| hands land far in front of the feet in a fold | `at` goal for the wrists + keep the spine out of `params` so it hinges at the hips |
| fitter bends elbows / rounds the back to reach | remove those angles from `params`; they define the form |
| COM behind the heels, all weight on the hands | `balance: true` (poses with hand contacts are not auto-balanced) |
| a wrist ends at 110–130° extension | add the hands to `flat`; the ROM limit is 95° |
| `check` says a stretched muscle is not longer | the role is wrong for this shape – fix the role (or the pose), don't lower the threshold |
| body stops for a moment at an intermediate pose | mark it `via: true` (and no `hold`) |
| body bounces / drops when a limb leaves the floor | a support was not really on the floor in one pose of the chain (dry-run its fit), or the limb digs in before it lifts – add a via pose that lifts it first |
| feet slide together on the mat in a flow | step one foot at a time: a lunge (or other) pose in between, the standing foot in the `anchor` |
| a planted hand / foot slides during a move | the poses disagree on where it is: fit them to the same `rel` (hand width, foot to hands, ball of the foot) |
| a leg whips through or the hips lurch in a chain | a via pose with the limb mid-swing; split the chain's time by pelvis travel |
| fitter will not close a gap that two angles could close together | set both by hand / seed one of them, then refit |

## Done when

- `npm run check` and `npm run build` pass, the screenshots look right,
- the asana shows in its category with a thumbnail, and the commit message says which poses were added and fitted.
