# Hedgerow — Phase 3 Playtest Notes

How these were produced: the harness `tests/simulate.mjs` loads the **real
engine** out of `hedgerow.html` (it extracts the game-logic script and calls the
actual `playCard` / `buyCard` / `restAndDraw` / scoring / AI functions), then
plays full games headlessly. Numbers below are from **8,000 simulated games**
(2,000 each across four match-ups) plus two narrated games. So these findings
describe the shipped code, not a separate model.

Run it yourself: `node tests/simulate.mjs`.

---

## 1. Headline results

| Human style (proxy) | AI win | Human win | Ties | Avg winning score | Rounds |
|---------------------|:------:|:---------:|:----:|:-----------------:|:------:|
| **Skilled** (pivots to Owls round 7) | **8%** | 92% | — | **27.3** | 12 |
| **Casual** (sensible engine, pivots round 8) ← *first-timer proxy* | **43%** | 35% | 22% | 24.0 | 12 |
| **Weak** (big-money, bramble-spam) | **60%** | 25% | 15% | 25.0 | 12 |

Against the truest first-time-human proxy the AI wins **~43%** — on the ~45%
target. It is **clearly beatable** (a player who discovers the early Owl pivot
wins ~92%) yet **not trivial** (sloppy play loses ~60%). Winning scores land
**24–27**, inside/just under the 25–35 band, with skilled play reaching the
mid-30s. Every game runs the full 12 rounds → ~15–20 min digital.

> The high *tie* rate at the casual level is an artifact of deterministic test
> bots converging on identical scores; human players almost never tie exactly.

### Two narrated games

**Casual vs AI — 23–23, two piles emptied.** Both built Bramble engines through
round 6–7, then raced Owls. The AI banked four Owls and the human four; the
human's spare Sunlight on the last turn (15☀, only one buy) went to waste — a
teachable moment about over-building. The Owl pile and one other emptied.

**Skilled vs AI — 28–28.** The human pivoted to Owls a round earlier (R7) and
took five; the AI splashed a Fox (biodiversity) plus five Owls and, unusually,
kept pace to a tie. Both finished at 28 — top of the target band. (In aggregate
the early pivot wins ~92%; this was a high-variance sample.)

---

## 2. Cards that feel over- or under-powered

**Over-tuned / dominant**

- **Bramble Hedgerow** is the single most-bought card (~35–44% of all
  purchases) even after the playtest nerf (cost **5→6**). It is Hedgerow's
  "Gold" — almost always a fine buy. This is acceptable (its presence is a
  *default*, while the real decision is *when to stop buying it and pivot to
  Owls*), but it's the card to watch. Further options if it ever feels
  oppressive: cut its supply to 8, or nudge Foraging Hedgehog to +2 at cost 2 so
  the early ramp competes.
- **Drifting Butterflies** (multiplier) is strong but a **trap past one copy**.
  One butterfly on a fat hand is excellent; a second is rarely worth a buy and,
  being VP-dead, actively lowers your score. The naive engine-lover who hoards
  3–4 of them *loses tempo* — the card is self-policing, but new players may
  over-invest. The AI is capped to one.

**Under-used**

- **Harvest Moon** is almost never the correct buy (~3–4% share, usually by the
  AI's random off-pick). Its one-time self-removal is too steep a tempo cost for
  the burst it gives. *Suggested tweak:* either drop cost **6→5**, or let it
  stay in the deck (drop the self-removal) at a smaller burst — see §4.
- **Returning Swallows / Busy Bee / Foraging Hedgehog** sit at 1–5% once Bramble
  is affordable. They're correct *early-ramp* cards and pull their weight in the
  first few turns, but they're outclassed mid-game. This is fine — they're the
  on-ramp, not the destination — but a player who never touches them isn't
  missing much.
- **Fox's Den** is rarely bought by the bots, yet it can score **4–7 VP** in a
  varied deck. It's a genuine *build-around* the simple AI doesn't pursue; a
  human who chases biodiversity finds the only real alternative to Owl-spam. Good
  card, under-explored — exactly the kind of "meaningful choice" we wanted.

---

## 3. AI choices that looked clearly suboptimal

- **Greed-phase "dawdling."** To hit the ~45% target the AI deliberately makes a
  weaker buy on ~20% of its end-game turns. Early in tuning this manifested as
  the AI buying **five Woodland Edges in a row, never grabbing an Owl** (13 VP) —
  a clearly broken-looking line. Fixed by diversifying the dawdle so it spreads
  across reasonable-but-suboptimal buys (keep building, grab a Fox, take a hedge)
  instead of spamming one weak card. It still costs the AI games on purpose, but
  no longer looks foolish.
- **The AI never pursues the Fox biodiversity line** and rarely buys Harvest
  Moon/Swallows — consistent with those being weak/niche, but it means the AI's
  decks look samey (Bramble + Owl). Acceptable for a family-game opponent; a
  future "personality" AI could favour a Fox-variety strategy for flavour.
- **The AI follows a fixed round-8 VP pivot** (per the design brief). A human who
  pivots at round 7 reliably beats it. This is intended skill expression, but see
  the structural note in §5.

---

## 4. Suggested card tweaks (with rationale)

| Card | Tweak | Rationale |
|------|-------|-----------|
| Harvest Moon | cost 6 → **5**, *or* drop self-removal for a smaller repeatable burst | As shipped it's dominated; lowering the entry cost or the downside would make the seasonal-event slot a live choice rather than a near-dead card. |
| Drifting Butterflies | (watch only) consider a soft cap message in UI | One is great, two+ is a trap; a gentle nudge would help young players avoid over-buying. No mechanical change recommended yet. |
| Busy Bee | (optional) base +1 → +2 floor | Would extend its useful life past the early game and reward a flowers-and-bees identity build. Risk: weakens the "bees need flowers" tension, so left as-is for now. |
| Bramble Hedgerow | (hold) | The 5→6 nerf already spread buys; supply-to-8 is held in reserve if it ever feels oppressive. |

*Already applied during playtest:* Bramble 5→6 (was dominating ~40% of buys and
ending the engine race too early); Owl 7→6 (winning scores were ~23, below band,
and Owls weren't flowing — the cheaper Owl lifted winners to ~27 **and** created
a clean cost-6 "engine vs points" tension every late turn, which is now the
game's core decision).

---

## 5. UI elements likely to cause confusion (+ mitigations shipped)

- **"Sunlight doesn't carry over."** New players may expect to bank unspent
  Sunlight. The Rest step quietly discards it. *Mitigation:* the status bar shows
  Sunlight resetting each turn; consider a first-game tooltip. (Not yet added.)
- **One buy per turn.** After buying, the whole Market dims, which could read as
  "I'm stuck." *Mitigation shipped:* the Market subtitle switches to "already
  settled this turn," and the **Buy: done** stat makes the one-purchase rule
  explicit.
- **Variable-value cards in hand** (Bee, Butterflies, Harvest Moon) show a
  hint like `+X☀?` because their true value depends on what else you play.
  *Mitigation shipped:* the play-area copy shows the *resolved* contribution
  (e.g. `+4`) the moment it's played, so cause-and-effect is visible.
- **Play one vs Play all.** *Mitigation shipped:* hand cards are individually
  clickable **and** there's a "☀ Play all Sunlight" button, so both
  deliberate and fast players are served.
- **Fox's Den live VP swings** as you buy new card types. This is correct but
  could surprise; the score panels update live so the effect is at least
  visible.

---

## 6. Structural note (for a future iteration, not this prototype)

The single biggest lever on the outcome is **pivot timing** — when you stop
buying engine and start buying Owls. Because Owls are the dominant VP source and
both decks end up similar, one round of pivot difference is worth ~5 VP, which
often decides the game. This rewards skill (good!) but makes the spec-mandated
round-8 AI hard-beaten by an early-pivot human, and narrows mid-game strategy to
"Bramble until ready, then Owls."

If Hedgerow were taken past prototype, the highest-value depth addition would be
to make **excess Sunlight matter** — e.g. a second premium VP line that rewards a
*bigger* engine — so that out-building an opponent competes with out-timing them.
The Fox biodiversity line is a first step in that direction and is currently the
most interesting under-explored strategy in the game.
