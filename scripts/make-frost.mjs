// Generates src/assets/frost.svg: fern-like ice crystals growing in from the
// edges of the screen. Deterministic (seeded), so re-running gives the same file.
//   node scripts/make-frost.mjs
import { writeFileSync, mkdirSync } from 'node:fs'

const W = 1600
const H = 1000
const SEED = 20261030

// Small seeded random number generator (mulberry32).
let s = SEED
const rand = () => {
  s |= 0; s = (s + 0x6d2b79f5) | 0
  let t = Math.imul(s ^ (s >>> 15), 1 | s)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const between = (a, b) => a + rand() * (b - a)

const HEX = Math.PI / 3 // ice branches at 60°
const strokes = { 3: [], 2: [], 1: [], 0: [] } // grouped by thickness
const r1 = (n) => Math.round(n * 10) / 10


// A crystal arm: grows mostly straight, sprouts side arms at ±60°,
// and the finest arms get short feathery barbs like fern frost.
function grow(x, y, angle, len, depth) {
  const step = depth === 0 ? 5 : 7
  let travelled = 0
  let nextBranch = len * between(0.06, 0.14)
  let side = rand() < 0.5 ? 1 : -1
  let d = `M${r1(x)} ${r1(y)}`
  while (travelled < len) {
    const a = angle + between(-0.09, 0.09)
    x += Math.cos(a) * step
    y += Math.sin(a) * step
    travelled += step
    d += `L${r1(x)} ${r1(y)}`

    if (depth === 0) {
      // feathering: tiny barbs on both sides
      if (travelled % 10 < step) {
        const b = between(2, 5) * (1 - travelled / len)
        for (const sgn of [1, -1]) {
          strokes[0].push(`M${r1(x)} ${r1(y)}l${r1(Math.cos(angle + sgn * HEX) * b)} ${r1(Math.sin(angle + sgn * HEX) * b)}`)
        }
      }
    } else if (travelled >= nextBranch) {
      const remaining = len - travelled
      const both = rand() < 0.65
      for (const sgn of both ? [1, -1] : [side]) {
        grow(x, y, angle + sgn * HEX + between(-0.08, 0.08), remaining * between(0.3, 0.55), depth - 1)
      }
      side = -side
      nextBranch = travelled + len * between(0.07, 0.15)
    }
  }
  strokes[depth].push(d)
}

// Seeds along every edge, pointing inward. Corners get more and longer crystals.
function seedEdge(count, place) {
  for (let i = 0; i < count; i++) {
    const t = (i + between(0.1, 0.9)) / count
    const { x, y, inward } = place(t)
    const cornerness = Math.max(0, 1 - Math.min(t, 1 - t) * 4) // 1 at corners, 0 by a quarter in
    const len = between(35, 105) + cornerness * between(50, 150)
    grow(x, y, inward + between(-0.75, 0.75), len, rand() < 0.3 + cornerness * 0.5 ? 3 : 2)
  }
}
seedEdge(70, (t) => ({ x: t * W, y: -4, inward: Math.PI / 2 }))
seedEdge(70, (t) => ({ x: t * W, y: H + 4, inward: -Math.PI / 2 }))
seedEdge(45, (t) => ({ x: -4, y: t * H, inward: 0 }))
seedEdge(45, (t) => ({ x: W + 4, y: t * H, inward: Math.PI }))

// Loose six-pointed specks scattered near the edges.
const specks = []
for (let i = 0; i < 260; i++) {
  const edge = Math.floor(rand() * 4)
  const d = Math.pow(rand(), 1.8) * 260 // clustered towards the edge
  const along = rand()
  const x = edge === 2 ? d : edge === 3 ? W - d : along * W
  const y = edge === 0 ? d : edge === 1 ? H - d : edge >= 2 ? along * H : 0
  const r = between(1.5, 4.5)
  const rot = rand() * HEX
  let p = ''
  for (let k = 0; k < 3; k++) {
    const a = rot + k * HEX
    p += `M${r1(x - Math.cos(a) * r)} ${r1(y - Math.sin(a) * r)}L${r1(x + Math.cos(a) * r)} ${r1(y + Math.sin(a) * r)}`
  }
  specks.push(p)
}

const width = { 3: 1.7, 2: 1.15, 1: 0.8, 0: 0.5 }
const all = [...strokes[3], ...strokes[2]].join('')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<g fill="none" stroke-linecap="round">
<path d="${all}" stroke="#bfe6ff" stroke-opacity="0.13" stroke-width="3.2"/>
${[3, 2, 1, 0].map((d) => `<path d="${strokes[d].join('')}" stroke="#e6f6ff" stroke-opacity="${0.55 + d * 0.12}" stroke-width="${width[d]}"/>`).join('\n')}
<path d="${specks.join('')}" stroke="#ffffff" stroke-opacity="0.8" stroke-width="0.7"/>
</g>
</svg>
`
mkdirSync(new URL('../src/assets/', import.meta.url), { recursive: true })
writeFileSync(new URL('../src/assets/frost.svg', import.meta.url), svg)
console.log(`frost.svg: ${(svg.length / 1024).toFixed(0)} KB, ${Object.values(strokes).flat().length} segments`)
