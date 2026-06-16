import { useState } from 'react'
import { isBookmarked, toggleBookmark } from '../engine/storage.js'

/** "Save for later" toggle, shown alongside the likes on every card. */
export default function BookmarkButton({ cardId, onChange }) {
  const [saved, setSaved] = useState(() => isBookmarked(cardId))

  const toggle = () => {
    const now = toggleBookmark(cardId)
    setSaved(now)
    onChange?.(now)
  }

  return (
    <button
      type="button"
      className={`bookmark-btn ${saved ? 'is-saved' : ''}`}
      aria-label={saved ? 'Saved — tap to remove' : 'Save for later'}
      aria-pressed={saved}
      onClick={toggle}
    >
      <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
        <path
          d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.6L6 21V4.5Z"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
