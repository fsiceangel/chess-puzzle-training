// Achievements. Each rule reads the storage snapshot and says whether it is
// met; `check()` hands out anything newly earned (coins, and the odd item that
// cannot be bought) and returns the list so the screen can celebrate.
import { addCoins, grantBadge, grantItem, snapshot } from '../lib/storage.js'

export const badges = [
  { id: 'first', name: 'First Blood', icon: '♟', blurb: 'Solve your very first puzzle.', coins: 5, test: (s) => s.done >= 1 },
  { id: 'ten', name: 'Warming Up', icon: '✦', blurb: 'Solve 10 puzzles.', coins: 10, test: (s) => s.done >= 10 },
  { id: 'fifty', name: 'Getting Serious', icon: '✦✦', blurb: 'Solve 50 puzzles.', coins: 25, test: (s) => s.done >= 50 },
  { id: 'hundred', name: 'Century', icon: '🏅', blurb: 'Solve 100 puzzles. Comes with a medal for the wall.', coins: 50, item: ['decorations', 'medal'], test: (s) => s.done >= 100 },
  { id: 'fivehundred', name: 'Five Hundred', icon: '🏆', blurb: 'Solve 500 puzzles. That is trophy territory.', coins: 150, item: ['decorations', 'trophy'], test: (s) => s.done >= 500 },
  { id: 'thousand', name: 'Grinder', icon: '👑', blurb: 'Solve 1,000 puzzles.', coins: 300, test: (s) => s.done >= 1000 },
  { id: 'streak3', name: 'Three in a Row', icon: '🔥', blurb: 'Solve on three days running.', coins: 15, test: (s) => s.streak >= 3 },
  { id: 'streak7', name: 'One Whole Week', icon: '🔥🔥', blurb: 'Seven days running.', coins: 40, test: (s) => s.streak >= 7 },
  { id: 'streak30', name: 'A Month of Mates', icon: '🌙', blurb: 'Thirty days running.', coins: 200, test: (s) => s.streak >= 30 },
  { id: 'threestar', name: 'Spotless', icon: '⭐', blurb: 'Finish a set with three stars.', coins: 20, test: (s) => s.threeStarSets >= 1 },
  { id: 'tenstars', name: 'Perfectionist', icon: '⭐⭐', blurb: 'Ten sets with three stars.', coins: 60, test: (s) => s.threeStarSets >= 10 },
  { id: 'mate3', name: 'Deep Thinker', icon: '🔍', blurb: 'Solve a mate in three.', coins: 15, test: (s) => (s.parts['mate-in-three'] ?? 0) >= 1 },
  { id: 'attack', name: 'Hunter', icon: '⚔', blurb: 'Solve ten mating attacks.', coins: 30, test: (s) => (s.parts['mating-attacks'] ?? 0) >= 10 },
  { id: 'endgame', name: 'Closer', icon: '🏁', blurb: 'Solve ten endgames.', coins: 30, test: (s) => (s.parts['endgames'] ?? 0) >= 10 },
  { id: 'goal5', name: 'Habit', icon: '📅', blurb: 'Hit the daily goal five times.', coins: 30, test: (s) => s.goalDays >= 5 },
  { id: 'goal30', name: 'Routine', icon: '📆', blurb: 'Hit the daily goal thirty times.', coins: 150, test: (s) => s.goalDays >= 30 },
  { id: 'evolve', name: 'Growing Up', icon: '🌱', blurb: 'Raise a companion to its second stage.', coins: 30, test: (s) => s.maxPetStage >= 2 },
  { id: 'evolve3', name: 'All Grown', icon: '🌳', blurb: 'Raise a companion all the way.', coins: 100, test: (s) => s.maxPetStage >= 3 },
  { id: 'shopper', name: 'Window Shopper', icon: '🛍', blurb: 'Buy your first thing.', coins: 5, test: (s) => s.ownedCount >= 1 },
  { id: 'collector', name: 'Collector', icon: '🎁', blurb: 'Own ten things from the shop.', coins: 50, test: (s) => s.ownedCount >= 10 },
]

export function check() {
  const s = snapshot()
  const fresh = []
  for (const b of badges) {
    if (s.badges[b.id]) continue
    if (!b.test(s)) continue
    if (!grantBadge(b.id)) continue
    if (b.coins) addCoins(b.coins)
    if (b.item) grantItem(b.item[0], b.item[1])
    fresh.push(b)
  }
  return fresh
}
