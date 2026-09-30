// Renders every asana (and variant) in its target pose from fixed views, framed on the body,
// with the UI overlays hidden – for reviewing pose quality by eye. Prints the physics summary
// (stability margin, weight distribution, largest joint loads) of each pose.
//   node tools/review-poses.mjs <out-dir> [asana-id …] [--views front,left,top]
//   e.g. node tools/review-poses.mjs /tmp/review trikonasana vrksasana --views front,left,top
// Needs Playwright (as tools/shot.mjs). Hidden asanas (cat / cow) are rendered only when named.
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';
import { ASANAS } from '../src/data/asanas.js';

const args = process.argv.slice(2);
const vi = args.indexOf('--views');
const views = vi >= 0 ? args[vi + 1].split(',') : ['front', 'left'];
const positional = args.filter((a, i) => !a.startsWith('--') && (vi < 0 || i !== vi + 1));
const [out, ...only] = positional;
if (!out) {
  console.log('Usage: node tools/review-poses.mjs <out-dir> [asana-id …] [--views front,left,top]');
  process.exit(1);
}
mkdirSync(out, { recursive: true });

async function playwright() {
  try {
    return await import('playwright');
  } catch {
    const root = execSync('npm root -g').toString().trim();
    return import(pathToFileURL(join(root, 'playwright', 'index.mjs')).href);
  }
}

const server = await createServer({ server: { port: 0 }, logLevel: 'error' });
await server.listen();
const { chromium } = await playwright();
const executablePath = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${server.resolvedUrls.local[0]}#asana/tadasana`);
  await page.waitForFunction(() => document.querySelector('#loading')?.hidden !== false, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.addStyleTag({ content: '#legend,#phys-hud,#player,.view-buttons,#left-panel,#right-panel,header{display:none!important}' });
  for (const a of ASANAS) {
    if (a.flow || (only.length ? !only.includes(a.id) : a.hidden)) continue;
    for (const v of [0, ...(a.variants || []).map((_, i) => i + 1)]) {
      await page.evaluate(([id, variant]) => {
        const app = window.__app;
        app.loadAsana(id, variant);
        const an = app.anim;
        an.seekStep(an.steps.length > 1 ? Math.floor(an.steps.length / 2) : 0);
        an.playing = false;
      }, [a.id, v]);
      await page.waitForTimeout(600);
      for (const view of views) {
        // frame the body: joints + floor contacts, camera from the given side
        await page.evaluate((view) => {
          const app = window.__app;
          const rig = app.body.rig;
          const V = app.viewer.camera.position.constructor;
          const lo = [1e9, 1e9, 1e9];
          const hi = [-1e9, -1e9, -1e9];
          const p = new V();
          const add = (q) => q.toArray().forEach((x, i) => ((lo[i] = Math.min(lo[i], x)), (hi[i] = Math.max(hi[i], x))));
          for (const n in rig.joints) add(rig.joints[n].getWorldPosition(p));
          for (const c of rig.contacts) add(rig.worldPoint(c.seg, c.local, p));
          hi[1] += 0.12; // top of the head
          const c = lo.map((x, i) => (x + hi[i]) / 2);
          const ext = view === 'front' ? Math.max(hi[1] - lo[1], hi[0] - lo[0]) : Math.max(hi[1] - lo[1], hi[2] - lo[2]);
          const dir = { front: [0, 0.1, 1], back: [0, 0.1, -1], left: [1, 0.1, 0], right: [-1, 0.1, 0], top: [0.001, 1, 0.05] }[view];
          app.viewer.flyTo(c, dir, ext * 1.55 + 0.35, 0.01);
        }, view);
        await page.waitForTimeout(1200);
        await page.locator('#viewport').screenshot({ path: join(out, `${a.id}${v ? `_v${v}` : ''}_${view}.png`) });
      }
      const info = await page.evaluate(() => {
        const r = window.__app.state.phys;
        return `margin ${(r.margin * 100).toFixed(1)} cm | ${r.support.map((g) => `${g.label} ${Math.round(g.pct)}%`).join(', ')} | ${r.joints
          .slice(0, 3)
          .map((j) => `${j.name} ${Math.round(j.total)} N·m`)
          .join(', ')}`;
      });
      console.log(`${a.id}${v ? ` (variant ${v})` : ''}: ${info}`);
    }
  }
} finally {
  await browser.close();
  await server.close();
}
if (errors.length) {
  console.log(`page errors:\n${errors.join('\n')}`);
  process.exit(1);
}
