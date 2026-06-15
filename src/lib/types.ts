export type Period = 'hour' | 'day' | 'week' | 'month' | 'year' | 'custom'

export type WeekStart = 0 | 1 // 0 = Sunday, 1 = Monday

export interface Practice {
  id: string
  name: string
  period: Period
  /** completions required within one period; integer >= 1 */
  target: number
  /** length in days when period === 'custom', else null */
  customDays: number | null
  weekStart: WeekStart
  createdAt: string // ISO timestamp
  archived: boolean
  /** ISO timestamps, one appended per logged completion */
  log: string[]
}

export interface TallyData {
  version: number
  practices: Practice[]
}

export const DATA_VERSION = 1

export const emptyData = (): TallyData => ({ version: DATA_VERSION, practices: [] })

/** A half-open time bucket [start, end). */
export interface Bounds {
  start: Date
  end: Date
}
