import { useCallback, useEffect, useRef, useState } from 'react'
import { exportData, loadData, parseImport, saveData, uuid } from './storage'
import type { Period, Practice, TallyData, WeekStart } from './types'

export interface NewPractice {
  name: string
  period: Period
  target: number
  customDays: number | null
  weekStart?: WeekStart
}

export interface Store {
  data: TallyData
  error: string | null
  clearError: () => void
  addPractice: (p: NewPractice) => string
  editPractice: (id: string, patch: Partial<NewPractice>) => void
  logCompletion: (id: string, at?: Date) => void
  archivePractice: (id: string) => void
  deletePractice: (id: string) => void
  exportJSON: () => string
  importJSON: (text: string) => void
}

/**
 * Owns all Tally data. Local-only: state lives in this browser's localStorage,
 * nothing leaves the device. Every mutation persists synchronously; if the
 * write fails the in-memory change is rolled back and `error` is set.
 */
export function useStore(): Store {
  const [data, setData] = useState<TallyData>(() => loadData())
  const [error, setError] = useState<string | null>(null)
  const dataRef = useRef(data)
  dataRef.current = data

  // Pick up edits made in another tab/window of the same browser.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'tally.data') setData(loadData())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /** Apply a transform to the data and persist; roll back on failure. */
  const commit = useCallback((fn: (prev: TallyData) => TallyData) => {
    const prev = dataRef.current
    const next = fn(prev)
    setData(next)
    dataRef.current = next
    try {
      saveData(next)
    } catch (e) {
      setData(prev)
      dataRef.current = prev
      setError(e instanceof Error ? e.message : 'Could not save your change.')
    }
  }, [])

  const addPractice = useCallback(
    (p: NewPractice): string => {
      const id = uuid()
      const practice: Practice = {
        id,
        name: p.name.trim() || 'Untitled',
        period: p.period,
        target: Math.max(1, Math.floor(p.target)),
        customDays: p.period === 'custom' ? Math.max(1, Math.floor(p.customDays ?? 1)) : null,
        weekStart: p.weekStart ?? 1,
        createdAt: new Date().toISOString(),
        archived: false,
        log: [],
      }
      commit((d) => ({ ...d, practices: [...d.practices, practice] }))
      return id
    },
    [commit],
  )

  const editPractice = useCallback(
    (id: string, patch: Partial<NewPractice>) => {
      commit((d) => ({
        ...d,
        practices: d.practices.map((p) => {
          if (p.id !== id) return p
          const period = patch.period ?? p.period
          return {
            ...p,
            name: patch.name !== undefined ? patch.name.trim() || p.name : p.name,
            period,
            target: patch.target !== undefined ? Math.max(1, Math.floor(patch.target)) : p.target,
            customDays:
              period === 'custom'
                ? Math.max(1, Math.floor(patch.customDays ?? p.customDays ?? 1))
                : null,
            weekStart: patch.weekStart ?? p.weekStart,
          }
        }),
      }))
    },
    [commit],
  )

  const logCompletion = useCallback(
    (id: string, at: Date = new Date()) => {
      commit((d) => ({
        ...d,
        practices: d.practices.map((p) =>
          p.id === id ? { ...p, log: [...p.log, at.toISOString()] } : p,
        ),
      }))
    },
    [commit],
  )

  const archivePractice = useCallback(
    (id: string) => {
      commit((d) => ({
        ...d,
        practices: d.practices.map((p) => (p.id === id ? { ...p, archived: !p.archived } : p)),
      }))
    },
    [commit],
  )

  const deletePractice = useCallback(
    (id: string) => {
      commit((d) => ({ ...d, practices: d.practices.filter((p) => p.id !== id) }))
    },
    [commit],
  )

  const exportJSON = useCallback(() => exportData(dataRef.current), [])

  const importJSON = useCallback(
    (text: string) => {
      try {
        const imported = parseImport(text)
        commit(() => imported)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not read that backup file.')
      }
    },
    [commit],
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    data,
    error,
    clearError,
    addPractice,
    editPractice,
    logCompletion,
    archivePractice,
    deletePractice,
    exportJSON,
    importJSON,
  }
}
