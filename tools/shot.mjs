// Screenshot of the running app, to check a change by eye (new asana, UI change …).
// Starts its own Vite dev server, opens the page in headless Chromium, fails on page errors.
//   node tools/shot.mjs <hash> <out.png> [--hold] [--cm roles|act|length|load] [--view front|back|left|right|top]
//   e.g. node tools/shot.mjs asana/virabhadrasana_2 /tmp/w2.png --hold --cm act
// Needs Playwright (not a project dependency): uses a local install if present, else the global one.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const positional = args.filter((a, i) => !a.startsWith('--') && !['--cm', '--view'].includes(args[i - 1]));
const [hash, out] = positional;
if (!hash || !out) {
  console.log('Usage: node tools/shot.mjs <hash, e.g. asana/tadasana | muscle/hamstrings> <out.png> [--hold] [--cm act] [--view left]');
  process.exit(1);
}

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
const url = server.resolvedUrls.local[0];
const { chromium } = await playwright();
const executablePath = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', (e) => errors.push(e.message));
  // external fonts may be unreachable in sandboxes: network failures are not app errors
  page.on('console', (m) => m.type() === 'error' && !/net::ERR_/.test(m.text()) && errors.push(m.text()));
  await page.goto(`${url}#${hash}`);
  await page.waitForFunction(() => document.querySelector('#loading')?.hidden !== false, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);
  if (args.includes('--hold')) await page.click('#hold-btn');
  const cm = opt('--cm');
  if (cm) await page.click(`#color-mode .seg[data-cm="${cm}"]`);
  const view = opt('--view');
  if (view) await page.click(`.view-buttons [data-view="${view}"]`);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: out });
  console.log(`saved ${out}`);
} finally {
  await browser.close();
  await server.close();
}
if (errors.length) {
  console.log(`page errors:\n${errors.join('\n')}`);
  process.exit(1);
}
