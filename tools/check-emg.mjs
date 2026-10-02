// Model muscle activation vs measured surface EMG in yoga poses (src/data/emg.js).
// Fails only on data errors (unknown pose / muscle / fibre); the agreement is reported, not
// enforced: the comparisons cover a few standing poses and leg muscles, see the summary.
//   node tools/check-emg.mjs [--verbose]
import { Rig } from '../src/anatomy/rig.js';
import { MuscleSystem } from '../src/anatomy/muscles.js';
import { Physics } from '../src/anatomy/physics.js';
import { MuscleForces } from '../src/anatomy/muscleForces.js';
import { poseToQuats } from '../src/anatomy/animator.js';
import { modelActivation, spearman } from '../src/anatomy/emgCompare.js';
import { EMG, EMG_STUDIES } from '../src/data/emg.js';
import { POSES } from '../src/data/poses.js';
import { MUSCLES } from '../src/data/muscles.js';
import { MUSCLE_STRENGTH } from '../src/data/muscle-strength.js';

const verbose = process.argv.includes('--verbose');
const rig = new Rig();
const system = new MuscleSystem(rig);
const physics = new Physics(rig, { mass: 60, sex: 'f' });
const mf = new MuscleForces(rig, system);
let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`✗ ${msg}`);
};

for (const e of EMG) {
  if (!EMG_STUDIES[e.study]) fail(`EMG: unknown study ${e.study}`);
  if (!POSES[e.pose]) fail(`EMG ${e.study}: unknown pose ${e.pose}`);
  if (!MUSCLES[e.muscle]) fail(`EMG ${e.study}: unknown muscle ${e.muscle}`);
  if (e.side !== 'L' && e.side !== 'R') fail(`EMG ${e.study}: side must be L or R`);
  const s = MUSCLE_STRENGTH[e.muscle];
  if (e.part !== null && !(s && s.parts && e.part < s.parts.length)) fail(`EMG ${e.study}: ${e.muscle} has no fibre ${e.part}`);
}
if (failures) process.exit(1);

const solutions = {};
for (const pose of new Set(EMG.map((e) => e.pose))) {
  rig.applyQuats(physics.balance(poseToQuats(pose)));
  rig.ground();
  solutions[pose] = mf.solve(physics.compute().moments);
}
const rows = EMG.map((e) => ({ ...e, model: 100 * modelActivation(solutions[e.pose], e.muscle, e.side, e.part) }));

const name = (r) => `${r.muscle}${r.part !== null ? `[${MUSCLE_STRENGTH[r.muscle].names[r.part]}]` : ''}`;
// Lehecka et al. 2021's bands for %MVIC: low 0–20, moderate 21–40, high 41–60, very high > 60
const band = (v) => (v <= 20 ? 0 : v <= 40 ? 1 : v <= 60 ? 2 : 3);

for (const [id, st] of Object.entries(EMG_STUDIES)) {
  const rs = rows.filter((r) => r.study === id);
  if (!rs.length) continue;
  const mvc = st.norm.startsWith('%MV');
  console.log(`\n${st.cite} – ${st.norm} (${st.stat}), ${rs.length} values`);
  if (verbose) {
    for (const r of rs) {
      const gap = r.model - r.mean;
      console.log(`  ${r.pose.padEnd(17)} ${r.side} ${name(r).padEnd(30)} EMG ${r.mean.toFixed(1).padStart(5)} ± ${r.sd.toFixed(1).padEnd(5)} model ${r.model.toFixed(0).padStart(3)}${mvc && Math.abs(gap) > r.sd ? `  (${gap > 0 ? '+' : ''}${gap.toFixed(0)}, outside 1 SD)` : ''}`);
    }
  }
  const rho = spearman(rs.map((r) => r.model), rs.map((r) => r.mean));
  // per muscle: pairs of poses / legs whose EMG differs by more than the smaller SD –
  // does the model order them the same way?
  let pairs = 0;
  let agree = 0;
  const groups = Map.groupBy(rs, name);
  for (const g of groups.values()) {
    for (let i = 0; i < g.length; i++) {
      for (let j = i + 1; j < g.length; j++) {
        const d = g[i].mean - g[j].mean;
        if (Math.abs(d) <= Math.min(g[i].sd, g[j].sd)) continue;
        pairs++;
        if (Math.sign(g[i].model - g[j].model) === Math.sign(d)) agree++;
      }
    }
  }
  let line = `  rank correlation (all values) ${rho.toFixed(2)} · same order for ${agree}/${pairs} clearly different pose pairs`;
  if (mvc) {
    const within = rs.filter((r) => Math.abs(r.model - r.mean) <= r.sd).length;
    const sameBand = rs.filter((r) => band(r.model) === band(r.mean)).length;
    const under = rs.filter((r) => r.model < r.mean - r.sd).length;
    line += `\n  within 1 SD ${within}/${rs.length} · same band (low/moderate/high) ${sameBand}/${rs.length} · model below EMG by > 1 SD ${under}/${rs.length}`;
  }
  console.log(line);
}
console.log(`\n✓ EMG data OK (${EMG.length} values, ${Object.keys(EMG_STUDIES).length} studies)`);
