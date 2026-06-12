# Generating card batches — the recharge ritual

The library ships small on purpose (~325 cards ≈ 5 days at the 60/day cap), so
**topping it up is a core, repeatable workflow, not a one-off.** When you get
the in-app **"You're running low"** card, that's your cue: generate a fresh
batch, drop it in, rebuild. Adding cards (i.e. growing `cards.json`) automatically
re-arms that warning, so it'll quietly tell you again next time.

## The model

Generate with **Claude (Opus-class)**. Any strong model works; the leverage is
entirely in the prompt, the **likes-informed steer**, and the **verification
pass** below.

## How batches are stored

- Each topic is its own file: `src/data/cards-<topic>.json` (a flat JSON array).
  Brain-teaser batches use a `-teasers` suffix (`cards-science-teasers.json`)
  and `-t` in their ids (`sci-t001`); one-off mixed batches can use any
  `cards-*.json` name (e.g. `cards-extra.json`).
- `npm run build:cards` merges every `cards-*.json` into `src/data/cards.json`
  and **validates** the whole library. It fails on: missing/duplicate ids, bad
  `type`/`style`, puzzle without `answer`, pullquote without `attribution`,
  childless rabbit-holes, an `svg` that is oversized/contains scripts/embeds a
  raster image, and **identical headlines**. It also prints a **near-duplicate
  headline warning** (≥72% word overlap) for you to review.
- To grow a topic, **append** to its file (keep ids unique) or add a new
  `cards-*.json`, then re-run the build.

## The recharge loop

1. **Export your taste.** Settings → *Export my data (JSON)*. This file contains
   your 👍 (`likes` with value 1), your 👎 (`suppressed` — "never show again"),
   and your bookmarks.
2. Pick a topic that's running low (Settings shows "X cards unseen").
3. Run **Prompt A (generate)** below, pasting in your exported data so the batch
   leans toward what you like and away from what you didn't.
4. Run **Prompt B (verify)** on the result — a mandatory fact-check / quality
   red-team. Remove or fix anything it flags.
5. Save the surviving cards to `src/data/cards-<topic>.json` (or a new file).
6. `npm run build:cards` — resolve any errors, review any near-duplicate
   warnings (drop the weaker card of a pair).
7. `npm run build` and ship. The low-library warning re-arms itself.

---

## The schema (give the model verbatim)

```jsonc
{
  "id": "sci-0042",            // unique, zero-padded, topic prefix
  "type": "fact | concept | puzzle | rabbithole",
  "topic": "science",          // science | history | psychology | money | logic | philosophy
  "headline": "string",        // punchy title (or the question, for a puzzle)
  "body": "string",            // main content; use \n\n between paragraphs
  "more": "string (optional)", // fact: ~50% have it; concept: always. 2-3 extra paragraphs
  "answer": "string",          // puzzle only: solution + brief reasoning (revealed on demand)
  "threadId": "string",        // rabbithole teaser + its children share this
  "threadOrder": 0,            // teaser = 0, children = 1..n

  // --- optional visual variety (use sparingly; see Phase 2 below) ---
  "svg": "string",             // sanitised inline SVG, <10KB, no raster, no script
  "style": "bignumber | pullquote", // typographic treatment (omit for normal cards)
  "attribution": "string",     // REQUIRED when style = pullquote (the quote's author)
  "kicker": "string"           // optional small label above a bignumber
}
```

Topic id prefixes: `sci-`, `his-`, `psy-`, `mon-`, `log-`, `phi-`.

> Multiple-choice `quiz` cards were retired in favour of brain teasers / riddles
> (the `puzzle` type, inline "Show answer"). Use `puzzle`, not `quiz`.

### Target mix (per ~50-card topic batch)

| type         | share | notes                                                                 |
| ------------ | ----- | --------------------------------------------------------------------- |
| `fact`       | ~48%  | headline + body; ~half include `more`                                 |
| `concept`    | ~18%  | a named mental model + vivid concrete example; **always** has `more`  |
| `puzzle`     | ~30%  | brain teasers / riddles, topical flavour, unambiguous `answer`        |
| `rabbithole` | ~3%   | 1 teaser (headline ends " →") + 3-5 child cards sharing a `threadId`  |

Plus, across a batch, aim for **~10–15% visual cards** (a `svg` diagram or a
`bignumber`/`pullquote` style), weighted toward concept / economics / logic.

---

## Prompt A — generate (copy, fill the blanks, run)

````
You are generating content for a personal "anti-doomscroll" learning app.
Produce a batch of high-quality learning cards for the topic **<TOPIC>** as a
single valid JSON array (no markdown, no comments, no trailing commas).

SCHEMA: <paste the schema block above>
TARGET MIX: <paste the mix table above; aim ~50 cards>
ID PREFIX: <e.g. sci->, zero-padded and unique.

MY TASTE — steer with this (pasted from the app's export):
<paste the exported JSON here>
- Cards similar in STYLE or SUBJECT to the 👍 `likes` (value 1) list: MORE of these.
- Cards similar to the 👎 `suppressed` list: NONE. Avoid that subject/style entirely.

AVOID DUPLICATES:
<paste the list of existing headlines for this topic — e.g. `node -e "require('./src/data/cards.json').filter(c=>c.topic==='<TOPIC>').forEach(c=>console.log(c.headline))"`>
- Do not produce anything that restates or closely resembles an existing headline.

QUALITY BAR — this is the whole point:
Value ranking: 1) Surprising/counterintuitive, 2) Useful in life/work,
3) Perspective-changing, 4) Fun. Every fact/concept must pass:
"Would a smart, well-read adult say 'huh, really?'"
- BAN well-worn trivia and anything a pub-quiz regular knows (honey never spoils,
  Napoleon's height, goldfish memory, 10% of our brains, Vikings' horned helmets,
  naive "tulip mania", the apocryphal Einstein compound-interest quote, etc.).
  If you touch a famous myth, DEBUNK it and teach the real mechanism.
- Prefer MECHANISMS over factoids: explain *why* X happens.
- ACCURACY is critical: no urban legends, no contested claims as fact. Flag
  genuinely debated claims (e.g. psychology findings that failed to replicate).
- Length: MIX punchy 1-2 sentence cards with short-paragraph story cards.

RULES:
- Puzzles are brain teasers / riddles with a topical flavour, an unambiguous
  re-solved "answer", and no images (text only).
- Each rabbit-hole = 1 teaser (type "rabbithole", headline ending " →",
  threadOrder 0) + 3-4 child cards (type "fact") sharing the threadId, order 1..n.
- ~10-15% of the batch should be visual (svg diagram, bignumber, or pullquote) —
  see the diagram + variant guidance I'll paste below.

PROCESS:
1. Draft in sub-batches; self-review each against the banned-trivia rule and the
   "huh, really?" test; cut weak ones. Re-solve every puzzle.
2. Return the final JSON array only.
````

## Prompt B — verify (MANDATORY second pass)

Run this on Prompt A's output before merging. Paste the batch back in:

````
Review every card in this batch as a skeptical fact-checker and editor.

For EACH card, flag it if any of these is true:
- The claim is contested, outdated, an urban legend, oversimplified, or likely
  wrong. (State the correction.)
- It fails the "would a smart, well-read adult say 'huh, really?'" bar, or
  resembles well-worn trivia / a pub-quiz cliché.
- A puzzle's answer is wrong, ambiguous, or not uniquely determined (re-solve it).
- A `style: pullquote` card's quotation is not verifiably real and correctly
  attributed — be strict; reject misattributed or apocryphal quotes.
- An `svg` is over ~10KB, contains <script>/<image>/event handlers, or won't
  read cleanly at phone width.
- It restates or closely resembles another card in this batch (or the existing
  headlines provided).

Output: the corrected JSON array with flagged cards either fixed or removed, plus
a short list of what you changed and why.
````

After Prompt B, save the survivors and run `npm run build:cards`.

---

## Phase 2 — diagrams & typographic variants

These add visual rhythm. Keep them to ~10–15% of a batch and weight them toward
concept / economics / logic. **Do not retrofit existing cards** — only new ones.

### `svg` — inline diagrams

Constraints (enforced by the validator): a single `<svg viewBox="…">`, **under
10KB**, **no raster** (`<image>`), **no `<script>` / event handlers / `<a>`**.
For colour, use `stroke="currentColor"` / `fill="currentColor"` for the **topic
accent** (the app sets it), and the palette greys `#4b5563` (axes) and `#9ca3af`
(labels). It renders between the headline and body, scaled to card width.

Good uses: supply/demand curves, timelines, a simple Venn, a flow/sequence, a
puzzle setup (a weighing, a grid). Worked examples:

```jsonc
// 1) Supply & demand (economics concept)
"svg": "<svg viewBox='0 0 220 150'><line x1='34' y1='14' x2='34' y2='126' stroke='#4b5563' stroke-width='1.5'/><line x1='34' y1='126' x2='206' y2='126' stroke='#4b5563' stroke-width='1.5'/><line x1='46' y1='26' x2='196' y2='118' stroke='currentColor' stroke-width='2.6'/><line x1='46' y1='118' x2='196' y2='26' stroke='currentColor' stroke-width='2.6' opacity='0.5'/><circle cx='121' cy='72' r='3.6' fill='currentColor'/><text x='150' y='114' fill='#9ca3af' font-size='10'>Demand</text><text x='150' y='36' fill='#9ca3af' font-size='10'>Supply</text></svg>"

// 2) A 3-step timeline / flow
"svg": "<svg viewBox='0 0 240 60'><line x1='20' y1='30' x2='220' y2='30' stroke='#4b5563' stroke-width='1.5'/><circle cx='30' cy='30' r='6' fill='currentColor'/><circle cx='120' cy='30' r='6' fill='currentColor'/><circle cx='210' cy='30' r='6' fill='currentColor'/><text x='30' y='52' fill='#9ca3af' font-size='9' text-anchor='middle'>Cause</text><text x='120' y='52' fill='#9ca3af' font-size='9' text-anchor='middle'>Shift</text><text x='210' y='52' fill='#9ca3af' font-size='9' text-anchor='middle'>Effect</text></svg>"

// 3) Two overlapping circles (a Venn)
"svg": "<svg viewBox='0 0 200 130'><circle cx='80' cy='65' r='48' fill='currentColor' opacity='0.18' stroke='currentColor'/><circle cx='120' cy='65' r='48' fill='currentColor' opacity='0.18' stroke='currentColor'/></svg>"
```

(Quote the JSON properly — escape the inner double-quotes, or write the SVG with
single-quoted attributes as above.)

### `style: "bignumber"`

The `headline` *is* the oversized stat (e.g. `"≈ 31×"`, `"1 in 600 million"`);
`body` explains it; optional `kicker` is a small label above. Use for a single
punchy figure where the number is the point.

### `style: "pullquote"`

The `headline` is the quotation; `attribution` is the author line (required).
Use **sparingly**, and only for **verified, correctly-attributed** quotes — the
verification pass (Prompt B) must confirm each one. Optional `body` adds context.
```
