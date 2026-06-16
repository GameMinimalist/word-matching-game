/**
 * Generate the PWA icons with zero dependencies (Node's built-in zlib only).
 *
 * Draws the Feed mark: a small stack of rounded "cards" in the warm accent
 * colour on the app's dark background. Outputs the PNG sizes referenced by
 * index.html and manifest.webmanifest. Re-run with `npm run build:icons`.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(OUT, { recursive: true })

const BG = [14, 15, 19] // #0e0f13
const ACCENT = [232, 176, 75] // warm amber
const ACCENT_DIM = [120, 94, 48]
const ACCENT_DIMMER = [78, 62, 36]

// --- minimal RGBA canvas -------------------------------------------------
function makeCanvas(size, bg) {
  const buf = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    buf[i * 4] = bg[0]
    buf[i * 4 + 1] = bg[1]
    buf[i * 4 + 2] = bg[2]
    buf[i * 4 + 3] = 255
  }
  return buf
}

function fillRoundedRect(buf, size, x, y, w, h, r, color) {
  const x1 = x + w
  const y1 = y + h
  for (let py = Math.max(0, Math.floor(y)); py < Math.min(size, Math.ceil(y1)); py++) {
    for (let px = Math.max(0, Math.floor(x)); px < Math.min(size, Math.ceil(x1)); px++) {
      // rounded-corner test
      let inside = true
      const corners = [
        [x + r, y + r],
        [x1 - r, y + r],
        [x + r, y1 - r],
        [x1 - r, y1 - r]
      ]
      if (px < x + r && py < y + r) inside = dist(px, py, corners[0]) <= r
      else if (px > x1 - r && py < y + r) inside = dist(px, py, corners[1]) <= r
      else if (px < x + r && py > y1 - r) inside = dist(px, py, corners[2]) <= r
      else if (px > x1 - r && py > y1 - r) inside = dist(px, py, corners[3]) <= r
      if (inside) {
        const i = (py * size + px) * 4
        buf[i] = color[0]
        buf[i + 1] = color[1]
        buf[i + 2] = color[2]
        buf[i + 3] = 255
      }
    }
  }
}

const dist = (px, py, [cx, cy]) => Math.hypot(px + 0.5 - cx, py + 0.5 - cy)

// --- PNG encoder ---------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePNG(buf, size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type RGBA
  // rest zero (compression/filter/interlace)
  // add filter byte (0) per scanline
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0
    buf.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// --- compose the mark ----------------------------------------------------
function drawMark(size, { safe = 1 } = {}) {
  const buf = makeCanvas(size, BG)
  const s = size * 0.5 * safe // half-extent of the motif
  const cx = size / 2
  const cy = size / 2
  const w = s * 1.05
  const h = s * 0.62
  const r = s * 0.16
  const offset = s * 0.2
  // back-to-front stacked cards
  fillRoundedRect(buf, size, cx - w / 2, cy - h / 2 - offset, w, h, r, ACCENT_DIMMER)
  fillRoundedRect(buf, size, cx - w / 2, cy - h / 2, w, h, r, ACCENT_DIM)
  fillRoundedRect(buf, size, cx - w / 2, cy - h / 2 + offset, w, h, r, ACCENT)
  return encodePNG(buf, size)
}

const targets = [
  { name: 'icon-192.png', size: 192, safe: 0.92 },
  { name: 'icon-512.png', size: 512, safe: 0.92 },
  { name: 'icon-180.png', size: 180, safe: 0.92 },
  { name: 'icon-512-maskable.png', size: 512, safe: 0.66 }
]

for (const t of targets) {
  writeFileSync(join(OUT, t.name), drawMark(t.size, { safe: t.safe }))
  console.log('icon', t.name)
}
console.log('Icons written to', OUT)
