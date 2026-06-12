import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cards from '../data/cards.json'
import { createFeedEngine } from '../engine/feedEngine.js'
import {
  ALL_TOPICS,
  bumpDaily,
  getDaily,
  getSeenSet,
  getSettings,
  getSuppressedSet,
  getWarn,
  resetSeen,
  saveSettings,
  setDailyOverride,
  setWarnedAt
} from '../engine/storage.js'

const CAP_CARD = { id: 'sys-cap', type: 'cap', topic: 'system' }
const EMPTY_CARD = { id: 'sys-empty', type: 'empty', topic: 'system' }
const WARN_CARD = { id: 'sys-lowlib', type: 'warn', topic: 'system' }

// Count library cards the user could still be served: not seen, not suppressed.
function countUnseen() {
  const seen = getSeenSet()
  const suppressed = getSuppressedSet()
  return cards.filter((c) => !seen.has(c.id) && !suppressed.has(c.id)).length
}

/**
 * Drives the feed: holds the engine, the running history of shown cards, the
 * current pointer, and the daily-cap gate. Swipe up = forward (re-show cached
 * cards, or pull a fresh one from the engine); swipe down = back.
 */
export function useFeed() {
  const engine = useRef(null)
  if (!engine.current) engine.current = createFeedEngine(cards)

  const [history, setHistory] = useState([])
  const [index, setIndex] = useState(-1)
  const [seenToday, setSeenToday] = useState(() => getDaily().count)
  // bumped whenever settings change so dependent UI (stats/settings) refreshes
  const [settingsVersion, setSettingsVersion] = useState(0)

  const pushCard = useCallback((card) => {
    setHistory((h) => [...h, card])
    setIndex((i) => i + 1)
  }, [])

  const serveNew = useCallback(() => {
    const daily = getDaily()
    const settings = getSettings()
    if (!daily.override && daily.count >= settings.dailyCap) {
      pushCard(CAP_CARD)
      return
    }
    // One-time, friendly low-library nudge. Armed per library size, so a
    // recharge (which grows cards.json) re-arms it automatically.
    const warn = getWarn()
    if (
      warn.warnedAtLibrarySize !== cards.length &&
      countUnseen() < 2 * settings.dailyCap
    ) {
      setWarnedAt(cards.length)
      pushCard(WARN_CARD)
      return
    }
    const card = engine.current.next()
    if (!card) {
      pushCard(EMPTY_CARD)
      return
    }
    const d = bumpDaily()
    setSeenToday(d.count)
    pushCard(card)
  }, [pushCard])

  // first card on mount
  useEffect(() => {
    if (history.length === 0) serveNew()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const advance = useCallback(() => {
    setIndex((i) => {
      if (i < history.length - 1) return i + 1 // re-show an already-served card
      serveNew()
      return i // serveNew bumps the index itself
    })
  }, [history.length, serveNew])

  const back = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1))
  }, [])

  const keepGoing = useCallback(() => {
    setDailyOverride()
    serveNew()
  }, [serveNew])

  const openThread = useCallback(
    (threadId) => {
      engine.current.openThread(threadId)
      advance()
    },
    [advance]
  )

  const resetHistory = useCallback(() => {
    resetSeen()
    engine.current.resetSession()
    setHistory([])
    setIndex(-1)
    // re-seed on next tick
    setTimeout(() => serveNew(), 0)
  }, [serveNew])

  const onSettingsChange = useCallback(() => {
    setSettingsVersion((v) => v + 1)
    setSeenToday(getDaily().count)
  }, [])

  // Quick topic focus from the home screen. `null` = all topics. Immediately
  // serves a fresh card from the new focus so the change is visible at once.
  const setFocus = useCallback(
    (topic) => {
      saveSettings({ enabledTopics: topic ? [topic] : [...ALL_TOPICS] })
      onSettingsChange()
      serveNew()
    },
    [onSettingsChange, serveNew]
  )

  const current = index >= 0 ? history[index] : null
  const canGoBack = index > 0

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const settings = useMemo(() => getSettings(), [settingsVersion])

  const focus =
    settings.enabledTopics.length === ALL_TOPICS.length
      ? 'all'
      : settings.enabledTopics.length === 1
        ? settings.enabledTopics[0]
        : 'custom'

  // recomputed as the user advances (seenToday) or changes settings
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const unseenCount = useMemo(() => countUnseen(), [seenToday, settingsVersion])

  return {
    current,
    advance,
    back,
    canGoBack,
    keepGoing,
    openThread,
    resetHistory,
    seenToday,
    settings,
    onSettingsChange,
    focus,
    setFocus,
    unseenCount,
    totalCards: cards.length
  }
}
