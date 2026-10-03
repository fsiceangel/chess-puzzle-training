import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import * as storage from '../../src/lib/storage.js'
import { FACE_CORNERS, ROOM_VP, wallProjection } from '../../src/lib/roomPerspective.js'
import { migrateAlpha, bookParts, bookSetFor, bookSetSlice } from '../../src/lib/book.js'
import { solverColor } from '../../src/lib/puzzles.js'

// Isolated test storage. Never touches a browser profile or an actual save.
const memory = new Map()
globalThis.localStorage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) }
globalThis.window = new EventTarget()
beforeEach(() => memory.clear())

test('book sets cover all 5334 numbers once, ten per set within chapter boundaries',()=>{
  const all=Array.from({length:5334},(_,i)=>i+1),seen=[]
  for(const part of bookParts)for(let i=0;i<Math.ceil(part.total/10);i++){
    const batch=bookSetSlice(all,part,i)
    assert.ok(batch.length>0&&batch.length<=10)
    assert.ok(batch.every(n=>n>=part.start&&n<=part.end))
    seen.push(...batch)
  }
  assert.deepEqual(seen,all)
  assert.equal(bookSetFor(308).part.start,307)
  assert.equal(bookSetFor(308).index,0)
  assert.deepEqual(bookSetSlice(all,bookParts[0],30),[301,302,303,304,305,306])
})

test('Alpha migration is idempotent and preserves the original wallet, growth and history',()=>{
  storage.addCoins(123)
  storage.recordPuzzle({partId:'mate-in-one',puzzleId:'old-test',clean:true,seconds:4})
  storage.recordSet('mate-in-one',0,{done:12,clean:10,total:12})
  storage.saveRun('mate-in-two/0',{idx:2,tally:[{id:'old-other',clean:true}],sig:'legacy'})
  const before=JSON.parse(storage.exportAll())
  const archive=migrateAlpha()
  assert.deepEqual(JSON.parse(memory.get('training5334.before-book.v1')),before)
  assert.deepEqual(archive.sets,before.sets)
  assert.deepEqual(archive.runs,before.runs)
  assert.deepEqual(JSON.parse(storage.exportAll()),{...before,alphaArchive:archive})
  storage.recordPuzzle({partId:'book',puzzleId:'book-1',clean:true,seconds:5})
  assert.deepEqual(migrateAlpha(),archive)
  const after=JSON.parse(storage.exportAll())
  assert.ok(after.bookProgress['1'])
  assert.deepEqual(after.sets,before.sets)
  const backup=storage.exportAll();storage.resetAll();storage.importAll(backup)
  assert.deepEqual(migrateAlpha(),archive)
})

test('book positions start on the printed side; Alpha retains the blunder introduction',()=>{
  assert.equal(solverColor({fen:'8/8/8/8/8/8/8/8 w - - 0 1',intro:false}),'w')
  assert.equal(solverColor({fen:'8/8/8/8/8/8/8/8 b - - 0 1',intro:false}),'b')
  assert.equal(solverColor({fen:'8/8/8/8/8/8/8/8 w - - 0 1'}),'b')
})

test('wall furniture front edges converge on the room vanishing point at multiple sizes', () => {
  for(const id of Object.keys(FACE_CORNERS)) for(const direction of ['left','right']) for(const w of [18,28]) {
    const p={x:direction==='left'?2:72,y:30}
    const m=wallProjection(id,direction,p,w)
    assert.ok(m)
    const project=([x,y])=>[(m[0]*x+m[1]*y+m[2])/(m[6]*x+m[7]*y+1),(m[3]*x+m[4]*y+m[5])/(m[6]*x+m[7]*y+1)]
    const q=FACE_CORNERS[id][direction].map(project)
    const vp=[(ROOM_VP.x-p.x)/w*512,(ROOM_VP.y-p.y)/(w*16/9)*512]
    for(const [a,b] of [[q[0],q[1]],[q[3],q[2]]]) {
      assert.ok(Math.abs((a[0]-vp[0])*(b[1]-vp[1])-(a[1]-vp[1])*(b[0]-vp[0]))<1e-5)
    }
    assert.ok(Math.abs(q[0][0]-q[3][0])<1e-6)
    assert.ok(Math.abs(q[1][0]-q[2][0])<1e-6)
  }
  assert.equal(wallProjection('desk','left',{x:0,y:0},20),null)
  assert.equal(wallProjection('bookshelf','left',{x:0,y:0},20,'bg_snow'),null)
  assert.equal(wallProjection('bookshelf','left',{x:50,y:0},0),null)
})

test('furniture direction persists without changing placement, scale or wallet', () => {
  storage.grantItem('furniture', 'desk')
  storage.setDecorPos('desk', { x: 12, y: 35 })
  storage.setDecorWidth('desk', 22)
  const before = JSON.parse(storage.exportAll())
  assert.equal(storage.setDecorDirection('desk', 'right'), true)
  const after = JSON.parse(storage.exportAll())
  assert.deepEqual(after, { ...before, decorDirection: { desk: 'right' } })
  const backup = storage.exportAll()
  storage.resetAll()
  storage.importAll(backup)
  assert.equal(storage.getDecorDirection('desk'), 'right')
  storage.toggleStored('desk')
  storage.toggleStored('desk')
  assert.equal(storage.getDecorDirection('desk'), 'right')
  storage.resetRoom()
  assert.equal(storage.getDecorDirection('desk'), 'left')
  assert.equal(storage.isOwned('furniture', 'desk'), true)
})

test('legacy and malformed directions fall back; unsupported writes do not alter saves', () => {
  memory.set('training5334.v1', JSON.stringify({ coins: 71, decorDirection: null }))
  assert.equal(storage.getDecorDirection('desk'), 'left')
  const before = storage.exportAll()
  assert.equal(storage.setDecorDirection('desk', 'right'), false)
  assert.equal(storage.setDecorDirection('rug', 'right'), false)
  assert.equal(storage.exportAll(), before)
  storage.grantItem('furniture', 'desk')
  assert.equal(storage.setDecorDirection('desk', 'up'), false)
  assert.equal(storage.setDecorDirection('desk', 'right'), true)
})

test('existing saves gain Quiet without losing their wallet or equipment', () => {
  memory.set('training5334.v1', JSON.stringify({ coins: 77, equipped: { pieces: 'wood', pet: 'fox' } }))
  assert.equal(storage.getEquipped().effect, 'none')
  assert.equal(storage.getEquipped().pieces, 'wood')
  assert.equal(storage.getEquipped().pet, 'fox')
  assert.equal(storage.getCoins(), 77)
})

test('insufficient funds and unowned equipment do not alter the save', () => {
  const before = storage.exportAll()
  assert.equal(storage.buy('effects', 'starlight').ok, false)
  assert.equal(storage.equip('effects', 'starlight'), false)
  assert.equal(storage.exportAll(), before)
})

test('buying an effect pays once, equips it and preserves other equipment', () => {
  storage.addCoins(200)
  const old = storage.getEquipped()
  assert.equal(storage.buy('effects', 'fireflies').ok, true)
  assert.equal(storage.getCoins(), 140)
  assert.deepEqual(storage.getEquipped(), { ...old, effect: 'fireflies' })
  assert.equal(storage.buy('effects', 'fireflies').ok, false)
  assert.equal(storage.getCoins(), 140)
})

test('Quiet is free, and a purchased effect can be equipped again', () => {
  storage.addCoins(110)
  storage.buy('effects', 'petals')
  assert.equal(storage.equip('effects', 'none'), true)
  assert.equal(storage.getEquipped().effect, 'none')
  assert.equal(storage.equip('effects', 'petals'), true)
  assert.equal(storage.getCoins(), 0)
})

test('backup roundtrip retains effect ownership and selection', () => {
  storage.addCoins(180)
  storage.buy('effects', 'starlight')
  const backup = storage.exportAll()
  storage.resetAll()
  storage.importAll(backup)
  assert.equal(storage.isOwned('effects', 'starlight'), true)
  assert.equal(storage.getEquipped().effect, 'starlight')
})

test('.sav roundtrip preserves book, Alpha, room and companion state', () => {
  const data = JSON.parse(storage.exportAll())
  Object.assign(data, { coins: 321, petXp: { cat: 450 }, decorDirection: { desk: 'left' },
    bookProgress: { 307: { clean: true, at: 123 } }, alphaArchive: { sets: { old: { done: true } } },
    review: [{ id: 'book-308', partId: 'book-2', at: 123 }], decorPos: { desk: { x: 20, y: 60 } } })
  memory.set('training5334.v1', JSON.stringify(data))
  const file = storage.exportSave()
  assert.equal(JSON.parse(file).format, '5334-training-save')
  storage.resetAll()
  const before = storage.exportAll()
  storage.importAll(file)
  assert.deepEqual(JSON.parse(storage.exportAll()), data)
  assert.deepEqual(JSON.parse(memory.get('training5334.before-import.v1')), JSON.parse(before))
})

test('invalid saves leave current progress intact', () => {
  const before = storage.exportAll()
  for (const file of ['broken', '{}', '[]', JSON.stringify({ format: '5334-training-save', version: 99 }),
    JSON.stringify({ days: {}, sets: {}, review: [null] }),
    JSON.stringify({ days: {}, sets: {}, review: [], coins: -1 }),
    '{"days":{},"sets":{},"review":[],"__proto__":{}}']) {
    assert.throws(() => storage.importAll(file))
    assert.equal(storage.exportAll(), before)
  }
})

test('failed import write reports failure without replacing current save', () => {
  const before = storage.exportAll()
  const file = storage.exportSave()
  const original = localStorage.setItem
  localStorage.setItem = () => { throw new Error('Quota exceeded') }
  try { assert.throws(() => storage.importAll(file), /Could not save/) }
  finally { localStorage.setItem = original }
  assert.equal(storage.exportAll(), before)
})
