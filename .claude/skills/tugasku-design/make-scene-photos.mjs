// Crops + compresses the background photos into WebP at two aspect ratios.
//
//   node make-scene-photos.mjs <outDir> [--inspect <dir>]
//
// Needs `npm i playwright-core` in the working dir (uses the system Edge) and the
// source JPEGs listed in JOBS. --inspect writes 1:1 crops of the sky so you can
// check for compression artefacts — dark night skies band badly if quality is too low.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const outDir = process.argv[2]
const inspectDir = process.argv.includes('--inspect') ? process.argv[process.argv.indexOf('--inspect') + 1] : null
fs.mkdirSync(outDir, { recursive: true })
if (inspectDir) fs.mkdirSync(inspectDir, { recursive: true })

// focusY = where the crop sits vertically in the source (0..1)
// blur    = tiny pre-blur that kills sensor grain; shrinks night shots a lot,
//           leave at 0 for daylight photos or foliage goes mushy
const JOBS = [
  { src: 'photos/src-38176221.jpg', name: 'scene-day-wide.webp', w: 2200, h: 1238, focusY: 0.46, quality: 0.72, blur: 0 },
  { src: 'photos/src-38176221.jpg', name: 'scene-day-tall.webp', w: 1240, h: 2480, focusY: 0.5, quality: 0.7, blur: 0 },
  { src: 'photos/src-2670898.jpg', name: 'scene-night-wide.webp', w: 2200, h: 1238, focusY: 0.52, quality: 0.78, blur: 0.3 },
  { src: 'photos/src-2670898.jpg', name: 'scene-night-tall.webp', w: 1240, h: 2480, focusY: 0.44, quality: 0.76, blur: 0.3 },
]

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 800, height: 600 } })

for (const job of JOBS) {
  const dataUrl = `data:image/jpeg;base64,${fs.readFileSync(job.src).toString('base64')}`
  const b64 = await page.evaluate(async ({ dataUrl, w, h, focusY, quality, blur }) => {
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
    if (blur) ctx.filter = `blur(${blur}px)`
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
    return canvas.toDataURL('image/webp', quality).split(',')[1]
  }, { ...job, dataUrl })

  const file = path.join(outDir, job.name)
  fs.writeFileSync(file, Buffer.from(b64, 'base64'))
  console.log(`${job.name.padEnd(24)} ${job.w}x${job.h}  q${job.quality}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`)

  if (inspectDir) {
    const crop = await page.evaluate(async ({ b64 }) => {
      const img = new Image()
      img.src = `data:image/webp;base64,${b64}`
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = Math.min(900, img.width)
      canvas.height = 500
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, (img.width - canvas.width) / 2, img.height * 0.08, canvas.width, 500, 0, 0, canvas.width, 500)
      return canvas.toDataURL('image/png').split(',')[1]
    }, { b64 })
    fs.writeFileSync(path.join(inspectDir, job.name.replace('.webp', '-sky.png')), Buffer.from(crop, 'base64'))
  }
}

await browser.close()
