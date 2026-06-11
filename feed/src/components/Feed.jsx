import { useEffect, useRef } from 'react'
import Card from './Card.jsx'

const SWIPE_THRESHOLD = 45 // px
const NAV_LOCK_MS = 380 // throttle so a flick doesn't skip several cards

/**
 * The gesture surface. Swipe up / wheel down / ArrowDown = next; swipe down /
 * ArrowUp = previous. Thin edge tap-zones give desktop a mouse affordance
 * without stealing taps from the card's own buttons.
 */
export default function Feed({ card, onNext, onPrev, canGoBack, onOpenThread, onKeepGoing }) {
  const touchY = useRef(null)
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
    touchY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e) => {
    if (touchY.current == null) return
    const dy = e.changedTouches[0].clientY - touchY.current
    if (dy < -SWIPE_THRESHOLD) next()
    else if (dy > SWIPE_THRESHOLD) prev()
    touchY.current = null
  }
  const onWheel = (e) => {
    if (Math.abs(e.deltaY) < 20) return
    if (e.deltaY > 0) next()
    else prev()
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
