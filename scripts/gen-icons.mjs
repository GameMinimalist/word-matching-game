// Generates raster PNG app icons from a simple drawing routine (no deps).
// Run with: node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const PAPER = [0xf8, 0xf7, 0xf3]
const EMBER = [0xc2, 0x54, 0x2b]

function draw(size) {
  const buf = Buffer.alloc(size * size * 4)
  const radius = Math.round(size * 0.22)
  const set = (x, y, [r, g, b]) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return
    const i = (y * size + x) * 4
    buf[i] = r
    buf[i + 1] = g
    buf[i + 2] = b
    buf[i + 3] = 255
  }
  // rounded-rect paper background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inCorner =
        (x < radius && y < radius && (x - radius) ** 2 + (y - radius) ** 2 > radius ** 2) ||
        (x >= size - radius &&
          y < radius &&
          (x - (size - radius)) ** 2 + (y - radius) ** 2 > radius ** 2) ||
        (x < radius &&
          y >= size - radius &&
          (x - radius) ** 2 + (y - (size - radius)) ** 2 > radius ** 2) ||
        (x >= size - radius &&
          y >= size - radius &&
          (x - (size - radius)) ** 2 + (y - (size - radius)) ** 2 > radius ** 2)
      if (!inCorner) set(x, y, PAPER)
    }
  }
  // tally strokes (scaled from the 512 reference)
  const s = size / 512
  const w = Math.max(2, Math.round(26 * s))
  const top = Math.round(170 * s)
  const bot = Math.round(342 * s)
  const vline = (cx) => {
    for (let y = top; y <= bot; y++)
      for (let dx = -Math.floor(w / 2); dx <= Math.floor(w / 2); dx++) set(cx + dx, y, EMBER)
  }
  ;[170, 218, 266, 314].forEach((c) => vline(Math.round(c * s)))
  // diagonal slash
  const x0 = 150 * s
  const y0 = 340 * s
  const x1 = 334 * s
  const y1 = 172 * s
  const steps = Math.round(Math.hypot(x1 - x0, y1 - y0))
  for (let t = 0; t <= steps; t++) {
    const x = Math.round(x0 + ((x1 - x0) * t) / steps)
    const y = Math.round(y0 + ((y1 - y0) * t) / steps)
    for (let dx = -Math.floor(w / 2); dx <= Math.floor(w / 2); dx++)
      for (let dy = -Math.floor(w / 2); dy <= Math.floor(w / 2); dy++) set(x + dx, y + dy, EMBER)
  }
  return buf
}

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const t = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0)
  return Buffer.concat([len, t, data, crc])
}

function png(size) {
  const px = draw(size)
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filter: none
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

writeFileSync(new URL('../public/icon-180.png', import.meta.url), png(180))
writeFileSync(new URL('../public/icon-192.png', import.meta.url), png(192))
writeFileSync(new URL('../public/icon-512.png', import.meta.url), png(512))
console.log('icons written')
