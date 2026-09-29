import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Meshes drawn at or below this opacity are treated as invisible by picking (clicks reach what is
// behind them). Anything that should stay clickable while dimmed must stay above it.
export const CLICK_THROUGH_OPACITY = 0.2;

export class Viewer {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.55;

    this.camera = new THREE.PerspectiveCamera(35, 1, 0.05, 50);
    this.camera.position.set(1.6, 1.3, 3.6);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.85, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 0.4;
    this.controls.maxDistance = 9;
    this.controls.maxPolarAngle = Math.PI * 0.95;

    const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x3a3230, 0.9);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(2.5, 4, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    const sc = key.shadow.camera;
    sc.left = -2; sc.right = 2; sc.top = 2.5; sc.bottom = -1.5; sc.near = 0.5; sc.far = 12;
    key.shadow.bias = -0.0004;
    key.shadow.radius = 4;
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x9fc6ff, 0.9);
    rim.position.set(-3, 2.5, -3);
    this.scene.add(rim);

    // Floor: yoga mat + soft shadow catcher
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(4, 64),
      new THREE.ShadowMaterial({ opacity: 0.28 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.mat = new THREE.Mesh(
      new THREE.BoxGeometry(0.66, 0.004, 1.9),
      new THREE.MeshStandardMaterial({ color: 0x4f7f7a, roughness: 0.9 }),
    );
    this.mat.position.y = -0.002;
    this.mat.receiveShadow = true;
    this.scene.add(this.mat);
    const grid = new THREE.GridHelper(8, 32, 0x44505e, 0x2d3540);
    grid.position.y = -0.005;
    grid.material.transparent = true;
    grid.material.opacity = 0.5;
    this.scene.add(grid);

    this.raycaster = new THREE.Raycaster();
    this.pickables = [];
    this._pointer = new THREE.Vector2();
    this._down = null;
    this.onPick = null;
    this.onHover = null;
    const el = this.renderer.domElement;
    // only a primary-button / first-finger tap picks: right-drag pans and pinch zooms
    el.addEventListener('pointerdown', (e) => (this._down = e.isPrimary && e.button === 0 ? { x: e.clientX, y: e.clientY } : null));
    el.addEventListener('pointerup', (e) => {
      if (!this._down) return;
      const moved = Math.hypot(e.clientX - this._down.x, e.clientY - this._down.y);
      this._down = null;
      if (moved >= 5) return;
      const stack = this.pickAll(e);
      this.onPick?.(stack[0] ?? null, stack, e);
    });
    el.addEventListener('pointermove', (e) => {
      if (e.buttons) return;
      this.onHover?.(this.pick(e), e);
    });
    el.addEventListener('pointerleave', () => this.onHover?.(null));

    this._camAnim = null;
    this.timer = new THREE.Timer();
    this.onTick = null;
    new ResizeObserver(() => this.resize()).observe(container);
    this.resize();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Everything pickable under the pointer, nearest first. Nearly invisible meshes let clicks through. */
  pickAll(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this._pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this._pointer, this.camera);
    return this.raycaster
      .intersectObjects(this.pickables.filter((o) => o.visible && o.parentVisible !== false), false)
      .map((h) => h.object)
      .filter((o) => isVisible(o) && o.material.opacity > CLICK_THROUGH_OPACITY);
  }

  pick(e) {
    return this.pickAll(e)[0] ?? null;
  }

  /** Smoothly moves the camera. dir is a unit-ish vector from target to camera. */
  flyTo(target, dir, dist = 3.6, dur = 0.8) {
    const t = new THREE.Vector3(...target);
    const d = new THREE.Vector3(...dir).normalize();
    // portrait screens need more distance to fit the body horizontally
    if (this.camera.aspect < 1) dist *= Math.min(1.05 / this.camera.aspect, 1.9);
    this._camAnim = {
      t0: performance.now(),
      dur: dur * 1000,
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toPos: t.clone().addScaledVector(d, dist),
      toTarget: t,
    };
  }

  frame() {
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.1);
    if (this._camAnim) {
      const a = this._camAnim;
      let k = Math.min((performance.now() - a.t0) / a.dur, 1);
      k = 1 - Math.pow(1 - k, 3);
      this.camera.position.lerpVectors(a.fromPos, a.toPos, k);
      this.controls.target.lerpVectors(a.fromTarget, a.toTarget, k);
      if (k >= 1) this._camAnim = null;
    }
    this.onTick?.(dt);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

function isVisible(o) {
  while (o) {
    if (!o.visible) return false;
    o = o.parent;
  }
  return true;
}
