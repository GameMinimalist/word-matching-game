import { useEffect, useRef, useState } from 'react'
import { ALL_TOPICS } from '../engine/storage.js'
import { topicAccent, topicLabel } from '../topics.js'

/**
 * Always-visible topic focus on the home screen. Tap to jump the feed to a
 * single topic (or back to "All topics") without opening settings.
 */
export default function FocusBar({ focus, onFocus }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [open])

  const label =
    focus === 'all' ? 'All topics' : focus === 'custom' ? 'Custom mix' : topicLabel(focus)
  const dot = focus === 'all' || focus === 'custom' ? null : topicAccent(focus)

  const choose = (topic) => {
    onFocus(topic)
    setOpen(false)
  }

  return (
    <div className="focusbar" ref={ref}>
      <button
        type="button"
        className="focus-pill"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {dot && <span className="topic-dot" style={{ background: dot }} />}
        <span className="focus-label">{label}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="focus-menu" role="menu">
          <button
            type="button"
            role="menuitemradio"
            aria-checked={focus === 'all'}
            className={`focus-item ${focus === 'all' ? 'active' : ''}`}
            onClick={() => choose(null)}
          >
            <span className="focus-dot-all" />
            All topics
          </button>
          {ALL_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              role="menuitemradio"
              aria-checked={focus === topic}
              className={`focus-item ${focus === topic ? 'active' : ''}`}
              onClick={() => choose(topic)}
            >
              <span className="topic-dot" style={{ background: topicAccent(topic) }} />
              {topicLabel(topic)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
