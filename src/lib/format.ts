import { countIn, periodsSince } from './periods'
import type { Bounds, Period, Practice } from './types'

/** "Daily" / "Weekly" / "3× / week" / "2× / 10d" */
export function freqLabel(p: Practice): string {
  if (p.period === 'custom') {
    const d = p.customDays ?? 1
    return p.target === 1 ? `Every ${d}d` : `${p.target}× / ${d}d`
  }
  if (p.target === 1) {
    const map: Record<Exclude<Period, 'custom'>, string> = {
      hour: 'Hourly',
      day: 'Daily',
      week: 'Weekly',
      month: 'Monthly',
      year: 'Yearly',
    }
    return map[p.period]
  }
  return `${p.target}× / ${p.period}`
}

/** short streak unit: d / wk / mo / yr / hr / (custom days) */
export function streakUnit(p: Practice): string {
  switch (p.period) {
    case 'hour':
      return 'hr'
    case 'day':
      return 'd'
    case 'week':
      return 'wk'
    case 'month':
      return 'mo'
    case 'year':
      return 'yr'
    case 'custom':
      return 'p'
  }
}

/** The word used in the detail "x of y this week" label. */
export function periodWord(p: Practice): string {
  switch (p.period) {
    case 'hour':
      return 'this hour'
    case 'day':
      return 'today'
    case 'week':
      return 'this week'
    case 'month':
      return 'this month'
    case 'year':
      return 'this year'
    case 'custom':
      return 'this period'
  }
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * A relative label for the bucket at `offset` periods back from the current
 * one (offset 0 = current period).
 */
function bucketLabel(p: Practice, bounds: Bounds, offset: number): string {
  switch (p.period) {
    case 'hour':
      if (offset === 0) return 'This hour'
      if (offset === 1) return 'Last hour'
      return `${offset} hrs ago`
    case 'day':
      if (offset === 0) return 'Today'
      if (offset === 1) return 'Yesterday'
      if (offset < 7) return WEEKDAYS[bounds.start.getDay()]
      return `${bounds.start.getDate()} ${MONTHS[bounds.start.getMonth()]}`
    case 'week':
      if (offset === 0) return 'This week'
      if (offset === 1) return 'Last week'
      return `${offset} wks ago`
    case 'month':
      if (offset === 0) return 'This month'
      if (offset === 1) return 'Last month'
      return `${MONTHS[bounds.start.getMonth()]} ${bounds.start.getFullYear()}`
    case 'year':
      if (offset === 0) return 'This year'
      if (offset === 1) return 'Last year'
      return String(bounds.start.getFullYear())
    case 'custom':
      if (offset === 0) return 'This period'
      if (offset === 1) return 'Last period'
      return `${offset} periods ago`
  }
}

export interface HistoryRow {
  label: string
  count: number
  target: number
  hit: boolean
}

/** Most-recent-first list of up to `limit` periods for the detail screen. */
export function buildHistory(practice: Practice, now: Date, limit = 12): HistoryRow[] {
  const periods = periodsSince(practice, now)
  const rows: HistoryRow[] = []
  for (let i = periods.length - 1; i >= 0 && rows.length < limit; i--) {
    const offset = periods.length - 1 - i
    const count = countIn(periods[i], practice.log)
    rows.push({
      label: bucketLabel(practice, periods[i], offset),
      count,
      target: practice.target,
      hit: count >= practice.target,
    })
  }
  return rows
}
