import type { Bounds, Period, Practice, WeekStart } from './types'

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Local midnight at the start of the given date. */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Start of the calendar week containing `d`, honouring `weekStart`
 * (0 = Sunday, 1 = Monday).
 */
function startOfWeek(d: Date, weekStart: WeekStart): Date {
  const day = startOfDay(d)
  const diff = (day.getDay() - weekStart + 7) % 7
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() - diff)
}

interface PeriodOpts {
  weekStart?: WeekStart
  customDays?: number | null
  /** anchor for rolling `custom` buckets — the practice's createdAt */
  anchor?: Date
}

/**
 * The half-open bucket [start, end) of the given `period` that contains `date`.
 * All math is in the host's local timezone.
 */
export function periodBounds(period: Period, date: Date, opts: PeriodOpts = {}): Bounds {
  switch (period) {
    case 'hour': {
      const start = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
      )
      return { start, end: new Date(start.getTime() + 60 * 60 * 1000) }
    }
    case 'day': {
      const start = startOfDay(date)
      return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1) }
    }
    case 'week': {
      const start = startOfWeek(date, opts.weekStart ?? 1)
      return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7) }
    }
    case 'month': {
      const start = new Date(date.getFullYear(), date.getMonth(), 1)
      return { start, end: new Date(date.getFullYear(), date.getMonth() + 1, 1) }
    }
    case 'year': {
      const start = new Date(date.getFullYear(), 0, 1)
      return { start, end: new Date(date.getFullYear() + 1, 0, 1) }
    }
    case 'custom': {
      const len = opts.customDays && opts.customDays > 0 ? Math.floor(opts.customDays) : 1
      const anchor = startOfDay(opts.anchor ?? date)
      // Which rolling bucket (relative to the anchor day) contains `date`?
      const diffDays = Math.floor((startOfDay(date).getTime() - anchor.getTime()) / MS_PER_DAY)
      const bucket = Math.floor(diffDays / len)
      const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + bucket * len)
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + len)
      return { start, end }
    }
  }
}

function boundsFor(practice: Practice, date: Date): Bounds {
  return periodBounds(practice.period, date, {
    weekStart: practice.weekStart,
    customDays: practice.customDays,
    anchor: new Date(practice.createdAt),
  })
}

/**
 * All period buckets from the one containing `createdAt` through the one
 * containing `now`, ordered oldest -> newest. The last element is always the
 * in-progress (current) period.
 */
export function periodsSince(practice: Practice, now: Date): Bounds[] {
  const created = new Date(practice.createdAt)
  const out: Bounds[] = []
  let cur = boundsFor(practice, created)
  // Guard against pathological loops (e.g. clock skew); a personal tracker
  // will never legitimately produce this many buckets.
  const MAX = 200000
  while (cur.start.getTime() <= now.getTime() && out.length < MAX) {
    out.push(cur)
    if (now.getTime() < cur.end.getTime()) break // reached the current period
    cur = boundsFor(practice, cur.end) // cur.end is the start of the next bucket
  }
  return out
}

/** Number of log timestamps that fall within [bounds.start, bounds.end). */
export function countIn(bounds: Bounds, log: string[]): number {
  const s = bounds.start.getTime()
  const e = bounds.end.getTime()
  let n = 0
  for (const iso of log) {
    const t = new Date(iso).getTime()
    if (t >= s && t < e) n++
  }
  return n
}
