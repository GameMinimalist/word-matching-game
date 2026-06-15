import { useState } from 'react'
import type { Store } from '../lib/useStore'
import type { Period, WeekStart } from '../lib/types'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'custom', label: 'Custom' },
]

interface FormProps {
  store: Store
  id?: string
  onDone: () => void
  onCancel: () => void
}

export function PracticeForm({ store, id, onDone, onCancel }: FormProps) {
  const existing = id ? store.data.practices.find((p) => p.id === id) : undefined
  const isEdit = Boolean(existing)

  const [name, setName] = useState(existing?.name ?? '')
  const [period, setPeriod] = useState<Period>(existing?.period ?? 'day')
  const [target, setTarget] = useState<number>(existing?.target ?? 1)
  const [customDays, setCustomDays] = useState<number>(existing?.customDays ?? 7)
  const [weekStart, setWeekStart] = useState<WeekStart>(existing?.weekStart ?? 1)

  const canSave = name.trim().length > 0 && target >= 1 && (period !== 'custom' || customDays >= 1)

  const save = () => {
    if (!canSave) return
    const payload = {
      name,
      period,
      target: Math.max(1, Math.floor(target)),
      customDays: period === 'custom' ? Math.max(1, Math.floor(customDays)) : null,
      weekStart,
    }
    if (existing) store.editPractice(existing.id, payload)
    else store.addPractice(payload)
    onDone()
  }

  return (
    <section className="view">
      <button className="back" onClick={onCancel}>
        &#8249;&nbsp; Cancel
      </button>

      <div className="form-title">{isEdit ? 'Edit practice' : 'New practice'}</div>

      <label className="field">
        <span className="field-label">Name</span>
        <input
          className="input"
          type="text"
          value={name}
          autoFocus
          placeholder="e.g. Strength training"
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">Per</span>
        <div className="seg">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`seg-btn ${period === p.value ? 'on' : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </label>

      {period === 'custom' && (
        <label className="field">
          <span className="field-label">Every N days</span>
          <input
            className="input num"
            type="number"
            min={1}
            value={customDays}
            onChange={(e) => setCustomDays(Number(e.target.value))}
          />
        </label>
      )}

      {period === 'week' && (
        <label className="field">
          <span className="field-label">Week starts</span>
          <div className="seg">
            <button
              type="button"
              className={`seg-btn ${weekStart === 1 ? 'on' : ''}`}
              onClick={() => setWeekStart(1)}
            >
              Monday
            </button>
            <button
              type="button"
              className={`seg-btn ${weekStart === 0 ? 'on' : ''}`}
              onClick={() => setWeekStart(0)}
            >
              Sunday
            </button>
          </div>
        </label>
      )}

      <label className="field">
        <span className="field-label">
          Target —{' '}
          {target === 1
            ? `once per ${period === 'custom' ? `${customDays}d` : period}`
            : `${target}× per ${period === 'custom' ? `${customDays}d` : period}`}
        </span>
        <div className="stepper">
          <button
            type="button"
            className="step"
            aria-label="Decrease target"
            onClick={() => setTarget((t) => Math.max(1, t - 1))}
          >
            −
          </button>
          <span className="step-val">{target}</span>
          <button
            type="button"
            className="step"
            aria-label="Increase target"
            onClick={() => setTarget((t) => t + 1)}
          >
            +
          </button>
        </div>
      </label>

      <button className="primary" disabled={!canSave} onClick={save}>
        {isEdit ? 'Save changes' : 'Create practice'}
      </button>
    </section>
  )
}
