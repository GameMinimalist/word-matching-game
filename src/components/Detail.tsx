import { useState } from 'react'
import { Tally } from './Tally'
import { computeStats } from '../lib/streak'
import { buildHistory, freqLabel, periodWord } from '../lib/format'
import type { Store } from '../lib/useStore'

interface DetailProps {
  store: Store
  id: string
  onBack: () => void
  onEdit: (id: string) => void
}

export function Detail({ store, id, onBack, onEdit }: DetailProps) {
  const [animateIndex, setAnimateIndex] = useState<number | null>(null)
  const practice = store.data.practices.find((p) => p.id === id)

  if (!practice) {
    // Practice was deleted out from under us.
    return (
      <section className="view">
        <button className="back" onClick={onBack}>
          &#8249;&nbsp; All practices
        </button>
        <p className="lede">This practice no longer exists.</p>
      </section>
    )
  }

  const stats = computeStats(practice)
  const history = buildHistory(practice, new Date())

  const handleLog = () => {
    setAnimateIndex(stats.currentCount) // slot about to be filled
    store.logCompletion(practice.id)
  }

  const handleArchive = () => {
    store.archivePractice(practice.id)
    onBack()
  }

  const handleDelete = () => {
    if (window.confirm(`Delete "${practice.name}" and all its history? This cannot be undone.`)) {
      store.deletePractice(practice.id)
      onBack()
    }
  }

  return (
    <section className="view">
      <button className="back" onClick={onBack}>
        &#8249;&nbsp; All practices
      </button>

      <div className="d-name">{practice.name}</div>
      <div className="d-freq">{freqLabel(practice)}</div>

      <div className="period-card">
        <Tally
          count={stats.currentCount}
          target={practice.target}
          size="lg"
          mode={stats.met ? 'met' : 'prog'}
          animateIndex={animateIndex}
        />
        <div className="period-label">
          <b>{stats.currentCount}</b> of <b>{practice.target}</b> {periodWord(practice)}
        </div>
      </div>

      <button className={`log-cta ${stats.met ? 'met' : ''}`} onClick={handleLog}>
        {stats.met ? 'Target hit · log extra' : 'Log completion'}
      </button>

      <div className="stats">
        <div className="stat">
          <div className="k">Streak</div>
          <div className={`v ${stats.streak > 0 ? 'fire' : 'muted'}`}>
            {stats.streak > 0 && <span className="dot" />}
            {stats.streak}
          </div>
        </div>
        <div className="stat">
          <div className="k">Best</div>
          <div className="v">{stats.bestStreak}</div>
        </div>
        <div className="stat">
          <div className="k">Per {practice.period === 'custom' ? 'period' : practice.period}</div>
          <div className="v">{practice.target}</div>
        </div>
      </div>

      <div className="hist-head">History</div>
      <div className="hist">
        {history.map((h, i) => (
          <div key={i} className={`hist-row ${h.hit ? '' : 'miss'}`}>
            <div className="hl">
              <span className="p">{h.label}</span>
              <span className="c">
                {h.count} of {h.target}
              </span>
            </div>
            <div className="hr">
              <Tally count={h.count} target={h.target} size="hist" mode={h.hit ? 'met' : 'miss'} />
              <span className={`verdict ${h.hit ? 'hit' : 'miss'}`}>{h.hit ? 'HIT' : 'MISS'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="detail-actions">
        <button className="text-btn" onClick={() => onEdit(practice.id)}>
          Edit
        </button>
        <button className="text-btn" onClick={handleArchive}>
          {practice.archived ? 'Unarchive' : 'Archive'}
        </button>
        <button className="text-btn danger" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </section>
  )
}
