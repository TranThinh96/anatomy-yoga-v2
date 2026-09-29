import * as THREE from 'three';

// Rest pose ("Tadasana", anatomical position, palms forward).
// All coordinates are world-space metres in the rest pose; the body faces +Z,
// the body's LEFT side is +X, Y is up and the floor is y = 0.
export const JOINT_DEFS = [
  { name: 'pelvis', parent: null, pos: [0, 0.95, 0] },
  { name: 'lumbar', parent: 'pelvis', pos: [0, 1.03, -0.05] },
  { name: 'thorax', parent: 'lumbar', pos: [0, 1.2, -0.06] },
  { name: 'neck', parent: 'thorax', pos: [0, 1.47, -0.06] },
  { name: 'head', parent: 'neck', pos: [0, 1.58, -0.03] },
  ...sided('scapula', 'thorax', [0.03, 1.43, 0.06]),
  ...sided('shoulder', 'scapula', [0.19, 1.4, -0.01]),
  ...sided('elbow', 'shoulder', [0.2, 1.1, -0.02]),
  ...sided('wrist', 'elbow', [0.21, 0.84, 0.0]),
  ...sided('hip', 'pelvis', [0.09, 0.93, 0.0]),
  ...sided('knee', 'hip', [0.095, 0.5, 0.0]),
  ...sided('ankle', 'knee', [0.09, 0.085, -0.01]),
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

// Points used to keep the body on the floor: [segment, rest position, radius].
const CONTACTS = [
  ...both('ankle', [0.09, 0.0, -0.06], 0.012), // heel
  ...both('ankle', [0.105, 0.0, 0.17], 0.01), // toe tip
  ...both('ankle', [0.09, 0.075, 0.1], 0.015), // top of foot
  ...both('ankle', [0.09, 0.02, 0.12], 0.0), // ball of foot
  ...both('knee', [0.095, 0.5, 0.06], 0.012), // patella front
  ...both('knee', [0.095, 0.3, 0.05], 0.01), // shin
  ...both('hip', [0.1, 0.7, -0.07], 0.0), // back of thigh
  ...both('hip', [0.1, 0.7, 0.08], 0.0), // front of thigh
  ...both('wrist', [0.21, 0.67, 0.0], 0.004), // finger tips
  ...both('wrist', [0.21, 0.8, 0.0], 0.02), // heel of hand
  ...both('elbow', [0.205, 1.1, -0.045], 0.01), // elbow
  ...both('elbow', [0.21, 0.95, 0.0], 0.02), // forearm
  ...both('scapula', [0.1, 1.35, -0.1], 0.015), // shoulder blade
  ['pelvis', [0.06, 0.87, -0.05], 0.02], // sit bones
  ['pelvis', [-0.06, 0.87, -0.05], 0.02],
  ['pelvis', [0, 0.97, -0.1], 0.015], // sacrum
  ['pelvis', [0, 0.9, 0.08], 0.02], // pubis
  ['thorax', [0, 1.3, -0.12], 0.015], // mid back
  ['thorax', [0, 1.3, 0.12], 0.015], // chest
  ['head', [0, 1.66, -0.1], 0.005], // back of head
  ['head', [0, 1.7, 0.1], 0.005], // forehead
  ['head', [0, 1.77, 0.0], 0.005], // crown
];
function both(base, [x, y, z], r) {
  return [
    [`${base}_L`, [x, y, z], r],
    [`${base}_R`, [-x, y, z], r],
  ];
}

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
