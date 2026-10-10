// Model muscle activation vs measured surface EMG in yoga poses (src/data/emg.js).
// Fails only on data errors (unknown pose / muscle / fibre); the agreement is reported, not
// enforced: the comparisons cover a few standing poses and leg muscles, see the summary.
//   node tools/check-emg.mjs [--verbose] [--q <n>]   (--q: stability constraint, see muscleForces.js)
//   node tools/check-emg.mjs --sweep                  (summary for q = 0 (off), 1, 5, 10, 20, 40)
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

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const sweep = args.includes('--sweep');
const qArg = args.includes('--q') ? Number(args[args.indexOf('--q') + 1]) : 0;
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

const poses = [...new Set(EMG.map((e) => e.pose))];
const states = {};
for (const pose of poses) {
  rig.applyQuats(physics.balance(poseToQuats(pose)));
  rig.ground();
  const quats = Object.fromEntries(Object.entries(rig.joints).map(([n, j]) => [n, j.quaternion.clone()]));
  const pos = rig.joints.pelvis.position.clone();
  states[pose] = { quats, pos };
}
const name = (r) => `${r.muscle}${r.part !== null ? `[${MUSCLE_STRENGTH[r.muscle].names[r.part]}]` : ''}`;
// Lehecka et al. 2021's bands for %MVIC: low 0–20, moderate 21–40, high 41–60, very high > 60
const band = (v) => (v <= 20 ? 0 : v <= 40 ? 1 : v <= 60 ? 2 : 3);

function evaluate(q, print) {
  const solutions = {};
  for (const pose of poses) {
    const st = states[pose];
    for (const n in st.quats) rig.joints[n].quaternion.copy(st.quats[n]);
    rig.joints.pelvis.position.copy(st.pos);
    rig.root.updateMatrixWorld(true);
    const r = physics.compute();
    solutions[pose] = mf.solve(r.moments, q ? { q, load: physics.loadStiffness(r) } : null);
  }
  const rows = EMG.map((e) => ({ ...e, model: 100 * modelActivation(solutions[e.pose], e.muscle, e.side, e.part) }));
  const summary = {};
  for (const [id, st] of Object.entries(EMG_STUDIES)) {
    const rs = rows.filter((r) => r.study === id);
    if (!rs.length) continue;
    const mvc = st.norm.startsWith('%MV');
    if (print) console.log(`\n${st.cite} – ${st.norm} (${st.stat}), ${rs.length} values`);
    if (print && verbose) {
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
    for (const g of Map.groupBy(rs, name).values()) {
      for (let i = 0; i < g.length; i++) {
        for (let j = i + 1; j < g.length; j++) {
          const d = g[i].mean - g[j].mean;
          if (Math.abs(d) <= Math.min(g[i].sd, g[j].sd)) continue;
          pairs++;
          if (Math.sign(g[i].model - g[j].model) === Math.sign(d)) agree++;
        }
      }
    }
    const o = { rho, agree, pairs, n: rs.length };
    let line = `  rank correlation (all values) ${rho.toFixed(2)} · same order for ${agree}/${pairs} clearly different pose pairs`;
    if (mvc) {
      o.within = rs.filter((r) => Math.abs(r.model - r.mean) <= r.sd).length;
      o.sameBand = rs.filter((r) => band(r.model) === band(r.mean)).length;
      o.under = rs.filter((r) => r.model < r.mean - r.sd).length;
      o.over = rs.filter((r) => r.model > r.mean + r.sd).length;
      line += `\n  within 1 SD ${o.within}/${rs.length} · same band (low/moderate/high) ${o.sameBand}/${rs.length} · model below / above EMG by > 1 SD ${o.under} / ${o.over}`;
    }
    if (print) console.log(line);
    summary[id] = o;
  }
  return summary;
}

if (sweep) {
  console.log('q     ' + Object.values(EMG_STUDIES).map((s) => s.short.padEnd(34)).join(''));
  for (const q of [0, 1, 5, 10, 20, 40]) {
    const s = evaluate(q, false);
    console.log(
      String(q || 'off').padEnd(6) +
        Object.values(s)
          .map((o) => `ρ ${o.rho.toFixed(2).padStart(5)} ord ${o.agree}/${o.pairs}${o.within !== undefined ? ` 1SD ${o.within}/${o.n} <${o.under} >${o.over}` : ''}`.padEnd(34))
          .join(''),
    );
  }
} else {
  if (qArg) console.log(`stability constraint on, q = ${qArg}`);
  evaluate(qArg, true);
}
console.log(`\n✓ EMG data OK (${EMG.length} values, ${Object.keys(EMG_STUDIES).length} studies)`);
