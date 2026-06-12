import { useState } from 'react'
import {
  ALL_TOPICS,
  exportData,
  getSettings,
  saveSettings
} from '../engine/storage.js'
import { topicAccent, topicLabel } from '../topics.js'

/** Minimal settings sheet behind the gear: topics, daily cap, export, reset. */
export default function Settings({
  onClose,
  onChange,
  onResetHistory,
  seenToday,
  unseenCount
}) {
  const [settings, setSettings] = useState(() => getSettings())
  const [didReset, setDidReset] = useState(false)

  function update(patch) {
    const next = saveSettings(patch)
    setSettings(next)
    onChange?.()
  }

  function toggleTopic(topic) {
    const on = settings.enabledTopics.includes(topic)
    let enabledTopics = on
      ? settings.enabledTopics.filter((t) => t !== topic)
      : [...settings.enabledTopics, topic]
    if (enabledTopics.length === 0) enabledTopics = [topic] // never allow zero
    update({ enabledTopics })
  }

  function download() {
    const data = JSON.stringify(exportData(), null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `feed-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function resetHistory() {
    onResetHistory?.()
    setDidReset(true)
    setTimeout(() => setDidReset(false), 1800)
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-head">
          <h2>Settings</h2>
          <button className="icon-btn" aria-label="Close settings" onClick={onClose}>
            ✕
          </button>
        </div>

        <section className="sheet-section">
          <h3>Topics</h3>
          <div className="topic-list">
            {ALL_TOPICS.map((topic) => {
              const on = settings.enabledTopics.includes(topic)
              return (
                <button
                  key={topic}
                  type="button"
                  className={`topic-toggle ${on ? 'on' : ''}`}
                  style={{ '--accent': topicAccent(topic) }}
                  aria-pressed={on}
                  onClick={() => toggleTopic(topic)}
                >
                  <span className="topic-dot" style={{ background: topicAccent(topic) }} />
                  {topicLabel(topic)}
                </button>
              )
            })}
          </div>
        </section>

        <section className="sheet-section">
          <h3>Daily cap</h3>
          <div className="cap-row">
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={settings.dailyCap}
              onChange={(e) => update({ dailyCap: Number(e.target.value) })}
            />
            <span className="cap-value">{settings.dailyCap}</span>
          </div>
          <p className="sheet-note">
            {seenToday} seen today
            {typeof unseenCount === 'number' && ` · ${unseenCount} cards unseen`}
          </p>
        </section>

        <section className="sheet-section">
          <h3>Data</h3>
          <div className="btn-col">
            <button type="button" className="ghost-btn wide" onClick={download}>
              Export my data (JSON)
            </button>
            <button type="button" className="ghost-btn wide danger" onClick={resetHistory}>
              {didReset ? 'History reset ✓' : 'Reset seen history'}
            </button>
          </div>
        </section>

        <p className="sheet-footer">Everything stays on this device.</p>
      </div>
    </div>
  )
}
