// All progress lives in this browser, in localStorage. There is no account and
// no server: the file you open is the whole app, and the data never leaves the
// machine it was earned on.
import { catalogue, findItem, stageFor } from '../data/shop.js'
import { hasDirections, validDirection } from '../data/furnitureLayout.js'

const KEY = 'training5334.v1'
// Where the companion lives by default: on the floor in front of the window.
// Its sprite is 18% of the room wide and square, so the foot lands at
// y + 18 * 16/9 = 92%, the floor line the decorations use too.
const PET_HOME = { x: 41, y: 60 }
const REVIEW_CAP = 120
const RUN_CAP = 12

// Coins: earned only by solving. Nothing hands them out for free, which is
// what makes the shop mean something.
export const COINS = {
  solve: 1, // any solved puzzle
  clean: 3, // solved first time, no hints (replaces `solve`, not added to it)
  setDone: 5, // finishing a set
  threeStars: 10, // the first time a set reaches three stars
  dailyGoal: 15, // hitting the daily goal, once a day
  streakPerDay: 2, // added to the daily-goal bonus per day of streak, capped
  streakCap: 7,
}

// Companion XP, earned only by the pet that is out at the time.
export const XP = { solve: 1, clean: 3, dailyGoal: 10 }

const DEFAULTS = {
  days: {}, // 'YYYY-MM-DD' -> { done, clean, missed, seconds, goalHit }
  sets: {}, // 'partId/index' -> { done, clean, total, at }
  parts: {}, // partId -> puzzles solved in that part
  review: [], // puzzles worth another look, newest last
  runs: {}, // 'partId/index' -> a set left half-finished, to pick up next time
  coins: 0,
  earned: 0, // lifetime, for badges
  owned: {}, // 'kind/id' -> timestamp
  equipped: { board: 'sand', pieces: 'cartoon', pet: 'cat', room: 'bg', effect: 'none' },
  petPos: { ...PET_HOME }, // where the companion was last put down, percent of the room
  decorPos: {}, // decorationId -> { x, y } once she has moved it off its default spot
  stored: {}, // itemId -> true when she has put it away (owned, but not shown in the room)
  decorSize: {}, // itemId -> width as a percent of the room, once she has resized it
  decorDirection: {}, // furnitureId -> left/right, shared anchor and scale
  petSize: null, // the companion's width, same units
  badges: {}, // badgeId -> timestamp
  petXp: {}, // petId -> xp earned while it was the companion
  settings: { sound: true, goal: 10 },
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    if (!raw || typeof raw !== 'object') return structuredClone(DEFAULTS)
    const data = {
      ...structuredClone(DEFAULTS),
      ...raw,
      settings: { ...DEFAULTS.settings, ...raw.settings },
      equipped: { ...DEFAULTS.equipped, ...raw.equipped },
    }
    // Older saves kept the piece set as a "skin" setting.
    if (raw.settings?.skin && !raw.equipped) {
      data.equipped.pieces = raw.settings.skin === 'classic' ? 'classic' : 'cartoon'
    }
    delete data.settings.skin
    // Sets that no longer exist (the drawn set, the recolours) fall back to the default.
    if (!catalogue.pieceSets.some((p) => p.id === data.equipped.pieces)) data.equipped.pieces = 'cartoon'
    return data
  } catch {
    return structuredClone(DEFAULTS)
  }
}

function persist(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* private mode or quota — the session still works, it just won't be saved */
  }
  window.dispatchEvent(new Event('t5334-progress'))
}

export function today() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function dayBefore(iso, n = 1) {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(y, m - 1, d - n)
  const pad = (x) => String(x).padStart(2, '0')
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`
}

function streakOf(days) {
  let cursor = today()
  if (!days[cursor]?.done) {
    const y = dayBefore(cursor)
    if (!days[y]?.done) return 0
    cursor = y
  }
  let n = 0
  while (days[cursor]?.done) {
    n += 1
    cursor = dayBefore(cursor)
  }
  return n
}

// ---- recording ----

// Returns what the solve earned: { coins, goalHit } so the board can show it.
export function recordPuzzle({ partId, puzzleId, clean, seconds }) {
  const data = load()
  if(partId==='book' || partId.startsWith('book-')) {
    data.bookProgress ??= {}
    data.bookProgress[puzzleId.replace('book-','')]={clean,at:Date.now()}
  }
  const key = today()
  const day = (data.days[key] ??= { done: 0, clean: 0, missed: 0, seconds: 0 })
  day.done += 1
  if (clean) day.clean += 1
  else day.missed += 1
  day.seconds += Math.min(Math.round(seconds), 600)
  data.parts[partId] = (data.parts[partId] ?? 0) + 1

  data.review = data.review.filter((r) => r.id !== puzzleId)
  if (!clean) {
    data.review.push({ id: puzzleId, partId, at: Date.now() })
    if (data.review.length > REVIEW_CAP) data.review.splice(0, data.review.length - REVIEW_CAP)
  }

  let coins = clean ? COINS.clean : COINS.solve
  let xp = clean ? XP.clean : XP.solve
  let goalHit = false
  if (!day.goalHit && day.done >= data.settings.goal) {
    day.goalHit = true
    goalHit = true
    coins += COINS.dailyGoal + Math.min(streakOf(data.days), COINS.streakCap) * COINS.streakPerDay
    xp += XP.dailyGoal
  }
  data.coins += coins
  data.earned += coins
  // The companion that was out grows with her.
  const pet = data.equipped.pet
  const before = stageFor(data.petXp[pet] ?? 0)
  data.petXp[pet] = (data.petXp[pet] ?? 0) + xp
  const after = stageFor(data.petXp[pet])
  persist(data)
  return { coins, goalHit, xp, evolved: after > before ? after : null }
}

// Returns coins earned by the set result.
export function recordSet(partId, index, { done, clean, total }) {
  const data = load()
  const k = `${partId}/${index}`
  const prev = data.sets[k]
  const wasThree = prev ? starsFor(prev) === 3 : false
  // Keep the best run at a set, so replaying can only improve the badge.
  if (!prev || clean > prev.clean || (clean === prev.clean && done > prev.done)) {
    data.sets[k] = { done, clean, total, at: Date.now() }
  }
  let coins = done >= total ? COINS.setDone : 0
  if (!wasThree && starsFor({ clean, total }) === 3) coins += COINS.threeStars
  data.coins += coins
  data.earned += coins
  persist(data)
  return { coins }
}

// ---- a half-finished run ----

export function runSignature(puzzles) {
  return `${puzzles.length}:${puzzles[0]?.id ?? ''}:${puzzles[puzzles.length - 1]?.id ?? ''}`
}

export function loadRun(runKey, signature) {
  const run = load().runs[runKey]
  if (!run || run.sig !== signature) return null
  if (!Number.isInteger(run.idx) || run.idx < 1) return null
  return run
}

export function saveRun(runKey, { idx, tally, sig }) {
  const data = load()
  data.runs[runKey] = { idx, tally, sig, at: Date.now() }
  const keys = Object.keys(data.runs)
  if (keys.length > RUN_CAP) {
    keys
      .sort((a, b) => data.runs[a].at - data.runs[b].at)
      .slice(0, keys.length - RUN_CAP)
      .forEach((k) => delete data.runs[k])
  }
  persist(data)
}

export function clearRun(runKey) {
  const data = load()
  if (!data.runs[runKey]) return
  delete data.runs[runKey]
  persist(data)
}

export function runInProgress(runKey) {
  return load().runs[runKey] ?? null
}

// ---- reading ----

export function setResult(partId, index) {
  return load().sets[`${partId}/${index}`] ?? null
}

export function starsFor(result) {
  if (!result || !result.total) return 0
  const pct = (result.clean / result.total) * 100
  return pct >= 100 ? 3 : pct >= 75 ? 2 : pct >= 40 ? 1 : 0
}

export function partProgress(partId, setCount) {
  const sets = load().sets
  let done = 0
  let stars = 0
  let puzzles = 0
  for (let i = 0; i < setCount; i++) {
    const r = sets[`${partId}/${i}`]
    if (!r) continue
    done += 1
    stars += starsFor(r)
    puzzles += r.done
  }
  return { setsDone: done, stars, puzzles, setCount }
}

export function nextSetIndex(partId, setCount) {
  const sets = load().sets
  for (let i = 0; i < setCount; i++) {
    const r = sets[`${partId}/${i}`]
    if (!r || starsFor(r) < 3) return i
  }
  return Math.max(0, setCount - 1)
}

export function todayStats() {
  const d = load()
  return d.days[today()] ?? { done: 0, clean: 0, missed: 0, seconds: 0 }
}

export function totals() {
  const d = load()
  let done = 0
  let clean = 0
  let seconds = 0
  let goalDays = 0
  for (const v of Object.values(d.days)) {
    done += v.done
    clean += v.clean
    seconds += v.seconds
    if (v.goalHit) goalDays += 1
  }
  return { done, clean, seconds, days: Object.keys(d.days).length, goalDays }
}

export function streak() {
  return streakOf(load().days)
}

export function lastDays(n) {
  const d = load().days
  const out = []
  let cursor = today()
  for (let i = 0; i < n; i++) {
    out.push({ date: cursor, ...(d[cursor] ?? { done: 0, clean: 0, missed: 0, seconds: 0 }) })
    cursor = dayBefore(cursor)
  }
  return out.reverse()
}

export function reviewQueue() {
  return load().review.slice().reverse()
}

// Everything a badge rule might want to look at, in one read.
export function snapshot() {
  const d = load()
  const t = totals()
  let threeStarSets = 0
  for (const r of Object.values(d.sets)) if (starsFor(r) === 3) threeStarSets += 1
  const stages = Object.values(d.petXp).map(stageFor)
  return {
    ...t,
    streak: streakOf(d.days),
    maxPetStage: stages.length ? Math.max(...stages) : 1,
    threeStarSets,
    parts: d.parts,
    earned: d.earned,
    ownedCount: Object.keys(d.owned).length,
    badges: d.badges,
  }
}

// ---- companions ----

export function petXp(petId) {
  return load().petXp[petId] ?? 0
}

export function petStage(petId) {
  return stageFor(petXp(petId))
}

// ---- coins & shop ----

export function getCoins() {
  return load().coins
}

export function getEquipped() {
  return load().equipped
}

export function isOwned(kind, id) {
  const item = findItem(kind, id)
  if (!item) return false
  if (item.price === 0 && !item.reward) return true
  return Boolean(load().owned[`${kind}/${id}`])
}

export function ownedList(kind) {
  return catalogue[kind].filter((i) => isOwned(kind, i.id))
}

// Returns { ok, reason }. A purchase of a wearable also equips it, because
// that is always what a child clicking "buy" means.
export function buy(kind, id) {
  const item = findItem(kind, id)
  if (!item) return { ok: false, reason: 'No such thing.' }
  if (isOwned(kind, id)) return { ok: false, reason: 'Already yours.' }
  if (item.reward) return { ok: false, reason: 'This one has to be earned.' }
  const data = load()
  if (data.coins < item.price) return { ok: false, reason: `Need ${item.price - data.coins} more coins.` }
  data.coins -= item.price
  data.owned[`${kind}/${id}`] = Date.now()
  if (kind === 'boards') data.equipped.board = id
  if (kind === 'pieceSets') data.equipped.pieces = id
  if (kind === 'pets') data.equipped.pet = id
  if (kind === 'rooms') data.equipped.room = id
  if (kind === 'effects') data.equipped.effect = id
  persist(data)
  return { ok: true }
}

export function equip(kind, id) {
  if (!isOwned(kind, id)) return false
  const data = load()
  if (kind === 'boards') data.equipped.board = id
  else if (kind === 'pieceSets') data.equipped.pieces = id
  else if (kind === 'pets') data.equipped.pet = id
  else if (kind === 'rooms') data.equipped.room = id
  else if (kind === 'effects') data.equipped.effect = id
  else return false
  persist(data)
  return true
}

// Rewards from badges: items that cannot be bought.
export function grantItem(kind, id) {
  const data = load()
  const k = `${kind}/${id}`
  if (data.owned[k]) return false
  data.owned[k] = Date.now()
  persist(data)
  return true
}

export function addCoins(n) {
  const data = load()
  data.coins += n
  data.earned += n
  persist(data)
  return data.coins
}

// Where the companion sits in the room.
export function getPetPos() {
  const p = load().petPos
  return p && Number.isFinite(p.x) && Number.isFinite(p.y) ? p : { ...PET_HOME }
}

export function setPetPos(pos) {
  const data = load()
  data.petPos = { x: Math.round(pos.x * 10) / 10, y: Math.round(pos.y * 10) / 10 }
  persist(data)
}

// A decoration sits at its catalogue spot until she moves it.
export function getDecorPos(item) {
  const p = load().decorPos[item.id]
  return p && Number.isFinite(p.x) && Number.isFinite(p.y) ? p : { x: item.x, y: item.y }
}

export function setDecorPos(id, pos) {
  const data = load()
  data.decorPos[id] = { x: Math.round(pos.x * 10) / 10, y: Math.round(pos.y * 10) / 10 }
  persist(data)
}

export function getDecorDirection(id) {
  return validDirection(load().decorDirection?.[id])
}

export function setDecorDirection(id, direction) {
  if (!hasDirections(id) || !['left', 'right'].includes(direction) || !isOwned('furniture', id)) return false
  const data = load()
  data.decorDirection = { ...data.decorDirection, [id]: direction }
  persist(data)
  return true
}

// Sizes. Sprites are square, so a width is the whole story: the height
// follows and the aspect ratio can never drift.
export const SIZE_LIMITS = { min: 4, max: 60 }

export function getDecorWidth(item) {
  const w = load().decorSize[item.id]
  return Number.isFinite(w) ? w : item.w
}

export function setDecorWidth(id, w) {
  const data = load()
  data.decorSize[id] = Math.round(w * 10) / 10
  persist(data)
}

export function getPetWidth(fallback) {
  const w = load().petSize
  return Number.isFinite(w) ? w : fallback
}

export function setPetWidth(w) {
  const data = load()
  data.petSize = Math.round(w * 10) / 10
  persist(data)
}

// Owned things can be put away and brought back out; the room only shows
// what is out.
export function isStored(id) {
  return Boolean(load().stored[id])
}

export function toggleStored(id) {
  const data = load()
  if (data.stored[id]) delete data.stored[id]
  else data.stored[id] = true
  persist(data)
  return Boolean(data.stored[id])
}

// Everything back where the catalogue puts it.
export function resetRoom() {
  const data = load()
  data.decorDirection = {}
  data.decorSize = {}
  data.petSize = null
  data.decorPos = {}
  data.petPos = { ...PET_HOME }
  persist(data)
}

// ---- badges ----

export function hasBadge(id) {
  return Boolean(load().badges[id])
}

export function grantBadge(id) {
  const data = load()
  if (data.badges[id]) return false
  data.badges[id] = Date.now()
  persist(data)
  return true
}

export function badgeList() {
  return load().badges
}

// ---- settings ----

export function getSettings() {
  return load().settings
}

export function setSetting(key, value) {
  const data = load()
  data.settings[key] = value
  persist(data)
}

// ---- backup ----

export function exportAll() {
  return JSON.stringify(load(), null, 2)
}

export function exportSave() {
  return JSON.stringify({ format: '5334-training-save', version: 1, savedAt: new Date().toISOString(), data: load() }, null, 2)
}

export function parseSave(json) {
  if (json.length > 10 * 1024 * 1024) throw new Error('Save file is too large (maximum 10 MB).')
  let parsed
  try { parsed = JSON.parse(json) } catch { throw new Error('This save file is damaged or is not valid JSON.') }
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v)
  if (parsed?.format !== undefined) {
    if (parsed.format !== '5334-training-save' || parsed.version !== 1) throw new Error('Unsupported save format or version.')
    parsed = parsed.data
  }
  const invalid = () => { throw new Error('This is not a valid Chess Puzzle Training save.') }
  if (!object(parsed) || !object(parsed.days) || !object(parsed.sets) || !Array.isArray(parsed.review)) invalid()
  function safeKeys(value) {
    if (!value || typeof value !== 'object') return
    for (const [key, child] of Object.entries(value)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key)) invalid()
      safeKeys(child)
    }
  }
  safeKeys(parsed)
  for (const [key, fallback] of Object.entries(DEFAULTS)) {
    if (!(key in parsed) || fallback === null) continue
    if (Array.isArray(fallback) ? !Array.isArray(parsed[key]) : object(fallback) ? !object(parsed[key]) : typeof parsed[key] !== typeof fallback) invalid()
  }
  for (const key of ['coins', 'earned']) if (key in parsed && (!Number.isFinite(parsed[key]) || parsed[key] < 0)) invalid()
  for (const key of ['days', 'sets', 'runs', 'decorPos', 'bookProgress']) {
    if (key in parsed && (!object(parsed[key]) || Object.values(parsed[key]).some(v => !object(v)))) invalid()
  }
  if (parsed.review.some(v => !object(v) || typeof v.partId !== 'string' || typeof v.id !== 'string')) invalid()
  if (parsed.settings?.goal !== undefined && (!Number.isFinite(parsed.settings.goal) || parsed.settings.goal <= 0)) invalid()
  if (parsed.settings?.sound !== undefined && typeof parsed.settings.sound !== 'boolean') invalid()
  if (parsed.equipped && Object.values(parsed.equipped).some(v => typeof v !== 'string')) invalid()
  return { ...structuredClone(DEFAULTS), ...parsed, settings: { ...DEFAULTS.settings, ...parsed.settings }, equipped: { ...DEFAULTS.equipped, ...parsed.equipped } }
}

export function importAll(json) {
  const data = parseSave(json)
  // Write the recovery copy first; quota failures must never report success.
  try {
    localStorage.setItem('training5334.before-import.v1', JSON.stringify(load()))
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch { throw new Error('Could not save in this browser. Your current progress has not been replaced.') }
  window.dispatchEvent(new Event('t5334-progress'))
}

export function resetAll() {
  persist(structuredClone(DEFAULTS))
}
