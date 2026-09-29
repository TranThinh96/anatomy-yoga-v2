import * as THREE from 'three';

import { MODEL } from '../data/body-model.gen.js';

// Rest pose (anatomical position, palms forward) derived from the BodyParts3D bones by
// tools/bp3d-build.mjs. World-space metres; the body faces +Z, its LEFT side is +X,
// Y is up and the floor is y = 0. Sided joints are defined on the left and mirrored.
const JP = MODEL.joints;
export const JOINT_DEFS = [
  { name: 'pelvis', parent: null, pos: JP.pelvis },
  { name: 'lumbar', parent: 'pelvis', pos: JP.lumbar },
  { name: 'thorax', parent: 'lumbar', pos: JP.thorax },
  { name: 'neck', parent: 'thorax', pos: JP.neck },
  { name: 'head', parent: 'neck', pos: JP.head },
  ...sided('scapula', 'thorax', JP.scapula),
  ...sided('shoulder', 'scapula', JP.shoulder),
  ...sided('elbow', 'shoulder', JP.elbow),
  ...sided('wrist', 'elbow', JP.wrist),
  ...sided('hip', 'pelvis', JP.hip),
  ...sided('knee', 'hip', JP.knee),
  ...sided('ankle', 'knee', JP.ankle),
];

function sided(base, parent, [x, y, z]) {
  const p = (s) => (parent === 'thorax' || parent === 'pelvis' ? parent : `${parent}_${s}`);
  return [
    { name: `${base}_L`, parent: p('L'), pos: [x, y, z] },
    { name: `${base}_R`, parent: p('R'), pos: [-x, y, z] },
  ];
}

export const JOINT_TYPE = {
  pelvis: 'root', lumbar: 'spine', thorax: 'spine', neck: 'spine', head: 'spine',
  scapula: 'scapula', shoulder: 'shoulder', elbow: 'elbow', wrist: 'wrist',
  hip: 'hip', knee: 'knee', ankle: 'ankle',
};

const D = THREE.MathUtils.DEG2RAD;

export function sideOf(name) {
  if (name.endsWith('_L')) return 1;
  if (name.endsWith('_R')) return -1;
  return 0;
}
export function baseOf(name) {
  return name.replace(/_(L|R)$/, '');
}

/**
 * Converts semantic (anatomical) angles in degrees into a quaternion for a joint.
 *  spine:    flex (+forward), side (+toward own left), rot (+turn to own left)
 *  scapula:  elev (+up), protract (+forward)
 *  shoulder: flex, abd, rot (+external)
 *  elbow:    flex
 *  wrist:    ext (+dorsiflexion), pron (+pronation)
 *  hip:      flex, abd, rot (+external)
 *  knee:     flex
 *  ankle:    dorsi (+toes up)
 *  root:     pitch (+tip forward), yaw (+turn to own left), roll (+tip toward own left)
 */
export function semanticToQuat(name, a = {}, out = new THREE.Quaternion()) {
  const s = sideOf(name) || 1;
  const t = JOINT_TYPE[baseOf(name)];
  const e = new THREE.Euler();
  const v = (k) => (a[k] || 0) * D;
  switch (t) {
    case 'root':
      e.set(v('pitch'), v('yaw'), -v('roll'), 'YXZ');
      break;
    case 'spine':
      e.set(v('flex'), v('rot'), -v('side'), 'YXZ');
      break;
    case 'scapula':
      e.set(0, -s * v('protract'), s * v('elev'), 'ZYX');
      break;
    case 'shoulder':
    case 'hip':
      e.set(-v('flex'), s * v('rot'), s * v('abd'), 'ZYX');
      break;
    case 'elbow':
      e.set(-v('flex'), 0, 0, 'ZYX');
      break;
    case 'wrist':
      e.set(v('ext'), -s * v('pron'), 0, 'YXZ');
      break;
    case 'knee':
      e.set(v('flex'), 0, 0, 'ZYX');
      break;
    case 'ankle':
      e.set(-v('dorsi'), 0, 0, 'ZYX');
      break;
    default:
      e.set(0, 0, 0);
  }
  return out.setFromEuler(e);
}

const SIDED_SEGS = new Set(['scapula', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle']);
// Points used to keep the body on the floor: [segment, rest position, soft-tissue radius].
// Generated from bone / muscle surfaces (heel, balls of the feet, sit bones, buttocks …).
const CONTACTS = MODEL.contacts.flatMap(({ seg, p, r, mirror }) => {
  const [x, y, z] = p;
  if (SIDED_SEGS.has(seg)) return [[`${seg}_L`, [x, y, z], r], [`${seg}_R`, [-x, y, z], r]];
  if (mirror) return [[seg, [x, y, z], r], [seg, [-x, y, z], r]];
  return [[seg, [x, y, z], r]];
});

export class Rig {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'body';
    this.joints = {};
    this.rest = {};
    for (const def of JOINT_DEFS) {
      const g = new THREE.Group();
      g.name = def.name;
      const p = new THREE.Vector3(...def.pos);
      this.rest[def.name] = p;
      if (def.parent) {
        g.position.copy(p).sub(this.rest[def.parent]);
        this.joints[def.parent].add(g);
      } else {
        g.position.copy(p);
        this.root.add(g);
      }
      this.joints[def.name] = g;
    }
    this.pelvis = this.joints.pelvis;
    this.contacts = CONTACTS.map(([seg, p, r]) => ({
      seg,
      local: new THREE.Vector3(...p).sub(this.rest[seg]),
      r,
    }));
    this._v = new THREE.Vector3();
  }

  /** Converts a rest-pose world point into the local frame of a segment. */
  local(seg, p) {
    return new THREE.Vector3(...p).sub(this.rest[seg]);
  }

  /** Attaches an object built in rest world coordinates to a segment. */
  attach(seg, obj) {
    obj.position.sub(this.rest[seg]);
    this.joints[seg].add(obj);
    return obj;
  }

  worldPoint(seg, local, out = new THREE.Vector3()) {
    return out.copy(local).applyMatrix4(this.joints[seg].matrixWorld);
  }

  /** Applies a map of joint name -> quaternion, root offset (x,z). */
  applyQuats(quats, offset = { x: 0, z: 0 }) {
    for (const name in this.joints) {
      const q = quats[name];
      if (q) this.joints[name].quaternion.copy(q);
      else this.joints[name].quaternion.identity();
    }
    this.pelvis.position.set(this.rest.pelvis.x + offset.x, this.rest.pelvis.y, this.rest.pelvis.z + offset.z);
    this.root.updateMatrixWorld(true);
  }

  /** Moves the body vertically so that its lowest contact point rests on the floor. */
  ground() {
    let min = Infinity;
    for (const c of this.contacts) {
      const y = this.worldPoint(c.seg, c.local, this._v).y - c.r;
      if (y < min) min = y;
    }
    this.pelvis.position.y -= min;
    this.root.updateMatrixWorld(true);
  }
}
