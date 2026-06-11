import { useState } from 'react'
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

  const accent = topicAccent(card.topic)

  return (
    <article className="card" style={{ '--accent': accent }}>
      <header className="card-head">
        <span className="topic-tag" style={{ color: accent }}>
          <span className="topic-dot" style={{ background: accent }} />
          {topicLabel(card.topic)}
        </span>
      </header>

      <div className="card-body">
        {card.type === 'fact' && <FactBody card={card} />}
        {card.type === 'concept' && <ConceptBody card={card} />}
        {card.type === 'quiz' && <QuizBody card={card} />}
        {card.type === 'puzzle' && <PuzzleBody card={card} />}
        {card.type === 'rabbithole' && (
          <RabbitholeBody card={card} onOpenThread={onOpenThread} />
        )}
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

// --- quiz ----------------------------------------------------------------
function QuizBody({ card }) {
  const [picked, setPicked] = useState(null)
  const answered = picked !== null
  return (
    <>
      {card.recapOf && <span className="kicker">Quick recap</span>}
      <h1 className="headline quiz-q">{card.headline}</h1>
      <ul className="options">
        {card.options.map((opt, i) => {
          const correct = i === card.answerIndex
          const state = !answered
            ? ''
            : correct
              ? 'correct'
              : i === picked
                ? 'wrong'
                : 'dim'
          return (
            <li key={i}>
              <button
                type="button"
                className={`option ${state}`}
                disabled={answered}
                onClick={() => setPicked(i)}
              >
                <span className="option-text">{opt}</span>
                {answered && correct && <span className="mark">✓</span>}
                {answered && !correct && i === picked && <span className="mark">✕</span>}
              </button>
            </li>
          )
        })}
      </ul>
      {answered && (
        <p className="explanation reveal">
          {picked === card.answerIndex ? 'Right — ' : 'Not quite — '}
          {card.explanation}
        </p>
      )}
    </>
  )
}

// --- puzzle --------------------------------------------------------------
function PuzzleBody({ card }) {
  const [show, setShow] = useState(false)
  return (
    <>
      <span className="kicker">Puzzle</span>
      <h1 className="headline">{card.headline}</h1>
      {card.body && card.body !== card.headline && (
        <Prose text={card.body} className="body" />
      )}
      {!show ? (
        <button type="button" className="ghost-btn" onClick={() => setShow(true)}>
          Reveal answer
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
