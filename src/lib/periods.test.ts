import { describe, expect, it } from 'vitest'
import { countIn, periodBounds, periodsSince } from './periods'
import type { Practice } from './types'

describe('periodBounds', () => {
  it('day bucket is local midnight to next midnight', () => {
    const d = new Date(2026, 5, 15, 14, 30)
    const { start, end } = periodBounds('day', d)
    expect(start.getTime()).toBe(new Date(2026, 5, 15).getTime())
    expect(end.getTime()).toBe(new Date(2026, 5, 16).getTime())
  })

  it('week bucket respects weekStart = Monday', () => {
    // 15 Jun 2026 is a Monday
    const { start, end } = periodBounds('week', new Date(2026, 5, 17), { weekStart: 1 })
    expect(start.getTime()).toBe(new Date(2026, 5, 15).getTime())
    expect(end.getTime()).toBe(new Date(2026, 5, 22).getTime())
  })

  it('week bucket respects weekStart = Sunday', () => {
    const { start } = periodBounds('week', new Date(2026, 5, 17), { weekStart: 0 })
    expect(start.getTime()).toBe(new Date(2026, 5, 14).getTime()) // Sun 14 Jun
  })

  it('month bucket is first-of-month to first-of-next', () => {
    const { start, end } = periodBounds('month', new Date(2026, 5, 15))
    expect(start.getTime()).toBe(new Date(2026, 5, 1).getTime())
    expect(end.getTime()).toBe(new Date(2026, 6, 1).getTime())
  })

  it('custom rolling buckets are anchored to the start date', () => {
    const anchor = new Date(2026, 5, 1)
    // 10-day buckets: day 0–9, 10–19, ...
    const b0 = periodBounds('custom', new Date(2026, 5, 5), { customDays: 10, anchor })
    expect(b0.start.getTime()).toBe(new Date(2026, 5, 1).getTime())
    expect(b0.end.getTime()).toBe(new Date(2026, 5, 11).getTime())

    const b1 = periodBounds('custom', new Date(2026, 5, 15), { customDays: 10, anchor })
    expect(b1.start.getTime()).toBe(new Date(2026, 5, 11).getTime())
    expect(b1.end.getTime()).toBe(new Date(2026, 5, 21).getTime())
  })
})

describe('periodsSince', () => {
  const practice: Practice = {
    id: 'p',
    name: 'T',
    period: 'day',
    target: 1,
    customDays: null,
    weekStart: 1,
    createdAt: new Date(2026, 5, 10, 9).toISOString(),
    archived: false,
    log: [],
  }

  it('enumerates every period from createdAt through now', () => {
    const periods = periodsSince(practice, new Date(2026, 5, 15, 12))
    expect(periods.length).toBe(6) // 10,11,12,13,14,15
    expect(periods[0].start.getTime()).toBe(new Date(2026, 5, 10).getTime())
    expect(periods[periods.length - 1].start.getTime()).toBe(new Date(2026, 5, 15).getTime())
  })

  it('a brand-new practice has exactly one (current) period', () => {
    const fresh = { ...practice, createdAt: new Date(2026, 5, 15, 8).toISOString() }
    expect(periodsSince(fresh, new Date(2026, 5, 15, 12)).length).toBe(1)
  })
})

describe('countIn', () => {
  it('counts only timestamps within the half-open bounds', () => {
    const bounds = periodBounds('day', new Date(2026, 5, 15, 12))
    const log = [
      new Date(2026, 5, 15, 0, 0).toISOString(), // inside (start inclusive)
      new Date(2026, 5, 15, 23, 59).toISOString(), // inside
      new Date(2026, 5, 16, 0, 0).toISOString(), // end exclusive -> out
      new Date(2026, 5, 14, 23, 0).toISOString(), // before -> out
    ]
    expect(countIn(bounds, log)).toBe(2)
  })
})
