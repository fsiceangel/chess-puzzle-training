# Chess Puzzle Training

A hobby project shared by a chess enthusiast for their child to practise chess.
The puzzle collection is supplied by the project author. Progress stays in the
browser and can be transferred using .sav files.

## Content and attribution

Artwork includes AI-generated images, edited for this project. The puzzles are
not AI-generated; their original sources are documented in
[the source notes](tools/book/README.md). Supplying the collection does not imply
authorship of its individual puzzles. Third-party rights remain with their owners.
Original book PDFs are not included.

## Playing

Double-click **`Play Chess Puzzle Training.bat`**. The first run builds the site (needs
[Node.js](https://nodejs.org)); after that it just opens
<http://localhost:4173>. Leave the black window open while playing and close it
when finished.

## The course

| Part | Puzzles | What it is |
| --- | --- | --- |
| I · Mate in One | 306 | One move ends it |
| II · Mate in Two | 3,412 | The long middle stretch, and the part that does the most good |
| III · Mate in Three | 744 | Three moves deep |
| IV · Mating Attacks | 600 | Four and five move forced finishes |
| V · Simple Endgames | 144 | Few pieces, exact play |
| VI · Combinations | 128 | Win material by force |

Puzzles are grouped into **sets of 12** — about one sitting — and each part runs
easy to hard, so set 40 is genuinely harder than set 4. A set earns three stars
when every puzzle in it is solved first time.

## How it plays

- The board shows the position, plays the opponent's mistake, then hands over.
- Move by dragging a piece or by tapping the piece and then the square. Legal
  moves are dotted; illegal ones simply do not happen.
- A wrong move is put back with a nudge rather than a failure — she can keep
  trying. **Hint** highlights the piece to move, a second press shows where it
  goes, and **Show me** plays the answer out.
- Longer puzzles are played out move by move: after each correct move the
  opponent replies and the position continues.
- Any mate that works is accepted, not only the one in the book line.
- **Leaving in the middle of a set costs nothing.** The place in the run is
  saved after every puzzle, so closing the tab at puzzle 5 and coming back
  tomorrow carries on at puzzle 5 with the score so far. Part pages mark a
  half-finished set with a progress bar instead of stars.

## Coins, shop, room, badges

Solving pays. Every puzzle earns coins — one for a solve, three for a first-time
clean solve — with bonuses for finishing a set (+5), three-starring it (+10) and
hitting the daily goal (+15, plus a little more per day of streak). Coins come
from solving and nowhere else, which is what makes the shop worth visiting.

The **shop** (coin pill in the header) has four shelves:

- **Boards** — seven themes: meadow, old oak, night sky, tide pool, candy,
  marble, blossom. Pure CSS.
- **Pieces** — the painted set is free; fourteen more *styles* are for sale:
  drawing styles (kawaii, manga, comic book, pixel, 1930s cartoon), materials
  (carved wood, ink and wash, plush felt, gummy, marble, crystal), and three
  drawn in code from the same silhouettes (big letters, checker buttons, neon
  outlines — `tools/art/glyph_sets.py`). Each is the same silhouette set repainted by the model, so a rook
  stays a rook whatever it looks like.
- **Furniture** — the big pieces: armchair, bookshelf, desk, chess table,
  fireplace, piano, bed, rug… They sit behind the small things.
- **Decor** — decorations that appear in the study on the home page as soon as
  they are bought: plants, lamp, books, kite, telescope… Everything in the
  room can be dragged wherever she likes and **resized**: tap a thing to pick up
  a corner handle, then drag it or use − / + to set the size. Sprites are square,
  so only the width changes and nothing ever stretches out of shape. Positions
  and sizes are remembered; *Tidy up* puts everything back to its default spot
  and size, and *Show / hide* opens a panel of everything she owns where a tap
  shows or hides each item in the room — nothing is ever lost. Two items (medal, trophy) cannot be bought and come from
  badges.
- **Companions** — a cat to start; fox, owl and dragon are goals. The companion
  sits in the room and beside the board, cheers a solve, tilts its head at a
  wrong move, and earns nothing for you — it is just company. Each has its own
  voice (the cat is lazy, the fox smug, the owl a teacher, the dragon
  over-excited); left alone in the room they take turns between their own
  remarks, a chess tip — beginner, intermediate or advanced, following how many
  puzzles she has solved — and a chess joke. A tap makes them answer back:
  twenty-odd lines each, never the same one twice in a row, with a riddle now
  and then that the next tap answers, and reactions that escalate through a
  burst of taps (playful → dizzy → theatrically fainting) and reset once she
  leaves it alone. All the lines live in `src/data/voices.js`.

**Companions grow.** Every puzzle solved with a companion out earns it XP (one
for a solve, three for a clean one, ten for the daily goal) and only that
companion — each is raised on its own. At 100 XP it reaches its second stage,
at 400 its third, with a new look each time and a different way of talking: a
kitten mews and naps, a Grand Cat hands out harder tips. The XP bar sits under
the companion in the room; the shop shows each one's stage.

**Badges** live on the Progress page: milestones (first solve, 100, 500…),
streaks, three-star sets, first mate-in-three, and so on. Each pays coins once.

All of it — coins, purchases, what is equipped, badges — is in the same
browser storage as the puzzle progress, and rides along in the backup file.

## The pieces

The default set is cel-shaded in the spirit of a hand-drawn animation film —
bold ink lines, flat colour with two-tone shadows, warm ivory against walnut.
The forms are classic chess forms (horse-head knight, crenellated rook, mitred
bishop with its slit) so every piece reads at a glance. Fourteen more styles of
the same set are in the shop. All ship as webp sprites, about 120 KB a set.

## Where the puzzles come from

The [Lichess open puzzle database](https://database.lichess.org/) (CC0), which
is mined from real games and rated by the players who solve them. This project
takes 5,334 of them, filtered to well-liked puzzles with a settled difficulty,
in the same proportions and order of difficulty the training book uses. No
positions or solutions are copied from that book.

## Working on it

```bash
npm install
npm run dev        # local dev server
npm run validate   # replay all 5,334 solution lines through a chess engine
npm run build      # production build into dist/
```

To rebuild the puzzle files from a fresh database dump:

```bash
curl -O https://database.lichess.org/lichess_db_puzzle.csv.zst
zstd -d lichess_db_puzzle.csv.zst
npm run puzzles -- lichess_db_puzzle.csv
```

The app lives in `E:\claude_github\5334-training`.

`tools/build-puzzles.mjs` holds the selection rules — the quality bar, the
rating window per part, and the counts. `npm run validate` then checks every
line is legal and that every mate really is mate.

Puzzle files land in `public/puzzles/` (about 800 KB total) and are fetched a
part at a time.

## Regenerating the pieces

The cartoon set is made in two stages in `tools/art/`, and the first stage is
what keeps the pieces recognisable:

1. `silhouette.py` draws each piece in code — classic geometry, already
   cel-shaded with a dark side, a highlight band and an ink outline.
   `python tools/art/export_flat.py --install` makes this drawn set the default
   sprites on its own: a clean, deterministic fallback that needs no model.
2. `styles.py` repaints the drawn pieces with Stable Diffusion img2img (needs
   an SDXL checkpoint in `SDXL_MODEL`, plus `torch` and `diffusers`). Because
   the init image already carries the shape and the shading, the model only has
   to add paint — which is also why one silhouette set can become felt, marble,
   crystal or ink and still read as the same chess set. Strength is per piece
   (rook lowest, knight highest) and per style.

```bash
export SDXL_MODEL=/path/to/some-sdxl-model.safetensors
python tools/art/styles.py list
python tools/art/styles.py marble probe     # knight + rook, both sides, to judge the look
python tools/art/styles.py marble all       # 2 candidates x 12 pieces into tools/art/out/marble/
python tools/art/sheets.py marble           # contact sheets to choose from
python tools/art/finish.py marble           # key, trim, align, write public/pieces/marble/
```

`finish.py` with no argument handles the default set. Edit `STYLE_PICKS` there
to choose a different candidate per piece.

The companions and the room art now come from two hand-supplied sheets
(`tools/art/ref_clip2.png` for the companions, `ref_room.png` for the room):
`ref_cutout.py` and `ref_room_cut.py` slice them into tiles and cut each
object out (colour key intersected with a segmenter, shadows removed).
`room_layout.py` then decides how big each piece is in the room — every item
has a target height as a percentage of the room and a foot line, and the width
is derived from what the sprite actually contains — and writes the spots into
`src/data/shop.js`. Edit sizes there, not in shop.js by hand. The older text-to-image sticker scripts (`stickers.py`,
`roombg.py`) are kept for anything the sheets do not cover.

Two things learned the hard way: text-to-image alone cannot make a *set* (every
image invents its own camera and base), and the words *watercolour* or
*gouache* wash a cel-shaded prompt out to grey — they belong in the negative
prompt.
