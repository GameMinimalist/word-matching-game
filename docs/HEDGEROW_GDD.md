# Hedgerow — Game Design Document

*An English Countryside Deck-Builder for ages 8–12*

**Status:** Phase 1 — Design (awaiting review before any code is written)
**Players:** 2 (human vs AI in the digital prototype)
**Genre:** Mid-weight family deck-builder (simplified Dominion lineage)

---

## 1. Theme & Tone

You and a neighbour are **stewards of adjoining habitats** along an old
English hedgerow — a patchwork of meadow, woodland edge, bramble, and pond.
Across the warm months you coax your patch of countryside into life: sowing
wildflowers, welcoming bees and butterflies, giving foxes and owls a home.

The mood is **warm, unhurried, naturalistic** — a sunlit afternoon, not a
battlefield. There are **no attacks** and nothing is ever destroyed on an
opponent's side. The only tension is the gentle race to grow the most
flourishing habitat before the seasons turn. You are always building *toward*
something.

**Featured wildlife & plants:** foxes, hedgehogs, badgers, robins, owls,
swallows, bees, butterflies, wildflowers, meadow grasses, hedgerow shrubs.

---

## 2. Core Structure

A **simplified Dominion-style deck-builder**:

- Both players begin with an identical 10-card starter deck.
- A shared central **Market** of 10 Kingdom Card types sits between them.
- Each turn you draw a hand, play cards for **Sunlight**, **buy one card**,
  then discard everything and draw a fresh hand.
- When your draw pile runs out, your discard pile is shuffled to become the
  new draw pile.
- The whole game is about **engine-building**: turning a weak starter deck
  into a humming little ecosystem that produces lots of Sunlight and Victory
  Points.

The single most important rule fits in one sentence: **play cards for
Sunlight, buy one card, reshuffle when empty, most Victory Points wins.**

---

## 3. Turn Structure

Every turn has three steps, themed to a day in the countryside:

| Step | Name | What happens |
|------|------|--------------|
| 1 | **Forage** | Play cards from your hand. They generate Sunlight and/or trigger abilities (draw, multiply, score). |
| 2 | **Settle** | Spend Sunlight to buy **one** card from the Market; it goes to your discard pile. |
| 3 | **Rest** | Discard your whole hand and everything you played, then draw **5** new cards for next turn. |

You may always choose to buy nothing in the Settle step (a legal, sometimes
smart choice).

---

## 4. Economy

- **One currency: Sunlight.** ☀
- Sunlight is **generated fresh each turn** and **does not carry over** — any
  unspent Sunlight is lost at Rest. This keeps maths simple for an 8-year-old
  and makes every turn a clean decision.
- Kingdom Cards cost **2 to 7 Sunlight**.
- **No attack cards, no trashing of opponents, no curses.** Competition is
  purely **positional** — the Market is shared and piles run dry, so the race
  is to acquire the best cards *first*.

---

## 5. Starter Deck (10 cards per player)

| Qty | Card | Sunlight | Notes |
|-----|------|----------|-------|
| 7 | **Wildflower Patch** | +1 | The humble base of every meadow. |
| 3 | **Meadow Path** | +2 | A well-trodden trail through the grasses. |

Total starting Sunlight in the deck: **13 across 10 cards** → an opening hand
of 5 averages **~6–7 Sunlight**, enough to buy a cost-3 to cost-5 card on
turn one.

> **Note on "wildflower" typing:** Wildflower Patch is the game's
> *wildflower-type* card, which matters for the Busy Bee chain (Section 6).

---

## 6. Kingdom Cards (the Market)

Ten distinct types. Each pile has the supply listed (cheaper, repeatable
cards have more copies; high-value scoring cards have fewer). All values are
tuned to the balance targets in Section 9.

> **Card text is written to fit on a card and be readable by a child.**
> A "Sunlight card" means any card that generates Sunlight when played
> (including the two starters).

### 6.1 Resource Engines

**① Foraging Hedgehog** — *Resource engine*
- **Cost:** 3 ☀ · **Supply:** 10
- **Generates:** +2 Sunlight
- **VP:** —
- **Text:** *Play for +2 Sunlight.*
- **Flavour:** *"It snuffles through the leaf litter at dusk, turning over
  every twig in search of a slug or two."*

**② Bramble Hedgerow** — *Resource engine (large)*
- **Cost:** 5 ☀ · **Supply:** 10
- **Generates:** +3 Sunlight
- **VP:** —
- **Text:** *Play for +3 Sunlight.*
- **Flavour:** *"Tangled blackthorn and dog-rose — a living wall where
  badgers shoulder through and dunnocks nest deep in the thorns."*

### 6.2 Ecosystem Chain

**③ Busy Bee** — *Ecosystem chain (bees boost wildflowers)*
- **Cost:** 3 ☀ · **Supply:** 10
- **Generates:** +1 Sunlight, **plus +1 for each Wildflower Patch you have
  in play this turn**
- **VP:** —
- **Text:** *Play for +1 Sunlight, and +1 more for every Wildflower Patch
  you have in play.*
- **Flavour:** *"Bumbling from bloom to bloom, she pays for her nectar by
  carrying summer from flower to flower."*
- **Design note:** This is the heart of the "bees feel like bees" promise —
  a bee is only valuable *because* of the flowers around it, exactly as in
  nature. It rewards leaning into your starting Wildflower Patches rather
  than rushing to replace them.

### 6.3 Multiplier

**④ Drifting Butterflies** — *Multiplier*
- **Cost:** 5 ☀ · **Supply:** 8
- **Generates:** +0 on its own
- **VP:** —
- **Text:** *Each other Sunlight card you play this turn gives +1 extra
  Sunlight.*
- **Flavour:** *"When the meadow shimmers with wings, you know the day is
  warm enough for everything to thrive at once."*
- **Design note:** The classic "throne-ish" multiplier — worthless alone,
  superb in a fat turn. Two butterflies stack (+2 each), which is powerful
  but only achievable late, and only if you have lots of Sunlight cards to
  amplify. Capped naturally by hand size.

### 6.4 Draw Accelerators

**⑤ Robin's Companion** — *Draw accelerator (cantrip)*
- **Cost:** 3 ☀ · **Supply:** 10
- **Generates:** +1 Sunlight
- **VP:** —
- **Text:** *Play for +1 Sunlight, then draw 1 card.*
- **Flavour:** *"The friendly robin follows your spade from row to row,
  certain you are digging just for him."*
- **Design note:** Replaces itself (cantrip), so it never clogs your hand —
  the safe, smooth "thins the experience" card that makes the engine flow.

**⑥ Returning Swallows** — *Draw accelerator (burst)*
- **Cost:** 4 ☀ · **Supply:** 8
- **Generates:** +0
- **VP:** —
- **Text:** *Draw 2 cards.*
- **Flavour:** *"Back from Africa on the first warm wind, they stitch the
  sky together over the barn."*
- **Design note:** No Sunlight of its own, so it's a net +1 card but costs a
  play. Enables big multiplier/bee turns by digging deeper into your deck.

### 6.5 Habitat & Animal Victory Cards (no Sunlight, scored at game end)

**⑦ Woodland Edge** — *Habitat (cheap VP)*
- **Cost:** 4 ☀ · **Supply:** 10
- **Generates:** — (no in-game effect)
- **VP:** **2**
- **Text:** *Worth 2 Victory Points. No effect when played.*
- **Flavour:** *"Where the trees give way to the meadow, badgers shuffle the
  leaf litter and bluebells pool in the spring shade."*

**⑧ Fox's Den** — *Animal VP (biodiversity / ecosystem scoring)*
- **Cost:** 5 ☀ · **Supply:** 8
- **Generates:** — (no in-game effect)
- **VP:** **1 VP for each different Kingdom Card type you own** (count each of
  the 10 Market types you have at least one of; Fox's Den counts itself).
- **Text:** *Worth 1 Victory Point for each different kind of Kingdom Card
  you own.*
- **Flavour:** *"The vixen settles only where the land is rich and varied —
  a sure sign the whole hedgerow is alive."*
- **Design note:** The apex predator rewards a **biodiverse** deck, which is
  both thematically perfect and a gentle counter-pull against single-card
  spamming. Typically scores 4–7 VP. Two Fox's Dens double-dip, so a varied
  deck can build toward a strong fox finish.

**⑨ Wise Owl** — *Habitat apex (premium VP)*
- **Cost:** 7 ☀ · **Supply:** 8
- **Generates:** — (no in-game effect)
- **VP:** **5**
- **Text:** *Worth 5 Victory Points. No effect when played.*
- **Flavour:** *"From the hollow oak the old owl keeps watch over the whole
  hedgerow — the surest sign of a habitat come of age."*
- **Design note:** The "Province" of Hedgerow — the primary win condition and
  the most common trigger for emptying a pile to end the game. The action-log
  line *"the owl claims the ancient hedgerow"* refers to buying this.

### 6.6 Seasonal Event

**⑩ Harvest Moon** — *Seasonal event (powerful one-time effect)*
- **Cost:** 6 ☀ · **Supply:** 8
- **Generates:** Special (see text)
- **VP:** —
- **Text:** *Gain +1 Sunlight for each card you have already played this
  turn, then remove Harvest Moon from the game.*
- **Flavour:** *"Once a year the great amber moon hangs low over the stubble,
  and for one night the whole valley gathers in the last of the warmth."*
- **Design note:** A genuine **one-time burst**: it self-removes when played,
  so each copy fires exactly once and then leaves your deck (also thinning
  it). Played at the *end* of a long Forage step it can pay for a Wise Owl in
  a single turn, but it permanently shrinks your engine — a real decision, not
  a default.

### 6.7 Market summary table

| # | Card | Type | Cost | Sunlight | VP | Supply |
|---|------|------|------|----------|----|--------|
| ① | Foraging Hedgehog | Engine | 3 | +2 | — | 10 |
| ② | Bramble Hedgerow | Engine | 5 | +3 | — | 10 |
| ③ | Busy Bee | Ecosystem chain | 3 | +1 (+1/wildflower) | — | 10 |
| ④ | Drifting Butterflies | Multiplier | 5 | +1 each other ☀ card | — | 8 |
| ⑤ | Robin's Companion | Draw (cantrip) | 3 | +1, draw 1 | — | 10 |
| ⑥ | Returning Swallows | Draw (burst) | 4 | draw 2 | — | 8 |
| ⑦ | Woodland Edge | Habitat VP | 4 | — | 2 | 10 |
| ⑧ | Fox's Den | Animal VP (scaling) | 5 | — | =types owned | 8 |
| ⑨ | Wise Owl | Habitat VP (apex) | 7 | — | 5 | 8 |
| ⑩ | Harvest Moon | Seasonal (one-time) | 6 | special | — | 8 |

---

## 7. Card Categories & Colour Coding

For at-a-glance identification, each card carries a coloured band + icon:

| Category | Colour band | Icon motif |
|----------|-------------|-----------|
| Starter (Sunlight) | Soft yellow | sun / flower |
| Resource Engine | Earthy brown | hedgehog / bramble |
| Ecosystem Chain | Wildflower purple | bee |
| Multiplier | Wildflower yellow-gold | butterfly |
| Draw Accelerator | Soft sky blue | robin / swallow |
| Habitat / Animal VP | Sage green | tree / fox / owl |
| Seasonal Event | Warm amber | moon |

---

## 8. Victory Conditions & Scoring

**The game ends at the end of a round in which either:**
- **3 Kingdom Card piles are empty**, *or*
- **12 full rounds have been played.**

(Whichever comes first. Both players get the same number of turns — if the
human triggers the end, the AI still finishes its turn of that round.)

**Final score = sum of all Victory Points in your entire deck, plus the
efficiency bonus:**

1. **Habitat cards** — Woodland Edge (2), Wise Owl (5).
2. **Animal cards** — Fox's Den (1 per different Kingdom Card type owned).
3. **Efficiency bonus** — the player with the **fewest total cards** in their
   deck scores **+3 VP** (ties: both score it). Rewards a lean, well-built
   habitat over a bloated one — *quality of habitat, not quantity*.

**Most Victory Points wins.** Tie-breaker: fewest total cards; if still tied,
a shared "the hedgerow flourishes for both of you" result.

---

## 9. Balance Targets & Tuning Rationale

| Target | Goal | How the design hits it |
|--------|------|------------------------|
| Winning score | **25–35 VP** | ~4–5 Wise Owls (20–25) + a Woodland Edge or two + a Fox's Den (4–7) + efficiency (3). |
| Physical play time | **30–45 min** | 12-round cap + 3-pile end; one buy per turn keeps turns short. |
| Digital play time | **15–20 min** | AI resolves instantly; animations kept brief. |
| Engine "clicks" | **turns 6–8** | Cost-3 engines/cantrips buyable from turn 1; by turn ~6 a focused deck reshuffles with Hedgehogs + Bees + Robins and starts producing 8–12 ☀, enough to dip into Owls. |

**Pile-driven end:** With 8 copies of Wise Owl, a focused VP race empties that
pile and contributes one of the three needed to end the game — keeping games
from dragging.

**Why these numbers (engine vs. greed curve):**
- Early (turns 1–5): Sunlight engines and draw are the best buys; VP cards are
  "dead" Sunlight, so buying them early is a real tempo cost.
- Mid (turns 6–9): The engine produces enough to start banking Owls.
- Late (turns 10–12): Pure greed — convert every turn into VP; Harvest Moon
  and Butterflies can spike a 7-cost Owl turn.

This is the intended **"build toward something"** arc: you can *feel* the
meadow filling in.

---

## 10. Digital Prototype — Design Intent (Phase 2 preview)

*(Built only after this document is approved.)*

### 10.1 Gameplay
- 2-player, **human vs AI**, single browser tab, no backend.
- Human plays manually through Forage → Settle; AI takes its whole turn
  automatically after the human confirms **End Turn**.
- Game is **fully restartable without a page refresh**.

### 10.2 UI — always visible
- Player's **hand** as distinct visual cards (not a text list).
- The **Market**: all 10 Kingdom piles visible at once, with cost, remaining
  supply, and "can I afford it?" affordance.
- **Sunlight available this turn**, both players' **VP totals**, **deck &
  discard counts** for both players, **current round number**.
- A running **action log**. AI entries use flavourful countryside language,
  e.g. *"The countryside stirs… the owl claims the ancient hedgerow."*

### 10.3 Visual design
- Palette: **sage green, warm cream, earthy brown, soft sky blue**, with
  **wildflower accents in purple and yellow**.
- Cards rendered with **CSS + inline SVG only — no external image assets**;
  warm, hand-crafted feel. Each category has a distinct colour band/icon
  (Section 7). Clean, highly readable typography suitable for ages 8–12.

### 10.4 AI opponent
- Always plays **legally and correctly** (plays all Sunlight, resolves draws
  before deciding its buy, never overspends).
- **Buying strategy:** rounds 1–7 prioritise engines & draw accelerators;
  from round 8 shift toward VP (Owls, Woodland Edge, Fox's Den).
- **Small randomness** in choices (weighted, not uniform) so it never feels
  robotic — occasionally takes the second-best buy.
- Tuned toward a **~45% win rate vs. a first-time human** — clearly beatable,
  not trivial.

### 10.5 Code architecture (commitments)
- **All game state in a single JS object.**
- **Game logic fully separated from rendering.**
- **Adding a new card = editing one card-data file only**, never the engine
  (cards are declarative data + a small named-effect vocabulary the engine
  interprets).
- Each major function commented with its purpose.
- **No build step if avoidable.** The repo is currently a React + Vite
  scaffold; for Phase 2 I recommend **one self-contained `hedgerow.html`**
  (vanilla JS + inline SVG, zero dependencies, opens by double-click) so it
  "runs immediately," and I'll confirm this choice with you before building.

---

## 11. Design Principles Held Throughout

- **One-sentence rules.** Every card's effect is stated in a single line a
  child can read aloud.
- **Every buy is a choice.** No strictly-dominant card: engines trade against
  draw, multipliers need fuel, VP cards trade tempo for points, Fox rewards
  variety, Harvest Moon trades your engine for a burst.
- **Theme ⇄ mechanics reinforce each other.** Bees are worthless without
  flowers; butterflies mean "a fine day for everything"; the fox only settles
  in a rich, varied habitat; the owl crowns a mature hedgerow.
- **Always building toward something.** The arc from a thin starter deck to a
  humming meadow, then to a VP harvest, is the whole point.

---

## 12. Open Questions for Review

1. **Prototype tech:** single self-contained `hedgerow.html` (recommended,
   truly no build step) **vs.** building inside the existing React + Vite
   scaffold (matches repo, needs `npm run dev`). Which do you prefer?
2. **Fox's Den scaling:** comfortable with variable VP (1 per card type), or
   prefer a flat value for simplicity at this age range?
3. **Harvest Moon self-removal:** keep the one-time "removes itself" mechanic,
   or make it a repeatable (weaker) end-of-turn bonus instead?
4. Any cards you'd like added/cut, or flavour you'd like dialled warmer?

---

*End of Phase 1 document. Awaiting review/approval before writing any Phase 2
code.*
