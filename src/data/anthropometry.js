// Segment inertia parameters from de Leva P. (1996) "Adjustments to Zatsiorsky–Seluyanov's
// segment inertia parameters", Journal of Biomechanics 29(9):1223–1230, Table 4.
// mass: % of body mass; com: position of the segment centre of mass along the line
// from the proximal to the distal landmark, in % of that length.
//
// prox / dist are the landmarks placed on this model in rest-pose world coordinates
// (left side; right side mirrored). seg is the rig segment that carries the mass.

export const SEGMENTS = [
  { key: 'head', name: 'Đầu – cổ', seg: 'head', sided: false, prox: [0, 1.765, 0.0], dist: [0, 1.47, -0.06], mass: { m: 6.94, f: 6.68 }, com: { m: 59.76, f: 58.94 } },
  { key: 'upper_trunk', name: 'Thân trên', seg: 'thorax', sided: false, prox: [0, 1.47, -0.02], dist: [0, 1.24, -0.005], mass: { m: 15.96, f: 15.45 }, com: { m: 29.99, f: 20.77 } },
  { key: 'middle_trunk', name: 'Thân giữa', seg: 'lumbar', sided: false, prox: [0, 1.24, -0.005], dist: [0, 1.07, -0.005], mass: { m: 16.33, f: 14.65 }, com: { m: 45.02, f: 45.12 } },
  { key: 'lower_trunk', name: 'Thân dưới (chậu)', seg: 'pelvis', sided: false, prox: [0, 1.07, -0.01], dist: [0, 0.93, 0.0], mass: { m: 11.17, f: 12.47 }, com: { m: 61.15, f: 49.2 } },
  { key: 'upper_arm', name: 'Cánh tay', seg: 'shoulder', sided: true, prox: [0.19, 1.4, -0.01], dist: [0.2, 1.1, -0.02], mass: { m: 2.71, f: 2.55 }, com: { m: 57.72, f: 57.54 } },
  { key: 'forearm', name: 'Cẳng tay', seg: 'elbow', sided: true, prox: [0.2, 1.1, -0.02], dist: [0.21, 0.84, 0.0], mass: { m: 1.62, f: 1.38 }, com: { m: 45.74, f: 45.59 } },
  { key: 'hand', name: 'Bàn tay', seg: 'wrist', sided: true, prox: [0.21, 0.84, 0.0], dist: [0.21, 0.745, 0.005], mass: { m: 0.61, f: 0.56 }, com: { m: 79.0, f: 74.74 } },
  { key: 'thigh', name: 'Đùi', seg: 'hip', sided: true, prox: [0.09, 0.93, 0.0], dist: [0.095, 0.5, 0.0], mass: { m: 14.16, f: 14.78 }, com: { m: 40.95, f: 36.12 } },
  { key: 'shank', name: 'Cẳng chân', seg: 'knee', sided: true, prox: [0.095, 0.5, 0.0], dist: [0.1, 0.08, -0.012], mass: { m: 4.33, f: 4.81 }, com: { m: 44.59, f: 44.16 } },
  // foot: heel → toe tip; COM lifted to the height of the foot's bulk
  { key: 'foot', name: 'Bàn chân', seg: 'ankle', sided: true, prox: [0.09, 0.035, -0.06], dist: [0.105, 0.035, 0.17], mass: { m: 1.37, f: 1.29 }, com: { m: 44.15, f: 40.14 } },
];

export const GRAVITY = 9.81;
