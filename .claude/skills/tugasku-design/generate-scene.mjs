// Generates the app background landscapes (day + night) as lightweight SVGs.
// Same seed => same geometry, so both themes show the same place.
// Usage: node generate-scene.mjs <output-dir>
import fs from 'node:fs'
import path from 'node:path'

const W = 1600
const H = 1000
const outDir = process.argv[2] || 'public/backgrounds'

function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (n) => Math.round(n * 10) / 10

// Jagged line through key points (midpoint displacement between each pair)
function jagged(rand, keys, rough = 0.16, depth = 4) {
  let pts = keys.map(([x, y]) => [x, y])
  for (let d = 0; d < depth; d++) {
    const next = []
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i]
      const [x1, y1] = pts[i + 1]
      const len = Math.hypot(x1 - x0, y1 - y0)
      next.push([x0, y0], [(x0 + x1) / 2 + (rand() - 0.5) * len * 0.1, (y0 + y1) / 2 + (rand() - 0.5) * len * rough])
    }
    next.push(pts.at(-1))
    pts = next
  }
  return pts
}

const polyPath = (pts, closeTo = H + 20) =>
  `M${f(pts[0][0])} ${closeTo}` + pts.map(([x, y]) => `L${f(x)} ${f(y)}`).join('') + `L${f(pts.at(-1)[0])} ${closeTo}Z`

function snowPath(rand, ridgePts, snowline, spread) {
  // Area above a wavy snowline; clipped to the mountain it belongs to
  const pts = []
  for (let x = -60; x <= W + 60; x += 18) {
    const drip = rand() < 0.18 ? rand() * spread * 1.6 : 0
    pts.push([x, snowline + (rand() - 0.5) * spread + drip])
  }
  return `M-60 -10` + pts.map(([x, y]) => `L${f(x)} ${f(y)}`).join('') + `L${W + 60} -10Z`
}

function pine(rand, x, base, h) {
  const w = h * (0.34 + rand() * 0.06)
  const tiers = 6
  let body = ''
  let shade = ''
  for (let i = 0; i < tiers; i++) {
    const k = i / tiers
    const wi = w * (1 - k * 0.82) * (0.92 + rand() * 0.16)
    const yb = base - h * 0.1 - h * 0.86 * k
    const yt = i === tiers - 1 ? base - h : yb - (h * 0.86 / tiers) * 1.9
    const droop = wi * 0.08
    body += `M${f(x - wi / 2)} ${f(yb + droop)}L${f(x)} ${f(yt)}L${f(x + wi / 2)} ${f(yb + droop)}Q${f(x)} ${f(yb - droop)} ${f(x - wi / 2)} ${f(yb + droop)}Z`
    shade += `M${f(x)} ${f(yt)}L${f(x + wi / 2)} ${f(yb + droop)}Q${f(x + wi / 4)} ${f(yb)} ${f(x)} ${f(yb - droop * 0.5)}Z`
  }
  const trunk = `M${f(x - w * 0.05)} ${f(base)}h${f(w * 0.1)}v${f(-h * 0.14)}h${f(-w * 0.1)}Z`
  return { body, shade, trunk }
}

function cloud(rand, cx, cy, scale) {
  const puffs = []
  const n = 5 + Math.floor(rand() * 4)
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const px = cx + (t - 0.5) * 220 * scale
    const r = (26 + Math.sin(t * Math.PI) * 42 + rand() * 14) * scale
    puffs.push([px, cy - Math.sin(t * Math.PI) * 22 * scale - r * 0.35, r])
  }
  return puffs
}

function build(theme) {
  const rand = mulberry32(20260922)
  const night = theme === 'night'
  const P = night
    ? {
        sky: ['#070b1c', '#101838', '#1d2a55', '#34467a'],
        cloud: '#2c3a68', cloudShade: '#1d2850', cloudOpacity: 0.55,
        far: ['#3a4a78', '#2a3761'], farSnow: '#b9c4e6', farSnowOp: 0.5,
        mid: ['#263257', '#1c2645'], midSnow: '#8d9bc4', midSnowOp: 0.28,
        haze: '#3b4d80', hazeOp: 0.35,
        hills: ['#1a3230', '#132724'],
        smallTree: '#0f201e',
        meadow: ['#1d3a2b', '#142b20', '#0e2018'],
        pine: '#0b1a17', pineShade: '#050d0b', trunk: '#1a1410',
        leaf: ['#2d4a2c', '#3c5f35'],
        daisy: '#cfd5ee', daisyOp: 0.55, center: '#d8c46a',
        extras: ['#6f64b8', '#b39a4a'],
      }
    : {
        sky: ['#f6f9fc', '#dcecfa', '#aed6f4', '#d7ebf8'],
        cloud: '#ffffff', cloudShade: '#dfeaf6', cloudOpacity: 0.96,
        far: ['#c3d3ea', '#9fb8d8'], farSnow: '#ffffff', farSnowOp: 0.95,
        mid: ['#8eaed0', '#6f93ba'], midSnow: '#f4f8fd', midSnowOp: 0.85,
        haze: '#e9f3fb', hazeOp: 0.55,
        hills: ['#6d9f58', '#4f8243'],
        smallTree: '#3d6e3f',
        meadow: ['#a6d36c', '#86bd52', '#5f9a3a'],
        pine: '#2e5e3a', pineShade: '#1c4029', trunk: '#5b4130',
        leaf: ['#c7d94a', '#e0e86a'],
        daisy: '#ffffff', daisyOp: 0.95, center: '#f2c33a',
        extras: ['#8f7fd6', '#f2cf3f'],
      }

  const parts = []
  parts.push(`<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${P.sky[0]}"/><stop offset=".22" stop-color="${P.sky[1]}"/><stop offset=".48" stop-color="${P.sky[2]}"/><stop offset=".66" stop-color="${P.sky[3]}"/></linearGradient>
<linearGradient id="far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.far[0]}"/><stop offset="1" stop-color="${P.far[1]}"/></linearGradient>
<linearGradient id="mid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.mid[0]}"/><stop offset="1" stop-color="${P.mid[1]}"/></linearGradient>
<linearGradient id="hills" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.hills[0]}"/><stop offset="1" stop-color="${P.hills[1]}"/></linearGradient>
<linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.meadow[0]}"/><stop offset=".55" stop-color="${P.meadow[1]}"/><stop offset="1" stop-color="${P.meadow[2]}"/></linearGradient>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.haze}" stop-opacity="0"/><stop offset="1" stop-color="${P.haze}" stop-opacity="${P.hazeOp}"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="${night ? '#f6f0d8' : '#fffdf4'}" stop-opacity="${night ? 0.35 : 0.9}"/><stop offset="1" stop-color="${night ? '#f6f0d8' : '#fffdf4'}" stop-opacity="0"/></radialGradient>
${night ? '<radialGradient id="fly"><stop offset="0" stop-color="#ffec8a" stop-opacity=".95"/><stop offset=".35" stop-color="#ffe066" stop-opacity=".4"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>' : ''}
</defs>`)

  parts.push(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`)
  parts.push(`<circle cx="1240" cy="${night ? 170 : 120}" r="${night ? 190 : 360}" fill="url(#glow)"/>`)

  // Stars are always generated so both themes consume the same random sequence
  let stars = ''
  for (let i = 0; i < 190; i++) {
    const x = rand() * W
    const y = Math.pow(rand(), 1.4) * 560
    stars += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.5 + rand() * 1.3)}" opacity="${f(0.35 + rand() * 0.65)}"/>`
  }
  if (night) {
    parts.push(`<g fill="#ffffff">${stars}</g>`)
    parts.push(`<circle cx="1240" cy="170" r="34" fill="#f5f1dc"/><circle cx="1228" cy="162" r="7" fill="#e3dcc0" opacity=".6"/><circle cx="1252" cy="182" r="5" fill="#e3dcc0" opacity=".5"/>`)
  }

  // Clouds sit behind the mountains, low in the sky
  const cloudSpots = [[180, 470, 1.15], [470, 520, 0.8], [1330, 430, 1.3], [1520, 505, 0.9], [700, 300, 0.55], [950, 235, 0.45], [60, 380, 0.7], [1180, 330, 0.55]]
  let clouds = ''
  let cloudShades = ''
  for (const [cx, cy, s] of cloudSpots) {
    for (const [px, py, r] of cloud(rand, cx, cy, s)) {
      clouds += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(r)}"/>`
      cloudShades += `<ellipse cx="${f(px)}" cy="${f(py + r * 0.55)}" rx="${f(r * 0.95)}" ry="${f(r * 0.4)}"/>`
    }
  }
  parts.push(`<g opacity="${P.cloudOpacity}"><g fill="${P.cloud}">${clouds}</g><g fill="${P.cloudShade}" opacity=".7">${cloudShades}</g></g>`)

  // Far snowy range
  const far = jagged(rand, [[-60, 660], [90, 560], [210, 600], [340, 515], [470, 585], [610, 495], [730, 540], [870, 425], [975, 488], [1075, 450], [1190, 528], [1310, 470], [1430, 552], [1545, 512], [1660, 590]], 0.2)
  const farD = polyPath(far)
  parts.push(`<clipPath id="farClip"><path d="${farD}"/></clipPath>`)
  parts.push(`<path d="${farD}" fill="url(#far)"/>`)
  parts.push(`<g clip-path="url(#farClip)"><path d="${snowPath(rand, far, 512, 40)}" fill="${P.farSnow}" opacity="${P.farSnowOp}"/></g>`)

  // Mid range
  const mid = jagged(rand, [[-60, 720], [110, 640], [260, 688], [420, 604], [565, 662], [700, 612], [860, 682], [1005, 622], [1150, 672], [1290, 598], [1440, 664], [1660, 636]], 0.22)
  const midD = polyPath(mid)
  parts.push(`<clipPath id="midClip"><path d="${midD}"/></clipPath>`)
  parts.push(`<path d="${midD}" fill="url(#mid)"/>`)
  parts.push(`<g clip-path="url(#midClip)"><path d="${snowPath(rand, mid, 614, 22)}" fill="${P.midSnow}" opacity="${P.midSnowOp}"/></g>`)
  parts.push(`<rect y="560" width="${W}" height="200" fill="url(#haze)"/>`)

  // Forested hills with distant small pines
  const hills = jagged(rand, [[-60, 760], [180, 718], [420, 748], [640, 722], [860, 752], [1080, 726], [1320, 746], [1660, 716]], 0.08, 3)
  parts.push(`<path d="${polyPath(hills)}" fill="url(#hills)"/>`)
  let small = ''
  for (let x = -20; x < W + 20; x += 9 + rand() * 12) {
    const hy = hills.reduce((best, p) => (Math.abs(p[0] - x) < Math.abs(best[0] - x) ? p : best))[1]
    const h = 16 + rand() * 26
    const { body } = pine(rand, x, hy + 10 + rand() * 12, h)
    small += body
  }
  parts.push(`<path d="${small}" fill="${P.smallTree}" opacity=".9"/>`)

  // Meadow
  const meadow = jagged(rand, [[-60, 820], [300, 800], [620, 812], [900, 796], [1200, 808], [1660, 790]], 0.05, 3)
  parts.push(`<path d="${polyPath(meadow)}" fill="url(#meadow)"/>`)

  // Deciduous tree (right), behind the pines
  let leaves = ''
  let leavesLight = ''
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2
    const d = rand() * 70
    leaves += `<circle cx="${f(1130 + Math.cos(a) * d * 1.2)}" cy="${f(655 + Math.sin(a) * d)}" r="${f(40 + rand() * 28)}"/>`
    if (i % 2) leavesLight += `<circle cx="${f(1108 + Math.cos(a) * d)}" cy="${f(628 + Math.sin(a) * d * 0.8)}" r="${f(18 + rand() * 16)}"/>`
  }
  parts.push(`<rect x="1123" y="700" width="14" height="130" fill="${P.trunk}"/><g fill="${P.leaf[0]}">${leaves}</g><g fill="${P.leaf[1]}" opacity=".7">${leavesLight}</g>`)

  // Pine groves on both sides
  let bodies = ''
  let shades = ''
  let trunks = ''
  const grove = (x0, x1, count, hMin, hMax, baseMin, baseMax) => {
    const trees = []
    for (let i = 0; i < count; i++) {
      trees.push([x0 + rand() * (x1 - x0), baseMin + rand() * (baseMax - baseMin), hMin + rand() * (hMax - hMin)])
    }
    trees.sort((a, b) => a[1] - b[1])
    for (const [x, base, h] of trees) {
      const t = pine(rand, x, base, h)
      bodies += t.body
      shades += t.shade
      trunks += t.trunk
    }
  }
  grove(-40, 380, 11, 170, 430, 850, 940)
  grove(1180, 1640, 13, 190, 540, 850, 950)
  grove(520, 640, 2, 70, 110, 820, 840)
  grove(1000, 1100, 2, 80, 120, 820, 845)
  parts.push(`<path d="${trunks}" fill="${P.trunk}"/><path d="${bodies}" fill="${P.pine}"/><path d="${shades}" fill="${P.pineShade}" opacity=".45"/>`)

  // Flowers: denser and bigger toward the bottom
  let petals = ''
  let centers = ''
  let dots = ['', '']
  for (let i = 0; i < 260; i++) {
    const y = 840 + Math.pow(rand(), 0.7) * 170
    const x = rand() * W
    const r = 1.6 + ((y - 840) / 170) * 4.5
    if (rand() < 0.72) {
      petals += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`
      centers += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.38)}"/>`
    } else {
      dots[rand() < 0.5 ? 0 : 1] += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.7)}"/>`
    }
  }
  parts.push(`<g fill="${P.daisy}" opacity="${P.daisyOp}">${petals}</g><g fill="${P.center}" opacity="${night ? 0.5 : 1}">${centers}</g>`)
  parts.push(`<g fill="${P.extras[0]}" opacity="${night ? 0.5 : 0.85}">${dots[0]}</g><g fill="${P.extras[1]}" opacity="${night ? 0.45 : 0.9}">${dots[1]}</g>`)

  if (night) {
    let flies = ''
    for (let i = 0; i < 26; i++) {
      flies += `<circle cx="${f(rand() * W)}" cy="${f(640 + rand() * 330)}" r="${f(5 + rand() * 7)}"/>`
    }
    parts.push(`<g fill="url(#fly)">${flies}</g>`)
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">${parts.join('')}</svg>\n`
}

fs.mkdirSync(outDir, { recursive: true })
for (const theme of ['day', 'night']) {
  const file = path.join(outDir, `scene-${theme}.svg`)
  fs.writeFileSync(file, build(theme))
  console.log(`wrote ${file} (${(fs.statSync(file).size / 1024).toFixed(1)} KB)`)
}
