/**
 * Merge the per-topic card batches in src/data/cards-*.json into a single
 * src/data/cards.json (the library the app loads), then validate the whole
 * library against the schema and the feed engine's invariants.
 *
 * Run with `npm run build:cards` (also runs automatically on `npm run build`).
 * This is the merge step of the "recharge ritual" — drop a new
 * cards-<topic>.json batch in src/data and re-run.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const TYPES = new Set(['fact', 'concept', 'quiz', 'puzzle', 'rabbithole'])

const batchFiles = readdirSync(DATA)
  .filter((f) => /^cards-.*\.json$/.test(f))
  .sort()

if (batchFiles.length === 0) {
  console.error('No cards-*.json batches found in', DATA)
  process.exit(1)
}

const all = []
for (const f of batchFiles) {
  const cards = JSON.parse(readFileSync(join(DATA, f), 'utf8'))
  if (!Array.isArray(cards)) throw new Error(`${f} is not a JSON array`)
  console.log(`${f}: ${cards.length} cards`)
  all.push(...cards)
}

// --- validation ----------------------------------------------------------
const ids = new Set()
const errors = []
for (const c of all) {
  if (!c.id) errors.push(`card missing id: ${JSON.stringify(c).slice(0, 80)}`)
  if (ids.has(c.id)) errors.push(`duplicate id: ${c.id}`)
  ids.add(c.id)
  if (!TYPES.has(c.type)) errors.push(`${c.id}: bad type "${c.type}"`)
  if (!c.topic) errors.push(`${c.id}: missing topic`)
  if (!c.headline) errors.push(`${c.id}: missing headline`)
  if (c.type === 'quiz') {
    if (!Array.isArray(c.options) || c.options.length < 2)
      errors.push(`${c.id}: quiz needs >=2 options`)
    if (typeof c.answerIndex !== 'number' || c.answerIndex < 0 || c.answerIndex >= (c.options?.length ?? 0))
      errors.push(`${c.id}: quiz answerIndex out of range`)
  }
  if (c.type === 'puzzle' && !c.answer) errors.push(`${c.id}: puzzle missing answer`)
}
// referential checks (after all ids known)
for (const c of all) {
  if (c.recapOf && !ids.has(c.recapOf)) errors.push(`${c.id}: recapOf -> missing ${c.recapOf}`)
}
// every rabbithole teaser should have children sharing its threadId
const byThread = new Map()
for (const c of all) {
  if (c.threadId) {
    if (!byThread.has(c.threadId)) byThread.set(c.threadId, [])
    byThread.get(c.threadId).push(c)
  }
}
for (const c of all) {
  if (c.type === 'rabbithole') {
    const kids = (byThread.get(c.threadId) || []).filter((k) => k !== c)
    if (kids.length === 0) errors.push(`${c.id}: rabbithole has no child cards (threadId ${c.threadId})`)
  }
}

if (errors.length) {
  console.error('\nValidation FAILED:')
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}

// --- stats ---------------------------------------------------------------
const byType = {}
const byTopic = {}
for (const c of all) {
  byType[c.type] = (byType[c.type] || 0) + 1
  byTopic[c.topic] = (byTopic[c.topic] || 0) + 1
}
writeFileSync(join(DATA, 'cards.json'), JSON.stringify(all, null, 2) + '\n')

const pct = (n) => `${((n / all.length) * 100).toFixed(0)}%`
console.log(`\nMerged ${all.length} cards -> src/data/cards.json`)
console.log('By type: ', Object.entries(byType).map(([k, v]) => `${k} ${v} (${pct(v)})`).join(', '))
console.log('By topic:', Object.entries(byTopic).map(([k, v]) => `${k} ${v}`).join(', '))
