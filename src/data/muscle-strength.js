// Maximum isometric force (N, one side) of every fibre bundle in body-model.gen.js, in the
// same order as the fibres (per-part muscles) or split evenly across a fan.
// Values are rounded from published musculoskeletal models, all derived from cadaver
// physiological cross-sectional areas (PCSA × specific tension):
//   lower limb – Arnold EM et al. (2010) Ann Biomed Eng 38:269–279 (PCSA from Ward et al. 2009)
//   upper limb – Holzbaur KRS et al. (2005) Ann Biomed Eng 33:829–840
//   lumbar spine – Christophy M et al. (2012) Biomech Model Mechanobiol 11:19–34
//   scapulothoracic muscles – Seth A et al. (2016) PLoS ONE 11:e0141028
//   neck – Vasavada AN et al. (1998) Spine 23:412–422
// Muscles that the model does not contain are listed in `lumped` (their force is either added
// to the closest modelled muscle or left to the reserve actuators, see muscleForces.js).
export const MUSCLE_STRENGTH = {
  rectus_abdominis: { fan: 560 },
  external_oblique: { fan: 900 },
  erector_spinae: { parts: [1300, 1000], names: ['Cơ dài ngực', 'Cơ chậu sườn'] },
  quadratus_lumborum: { fan: 400 },
  iliopsoas: { parts: [1110, 1070], names: ['Cơ thắt lưng lớn', 'Cơ chậu'] },
  latissimus_dorsi: { fan: 1130 },
  trapezius: { parts: [300, 400, 250], names: ['Phần trên', 'Phần giữa', 'Phần dưới'] },
  pectoralis_major: { parts: [340, 340, 390], names: ['Phần đòn', 'Phần ức sườn', 'Phần bụng'] },
  pectoralis_minor: { fan: 360 },
  serratus_anterior: { fan: 920 },
  rhomboids: { parts: [150, 300], names: ['Cơ trám bé', 'Cơ trám lớn'] },
  levator_scapulae: { fan: 170 },
  sternocleidomastoid: { fan: 160 },
  deltoid: { parts: [1140, 1140, 260], names: ['Delta trước', 'Delta giữa', 'Delta sau'] },
  supraspinatus: { fan: 490 },
  // + teres minor (354 N), same line of action
  infraspinatus: { fan: 1560 },
  biceps_brachii: { parts: [620, 440], names: ['Đầu dài', 'Đầu ngắn'] },
  triceps_brachii: { parts: [800, 1250], names: ['Đầu dài', 'Đầu ngoài + trong'] },
  forearm_flexors: { parts: [410, 480], names: ['Gập cổ tay quay', 'Gập cổ tay trụ'] },
  forearm_extensors: { parts: [340, 190], names: ['Duỗi cổ tay quay', 'Duỗi các ngón'] },
  gluteus_maximus: { fan: 1860 },
  gluteus_medius: { fan: 2200 },
  piriformis: { fan: 440 },
  tfl_itb: { fan: 230 },
  rectus_femoris: { fan: 1170 },
  // + half of vastus intermedius (1697 N), which has no separate mesh here
  vastus_lateralis: { fan: 6000 },
  vastus_medialis: { fan: 3600 },
  hamstrings: { parts: [1310, 590, 2200], names: ['Nhị đầu đùi', 'Bán gân', 'Bán màng'] },
  adductors: { parts: [630, 430, 1470], names: ['Khép dài', 'Khép ngắn', 'Khép lớn'] },
  sartorius: { fan: 250 },
  gastrocnemius: { parts: [1560, 680], names: ['Đầu trong', 'Đầu ngoài'] },
  soleus: { fan: 3550 },
  tibialis_anterior: { fan: 910 },
};

// Optimal fibre length (cm, one value per part or one for the whole muscle) – used only by the
// stability constraint (muscleForces.js), where a fibre's short-range stiffness is q·F/Lf.
// Lower limb: Ward SR, Eng CM, Smallwood LH, Lieber RL (2009) Clin Orthop Relat Res 467:1074–1082,
// Table 3 ("fiber length", normalised to a sarcomere length of 2.7 μm; 21 cadaver legs; full
// text PMC2650051). Piriformis and tensor fasciae latae are not in Ward's table: taken from the
// Rajagopal et al. (2016) IEEE Trans Biomed Eng 63:2068 model file (Rajagopal2016.osim,
// github.com/opensim-org/opensim-models), whose other lower-limb values equal Ward's.
// Trunk, shoulder and arm muscles have no entry yet (their stiffness keeps the whole
// muscle–tendon length).
export const FIBRE_LENGTH = {
  iliopsoas: [11.69, 10.66], // psoas, iliacus
  gluteus_maximus: 15.69,
  gluteus_medius: 7.33,
  piriformis: 2.6, // Rajagopal2016.osim
  tfl_itb: 9.5, // Rajagopal2016.osim
  rectus_femoris: 7.59,
  vastus_lateralis: 9.94,
  vastus_medialis: 9.68,
  hamstrings: [9.76, 19.3, 6.9], // biceps femoris long head, semitendinosus, semimembranosus
  adductors: [10.82, 10.31, 14.44], // longus, brevis, magnus
  sartorius: 40.3,
  gastrocnemius: [5.1, 5.88], // medial, lateral head
  soleus: 4.4,
  tibialis_anterior: 6.83,
};

/** Optimal fibre length (m) of every fibre of a muscle definition, or null if not tabulated. */
export function fibreLength(def) {
  const v = FIBRE_LENGTH[def.id];
  if (v == null) return null;
  if (Array.isArray(v)) return v.length === def.fibers ? v.map((x) => x / 100) : null;
  return new Array(def.fibers).fill(v / 100);
}

/** Muscles with a real role that are not in the model (shown in the notes). */
export const NOT_MODELLED =
  'cơ ngang bụng, cơ chéo bụng trong, cơ nhiều chân và các cơ sâu cột sống, cơ dưới vai, cơ tròn lớn, cơ cánh tay, cơ cánh tay quay, cơ gập/duỗi ngón dài, cơ mông bé, cơ mác, cơ chày sau, các cơ gập ngón chân và cơ sâu vùng cổ';

/** Fmax of every fibre of a muscle definition (array, length = def.fibers). */
export function fibreStrength(def) {
  const s = MUSCLE_STRENGTH[def.id];
  if (!s) return new Array(def.fibers).fill(200 / def.fibers);
  if (s.parts && s.parts.length === def.fibers) return s.parts.slice();
  const total = s.fan ?? s.parts.reduce((a, b) => a + b, 0);
  return new Array(def.fibers).fill(total / def.fibers);
}
