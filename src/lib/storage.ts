import { DATA_VERSION, emptyData, type Practice, type TallyData } from './types'

const KEY = 'tally.data'

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  // Fallback for older WebViews.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function migrate(raw: unknown): TallyData {
  if (!raw || typeof raw !== 'object') return emptyData()
  const data = raw as Partial<TallyData>
  if (!Array.isArray(data.practices)) return emptyData()
  // Backfill any fields that older versions may have lacked.
  const practices: Practice[] = data.practices.map((p) => ({
    id: p.id ?? '',
    name: p.name ?? 'Untitled',
    period: p.period ?? 'day',
    target: typeof p.target === 'number' && p.target >= 1 ? Math.floor(p.target) : 1,
    customDays: p.customDays ?? null,
    weekStart: p.weekStart === 0 ? 0 : 1,
    createdAt: p.createdAt ?? new Date().toISOString(),
    archived: Boolean(p.archived),
    log: Array.isArray(p.log) ? p.log : [],
  }))
  return { version: DATA_VERSION, practices }
}

export function loadData(): TallyData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyData()
    return migrate(JSON.parse(raw))
  } catch {
    return emptyData()
  }
}

export function saveData(data: TallyData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Storage full or blocked (private mode). Surface to the caller.
    throw new Error('Could not save — device storage is full or unavailable.')
  }
}

/** Pretty JSON for the backup/export action. */
export function exportData(data: TallyData): string {
  return JSON.stringify(data, null, 2)
}

/** Parse + validate an imported backup. Throws on malformed input. */
export function parseImport(text: string): TallyData {
  const parsed = JSON.parse(text)
  const data = migrate(parsed)
  if (!Array.isArray(data.practices)) throw new Error('Not a valid Tally backup.')
  return data
}
