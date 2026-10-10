import * as THREE from 'three';

// Yoga props the body can rest on: the floor plus blocks, bolsters, folded blankets and a wall.
// A pose lists its props in POSE_PROPS (src/data/poses.js) in the pose's own frame: metres, the
// pelvis of the grounded pose at x = z = 0 (its rest x/z), floor at y = 0, body facing +Z, the
// model's left +X. Sizes are common retail sizes, not from a standard.
//   { type: 'block', at: [x, z], yaw?, stand?: 'flat' | 'side' | 'end', y? }
//   { type: 'blanket', at: [x, z], yaw?, y? }            folded blanket
//   { type: 'bolster', at: [x, z], yaw? }                round bolster lying on the floor
//   { type: 'wall', at: [x, z], normal: [nx, nz] }       vertical plane; normal points to the body
// yaw (degrees) turns a prop about the vertical axis; at yaw 0 its long side runs along X.
export const PROP_SIZES = {
  // block 23 × 15 × 7.5 cm, standing on its broad face (flat), long edge (side) or end
  block: { flat: [0.23, 0.075, 0.15], side: [0.23, 0.15, 0.075], end: [0.075, 0.23, 0.15] },
  blanket: [0.5, 0.06, 0.35],
  bolster: { length: 0.65, radius: 0.11 },
};

export const PROP_NAMES = { block: 'gạch tập', blanket: 'chăn gấp', bolster: 'gối ôm', wall: 'tường' };

const UP = new THREE.Vector3(0, 1, 0);

/** One prop resolved into world geometry (offset: the x/z shift of the pose frame). */
function resolve(prop, offset = { x: 0, z: 0 }) {
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
  constructor(props = [], offset) {
    this.props = props.map((p) => resolve(p, offset));
  }

  get empty() {
    return !this.props.length;
  }

  /** Height (y) at which a sphere of radius r centred above (x, z) rests, and the surface normal there. */
  rest(x, z, r, out = { y: 0, n: UP }) {
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
          if (y > out.y) {
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
          if (y > out.y) {
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

  /** Vertical clearance of a contact sphere (centre p, radius r) above whatever is under it. */
  clearance(p, r) {
    return p.y - this.rest(p.x, p.z, r).y;
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

/** Builds the meshes of an Env (for the viewer and the thumbnails). */
export function propMeshes(env) {
  const group = new THREE.Group();
  group.name = 'props';
  const foam = new THREE.MeshStandardMaterial({ color: 0x8d7bb5, roughness: 0.85 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0xc58f63, roughness: 0.95 });
  const blanket = new THREE.MeshStandardMaterial({ color: 0x7b9ec2, roughness: 0.95 });
  const wall = new THREE.MeshStandardMaterial({ color: 0xd9d4cc, roughness: 1, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  for (const p of env.props) {
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
