// The six parts of the course, in the order and the proportions a classic
// training book uses: a small warm-up of mates in one, then the long middle
// stretch of mates in two, and shorter specialist parts after it.
export const parts = [
  {
    id: 'mate-in-one',
    number: 'I',
    title: 'Mate in One',
    subtitle: 'One move ends it',
    accent: 'teal',
    total: 306,
    blurb:
      'Every position here is over in a single move. Find the one that leaves the enemy king in check with nowhere to go.',
    tips: [
      'Start from the enemy king. Which squares can it run to?',
      'A check is only mate when every escape square is covered as well.',
      'Look at your queen and rooks first — they cover the most squares.',
    ],
  },
  {
    id: 'mate-in-two',
    number: 'II',
    title: 'Mate in Two',
    subtitle: 'The heart of the course',
    accent: 'coral',
    total: 3412,
    blurb:
      'The biggest part by far, and the one that does the most for your game. Your first move forces a reply, and the second one finishes.',
    tips: [
      'Look for forcing moves first: checks, captures, threats.',
      'Play the whole line in your head before you touch a piece.',
      'If the king has one escape square, ask what would cover it.',
    ],
  },
  {
    id: 'mate-in-three',
    number: 'III',
    title: 'Mate in Three',
    subtitle: 'Three moves deep',
    accent: 'violet',
    total: 744,
    blurb: 'Same idea, one move further. Often the first move is a quiet one that takes the last flight square away.',
    tips: [
      'Count the defender’s replies. Fewer replies means a stronger move.',
      'A sacrifice that drags the king forward is often the key.',
      'If nothing forcing works, look for a quiet move that sets up the net.',
    ],
  },
  {
    id: 'mating-attacks',
    number: 'IV',
    title: 'Mating Attacks',
    subtitle: 'Longer forced finishes',
    accent: 'amber',
    total: 600,
    blurb: 'Four and five move finishes against a king that has been caught in the open. Keep every move forcing.',
    tips: [
      'Every move in the line should be a check, a capture, or an unanswerable threat.',
      'Material does not matter here — only the king does.',
      'Drive the king towards your pieces, not away from them.',
    ],
  },
  {
    id: 'endgames',
    number: 'V',
    title: 'Simple Endgames',
    subtitle: 'Few pieces, exact play',
    accent: 'green',
    total: 144,
    blurb:
      'Positions with almost nothing left on the board, where one precise move decides the game — a pawn that queens, a rook that cuts the king off.',
    tips: [
      'Count how many moves a pawn needs to promote, and whether the king can catch it.',
      'Push the passed pawn; use the king actively.',
      'Cut the enemy king off from the action with a rook.',
    ],
  },
  {
    id: 'combinations',
    number: 'VI',
    title: 'Combinations',
    subtitle: 'Win material by force',
    accent: 'blue',
    total: 128,
    blurb:
      'No mate this time — just a forcing sequence that wins a piece. Forks, pins, skewers, and taking away a defender.',
    tips: [
      'Look for enemy pieces that are undefended or on the same line.',
      'A check that also attacks something else is a fork.',
      'Before you win a piece, check that the defender cannot simply recapture.',
    ],
  },
]

export const partById = (id) => parts.find((p) => p.id === id)
