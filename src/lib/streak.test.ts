import { describe, expect, it } from 'vitest'
import { computeStats } from './streak'
import type { Practice } from './types'

// Fixed "now": Mon 15 Jun 2026, local noon.
const NOW = new Date(2026, 5, 15, 12, 0, 0)

/** A daily practice created on 1 Jun 2026, with completions on the given days. */
function dailyWith(loggedDays: number[], target = 1, createdDay = 1): Practice {
  return {
    id: 'p',
    name: 'Test',
    period: 'day',
    target,
    customDays: null,
    weekStart: 1,
    createdAt: new Date(2026, 5, createdDay, 9, 0, 0).toISOString(),
    archived: false,
    log: loggedDays.map((d) => new Date(2026, 5, d, 18, 0, 0).toISOString()),
  }
}

describe('computeStats — streak rules', () => {
  it('clean run: consecutive hits including today', () => {
    const s = computeStats(dailyWith([11, 12, 13, 14, 15]), NOW)
    expect(s.met).toBe(true)
    expect(s.currentCount).toBe(1)
    expect(s.streak).toBe(5) // today + 4 elapsed
    expect(s.bestStreak).toBe(5)
  })

  it('current period not yet met: streak stays from elapsed, unbroken', () => {
    // today (15th) not logged; previous 4 days logged
    const s = computeStats(dailyWith([11, 12, 13, 14]), NOW)
    expect(s.met).toBe(false)
    expect(s.currentCount).toBe(0)
    expect(s.streak).toBe(4) // in-progress period does not reset the streak
    expect(s.bestStreak).toBe(4)
  })

  it('last elapsed period missed: streak resets to current-only', () => {
    // today logged, but yesterday (14th) missed
    const s = computeStats(dailyWith([10, 11, 12, 13, 15]), NOW)
    expect(s.met).toBe(true)
    expect(s.streak).toBe(1) // only the current period counts
    expect(s.bestStreak).toBe(4) // 10–13 was a run of 4
  })

  it('gap in the middle: streak counts back to first miss', () => {
    // logged: 10,11, gap on 12, then 13,14,15
    const s = computeStats(dailyWith([10, 11, 13, 14, 15]), NOW)
    expect(s.streak).toBe(3) // 13,14,15
    expect(s.bestStreak).toBe(3)
  })

  it('brand-new practice with no logs: streak 0, no misses charged', () => {
    const fresh = dailyWith([], 1, 15) // created today, never logged
    const s = computeStats(fresh, NOW)
    expect(s.streak).toBe(0)
    expect(s.bestStreak).toBe(0)
    expect(s.met).toBe(false)
  })

  it('brand-new practice logged today: streak 1', () => {
    const s = computeStats(dailyWith([15], 1, 15), NOW)
    expect(s.streak).toBe(1)
    expect(s.bestStreak).toBe(1)
    expect(s.met).toBe(true)
  })

  it('target > 1: a period only counts when the count meets target', () => {
    // target 2/day. Today has 2 (met), yesterday has 1 (miss) -> streak 1.
    const p = dailyWith([14, 15, 15], 2)
    const s = computeStats(p, NOW)
    expect(s.currentCount).toBe(2)
    expect(s.met).toBe(true)
    expect(s.streak).toBe(1)
  })
})
