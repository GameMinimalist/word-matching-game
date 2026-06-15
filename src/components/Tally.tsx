import { useEffect, useRef } from 'react'

export type TallySize = 'sm' | 'lg' | 'hist'
export type TallyMode = 'prog' | 'met' | 'miss'

interface Stroke {
  x1: number
  y1: number
  x2: number
  y2: number
  index: number
}

const CFG: Record<TallySize, { sg: number; gg: number; h: number; top: number; w: number }> = {
  lg: { sg: 11, gg: 18, h: 42, top: 6, w: 3 },
  hist: { sg: 7, gg: 11, h: 24, top: 4, w: 2 },
  sm: { sg: 8, gg: 13, h: 30, top: 5, w: 2.4 },
}

/** Build stroke geometry grouped in fives (4 verticals + a diagonal slash). */
function build(total: number, size: TallySize) {
  const cfg = CFG[size]
  const groups = Math.ceil(total / 5) || 1
  const strokes: Stroke[] = []
  let x = cfg.w
  let maxX = 0
  for (let g = 0; g < groups; g++) {
    const inGroup = Math.min(5, total - g * 5)
    const verts = Math.min(inGroup, 4)
    const gx = x
    for (let j = 0; j < verts; j++) {
      const px = gx + j * cfg.sg
      strokes.push({ x1: px, y1: cfg.top, x2: px, y2: cfg.top + cfg.h, index: g * 5 + j })
    }
    let groupRight = gx + (verts - 1) * cfg.sg
    if (inGroup === 5) {
      strokes.push({
        x1: gx - 3,
        y1: cfg.top + cfg.h - 2,
        x2: gx + 3 * cfg.sg + 3,
        y2: cfg.top + 2,
        index: g * 5 + 4,
      })
      groupRight = gx + 3 * cfg.sg + 3
    }
    maxX = Math.max(maxX, groupRight)
    x = groupRight + cfg.gg
  }
  const width = Math.round(maxX + cfg.w + 2)
  const height = cfg.top * 2 + cfg.h
  return { strokes, width, height, w: cfg.w }
}

interface TallyProps {
  count: number
  target: number
  size: TallySize
  mode: TallyMode
  /** index of a stroke to animate drawing in (e.g. the one just logged) */
  animateIndex?: number | null
}

export function Tally({ count, target, size, mode, animateIndex = null }: TallyProps) {
  const { strokes, width, height, w } = build(target, size)
  const fill = mode === 'met' ? 'var(--ember)' : mode === 'miss' ? 'var(--ink-3)' : 'var(--ink)'
  const ghost = 'var(--ink-3)'

  return (
    <svg
      className="tally-svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {strokes.map((s) => {
        const on = s.index < count
        return (
          <AnimatedLine
            key={s.index}
            stroke={s}
            color={on ? fill : ghost}
            opacity={on ? 1 : 0.42}
            width={w}
            animate={on && s.index === animateIndex}
          />
        )
      })}
    </svg>
  )
}

function AnimatedLine({
  stroke,
  color,
  opacity,
  width,
  animate,
}: {
  stroke: Stroke
  color: string
  opacity: number
  width: number
  animate: boolean
}) {
  const ref = useRef<SVGLineElement>(null)

  useEffect(() => {
    if (!animate || !ref.current) return
    const el = ref.current
    const len = el.getTotalLength ? el.getTotalLength() : 48
    el.style.setProperty('--len', String(len))
    el.classList.add('draw')
  }, [animate])

  return (
    <line
      ref={ref}
      x1={stroke.x1}
      y1={stroke.y1}
      x2={stroke.x2}
      y2={stroke.y2}
      stroke={color}
      strokeWidth={width}
      opacity={opacity}
      strokeLinecap="round"
    />
  )
}
