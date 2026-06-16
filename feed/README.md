# Feed — a personal anti-doomscroll learning app

A single-user, installable PWA that replaces doomscrolling with a full-screen,
swipeable feed of learning cards. Opens straight to a card, swipe up for the
next one, zero menus between you and the content. No backend, no accounts, no
analytics — all content is bundled at build time and all state lives in
`localStorage`.

> v1 is a **closed system**: the card library is a static JSON file generated
> ahead of time. See [`scripts/generate-cards.md`](scripts/generate-cards.md)
> for how to top it up.

## Features

- **Frictionless feed** — opens directly to a card. Swipe up = next, swipe down
  = previous. Navigation only fires once the card's text is scrolled to its
  edge, so reading a long card never trips an accidental swipe. Wheel and arrow
  keys work for desktop testing; thin edge tap-zones too.
- **Topic focus** — a pill in the top bar jumps the feed to a single topic (or
  back to "All") without opening settings.
- **Smart shuffle** — weighted-random across topics, steered toward a varied
  type mix, never repeats a card until its topic pool is exhausted, never shows
  >2 of the same topic/type in a row.
- **Card types** — facts (with optional "Tell me more"), named mental models,
  brain teasers & riddles with an inline "Show answer", and rabbit-holes that
  expand into a short linked thread, then resume the shuffle. Cards can also
  carry an inline SVG diagram or a big-number / pull-quote treatment.
- **👍 / 👎 / 🔖 on every card** — all persisted locally. 👎 means "never show
  this card again"; 👍 gives a topic a gentle nudge; 🔖 saves a card to the
  **Saved** view (bookmark icon in the top bar) for later reading.
- **Low-library nudge** — when you've nearly exhausted the library, a one-time
  card points you to the recharge ritual; it re-arms when you add cards.
- **Export** — everything (likes, 👎/suppressed, bookmarks) downloads as one
  JSON file: future training data for a dynamic v2.
- **Daily soft cap** (default 60) with a friendly "that's your stack for today"
  card and a *keep going anyway* escape hatch.
- **Minimal settings** behind a gear: toggle topics, set the cap, export likes,
  reset history.
- **Offline-first PWA** — installable to an iOS/Android home screen, works with
  no connection after first load.

## Run locally

```bash
cd feed
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build        # merge+validate cards, render icons, then vite build -> dist/
npm run preview      # serve the production build locally
npm run lint         # eslint
npm run build:cards  # just merge src/data/cards-*.json -> cards.json (+validate)
npm run build:icons  # regenerate the PWA icons
```

## Deploy

It's a static site — `npm run build` produces a self-contained `dist/` with a
**relative base path**, so it works on any host or sub-path without
configuration:

- **Netlify / Vercel / Cloudflare Pages** — point the project at this `feed/`
  directory, build command `npm run build`, publish directory `dist`.
- **GitHub Pages** — push `dist/` to your Pages branch (or use a Pages action).
  Because the base is relative, no repo-name configuration is needed.
- **Anything else** — copy `dist/` to any static file server.

Installing: open the deployed URL on a phone and choose *Add to Home Screen*.

## Adding cards

The library lives in `src/data/` as one file per topic
(`cards-<topic>.json`). To grow it:

1. Generate a batch using the prompt in
   [`scripts/generate-cards.md`](scripts/generate-cards.md).
2. Append it to the relevant `cards-<topic>.json` (keep ids unique).
3. `npm run build:cards` to merge into `cards.json` and validate the whole
   library (it fails loudly on duplicate ids, bad `recapOf`, childless
   rabbit-holes, malformed quizzes, etc.).
4. `npm run build` and ship.

## How it's put together

```
feed/
├── index.html                 # PWA meta, manifest + apple-touch-icon links
├── public/
│   ├── manifest.webmanifest   # installable app metadata
│   ├── sw.js                  # offline-first service worker (no deps)
│   └── icons/                 # generated PNGs (do not hand-edit)
├── scripts/
│   ├── build-cards.mjs        # merge + validate the card library
│   ├── generate-icons.mjs     # render PWA icons (zero-dependency PNG encoder)
│   └── generate-cards.md      # the content recharge ritual + exact prompt
└── src/
    ├── data/                  # cards-<topic>.json batches -> merged cards.json
    ├── engine/
    │   ├── storage.js         # all localStorage access (seen, likes, settings, daily)
    │   └── feedEngine.js      # the shuffle / sequencing engine
    ├── hooks/useFeed.js       # feed state: history, daily cap, threads
    ├── components/            # Feed (gestures), Card (+ type bodies), LikeBar, Settings
    ├── topics.js              # per-topic labels + accent colours
    └── styles.css             # dark, typography-first theme
```

### Data stored on the device (`feed:` keys in `localStorage`)

| key               | shape                                              |
| ----------------- | -------------------------------------------------- |
| `feed:seen`       | `string[]` of card ids you've been served          |
| `feed:likes`      | `{ [cardId]: { value: 1 \| -1, timestamp } }`       |
| `feed:suppressed` | `{ [cardId]: timestamp }` — 👎 "never show again"   |
| `feed:bookmarks`  | `[{ cardId, timestamp }]` — saved for later         |
| `feed:warn`       | `{ warnedAtLibrarySize }` — low-library arming      |
| `feed:settings`   | `{ enabledTopics: string[], dailyCap: number }`     |
| `feed:daily`      | `{ date, count, override }` (resets at local midnight) |

Nothing leaves the device. "Export my data" downloads likes, 👎/suppressed and
bookmarks as one JSON file. See [`CHANGELOG.md`](CHANGELOG.md) for the v1.1
changes and the (automatic) localStorage migration.

## Out of scope for v1

Accounts, backend, runtime AI calls, push notifications, audio/video, social
features, spaced-repetition scheduling, images.
