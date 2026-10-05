// Generate public/og.png (1200x630) and public/apple-touch-icon.png (180x180).
// Rendered with Playwright/Chromium so the self-hosted Geist (woff2) renders
// exactly as on the site. Run: npm run og
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const b64 = (p, mime) => `data:${mime};base64,${readFileSync(resolve(root, p)).toString('base64')}`

const geist = b64('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2', 'font/woff2')
const geistMono = b64('node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2', 'font/woff2')
const avatar = b64('public/characters/hero-wave.webp', 'image/webp')
const faviconSvg = readFileSync(resolve(root, 'public/favicon.svg'), 'utf8')

const fonts = `
  @font-face{font-family:'Geist';src:url(${geist}) format('woff2');font-weight:100 900;font-display:block}
  @font-face{font-family:'Geist Mono';src:url(${geistMono}) format('woff2');font-weight:100 900;font-display:block}
  *{margin:0;box-sizing:border-box}`

const og = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}</style></head>
<body><div style="width:1200px;height:630px;background:#0A0B0D;position:relative;overflow:hidden;display:flex;align-items:center">
  <div style="position:absolute;inset:0;background:radial-gradient(40% 55% at 18% 15%,rgba(77,139,255,0.26),transparent 60%),radial-gradient(48% 60% at 88% 92%,rgba(198,92,255,0.22),transparent 62%)"></div>
  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px);background-size:48px 48px"></div>
  <div style="position:relative;flex:1;padding:0 72px">
    <div style="font-family:'Geist Mono';color:#4D8BFF;font-size:22px;letter-spacing:0.18em;text-transform:uppercase">// Portfolio</div>
    <div style="font-family:'Geist';font-weight:600;color:#F4F5F7;font-size:94px;letter-spacing:-0.03em;line-height:1.0;margin-top:20px">Samyak Moon</div>
    <div style="font-family:'Geist Mono';color:#C65CFF;font-size:40px;margin-top:24px;letter-spacing:-0.01em">Backend &amp; AI Engineer</div>
    <div style="font-family:'Geist';color:#AEB3BD;font-size:25px;margin-top:28px;max-width:600px;line-height:1.45">Scalable, secure backend &amp; distributed systems · Java · Spring Boot · AI / RAG</div>
  </div>
  <div style="position:relative;width:430px;height:630px;display:flex;align-items:flex-end;justify-content:center">
    <img src="${avatar}" style="height:610px;width:auto;object-fit:contain"/>
  </div>
</div></body></html>`

const icon = `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0}</style></head>
<body><div style="width:180px;height:180px;display:flex">${faviconSvg.replace('width="64" height="64"', 'width="180" height="180"')}</div></body></html>`

const browser = await chromium.launch()

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
