import { useState } from 'react'
import { getLike, setLike } from '../engine/storage.js'

/** 👍 / 👎 on every content card. Toggling persists to localStorage. */
export default function LikeBar({ cardId }) {
  const [value, setValue] = useState(() => getLike(cardId))

  const vote = (v) => setValue(setLike(cardId, v))

  return (
    <div className="likebar">
      <button
        type="button"
        className={`like-btn ${value === 1 ? 'is-active up' : ''}`}
        aria-label="Like"
        aria-pressed={value === 1}
        onClick={() => vote(1)}
      >
        <ThumbIcon up />
      </button>
      <button
        type="button"
        className={`like-btn ${value === -1 ? 'is-active down' : ''}`}
        aria-label="Less like this"
        aria-pressed={value === -1}
        onClick={() => vote(-1)}
      >
        <ThumbIcon />
      </button>
    </div>
  )
}

function ThumbIcon({ up = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      style={{ transform: up ? 'none' : 'rotate(180deg)' }}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M2 21h2.5a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H2v10Zm5.5-9.4 3.7-7.2A1.6 1.6 0 0 1 14 5.7v3.4h4.9a1.9 1.9 0 0 1 1.9 2.3l-1.4 6.7A2 2 0 0 1 17.5 20H7.5v-8.4Z"
      />
    </svg>
  )
}
