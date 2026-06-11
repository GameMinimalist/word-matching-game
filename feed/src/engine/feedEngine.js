/**
 * The shuffle engine. Given the full card library plus the user's persisted
 * state (seen ids, likes, enabled topics), it serves an endless, varied feed:
 *
 *  - weighted-random across topics; 👎 mildly down-weights a topic
 *  - steers the type mix toward fact 40 / quiz 20 / concept 15 / puzzle 15 / rabbithole 10
 *  - never repeats a card until that topic's pool is exhausted, then recycles
 *  - a recap quiz only appears after its source card has been seen
 *  - never shows >2 cards of the same topic or type in a row
 *  - rabbit-hole children are held out of the shuffle and injected as a
 *    mini-thread when the user taps the teaser, after which the shuffle resumes
 *
 * Seen-tracking and likes are read straight from storage so the engine always
 * reflects the latest persisted state. `recent` and the injection queue are
 * per-session memory held on the instance.
 */
import {
  getSeenSet,
  getLikes,
  getSettings,
  markSeen
} from './storage.js'

const TYPE_TARGETS = {
  fact: 0.4,
  quiz: 0.2,
  concept: 0.15,
  puzzle: 0.15,
  rabbithole: 0.1
}

const isThreadChild = (c) => Boolean(c.threadId) && (c.threadOrder ?? 0) > 0

function weightedPick(items, weightOf) {
  const total = items.reduce((s, it) => s + Math.max(0, weightOf(it)), 0)
  if (total <= 0) return items[Math.floor(Math.random() * items.length)]
  let r = Math.random() * total
  for (const it of items) {
    r -= Math.max(0, weightOf(it))
    if (r <= 0) return it
  }
  return items[items.length - 1]
}

export function createFeedEngine(cards) {
  const byId = new Map(cards.map((c) => [c.id, c]))

  // Normal shuffle pool excludes rabbit-hole children (injected on demand).
  const poolByTopic = new Map()
  const childrenByThread = new Map()
  for (const c of cards) {
    if (isThreadChild(c)) {
      if (!childrenByThread.has(c.threadId)) childrenByThread.set(c.threadId, [])
      childrenByThread.get(c.threadId).push(c)
    } else {
      if (!poolByTopic.has(c.topic)) poolByTopic.set(c.topic, [])
      poolByTopic.get(c.topic).push(c)
    }
  }
  for (const list of childrenByThread.values()) {
    list.sort((a, b) => (a.threadOrder ?? 0) - (b.threadOrder ?? 0))
  }

  // per-session memory
  let recent = [] // last shown {topic, type}, newest last
  const queue = [] // forced next card ids (rabbit-hole threads)

  function topicWeights(enabledTopics) {
    const likes = getLikes()
    const w = {}
    for (const t of enabledTopics) w[t] = 1
    for (const [cardId, like] of Object.entries(likes)) {
      const card = byId.get(cardId)
      if (!card || !(card.topic in w)) continue
      if (like.value === -1) w[card.topic] *= 0.7 // mild down-weight per 👎
      else if (like.value === 1) w[card.topic] *= 1.08
    }
    for (const t of enabledTopics) w[t] = Math.min(3, Math.max(0.15, w[t]))
    return w
  }

  // Is a card allowed to be served right now (ignoring seen)?
  function recapReady(card, seen) {
    if (card.type === 'quiz' && card.recapOf) return seen.has(card.recapOf)
    return true
  }

  function candidatesFor(topic, seen) {
    const pool = poolByTopic.get(topic) || []
    const ready = pool.filter((c) => recapReady(c, seen))
    const unseen = ready.filter((c) => !seen.has(c.id))
    // unseen until exhausted; once a topic is exhausted, recycle the ready set
    return unseen.length ? unseen : ready
  }

  function lastTwoShare(key) {
    return (
      recent.length >= 2 &&
      recent[recent.length - 1][key] === recent[recent.length - 2][key]
    )
  }

  function remember(card) {
    recent.push({ topic: card.topic, type: card.type })
    if (recent.length > 4) recent.shift()
  }

  /** The next card, or null if nothing is eligible (e.g. all topics off). */
  function next() {
    if (queue.length) {
      const card = byId.get(queue.shift())
      if (card) {
        markSeen(card.id)
        remember(card)
        return card
      }
    }

    const seen = getSeenSet()
    const settings = getSettings()
    const enabled = settings.enabledTopics.length
      ? settings.enabledTopics
      : [...poolByTopic.keys()]

    // topics that actually have something to show
    let topics = enabled.filter((t) => candidatesFor(t, seen).length > 0)
    if (!topics.length) return null

    // avoid a 3rd consecutive card of the same topic
    if (lastTwoShare('topic')) {
      const lastTopic = recent[recent.length - 1].topic
      const others = topics.filter((t) => t !== lastTopic)
      if (others.length) topics = others
    }

    const weights = topicWeights(enabled)
    const topic = weightedPick(topics, (t) => weights[t] ?? 1)

    let candidates = candidatesFor(topic, seen)

    // avoid a 3rd consecutive card of the same type (when alternatives exist)
    if (lastTwoShare('type')) {
      const lastType = recent[recent.length - 1].type
      const others = candidates.filter((c) => c.type !== lastType)
      if (others.length) candidates = others
    }

    // choose a type present in candidates, steered toward the target mix,
    // then a uniformly-random card of that type
    const typesPresent = [...new Set(candidates.map((c) => c.type))]
    const type = weightedPick(typesPresent, (t) => TYPE_TARGETS[t] ?? 0.1)
    const ofType = candidates.filter((c) => c.type === type)
    const card = ofType[Math.floor(Math.random() * ofType.length)]

    markSeen(card.id)
    remember(card)
    return card
  }

  /** User tapped a rabbit-hole teaser: inject its children next, in order. */
  function openThread(threadId) {
    const kids = childrenByThread.get(threadId) || []
    const ids = kids.map((c) => c.id)
    queue.unshift(...ids)
    return ids.length
  }

  function getThreadChildren(threadId) {
    return childrenByThread.get(threadId) || []
  }

  /** Forget per-session memory (used when seen-history is reset). */
  function resetSession() {
    recent = []
    queue.length = 0
  }

  return { next, openThread, getThreadChildren, resetSession, byId }
}
