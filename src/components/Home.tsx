import { useState } from 'react'
import { Tally } from './Tally'
import { computeStats } from '../lib/streak'
import { freqLabel, streakUnit } from '../lib/format'
import type { Store } from '../lib/useStore'
import type { Practice } from '../lib/types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function todayLabel(d = new Date()): string {
  return `${WEEKDAYS[d.getDay()]} · ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

interface HomeProps {
  store: Store
  onOpen: (id: string) => void
  onNew: () => void
  onBackup: () => void
}

export function Home({ store, onOpen, onNew, onBackup }: HomeProps) {
  const [justLogged, setJustLogged] = useState<{ id: string; index: number } | null>(null)
  const practices = store.data.practices.filter((p) => !p.archived)

  const handleLog = (p: Practice, met: boolean, count: number) => {
    if (met) return // already met this period — extra logging only from detail
    store.logCompletion(p.id)
    setJustLogged({ id: p.id, index: count }) // the slot just filled
  }

  return (
    <section className="view">
      <div className="topbar">
        <div className="wordmark">
          <span className="glyph">|||&#8260;</span>Tally
        </div>
        <div className="topbar-right">
          <span className="today">{todayLabel()}</span>
          <button className="icon-btn" onClick={onBackup} aria-label="Backup &amp; settings">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle cx="4" cy="10" r="1.6" fill="currentColor" />
              <circle cx="10" cy="10" r="1.6" fill="currentColor" />
              <circle cx="16" cy="10" r="1.6" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {practices.length === 0 ? (
        <div className="empty">
          <p className="empty-lede">No practices yet.</p>
          <p className="empty-sub">
            Add one thing you want to do regularly. Tap to log it; miss a period and the streak
            resets — harsh but fair.
          </p>
          <button className="primary" onClick={onNew}>
            New practice
          </button>
        </div>
      ) : (
        <>
          <p className="lede">
            Tap a stroke to log it. Miss a period and the streak resets — harsh but fair.
          </p>
          <div className="list">
            {practices.map((p) => {
              const stats = computeStats(p)
              const met = stats.met
              const dead = stats.streak === 0
              const animateIndex = justLogged?.id === p.id ? justLogged.index : null
              return (
                <div
                  key={p.id}
                  className="row"
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.name}, open`}
                  onClick={() => onOpen(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onOpen(p.id)
                    }
                  }}
                >
                  <div className="info">
                    <div className="name">{p.name}</div>
                    <div className="meta">
                      <span>{freqLabel(p)}</span>
                      <span className="sep">·</span>
                      <span className={`streak ${dead ? 'dead' : ''}`}>
                        <span className="ember" />
                        {stats.streak === 0 ? 'no streak' : `${stats.streak} ${streakUnit(p)}`}
                      </span>
                    </div>
                  </div>
                  <div className="right">
                    <Tally
                      count={stats.currentCount}
                      target={p.target}
                      size="sm"
                      mode={met ? 'met' : 'prog'}
                      animateIndex={animateIndex}
                    />
                    <button
                      className={`logbtn ${met ? 'done' : ''}`}
                      aria-label={met ? 'Target met' : `Log ${p.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLog(p, met, stats.currentCount)
                      }}
                    >
                      {met ? (
                        <svg width="20" height="20" viewBox="0 0 20 20">
                          <path className="tick" d="M5 10.5 8.5 14 15 6.5" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20">
                          <line className="plus" x1="10" y1="5" x2="10" y2="15" />
                          <line className="plus" x1="5" y1="10" x2="15" y2="10" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <button className="ghost-add" onClick={onNew}>
            + New practice
          </button>
        </>
      )}
    </section>
  )
}
