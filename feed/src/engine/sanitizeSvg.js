/**
 * Defence-in-depth sanitiser for the optional inline `svg` card field.
 *
 * Card SVGs are authored at build time (by the maintainer, via the recharge
 * ritual) and bundled — they are not untrusted user input. Even so we strip the
 * obvious script vectors here and re-run the same pass at render time, and the
 * build validator rejects anything that still looks dangerous or oversized.
 * Plain JS (no DOM) so it runs in both the browser and the Node build script.
 */

export const MAX_SVG_BYTES = 10 * 1024 // ~10KB per the brief

const BANNED_TAGS = ['script', 'foreignObject', 'iframe', 'object', 'embed', 'a']

export function sanitizeSvg(input) {
  if (typeof input !== 'string') return ''
  let s = input.trim()

  // keep only the <svg>…</svg> region
  const open = s.search(/<svg[\s>]/i)
  const close = s.toLowerCase().lastIndexOf('</svg>')
  if (open === -1 || close === -1) return ''
  s = s.slice(open, close + '</svg>'.length)

  // drop comments and CDATA
  s = s.replace(/<!--[\s\S]*?-->/g, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')

  // drop banned elements entirely (with or without a closing tag)
  for (const tag of BANNED_TAGS) {
    s = s.replace(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, 'gi'), '')
    s = s.replace(new RegExp(`<${tag}\\b[^>]*/?>`, 'gi'), '')
  }

  // strip on* event-handler attributes
  s = s.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
  s = s.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')

  // neutralise javascript:/data: urls in href / xlink:href / style url()
  s = s.replace(/(href|xlink:href)\s*=\s*"(?:javascript:|data:)[^"]*"/gi, '$1="#"')
  s = s.replace(/(href|xlink:href)\s*=\s*'(?:javascript:|data:)[^']*'/gi, "$1='#'")
  s = s.replace(/style\s*=\s*"[^"]*expression[^"]*"/gi, '')

  return s.trim()
}

/** Build-time check. Returns { ok, reason }. */
export function validateSvg(input) {
  if (typeof input !== 'string') return { ok: false, reason: 'svg must be a string' }
  const bytes = Buffer.byteLength(input, 'utf8')
  if (bytes > MAX_SVG_BYTES)
    return { ok: false, reason: `svg too large (${bytes} > ${MAX_SVG_BYTES} bytes)` }
  const clean = sanitizeSvg(input)
  if (!clean) return { ok: false, reason: 'svg has no usable <svg> root' }
  if (/<script\b/i.test(input) || /\son[a-z]+\s*=/i.test(input))
    return { ok: false, reason: 'svg contains script or event handlers' }
  if (/<image\b/i.test(input) || /<(?:feImage)\b/i.test(input))
    return { ok: false, reason: 'svg embeds a raster image (not allowed)' }
  return { ok: true }
}
