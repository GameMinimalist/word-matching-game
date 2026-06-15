# Tally

A calm, mobile-first **practice tracker**. Log binary completions against a
frequency target; streaks reset when you miss a period — harsh but fair.

The signature is the **tally mark**: a practice's target is the number of
strokes in a period, logging draws a stroke, and meeting the target turns the
strokes ember.

## Privacy model (v1: local-only)

**Your data never leaves your device.** Everything is stored in your browser's
`localStorage` under the key `tally.data`. There is no account, no server, no
cloud sync, and nothing is transmitted anywhere.

Implications worth knowing:

- **Single device.** Data lives in the browser you use it in. It will not
  appear on another phone or your laptop.
- **Back it up.** Because the only copy is on your device, clearing Safari
  website data, deleting the home-screen app, or losing the phone erases it.
  Use **⋯ → Export backup** regularly (and **Import** to restore).
- **iOS storage eviction.** Safari may clear storage for sites you haven't
  opened in a while. **Add Tally to your Home Screen** (below) for much more
  durable storage.

> Multi-device cloud sync (via your own private GitHub repo) is a planned,
> optional upgrade — see _Roadmap_. v1 is deliberately local-only for maximum
> privacy and zero setup.

## Use it on your iPhone

1. Open the deployed URL in **Safari**.
2. Tap the **Share** icon → **Add to Home Screen**.
3. Launch it from the home screen — it runs full-screen and works offline.

## Develop

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests (period + streak math)
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
```

## Deploy

### GitHub Pages (default)

A workflow at `.github/workflows/deploy.yml` builds and publishes `dist/` to
Pages on every push to `main`. Enable it once under
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

The Vite `base` is relative (`./`), so the build works at any path — a Pages
project subpath, a custom domain, or a home-screen PWA — with no changes.

### Vercel (alternative)

Import the repo; build command `npm run build`, output directory `dist`. No
configuration needed.

## How it works

- **The log is the single source of truth.** Each completion appends an ISO
  timestamp. Current counts, streaks, and "best" are always _computed_ from the
  log (`src/lib/streak.ts`), never stored.
- **Periods** are half-open `[start, end)` buckets in your local timezone:
  `hour | day | week | month | year | custom` (`src/lib/periods.ts`).
- **Streak rule:** the in-progress period never breaks a streak, but the first
  missed _elapsed_ period resets it. Covered by unit tests in
  `src/lib/streak.test.ts`.

## Project layout

```
src/
  lib/
    types.ts         data model
    periods.ts       period math (pure, tested)
    streak.ts        streak/stats computation (pure, tested)
    format.ts        labels & history rows
    storage.ts       localStorage load/save + export/import
    useStore.ts      the single state hook (CRUD + logging)
  components/
    Tally.tsx        the SVG tally-mark renderer
    Home.tsx         practice list
    Detail.tsx       single-practice view + history
    PracticeForm.tsx add / edit
    BackupSheet.tsx  export / import / archived
  App.tsx            view routing
public/              icons, manifest, service worker
```

## Roadmap

- Optional GitHub-backed sync for multi-device use (kept opt-in; local stays
  the default).
- Dark theme, per-practice reminders.
