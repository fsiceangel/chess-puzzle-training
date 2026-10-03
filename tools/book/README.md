# Original book course

Update: problems 1–4462 now use denialromeo/4462-chess-problems/problems.json.
All 4462 lines replay legally and finish in checkmate. The upstream README
explicitly offers the problem data for other projects; its text is preserved
under upstream/README.md. Run `node tools/book/import-upstream.mjs` after PDF
extraction/build. upstream-report.json records source hash and 20 differing
diagrams. PDF text/FEN and page links remain available; the UI identifies
differences instead of claiming the two editions are identical. Problems
4463–5334 remain from the supplied PDF; 6 of these remain reference-only.
Existing book IDs, Alpha archive and progress are not renamed or reset.

Source: user-supplied `C:/Users/Administrator/Downloads/23.pdf`, 1184 pages,
PDF title `Chess: 5334 Problems, Combinations and Games`.
The PDF is retained locally under ignored `private-reference/source.pdf` for
page-level checking, and is not included in public assets or builds.

`extract.py` reads `tmp/pdfs/book-pages.json` (pypdf text extracted from each page)
and maps the chess font glyphs to pieces. Every number 1–5334 occurs exactly once
as a diagram; all 5334 solution entries were recovered. No Lichess position is
assigned a book number. Both diagram and answer PDF page numbers are retained.

`node tools/book/build.mjs` compiles the printed main lines with chess.js.
`--retry` rechecks only reference-only entries using an existing output.
Variations and original solution text remain available in the reader. Printed
solutions which provide just a key move are not expanded with invented moves.
5327 main lines pass legal-move replay; 7 remain reference-only:
3518, 4463, 4681, 4694, 4817, 4915, 4980. No reward or completion button is
offered for those seven until their diagram/solution discrepancy is resolved.
Legal replay is not an engine proof of every variation or of the book's claims.

The source requires en-passant rights for #306 and #1486. Where miniature-game
opening text does not replay but the printed continuation does, the continuation
is validated directly from the diagram and this is noted on the data record.

Alpha migration is local and idempotent: it retains an independent pre-book
backup at `training5334.before-book.v1` and an `alphaArchive` in the normal save.
Wallet, pets, room, previous set/day/run/review records remain intact. Book
completions use `bookProgress` and never inherit old set completions. Old saves
lack a full per-puzzle log; Alpha only reconstructs IDs from completed sets,
saved run tallies and the review queue, and preserves other aggregate records
without inventing unknown IDs. Old puzzle JSON files remain available for replay.

Validation: storage migration/roundtrip and side-to-move tests live in
`tools/art/effects.test.mjs`. `extraction-report.json` checks numbering coverage;
`validation-report.json` lists unresolved legal-line discrepancies.
