import { countIn, periodsSince } from './periods'
import type { Bounds, Practice } from './types'

export interface PracticeStats {
  /** completions logged in the current (in-progress) period */
  currentCount: number
  /** currentCount >= target */
  met: boolean
  /** consecutive hits; the in-progress period counts only once met */
  streak: number
  /** longest run of consecutive hits across the whole history */
  bestStreak: number
}

function isHit(bounds: Bounds, practice: Practice): boolean {
  return countIn(bounds, practice.log) >= practice.target
}

/**
 * Compute current progress and streaks from the log — the log is the single
 * source of truth; nothing is stored.
 *
 * "Harsh but fair": the current in-progress period never breaks a streak, but
 * the first missed *elapsed* period (zero-or-too-few logs in a period that has
 * fully passed) resets it.
 */
export function computeStats(practice: Practice, now: Date = new Date()): PracticeStats {
  const periods = periodsSince(practice, now)

  // A brand-new practice always has at least its current period.
  const current = periods[periods.length - 1]
  const elapsed = periods.slice(0, -1)

  const currentCount = current ? countIn(current, practice.log) : 0
  const met = currentCount >= practice.target

  // --- current streak ---
  let streak = 0
  if (current && isHit(current, practice)) streak = 1
  for (let i = elapsed.length - 1; i >= 0; i--) {
    if (isHit(elapsed[i], practice)) streak++
    else break // first missed elapsed period stops the streak
  }

  // --- best streak across full history ---
  let bestStreak = 0
  let run = 0
  periods.forEach((p, idx) => {
    const isCurrent = idx === periods.length - 1
    const hit = isHit(p, practice)
    if (isCurrent && !hit) return // in-progress + not yet met: neither counts nor breaks
    if (hit) {
      run++
      if (run > bestStreak) bestStreak = run
    } else {
      run = 0
    }
  })

  return { currentCount, met, streak, bestStreak }
}
