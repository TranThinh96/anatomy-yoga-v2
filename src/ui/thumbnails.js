import * as THREE from 'three';

/**
 * Renders small silhouette icons of every asana by posing the shared body
 * and rendering it with a flat material into an offscreen renderer.
 */
export class ThumbnailMaker {
  constructor(viewer, body, animator, size = 88) {
    this.viewer = viewer;
    this.body = body;
    this.animator = animator;
    this.size = size;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(2);
    this.renderer.setSize(size, size, false);
    this.renderer.setClearColor(0x000000, 0);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
    this.material = new THREE.MeshBasicMaterial({ color: 0x39c6b5 });
  }

  /** @param steps sequence; renders the "key" step. Returns a data URL. */
  make(asana) {
    const { scene } = this.viewer;
    const body = this.body;
    const anim = this.animator;
    const keyIndex = asana.thumbStep ?? (asana.flow ? 0 : asana.steps.length - 1);
    anim.setSequence(asana.steps.map((s) => ({ ...s })), { loop: 'cycle' });
    anim.seekStep(Math.min(keyIndex, anim.steps.length - 1));
    body.update();

    const box = new THREE.Box3();
    const p = new THREE.Vector3();
    for (const name in body.rig.joints) box.expandByPoint(body.rig.joints[name].getWorldPosition(p));
    for (const c of body.rig.contacts) box.expandByPoint(body.rig.worldPoint(c.seg, c.local, p));
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const extent = Math.max(size.y, Math.hypot(size.x, size.z) * 0.8);
    const dir = new THREE.Vector3(...(asana.thumbView || [1, 0.12, 0.08])).normalize();
    this.camera.position.copy(center).addScaledVector(dir, extent * 2.2 + 0.4);
    this.camera.lookAt(center);

    const hidden = [];
    scene.traverse((o) => {
      if (o.isMesh || o.isLine || o.isGridHelper) {
        const keep = body.bones.includes(o) || body.muscles.includes(o);
        if (!keep && o.visible) {
          hidden.push(o);
          o.visible = false;
        }
      }
    });
    const restore = [];
    for (const m of [...body.bones, ...body.muscles]) {
      if (!m.visible) {
        restore.push(m);
        m.visible = true;
      }
    }
    const env = scene.environment;
    scene.overrideMaterial = this.material;
    scene.environment = null;
    this.renderer.render(scene, this.camera);
    scene.overrideMaterial = null;
    scene.environment = env;
    hidden.forEach((o) => (o.visible = true));
    restore.forEach((o) => (o.visible = false));
    return this.renderer.domElement.toDataURL('image/png');
  }

  dispose() {
    this.renderer.dispose();
  }
}
