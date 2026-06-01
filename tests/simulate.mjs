// ============================================================
// Hedgerow playtest harness.
// Loads the REAL engine out of ../hedgerow.html (so these numbers reflect the
// shipped code) and drives full games headlessly. The DOM/render layer is never
// invoked — only the pure SECTION 4/5 logic functions, exposed via a small shim
// appended at load time.
// ============================================================
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, "..", "hedgerow.html"), "utf8");

// Pull the main "use strict" script block out of the HTML.
const m = html.match(/<script>\s*"use strict";([\s\S]*?)<\/script>/);
if (!m) throw new Error("could not find engine script in hedgerow.html");

// Append an export shim that hands us the engine internals (same script scope).
const code = `"use strict";${m[1]}
;globalThis.__api = {
  get state(){return state;},
  newGame, draw, playCard, buyCard, restAndDraw, aiChooseBuy,
  finalScores, scoreBase, ownedCards, isPlayable, gameEnded,
  emptyPiles, distinctKingdomTypes, CARDS, KINGDOM_IDS
};`;

// Fake just enough browser surface that top-level boot doesn't throw.
const ctx = vm.createContext({
  window: { addEventListener() {}, },
  document: {},
  setTimeout, console, Math, Date, Object, Array, Set,
});
vm.runInContext(code, ctx);
const api = ctx.__api;

// ---- forage: play every playable card for the active player ----
function forage(who) {
  let guard = 0;
  while (guard++ < 60) {
    const c = api.state.players[who].hand.find(api.isPlayable);
    if (!c) break;
    api.playCard(who, c.uid);
  }
}

// ---- a "human" heuristic: an engaged-but-imperfect player ----
// Builds an engine early, pivots to victory points from round 8.
function humanBuy(round) {
  const s = api.state, sun = s.sun, mk = s.market, C = api.CARDS;
  const afford = id => mk[id] > 0 && C[id].cost <= sun;
  const ownCount = id => api.ownedCards(s.players.human).filter(c => c.id === id).length;
  const sunCards = api.ownedCards(s.players.human).filter(c => c.isSun).length;

  if (round >= 7) {                       // greed phase (skilled players pivot early)
    if (afford("owl")) return "owl";
    if (afford("fox") && api.distinctKingdomTypes(s.players.human) >= 5) return "fox";
    if (afford("woodland")) return "woodland";
    if (afford("bramble")) return "bramble";
    if (afford("hedgehog")) return "hedgehog";
    return null;
  }
  // engine phase
  if (afford("butterfly") && sunCards >= 8 && ownCount("butterfly") < 1) return "butterfly";
  if (afford("bramble")) return "bramble";
  if (afford("hedgehog")) return "hedgehog";
  if (afford("robin")) return "robin";
  if (afford("bee")) return "bee";
  if (afford("swallow")) return "swallow";
  return null;
}

// ---- a "casual" player: the best proxy for a real first-time human.
// Builds a reasonable engine, smooths with a cantrip or two, pivots to VP at
// round 8 (same shift point as the AI), but doesn't optimise relentlessly. ----
function casualBuy(round) {
  const s = api.state, sun = s.sun, mk = s.market, C = api.CARDS;
  const afford = id => mk[id] > 0 && C[id].cost <= sun;
  const own = id => api.ownedCards(s.players.human).filter(c => c.id === id).length;
  if (round >= 8) {
    if (afford("owl")) return "owl";
    if (afford("woodland")) return "woodland";
    if (afford("bramble")) return "bramble";
    if (afford("hedgehog")) return "hedgehog";
    return null;
  }
  const sunCards = api.ownedCards(s.players.human).filter(c => c.isSun).length;
  if (afford("butterfly") && sunCards >= 6 && own("butterfly") < 1) return "butterfly";
  if (afford("bramble")) return "bramble";
  if (own("robin") < 2 && afford("robin")) return "robin";
  if (afford("hedgehog")) return "hedgehog";
  if (afford("bee")) return "bee";
  return null;
}

// ---- a deliberately simple "first-timer": mostly buys the biggest thing ----
function naiveBuy(round) {
  const s = api.state, sun = s.sun, mk = s.market, C = api.CARDS;
  const afford = id => mk[id] > 0 && C[id].cost <= sun;
  if (round >= 8 && afford("owl")) return "owl";
  if (afford("bramble")) return "bramble";
  if (afford("hedgehog")) return "hedgehog";
  if (afford("woodland")) return "woodland";
  return null;
}

// ---- play one full game; humanFn drives the human, the engine AI drives itself ----
function playGame(humanFn, narrate = false) {
  api.newGame();
  const s = api.state;
  const log = [];
  const buys = { human: {}, ai: {} };
  const note = id => buys; // placeholder
  let safety = 0;

  while (!api.gameEnded() && safety++ < 100) {
    // ---------- human turn ----------
    s.turn = "human";
    forage("human");
    const hSun = s.sun;
    const hid = humanFn(s.round);
    if (hid && api.buyCard("human", hid)) (buys.human[hid] = (buys.human[hid] || 0) + 1);
    if (narrate) log.push(`R${s.round} you: ${hSun}☀ → ${hid || "rest"}`);
    api.restAndDraw("human");

    // ---------- ai turn ----------
    s.turn = "ai";
    forage("ai");
    const aSun = s.sun;
    const aid = api.aiChooseBuy(s.round);
    if (aid && api.buyCard("ai", aid)) (buys.ai[aid] = (buys.ai[aid] || 0) + 1);
    if (narrate) log.push(`R${s.round} ai:  ${aSun}☀ → ${aid || "rest"}`);
    api.restAndDraw("ai");

    if (api.gameEnded()) break;
    s.round++;
  }

  const sc = api.finalScores();
  return { sc, rounds: s.round, buys, log, emptied: api.emptyPiles() };
}

// ---- batch run for win-rate / balance stats ----
function batch(humanFn, label, n = 2000) {
  let hWins = 0, aWins = 0, ties = 0, hSum = 0, aSum = 0, rSum = 0;
  let pileEnd = 0, winSum = 0;
  const cardBuys = {};
  for (let i = 0; i < n; i++) {
    const g = playGame(humanFn);
    if (g.sc.human > g.sc.ai) hWins++;
    else if (g.sc.ai > g.sc.human) aWins++;
    else ties++;
    winSum += Math.max(g.sc.human, g.sc.ai);
    hSum += g.sc.human; aSum += g.sc.ai; rSum += g.rounds;
    if (g.emptied >= 3) pileEnd++;
    for (const side of ["human", "ai"])
      for (const k in g.buys[side]) cardBuys[k] = (cardBuys[k] || 0) + g.buys[side][k];
  }
  console.log(`\n=== ${label} (${n} games) ===`);
  console.log(`AI win rate:     ${(aWins / n * 100).toFixed(1)}%   (human ${(hWins / n * 100).toFixed(1)}%, ties ${(ties / n * 100).toFixed(1)}%)`);
  console.log(`avg score:       human ${(hSum / n).toFixed(1)}  vs  ai ${(aSum / n).toFixed(1)}   (avg WINNING score ${(winSum / n).toFixed(1)})`);
  console.log(`avg rounds:      ${(rSum / n).toFixed(1)}   (pile-out ended ${(pileEnd / n * 100).toFixed(0)}% of games)`);
  const tot = Object.values(cardBuys).reduce((a, b) => a + b, 0);
  console.log(`buy share:`);
  Object.entries(cardBuys).sort((a, b) => b[1] - a[1]).forEach(([k, v]) =>
    console.log(`   ${k.padEnd(10)} ${(v / tot * 100).toFixed(1)}%  (${(v / n).toFixed(2)}/game)`));
}

// ---- two narrated games for the Phase 3 report ----
function narrate(humanFn, label) {
  const g = playGame(humanFn, true);
  console.log(`\n===== NARRATED GAME: ${label} =====`);
  g.log.forEach(l => console.log("  " + l));
  console.log(`  RESULT: you ${g.sc.human} (${g.sc.humanCards} cards) vs neighbour ${g.sc.ai} (${g.sc.aiCards} cards)` +
    `  | ${g.rounds} rounds | ${g.emptied} piles empty`);
  console.log(`  your buys:`, g.buys.human);
  console.log(`  ai buys:  `, g.buys.ai);
}

narrate(casualBuy, "casual human vs AI");
narrate(humanBuy, "skilled human vs AI");
batch(humanBuy, "SKILLED human (pivot R7) vs AI");
batch(casualBuy, "CASUAL human (pivot R8) vs AI  << first-time-human proxy");
batch(naiveBuy, "WEAK first-timer (big-money) vs AI");
