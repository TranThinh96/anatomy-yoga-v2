// Consistency checks of the hand-written data (npm run check):
// every id an asana, pose or fit refers to must exist, angles must be ones semanticToQuat
// understands, and every modelled muscle / bone needs its Vietnamese content and strength.
//   node tools/check-data.mjs
import { ASANAS, CATEGORIES } from '../src/data/asanas.js';
import { TOPICS } from '../src/data/topics.js';
import { POSES, POSE_FIT } from '../src/data/poses.js';
import { MUSCLES } from '../src/data/muscles.js';
import { BONES } from '../src/data/bones.js';
import { JOINTS } from '../src/data/joints.js';
import { MUSCLE_STRENGTH } from '../src/data/muscle-strength.js';
import { MODEL } from '../src/data/body-model.gen.js';
import { JOINT_DEFS } from '../src/anatomy/rig.js';

let failures = 0;
let warnings = 0;
const fail = (msg) => {
  failures++;
  console.log(`✗ ${msg}`);
};
const warn = (msg) => {
  warnings++;
  console.log(`! ${msg}`);
};
const base = (k) => k.replace(/_(L|R)$/, '');

// angle names per joint (see semanticToQuat in src/anatomy/rig.js)
const ANGLES = {
  root: ['pitch', 'yaw', 'roll'],
  lumbar: ['flex', 'side', 'rot'],
  thorax: ['flex', 'side', 'rot'],
  neck: ['flex', 'side', 'rot'],
  head: ['flex', 'side', 'rot'],
  scapula: ['elev', 'protract'],
  shoulder: ['flex', 'abd', 'rot'],
  hip: ['flex', 'abd', 'rot'],
  elbow: ['flex'],
  wrist: ['ext', 'pron'],
  knee: ['flex'],
  ankle: ['dorsi'],
};
const SEGMENTS = new Set(JOINT_DEFS.map((j) => j.name));
const SIDED = new Set(['scapula', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle']);
const validJointKey = (k) => (ANGLES[k] ? true : /_(L|R)$/.test(k) && SIDED.has(base(k)));

// ---- poses
for (const [id, pose] of Object.entries(POSES)) {
  for (const [k, angles] of Object.entries(pose)) {
    if (!validJointKey(k)) {
      fail(`pose ${id}: unknown joint "${k}"`);
      continue;
    }
    for (const [a, v] of Object.entries(angles)) {
      if (!ANGLES[base(k)].includes(a)) fail(`pose ${id}: ${k} has no angle "${a}" (allowed: ${ANGLES[base(k)].join(', ')})`);
      if (typeof v !== 'number' || !Number.isFinite(v)) fail(`pose ${id}: ${k}.${a} is not a number`);
      else if (Math.abs(v) > 200) fail(`pose ${id}: ${k}.${a} = ${v}° is out of range`);
    }
  }
}

// ---- pose fitting constraints
const validSeg = (s) => s.split('|').every((x) => SEGMENTS.has(x));
for (const [id, fit] of Object.entries(POSE_FIT)) {
  if (!POSES[id]) fail(`POSE_FIT.${id}: no such pose`);
  for (const s of fit.support || []) if (!validSeg(s)) fail(`POSE_FIT.${id}: unknown support segment "${s}"`);
  for (const s of fit.flat || []) if (!SEGMENTS.has(s)) fail(`POSE_FIT.${id}: unknown flat segment "${s}"`);
  for (const [a, b] of [...(fit.rel || []), ...(fit.above || [])]) {
    if (!SEGMENTS.has(a) || !SEGMENTS.has(b)) fail(`POSE_FIT.${id}: unknown joint in rel/above "${a}", "${b}"`);
  }
  for (const [s] of fit.dir || []) if (!SEGMENTS.has(s)) fail(`POSE_FIT.${id}: unknown dir segment "${s}"`);
  for (const [j, seg, off] of fit.at || []) {
    if (!SEGMENTS.has(j) || !SEGMENTS.has(seg)) fail(`POSE_FIT.${id}: unknown joint in at "${j}", "${seg}"`);
    if (!Array.isArray(off) || off.length !== 3) fail(`POSE_FIT.${id}: at offset must be [dx, dy, dz]`);
  }
  for (const p of fit.params || []) {
    for (const term of p.split('&')) {
      const [k, a] = term.replace(/^-/, '').split('.');
      if (!validJointKey(k) || !ANGLES[base(k)].includes(a)) fail(`POSE_FIT.${id}: bad param term "${term}"`);
    }
  }
}

// ---- asanas
const ids = new Set();
const usedPoses = new Set(['tadasana']);
const muscleKey = (k) => MUSCLES[base(k)];
for (const a of ASANAS) {
  const where = `asana ${a.id}`;
  if (ids.has(a.id)) fail(`${where}: duplicate id`);
  ids.add(a.id);
  for (const f of ['sanskrit', 'vi', 'en', 'category', 'level']) if (!a[f]) fail(`${where}: missing ${f}`);
  if (!CATEGORIES.includes(a.category) || a.category === 'Tất cả') fail(`${where}: category "${a.category}" not in CATEGORIES`);
  if (a.loop && !['static', 'pingpong', 'cycle'].includes(a.loop)) fail(`${where}: loop "${a.loop}" (static | pingpong | cycle)`);
  if (!Array.isArray(a.steps) || !a.steps.length) fail(`${where}: no steps`);
  for (const s of a.steps || []) {
    if (!POSES[s.pose]) fail(`${where}: step pose "${s.pose}" not in POSES`);
    usedPoses.add(s.pose);
    for (const seg of s.anchor || []) if (!SEGMENTS.has(seg)) fail(`${where}: anchor "${seg}" is not a segment`);
    if (s.roles && !ASANAS.some((b) => b.id === s.roles)) fail(`${where}: step roles "${s.roles}" is not an asana id`);
  }
  for (const v of a.variants || []) {
    if (!POSES[v.pose]) fail(`${where}: variant pose "${v.pose}" not in POSES`);
    if (!v.label) fail(`${where}: variant without label`);
    usedPoses.add(v.pose);
  }
  const roles = a.roles || {};
  for (const r of ['contract', 'stretch', 'stabilize']) {
    if (!Array.isArray(roles[r])) fail(`${where}: roles.${r} missing`);
    for (const k of roles[r] || []) if (!muscleKey(k)) fail(`${where}: roles.${r} has unknown muscle "${k}"`);
  }
  for (const [k] of a.joints || []) if (!JOINTS[base(k)]) fail(`${where}: joints has unknown joint "${k}" (see src/data/joints.js)`);
  if (!a.flow && !a.hidden) {
    for (const f of ['cues', 'benefits', 'cautions']) if (!a[f] || !a[f].length) warn(`${where}: no ${f}`);
  }
}
// ---- workshop topics
const topicIds = new Set();
for (const t of TOPICS) {
  const where = `topic ${t.id}`;
  if (topicIds.has(t.id)) fail(`${where}: duplicate id`);
  topicIds.add(t.id);
  for (const f of ['title', 'en', 'area', 'intro']) if (!t[f]) fail(`${where}: missing ${f}`);
  if (!Array.isArray(t.compare) || t.compare.length !== 2) fail(`${where}: compare must be [reference, condition]`);
  for (const c of t.compare || []) {
    if (!POSES[c.pose]) fail(`${where}: compare pose "${c.pose}" not in POSES`);
    if (!c.label) fail(`${where}: compare pose without label`);
    usedPoses.add(c.pose);
  }
  for (const k of [...(t.shorter || []), ...(t.longer || [])]) if (!MUSCLES[k]) fail(`${where}: unknown muscle "${k}"`);
  for (const j of t.joints || []) if (!JOINTS[j]) fail(`${where}: unknown joint "${j}"`);
  for (const b of t.bones || []) if (!BONES[b]) fail(`${where}: unknown bone "${b}"`);
  for (const [id] of t.asanas || []) if (!ASANAS.some((a) => a.id === id)) fail(`${where}: unknown asana "${id}"`);
  for (const f of ['sections', 'cautions', 'limits']) if (!t[f] || !t[f].length) fail(`${where}: no ${f}`);
}

for (const id of Object.keys(POSES)) if (!usedPoses.has(id)) warn(`pose ${id} is not used by any asana`);

// ---- anatomy content for every modelled part
for (const m of MODEL.muscles) {
  if (!MUSCLES[m.id]) fail(`muscle ${m.id}: no entry in src/data/muscles.js`);
  if (!MUSCLE_STRENGTH[m.id]) fail(`muscle ${m.id}: no entry in src/data/muscle-strength.js`);
}
for (const id of new Set(MODEL.meshes.map((m) => m.id))) if (!BONES[id]) fail(`bone ${id}: no entry in src/data/bones.js`);

console.log(
  failures
    ? `\n${failures} data problem(s)`
    : `✓ data OK (${ASANAS.length} asanas, ${TOPICS.length} topics, ${Object.keys(POSES).length} poses${warnings ? `, ${warnings} warning(s)` : ''})`,
);
process.exit(failures ? 1 : 0);
