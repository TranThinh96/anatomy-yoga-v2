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
  `HANDS`, `FEET`, `[...HANDS, ...KNEES]`).

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
  balance: true,                         // COM ≥ 3 cm inside the base of support (kneeling, one leg…)
},
```

- A param `a&b&-c` moves several angles together by the same amount (`-` = opposite) – e.g.
  `root.pitch&hip.flex` tilts the whole body while keeping the hip angle to the floor.
- Give the fitter only the angles that should move; everything else stays as you wrote it.

Then run, **naming only your poses**:

```bash
npm run fit-poses -- --dry my_pose   # look at the gaps (cm) before → after
npm run fit-poses -- my_pose         # writes the fitted angles into poses.js
```

Gaps should end near 0.0 for every support. If not, add or change params rather than forcing angles.

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
- Flows (sequences): `flow: true`, `loop: 'cycle'`, each step with a `label` and `roles: '<asana id>'`
  to borrow that asana's roles for the step.
- New pose ids used only as a variant still need a `POSE_FIT` entry and fitting.

## 5. Check

```bash
npm run check    # data ids, equilibrium, COM over the supports, supports touch, L/R symmetry,
                 # muscle model, picking – all must pass
npm run build
```

`check-physics` treats poses whose id matches `vrksasana|virabhadrasana|trikonasana` as asymmetric;
add your one-sided pose to that regex in `tools/check-physics.mjs` if the symmetry check fails for it.

## 6. Look at it

```bash
node tools/shot.mjs asana/my_asana /tmp/a.png --hold               # target pose
node tools/shot.mjs asana/my_asana /tmp/b.png --hold --cm act --view left
```

Open the PNGs and check: feet/hands on the mat (not floating or sunk), no limb through the body,
the pose reads like the real asana from the front and the side, the "Hoạt động" (model activation)
colours are plausible. Compare the model's most active muscles with your `roles.contract`; if they
disagree strongly, look for a pose error first, then mention the disagreement to the user
(the model has no passive tension and lacks some deep muscles – see README "Giới hạn").

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

## Done when

- `npm run check` and `npm run build` pass, the screenshots look right,
- the asana shows in its category with a thumbnail, and the commit message says which poses were added and fitted.
