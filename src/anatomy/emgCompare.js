// Model activation in the form a surface EMG measurement can be compared with (data/emg.js).
import { EMG, EMG_STUDIES } from '../data/emg.js';

/**
 * Activation (0–1) of one muscle side in a static-optimisation solution: one fibre when `part`
 * is a fibre index (e.g. biceps femoris), otherwise the strength-weighted mean over the fibres
 * (Σ force / Σ Fmax) – a surface electrode records a region of the muscle, not its most active
 * bundle, so the max shown in the muscle card would overstate fan-shaped muscles.
 */
export function modelActivation(sol, muscle, side, part = null) {
  const m = sol.muscles.get(`${muscle}|${side}`);
  if (!m) return null;
  if (part !== null) {
    const f = m.fibres.find((r) => r.fibre.index === part);
    return f ? f.a : null;
  }
  const fmax = m.fibres.reduce((s, r) => s + r.fibre.fmax, 0);
  return fmax ? m.force / fmax : 0;
}

/** Measured EMG for a pose / muscle / side, with its study. */
export function emgFor(pose, muscle, side) {
  return EMG.filter((e) => e.pose === pose && e.muscle === muscle && e.side === side).map((e) => ({ ...e, ref: EMG_STUDIES[e.study] }));
}

/** Spearman rank correlation (average ranks for ties). */
export function spearman(x, y) {
  const rank = (v) => {
    const idx = v.map((_, i) => i).sort((a, b) => v[a] - v[b]);
    const r = new Array(v.length);
    for (let i = 0; i < idx.length; ) {
      let j = i;
      while (j + 1 < idx.length && v[idx[j + 1]] === v[idx[i]]) j++;
      for (let k = i; k <= j; k++) r[idx[k]] = (i + j) / 2;
      i = j + 1;
    }
    return r;
  };
  const rx = rank(x);
  const ry = rank(y);
  const n = x.length;
  const mx = rx.reduce((a, b) => a + b, 0) / n;
  const my = ry.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (rx[i] - mx) * (ry[i] - my);
    sxx += (rx[i] - mx) ** 2;
    syy += (ry[i] - my) ** 2;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
}
