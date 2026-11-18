// Built-in arrangements shipped with the app, so every visitor sees them in the
// Arrangements dropdown (unlike localStorage saves, which are per-browser).
// `colors` is colors[row][col], row 0 = bottom — same shape as serialize().
//
// Every preset is a Klimt-style gold mosaic massed toward the top left and
// dissolving into clear glass toward the bottom right: amber holds the core,
// sand is a scattered single-block accent, and emerald rides the outer fringe
// (kept off the bottom rows). All sit near Golden Mosaic's balance — about a
// third of the grid coloured, roughly 60/20/20 amber/sand/emerald.
//
// Four rules come from what read wrong on the wall in review:
//   * no solid 2x2 block of glass — it reads as a drawn square, not a mosaic;
//   * no three emeralds on a line, which turns the accent into a ruled edge;
//   * no run of four of one colour in any direction, for the same reason;
//   * the dissolve has to strand a few blocks in the far corner rather than
//     leaving a dead triangle there.
// 'Dappled Light', 'Ember Drift', 'Lichen Bloom' and 'Tesserae Drift' satisfy
// all four. 'Golden Mosaic' and 'Gold Rain' predate them and are kept exactly as
// they are because they were liked as they are — Golden Mosaic also keeps its
// original 10-wide composition, framed by a clear buffer column each side, as
// the reference the others are balanced against.
//
// The three newest are grown from a process rather than drawn to a rule, which
// is what keeps them organic: noise-driven dapple, advected embers, and
// diffusion-limited aggregation.
//
// The bottom-weighted set ('Tesserae Settle', 'Tesserae Rising', 'Twin Drift',
// 'Steam') flips the composition for privacy: colour is massed in the bottom
// three rows (the 18" above the tub) and thins upward into a few flecks. Each uses
// exactly the glass on hand — 21 amber, 7 sand, 6 emerald — and passes all four
// rules (checked as runs in rows, columns and both diagonals).

export const PRESET_ARRANGEMENTS = {
  'Golden Mosaic': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    colors: [
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, '#227735', null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, '#227735', '#e8a33d', null, null, null, null],
      [null, null, '#cac18a', null, null, '#e8a33d', null, null, '#227735', null, null, null],
      [null, null, '#227735', '#e8a33d', null, null, '#cac18a', null, null, null, null, null],
      [null, null, '#e8a33d', null, '#cac18a', '#e8a33d', null, '#e8a33d', null, '#227735', null, null],
      [null, '#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', null, '#e8a33d', '#227735', '#e8a33d', null, null, null],
      [null, '#e8a33d', '#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', '#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', null, null],
    ],
  },
  'Gold Rain': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Broken vertical streaks of gilding running down the glass — long on the left,
    // guttering out to the right, each streak interrupted by clear blocks.
    colors: [
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      ['#227735', null, '#e8a33d', null, '#227735', null, null, null, null, null, null, null],
      ['#e8a33d', null, null, null, '#e8a33d', null, null, null, null, null, null, null],
      ['#cac18a', null, null, '#e8a33d', '#e8a33d', null, '#227735', null, null, null, null, null],
      ['#e8a33d', null, '#cac18a', null, '#e8a33d', '#e8a33d', '#cac18a', '#e8a33d', '#227735', null, null, null],
      [null, '#e8a33d', '#e8a33d', null, null, '#e8a33d', null, null, '#cac18a', '#e8a33d', null, null],
      ['#cac18a', '#e8a33d', '#e8a33d', '#e8a33d', '#e8a33d', '#cac18a', '#e8a33d', '#227735', '#e8a33d', '#e8a33d', '#227735', null],
    ],
  },
  'Tesserae Drift': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Pointillist tesserae thrown from the top-left corner, thinning as they fly,
    // with a few flecks landing far out in the clear.
    colors: [
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, '#e8a33d', null, null, null, null],
      ['#227735', null, null, null, null, null, null, null, '#e8a33d', null, null, null],
      ['#cac18a', '#e8a33d', '#cac18a', null, '#227735', null, '#e8a33d', null, null, null, null, '#227735'],
      ['#e8a33d', null, '#e8a33d', '#e8a33d', '#e8a33d', null, null, null, '#e8a33d', '#227735', null, null],
      ['#e8a33d', '#e8a33d', '#e8a33d', null, '#e8a33d', '#227735', null, null, null, '#cac18a', null, null],
      ['#e8a33d', null, '#e8a33d', null, null, '#e8a33d', '#cac18a', null, null, null, null, null],
      ['#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', '#cac18a', '#e8a33d', null, '#227735', null, null, null, null],
    ],
  },
  'Dappled Light': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Sunlight broken up through leaves — overlapping soft patches at two scales,
    // so the gold gathers in irregular clumps with holes bitten through it.
    colors: [
      [null, null, null, null, null, null, '#e8a33d', null, null, null, null, null],
      ['#e8a33d', '#e8a33d', null, null, null, null, null, '#e8a33d', '#e8a33d', null, null, null],
      ['#e8a33d', null, '#227735', null, null, null, null, null, null, null, null, null],
      [null, '#e8a33d', '#cac18a', null, null, null, '#cac18a', null, '#227735', null, null, null],
      [null, null, null, '#e8a33d', '#e8a33d', '#e8a33d', '#227735', null, null, null, null, null],
      [null, '#e8a33d', null, '#cac18a', null, '#e8a33d', null, null, '#e8a33d', '#227735', null, null],
      ['#cac18a', null, '#e8a33d', null, '#e8a33d', null, '#e8a33d', null, null, null, null, null],
      ['#e8a33d', '#e8a33d', '#e8a33d', '#cac18a', '#e8a33d', '#227735', null, '#cac18a', '#227735', null, null, null],
    ],
  },
  'Ember Drift': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Embers carried on a draught: released at the top left and advected through a
    // curl of moving air, the trails wandering and thinning as they travel.
    colors: [
      [null, null, null, null, null, null, '#e8a33d', null, '#cac18a', null, null, null],
      [null, null, null, null, '#e8a33d', null, '#e8a33d', '#cac18a', '#e8a33d', null, null, null],
      [null, null, null, null, '#227735', '#e8a33d', null, '#227735', null, null, null, null],
      ['#e8a33d', '#e8a33d', '#227735', '#e8a33d', '#e8a33d', null, '#e8a33d', null, null, null, null, null],
      ['#e8a33d', null, '#e8a33d', null, '#e8a33d', '#227735', '#e8a33d', null, null, null, '#227735', null],
      [null, '#e8a33d', null, '#cac18a', null, '#cac18a', null, null, null, null, null, null],
      ['#cac18a', '#e8a33d', '#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', null, null, null, null, null, null],
      [null, '#e8a33d', null, null, null, null, null, null, null, '#227735', null, null],
    ],
  },
  'Lichen Bloom': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Lichen creeping across the glass — grown by diffusion-limited aggregation, so
    // the colony carries the ragged branching fringe of the real thing.
    colors: [
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, '#e8a33d', '#e8a33d', null, null, null, null, null, null, null, null],
      [null, '#e8a33d', '#227735', null, null, null, '#e8a33d', '#e8a33d', '#227735', null, null, null],
      [null, null, '#e8a33d', '#e8a33d', null, '#227735', null, null, '#cac18a', null, null, null],
      ['#e8a33d', '#e8a33d', null, '#e8a33d', '#e8a33d', '#e8a33d', null, '#cac18a', null, null, null, null],
      ['#e8a33d', null, '#cac18a', null, '#227735', null, '#e8a33d', '#e8a33d', '#227735', null, null, null],
      ['#cac18a', null, '#e8a33d', '#e8a33d', null, '#e8a33d', null, null, '#cac18a', null, null, null],
      ['#e8a33d', '#cac18a', '#e8a33d', null, null, null, '#227735', null, null, null, null, null],
    ],
  },
  'Tesserae Settle': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Tesserae Drift turned over: the same throw, now landing along the
    // bottom left and thinning up and right, so the tub side is screened.
    colors: [
      ['#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', '#cac18a', '#e8a33d', null, '#227735', null, '#e8a33d', null, null],
      ['#cac18a', null, '#cac18a', null, null, '#e8a33d', '#e8a33d', null, null, null, '#cac18a', null],
      ['#e8a33d', '#e8a33d', '#e8a33d', null, '#cac18a', '#227735', null, null, null, '#cac18a', null, null],
      ['#e8a33d', null, '#e8a33d', '#e8a33d', '#e8a33d', null, null, null, '#e8a33d', '#227735', null, null],
      ['#e8a33d', '#e8a33d', '#e8a33d', null, '#227735', null, '#e8a33d', null, null, null, null, '#227735'],
      ['#227735', null, null, null, null, null, null, null, '#e8a33d', null, null, null],
      [null, null, null, null, null, null, null, '#e8a33d', null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },
  'Tesserae Rising': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Tesserae settled across the full width of the bottom 18", thinning
    // upward into a few flecks — the most even privacy band of the set.
    colors: [
      ['#e8a33d', null, '#cac18a', '#e8a33d', '#e8a33d', '#227735', null, '#e8a33d', '#e8a33d', '#cac18a', null, '#e8a33d'],
      ['#227735', '#e8a33d', '#e8a33d', null, '#cac18a', null, '#e8a33d', '#e8a33d', null, '#e8a33d', '#cac18a', null],
      ['#e8a33d', null, '#cac18a', '#e8a33d', null, '#e8a33d', null, null, '#e8a33d', '#227735', null, '#e8a33d'],
      [null, null, '#e8a33d', null, '#227735', null, null, '#e8a33d', null, null, '#e8a33d', null],
      [null, '#e8a33d', null, null, null, null, '#227735', null, null, '#cac18a', null, null],
      [null, null, '#cac18a', null, null, null, null, null, null, null, null, '#227735'],
      [null, null, null, null, null, null, null, null, null, '#e8a33d', null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },
  'Twin Drift': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Two drifts banked into the bottom corners, meeting low in the middle and
    // leaving the upper centre open to the sky.
    colors: [
      [null, '#e8a33d', '#e8a33d', '#e8a33d', null, '#227735', '#e8a33d', '#e8a33d', null, '#e8a33d', null, '#e8a33d'],
      ['#e8a33d', '#227735', null, '#cac18a', '#e8a33d', null, null, '#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', null],
      ['#cac18a', null, '#e8a33d', null, '#e8a33d', '#e8a33d', '#227735', null, null, null, '#cac18a', '#227735'],
      [null, '#e8a33d', '#cac18a', null, null, '#e8a33d', null, null, null, '#e8a33d', null, '#e8a33d'],
      ['#e8a33d', null, null, '#227735', null, null, null, null, null, null, null, '#cac18a'],
      [null, '#cac18a', null, null, null, null, null, null, null, null, '#227735', null],
      [null, null, null, null, null, null, null, null, null, null, null, '#e8a33d'],
      [null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },
  'Steam': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // A dense full-width base with a loose plume of tesserae lifting off it,
    // like steam rising from the tub, drifting right as it goes.
    colors: [
      ['#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', null, '#227735', '#e8a33d', null, '#e8a33d', '#cac18a', '#e8a33d', '#e8a33d'],
      [null, '#e8a33d', null, '#227735', '#e8a33d', null, '#cac18a', '#e8a33d', null, '#e8a33d', null, '#e8a33d'],
      ['#e8a33d', '#cac18a', null, '#e8a33d', null, '#cac18a', '#e8a33d', null, '#e8a33d', null, '#227735', null],
      [null, null, '#e8a33d', null, null, null, '#e8a33d', '#227735', null, null, null, '#e8a33d'],
      [null, null, null, null, null, '#e8a33d', null, null, '#cac18a', null, null, null],
      [null, null, null, null, null, null, '#227735', null, null, null, '#227735', null],
      [null, null, null, null, null, null, null, null, '#e8a33d', null, null, null],
      [null, null, null, null, null, null, null, '#cac18a', null, null, null, null],
    ],
  },
};
