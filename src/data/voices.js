// What the companions say. Each has a voice of its own; the chess tips, the
// jokes and the riddles are shared, and the tips get harder as she solves more.

export const VOICES = {
  cat: {
    idle: ['I was napping.', 'Move something already.', 'Is that a mouse? No. A pawn.', '…', 'The king looks nervous.', 'Wake me for the checkmate.'],
    happy: ['Fine. That was good.', 'Checkmate. I called it.', 'Purrfect.', 'Not bad for a human.', 'Mrrow. Yes.'],
    oops: ['Nope.', 'That is not it, human.', 'Try the other one.', 'I saw that coming.'],
    poke: [
      'Hey.', 'That tickles.', 'Mrrp?', 'I was busy. Being a cat.', 'Do not.', 'Okay, one more.',
      'You have chosen chaos.', 'I am a serious chess cat.', 'Boop yourself.', 'The window. Put me by the window.',
      'I will allow it. Once.', 'Was that a knight? No. Your finger.', 'I have nine lives and you are using them up.',
      'Purr. Do not tell anyone.', 'If I fall asleep, that is your fault.', 'Meow. That is cat for checkmate.',
      'I demand a pawn. To sit on.', 'Fine. I like you.', 'My tail is not a lever.', 'Is it dinner? It is not dinner.',
    ],
    dizzy: ['@_@', 'The room is spinning. Or I am.', 'Stop. Everything is a knight now.', 'Wobbly cat. Wobbly.'],
    annoyed: ['Enough.', 'I am going to sit on the board and nobody can move.', 'Human. Solve. Something.', 'I am asleep now. Officially.'],
    milestones: { 20: 'Twenty pokes. I am keeping a list.', 50: 'Fifty. You are officially my human.', 100: 'One hundred. Fine. Best friends.' },
  },
  fox: {
    idle: ['Bet you cannot find it.', 'I already see it.', 'Faster, faster.', 'Which piece is loose?', 'Tick tock. Pretend there is a clock.'],
    happy: ['Ha! Told you.', 'Sharp!', 'Quick and clean.', 'Too easy.', 'That is how a fox does it.'],
    oops: ['Ooh, close.', 'Not that. Look again.', 'Sneakier.', 'A fox would not do that.'],
    poke: [
      'Boop.', 'Hands off the tail.', 'Again! Faster!', 'You are slow. I let you.', 'Race you to the next set.',
      'Foxes are basically knights. Sneaky and two-steppy.', 'I stole a pawn. Do not look in my tail.',
      'Ha! Missed me. Okay, you did not.', 'Try that on a rook.', 'I am fast, you know.', 'Tag. You are it.',
      'Do it again and I bite. Playfully.', 'Everything is a game if you are quick enough.', 'Sneak, sneak.',
      'That was a fork. On my nose.', 'Quick question: where is your king?', 'I would win at this.', 'Hehe. Fine.',
      'Nobody out-sneaks a fox.', 'Is this a trap? It is a trap.',
    ],
    dizzy: ['Whoa, whoa.', 'Too many. Even for me.', 'Dizzy fox. Still fast.', 'The board is doing loops.'],
    annoyed: ['Okay. Truce.', 'Poke the bishop instead.', 'I am hiding under the desk.', 'Fox out. Fox back later.'],
    milestones: { 20: 'Twenty. Are you counting? I am.', 50: 'Fifty! Fastest poker alive.', 100: 'One hundred. You win. Fox admits it.' },
  },
  owl: {
    idle: ['Every position asks a question.', 'Have you counted the flight squares?', 'Patience. Then precision.', 'Hoo is attacking whom?', 'A wise player looks twice.'],
    happy: ['Well reasoned.', 'Precisely so.', 'You saw the whole line.', 'Excellent.', 'Hoo would have thought. You.'],
    oops: ['Consider again.', 'Hoo? Not that one.', 'What did you miss?', 'Look at the king’s escape.'],
    poke: [
      'Yes?', 'Hoo.', 'I am listening.', 'A question, perhaps?', 'Careful with the feathers.', 'Hoo is this? Ah. You.',
      'Wisdom takes patience. So do I.', 'I have seen many pokes. This is one.', 'The knight moves in an L. The owl does not move.',
      'Tap, tap. Very rhythmic.', 'Have you considered a puzzle?', 'Owls rotate their heads. I choose not to.',
      'That was a check. On my dignity.', 'Hoo-ray. I suppose.', 'I am not a button.', 'My feathers are not for forks.',
      'Noted.', 'Proceed. But with purpose.', 'I blink slowly. That is approval.', 'Ask me about the opposition.',
    ],
    dizzy: ['Hoo… hoo… the room turns.', 'My head. It is rotating. Involuntarily.', 'I am wise, not dizzy. Well.', 'Feathers. Everywhere.'],
    annoyed: ['This is beneath both of us.', 'Go. Solve. I shall wait.', 'I am pretending to be a statue.', 'The lesson is over.'],
    milestones: { 20: 'Twenty. A pattern emerges.', 50: 'Fifty. I have written a paper on you.', 100: 'One hundred. You are my favourite student.' },
  },
  dragon: {
    idle: ['Rawr! That means hello.', 'I am small but I am fierce.', 'One day I will be a big dragon.', 'Burn the king! Politely.', 'Is it my turn? No? Okay.'],
    happy: ['RAWR! Checkmate!', 'You did it! Fire!', 'That was AMAZING.', 'Best move ever.', 'Dragon-approved.'],
    oops: ['Oof.', 'The king got away!', 'Try again, I believe in you!', 'Nooo. Okay, again.'],
    poke: [
      'Rawr!', 'Hehe!', 'Do it again!', 'I am ticklish!', 'Wing tickle!', 'Tiny fire! Tiny!', 'I ate a pawn. It was crunchy.',
      'When I grow up I will be a queen. Wait.', 'Rawr means checkmate. Also hello. Also lunch.', 'My tail! My TAIL!',
      'You are my best friend. Also my second best.', 'I can fly! A little. Not now.', 'Let us burn the king. Politely.',
      'Poke poke poke, I love it!', 'Dragons do not get tickled. Hehe. Okay they do.', 'I am fierce! RAWR! Hug?',
      'That was a knight fork! On me!', 'More!', 'Do you want to see my hoard? It is three pawns.', 'Sneeze incoming. Stand back.',
    ],
    dizzy: ['Whoooa the ceiling!', 'I am a spinning dragon!', 'Dizzy! Still fierce!', 'Which way is the king?!'],
    annoyed: ['Okay okay okay!', 'Dragon needs a nap now.', 'Too many! I am hiding! Here! Behind you!', 'No more! Yes more! No!'],
    milestones: { 20: 'Twenty pokes! New record!', 50: 'Fifty! You get a dragon hug!', 100: 'ONE HUNDRED! I am a big dragon now! (No.)' },
  },
}

// Younger and older versions of each companion talk differently. Stage 2 is
// the voice above; these replace the idle chatter at stages 1 and 3.
export const STAGE_IDLE = {
  cat: {
    1: ['Mew.', 'Nap? Nap.', 'Is that the king? Squishy.', 'I am a small cat. Big opinions.', 'Mrrp!'],
    3: ['I have seen ten thousand positions. This one is fine.', 'Look for the quiet move, kitten.', 'A cat never hurries. Neither should a good move.', 'The king is nervous. Good. Keep him nervous.', 'Bring me a checkmate and I may open one eye.'],
  },
  fox: {
    1: ['Yip!', 'Race you!', 'What is this piece? Can I have it?', 'Sneak sneak sneak.', 'I am small but I am FAST.'],
    3: ['Every fork is a promise. Keep it.', 'Speed is nothing without the right square.', 'I have outfoxed better players than you. Prove me wrong.', 'The knight is a fox that learned to jump.', 'Quick now: what does the queen defend?'],
  },
  owl: {
    1: ['Hoo?', 'I am learning to be wise.', 'Big eyes. Bigger questions.', 'Hoo is the king?', 'I blink. That means yes.'],
    3: ['Consider the opposition. Then consider it again.', 'A tempo is worth a pawn in the right position.', 'I have written three books. You are in the fourth.', 'Prophylaxis: ask what they want, then take it away.', 'The endgame is where wisdom lives. Go there.'],
  },
  dragon: {
    1: ['Rawr? (small rawr)', 'I hatched today! Maybe yesterday.', 'Fire soon. Not yet.', 'Are you my human?', 'Tiny wings! Look!'],
    3: ['RAWR. That is a big-dragon rawr.', 'I burn kings for breakfast. Politely.', 'My wings could cover the whole board.', 'Sacrifice boldly. Dragons do.', 'Fly with me: a check, a check, and mate.'],
  },
}

export const TIPS = {
  beginner: [
    'Check all checks. Every single one.',
    'Before you move, ask: what does this piece attack now?',
    'A king with no escape squares is a king in trouble.',
    'Look at what your opponent’s last move changed.',
    'Knights hop over things. Rooks and bishops do not.',
    'A queen alone cannot checkmate. She needs a helper.',
    'If a piece is attacked, count: how many attackers, how many defenders?',
    'The back rank is a trap when the pawns in front of the king have not moved.',
    'Move the piece in your head first. On the board second.',
    'Find the enemy king before you look at anything else.',
  ],
  intermediate: [
    'A check that also attacks another piece is a fork. Knights are best at it.',
    'A pinned piece cannot move — so attack it again.',
    'A quiet move can be stronger than a check: it takes away the last escape square.',
    'When the enemy queen is far from her king, look for a sacrifice.',
    'Two rooks on the seventh rank are a mating machine.',
    'If the defender has only one reply, you have found the way.',
    'A discovered attack moves one piece to unmask another. Look for a piece standing in front of your rook or bishop.',
    'Do not rush the capture. Ask what happens if you do not take.',
    'A smothered mate needs a knight and a king boxed in by its own pieces.',
    'Count the flight squares. Then cover them one by one.',
  ],
  advanced: [
    'Deflection: pull the defender away from what it guards, then take.',
    'The in-between move often decides a combination. Look for one before you recapture.',
    'In pawn endings, the opposition wins or draws. Learn it cold.',
    'A rook belongs behind a passed pawn — yours or theirs.',
    'Ahead in material? Trade pieces, not pawns.',
    'Look for the move that threatens two things. One threat can be met; two usually cannot.',
    'The king is a fighting piece in the endgame. Bring it to the centre.',
    'Before a sacrifice, calculate the quiet reply. It is usually the one that refutes it.',
    'In a mating attack every move must be a check, a capture, or an unanswerable threat.',
    'A knight on the rim is dim. A knight on an outpost is a monster.',
  ],
}

export const JOKES = [
  'Why did the pawn cross the board? To become a queen.',
  'What is a knight’s favourite dance? The L-step.',
  'A bishop walked into a café. The waiter said: diagonally, please.',
  'Why do pawns never get lost? They only know one way: forward.',
  'What did the rook say to the king? Let’s castle. It is safer at home.',
  'What is the queen’s least favourite word? Fork.',
  'Why was the chess player so calm? She had already checked everything. Twice.',
  'How do chess pieces say goodbye? Check you later!',
  'Why did the knight fail geography? Two steps this way, one step that way, every time.',
  'What do you call two rooks on the seventh rank? A very bad day for the king.',
  'Why did the pawn feel special? It got promoted and nobody else did.',
  'What is a pawn’s favourite subject? Advanced maths.',
  'I played chess against a cat. It knocked the pieces over and still won.',
  'Why is the king bad at hide and seek? Someone always finds him.',
  'What do you call a bishop with no diagonals? Stuck.',
]

// Asked on one poke, answered on the next.
export const RIDDLES = [
  { q: 'Riddle: which piece can jump over the others?', a: 'The knight! Sneaky little horse.' },
  { q: 'Riddle: which piece never, ever moves backwards?', a: 'The pawn. Forward only, no regrets.' },
  { q: 'Riddle: which piece can turn into a different piece?', a: 'A pawn — it promotes on the last rank.' },
  { q: 'Riddle: which piece moves like a rook AND a bishop?', a: 'The queen. Show-off.' },
  { q: 'Riddle: how many squares on the board?', a: 'Sixty-four. Half of them dark.' },
  { q: 'Riddle: which piece can never be captured?', a: 'The king. He gets checkmated instead.' },
  { q: 'Riddle: what move lets the king and a rook move together?', a: 'Castling. The king’s only two-step.' },
  { q: 'Riddle: which two pieces stand right next to the king at the start?', a: 'The queen on one side, a bishop on the other.' },
  { q: 'Riddle: what is it called when a pawn captures a pawn that just rushed past?', a: 'En passant. Say it fancy.' },
  { q: 'Riddle: how many points is a queen worth?', a: 'Nine. Rook five, bishop and knight three, pawn one.' },
]

// Beginner while the first few sets go by, then the tips grow up with her.
export function levelFor(solved) {
  return solved < 60 ? 'beginner' : solved < 400 ? 'intermediate' : 'advanced'
}

const at = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length]

// Random pick that never repeats the last few, so a burst of taps does not hear
// the same line twice.
function fresh(pool, recent) {
  const choices = pool.filter((l) => !recent.includes(l))
  const list = choices.length ? choices : pool
  return list[Math.floor(Math.random() * list.length)]
}

// A line in the companion's own voice for a mood. `seed` makes the pick stable
// for a moment (a puzzle index, a tick) rather than flickering every render.
export function say(petId, mood, seed = 0) {
  const v = VOICES[petId] ?? VOICES.cat
  return at(v[mood] ?? v.idle, seed)
}

// Idle chatter in the room: its own remarks, a tip, a remark, a joke, round and
// round — so a child who leaves it open learns something between the jokes.
export function chatter(petId, tick, solved, stage = 2) {
  const v = VOICES[petId] ?? VOICES.cat
  const step = tick % 4
  // a grown companion pitches its tips one level up
  const lvl = levelFor(solved)
  const tipLevel = stage === 3 ? { beginner: 'intermediate', intermediate: 'advanced', advanced: 'advanced' }[lvl] : lvl
  if (step === 1) return at(TIPS[tipLevel], Math.floor(tick / 4))
  if (step === 3) return at(JOKES, Math.floor(tick / 4))
  const idle = STAGE_IDLE[petId]?.[stage] ?? v.idle
  return at(idle, Math.floor(tick / 2))
}

const ANIMS_SOFT = ['bounce', 'hop', 'wobble']
const ANIMS_PLAYFUL = ['spin', 'flip', 'hop', 'bounce']

export function newPokeState() {
  return { total: 0, streak: 0, lastAt: 0, recent: [], riddle: null }
}

// One tap on the companion. Reactions escalate with a burst of taps, calm down
// if she leaves it alone, and every so often turn into a riddle that the next
// tap answers. Returns { line, anim, hold } and the updated state.
export function poke(petId, state, now = Date.now()) {
  const v = VOICES[petId] ?? VOICES.cat
  const s = { ...state, recent: state.recent.slice(-6) }
  s.total += 1
  s.streak = now - s.lastAt < 2500 ? s.streak + 1 : 1
  s.lastAt = now

  let line
  let anim
  let hold = 1800

  if (s.riddle) {
    line = s.riddle.a
    s.riddle = null
    anim = 'hop'
    hold = 3200
  } else if (v.milestones[s.total]) {
    line = v.milestones[s.total]
    anim = 'spin'
    hold = 3200
  } else if (s.streak >= 10) {
    line = fresh(v.annoyed, s.recent)
    anim = 'faint'
    hold = 2600
  } else if (s.streak >= 7) {
    line = fresh(v.dizzy, s.recent)
    anim = 'dizzy'
  } else {
    const roll = Math.random()
    if (roll < 0.18) {
      const r = RIDDLES[Math.floor(Math.random() * RIDDLES.length)]
      s.riddle = r
      line = r.q
      anim = 'wobble'
      hold = 4200
    } else if (roll < 0.28) {
      line = fresh(JOKES, s.recent)
      anim = 'bounce'
      hold = 3600
    } else {
      line = fresh(v.poke, s.recent)
      anim = (s.streak >= 3 ? ANIMS_PLAYFUL : ANIMS_SOFT)[Math.floor(Math.random() * 3)]
    }
  }
  s.recent.push(line)
  return { line, anim, hold, state: s }
}
