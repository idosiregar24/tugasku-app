// Crops + compresses the background photos into WebP at two aspect ratios.
// Usage: node make-scene-photos.mjs <outDir>
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const outDir = process.argv[2]
fs.mkdirSync(outDir, { recursive: true })

const JOBS = [
  // focusY = where the crop is centred vertically in the source (0..1)
  { src: 'photos/hi-38176221.jpg', name: 'scene-day-wide.webp', w: 1600, h: 900, focusY: 0.46, quality: 0.62 },
  { src: 'photos/hi-38176221.jpg', name: 'scene-day-tall.webp', w: 900, h: 1600, focusY: 0.5, quality: 0.6 },
  { src: 'photos/hi-2670898.jpg', name: 'scene-night-wide.webp', w: 1600, h: 900, focusY: 0.52, quality: 0.66 },
  { src: 'photos/hi-2670898.jpg', name: 'scene-night-tall.webp', w: 900, h: 1600, focusY: 0.5, quality: 0.64 },
]

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage()

for (const job of JOBS) {
  const dataUrl = `data:image/jpeg;base64,${fs.readFileSync(job.src).toString('base64')}`
  const b64 = await page.evaluate(async ({ dataUrl, w, h, focusY, quality }) => {
    const img = new Image()
    img.src = dataUrl
    await img.decode()

    const targetRatio = w / h
    const srcRatio = img.width / img.height
    let sw, sh
    if (srcRatio > targetRatio) {
      sh = img.height
      sw = sh * targetRatio
    } else {
      sw = img.width
      sh = sw / targetRatio
    }
    const sx = (img.width - sw) / 2
    const sy = Math.max(0, Math.min(img.height - sh, img.height * focusY - sh / 2))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
    return canvas.toDataURL('image/webp', quality).split(',')[1]
  }, { dataUrl, w: job.w, h: job.h, focusY: job.focusY, quality: job.quality })

  const file = path.join(outDir, job.name)
  fs.writeFileSync(file, Buffer.from(b64, 'base64'))
  console.log(`${job.name.padEnd(24)} ${job.w}x${job.h}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`)
}

await browser.close()
