# Character sprite review — 2026-09-12

## Follow-up improvements

All 12 active sprites now load from `public/pets/clean/`. A conservative two-pixel boundary cleanup removes neutral matte remnants without flooding pale fur interiors. Originals remain as backups. Reviewed the complete output sheet on a warm opaque background (`companion-review-clean.png`). Some fine edge softness remains at native resolution.

Built-in imagegen edits: owl stage 3 prompt requested a clearly connected feathered wing gripping its staff, preserving costume and two grounded feet; fox stage 3 prompt requested separated continuous tails behind the rump, preserving face, charms and seated pose. Generated output has a clearer multi-tail fan (not an exact five-tail count). These edits are cropped and aligned back to the existing baselines by `clean-companions.py`.

Room display now applies stage-specific body-size compensation relative to the middle form, capped at 1.8 to limit wide wings/tails. User width remains the base setting. Evolution preview measurements updated for the two edited sprites. The earlier findings below describe the pre-improvement state.

Reviewed all 12 active sprites at their native 320 × 320 resolution. This is a visual review; hidden limbs cannot be counted as missing merely because the pose obscures them.

| Character | Stage 1 | Stage 2 | Stage 3 |
| --- | --- | --- | --- |
| Cat | No obvious anatomical error | No obvious anatomical error; far hind leg obscured | Fixed: one raised forepaw holds the scepter, one grounded forepaw and two hind paws; four total |
| Fox | No obvious anatomical error | Side pose obscures far limbs; no clear duplication | Multiple tails are intentional; overlapping tails make their roots hard to distinguish |
| Owl | Two feet, coherent face | Two feet, coherent face; cloak covers wing roots | Two feet; scepter grip/wing attachment obscured by cape and not clearly drawn |
| Dragon | No obvious duplicated limbs; two wings | No obvious duplicated limbs; two wings | No obvious duplicated limbs; two wings; small final-stage body reduces readability |

## Remaining art defects

- The sprites have visible gray/white edge blocks and halos left by background removal, most conspicuous around ears, hats, wings and fur. This affects the original assets and some edges of the new cat. Transparent-background cleanup is still needed; these sprites should not be described as clean cutouts.
- Owl stage 3 should have a clearer wing/feather grip on its staff. It is ambiguous rather than a confirmed extra-limb defect.
- Fox stage 3 has crowded tail overlaps; retain its intentional fantasy multiple-tail design when cleaning up.
- Owl and dragon stage 3 have large unused top margins. Runtime evolution scaling compensates for body size; do not trim assets without updating layout metrics.

## Active cat asset

`public/pets/cat3-scepter.webp`, selected centrally by `petSprite` for room, shop evolution preview and puzzle companion. Previous cat stage 3 files remain as inactive backups. Built preview contains the same asset.

No other definite five-limb-style anatomical error was identified in this review. The remaining items above have not been repaired as part of the review.
