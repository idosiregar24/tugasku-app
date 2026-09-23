// Turns source artwork/photos into the app background WebPs.
//
//   node make-scene-photos.mjs <outDir> [--inspect <dir>]
//
// Needs `npm i playwright-core` in the working dir (uses the system Edge).
// --inspect writes 1:1 crops of the sky so you can check for compression
// artefacts — dark skies band badly when quality is too low.
//
// Sources are served through page.route, not as data: URLs — Chromium refuses
// to decode a data: URL over ~2 MB, and every source here is bigger than that.
//
// Two modes per job:
//   crop   — cut the target aspect ratio out of the source. The tall crop takes
//            a source strip only half as wide as it is tall, so a landscape
//            source needs ~2500px of width to fill a 3x phone without upscaling.
//   extend — keep the source at full width along the BOTTOM and paint the sky
//            upwards from the source's own top-row colour. Builds a phone-shaped
//            scene out of artwork too small to crop, at the cost of a plain sky.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const outDir = process.argv[2]
const inspectDir = process.argv.includes('--inspect') ? process.argv[process.argv.indexOf('--inspect') + 1] : null
fs.mkdirSync(outDir, { recursive: true })
if (inspectDir) fs.mkdirSync(inspectDir, { recursive: true })

const DAY = 'src/assets/Bg-Terang1.png' // 5760x4096, gitignored (41 MB)
const NIGHT = 'src/assets/Bg-Gelap.png' // 1440x1024

// focusY = where a crop sits vertically in the source (0..1)
// blur    = tiny pre-blur that kills sensor grain on photos; leave 0 for
//           illustrations or the linework goes mushy
const JOBS = [
  { src: DAY, name: 'scene-day-wide.webp', mode: 'crop', w: 2200, h: 1238, focusY: 0.5, quality: 0.82, blur: 0 },
  { src: DAY, name: 'scene-day-tall.webp', mode: 'crop', w: 1240, h: 2480, focusY: 0.5, quality: 0.82, blur: 0 },
  // Night is only 1440px wide, so its wide crop stays near 1:1 and the tall one
  // upscales ~2.4x — tolerable because the art is smooth and mostly behind glass.
  { src: NIGHT, name: 'scene-night-wide.webp', mode: 'crop', w: 1600, h: 900, focusY: 0.5, quality: 0.86, blur: 0 },
  { src: NIGHT, name: 'scene-night-tall.webp', mode: 'crop', w: 1240, h: 2480, focusY: 0.5, quality: 0.86, blur: 0 },
]

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 800, height: 600 } })

let source = null
await page.route('**/*', (route) => {
  const url = route.request().url()
  if (url.includes('/scene-source')) return route.fulfill({ contentType: 'image/png', body: fs.readFileSync(source) })
  return route.fulfill({ contentType: 'text/html', body: '<html><body></body></html>' })
})
await page.goto('https://scene.local/')

for (const job of JOBS) {
  source = job.src
  const result = await page.evaluate(async ({ mode, w, h, focusY, quality, blur, name }) => {
    const img = new Image()
    img.src = `/scene-source-${name}.png` // unique per job so the cache can't serve the previous source
    await img.decode()

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    if (blur) ctx.filter = `blur(${blur}px)`

    if (mode === 'crop') {
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
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
    } else {
      // Scene along the bottom at full width, sky painted above it
      const drawH = Math.round((img.height * w) / img.width)
      const top = h - drawH

      // Average the source's top rows to find the sky colour
      const probe = document.createElement('canvas')
      probe.width = img.width
      probe.height = 12
      const pctx = probe.getContext('2d', { willReadFrequently: true })
      pctx.drawImage(img, 0, 0, img.width, 12, 0, 0, img.width, 12)
      const px = pctx.getImageData(0, 0, img.width, 12).data
      let r = 0, g = 0, b = 0
      for (let i = 0; i < px.length; i += 4) {
        r += px[i]
        g += px[i + 1]
        b += px[i + 2]
      }
      const n = px.length / 4
      const sky = [r / n, g / n, b / n].map(Math.round)
      // Deepen toward the top edge so the fill isn't a flat block
      const deep = sky.map((c) => Math.max(0, Math.round(c * (c < 90 ? 0.72 : 0.88))))

      const grad = ctx.createLinearGradient(0, 0, 0, top + 2)
      grad.addColorStop(0, `rgb(${deep.join(',')})`)
      grad.addColorStop(1, `rgb(${sky.join(',')})`)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, top + 2)

      // A dark painted sky needs stars, or it reads as a flat block above the art
      if (sky[0] + sky[1] + sky[2] < 260) {
        for (let i = 0; i < 260; i++) {
          const y = Math.random() * top
          ctx.fillStyle = `rgba(255,255,255,${(0.18 + Math.random() * 0.5) * (1 - y / top / 1.6)})`
          ctx.beginPath()
          ctx.arc(Math.random() * w, y, Math.random() < 0.85 ? 0.7 : 1.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.drawImage(img, 0, top, w, drawH)
    }

    return {
      data: canvas.toDataURL('image/webp', quality).split(',')[1],
      // 1:1 slice of the sky for artefact checking
      inspect: (() => {
        const c = document.createElement('canvas')
        c.width = Math.min(600, w)
        c.height = 320
        c.getContext('2d').drawImage(canvas, Math.round(w / 2 - c.width / 2), Math.round(h * 0.12), c.width, c.height, 0, 0, c.width, c.height)
        return c.toDataURL('image/png').split(',')[1]
      })(),
    }
  }, job)

  const file = path.join(outDir, job.name)
  fs.writeFileSync(file, Buffer.from(result.data, 'base64'))
  if (inspectDir) fs.writeFileSync(path.join(inspectDir, job.name.replace('.webp', '-sky.png')), Buffer.from(result.inspect, 'base64'))
  console.log(`${job.name.padEnd(24)} ${job.w}x${job.h}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`)
}

await browser.close()
