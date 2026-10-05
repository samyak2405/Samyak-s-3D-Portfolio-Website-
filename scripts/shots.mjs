// Full-page screenshots + mobile overflow assertions via Playwright.
// Usage: node scripts/shots.mjs <outDir> [assert]
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const base = process.env.URL || 'http://localhost:4173/'
const outDir = process.argv[2] || 'screenshots/before'
const doAssert = process.argv.includes('assert')

const viewports = [
  { w: 1440, h: 900, mobile: false },
  { w: 1024, h: 768, mobile: false },
  { w: 390, h: 844, mobile: true },
  { w: 360, h: 740, mobile: true },
]

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: vp.mobile ? 2 : 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
  })
  const page = await ctx.newPage()
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800) // let reveals / typewriter settle
  await page.screenshot({ path: `${outDir}/${vp.w}x${vp.h}.png`, fullPage: true })

  if (doAssert) {
    const res = await page.evaluate(() => {
      const sw = document.documentElement.scrollWidth
      const iw = window.innerWidth
      const atoms = [...document.querySelectorAll('.atom')]
      let outside = 0
      if (atoms.length && atoms[0].parentElement) {
        const c = atoms[0].parentElement.getBoundingClientRect()
        for (const a of atoms) {
          const r = a.getBoundingClientRect()
          if (r.left < c.left - 1 || r.right > c.right + 1 || r.top < c.top - 1 || r.bottom > c.bottom + 1) outside++
        }
      }
      return { sw, iw, overflow: sw - iw, atoms: atoms.length, atomsOutside: outside }
    })
    const ok = res.overflow <= 0 && res.atomsOutside === 0
    console.log(`${ok ? 'PASS' : 'FAIL'} ${vp.w}x${vp.h}  ${JSON.stringify(res)}`)
  } else {
    console.log(`shot ${vp.w}x${vp.h}`)
  }
  await ctx.close()
}

await browser.close()
