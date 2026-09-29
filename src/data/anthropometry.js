// Segment inertia parameters from de Leva P. (1996) "Adjustments to Zatsiorsky–Seluyanov's
// segment inertia parameters", Journal of Biomechanics 29(9):1223–1230, Table 4.
// mass: % of body mass; com: position of the segment centre of mass along the line
// from the proximal to the distal landmark, in % of that length.
//
// prox / dist are the landmarks on this model in rest-pose world coordinates (left side;
// right side mirrored), measured on the BodyParts3D bones by tools/bp3d-build.mjs:
// vertex → C7/T1, C7/T1 → xiphoid → navel level → hip centres, joint centres for the limbs,
// heel → toe tip for the foot. seg is the rig segment that carries the mass.
import { MODEL } from './body-model.gen.js';

const L = MODEL.landmarks;

export const SEGMENTS = [
  { key: 'head', name: 'Đầu – cổ', seg: 'head', sided: false, prox: L.head.prox, dist: L.head.dist, mass: { m: 6.94, f: 6.68 }, com: { m: 59.76, f: 58.94 } },
  { key: 'upper_trunk', name: 'Thân trên', seg: 'thorax', sided: false, prox: L.upper_trunk.prox, dist: L.upper_trunk.dist, mass: { m: 15.96, f: 15.45 }, com: { m: 29.99, f: 20.77 } },
  { key: 'middle_trunk', name: 'Thân giữa', seg: 'lumbar', sided: false, prox: L.middle_trunk.prox, dist: L.middle_trunk.dist, mass: { m: 16.33, f: 14.65 }, com: { m: 45.02, f: 45.12 } },
  { key: 'lower_trunk', name: 'Thân dưới (chậu)', seg: 'pelvis', sided: false, prox: L.lower_trunk.prox, dist: L.lower_trunk.dist, mass: { m: 11.17, f: 12.47 }, com: { m: 61.15, f: 49.2 } },
  { key: 'upper_arm', name: 'Cánh tay', seg: 'shoulder', sided: true, prox: L.upper_arm.prox, dist: L.upper_arm.dist, mass: { m: 2.71, f: 2.55 }, com: { m: 57.72, f: 57.54 } },
  { key: 'forearm', name: 'Cẳng tay', seg: 'elbow', sided: true, prox: L.forearm.prox, dist: L.forearm.dist, mass: { m: 1.62, f: 1.38 }, com: { m: 45.74, f: 45.59 } },
  { key: 'hand', name: 'Bàn tay', seg: 'wrist', sided: true, prox: L.hand.prox, dist: L.hand.dist, mass: { m: 0.61, f: 0.56 }, com: { m: 79.0, f: 74.74 } },
  { key: 'thigh', name: 'Đùi', seg: 'hip', sided: true, prox: L.thigh.prox, dist: L.thigh.dist, mass: { m: 14.16, f: 14.78 }, com: { m: 40.95, f: 36.12 } },
  { key: 'shank', name: 'Cẳng chân', seg: 'knee', sided: true, prox: L.shank.prox, dist: L.shank.dist, mass: { m: 4.33, f: 4.81 }, com: { m: 44.59, f: 44.16 } },
  { key: 'foot', name: 'Bàn chân', seg: 'ankle', sided: true, prox: L.foot.prox, dist: L.foot.dist, mass: { m: 1.37, f: 1.29 }, com: { m: 44.15, f: 40.14 } },
];

export const GRAVITY = 9.81;
