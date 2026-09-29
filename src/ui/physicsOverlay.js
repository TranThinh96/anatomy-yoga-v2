import * as THREE from 'three';

const COM_COLOR = 0xc77dff;
const OK_COLOR = new THREE.Color('#39c6b5');
const BAD_COLOR = new THREE.Color('#ff5a3c');
const GRF_COLOR = 0xf5b82e;
const MAX_GROUPS = 8;

/**
 * 3-D visualisation of the static analysis: centre of mass + plumb line, base of
 * support polygon on the floor, ground reaction arrows and joint-load spheres.
 */
export class PhysicsOverlay {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.name = 'physics-overlay';
    scene.add(this.group);

    // --- centre of mass
    this.com = new THREE.Group();
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 24, 16),
      new THREE.MeshBasicMaterial({ color: COM_COLOR, depthTest: false, transparent: true, opacity: 0.95 }),
    );
    ball.renderOrder = 10;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.05, 0.005, 8, 40),
      new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true, opacity: 0.85 }),
    );
    ring.renderOrder = 10;
    this.com.add(ball, ring);
    this.comRing = ring;
    this.group.add(this.com);

    this.plumb = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, -1, 0)]),
      new THREE.LineDashedMaterial({ color: COM_COLOR, dashSize: 0.03, gapSize: 0.02, depthTest: false, transparent: true }),
    );
    this.plumb.renderOrder = 9;
    this.group.add(this.plumb);

    this.foot = new THREE.Mesh(
      new THREE.RingGeometry(0.018, 0.032, 32),
      new THREE.MeshBasicMaterial({ color: COM_COLOR, side: THREE.DoubleSide, depthTest: false, transparent: true }),
    );
    this.foot.rotation.x = -Math.PI / 2;
    this.foot.renderOrder = 9;
    this.group.add(this.foot);

    // --- base of support
    this.supportMat = new THREE.MeshBasicMaterial({ color: OK_COLOR, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false });
    this.support = new THREE.Mesh(new THREE.BufferGeometry(), this.supportMat);
    this.support.renderOrder = 3;
    this.group.add(this.support);
    this.outline = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: OK_COLOR, transparent: true, opacity: 0.9 }));
    this.group.add(this.outline);

    // --- ground reaction arrows (one per support group)
    this.arrows = [];
    for (let i = 0; i < MAX_GROUPS; i++) {
      const a = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 0.3, GRF_COLOR, 0.06, 0.04);
      a.line.material.depthTest = false;
      a.cone.material.depthTest = false;
      a.renderOrder = 11;
      a.visible = false;
      this.group.add(a);
      this.arrows.push(a);
    }

    // --- joint load spheres
    this.loadGroup = new THREE.Group();
    this.group.add(this.loadGroup);
    this.loadSpheres = new Map();

    this.show = { com: true, grf: true, loads: true };
    this.setVisible(false);
  }

  setVisible(v) {
    this.group.visible = v;
  }

  setOptions(opts) {
    Object.assign(this.show, opts);
  }

  _sphereFor(key) {
    if (!this.loadSpheres.has(key)) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(1, 20, 14),
        new THREE.MeshBasicMaterial({ color: 0xff7a2f, transparent: true, opacity: 0.35, depthWrite: false }),
      );
      m.renderOrder = 4;
      this.loadGroup.add(m);
      this.loadSpheres.set(key, m);
    }
    return this.loadSpheres.get(key);
  }

  update(res, time = 0) {
    if (!res || !this.group.visible) return;
    const { com, hull, stable, support, joints, W } = res;
    const col = stable ? OK_COLOR : BAD_COLOR;

    // COM
    const showCom = this.show.com;
    this.com.visible = this.plumb.visible = this.foot.visible = showCom;
    this.support.visible = this.outline.visible = showCom;
    if (showCom) {
      this.com.position.copy(com);
      this.comRing.rotation.set(time * 1.5, time, 0);
      const pos = this.plumb.geometry.attributes.position;
      pos.setXYZ(0, com.x, com.y, com.z);
      pos.setXYZ(1, com.x, 0.004, com.z);
      pos.needsUpdate = true;
      this.plumb.computeLineDistances();
      this.plumb.geometry.computeBoundingSphere();
      this.foot.position.set(com.x, 0.005, com.z);
      this.foot.material.color.copy(col);

      // support polygon (a thin strip if the support is a line or point)
      let pts = hull.map((p) => new THREE.Vector2(p.x, p.z));
      if (pts.length === 1) pts = circle(pts[0], 0.02);
      else if (pts.length === 2) pts = strip(pts[0], pts[1], 0.012);
      if (pts.length >= 3) {
        const shape = new THREE.Shape(pts.map((p) => new THREE.Vector2(p.x, -p.y)));
        const g = new THREE.ShapeGeometry(shape);
        g.rotateX(-Math.PI / 2);
        g.translate(0, 0.003, 0);
        this.support.geometry.dispose();
        this.support.geometry = g;
        this.outline.geometry.dispose();
        this.outline.geometry = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, 0.004, p.y)));
      }
      this.supportMat.color.copy(col);
      this.outline.material.color.copy(col);
    }

    // ground reaction arrows
    this.arrows.forEach((a, i) => {
      const g = support[i];
      a.visible = this.show.grf && !!g;
      if (!a.visible) return;
      const len = Math.max(0.05, (g.F.length() / W) * 0.9);
      a.position.set(g.p.x, 0.005, g.p.z);
      a.setDirection(g.F.clone().normalize());
      a.setLength(len, Math.min(0.07, len * 0.4), 0.045);
    });

    // joint loads: sphere radius ~ sqrt(moment)
    const seen = new Set();
    if (this.show.loads) {
      for (const j of joints) {
        if (j.total < 4) continue;
        const s = this._sphereFor(j.joint);
        s.visible = true;
        s.position.copy(j.pos);
        s.scale.setScalar(0.012 + 0.0075 * Math.sqrt(j.total));
        seen.add(j.joint);
      }
    }
    for (const [k, s] of this.loadSpheres) if (!seen.has(k)) s.visible = false;
  }
}

function circle(c, r) {
  return Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return new THREE.Vector2(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r);
  });
}
function strip(a, b, w) {
  const d = new THREE.Vector2().subVectors(b, a).normalize();
  const n = new THREE.Vector2(-d.y, d.x).multiplyScalar(w);
  return [a.clone().add(n), b.clone().add(n), b.clone().sub(n), a.clone().sub(n)];
}
