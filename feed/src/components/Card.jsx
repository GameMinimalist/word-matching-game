import { useEffect, useRef, useState } from 'react'
import LikeBar from './LikeBar.jsx'
import { topicAccent, topicLabel } from '../topics.js'

/**
 * One full-viewport card. Dispatches on card.type for the body; all expansion
 * ("Tell me more", "Reveal answer", quiz answering) happens inline — nothing
 * ever navigates away.
 */
export default function Card({ card, onOpenThread, onKeepGoing }) {
  if (card.type === 'cap') return <CapCard onKeepGoing={onKeepGoing} />
  if (card.type === 'empty') return <EmptyCard />
  return <ContentCard card={card} onOpenThread={onOpenThread} />
}

function ContentCard({ card, onOpenThread }) {
  const accent = topicAccent(card.topic)
  const bodyRef = useRef(null)
  const innerRef = useRef(null)
  const [moreBelow, setMoreBelow] = useState(false)

  // Show the "scroll for more" cue whenever the text overflows and isn't yet
  // scrolled to the bottom. Re-checks on scroll, on content growth (a "Tell me
  // more" / "Reveal" expansion), and on resize.
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const check = () => {
      setMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 12)
    }
    check()
    el.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    let ro
    if (innerRef.current && 'ResizeObserver' in window) {
      ro = new ResizeObserver(check)
      ro.observe(innerRef.current)
    }
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      ro?.disconnect()
    }
  }, [card.id])

  return (
    <article className={`card ${moreBelow ? 'has-more' : ''}`} style={{ '--accent': accent }}>
      <header className="card-head">
        <span className="topic-tag" style={{ color: accent }}>
          <span className="topic-dot" style={{ background: accent }} />
          {topicLabel(card.topic)}
        </span>
      </header>

      <div className="card-body" ref={bodyRef}>
        <div className="card-body-inner" ref={innerRef}>
          {card.type === 'fact' && <FactBody card={card} />}
          {card.type === 'concept' && <ConceptBody card={card} />}
          {card.type === 'puzzle' && <PuzzleBody card={card} />}
          {card.type === 'rabbithole' && (
            <RabbitholeBody card={card} onOpenThread={onOpenThread} />
          )}
        </div>
      </div>

      <div className="scroll-fade" aria-hidden="true" />
      <div className="scroll-cue" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <footer className="card-foot">
        <LikeBar cardId={card.id} />
      </footer>
    </article>
  )
}

// --- fact / concept ------------------------------------------------------
function FactBody({ card }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <h1 className="headline">{card.headline}</h1>
      <Prose text={card.body} className="body" />
      {card.more && !open && (
        <button type="button" className="ghost-btn" onClick={() => setOpen(true)}>
          Tell me more
        </button>
      )}
      {card.more && open && <Prose text={card.more} className="more reveal" />}
    </>
  )
}

function ConceptBody({ card }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <span className="kicker">Mental model</span>
      <h1 className="headline">{card.headline}</h1>
      <Prose text={card.body} className="body" />
      {card.more && !open && (
        <button type="button" className="ghost-btn" onClick={() => setOpen(true)}>
          Tell me more
        </button>
      )}
      {card.more && open && <Prose text={card.more} className="more reveal" />}
    </>
  )
}

// --- puzzle --------------------------------------------------------------
function PuzzleBody({ card }) {
  const [show, setShow] = useState(false)
  return (
    <>
      <span className="kicker">Brain teaser</span>
      <h1 className="headline">{card.headline}</h1>
      {card.body && card.body !== card.headline && (
        <Prose text={card.body} className="body" />
      )}
      {!show ? (
        <button type="button" className="ghost-btn" onClick={() => setShow(true)}>
          Show answer
        </button>
      ) : (
        <div className="answer reveal">
          <span className="answer-label">Answer</span>
          <Prose text={card.answer} className="body" />
        </div>
      )}
    </>
  )
}

// --- rabbithole ----------------------------------------------------------
function RabbitholeBody({ card, onOpenThread }) {
  return (
    <div className="rabbithole">
      <span className="kicker">Rabbit hole</span>
      <h1 className="headline">{card.headline}</h1>
      {card.body && <Prose text={card.body} className="body" />}
      <button
        type="button"
        className="solid-btn"
        onClick={() => onOpenThread(card.threadId)}
      >
        Go down the rabbit hole →
      </button>
      <p className="hint-sub">A short thread, then back to the shuffle.</p>
    </div>
  )
}

// --- system cards --------------------------------------------------------
function CapCard({ onKeepGoing }) {
  return (
    <article className="card system">
      <div className="card-body center">
        <div className="big-emoji">👋</div>
        <h1 className="headline">That’s your stack for today</h1>
        <p className="body">
          You hit your daily cap. Knowledge keeps better in small doses — come
          back tomorrow with a fresh mind.
        </p>
        <button type="button" className="ghost-btn" onClick={onKeepGoing}>
          Keep going anyway
        </button>
      </div>
    </article>
  )
}

function EmptyCard() {
  return (
    <article className="card system">
      <div className="card-body center">
        <div className="big-emoji">🌱</div>
        <h1 className="headline">You’ve seen it all</h1>
        <p className="body">
          You’ve been through every card in the enabled topics. Turn more topics
          on in settings, or reset your history to ride again.
        </p>
      </div>
    </article>
  )
}

// --- shared --------------------------------------------------------------
function Prose({ text, className }) {
  const paras = String(text).split(/\n\n+/)
  return (
    <div className={className}>
      {paras.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}
