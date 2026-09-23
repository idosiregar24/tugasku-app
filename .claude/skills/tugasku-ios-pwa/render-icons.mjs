import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const outDir = process.argv[2]
const svg = fs.readFileSync(process.argv[3], 'utf8')
fs.mkdirSync(outDir, { recursive: true })

// maskable: full-bleed background, glyph kept inside the 80% safe zone
const maskable = svg
  .replaceAll('rx="116"', 'rx="0"')
  .replace('<rect x="128" y="112" width="256" height="288" rx="56"', '<rect x="153" y="140" width="206" height="232" rx="46"')
  .replace('M184 262l52 52 100-116', 'M198 262l42 42 80-94')
  .replace('stroke-width="44"', 'stroke-width="36"')

// iOS applies its own corner mask and shows black under transparency, so square-fill it
const apple = svg.replaceAll('rx="116"', 'rx="0"')

const jobs = [
  { name: 'icon-192.png', size: 192, markup: svg },
  { name: 'icon-512.png', size: 512, markup: svg },
  { name: 'icon-maskable-512.png', size: 512, markup: maskable },
  { name: 'apple-touch-icon.png', size: 180, markup: apple },
]

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ deviceScaleFactor: 1 })
for (const job of jobs) {
  await page.setViewportSize({ width: job.size, height: job.size })
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${job.markup.replace('<svg ', `<svg width="${job.size}" height="${job.size}" `)}</body></html>`
  )
  await page.screenshot({ path: path.join(outDir, job.name), omitBackground: true, clip: { x: 0, y: 0, width: job.size, height: job.size } })
  console.log('wrote', job.name)
}
await browser.close()
