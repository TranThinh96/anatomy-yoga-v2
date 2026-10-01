import * as THREE from 'three';
import { Viewer } from './viewer.js';
import { Body } from './anatomy/body.js';
import { Animator } from './anatomy/animator.js';
import { ThumbnailMaker } from './ui/thumbnails.js';
import { Physics } from './anatomy/physics.js';
import { PhysicsOverlay } from './ui/physicsOverlay.js';
import { MuscleForces, CONTRACTION, contractionOf, JOINT_AXES } from './anatomy/muscleForces.js';
import { MUSCLE_STRENGTH, fibreStrength } from './data/muscle-strength.js';
import { BONES } from './data/bones.js';
import { MUSCLES, MUSCLE_GROUPS } from './data/muscles.js';
import { JOINTS } from './data/joints.js';
import { ASANAS, ASANA_BY_ID, CATEGORIES } from './data/asanas.js';
import { TOPICS, TOPIC_BY_ID } from './data/topics.js';

// ---------------------------------------------------------------- setup
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $('#app');
const viewer = new Viewer($('#viewport'));
const body = new Body(viewer.scene);
const subject = loadSubject();
const physics = new Physics(body.rig, subject);
// every pose is statically balanced (centre of mass over the feet) before it is played
const balance = (q) => physics.balance(q);
const anim = new Animator(body.rig, () => body.update(), { prepare: balance });
const overlay = new PhysicsOverlay(viewer.scene);
// muscle moment arms + static optimisation (activation of every muscle)
const forces = new MuscleForces(body.rig, body.muscleSystem);
const fibreIndex = new Map(forces.fibres.map((f, i) => [f, i]));
viewer.pickables = body.pickables;

function loadSubject() {
  try {
    const s = JSON.parse(localStorage.getItem('yoga3d.subject'));
    if (s && s.mass > 20 && (s.sex === 'm' || s.sex === 'f')) return s;
  } catch {
    /* storage unavailable */
  }
  return { mass: 60, sex: 'f' };
}
function saveSubject() {
  try {
    localStorage.setItem('yoga3d.subject', JSON.stringify({ mass: physics.mass, sex: physics.sex }));
  } catch {
    /* ignore */
  }
}

const ROLE_COLORS = {
  contract: new THREE.Color('#ff5a3c'),
  stretch: new THREE.Color('#3aa0ff'),
  stabilize: new THREE.Color('#f5b82e'),
};
const ROLE_LABEL = { contract: 'Co cơ (chủ động)', stretch: 'Kéo giãn', stabilize: 'Ổn định' };
const DIM_MUSCLE = new THREE.Color('#8b7f7c');
const SELECT_EMISSIVE = new THREE.Color('#ffffff');
const SIDE_LABEL = { L: 'bên trái', R: 'bên phải' };

const state = {
  mode: 'anatomy',
  listTab: 'muscles',
  selection: null, // { kind, id, side }
  asanaId: 'adho_mukha_svanasana',
  category: 'Tất cả',
  colorMode: 'roles',
  roleFilter: { contract: true, stretch: true, stabilize: true },
  showBonesAsana: true,
  muscleOpacity: 1,
  muscleStyle: 'real', // anatomy mode: 'real' BodyParts3D surfaces or 'tube' force paths
  layers: { bones: true, muscles: true, joints: true },
  lastStep: -1,
  variant: 0, // 0 = standard form, n = asana.variants[n - 1]
  phys: null, // latest static analysis
  act: null, // latest muscle activation estimate (static optimisation)
  compare: null, // variant comparison table (html)
  topicId: TOPICS[0].id,
  topicPose: 'auto', // 0 = reference pose, 1 = condition pose, 'auto' = move between them
  topicRef: new Map(), // muscle object -> length in the topic's reference pose
  topicChange: [], // [{ id, change }] muscle length change reference → condition (both sides)
};

// ---------------------------------------------------------------- helpers
const norm = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

function splitSide(key) {
  const m = key.match(/^(.*)_(L|R)$/);
  return m ? { id: m[1], side: m[2] } : { id: key, side: null };
}

function infoFor(kind, id) {
  if (kind === 'bone') return BONES[id];
  if (kind === 'muscle') return MUSCLES[id];
  if (kind === 'joint') return JOINTS[id];
  return null;
}

function meshesFor(sel) {
  if (!sel) return [];
  const pool = sel.kind === 'bone' ? body.bones : sel.kind === 'muscle' ? body.muscles : body.jointMarkers;
  return pool.filter((m) => m.userData.id === sel.id && (!sel.side || !m.userData.side || sideKey(m.userData.side) === sel.side));
}
function sideKey(s) {
  if (s === 1 || s === 'L') return 'L';
  if (s === -1 || s === 'R') return 'R';
  return null;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function lengthPct(id, side) {
  const list = body.muscleSystem.muscles.filter((m) => m.id === id && (!side || m.side === side));
  if (!list.length) return 0;
  return (list.reduce((a, m) => a + m.ratio, 0) / list.length - 1) * 100;
}
function fmtPct(p) {
  const r = Math.round(p);
  return `${r > 0 ? '+' : ''}${r}%`;
}

// ---------------------------------------------------------------- muscle activation
const ACT_COLORS = Object.fromEntries(Object.entries(CONTRACTION).map(([k, v]) => [k, new THREE.Color(v.color)]));
const SIDE_VI = { L: ' trái', R: ' phải', '': '' };
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
// what the reserve actuators of a joint stand for (muscles / tissue not in the model)
const MISSING = {
  lumbar: 'cơ nhiều chân, cơ chéo bụng trong, cơ ngang bụng',
  thorax: 'cơ nhiều chân, các cơ sâu cột sống',
  neck: 'cơ sâu vùng cổ (gối, bán gai)',
  head: 'cơ sâu vùng cổ (gối, bán gai)',
  scapula: 'tiếp xúc bả vai – lồng ngực, dây chằng',
  shoulder: 'cơ dưới vai, cơ tròn lớn, cơ quạ cánh tay',
  elbow: 'cơ cánh tay, cơ cánh tay quay, khoá khớp ở cuối tầm',
  wrist: 'cơ gập / duỗi ngón dài, dây chằng cổ tay',
  hip: 'cơ mông bé, nhóm xoay ngoài sâu, bao khớp',
  knee: 'cơ khoeo, đầu ngắn nhị đầu đùi, dây chằng',
  ankle: 'cơ mác, cơ chày sau, cơ gập ngón chân',
};
/** "Gập háng trái" for a joint axis and the sign of a moment about it */
function dofLabel(joint, dof, value) {
  const { id, side } = splitSide(joint);
  return `${cap(value >= 0 ? dof.pos : dof.neg)} ${JOINT_AXES[id].name}${SIDE_VI[side || '']}`;
}

let lastAct = 0;
/** Static optimisation for the current pose + contraction type from the motion ahead. */
function updateActivation(force = false) {
  const now = performance.now();
  if (!state.phys || (!force && now - lastAct < 90)) return;
  lastAct = now;
  const sol = forces.solve(state.phys.moments);
  let vel = null;
  if (anim.duration > 0 && anim.steps.length > 1) {
    const dt = 0.06;
    const t = anim.time + dt;
    vel = forces.velocities(anim.poseAt(t >= anim.duration ? t - anim.duration : t).quats, dt);
  }
  for (const m of sol.muscles.values()) m.type = contractionOf(m, vel, fibreIndex);
  state.act = sol;
}

/** Moment arms of a muscle in the rig's current pose, as table rows (largest first). */
function momentArmRows(id, side, min = 0.004) {
  return forces
    .muscleMomentArms(id, side)
    .filter((a) => Math.abs(a.value) >= min)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .map((a) => `<tr><td>${esc(dofLabel(a.joint, a.dof, a.value))}</td><td>${(Math.abs(a.value) * 100).toFixed(1)} cm</td></tr>`);
}

// ---------------------------------------------------------------- mode switching
function setMode(mode) {
  state.mode = mode;
  $$('.mode-tab').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  $$('.mode-section').forEach((s) => (s.hidden = s.dataset.for !== mode));
  $('#legend').hidden = mode !== 'asana';
  $('#topic-legend').hidden = mode !== 'topic';
  $('#player').hidden = mode !== 'asana';
  $('#phys-hud').hidden = mode !== 'asana';
  overlay.setVisible(mode === 'asana');
  state.selection = null;
  // the real muscle surfaces only follow the skeleton well in standing poses: anatomy mode only
  body.setMuscleStyle(mode === 'anatomy' ? state.muscleStyle : 'tube');
  viewer.pickables = body.pickables;
  if (mode === 'anatomy') {
    anim.setSequence([{ pose: 'tadasana', hold: 1 }], { loop: 'static' });
    anim.playing = false;
    for (const [k, v] of Object.entries(state.layers)) body.setLayer(k, v);
    viewer.mat.position.set(0, -0.002, 0);
    viewer.mat.rotation.y = 0;
    viewer.flyTo([0, 0.95, 0], [0.45, 0.2, 1], 3.6);
    renderAnatomyList();
    renderWelcome();
  } else if (mode === 'topic') {
    body.setLayer('muscles', true);
    body.setLayer('bones', true);
    body.setLayer('joints', true);
    loadTopic(state.topicId);
  } else {
    body.setLayer('muscles', true);
    body.setLayer('bones', state.showBonesAsana);
    body.setLayer('joints', true);
    loadAsana(state.asanaId);
  }
  updateHash();
  applyVisuals();
}

// ---------------------------------------------------------------- anatomy list
function renderAnatomyList() {
  const q = norm($('#anat-search').value.trim());
  const list = $('#anat-list');
  const groups = new Map();
  const add = (group, item) => {
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(item);
  };
  const match = (...fields) => !q || fields.some((f) => f && norm(f).includes(q));

  if (state.listTab === 'muscles') {
    for (const g of MUSCLE_GROUPS) groups.set(g, []);
    for (const [id, m] of Object.entries(MUSCLES)) {
      if (match(m.name, m.latin, m.group, m.action, m.yoga)) add(m.group, { kind: 'muscle', id, title: m.name, sub: m.latin, color: '#d96459' });
    }
  } else if (state.listTab === 'bones') {
    for (const [id, b] of Object.entries(BONES)) {
      if (match(b.name, b.latin, b.region, b.desc)) add(b.region, { kind: 'bone', id, title: b.name, sub: b.latin, color: '#e9dfc8' });
    }
  } else {
    for (const [id, j] of Object.entries(JOINTS)) {
      if (match(j.name, j.type, j.region, j.desc)) add(j.region, { kind: 'joint', id, title: j.name, sub: j.type, color: '#39c6b5' });
    }
  }
  let html = '';
  for (const [g, items] of groups) {
    if (!items.length) continue;
    html += `<div class="list-group">${esc(g)}</div>`;
    for (const it of items) {
      const active = state.selection && state.selection.kind === it.kind && state.selection.id === it.id;
      html += `<button class="list-item${active ? ' active' : ''}" data-kind="${it.kind}" data-id="${it.id}">
        <span class="dot" style="background:${it.color}"></span>
        <span class="li-main"><span class="li-title">${esc(it.title)}</span><span class="li-sub">${esc(it.sub)}</span></span>
      </button>`;
    }
  }
  list.innerHTML = html || '<p class="empty-note" style="padding:8px">Không tìm thấy kết quả.</p>';
}

$('#anat-list').addEventListener('click', (e) => {
  const b = e.target.closest('.list-item');
  if (!b) return;
  select({ kind: b.dataset.kind, id: b.dataset.id, side: null }, { fly: true });
  closeDrawers();
});
$('#anat-search').addEventListener('input', renderAnatomyList);
$('#anat-tabs').addEventListener('click', (e) => {
  const b = e.target.closest('.seg');
  if (!b) return;
  state.listTab = b.dataset.list;
  $$('#anat-tabs .seg').forEach((x) => x.classList.toggle('active', x === b));
  renderAnatomyList();
});
$$('.layer-toggles input').forEach((inp) =>
  inp.addEventListener('change', () => {
    state.layers[inp.dataset.layer] = inp.checked;
    body.setLayer(inp.dataset.layer, inp.checked);
    applyVisuals();
  }),
);
$('#muscle-style').addEventListener('click', (e) => {
  const b = e.target.closest('.seg');
  if (!b) return;
  state.muscleStyle = b.dataset.style;
  $$('#muscle-style .seg').forEach((x) => x.classList.toggle('active', x === b));
  body.setMuscleStyle(state.muscleStyle);
  viewer.pickables = body.pickables;
  lastClick = null;
  applyVisuals();
  if (state.selection) renderInfo(state.selection);
});
$('#muscle-opacity').addEventListener('input', (e) => {
  state.muscleOpacity = parseFloat(e.target.value);
  applyVisuals();
});

// ---------------------------------------------------------------- selection
function select(sel, { fly = false } = {}) {
  state.selection = sel;
  if (state.mode === 'anatomy') {
    if (sel) {
      const tab = sel.kind === 'muscle' ? 'muscles' : sel.kind === 'bone' ? 'bones' : 'joints';
      if (tab !== state.listTab) {
        state.listTab = tab;
        $$('#anat-tabs .seg').forEach((x) => x.classList.toggle('active', x.dataset.list === tab));
      }
      // make sure the selected layer is visible
      const layer = sel.kind === 'muscle' ? 'muscles' : sel.kind === 'bone' ? 'bones' : 'joints';
      if (!state.layers[layer]) {
        state.layers[layer] = true;
        body.setLayer(layer, true);
        $(`.layer-toggles input[data-layer="${layer}"]`).checked = true;
      }
      renderInfo(sel);
    } else renderWelcome();
    renderAnatomyList();
    const active = $('#anat-list .list-item.active');
    active?.scrollIntoView({ block: 'nearest' });
  } else if (state.mode === 'topic') {
    renderTopicInfo();
  } else {
    renderAsanaInfo();
  }
  applyVisuals();
  if (fly && sel) flyToMeshes(meshesFor(sel));
  updateHash();
}

function flyToMeshes(meshes) {
  meshes = meshes.filter((m) => m.visible);
  if (!meshes.length) return;
  const box = new THREE.Box3();
  for (const m of meshes) box.expandByObject(m);
  const c = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();
  // look at the structure from the side of the body it sits on (front/back/side)
  const pelvis = body.rig.pelvis.getWorldPosition(new THREE.Vector3());
  const off = c.clone().sub(pelvis);
  const dir =
    Math.abs(off.z) > 0.03 || Math.abs(off.x) > 0.12
      ? new THREE.Vector3(off.x * 2.5, 0.3, Math.abs(off.z) > 0.03 ? Math.sign(off.z) : 0.3)
      : new THREE.Vector3(0.3, 0.25, 1);
  viewer.flyTo(c.toArray(), dir.normalize().toArray(), THREE.MathUtils.clamp(size * 2.2, 1.1, 3.8));
}

const structureKey = (kind, id, side) => `${kind}:${id}:${sideKey(side) || ''}`;
const cameraKey = () => [...viewer.camera.position.toArray(), ...viewer.controls.target.toArray()].map((v) => v.toFixed(3)).join();
let lastClick = null; // { x, y, view, layers, index }: the drill-down in progress

/**
 * Deep structures (supraspinatus under the trapezius, piriformis under gluteus maximus…) are
 * mostly hidden, so clicking the same spot again moves on to the next structure under the pointer:
 * superficial muscle → deeper muscle → bone …, and back to the top after the last one.
 * The order is fixed at the first click: selecting a joint enlarges its marker, which would
 * otherwise reshuffle the stack and send the cycle in circles.
 */
function pickLayer(stack, e) {
  const view = cameraKey();
  const sel = state.selection;
  const c = lastClick;
  const current = c && c.layers[c.index].userData;
  if (
    c &&
    sel &&
    c.view === view &&
    Math.hypot(e.clientX - c.x, e.clientY - c.y) < 6 &&
    structureKey(sel.kind, sel.id, sel.side) === structureKey(current.kind, current.id, current.side)
  ) {
    // skip layers hidden since the first click (layer toggles)
    for (let i = 1; i <= c.layers.length; i++) {
      const k = (c.index + i) % c.layers.length;
      if (c.layers[k].visible) {
        c.index = k;
        return c.layers[k];
      }
    }
  }
  const layers = []; // one mesh per structure (a rib and its neighbours are one), nearest first
  const keys = new Set();
  for (const o of stack) {
    const k = structureKey(o.userData.kind, o.userData.id, o.userData.side);
    if (!keys.has(k)) {
      keys.add(k);
      layers.push(o);
    }
  }
  lastClick = { x: e.clientX, y: e.clientY, view, layers, index: 0 };
  return layers[0];
}

viewer.onPick = (obj, stack, e) => {
  if (!obj) {
    if (state.mode === 'anatomy') select(null);
    else if (state.selection) select(null);
    return;
  }
  if (state.mode === 'anatomy') obj = pickLayer(stack, e);
  const { kind, id, side } = obj.userData;
  const s = sideKey(side);
  if (state.mode !== 'anatomy' && kind !== 'muscle') return;
  select({ kind, id, side: s });
  // the tooltip names what the click selected (a deeper layer after a repeated click)
  viewer.onHover?.(obj, e);
  if (window.innerWidth <= 860) $('#right-panel').classList.add('open');
};

const tooltip = $('#tooltip');
viewer.onHover = (obj, e) => {
  if (!obj || !e) {
    tooltip.hidden = true;
    viewer.renderer.domElement.style.cursor = '';
    return;
  }
  const { kind, id, side } = obj.userData;
  const info = infoFor(kind, id);
  if (!info) return;
  const s = sideKey(side);
  let extra = s ? ` <small>(${SIDE_LABEL[s]})</small>` : '';
  if (state.mode === 'asana' && kind === 'muscle') extra += ` <small>· độ dài ${fmtPct(lengthPct(id, s))}</small>`;
  if (state.mode === 'topic' && kind === 'muscle') extra += ` <small>· ${fmtPct(topicLengthPct(id, s))} so với ${esc(TOPIC_BY_ID[state.topicId].compare[0].label.toLowerCase())}</small>`;
  tooltip.innerHTML = `${esc(info.name)}${extra}`;
  const rect = $('.stage').getBoundingClientRect();
  tooltip.style.left = `${e.clientX - rect.left}px`;
  tooltip.style.top = `${e.clientY - rect.top}px`;
  tooltip.hidden = false;
  viewer.renderer.domElement.style.cursor = 'pointer';
};

// ---------------------------------------------------------------- info panel (anatomy)
function renderWelcome() {
  const info = $('#info');
  if (state.mode === 'anatomy') {
    info.innerHTML = `<div class="welcome">
      <div class="info-kicker">Bắt đầu</div>
      <h2>Khám phá giải phẫu 3D</h2>
      <p>Mô hình gồm ${Object.keys(BONES).length} nhóm xương, ${Object.keys(MUSCLES).length} cơ/nhóm cơ quan trọng trong yoga và ${Object.keys(JOINTS).length} khớp. Nhấp vào bất kỳ phần nào trên mô hình hoặc chọn trong danh sách.</p>
      <ul class="tip-list">
        <li><span class="k">🖱</span><span>Kéo để xoay · cuộn để phóng to · chuột phải để di chuyển</span></li>
        <li><span class="k">◐</span><span>Tắt lớp <b>Cơ</b> hoặc giảm độ trong suốt để nhìn xương và khớp bên dưới.</span></li>
        <li><span class="k">⇣</span><span>Cơ sâu bị che? <b>Nhấp lại đúng điểm đó</b> để chọn lớp nằm bên dưới (vd. cơ trên gai dưới cơ thang).</span></li>
        <li><span class="k">✦</span><span>Mỗi mục có phần <b>Ứng dụng trong yoga</b> gợi ý cách hướng dẫn học viên.</span></li>
        <li><span class="k">▶</span><span>Chuyển sang tab <b>Asana 3D</b> để xem tư thế chuyển động và các cơ được tác động.</span></li>
        <li><span class="k">◧</span><span>Tab <b>Chủ đề</b> dành cho workshop: so sánh một tư thế lệch (vd. đổ chậu trước) với tư thế trung tính, xem cơ nào ngắn lại, cơ nào dài ra.</span></li>
      </ul>
    </div>`;
  }
}

function renderInfo(sel) {
  const d = infoFor(sel.kind, sel.id);
  if (!d) return;
  const sidePill = sel.side ? `<span class="pill side">${SIDE_LABEL[sel.side]}</span>` : '';
  let html = '';
  if (sel.kind === 'bone') {
    html = `<div class="info-kicker">Xương · ${esc(d.region)}</div>
      <div class="info-title">${esc(d.name)}</div><div class="info-latin">${esc(d.latin)}</div>
      <div class="info-meta">${sidePill}</div>
      <div class="info-section"><p>${esc(d.desc)}</p></div>
      <div class="info-section"><h4>Mốc giải phẫu</h4><ul>${d.landmarks.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div>
      <div class="info-section yoga-note"><h4>Ứng dụng trong yoga</h4><p>${esc(d.yoga)}</p></div>
      ${realBoneHtml(sel.id)}`;
  } else if (sel.kind === 'muscle') {
    const used = asanasUsingMuscle(sel.id);
    html = `<div class="info-kicker">Cơ · ${esc(d.group)}</div>
      <div class="info-title">${esc(d.name)}</div><div class="info-latin">${esc(d.latin)}</div>
      <div class="info-meta">${sidePill}</div>
      <div class="info-section"><dl class="kv">
        <dt>Nguyên uỷ</dt><dd>${esc(d.origin)}</dd>
        <dt>Bám tận</dt><dd>${esc(d.insertion)}</dd>
        <dt>Chức năng</dt><dd>${esc(d.action)}</dd>
      </dl></div>
      <div class="info-section yoga-note"><h4>Ứng dụng trong yoga</h4><p>${esc(d.yoga)}</p></div>
      ${realMuscleHtml(sel)}
      ${mechanicsHtml(sel)}
      ${usedHtml(used)}`;
  } else {
    html = `<div class="info-kicker">Khớp · ${esc(d.region)}</div>
      <div class="info-title">${esc(d.name)}</div><div class="info-latin">${esc(d.type)}</div>
      <div class="info-meta">${sidePill}</div>
      <div class="info-section"><p>${esc(d.desc)}</p></div>
      <div class="info-section"><h4>Biên độ vận động (tham khảo)</h4>
        <table class="rom-table">${d.movements.map(([m, r]) => `<tr><td>${esc(m)}</td><td>${esc(r)}</td></tr>`).join('')}</table></div>
      <div class="info-section yoga-note"><h4>Ứng dụng trong yoga</h4><p>${esc(d.yoga)}</p></div>`;
  }
  $('#info').innerHTML = `${html}<p class="hint layer-hint">Mẹo: nhấp lại đúng điểm đó trên mô hình để chọn lớp nằm bên dưới (cơ sâu, xương, khớp).</p>`;
}

function realBoneHtml(id) {
  const m = body.model.measurements;
  const parts = body.bones.filter((b) => b.userData.id === id && b.userData.side >= 0).map((b) => b.userData.name);
  const names = [...new Set(parts)];
  let rows = '';
  if (id === 'femur' || id === 'pelvis') {
    rows = `<tr><td>Bán kính chỏm xương đùi (fit mặt cầu)</td><td>${m.femoralHead.radiusMm} mm</td></tr>
      <tr><td>Sai số fit (RMS)</td><td>${m.femoralHead.rmsMm} mm</td></tr>
      <tr><td>Lệch tâm ổ cối ↔ tâm chỏm xương đùi</td><td>${m.femoralHead.acetabulumOffsetMm} mm</td></tr>
      <tr><td>Bán kính lồi cầu đùi (trong / ngoài)</td><td>${m.condyleRadiiMm.join(' / ')} mm</td></tr>
      <tr><td>Chiều dài đùi (tâm háng → tâm gối)</td><td>${m.segmentLengthsMm.thigh} mm</td></tr>`;
  } else if (id === 'humerus' || id === 'scapula') {
    rows = `<tr><td>Bán kính chỏm xương cánh tay (fit mặt cầu)</td><td>${m.humeralHead.radiusMm} mm</td></tr>
      <tr><td>Sai số fit (RMS)</td><td>${m.humeralHead.rmsMm} mm</td></tr>
      <tr><td>Lệch tâm ổ chảo ↔ tâm chỏm</td><td>${m.humeralHead.glenoidOffsetMm} mm</td></tr>
      <tr><td>Chiều dài cánh tay (tâm vai → tâm khuỷu)</td><td>${m.segmentLengthsMm.upperArm} mm</td></tr>`;
  } else if (id === 'tibia_fibula') {
    rows = `<tr><td>Chiều dài cẳng chân (tâm gối → tâm cổ chân)</td><td>${m.segmentLengthsMm.shank} mm</td></tr>`;
  } else if (id === 'radius_ulna') {
    rows = `<tr><td>Chiều dài cẳng tay (tâm khuỷu → tâm cổ tay)</td><td>${m.segmentLengthsMm.forearm} mm</td></tr>`;
  }
  return `<div class="info-section"><h4>Mô hình xương thật</h4>
    <p style="font-size:13px;color:var(--muted)">Hình dạng từ BodyParts3D (dữ liệu chụp cơ thể người thật, cao ${m.statureM} m), © DBCLS, giấy phép CC BY-SA 2.1 JP.
    ${names.length > 1 ? `Gồm ${names.length} bộ phận.` : ''}</p>
    ${rows ? `<table class="rom-table">${rows}</table><p class="hint" style="margin-top:6px">Tâm khớp của khung xương được tính từ chính các bề mặt xương này.</p>` : ''}</div>`;
}

/** Where the muscle's 3D shape comes from and what the two drawing styles mean. */
function realMuscleHtml(sel) {
  const parts = [...new Set(body.realMuscles?.meshes.filter((m) => m.userData.id === sel.id).map((m) => m.userData.name) || [])];
  if (!parts.length) return '';
  const shown = body.muscleStyle === 'real';
  return `<div class="info-section"><h4>Hình 3D</h4>
    <p style="font-size:13px;color:var(--muted)">${
      shown
        ? `Bề mặt cơ thật từ BodyParts3D (cùng người mẫu với khung xương)${parts.length > 1 ? `, ghép từ ${parts.length} phần (đầu / bó cơ)` : ''}.`
        : 'Đang vẽ dạng ống theo đường lực của cơ (đường dùng để tính độ dài, cánh tay đòn và lực).'
    }
    Ở tab Asana và Chủ đề cơ luôn được vẽ dạng ống: mesh cơ thật chưa biến dạng đúng khi khớp gập sâu.</p></div>`;
}

/** Moment arms in the anatomical position and strength of a muscle (anatomy mode). */
function mechanicsHtml(sel) {
  const def = body.model.muscles.find((m) => m.id === sel.id);
  if (!def) return '';
  const rows = momentArmRows(sel.id, sel.side || 'L');
  const st = MUSCLE_STRENGTH[sel.id];
  const fmax = fibreStrength(def);
  const total = Math.round(fmax.reduce((a, b) => a + b, 0) / 10) * 10;
  const parts = st && st.names ? ` (${st.names.map((n, i) => `${n} ${Math.round(fmax[i] / 10) * 10} N`).join(', ')})` : '';
  return `<div class="info-section"><h4>Cơ học (mô hình)</h4>
    ${rows.length ? `<p class="hint" style="margin:0 0 4px">Cánh tay đòn ở tư thế giải phẫu – khoảng cách hiệu dụng từ đường kéo của cơ tới tâm khớp (= −dL/dθ). Cơ càng xa tâm khớp càng tạo mô-men lớn.</p>
    <table class="rom-table arm-table">${rows.slice(0, 6).join('')}</table>` : ''}
    <p class="hint" style="margin-top:6px">Sức co tối đa ước tính: <b>${total} N</b>${esc(parts)} – theo thiết diện sinh lý (PCSA) trong các mô hình cơ xương đã công bố.</p></div>`;
}

function asanasUsingMuscle(id) {
  const out = { contract: [], stretch: [], stabilize: [] };
  for (const a of ASANAS) {
    if (a.hidden || a.flow) continue;
    for (const role of Object.keys(out)) {
      if (a.roles[role].some((k) => splitSide(k).id === id)) out[role].push(a);
    }
  }
  return out;
}
function usedHtml(used) {
  const rows = Object.entries(used)
    .filter(([, list]) => list.length)
    .map(
      ([role, list]) => `<div class="role-block"><div class="role-head"><i class="sw ${role}"></i>${ROLE_LABEL[role]}</div>
      <div class="role-tags">${list.map((a) => `<button class="tag ${role}" data-goto-asana="${a.id}">${esc(a.sanskrit)}</button>`).join('')}</div></div>`,
    )
    .join('');
  return rows ? `<div class="info-section"><h4>Trong các asana</h4>${rows}</div>` : '';
}

$('#info').addEventListener('click', (e) => {
  const go = e.target.closest('[data-goto-asana]');
  if (go) {
    state.asanaId = go.dataset.gotoAsana;
    setMode('asana');
    return;
  }
  const tag = e.target.closest('[data-muscle]');
  if (tag) {
    const { id, side } = splitSide(tag.dataset.muscle);
    const same = state.selection && state.selection.id === id && state.selection.side === side;
    select(same ? null : { kind: 'muscle', id, side });
    return;
  }
  if (e.target.closest('.sc-close')) {
    select(null);
    return;
  }
  const vchip = e.target.closest('[data-variant]');
  if (vchip) {
    loadAsana(state.asanaId, parseInt(vchip.dataset.variant, 10), { keepCamera: true });
    return;
  }
  if (e.target.closest('[data-compare]')) {
    state.compare = compareVariants();
    renderAsanaInfo();
    return;
  }
  const step = e.target.closest('[data-step]');
  if (step) {
    anim.seekStep(parseInt(step.dataset.step, 10));
    anim.playing = false;
    syncPlayButton();
  }
});

$('#info').addEventListener('change', (e) => {
  if (e.target.id === 'phys-friction') {
    physics.friction = e.target.checked;
    if (state.compare) state.compare = compareVariants();
    renderAsanaInfo();
  } else if (e.target.id === 'subj-mass') {
    const v = THREE.MathUtils.clamp(parseFloat(e.target.value) || 60, 30, 150);
    physics.setSubject({ mass: v });
    saveSubject();
    if (state.compare) state.compare = compareVariants();
    renderAsanaInfo();
  } else if (e.target.id === 'subj-sex') {
    physics.setSubject({ sex: e.target.value });
    saveSubject();
    anim.clearCache(); // balance depends on the segment mass distribution
    if (state.compare) state.compare = null;
    loadAsana(state.asanaId, state.variant, { keepCamera: true });
  }
});
// hovering a joint-load row highlights the muscles that must supply that moment
$('#info').addEventListener('mouseover', (e) => {
  const row = e.target.closest('[data-load-muscles]');
  const key = row ? `${row.dataset.loadMuscles}|${row.dataset.side}` : null;
  if (key === state.hoverLoad) return;
  state.hoverLoad = key;
  applyVisuals();
});

// ---------------------------------------------------------------- asana list
function renderCategoryChips() {
  $('#asana-cats').innerHTML = CATEGORIES.map((c) => `<button class="chip${c === state.category ? ' active' : ''}" data-cat="${c}">${c}</button>`).join('');
}
$('#asana-cats').addEventListener('click', (e) => {
  const b = e.target.closest('.chip');
  if (!b) return;
  state.category = b.dataset.cat;
  renderCategoryChips();
  renderAsanaList();
});
$('#asana-search').addEventListener('input', renderAsanaList);

const thumbs = {};
function renderAsanaList() {
  const q = norm($('#asana-search').value.trim());
  const items = ASANAS.filter(
    (a) => !a.hidden && (state.category === 'Tất cả' || a.category === state.category) && (!q || norm(`${a.sanskrit} ${a.vi} ${a.en}`).includes(q)),
  );
  $('#asana-list').innerHTML =
    items
      .map(
        (a) => `<button class="asana-card${a.id === state.asanaId ? ' active' : ''}" data-asana="${a.id}">
      <span class="ac-icon">${thumbs[a.id] ? `<img src="${thumbs[a.id]}" alt="" width="44" height="44" />` : ''}</span>
      <span><div class="ac-title">${esc(a.sanskrit)}</div>
      <div class="ac-sub">${esc(a.vi)} <span class="badge${a.flow ? ' flow' : ''}">${a.flow ? 'Chuỗi' : esc(a.level)}</span></div></span>
    </button>`,
      )
      .join('') || '<p class="empty-note" style="padding:8px">Không tìm thấy asana.</p>';
}
$('#asana-list').addEventListener('click', (e) => {
  const b = e.target.closest('.asana-card');
  if (!b) return;
  loadAsana(b.dataset.asana);
  closeDrawers();
});

// ---------------------------------------------------------------- asana loading & roles
function targetPose(a) {
  return a.steps[a.steps.length - 1].pose;
}
function stepsFor(a, variant) {
  const v = variant > 0 && a.variants ? a.variants[variant - 1] : null;
  if (!v) return a.steps;
  const target = targetPose(a);
  return a.steps.map((s) => (s.pose === target ? { ...s, pose: v.pose } : s));
}

function loadAsana(id, variant = 0, { keepCamera = false } = {}) {
  const a = ASANA_BY_ID[id];
  if (!a) return;
  if (id !== state.asanaId) state.compare = null;
  state.asanaId = id;
  state.variant = a.variants && variant <= a.variants.length ? variant : 0;
  state.selection = null;
  state.lastStep = -1;
  anim.setSequence(stepsFor(a, state.variant), { loop: a.loop === 'pingpong' ? 'pingpong' : 'cycle' });
  anim.playing = a.loop !== 'static';
  if (!a.flow && a.loop !== 'static') {
    // start on the finished pose so teachers immediately see it, then keep moving
    anim.seekStep(Math.floor(anim.steps.length / 2));
  }
  if (!keepCamera) frameAsana(a);
  state.phys = physics.compute();
  updateActivation(true);
  renderTimelineMarks();
  renderAsanaList();
  renderAsanaInfo();
  syncPlayButton();
  applyVisuals();
  updateHash();
}

function frameAsana(a) {
  const box = new THREE.Box3();
  const p = new THREE.Vector3();
  const t0 = anim.time;
  const keySteps = anim.steps.map((_, i) => i);
  for (const i of keySteps) {
    const s = anim.steps[i];
    anim.seek(s.start + s.moveDur + 0.001);
    for (const name in body.rig.joints) box.expandByPoint(body.rig.joints[name].getWorldPosition(p));
    for (const c of body.rig.contacts) box.expandByPoint(body.rig.worldPoint(c.seg, c.local, p));
  }
  anim.seek(t0);
  const c = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const extent = Math.max(size.y * 1.1, size.x, size.z * 0.9, 0.9);
  const wide = size.x > size.z * 1.2;
  viewer.mat.position.set(c.x, -0.002, c.z);
  viewer.mat.rotation.y = wide ? Math.PI / 2 : 0;
  const dir = a.view || (size.y < 1.05 ? [1, 0.45, 0.45] : wide ? [0.25, 0.22, 1] : [0.75, 0.25, 1.1]);
  viewer.flyTo([c.x, c.y, c.z], dir, extent * 2.1 + 0.6, 0.9);
}

/** role map for a step: `${id}|${side}` -> role */
function roleMapFor(stepIndex) {
  const a = ASANA_BY_ID[state.asanaId];
  const step = anim.steps[stepIndex];
  let roles = a.roles;
  if (a.flow) {
    const src = step && step.roles ? ASANA_BY_ID[step.roles] : null;
    roles = src ? src.roles : { contract: [], stretch: [], stabilize: [] };
  }
  const map = new Map();
  const put = (role, generic) => {
    for (const k of roles[role] || []) {
      const { id, side } = splitSide(k);
      if (generic === !!side) continue;
      for (const s of side ? [side] : ['L', 'R']) map.set(`${id}|${s}`, role);
    }
  };
  for (const generic of [true, false]) for (const role of ['stretch', 'stabilize', 'contract']) put(role, generic);
  return { map, roles };
}

function currentRoles() {
  return roleMapFor(anim.currentStep);
}

function focusJoints() {
  const a = ASANA_BY_ID[state.asanaId];
  const set = new Set();
  for (const [key] of a.joints || []) {
    const { id, side } = splitSide(key);
    for (const s of side ? [side] : ['L', 'R', '']) set.add(`${id}|${s}`);
  }
  return set;
}

// ---------------------------------------------------------------- asana info panel
function renderAsanaInfo() {
  const a = ASANA_BY_ID[state.asanaId];
  const { roles } = currentRoles();
  const sel = state.selection;
  const roleBlocks = ['contract', 'stretch', 'stabilize']
    .map((role) => {
      const list = roles[role] || [];
      const tags = list
        .map((k) => {
          const { id, side } = splitSide(k);
          const m = MUSCLES[id];
          if (!m) return '';
          const active = sel && sel.id === id && sel.side === side;
          return `<button class="tag ${role}${active ? ' active' : ''}" data-muscle="${k}">${esc(m.name)}${side ? ` <small>(${side === 'L' ? 'T' : 'P'})</small>` : ''}<span class="len" data-len="${k}"></span></button>`;
        })
        .join('');
      return `<div class="role-block"><div class="role-head"><i class="sw ${role}"></i>${ROLE_LABEL[role]}</div>
        <div class="role-tags">${tags || '<span class="empty-note">—</span>'}</div></div>`;
    })
    .join('');

  let selected = '';
  if (sel && sel.kind === 'muscle' && MUSCLES[sel.id]) {
    const m = MUSCLES[sel.id];
    selected = `<div class="selected-card"><button class="sc-close" aria-label="Đóng">✕</button>
      <div class="sc-title">${esc(m.name)}${sel.side ? ` <small class="pill side">${SIDE_LABEL[sel.side]}</small>` : ''}</div>
      <div class="info-latin">${esc(m.latin)}</div>
      <div class="len-bar"><i id="sel-len-bar"></i></div>
      <div class="hint">Độ dài so với Tadasana: <b id="sel-len">—</b></div>
      <div class="hint" id="sel-act" style="margin-top:6px"></div>
      <table class="rom-table arm-table" id="sel-arms" style="font-size:13px;margin-top:4px"></table>
      <p style="font-size:13.5px;line-height:1.5;margin:8px 0 0"><b>Chức năng:</b> ${esc(m.action)}</p>
      <p style="font-size:13.5px;line-height:1.5;margin:6px 0 0;color:var(--muted)">${esc(m.yoga)}</p></div>`;
  }

  const steps = a.flow
    ? `<div class="info-section"><h4>Các bước</h4><ol class="steps-list">${anim.steps
        .map((s, i) => (s.label ? `<li data-step="${i}">${esc(s.label)}</li>` : ''))
        .join('')}</ol></div>`
    : '';
  const joints = (a.joints || []).length
    ? `<div class="info-section"><h4>Khớp chính</h4><ul>${a.joints
        .map(([k, t]) => {
          const { id, side } = splitSide(k);
          const j = JOINTS[id];
          return `<li><b>${esc(j ? j.name : id)}${side ? ` (${SIDE_LABEL[side]})` : ''}:</b> ${esc(t)}</li>`;
        })
        .join('')}</ul></div>`
    : '';
  const list = (title, arr, cls = '') =>
    arr && arr.length ? `<div class="info-section ${cls}"><h4>${title}</h4><ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';

  $('#info').innerHTML = `<div class="info-kicker">${esc(a.category)} · ${esc(a.level)}</div>
    <div class="info-title">${esc(a.sanskrit)}</div>
    <div class="info-latin">${esc(a.vi)} · ${esc(a.en)}</div>
    ${selected}
    ${physicsSectionHtml(a)}
    <div class="info-section"><h4>Cơ được tác động${a.flow ? ' (bước hiện tại)' : ''}</h4>${roleBlocks}
      <p class="hint" style="margin-top:8px">Nhấp vào tên cơ hoặc trực tiếp trên mô hình để xem chi tiết. Số % = độ dài cơ hiện tại so với Tadasana.</p></div>
    ${steps}
    ${joints}
    ${list('Hướng dẫn (cue)', a.cues, 'yoga-note')}
    ${list('Lợi ích', a.benefits)}
    ${list('Lưu ý & chống chỉ định', a.cautions, 'caution')}`;
  updateLiveNumbers(true);
}

function physicsSectionHtml(a) {
  const variants = a.variants
    ? `<div class="chips variant-chips">${['Chuẩn', ...a.variants.map((v) => v.label)]
        .map((l, i) => `<button class="chip${i === state.variant ? ' active' : ''}" data-variant="${i}">${esc(l)}</button>`)
        .join('')}</div>`
    : '';
  const compare = a.variants
    ? `<button class="ghost-btn small" data-compare>${state.compare ? 'Cập nhật bảng so sánh' : 'So sánh tải giữa các biến thể'}</button>
       <div id="ph-compare">${state.compare || ''}</div>`
    : '';
  return `<div class="info-section phys-card">
    <h4>Cơ sinh học · tải trọng tĩnh</h4>
    <div class="subject-row">
      <label>Cân nặng <input type="number" id="subj-mass" min="30" max="150" step="1" value="${physics.mass}" /> kg</label>
      <label>Tỷ lệ cơ thể <select id="subj-sex"><option value="f"${physics.sex === 'f' ? ' selected' : ''}>Nữ</option><option value="m"${physics.sex === 'm' ? ' selected' : ''}>Nam</option></select></label>
    </div>
    ${variants}
    <label class="check-row" style="margin:0 0 10px"><input type="checkbox" id="phys-friction"${physics.friction ? ' checked' : ''} />
      <span>Tính ma sát với thảm <small>(đẩy/kéo sàn theo chiều ngang)</small></span></label>
    <div class="phys-stats">
      <div><span>Trọng tâm</span><b id="ph-com">—</b></div>
      <div><span>Biên ổn định</span><b id="ph-margin">—</b></div>
    </div>
    <div class="phys-sub">Phân bố trọng lượng lên sàn</div>
    <div id="ph-support"></div>
    <div class="phys-sub">Tải khớp · mô-men cơ phải tạo ra</div>
    <div id="ph-loads"></div>
    <div class="phys-sub">Mức hoạt động cơ · ước lượng bằng mô hình <span class="exp-pill" title="Chưa đối chiếu với đo EMG thật">thử nghiệm</span></div>
    <div id="ph-act"></div>
    ${compare}
    <p class="hint">Tính từ tư thế trên mô hình: khối lượng từng đoạn cơ thể theo de Leva (1996), cân bằng tĩnh (ΣF = 0, ΣM = 0). Khi có nhiều điểm tựa, lực đỡ từ sàn (cả lực đứng và ma sát) được chọn sao cho tổng tải khớp nhỏ nhất – người tập "thả" trọng lượng vào điểm tựa một cách khéo léo, nên tải hiển thị là mức thấp.</p>
    <p class="hint"><b>Thử nghiệm – chưa đối chiếu với đo EMG thật.</b> Mức hoạt động cơ: mỗi bó cơ có cánh tay đòn (tính giải tích từ đường đi của cơ, có bao quanh khớp) và sức tối đa theo thiết diện sinh lý; tối ưu tĩnh chọn tổ hợp lực cơ cân bằng mọi mô-men khớp với tổng bình phương mức hoạt động nhỏ nhất (Crowninshield &amp; Brand 1981). Kiểu co lấy từ chiều thay đổi độ dài cơ khi chuyển động. Mô hình chưa tính sức căng thụ động của cơ bị kéo giãn và chưa có một số cơ sâu, nên đây là ước lượng xu hướng – không thay thế đo EMG.</p>
  </div>`;
}

const LOAD_SCALE = 150; // N·m shown as a full bar (fixed so variants are comparable)
function renderPhysicsLive() {
  const r = state.phys;
  if (!r || !$('#ph-loads')) return;
  $('#ph-com').textContent = `${Math.round(r.com.y * 100)} cm từ sàn`;
  const m = $('#ph-margin');
  const cm = r.margin * 100;
  // static analysis is exact only while a pose is held; in-between frames are not balanced
  const { index, alpha } = anim.locate(anim.time);
  const moving = index > 0 && alpha < 1;
  // a base that is only a line or a point (sit bones in Navasana): balancing right on it is the pose
  const narrow = r.hull.length < 3 && cm > -0.5;
  const ok = cm >= 0 || narrow;
  const status = moving ? 'đang chuyển tư thế' : narrow ? 'thăng bằng trên chân đế hẹp' : cm >= 0 ? 'ổn định' : 'mất cân bằng';
  const cmTxt = narrow ? '0.0' : `${cm >= 0 ? '+' : ''}${cm.toFixed(1)}`;
  m.textContent = isFinite(cm) ? `${cmTxt} cm · ${status}` : '—';
  m.className = moving ? '' : ok ? 'ok' : 'bad';
  $('#ph-support').innerHTML = r.support
    .map(
      (g) =>
        `<div class="bar-row"><span>${esc(g.label)}${g.shear >= 3 ? ` <small class="shear" title="Lực ngang (ma sát) tính theo % trọng lượng">↔ ${Math.round(g.shear)}%</small>` : ''}</span><span class="bar"><i style="width:${Math.min(g.pct, 100)}%;background:var(--stabilize)"></i></span><b>${Math.round(g.pct)}%</b></div>`,
    )
    .join('');
  $('#ph-loads').innerHTML = r.joints
    .filter((j) => j.total >= 3 && j.demands.length)
    .slice(0, 8)
    .map((j) => {
      const d = j.demands[0];
      const w = Math.min(j.total / LOAD_SCALE, 1) * 100;
      return `<div class="load-row" data-load-muscles="${d.muscles.join(',')}" data-side="${j.side}">
        <div class="bar-row"><span>${esc(j.name)}</span><span class="bar"><i style="width:${w}%"></i></span><b>${Math.round(j.total)} N·m</b></div>
        <div class="lr-need">→ ${esc(d.label)}${j.demands[1] && j.demands[1].value > 0.35 * d.value ? ` · ${esc(j.demands[1].label.split(' (')[0])}` : ''}</div>
      </div>`;
    })
    .join('') || '<p class="empty-note">Gần như không có tải đáng kể.</p>';
  renderActivationLive();
  const hud = $('#phys-hud');
  if (hud) {
    const top = r.joints.find((j) => j.demands.length);
    const topAct = state.act ? [...state.act.muscles.values()].sort((a, b) => b.a - a.a).find((m) => m.a >= 0.05) : null;
    hud.innerHTML = `<div><i class="dot com"></i>Trọng tâm · biên <b class="${moving ? '' : ok ? 'ok' : 'bad'}">${cmTxt} cm</b>${moving ? ' <small>(đang chuyển)</small>' : narrow ? ' <small>(thăng bằng trên chân đế hẹp)</small>' : ''}</div>
      <div><i class="dot grf"></i>${r.support.slice(0, 4).map((g) => `${esc(g.label)} <b>${Math.round(g.pct)}%</b>`).join(' · ')}</div>
      ${top ? `<div><i class="dot load"></i>Tải lớn nhất: ${esc(top.name)} <b>${Math.round(top.total)} N·m</b></div>` : ''}
      ${topAct && state.colorMode === 'act' ? `<div><i class="sw ${topAct.type === 'eccentric' ? 'ecc' : topAct.type === 'concentric' ? 'conc' : 'iso'}"></i>Cơ làm việc nhiều nhất <small>(mô hình)</small>: ${esc(MUSCLES[topAct.id]?.name || topAct.id)} <b>${Math.round(topAct.a * 100)}%</b>${topAct.type ? ` <small>(${CONTRACTION[topAct.type].short})</small>` : ''}</div>` : ''}`;
  }
}

/** Most active muscles (both sides merged when they are alike), for the physics card. */
function activationRows(act, n = 8) {
  const byId = new Map();
  for (const m of act.muscles.values()) {
    if (!byId.has(m.id)) byId.set(m.id, []);
    byId.get(m.id).push(m);
  }
  const rows = [];
  for (const [id, list] of byId) {
    const [a, b] = list;
    if (b && Math.abs(a.a - b.a) < 0.04 && a.type === b.type) rows.push({ ...(a.a >= b.a ? a : b), side: '', both: true });
    else rows.push(...list);
  }
  return rows.filter((m) => m.a >= 0.03).sort((a, b) => b.a - a.a).slice(0, n);
}

function renderActivationLive() {
  const el = $('#ph-act');
  const act = state.act;
  if (!el || !act) return;
  const rows = activationRows(act);
  let html =
    rows
      .map((m) => {
        const info = MUSCLES[m.id];
        const pct = Math.round(m.a * 100);
        const sideTxt = m.both ? ' <small>(2 bên)</small>' : ` <small>(${m.side === 'L' ? 'T' : 'P'})</small>`;
        return `<div class="load-row act-row" data-load-muscles="${m.id}" data-side="${m.both ? '' : m.side}">
        <div class="bar-row"><span>${esc(info ? info.name : m.id)}${sideTxt}</span><span class="bar"><i style="width:${Math.min(pct, 100)}%"></i></span><b>${pct}%</b></div>
        <div class="lr-need">${m.part ? `${esc(m.part)} · ` : ''}${Math.round(m.force)} N${m.type ? ` <span class="ctype ${m.type}">${CONTRACTION[m.type].label}</span>` : ''}</div>
      </div>`;
      })
      .join('') || '<p class="empty-note">Gần như không cơ nào phải làm việc – cơ thể được sàn đỡ.</p>';
  // moments the modelled muscles could not (or should not) carry
  const res = act.reserves.filter((r) => Math.abs(r.value) >= 4).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const merged = [];
  for (const r of res) {
    const { id, side } = splitSide(r.joint);
    const twin = side && merged.find((x) => x.id === id && x.dof === r.dof && x.side !== side && Math.abs(Math.abs(x.value) - Math.abs(r.value)) < 2);
    if (twin) twin.both = true;
    else merged.push({ id, side, dof: r.dof, value: r.value, joint: r.joint });
  }
  if (merged.length) {
    html += `<p class="reserve-note">Phần mô-men do cơ sâu / mô mềm chưa có trong mô hình gánh: ${merged
      .slice(0, 3)
      .map((x) => `<b>${esc(dofLabel(x.both ? x.id : x.joint, x.dof, x.value))}${x.both ? ' (2 bên)' : ''} ${Math.round(Math.abs(x.value))} N·m</b> <span>(${esc(MISSING[x.id] || 'mô mềm')})</span>`)
      .join('; ')}.</p>`;
  }
  // flexion–relaxation: active muscles that are also strongly stretched
  const stretched = rows.find((m) => m.a >= 0.3 && lengthPct(m.id, m.both ? null : m.side) > 12);
  if (stretched) {
    html += `<p class="warn-note">⚠ ${esc(MUSCLES[stretched.id]?.name || stretched.id)} đang bị kéo dài ${Math.round(lengthPct(stretched.id, stretched.both ? null : stretched.side))}%: ngoài thực tế sức căng thụ động của cơ và mô liên kết khi bị kéo giãn gánh một phần tải, nên mức co chủ động ở đây có thể thấp hơn con số mô hình.</p>`;
  }
  el.innerHTML = html;
}

/** Static analysis of each variant of the current asana, as an HTML table. */
function compareVariants() {
  const a = ASANA_BY_ID[state.asanaId];
  if (!a.variants) return '';
  const cols = [{ label: 'Chuẩn', pose: targetPose(a) }, ...a.variants];
  const res = cols.map((c) => {
    body.rig.applyQuats(anim.quatsFor(c.pose));
    body.rig.ground();
    const r = physics.compute();
    r.act = forces.solve(r.moments);
    return r;
  });
  anim.render();
  const byJoint = res.map((r) => Object.fromEntries(r.joints.map((j) => [j.joint, j])));
  const keys = [];
  for (const r of res) for (const j of r.joints.slice(0, 6)) if (!keys.includes(j.joint) && j.total >= 3) keys.push(j.joint);
  const sumSupport = (r, word) => r.support.filter((g) => g.label.startsWith(word)).reduce((x, g) => x + g.pct, 0);
  const cell = (v, base, unit, lowerIsBetter = true) => {
    if (base === undefined || base === v || Math.abs(base) < 1e-6) return `<td>${Math.round(v)}${unit}</td>`;
    const d = ((v - base) / Math.abs(base)) * 100;
    const good = lowerIsBetter ? d < 0 : d > 0;
    return `<td>${Math.round(v)}${unit} <small class="${good ? 'ok' : 'bad'}">${d > 0 ? '+' : ''}${Math.round(d)}%</small></td>`;
  };
  let html = `<table class="cmp-table"><thead><tr><th></th>${cols.map((c) => `<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>`;
  for (const k of keys) {
    const name = (byJoint[0][k] || byJoint[1][k]).name;
    html += `<tr><td>${esc(name)}</td>${res.map((_, i) => cell(byJoint[i][k]?.total ?? 0, i ? byJoint[0][k]?.total ?? 0 : undefined, ' N·m')).join('')}</tr>`;
  }
  for (const [label, word] of [['Tay chịu', 'Bàn tay'], ['Chân chịu', 'Bàn chân'], ['Gối chịu', 'Gối']]) {
    const vals = res.map((r) => sumSupport(r, word));
    if (vals.every((v) => v < 1)) continue;
    html += `<tr><td>${label}</td>${vals.map((v, i) => cell(v, i ? vals[0] : undefined, '%')).join('')}</tr>`;
  }
  // most active muscles (max over the two sides)
  const actOf = (r, id) => Math.max(...['L', 'R'].map((sd) => r.act.muscles.get(`${id}|${sd}`)?.a || 0)) * 100;
  const ids = [];
  for (const r of res) for (const m of activationRows(r.act, 4)) if (!ids.includes(m.id)) ids.push(m.id);
  for (const id of ids.slice(0, 5)) {
    const vals = res.map((r) => actOf(r, id));
    html += `<tr><td>${esc(MUSCLES[id]?.name || id)} <small>hoạt động (mô hình)</small></td>${vals.map((v, i) => cell(v, i ? vals[0] : undefined, '%')).join('')}</tr>`;
  }
  html += `<tr><td>Biên ổn định</td>${res.map((r, i) => cell(r.margin * 100, i ? res[0].margin * 100 : undefined, ' cm', false)).join('')}</tr>`;
  return `${html}</tbody></table><p class="hint">% = chênh lệch so với bản chuẩn (xanh: tải nhẹ hơn / vững hơn).</p>`;
}

let lastLiveUpdate = 0;
function updateLiveNumbers(force = false) {
  const now = performance.now();
  if (!force && now - lastLiveUpdate < 150) return;
  lastLiveUpdate = now;
  for (const el of $$('[data-len]')) {
    const { id, side } = splitSide(el.dataset.len);
    el.textContent = fmtPct(lengthPct(id, side));
  }
  const sel = state.selection;
  const selLen = $('#sel-len');
  if (sel && selLen) {
    const p = lengthPct(sel.id, sel.side);
    selLen.textContent = `${fmtPct(p)} ${p > 3 ? '(đang dài ra / kéo giãn)' : p < -3 ? '(đang ngắn lại)' : '(gần như không đổi)'}`;
    const bar = $('#sel-len-bar');
    const w = Math.min(Math.abs(p) / 40, 1) * 50;
    bar.style.left = p >= 0 ? '50%' : `${50 - w}%`;
    bar.style.width = `${w}%`;
    bar.style.background = p >= 0 ? 'var(--stretch)' : 'var(--contract)';
    const act = state.act;
    const sides = sel.side ? [sel.side] : ['L', 'R'];
    const el = $('#sel-act');
    if (el && act) {
      el.innerHTML = sides
        .map((sd) => {
          const m = act.muscles.get(`${sel.id}|${sd}`);
          if (!m) return '';
          const pct = Math.round(m.a * 100);
          return `<div>Hoạt động (mô hình, thử nghiệm)${sides.length > 1 ? ` (${SIDE_LABEL[sd]})` : ''}: <b>${pct}%</b>${m.part && pct ? ` · ${esc(m.part)}` : ''} · ${Math.round(m.force)} N${m.type ? ` <span class="ctype ${m.type}">${CONTRACTION[m.type].label}</span>` : ''}</div>`;
        })
        .join('');
    }
    const arms = $('#sel-arms');
    if (arms) {
      const rows = momentArmRows(sel.id, sides[0]);
      arms.innerHTML = rows.length ? `<tr><td colspan="2" style="color:var(--muted)">Cánh tay đòn ở tư thế này${sides.length > 1 ? ' (bên trái)' : ''}</td></tr>${rows.slice(0, 4).join('')}` : '';
    }
  }
  renderPhysicsLive();
  // flow step highlight
  const cur = anim.currentStep;
  $$('.steps-list li').forEach((li) => li.classList.toggle('current', parseInt(li.dataset.step, 10) === cur));
}

// ---------------------------------------------------------------- workshop topics
function renderTopicList() {
  $('#topic-list').innerHTML = TOPICS.map(
    (t) => `<button class="asana-card topic-card${t.id === state.topicId ? ' active' : ''}" data-topic="${t.id}">
      <span><div class="ac-title">${esc(t.title)}</div><div class="ac-sub">${esc(t.area)}</div></span>
    </button>`,
  ).join('');
}
$('#topic-list').addEventListener('click', (e) => {
  const b = e.target.closest('[data-topic]');
  if (!b) return;
  loadTopic(b.dataset.topic);
  closeDrawers();
});

/** Muscle lengths in a pose (balanced and grounded like the animator plays it). */
function muscleLengthsIn(pose) {
  body.rig.applyQuats(anim.quatsFor(pose));
  body.rig.ground();
  body.update();
  return new Map(body.muscleSystem.muscles.map((m) => [m, m.length]));
}

function loadTopic(id) {
  const t = TOPIC_BY_ID[id];
  if (!t) return;
  state.topicId = id;
  state.selection = null;
  const [ref, cond] = t.compare;
  state.topicRef = muscleLengthsIn(ref.pose);
  const condLen = muscleLengthsIn(cond.pose);
  const byId = new Map();
  for (const m of body.muscleSystem.muscles) {
    if (!byId.has(m.id)) byId.set(m.id, []);
    byId.get(m.id).push(condLen.get(m) / state.topicRef.get(m) - 1);
  }
  state.topicChange = [...byId].map(([mid, list]) => ({ id: mid, change: list.reduce((a, b) => a + b, 0) / list.length }));
  anim.setSequence(
    [
      { pose: ref.pose, hold: 2 },
      { pose: cond.pose, hold: 2, move: 2, anchor: ['ankle_L', 'ankle_R'] },
    ],
    { loop: 'pingpong' },
  );
  frameTopic(t);
  setTopicPose(state.topicPose);
  renderTopicList();
  updateHash();
}

function frameTopic(t) {
  const pelvis = body.rig.pelvis.getWorldPosition(new THREE.Vector3());
  viewer.mat.position.set(pelvis.x, -0.002, pelvis.z);
  viewer.mat.rotation.y = 0;
  viewer.flyTo([pelvis.x, pelvis.y + 0.02, pelvis.z], t.view || VIEW_DIRS.left, 2.2, 0.9);
}

/** 0 = reference pose, 1 = condition pose, 'auto' = move between the two */
function setTopicPose(p) {
  state.topicPose = p;
  if (p === 'auto') anim.playing = true;
  else {
    anim.seekStep(p);
    anim.playing = false;
  }
  renderTopicInfo();
  applyVisuals();
}

function topicLengthPct(id, side) {
  const list = body.muscleSystem.muscles.filter((m) => m.id === id && (!side || m.side === side));
  if (!list.length) return 0;
  return (list.reduce((a, m) => a + m.length / state.topicRef.get(m), 0) / list.length - 1) * 100;
}

const TOPIC_MIN_CHANGE = 0.01; // muscles that change less than 1 % are left out of the lists
function renderTopicInfo() {
  const t = TOPIC_BY_ID[state.topicId];
  const [ref, cond] = t.compare;
  const sel = state.selection;
  const chips = [
    [0, ref.label],
    [1, cond.label],
    ['auto', '⇄ Chuyển qua lại'],
  ]
    .map(([v, l]) => `<button class="chip${state.topicPose === v ? ' active' : ''}" data-topic-pose="${v}">${esc(l)}</button>`)
    .join('');
  $('#topic-legend-chips').innerHTML = chips;
  const tags = (list, cls) =>
    list
      .map((c) => {
        const active = sel && sel.id === c.id;
        return `<button class="tag ${cls}${active ? ' active' : ''}" data-muscle="${c.id}">${esc(MUSCLES[c.id]?.name || c.id)}<span class="len" data-topic-len="${c.id}"></span></button>`;
      })
      .join('') || '<span class="empty-note">—</span>';
  const shorter = state.topicChange.filter((c) => c.change <= -TOPIC_MIN_CHANGE).sort((a, b) => a.change - b.change);
  const longer = state.topicChange.filter((c) => c.change >= TOPIC_MIN_CHANGE).sort((a, b) => b.change - a.change);

  let selected = '';
  if (sel && sel.kind === 'muscle' && MUSCLES[sel.id]) {
    const m = MUSCLES[sel.id];
    selected = `<div class="selected-card"><button class="sc-close" aria-label="Đóng">✕</button>
      <div class="sc-title">${esc(m.name)}${sel.side ? ` <small class="pill side">${SIDE_LABEL[sel.side]}</small>` : ''}</div>
      <div class="info-latin">${esc(m.latin)}</div>
      <div class="hint">Độ dài so với ${esc(ref.label.toLowerCase())}: <b id="topic-sel-len">—</b></div>
      <p style="font-size:13.5px;line-height:1.5;margin:8px 0 0"><b>Chức năng:</b> ${esc(m.action)}</p>
      <p style="font-size:13.5px;line-height:1.5;margin:6px 0 0;color:var(--muted)">${esc(m.yoga)}</p></div>`;
  }
  const list = (title, arr, cls = '') =>
    arr && arr.length ? `<div class="info-section ${cls}"><h4>${title}</h4><ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
  const asanas = (t.asanas || [])
    .map(([id, note]) => {
      const a = ASANA_BY_ID[id];
      return `<button class="topic-asana" data-goto-asana="${id}"><b>${esc(a.sanskrit)}</b> <span>${esc(a.vi)}</span><small>${esc(note)}</small></button>`;
    })
    .join('');

  $('#info').innerHTML = `<div class="info-kicker">Chủ đề workshop · ${esc(t.area)}</div>
    <div class="info-title">${esc(t.title)}</div>
    <div class="info-latin">${esc(t.en)}</div>
    <div class="chips topic-pose-chips">${chips}</div>
    ${selected}
    <div class="info-section"><p>${esc(t.intro)}</p></div>
    <div class="info-section"><h4>Độ dài cơ: ${esc(cond.label.toLowerCase())} so với ${esc(ref.label.toLowerCase())}</h4>
      <div class="role-block"><div class="role-head"><i class="sw len-short"></i>Ngắn lại</div><div class="role-tags">${tags(shorter, 'shorter')}</div></div>
      <div class="role-block"><div class="role-head"><i class="sw len-long"></i>Dài ra</div><div class="role-tags">${tags(longer, 'longer')}</div></div>
      <p class="hint" style="margin-top:8px">Tính trực tiếp từ đường đi của cơ trên mô hình 3D (số % cập nhật theo tư thế đang hiển thị). Độ dài không nói lên cơ yếu hay căng cứng.</p></div>
    ${t.sections.map((sec) => list(esc(sec.title), sec.items)).join('')}
    ${asanas ? `<div class="info-section"><h4>Asana liên quan</h4><div class="topic-asanas">${asanas}</div></div>` : ''}
    ${list('Lưu ý & khi nào cần giới thiệu đi khám', t.cautions, 'caution')}
    ${list('Giới hạn của mô hình', t.limits)}`;
  updateTopicNumbers(true);
}

for (const el of [$('#info'), $('#topic-legend')]) {
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-topic-pose]');
    if (!b) return;
    const v = b.dataset.topicPose;
    setTopicPose(v === 'auto' ? 'auto' : parseInt(v, 10));
  });
}

let lastTopicUpdate = 0;
function updateTopicNumbers(force = false) {
  const now = performance.now();
  if (!force && now - lastTopicUpdate < 150) return;
  lastTopicUpdate = now;
  for (const el of $$('[data-topic-len]')) el.textContent = fmtPct(topicLengthPct(el.dataset.topicLen));
  const sel = state.selection;
  const selLen = $('#topic-sel-len');
  if (sel && selLen) selLen.textContent = fmtPct(topicLengthPct(sel.id, sel.side));
  const { index, alpha } = anim.locate(anim.time);
  const moving = index > 0 && alpha < 1;
  const t = TOPIC_BY_ID[state.topicId];
  $('#topic-state').textContent = moving ? 'Đang chuyển…' : t.compare[anim.currentStep % 2].label;
}

const TOPIC_LEN_SCALE = 0.06; // a 6 % length change gives the full colour
function animateTopicVisuals(time) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 4.2);
  const sel = state.selection;
  for (const ms of body.muscleSystem.muscles) {
    const mat = ms.mesh.material;
    const isSel = sel && ms.id === sel.id && (!sel.side || ms.side === sel.side);
    const ref = state.topicRef.get(ms);
    const d = ref ? THREE.MathUtils.clamp((ms.length / ref - 1) / TOPIC_LEN_SCALE, -1, 1) : 0;
    tmpColor.copy(LEN_MID).lerp(d > 0 ? LEN_LONG : LEN_SHORT, Math.abs(d));
    mat.color.copy(tmpColor);
    mat.opacity = isSel || Math.abs(d) >= 0.15 ? 1 : 0.22;
    mat.depthWrite = mat.opacity > 0.95;
    mat.emissive.copy(tmpColor).multiplyScalar(0.2 * Math.abs(d));
    if (isSel) mat.emissive.lerp(SELECT_EMISSIVE, 0.25 + 0.2 * pulse);
  }
}

// ---------------------------------------------------------------- visuals
function applyVisuals() {
  body.resetColors({ muscleOpacity: state.mode === 'anatomy' ? state.muscleOpacity : 1 });
  const sel = state.selection;
  const selMeshes = new Set(meshesFor(sel));

  if (state.mode === 'anatomy') {
    for (const j of body.jointMarkers) j.visible = state.layers.joints;
    if (sel) {
      for (const m of selMeshes) {
        if (sel.kind === 'bone') {
          m.material.color.set('#ffc94d');
          m.material.emissive.set('#b8860b').multiplyScalar(0.45);
        } else if (sel.kind === 'muscle') {
          m.material.color.set('#ff6b4a');
          m.material.emissive.set('#ff3b1f').multiplyScalar(0.35);
          m.material.opacity = 1;
          m.material.depthWrite = true;
        } else {
          m.material.color.set('#ffd84a');
          m.material.emissive.set('#ffd84a').multiplyScalar(0.6);
          m.scale.setScalar(1.45);
        }
      }
      // fade the other muscles so the selection stands out; they stay above the viewer's
      // click-through opacity (CLICK_THROUGH_OPACITY) so they can still be clicked
      const fade = 0.28;
      for (const m of body.muscles) {
        if (selMeshes.has(m)) continue;
        m.material.opacity = Math.min(m.material.opacity, fade);
        m.material.depthWrite = false;
      }
    }
    return;
  }

  if (state.mode === 'topic') {
    const t = TOPIC_BY_ID[state.topicId];
    const focus = new Set(t.joints || []);
    for (const j of body.jointMarkers) {
      const on = focus.has(j.userData.id);
      j.visible = on;
      if (on) {
        j.material.color.set('#7ff5e4');
        j.material.emissive.set('#39c6b5').multiplyScalar(0.6);
        j.scale.setScalar(1.25);
      }
    }
    const bones = new Set(t.bones || []);
    for (const b of body.bones) {
      if (!bones.has(b.userData.id)) continue;
      b.material.color.set('#ffd98a');
      b.material.emissive.set('#b8860b').multiplyScalar(0.25);
    }
    animateVisuals(0);
    return;
  }

  // ---- asana mode
  const { map } = currentRoles();
  const focus = focusJoints();
  for (const j of body.jointMarkers) {
    const on = focus.has(`${j.userData.id}|${j.userData.side}`);
    j.visible = on;
    if (on) {
      j.material.color.set('#7ff5e4');
      j.material.emissive.set('#39c6b5').multiplyScalar(0.6);
      j.scale.setScalar(1.25);
    }
  }
  for (const ms of body.muscleSystem.muscles) {
    const mat = ms.mesh.material;
    const role = map.get(`${ms.id}|${ms.side}`);
    ms.mesh.userData.role = role && state.roleFilter[role] ? role : null;
    if (state.colorMode === 'roles') {
      if (ms.mesh.userData.role) {
        mat.color.copy(ROLE_COLORS[role]);
        mat.opacity = 1;
        mat.depthWrite = true;
      } else {
        mat.color.copy(DIM_MUSCLE);
        mat.opacity = 0.16;
        mat.depthWrite = false;
      }
    }
    if (selMeshes.has(ms.mesh)) {
      mat.opacity = 1;
      mat.depthWrite = true;
    }
  }
  animateVisuals(0);
}

const tmpColor = new THREE.Color();
const LOAD_HOT = new THREE.Color('#ff7a2f');
const LOAD_COLOR_SCALE = 80; // N·m that saturates the "Theo tải" colour
// spine muscles are driven by trunk joints on both sides; limb muscles only by their own side
const SIDED_MUSCLE_JOINT = (id) =>
  !['rectus_abdominis', 'external_oblique', 'erector_spinae', 'quadratus_lumborum', 'rhomboids', 'sternocleidomastoid', 'trapezius', 'levator_scapulae'].includes(id);
/** muscle|side -> 0..1: share of the largest joint moment that muscle group must resist */
let loadIntensity = new Map();
function computeLoadIntensity(r) {
  const out = new Map();
  if (!r) return out;
  for (const j of r.joints) {
    for (const d of j.demands) {
      const k = d.value / LOAD_COLOR_SCALE;
      for (const id of d.muscles) {
        for (const side of j.side && SIDED_MUSCLE_JOINT(id) ? [j.side] : ['L', 'R']) {
          const key = `${id}|${side}`;
          out.set(key, Math.max(out.get(key) || 0, k));
        }
      }
    }
  }
  return out;
}
const LEN_SHORT = new THREE.Color('#ff3b2f');
const LEN_LONG = new THREE.Color('#2f8fff');
const LEN_MID = new THREE.Color('#7d6f6c');
function animateVisuals(time) {
  if (state.mode === 'topic') {
    animateTopicVisuals(time);
    return;
  }
  if (state.mode !== 'asana') return;
  const pulse = 0.5 + 0.5 * Math.sin(time * 4.2);
  const sel = state.selection;
  for (const ms of body.muscleSystem.muscles) {
    const mat = ms.mesh.material;
    const isSel = sel && ms.id === sel.id && (!sel.side || ms.side === sel.side);
    if (state.hoverLoad) {
      const [ids, side] = state.hoverLoad.split('|');
      const hit = ids.split(',').includes(ms.id) && (!side || side === ms.side || !SIDED_MUSCLE_JOINT(ms.id));
      mat.color.copy(hit ? LOAD_HOT : DIM_MUSCLE);
      mat.opacity = hit ? 1 : 0.12;
      mat.depthWrite = hit;
      mat.emissive.copy(hit ? LOAD_HOT : DIM_MUSCLE).multiplyScalar(hit ? 0.2 + 0.3 * pulse : 0);
    } else if (state.colorMode === 'load') {
      const k = loadIntensity.get(`${ms.id}|${ms.side}`) || 0;
      tmpColor.copy(DIM_MUSCLE).lerp(LOAD_HOT, Math.min(1, k * 1.2));
      mat.color.copy(tmpColor);
      mat.opacity = 0.14 + 0.86 * Math.min(1, k * 1.5);
      mat.depthWrite = mat.opacity > 0.95;
      mat.emissive.copy(LOAD_HOT).multiplyScalar(0.3 * k);
    } else if (state.colorMode === 'act') {
      const a = state.act?.muscles.get(`${ms.id}|${ms.side}`);
      const k = a ? Math.min(1, a.a / 0.5) : 0;
      const col = a && a.type ? ACT_COLORS[a.type] : DIM_MUSCLE;
      tmpColor.copy(DIM_MUSCLE).lerp(col, Math.sqrt(k));
      mat.color.copy(tmpColor);
      mat.opacity = isSel ? 1 : 0.14 + 0.86 * Math.min(1, k * 2);
      mat.depthWrite = mat.opacity > 0.95;
      mat.emissive.copy(col).multiplyScalar(0.28 * k);
    } else if (state.colorMode === 'length') {
      const d = THREE.MathUtils.clamp((ms.ratio - 1) / 0.3, -1, 1);
      tmpColor.copy(LEN_MID).lerp(d > 0 ? LEN_LONG : LEN_SHORT, Math.abs(d));
      mat.color.copy(tmpColor);
      mat.opacity = Math.abs(d) < 0.08 && !isSel ? 0.35 : 1;
      mat.depthWrite = mat.opacity > 0.95;
      mat.emissive.copy(tmpColor).multiplyScalar(0.15 * Math.abs(d));
    } else if (ms.mesh.userData.role === 'contract') {
      mat.emissive.copy(ROLE_COLORS.contract).multiplyScalar(0.18 + 0.32 * pulse);
    } else if (ms.mesh.userData.role) {
      mat.emissive.copy(ROLE_COLORS[ms.mesh.userData.role]).multiplyScalar(0.15);
    }
    if (isSel) mat.emissive.lerp(SELECT_EMISSIVE, 0.25 + 0.2 * pulse);
  }
}

// legend controls
$('#color-mode').addEventListener('click', (e) => {
  const b = e.target.closest('.seg');
  if (!b) return;
  state.colorMode = b.dataset.cm;
  $$('#color-mode .seg').forEach((x) => x.classList.toggle('active', x === b));
  $$('.legend-items').forEach((el) => (el.hidden = el.dataset.cm !== state.colorMode));
  applyVisuals();
});
$$('.legend-items input[data-role]').forEach((inp) =>
  inp.addEventListener('change', () => {
    state.roleFilter[inp.dataset.role] = inp.checked;
    applyVisuals();
  }),
);
$$('[data-phys]').forEach((inp) =>
  inp.addEventListener('change', () => overlay.setOptions({ [inp.dataset.phys]: inp.checked })),
);
$('#show-bones-asana').addEventListener('change', (e) => {
  state.showBonesAsana = e.target.checked;
  body.setLayer('bones', e.target.checked);
});

// ---------------------------------------------------------------- player
function renderTimelineMarks() {
  const d = anim.duration || 1;
  $('#timeline-marks').innerHTML = anim.steps
    .map((s, i) => {
      if (i === 0) return '';
      const a = ((s.start + s.moveDur) / d) * 100;
      return `<span class="hold" style="left:${a}%"></span>`;
    })
    .join('');
  $('#player').classList.toggle('static', anim.duration <= 0);
}
function syncPlayButton() {
  $('#play-btn').textContent = anim.playing ? '❚❚' : '▶';
}
$('#play-btn').addEventListener('click', togglePlay);
function togglePlay() {
  anim.playing = !anim.playing;
  syncPlayButton();
}
$('#scrub').addEventListener('input', (e) => {
  anim.playing = false;
  syncPlayButton();
  anim.seek((e.target.value / 1000) * anim.duration);
});
$('#speed').addEventListener('change', (e) => (anim.speed = parseFloat(e.target.value)));
$('#hold-btn').addEventListener('click', () => {
  const a = ASANA_BY_ID[state.asanaId];
  const target = a.flow ? anim.currentStep : Math.floor(anim.steps.length / 2);
  anim.seekStep(Math.max(target, 0));
  anim.playing = false;
  syncPlayButton();
});

function stepLabel() {
  const a = ASANA_BY_ID[state.asanaId];
  const { index, alpha } = anim.locate(anim.time);
  const s = anim.steps[index];
  if (a.flow) {
    const cur = anim.steps[anim.currentStep];
    return cur.label || a.vi;
  }
  if (a.loop === 'static') return `${a.sanskrit} – giữ tư thế`;
  // ping-pong sequence: start → (intermediate steps) → target → … → start
  const ti = Math.floor(anim.steps.length / 2);
  if (alpha < 1 && index > 0) return index <= ti ? `Đi vào ${a.sanskrit}…` : 'Trở về tư thế ban đầu…';
  if (index === ti) return `${a.sanskrit} – giữ tư thế, thở đều`;
  return index === 0 || index === anim.steps.length - 1 ? 'Tư thế bắt đầu' : index < ti ? `Đi vào ${a.sanskrit}…` : 'Trở về tư thế ban đầu…';
}

// ---------------------------------------------------------------- views
const VIEW_DIRS = {
  front: [0, 0.12, 1],
  back: [0, 0.12, -1],
  left: [1, 0.12, 0],
  right: [-1, 0.12, 0],
  top: [0.001, 1, 0.12],
};
$('.view-buttons').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const v = b.dataset.view;
  if (v === 'reset') {
    if (state.mode === 'asana') frameAsana(ASANA_BY_ID[state.asanaId]);
    else if (state.mode === 'topic') frameTopic(TOPIC_BY_ID[state.topicId]);
    else viewer.flyTo([0, 0.95, 0], [0.45, 0.2, 1], 3.6);
    return;
  }
  const t = viewer.controls.target.toArray();
  const dist = viewer.camera.position.distanceTo(viewer.controls.target);
  viewer.flyTo(t, VIEW_DIRS[v], dist);
});

// ---------------------------------------------------------------- chrome
$$('.mode-tab').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
$('#present-btn').addEventListener('click', togglePresent);
function togglePresent() {
  app.classList.toggle('present');
  $('#present-btn').classList.toggle('active', app.classList.contains('present'));
}
$('#toggle-left').addEventListener('click', () => {
  $('#left-panel').classList.toggle('open');
  $('#right-panel').classList.remove('open');
});
$('#toggle-right').addEventListener('click', () => {
  $('#right-panel').classList.toggle('open');
  $('#left-panel').classList.remove('open');
});
function closeDrawers() {
  $('#left-panel').classList.remove('open');
}

window.addEventListener('keydown', (e) => {
  if (e.target.matches('input[type="search"], input[type="text"], select')) return;
  if (e.key === ' ' && state.mode === 'asana') {
    e.preventDefault();
    togglePlay();
  } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && state.mode === 'asana') {
    const n = anim.steps.length;
    const cur = anim.currentStep;
    anim.seekStep((cur + (e.key === 'ArrowRight' ? 1 : n - 1)) % n);
    anim.playing = false;
    syncPlayButton();
  } else if (e.key === ' ' && state.mode === 'topic') {
    e.preventDefault();
    setTopicPose(state.topicPose === 'auto' ? anim.currentStep % 2 : 'auto');
  } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && state.mode === 'topic') {
    setTopicPose(state.topicPose === 1 ? 0 : 1);
  } else if (e.key === 'p' || e.key === 'P') {
    togglePresent();
  } else if (e.key === 'Escape') {
    select(null);
  }
});

// ---------------------------------------------------------------- URL hash (shareable links)
function updateHash() {
  let h = '';
  if (state.mode === 'asana') h = `#asana/${state.asanaId}`;
  else if (state.mode === 'topic') h = `#topic/${state.topicId}`;
  else if (state.selection) h = `#${state.selection.kind}/${state.selection.id}`;
  if (location.hash !== h) history.replaceState(null, '', h || location.pathname + location.search);
}
function readHash() {
  const [kind, id] = location.hash.replace(/^#/, '').split('/');
  if (kind === 'asana' && ASANA_BY_ID[id]) {
    state.asanaId = id;
    setMode('asana');
    return;
  }
  if (kind === 'topic' && TOPIC_BY_ID[id]) {
    state.topicId = id;
    setMode('topic');
    return;
  }
  setMode('anatomy');
  if ((kind === 'muscle' || kind === 'bone' || kind === 'joint') && infoFor(kind, id)) select({ kind, id, side: null }, { fly: true });
}

// ---------------------------------------------------------------- main loop
let clockTime = 0;
viewer.onTick = (dt) => {
  clockTime += dt;
  if (state.mode === 'topic') {
    anim.tick(dt);
    animateVisuals(clockTime);
    updateTopicNumbers();
    return;
  }
  if (state.mode !== 'asana') return;
  anim.tick(dt);
  const step = anim.currentStep;
  if (step !== state.lastStep) {
    state.lastStep = step;
    if (ASANA_BY_ID[state.asanaId].flow) {
      applyVisuals();
      renderAsanaInfo();
    }
  }
  state.phys = physics.compute();
  updateActivation();
  loadIntensity = computeLoadIntensity(state.phys);
  overlay.update(state.phys, clockTime);
  animateVisuals(clockTime);
  updateLiveNumbers();
  const p = anim.duration > 0 ? anim.time / anim.duration : 0;
  $('#timeline-fill').style.width = `${p * 100}%`;
  if (document.activeElement !== $('#scrub')) $('#scrub').value = Math.round(p * 1000);
  $('#step-label').textContent = stepLabel();
};

// ---------------------------------------------------------------- boot
renderCategoryChips();
renderAsanaList();
renderTopicList();
readHash();
window.addEventListener('hashchange', readHash);

// Skeleton (BodyParts3D), then the asana silhouettes for the list.
function makeThumbnails() {
  const style = body.muscleStyle;
  body.setMuscleStyle('tube'); // thumbnails show asana poses: tubes, as in asana mode
  try {
    const thumbAnim = new Animator(body.rig, () => body.update(), { prepare: balance });
    const maker = new ThumbnailMaker(viewer, body, thumbAnim);
    for (const a of ASANAS) if (!a.hidden) thumbs[a.id] = maker.make(a);
    maker.dispose();
  } catch (err) {
    console.warn('Thumbnail generation failed', err);
  }
  body.setMuscleStyle(style);
  anim.render();
  renderAsanaList();
}
$('#loading').hidden = false;
const bonesLoaded = body.loadBones(`${import.meta.env.BASE_URL}models/bp3d/skeleton.bin`).catch((err) => {
  console.warn('Skeleton unavailable', err);
  $('#loading').textContent = 'Không tải được mô hình xương.';
});
// real muscle surfaces (anatomy mode); without them the muscles stay tubes
const musclesLoaded = body.loadMuscleMeshes(`${import.meta.env.BASE_URL}models/bp3d/muscles.bin`).catch((err) => {
  console.warn('Muscle meshes unavailable', err);
});
Promise.all([bonesLoaded, musclesLoaded]).then(() => {
  body.setMuscleStyle(state.mode === 'anatomy' ? state.muscleStyle : 'tube');
  viewer.pickables = body.pickables;
  applyVisuals();
  if (state.mode === 'anatomy' && state.selection) renderInfo(state.selection);
  if (body.bones.length) $('#loading').hidden = true;
  setTimeout(makeThumbnails, 50);
});

window.__app = { viewer, body, anim, state, loadAsana, setMode, select, physics, forces };
