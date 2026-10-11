import * as THREE from 'three';

// Yoga props the body can rest on: the floor plus blocks, bolsters, folded blankets and a wall.
// A pose lists its props in POSE_PROPS (src/data/poses.js) in the pose's own frame: metres, the
// pelvis of the grounded pose at x = z = 0 (its rest x/z), floor at y = 0, body facing +Z, the
// model's left +X. Sizes are common retail sizes, not from a standard.
//   { type: 'block', at: [x, z], yaw?, stand?: 'flat' | 'side' | 'end', y? }
//   { type: 'blanket', at: [x, z], yaw?, y? }            folded blanket
//   { type: 'bolster', at: [x, z], yaw? }                round bolster lying on the floor
//   { type: 'wall', at: [x, z], normal: [nx, nz] }       vertical plane; normal points to the body
//   { type: 'strap', hands: ['wrist_L'], foot: 'ankle_L' } a strap from the hand(s) around the ball of
//                                                         the foot: it only pulls (a tension between
//                                                         two body points, not a surface), see Physics
// yaw (degrees) turns a prop about the vertical axis; at yaw 0 its long side runs along X.
export const PROP_SIZES = {
  // block 23 × 15 × 7.5 cm, standing on its broad face (flat), long edge (side) or end
  block: { flat: [0.23, 0.075, 0.15], side: [0.23, 0.15, 0.075], end: [0.075, 0.23, 0.15] },
  blanket: [0.5, 0.06, 0.35],
  bolster: { length: 0.65, radius: 0.11 },
};

export const PROP_NAMES = { block: 'gạch tập', blanket: 'chăn gấp', bolster: 'gối ôm', wall: 'tường', strap: 'dây tập' };

const UP = new THREE.Vector3(0, 1, 0);
// A point counts as over a prop (and may rest on it) unless it is more than this far below its top:
// a hand beside a block is not lifted onto it.
const SINK = 0.04;

/** One prop resolved into world geometry (offset: the x/z shift of the pose frame). */
function resolve(prop, offset = { x: 0, z: 0 }) {
  if (prop.type === 'strap') return { ...prop, kind: 'strap' };
  const yaw = ((prop.yaw || 0) * Math.PI) / 180;
  const c = new THREE.Vector3(prop.at[0] + offset.x, prop.y || 0, prop.at[1] + offset.z);
  const u = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)); // long axis
  const v = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  if (prop.type === 'wall') {
    const n = new THREE.Vector3(prop.normal[0], 0, prop.normal[1]).normalize();
    return { ...prop, kind: 'wall', c, n };
  }
  if (prop.type === 'bolster') {
    const { length, radius } = PROP_SIZES.bolster;
    return { ...prop, kind: 'cyl', c: c.setY(c.y + radius), u, length, radius };
  }
  const size = prop.type === 'block' ? PROP_SIZES.block[prop.stand || 'flat'] : PROP_SIZES.blanket;
  return { ...prop, kind: 'box', c, u, v, size };
}

/**
 * The surfaces around the body. Heights are of a contact sphere's centre (radius r) resting on a
 * surface; the walls only push horizontally and never carry the body's height (ground()).
 */
export class Env {
  /** segs: the segments that may rest on the props (all when null); the others only meet the floor. */
  constructor(props = [], offset, segs = null) {
    this.props = props.map((p) => resolve(p, offset));
    this.segs = segs;
  }

  /** Whether a segment may rest on the props (a hand passing beside a block may not). */
  onProps(seg) {
    return !this.segs || this.segs.has(seg);
  }

  get empty() {
    return !this.props.length;
  }

  /** The straps (tensions between body points), not surfaces. */
  get straps() {
    return this.props.filter((p) => p.kind === 'strap');
  }

  /**
   * Height (y) at which a sphere of radius r centred at (x, y, z) rests, and the surface normal
   * there: the floor, or the highest prop under it that the sphere is not deep inside (SINK).
   */
  rest(x, z, r, y0 = Infinity, out = { y: 0, n: UP }) {
    out.y = r;
    out.n = UP;
    for (const p of this.props) {
      if (p.kind === 'box') {
        const dx = x - p.c.x;
        const dz = z - p.c.z;
        const a = dx * p.u.x + dz * p.u.z;
        const b = dx * p.v.x + dz * p.v.z;
        if (Math.abs(a) <= p.size[0] / 2 && Math.abs(b) <= p.size[2] / 2) {
          const y = p.c.y + p.size[1] + r;
          if (y > out.y && y0 > y - SINK) {
            out.y = y;
            out.n = UP;
          }
        }
      } else if (p.kind === 'cyl') {
        const dx = x - p.c.x;
        const dz = z - p.c.z;
        const a = dx * p.u.x + dz * p.u.z; // along the axis
        const d = -dx * p.u.z + dz * p.u.x; // across it
        const R = p.radius + r;
        if (Math.abs(a) <= p.length / 2 && Math.abs(d) < R) {
          const h = Math.sqrt(R * R - d * d);
          const y = p.c.y + h;
          if (y > out.y && y0 > y - SINK) {
            out.y = y;
            // radial normal: across the axis and up
            const nx = (d / R) * -p.u.z;
            const nz = (d / R) * p.u.x;
            out.n = new THREE.Vector3(nx, h / R, nz).normalize();
          }
        }
      }
    }
    return out;
  }

  /** Height of a contact sphere above the top of a prop under it (Infinity when no prop is under it). */
  propClearance(p, r) {
    const top = this.rest(p.x, p.z, r, Infinity, { y: -Infinity, n: UP });
    return top.y > r + 1e-9 ? p.y - top.y : Infinity;
  }

  /** Vertical clearance of a contact sphere (centre p, radius r) above whatever is under it. */
  clearance(p, r) {
    return p.y - this.rest(p.x, p.z, r, p.y).y;
  }

  /** Smallest gap between a contact sphere and a wall (Infinity without walls), with the wall's normal. */
  wallGap(p, r) {
    let best = { gap: Infinity, n: null };
    for (const w of this.props) {
      if (w.kind !== 'wall') continue;
      const gap = (p.x - w.c.x) * w.n.x + (p.z - w.c.z) * w.n.z - r;
      if (gap < best.gap) best = { gap, n: w.n };
    }
    return best;
  }
}

export const NO_PROPS = new Env();

/**
 * Where a strap holds the body, in the rig's current pose: the middle of each hand's palm and the
 * ball of the foot (the mean of the hand's contact points / of the foot's points in front of the
 * ankle). Returns [{ hand, a, b }]: one strand per hand, from a (hand) to b (foot), world space.
 */
export function strapStrands(rig, strap) {
  const mean = (seg, keep = () => true) => {
    const pts = rig.contacts.filter((c) => c.seg === seg && keep(c));
    const out = new THREE.Vector3();
    for (const c of pts) out.add(rig.worldPoint(seg, c.local, new THREE.Vector3()));
    return out.multiplyScalar(1 / Math.max(pts.length, 1));
  };
  const b = mean(strap.foot, (c) => c.local.z > 0.08);
  return strap.hands.map((hand) => ({ hand, a: mean(hand), b }));
}

/** Moves the strap meshes of a props group (propMeshes) to the rig's current pose. */
export function updateStraps(group, rig) {
  if (!group) return;
  const d = new THREE.Vector3();
  for (const m of group.children) {
    const s = m.userData.strap;
    if (!s) continue;
    const st = strapStrands(rig, s)[m.userData.strand];
    d.subVectors(st.b, st.a);
    const len = d.length();
    m.position.copy(st.a).addScaledVector(d, 0.5);
    m.scale.set(1, Math.max(len, 1e-3), 1);
    if (len > 1e-6) m.quaternion.setFromUnitVectors(UP, d.multiplyScalar(1 / len));
  }
}

/** Builds the meshes of an Env (for the viewer and the thumbnails). */
export function propMeshes(env) {
  const group = new THREE.Group();
  group.name = 'props';
  const foam = new THREE.MeshStandardMaterial({ color: 0x8d7bb5, roughness: 0.85 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0xc58f63, roughness: 0.95 });
  const blanket = new THREE.MeshStandardMaterial({ color: 0x7b9ec2, roughness: 0.95 });
  const wall = new THREE.MeshStandardMaterial({ color: 0xd9d4cc, roughness: 1, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  const webbing = new THREE.MeshStandardMaterial({ color: 0x4f9a7a, roughness: 0.8 });
  for (const p of env.props) {
    if (p.kind === 'strap') {
      // one strand per hand, a unit-length band stretched and placed by updateStraps
      p.hands.forEach((_, i) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1, 0.004), webbing);
        m.userData = { strap: p, strand: i };
        m.castShadow = true;
        group.add(m);
      });
      continue;
    }
    let m;
    if (p.kind === 'box') {
      m = new THREE.Mesh(new THREE.BoxGeometry(...p.size), p.type === 'blanket' ? blanket : foam);
      m.position.set(p.c.x, p.c.y + p.size[1] / 2, p.c.z);
      m.rotation.y = Math.atan2(-p.u.z, p.u.x);
    } else if (p.kind === 'cyl') {
      m = new THREE.Mesh(new THREE.CylinderGeometry(p.radius, p.radius, p.length, 32), cloth);
      m.position.copy(p.c);
      m.quaternion.setFromUnitVectors(UP, p.u);
    } else {
      m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.2), wall);
      m.position.set(p.c.x, 1.1, p.c.z);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.n);
      m.receiveShadow = true;
    }
    m.castShadow = p.kind !== 'wall';
    m.receiveShadow = true;
    group.add(m);
  }
  return group;
}
