# Generating card batches — the recharge ritual

The library ships small on purpose (~300 cards ≈ 5 days at the 60/day cap), so
**topping it up is a core, repeatable workflow, not a one-off.** This doc is the
exact process and prompt used to generate the initial library so new batches can
be produced and appended in minutes.

## The model

The library was generated with **Claude (Opus-class)**. Any strong model works;
the leverage is entirely in the prompt and the self-review pass.

## How batches are stored

- Each topic is its own file: `src/data/cards-<topic>.json` (a flat JSON array).
- `npm run build:cards` merges every `cards-*.json` into `src/data/cards.json`
  (the file the app loads) and **validates** the whole library — unique ids,
  required fields per type, every `recapOf` resolves, every rabbit-hole teaser
  has children. The build fails loudly on any violation.
- To grow a topic, **append** to its file (keep ids unique — bump the numeric
  suffix) or add a brand-new `cards-<topic>.json`, then re-run the build.

## The recharge loop

1. Pick a topic that's running low.
2. Run the prompt below (one topic per run produces the cleanest output).
3. Save the result as / append it to `src/data/cards-<topic>.json`.
4. `npm run build:cards` — fix anything the validator flags.
5. `npm run build` and ship.

> Tip: generate one topic per request, and ask the model to **self-review each
> sub-batch against the banned-trivia rule before returning**. That single
> instruction is what keeps the quality bar high.

---

## The schema (give this to the model verbatim)

```jsonc
{
  "id": "sci-0042",                 // unique, zero-padded, topic prefix
  "type": "fact | concept | quiz | puzzle | rabbithole",
  "topic": "science",               // one of: science, history, psychology, money, logic, philosophy
  "headline": "string",             // punchy title (or the question, for quiz/puzzle)
  "body": "string",                 // main content; use \n\n between paragraphs
  "more": "string (optional)",      // fact: ~50% have it; concept: always. 2-3 extra paragraphs
  "options": ["..."],               // quiz only: 3-4 strings
  "answerIndex": 1,                 // quiz only: 0-based index of the correct option
  "explanation": "string",          // quiz only: one-sentence why
  "answer": "string",               // puzzle only: solution + brief reasoning (revealed on demand)
  "recapOf": "sci-0040",            // quiz only & optional: id of a fact/concept this quiz recaps
  "threadId": "string",             // rabbithole teaser + its children share this
  "threadOrder": 0                  // teaser = 0, children = 1..n
}
```

Topic id prefixes: `sci-`, `his-`, `psy-`, `mon-`, `log-`, `phi-`.

## Target mix (per ~50-card topic batch)

| type         | share | notes                                                                 |
| ------------ | ----- | --------------------------------------------------------------------- |
| `fact`       | ~40%  | headline + body; ~half include `more`                                 |
| `concept`    | ~15%  | a named mental model + vivid concrete example; **always** has `more`  |
| `quiz`       | ~20%  | 3-4 options; 3-4 per batch are recap quizzes via `recapOf`            |
| `puzzle`     | ~15%  | solvable in the head in <2 min; concentrated in the **logic** topic   |
| `rabbithole` | ~10%  | 1 teaser (headline ends " →") + 3-5 child cards sharing a `threadId`  |

---

## The prompt (copy, fill in the topic, run)

````
You are generating content for a personal "anti-doomscroll" learning app.
Produce a batch of high-quality learning cards for the topic **<TOPIC>** as a
single valid JSON array (no markdown, no comments, no trailing commas).

SCHEMA: <paste the schema block above>
TARGET MIX: <paste the mix table above; aim ~50 cards>
ID PREFIX: <e.g. sci->, zero-padded and unique.

QUALITY BAR — this is the whole point:
The reader ranks card value as 1) Surprising/counterintuitive, 2) Useful in
life/work, 3) Perspective-changing, 4) Fun. Every fact/concept must pass:
"Would a smart, well-read adult say 'huh, really?'"
- BAN well-worn trivia and anything a pub-quiz regular knows (honey never
  spoils, Napoleon's height, goldfish memory, 10% of our brains, Vikings'
  horned helmets, "tulip mania" told naively, the apocryphal Einstein
  compound-interest quote, etc.). If you touch a famous myth, DEBUNK it and
  teach the real mechanism instead of repeating it.
- Prefer MECHANISMS over factoids: explain *why* X happens, not just that it's
  true.
- ACCURACY is critical: no urban legends, no contested claims as fact. If a
  claim is genuinely debated (e.g. several classic psychology findings that
  failed to replicate), say so on the card.
- Length: MIX punchy 1-2 sentence cards with short-paragraph story cards.

RULES:
- Recap quizzes set "recapOf" to the id of a fact/concept card IN THIS BATCH.
- Each rabbit-hole = 1 teaser (type "rabbithole", headline ending " →",
  threadOrder 0) + 3-4 child cards (type "fact") sharing the same threadId with
  threadOrder 1..n, telling a connected mini-story.
- Puzzles need an unambiguous, independently re-solved "answer".

PROCESS:
1. Draft in sub-batches; self-review each against the banned-trivia rule and the
   "huh, really?" test; cut anything weak. Re-solve every puzzle to confirm the
   answer is correct and unique.
2. Return the final JSON array only.
````

After saving the output to `src/data/cards-<topic>.json`, run
`npm run build:cards` and resolve anything the validator reports.
