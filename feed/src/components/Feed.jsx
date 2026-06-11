import { useEffect, useRef } from 'react'
import Card from './Card.jsx'

const SWIPE_THRESHOLD = 60 // px of vertical travel before a swipe counts
const NAV_LOCK_MS = 380 // throttle so a flick doesn't skip several cards
const EDGE_SLACK = 4 // px tolerance for "at the top/bottom of the scroll"

/**
 * The gesture surface. Navigation only fires when the card's own text is
 * already scrolled to its edge: swipe up at the bottom = next, swipe down at
 * the top = previous. While there's more text to read, a swipe just scrolls
 * the card — so reading never trips an accidental card change. Wheel + arrow
 * keys follow the same rule; thin edge tap-zones give desktop a mouse option.
 */
export default function Feed({ card, onNext, onPrev, canGoBack, onOpenThread, onKeepGoing }) {
  const start = useRef(null)
  const locked = useRef(false)

  const lock = () => {
    locked.current = true
    setTimeout(() => (locked.current = false), NAV_LOCK_MS)
  }
  const next = () => {
    if (locked.current) return
    lock()
    onNext()
  }
  const prev = () => {
    if (locked.current || !canGoBack) return
    lock()
    onPrev()
  }

  // Edge state of the scrollable card body under a given event target.
  const edgesFor = (target) => {
    const el = target?.closest?.('.card-body')
    if (!el) return { atTop: true, atBottom: true }
    const atTop = el.scrollTop <= EDGE_SLACK
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - EDGE_SLACK
    return { atTop, atBottom }
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canGoBack])

  const onTouchStart = (e) => {
    const t = e.touches[0]
    start.current = { y: t.clientY, x: t.clientX, ...edgesFor(e.target) }
  }
  const onTouchEnd = (e) => {
    const s = start.current
    if (!s) return
    start.current = null
    const t = e.changedTouches[0]
    const dy = t.clientY - s.y
    const dx = t.clientX - s.x
    if (Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dx) > Math.abs(dy)) return
    if (dy < 0 && s.atBottom) next() // swipe up at the bottom of the text
    else if (dy > 0 && s.atTop) prev() // swipe down at the top
  }
  const onWheel = (e) => {
    if (Math.abs(e.deltaY) < 18) return
    const { atTop, atBottom } = edgesFor(e.target)
    if (e.deltaY > 0 && atBottom) next()
    else if (e.deltaY < 0 && atTop) prev()
    // otherwise let the card body scroll natively
  }

  return (
    <div
      className="feed"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      <div className="card-stage" key={card?.id}>
        {card && (
          <Card card={card} onOpenThread={onOpenThread} onKeepGoing={onKeepGoing} />
        )}
      </div>

      {/* desktop-only edge tap zones */}
      <button
        className="tapzone tap-prev"
        aria-label="Previous card"
        onClick={prev}
        disabled={!canGoBack}
        tabIndex={-1}
      />
      <button
        className="tapzone tap-next"
        aria-label="Next card"
        onClick={next}
        tabIndex={-1}
      />
    </div>
  )
}
