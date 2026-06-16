import { useState } from 'react'
import Feed from './components/Feed.jsx'
import Settings from './components/Settings.jsx'
import FocusBar from './components/FocusBar.jsx'
import SavedView from './components/SavedView.jsx'
import { useFeed } from './hooks/useFeed.js'

export default function App() {
  const feed = useFeed()
  const [showSettings, setShowSettings] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  return (
    <div className="app">
      <header className="topbar">
        <span className="stat" aria-live="polite">
          {feed.seenToday} today
        </span>
        <FocusBar focus={feed.focus} onFocus={feed.setFocus} />
        <div className="topbar-right">
          <button
            className="icon-btn"
            aria-label="Saved cards"
            onClick={() => setShowSaved(true)}
          >
            <BookmarkIcon />
          </button>
          <button
            className="icon-btn gear"
            aria-label="Settings"
            onClick={() => setShowSettings(true)}
          >
            <GearIcon />
          </button>
        </div>
      </header>

      <Feed
        card={feed.current}
        canGoBack={feed.canGoBack}
        onNext={feed.advance}
        onPrev={feed.back}
        onOpenThread={feed.openThread}
        onKeepGoing={feed.keepGoing}
        active={!showSettings && !showSaved}
      />

      {showSaved && <SavedView onClose={() => setShowSaved(false)} />}

      {showSettings && (
        <Settings
          seenToday={feed.seenToday}
          unseenCount={feed.unseenCount}
          onClose={() => setShowSettings(false)}
          onChange={feed.onSettingsChange}
          onResetHistory={feed.resetHistory}
        />
      )}
    </div>
  )
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
      <path
        d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.6L6 21V4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm9-2c0-.5 0-1-.1-1.5l2-1.6-2-3.4-2.4 1a7.7 7.7 0 0 0-2.6-1.5L13.5 2h-3l-.4 2.5A7.7 7.7 0 0 0 7.5 6L5 5 3 8.4l2 1.6a7.6 7.6 0 0 0 0 3L3 14.6 5 18l2.5-1a7.7 7.7 0 0 0 2.6 1.5l.4 2.5h3l.4-2.5a7.7 7.7 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.6c.1-.5.1-1 .1-1.5Z"
      />
    </svg>
  )
}
