import { useCallback, useMemo, useState } from 'react'
import cards from '../data/cards.json'
import Feed from './Feed.jsx'
import { getBookmarks, removeBookmark } from '../engine/storage.js'
import { topicAccent, topicLabel } from '../topics.js'

const BY_ID = new Map(cards.map((c) => [c.id, c]))

// Saved cards, newest first, resolved to full card objects.
function loadSaved() {
  return [...getBookmarks()]
    .reverse()
    .map((b) => BY_ID.get(b.cardId))
    .filter(Boolean)
}

/**
 * The "Saved" overlay. A list of saved cards; tap one to read it in the same
 * full-screen, scroll-edge-swipe view as the main feed — but navigating only
 * within saved cards. Un-saving works from both the list and the reader.
 */
export default function SavedView({ onClose }) {
  const [items, setItems] = useState(loadSaved)
  const [reader, setReader] = useState(null) // index into items, or null = list

  const refresh = useCallback((keepIndex) => {
    const next = loadSaved()
    setItems(next)
    if (keepIndex != null) {
      if (next.length === 0) setReader(null)
      else setReader((i) => Math.min(i ?? 0, next.length - 1))
    }
  }, [])

  const unsave = useCallback(
    (cardId) => {
      removeBookmark(cardId)
      refresh(reader)
    },
    [refresh, reader]
  )

  if (reader != null && items[reader]) {
    return (
      <SavedReader
        items={items}
        index={reader}
        onIndex={setReader}
        onUnsaveCurrent={() => unsave(items[reader].id)}
        onBack={() => setReader(null)}
      />
    )
  }

  return (
    <div className="saved-overlay">
      <header className="saved-head">
        <h2>Saved</h2>
        <button className="icon-btn" aria-label="Close saved" onClick={onClose}>
          ✕
        </button>
      </header>

      {items.length === 0 ? (
        <div className="saved-empty">
          <div className="big-emoji">🔖</div>
          <p className="body">
            Nothing saved yet. Tap the bookmark on any card to keep it here.
          </p>
        </div>
      ) : (
        <ul className="saved-list">
          {items.map((c, i) => (
            <li key={c.id} className="saved-row">
              <button className="saved-row-main" onClick={() => setReader(i)}>
                <span
                  className="topic-dot"
                  style={{ background: topicAccent(c.topic) }}
                />
                <span className="saved-row-text">
                  <span className="saved-row-headline">{c.headline}</span>
                  <span className="saved-row-topic" style={{ color: topicAccent(c.topic) }}>
                    {topicLabel(c.topic)}
                  </span>
                </span>
              </button>
              <button
                className="saved-row-remove"
                aria-label="Remove from saved"
                onClick={() => unsave(c.id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SavedReader({ items, index, onIndex, onUnsaveCurrent, onBack }) {
  const card = items[index]
  const next = useCallback(
    () => onIndex((i) => Math.min(items.length - 1, i + 1)),
    [items.length, onIndex]
  )
  const prev = useCallback(() => onIndex((i) => Math.max(0, i - 1)), [onIndex])
  const noop = useMemo(() => () => {}, [])

  return (
    <div className="saved-overlay reader">
      <header className="saved-head floating">
        <button className="icon-btn" aria-label="Back to saved list" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="saved-counter">
          {index + 1} / {items.length}
        </span>
      </header>

      <Feed
        card={card}
        canGoBack={index > 0}
        onNext={next}
        onPrev={prev}
        onOpenThread={noop}
        onKeepGoing={noop}
        onBookmarkChange={(saved) => {
          if (!saved) onUnsaveCurrent()
        }}
      />
    </div>
  )
}
