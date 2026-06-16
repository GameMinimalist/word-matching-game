/**
 * All persistence lives here. Single-user, no backend: everything is in
 * localStorage under the `feed:` namespace. Reads are defensive (corrupt or
 * missing values fall back to sensible defaults) so a bad write can never
 * brick the feed.
 */

const KEYS = {
  seen: 'feed:seen', // string[] of card ids, in order seen
  likes: 'feed:likes', // { [cardId]: { value: 1|-1, timestamp } }
  bookmarks: 'feed:bookmarks', // [{ cardId, timestamp }] — "save for later"
  suppressed: 'feed:suppressed', // { [cardId]: timestamp } — 👎 "never show again"
  warn: 'feed:warn', // { warnedAtLibrarySize: number } — low-library warning arming
  settings: 'feed:settings', // see DEFAULT_SETTINGS
  daily: 'feed:daily' // { date: 'YYYY-MM-DD', count, override }
}

export const ALL_TOPICS = [
  'science',
  'history',
  'psychology',
  'money',
  'logic',
  'philosophy'
]

export const DEFAULT_SETTINGS = {
  enabledTopics: [...ALL_TOPICS],
  dailyCap: 60
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / private mode — ignore, app still works in-memory for the session */
  }
}

// --- seen history --------------------------------------------------------
export function getSeen() {
  const arr = read(KEYS.seen, [])
  return Array.isArray(arr) ? arr : []
}

export function getSeenSet() {
  return new Set(getSeen())
}

export function markSeen(cardId) {
  const seen = getSeen()
  if (!seen.includes(cardId)) {
    seen.push(cardId)
    write(KEYS.seen, seen)
  }
}

export function resetSeen() {
  write(KEYS.seen, [])
}

// --- likes ---------------------------------------------------------------
export function getLikes() {
  const obj = read(KEYS.likes, {})
  return obj && typeof obj === 'object' ? obj : {}
}

/**
 * Toggle: liking an already-liked card clears it. Returns the new value
 * (1|-1|0). 👎 (value -1) additionally means "never show this card again", so
 * we keep the suppressed list in sync with -1 likes.
 */
export function setLike(cardId, value) {
  const likes = getLikes()
  const current = likes[cardId]?.value
  let next
  if (current === value) {
    delete likes[cardId]
    next = 0
  } else {
    likes[cardId] = { value, timestamp: Date.now() }
    next = value
  }
  write(KEYS.likes, likes)
  if (next === -1) suppressCard(cardId)
  else unsuppressCard(cardId)
  return next
}

export function getLike(cardId) {
  return getLikes()[cardId]?.value ?? 0
}

// --- suppressed (👎 "never show again") ----------------------------------
// Map of { cardId: timestamp }. Migrated from any pre-existing -1 likes the
// first time it's read so an app update never loses past 👎 signal.
export function getSuppressed() {
  let obj = read(KEYS.suppressed, null)
  if (obj == null) {
    obj = {}
    const likes = getLikes()
    for (const [cardId, like] of Object.entries(likes)) {
      if (like?.value === -1) obj[cardId] = like.timestamp || Date.now()
    }
    write(KEYS.suppressed, obj)
  }
  return obj && typeof obj === 'object' ? obj : {}
}

export function getSuppressedSet() {
  return new Set(Object.keys(getSuppressed()))
}

export function isSuppressed(cardId) {
  return cardId in getSuppressed()
}

export function suppressCard(cardId) {
  const s = getSuppressed()
  if (!(cardId in s)) {
    s[cardId] = Date.now()
    write(KEYS.suppressed, s)
  }
}

export function unsuppressCard(cardId) {
  const s = getSuppressed()
  if (cardId in s) {
    delete s[cardId]
    write(KEYS.suppressed, s)
  }
}

// --- bookmarks ("save for later") ----------------------------------------
export function getBookmarks() {
  const arr = read(KEYS.bookmarks, [])
  return Array.isArray(arr) ? arr : []
}

export function isBookmarked(cardId) {
  return getBookmarks().some((b) => b.cardId === cardId)
}

/** Toggle a bookmark. Returns true if the card is now saved, false if removed. */
export function toggleBookmark(cardId) {
  const list = getBookmarks()
  const i = list.findIndex((b) => b.cardId === cardId)
  if (i >= 0) {
    list.splice(i, 1)
    write(KEYS.bookmarks, list)
    return false
  }
  list.push({ cardId, timestamp: Date.now() })
  write(KEYS.bookmarks, list)
  return true
}

export function removeBookmark(cardId) {
  write(
    KEYS.bookmarks,
    getBookmarks().filter((b) => b.cardId !== cardId)
  )
}

// --- low-library warning arming ------------------------------------------
export function getWarn() {
  const w = read(KEYS.warn, null)
  return w && typeof w === 'object' ? w : { warnedAtLibrarySize: null }
}

export function setWarnedAt(librarySize) {
  write(KEYS.warn, { warnedAtLibrarySize: librarySize })
}

// --- export (future v2 training data) ------------------------------------
export function exportData() {
  const likes = getLikes()
  return {
    exportedAt: new Date().toISOString(),
    note:
      'likes.value 1 = 👍 (more like this); likes.value -1 = 👎 = suppressed ' +
      '("never show again"). Use 👍 to steer future generation toward, 👎 away. ' +
      'bookmarks = cards saved for later. All ids reference cards.json.',
    likes: Object.entries(likes).map(([cardId, { value, timestamp }]) => ({
      cardId,
      value,
      timestamp
    })),
    suppressed: Object.entries(getSuppressed()).map(([cardId, timestamp]) => ({
      cardId,
      timestamp
    })),
    bookmarks: getBookmarks()
  }
}

// --- settings ------------------------------------------------------------
export function getSettings() {
  const s = read(KEYS.settings, null)
  if (!s || typeof s !== 'object') return { ...DEFAULT_SETTINGS }
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    enabledTopics: Array.isArray(s.enabledTopics)
      ? s.enabledTopics.filter((t) => ALL_TOPICS.includes(t))
      : [...ALL_TOPICS]
  }
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch }
  write(KEYS.settings, next)
  return next
}

// --- daily counter -------------------------------------------------------
export function todayStr(date = new Date()) {
  // local date, not UTC — the day rolls over at the user's midnight
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDaily() {
  const d = read(KEYS.daily, null)
  const today = todayStr()
  if (!d || d.date !== today) return { date: today, count: 0, override: false }
  return { date: today, count: d.count || 0, override: !!d.override }
}

export function bumpDaily() {
  const d = getDaily()
  d.count += 1
  write(KEYS.daily, d)
  return d
}

export function setDailyOverride() {
  const d = getDaily()
  d.override = true
  write(KEYS.daily, d)
  return d
}
