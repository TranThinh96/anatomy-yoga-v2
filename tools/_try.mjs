import * as THREE from 'three';
import { Rig } from '../src/anatomy/rig.js';
import { poseToQuats } from '../src/anatomy/animator.js';
import { POSES } from '../src/data/poses.js';
const rig = new Rig();
const [name, ...mods] = process.argv.slice(2);
const pose = structuredClone(POSES[name]);
for (const m of mods) { const [k, v] = m.split('='); const [j, f] = k.split('.'); pose[j] = { ...(pose[j] || {}), [f]: +v }; }
rig.applyQuats(poseToQuats(pose)); rig.ground();
const low = {}; for (const c of rig.contacts) { const h = rig.clearance(c, rig.worldPoint(c.seg, c.local)); low[c.seg] = Math.min(low[c.seg] ?? 9, h); }
console.log(mods.join(' '), Object.entries(low).filter(([, v]) => v < 0.08).map(([k, v]) => `${k}:${(v * 100).toFixed(1)}`).join(' '));
