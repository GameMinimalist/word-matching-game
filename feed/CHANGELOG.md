# Changelog

## v1.1 — improvement sprint

### Added

- **Bookmarks ("Save for later").** A bookmark toggle sits alongside 👍/👎 on
  every card. A new **Saved** view (bookmark icon in the top bar) lists saved
  cards (headline + topic), opens any one in the full-screen, scroll-edge-swipe
  reader, navigates within saved cards only, and lets you un-save from the list
  or the reader. Saved cards are included in the data export.
- **Low-library warning.** When unseen-and-unsuppressed cards drop below 2× the
  daily cap (default 120), a one-time friendly in-feed card points to the
  recharge ritual. It re-arms automatically whenever the library grows. Settings
  now shows a quiet "X cards unseen".
- **Inline SVG diagrams** (Phase 2). Optional `svg` card field, sanitised and
  size-capped (~10KB, no raster, no scripts), rendered between headline and body
  using the topic accent colour.
- **Typographic variant cards** (Phase 2). Optional `style: "bignumber" |
  "pullquote"`. The shuffle never shows two styled cards in a row.
- A small `cards-extra.json` batch of new cards demonstrating the diagram /
  big-number / pull-quote treatments (no existing cards were retrofitted).

### Changed

- **👎 is now per-card, not per-topic.** A thumbs-down means **"never show this
  card again"** (added to a suppressed list) instead of down-weighting the whole
  topic. Topic weighting no longer reacts to 👎 (a single bad card can't starve a
  topic you chose); 👍 still gives a gentle nudge. 👎 data remains in the export,
  clearly labelled, for future card generation.
- **Data export** is now a single structured object — `{ exportedAt, note,
  likes, suppressed, bookmarks }` — downloaded as `feed-data-<date>.json`
  (previously likes-only).
- **Build validator** now also rejects bad `style`, a `pullquote` without
  `attribution`, an unsafe/oversized `svg`, and **identical headlines**, and
  warns on near-duplicate headlines (≥72% word overlap).
- **Recharge ritual** (`scripts/generate-cards.md`) rewritten: likes-informed
  generation (paste your export; more like 👍, none like 👎), a mandatory
  verification/red-team pass (including verifying pull-quote attributions),
  a dedup step, and Phase 2 diagram/variant guidance with worked examples.

### localStorage migrations

All existing keys (`feed:seen`, `feed:likes`, `feed:settings`, `feed:daily`) are
untouched and keep working. New keys:

- `feed:bookmarks` — `[{ cardId, timestamp }]`
- `feed:suppressed` — `{ [cardId]: timestamp }`. **Migrated automatically** the
  first time it's read: any pre-existing 👎 (`feed:likes` entries with value -1)
  are copied in, so no past thumbs-down signal is lost on update.
- `feed:warn` — `{ warnedAtLibrarySize }`, arms the low-library warning.

No action required by the user; the migration is lazy and idempotent.
