import * as THREE from 'three';
import { Viewer } from './viewer.js';
import { Body } from './anatomy/body.js';
import { Animator } from './anatomy/animator.js';
import { ThumbnailMaker } from './ui/thumbnails.js';
import { Physics } from './anatomy/physics.js';
import { PhysicsOverlay } from './ui/physicsOverlay.js';
import { BONES } from './data/bones.js';
import { MUSCLES, MUSCLE_GROUPS } from './data/muscles.js';
import { JOINTS } from './data/joints.js';
import { ASANAS, ASANA_BY_ID, CATEGORIES } from './data/asanas.js';

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
  layers: { bones: true, muscles: true, joints: true },
  lastStep: -1,
  variant: 0, // 0 = standard form, n = asana.variants[n - 1]
  phys: null, // latest static analysis
  compare: null, // variant comparison table (html)
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

// ---------------------------------------------------------------- mode switching
function setMode(mode) {
  state.mode = mode;
  $$('.mode-tab').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  $$('.mode-section').forEach((s) => (s.hidden = s.dataset.for !== mode));
  $('#legend').hidden = mode !== 'asana';
  $('#player').hidden = mode !== 'asana';
  $('#phys-hud').hidden = mode !== 'asana';
  overlay.setVisible(mode === 'asana');
  state.selection = null;
  if (mode === 'anatomy') {
    anim.setSequence([{ pose: 'tadasana', hold: 1 }], { loop: 'static' });
    anim.playing = false;
    for (const [k, v] of Object.entries(state.layers)) body.setLayer(k, v);
    viewer.mat.position.set(0, -0.002, 0);
    viewer.mat.rotation.y = 0;
    viewer.flyTo([0, 0.95, 0], [0.45, 0.2, 1], 3.6);
    renderAnatomyList();
    renderWelcome();
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
$('#real-bones').addEventListener('change', (e) => {
  body.setRealBones(e.target.checked);
  applyVisuals();
  if (state.mode === 'anatomy' && state.selection) renderInfo(state.selection);
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

viewer.onPick = (obj) => {
  if (!obj) {
    if (state.mode === 'anatomy') select(null);
    else if (state.selection) select(null);
    return;
  }
  const { kind, id, side } = obj.userData;
  const s = sideKey(side);
  if (state.mode === 'asana' && kind !== 'muscle') return;
  select({ kind, id, side: s });
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
        <li><span class="k">✦</span><span>Mỗi mục có phần <b>Ứng dụng trong yoga</b> gợi ý cách hướng dẫn học viên.</span></li>
        <li><span class="k">▶</span><span>Chuyển sang tab <b>Asana 3D</b> để xem tư thế chuyển động và các cơ được tác động.</span></li>
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
  $('#info').innerHTML = html;
}

const BP3D_IDS = new Set(['pelvis', 'sacrum', 'femur', 'patella']);
function realBoneHtml(id) {
  const man = body.bp3d;
  if (!man || !body.realBones || !BP3D_IDS.has(id)) return '';
  const m = man.measurements;
  const rows =
    id === 'femur' || id === 'pelvis'
      ? `<table class="rom-table">
          <tr><td>Bán kính chỏm xương đùi (fit mặt cầu)</td><td>${m.L.femoralHeadRadiusMm} / ${m.R.femoralHeadRadiusMm} mm</td></tr>
          <tr><td>Sai số fit (RMS)</td><td>${m.L.sphereFitRmsMm} / ${m.R.sphereFitRmsMm} mm</td></tr>
          <tr><td>Lệch tâm ổ cối ↔ tâm chỏm xương đùi</td><td>${m.L.acetabulumOffsetMm} / ${m.R.acetabulumOffsetMm} mm</td></tr>
          <tr><td>Bán kính lồi cầu đùi (trong / ngoài)</td><td>${m.L.condyleRadiiMm.join(' / ')} mm</td></tr>
        </table>
        <p class="hint" style="margin-top:6px">Số liệu trái / phải. Tâm khớp háng của khung xương được lấy từ các mặt cầu này.</p>`
      : '';
  return `<div class="info-section"><h4>Mô hình xương thật</h4>
    <p style="font-size:13px;color:var(--muted)">Hình dạng xương từ BodyParts3D (dữ liệu chụp cơ thể người thật), © DBCLS, giấy phép CC BY-SA 2.1 JP.</p>
    ${rows}</div>`;
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
    ${compare}
    <p class="hint">Tính từ tư thế trên mô hình: khối lượng từng đoạn cơ thể theo de Leva (1996), cân bằng tĩnh (ΣF = 0, ΣM = 0). Khi có nhiều điểm tựa, lực đứng được chia theo ước lượng; lực ma sát được chọn sao cho tổng tải khớp nhỏ nhất (giả định người tập đẩy sàn khéo léo, nên tải hiển thị là mức thấp). Chưa tính dây chằng và mô mềm (phần tải chúng gánh bị tính hết cho cơ). Số liệu dùng để so sánh xu hướng, không phải số đo lâm sàng.</p>
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
  const status = moving ? 'đang chuyển tư thế' : cm >= 0 ? 'ổn định' : 'mất cân bằng';
  m.textContent = isFinite(cm) ? `${cm >= 0 ? '+' : ''}${cm.toFixed(1)} cm · ${status}` : '—';
  m.className = moving ? '' : cm >= 0 ? 'ok' : 'bad';
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
  const hud = $('#phys-hud');
  if (hud) {
    const top = r.joints.find((j) => j.demands.length);
    hud.innerHTML = `<div><i class="dot com"></i>Trọng tâm · biên <b class="${moving ? '' : cm >= 0 ? 'ok' : 'bad'}">${cm >= 0 ? '+' : ''}${cm.toFixed(1)} cm</b>${moving ? ' <small>(đang chuyển)</small>' : ''}</div>
      <div><i class="dot grf"></i>${r.support.slice(0, 4).map((g) => `${esc(g.label)} <b>${Math.round(g.pct)}%</b>`).join(' · ')}</div>
      ${top ? `<div><i class="dot load"></i>Tải lớn nhất: ${esc(top.name)} <b>${Math.round(top.total)} N·m</b></div>` : ''}`;
  }
}

/** Static analysis of each variant of the current asana, as an HTML table. */
function compareVariants() {
  const a = ASANA_BY_ID[state.asanaId];
  if (!a.variants) return '';
  const cols = [{ label: 'Chuẩn', pose: targetPose(a) }, ...a.variants];
  const res = cols.map((c) => {
    body.rig.applyQuats(anim.quatsFor(c.pose));
    body.rig.ground();
    return physics.compute();
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
  }
  renderPhysicsLive();
  // flow step highlight
  const cur = anim.currentStep;
  $$('.steps-list li').forEach((li) => li.classList.toggle('current', parseInt(li.dataset.step, 10) === cur));
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
      // fade the other muscles so the selection stands out
      const fade = sel.kind === 'muscle' ? 0.28 : 0.18;
      for (const m of body.muscles) {
        if (selMeshes.has(m)) continue;
        m.material.opacity = Math.min(m.material.opacity, fade);
        m.material.depthWrite = false;
      }
    }
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
  const target = anim.steps[Math.floor(anim.steps.length / 2)];
  if (alpha < 1 && index > 0) return s === target ? `Đi vào ${a.sanskrit}…` : 'Trở về tư thế ban đầu…';
  return s === target ? `${a.sanskrit} – giữ tư thế, thở đều` : 'Tư thế bắt đầu';
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
  setMode('anatomy');
  if ((kind === 'muscle' || kind === 'bone' || kind === 'joint') && infoFor(kind, id)) select({ kind, id, side: null }, { fly: true });
}

// ---------------------------------------------------------------- main loop
let clockTime = 0;
viewer.onTick = (dt) => {
  clockTime += dt;
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
readHash();
window.addEventListener('hashchange', readHash);

// Real (BodyParts3D) bones for the pelvis–thigh region.
body
  .loadRealBones(`${import.meta.env.BASE_URL}models/bp3d/`)
  .then(() => {
    viewer.pickables = body.pickables;
    $('#real-bones').disabled = false;
    applyVisuals();
    if (state.mode === 'anatomy' && state.selection) renderInfo(state.selection);
  })
  .catch((err) => {
    console.warn('BodyParts3D bones unavailable', err);
    $('#real-bones').closest('label').hidden = true;
  });

// Asana silhouettes for the list, generated after the first frames.
setTimeout(() => {
  try {
    const thumbAnim = new Animator(body.rig, () => body.update(), { prepare: balance });
    const maker = new ThumbnailMaker(viewer, body, thumbAnim);
    for (const a of ASANAS) if (!a.hidden) thumbs[a.id] = maker.make(a);
    maker.dispose();
  } catch (err) {
    console.warn('Thumbnail generation failed', err);
  }
  anim.render();
  renderAsanaList();
}, 400);

window.__app = { viewer, body, anim, state, loadAsana, setMode, select, physics };
