// Measured surface EMG during yoga poses, used to check the model's muscle activation estimate
// (tools/check-emg.mjs) and shown next to it in the muscle card.
// Every number is copied from the results table named in its study entry (full text read from
// PubMed Central); none is read off a figure. Only poses the app has are taken.
//
// Entry: pose (POSES key), side (the model's leg the electrode sat on), muscle (MUSCLES id),
// part (fibre index in MUSCLE_STRENGTH parts; null = the whole muscle), limb (Vietnamese label
// of the leg as the paper names it), mean ± sd in the study's normalisation.
// In the app's poses the front / lifted leg is the LEFT one (virabhadrasana_1/2, vrksasana).
export const EMG_STUDIES = {
  liu2021: {
    short: 'Liu 2021',
    cite: 'Liu AM, Chu IH, Lin HT, Liang JM, Hsu HT, Wu WL (2021). Int J Environ Res Public Health 18(16):8402',
    doi: '10.3390/ijerph18168402',
    table: 'Table 2',
    norm: '%MVC',
    // mean EMG over the middle 6 s of a 10 s hold, normalised to MVC (manual muscle test)
    stat: 'trung bình',
    subjects: '11 nữ giáo viên yoga (40,7 ± 6,0 tuổi)',
    note: 'Cây: chân trụ. Chiến binh I/II: chân trước gập gối, chân sau duỗi thẳng.',
  },
  lehecka2021: {
    short: 'Lehecka 2021',
    cite: 'Lehecka BJ, Stoffregen S, May A, et al. (2021). Int J Sports Phys Ther 16(3):662–670',
    doi: '10.26603/001c.22499',
    table: 'Table 4',
    norm: '%MVIC',
    // the PEAK of the 150 ms-smoothed EMG over 5 s of a 7 s hold, normalised to MVIC –
    // higher than a mean over the hold would be
    stat: 'đỉnh',
    subjects: '31 người trẻ khỏe mạnh (24 ± 3 tuổi), 7 người tập yoga thường xuyên',
    note: 'Tư thế Cây trong bài: bàn chân đặt ở bắp chân (trong app: ở đùi trong).',
  },
  wang2013: {
    short: 'Wang 2013',
    cite: 'Wang MY, Yu SS, Hashish R, et al. (2013). BMC Complement Altern Med 13:8',
    doi: '10.1186/1472-6882-13-8',
    table: 'Table 1',
    norm: '% đỉnh khi đi bộ',
    // mean over the middle 3 s, normalised to the peak EMG of self-paced walking: not on the
    // same scale as %MVC, so only the ranking across poses is compared
    stat: 'trung bình',
    subjects: '20 người cao tuổi (70,7 ± 3,8 tuổi) sau 32 tuần tập, tư thế điều chỉnh cho người cao tuổi',
    note: 'Đo ở chân thuận; tư thế một chân đo ở chân trụ.',
  },
};

const LIU = [
  // pose, side, limb, [VL, RF, VM, BF, ST] as [mean, sd]
  ['utkatasana', 'R', 'hai chân', [[47.2, 24.0], [33.0, 10.1], [35.0, 11.2], [9.5, 5.2], [10.6, 7.8]]],
  ['virabhadrasana_1', 'L', 'chân trước', [[38.9, 20.7], [24.5, 15.6], [27.7, 4.8], [10.7, 6.5], [13.8, 9.9]]],
  ['virabhadrasana_1', 'R', 'chân sau', [[14.6, 6.6], [32.5, 11.0], [50.4, 11.7], [13.8, 7.8], [19.1, 14.7]]],
  ['virabhadrasana_2', 'L', 'chân trước', [[47.7, 26.0], [19.7, 7.4], [32.0, 2.4], [12.5, 8.8], [10.7, 6.4]]],
  ['virabhadrasana_2', 'R', 'chân sau', [[8.5, 2.8], [21.7, 9.6], [32.9, 10.7], [13.0, 8.8], [30.6, 14.3]]],
  ['vrksasana', 'R', 'chân trụ', [[31.4, 19.2], [25.7, 11.3], [27.9, 21.5], [11.0, 5.4], [11.1, 10.7]]],
];
const LIU_MUSCLES = [
  ['vastus_lateralis', null],
  ['rectus_femoris', null],
  ['vastus_medialis', null],
  ['hamstrings', 0], // biceps femoris
  ['hamstrings', 1], // semitendinosus
];

const LEHECKA = [
  // pose, side, limb, [gluteus maximus, gluteus medius]
  ['vrksasana', 'R', 'chân trụ', [[12.9, 8.9], [11.5, 10.9]]],
  ['vrksasana', 'L', 'chân nâng', [[29.0, 17.2], [18.6, 12.3]]],
  ['virabhadrasana_2', 'L', 'chân trước', [[12.9, 8.7], [7.7, 5.9]]],
  ['virabhadrasana_2', 'R', 'chân sau', [[11.8, 9.6], [10.5, 9.5]]],
];
const LEHECKA_MUSCLES = [
  ['gluteus_maximus', null],
  ['gluteus_medius', null],
];

const WANG = [
  // pose, side, limb, [GAS, HAMS, VL, GMED]
  ['utkatasana', 'R', 'hai chân', [[4.6, 2.8], [19.2, 16.0], [49.2, 44.7], [13.5, 10.2]]],
  ['vrksasana', 'R', 'chân trụ', [[35.7, 15.3], [36.3, 51.3], [38.6, 39.0], [24.6, 17.4]]],
  ['virabhadrasana_2', 'L', 'chân trước', [[8.9, 6.3], [18.3, 14.4], [43.8, 37.5], [16.4, 12.1]]],
  ['virabhadrasana_2', 'R', 'chân sau', [[10.0, 4.3], [17.1, 16.3], [31.9, 24.5], [9.4, 5.3]]],
];
const WANG_MUSCLES = [
  ['gastrocnemius', null],
  ['hamstrings', null],
  ['vastus_lateralis', null],
  ['gluteus_medius', null],
];

const expand = (study, rows, muscles) =>
  rows.flatMap(([pose, side, limb, values]) =>
    values.map(([mean, sd], i) => ({ study, pose, side, limb, muscle: muscles[i][0], part: muscles[i][1], mean, sd })),
  );

export const EMG = [...expand('liu2021', LIU, LIU_MUSCLES), ...expand('lehecka2021', LEHECKA, LEHECKA_MUSCLES), ...expand('wang2013', WANG, WANG_MUSCLES)];
