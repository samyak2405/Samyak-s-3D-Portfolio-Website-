// Generate public/og.png (1200x630) and public/apple-touch-icon.png (180x180).
// Rendered with Playwright/Chromium so the self-hosted site fonts (woff2) render
// exactly as on the site. Run: npm run og
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const b64 = (p, mime) => `data:${mime};base64,${readFileSync(resolve(root, p)).toString('base64')}`

const display = b64('node_modules/@fontsource-variable/big-shoulders-display/files/big-shoulders-display-latin-wght-normal.woff2', 'font/woff2')
const body = b64('node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2', 'font/woff2')
const faviconSvg = readFileSync(resolve(root, 'public/favicon.svg'), 'utf8')

const fonts = `
  @font-face{font-family:'Big Shoulders Display';src:url(${display}) format('woff2');font-weight:100 900;font-display:block}
  @font-face{font-family:'Schibsted Grotesk';src:url(${body}) format('woff2');font-weight:100 900;font-display:block}
  *{margin:0;box-sizing:border-box}`

// The right-hand art: a moon framed by a web strung from the top-right corner
// (same construction as src/components/fx/WebBackdrop.tsx), drawn in-page.
const webScript = `
  const svg = document.getElementById('web'), NS = 'http://www.w3.org/2000/svg';
  let seed = 3; const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 };
  const hub = [1000, 0], N = 12, ang = [...Array(N)].map((_, i) => (90 - 8 + 106 * i / (N - 1) + (r() * 2 - 1) * 2.5) * Math.PI / 180);
  const at = (a, l) => [hub[0] + Math.cos(a) * l, hub[1] + Math.sin(a) * l];
  const add = (d, w) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('stroke-width', w); svg.querySelector('g').appendChild(p) };
  ang.forEach(a => { const [x, y] = at(a, 1500); add('M1000 0L' + x + ' ' + y, 1.8) });
  for (let R = 68; R < 1500; R *= 1.22 + r() * 0.06) {
    const pts = ang.map(a => at(a, R * (1 + (r() * 2 - 1) * 0.045)));
    let d = 'M' + pts[0];
    for (let i = 1; i < N; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      const c = Math.hypot(x1 - x0, y1 - y0) * 0.17, hx = hub[0] - mx, hy = hub[1] - my, l = Math.hypot(hx, hy);
      d += 'Q' + (mx + hx / l * c) + ' ' + (my + hy / l * c) + ' ' + x1 + ' ' + y1;
    }
    add(d, 1.4);
  }`

const og = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}</style></head>
<body><div style="width:1200px;height:630px;background:#07080F;position:relative;overflow:hidden;display:flex;align-items:center">
  <div style="position:absolute;inset:0;background:radial-gradient(40% 55% at 18% 10%,rgba(77,139,255,0.22),transparent 60%),radial-gradient(60% 50% at 70% 105%,rgba(255,59,74,0.30),transparent 65%)"></div>
  <div style="position:absolute;inset:0;background-image:radial-gradient(rgba(255,59,74,0.22) 1.2px,transparent 1.8px);background-size:14px 14px;-webkit-mask-image:radial-gradient(55% 70% at 0% 100%,#000,transparent 72%)"></div>
  <div style="position:absolute;right:120px;top:120px;width:330px;height:330px;border-radius:50%;opacity:.82;background:radial-gradient(circle at 30% 64%,rgba(70,68,98,.30),transparent 10%),radial-gradient(circle at 63% 31%,rgba(70,68,98,.24),transparent 13%),radial-gradient(circle at 71% 69%,rgba(70,68,98,.2),transparent 7%),radial-gradient(circle at 34% 30%,#e6e4ee 0%,#c4c1d4 38%,#8b88a2 76%,#5a5772 100%);box-shadow:inset -26px -20px 60px rgba(7,8,15,.5),0 0 60px 4px rgba(225,225,255,.10),0 0 200px 40px rgba(77,139,255,.10)"></div>
  <svg id="web" viewBox="0 0 1000 1000" style="position:absolute;right:0;top:0;width:760px;height:760px" fill="none">
    <defs><radialGradient id="g" gradientUnits="userSpaceOnUse" cx="1000" cy="0" r="1150"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <mask id="m"><rect width="1000" height="1000" fill="url(#g)"/></mask></defs>
    <g mask="url(#m)" stroke="rgba(236,238,244,0.28)" stroke-linecap="round"></g>
  </svg>
  <div style="position:relative;flex:1;padding:0 72px">
    <div style="font-family:'Big Shoulders Display';font-weight:800;color:#ECEBF4;font-size:112px;line-height:0.9">Samyak Moon</div>
    <div style="font-family:'Schibsted Grotesk';font-weight:500;color:#FF4A57;font-size:34px;margin-top:22px">Backend and AI engineer</div>
    <div style="font-family:'Schibsted Grotesk';color:#AEB3BD;font-size:25px;margin-top:22px;max-width:600px;line-height:1.45">Scalable, secure backend and distributed systems in Java and Spring Boot, now building AI and RAG.</div>
  </div>
</div><script>${webScript}</script></body></html>`

const icon = `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0}</style></head>
<body><div style="width:180px;height:180px;display:flex">${faviconSvg.replace('width="64" height="64"', 'width="180" height="180"')}</div></body></html>`

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })

const shoot = async (html, w, h, out) => {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(150)
  await page.screenshot({ path: resolve(root, out), clip: { x: 0, y: 0, width: w, height: h } })
  await page.close()
  console.log('wrote', out)
}

await shoot(og, 1200, 630, 'public/og.png')
await shoot(icon, 180, 180, 'public/apple-touch-icon.png')
await browser.close()
