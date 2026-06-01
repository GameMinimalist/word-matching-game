# 🌿 Hedgerow

A warm, mid-weight **English-countryside deck-builder** for ages 8–12 — a
single-file browser prototype (human vs AI). You're a steward of a hedgerow,
racing your neighbour to grow the most flourishing habitat before the seasons
turn. Sow wildflowers, welcome bees and butterflies, and give foxes and owls a
home. No attacks, no conflict — just the gentle race to build the best little
ecosystem.

## Play it

**Open [`hedgerow.html`](hedgerow.html) in any browser.** No install, no build
step, no backend — it's one self-contained file (vanilla JS + inline SVG).

Each turn: **Forage** (play cards for Sunlight ☀) → **Settle** (buy one Market
card) → **Rest** (discard and draw five). Game ends after 12 rounds or when 3
Market piles run dry. Most Victory Points wins. Tip: build a Sunlight engine
early, then start banking Wise Owls around turn 6–8.

## Documentation

- **[`docs/HEDGEROW_GDD.md`](docs/HEDGEROW_GDD.md)** — full Game Design Document
  (theme, turn structure, economy, all 10 Kingdom Cards, victory & balance).
- **[`docs/PLAYTEST.md`](docs/PLAYTEST.md)** — Phase 3 playtest report (balance
  findings, AI behaviour, suggested tweaks), backed by 8,000 simulated games.

## Project layout

| Path | What |
|------|------|
| `hedgerow.html` | The whole game — card data, logic, AI, and rendering, clearly sectioned. |
| `tests/simulate.mjs` | Headless balance harness that runs the **real engine** from `hedgerow.html`. Run with `node tests/simulate.mjs`. |
| `docs/` | Design document and playtest notes. |

## For developers

The code is organised so that **adding a card means editing only the `CARDS`
data block** (Section 1 of `hedgerow.html`) — the engine interprets declarative
fields (`sun`, `sunFn`, `draw`, `vp`, `vpFn`, `vpOnly`, `trash`). All game state
lives in a single `state` object; game logic (Sections 4–5) is fully separated
from rendering (Section 6).

---

*Built as a self-contained prototype. The Vite/React scaffolding from the
original template is unused by the game and can be ignored.*
