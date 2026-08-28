// Built-in arrangements shipped with the app, so every visitor sees them in the
// Arrangements dropdown (unlike localStorage saves, which are per-browser).
// `colors` is colors[row][col], row 0 = bottom — same shape as serialize().
//
// Every preset is a Klimt-style gold mosaic massed toward the top left and
// dissolving into clear glass toward the bottom right. They are mosaics, not
// blocks of colour: clear glass is shot all the way through the dense heart, so
// the gold reads as scattered tesserae rather than a painted panel. Amber holds
// the core, sand is a scattered single-block accent, and emerald rides the
// outer fringe where the mosaic breaks up (kept off the bottom rows). All sit
// near Golden Mosaic's balance — about a third of the grid coloured, roughly
// 60/20/20 amber/sand/emerald. 'Golden Mosaic' keeps its original 10-wide
// composition (framed by a clear buffer column each side) as the reference; the
// rest span the full 12 and each follows its own compositional logic.

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
      ['#227735', null, null, null, null, null, null, null, null, null, null, null],
      ['#cac18a', '#e8a33d', '#cac18a', null, '#227735', null, null, null, null, null, null, '#227735'],
      ['#e8a33d', null, '#e8a33d', '#e8a33d', '#e8a33d', null, null, null, '#e8a33d', '#227735', null, null],
      ['#e8a33d', '#e8a33d', '#e8a33d', null, '#e8a33d', '#227735', null, null, null, '#cac18a', null, null],
      ['#e8a33d', null, '#e8a33d', '#e8a33d', '#e8a33d', '#e8a33d', '#cac18a', null, null, null, null, null],
      ['#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', '#cac18a', '#e8a33d', null, '#227735', null, null, null, null],
    ],
  },
  'Woven Gold': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // A basket weave whose over/under bands leave regular clear windows, the
    // shimmer loosening as it falls away from the corner.
    colors: [
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      ['#cac18a', '#227735', null, null, null, null, null, null, null, null, null, null],
      [null, '#e8a33d', '#e8a33d', '#227735', null, null, '#227735', null, null, null, null, null],
      ['#e8a33d', '#cac18a', null, '#e8a33d', '#e8a33d', '#e8a33d', null, null, null, null, null, null],
      ['#cac18a', null, '#cac18a', '#e8a33d', null, '#e8a33d', '#e8a33d', '#227735', null, null, null, null],
      ['#e8a33d', '#e8a33d', '#e8a33d', null, '#e8a33d', '#cac18a', null, '#e8a33d', '#e8a33d', null, null, null],
      ['#e8a33d', '#e8a33d', '#e8a33d', '#e8a33d', '#cac18a', null, '#227735', '#e8a33d', null, '#227735', null, null],
    ],
  },
  'Amber Arc': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // A ribbon arcing out of the corner and sweeping down-right, hollow-cored —
    // the glass rides the curve and leaves the inside of the bend clear.
    colors: [
      [null, null, null, '#e8a33d', null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      ['#e8a33d', '#227735', '#cac18a', null, '#227735', null, null, null, null, null, null, null],
      ['#e8a33d', null, null, '#cac18a', '#e8a33d', null, null, null, null, null, null, null],
      ['#e8a33d', '#e8a33d', '#227735', '#e8a33d', null, '#227735', null, null, null, null, null, null],
      [null, '#cac18a', null, '#e8a33d', '#e8a33d', '#e8a33d', '#e8a33d', null, null, null, null, null],
      ['#e8a33d', null, '#e8a33d', '#e8a33d', '#e8a33d', '#cac18a', null, '#227735', null, null, null, null],
      ['#cac18a', '#e8a33d', '#e8a33d', '#cac18a', '#e8a33d', '#227735', '#e8a33d', '#e8a33d', null, null, null, null],
    ],
  },
  'Ember Scatter': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Constellations: small knots of two or three blocks separated by clear moats,
    // the knots crowding toward the top-left.
    colors: [
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, '#e8a33d', null, '#227735', null, null, null, null, null, null, null, null],
      ['#e8a33d', '#227735', '#cac18a', '#e8a33d', '#e8a33d', null, '#227735', null, null, null, null, null],
      [null, '#e8a33d', null, '#e8a33d', null, '#cac18a', '#e8a33d', null, null, null, null, null],
      ['#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', '#227735', null, '#e8a33d', '#e8a33d', '#227735', null, null, null],
      ['#e8a33d', null, '#e8a33d', '#e8a33d', '#e8a33d', '#cac18a', '#227735', '#cac18a', '#e8a33d', null, null, null],
      ['#e8a33d', '#e8a33d', null, null, '#cac18a', null, null, null, '#e8a33d', null, null, null],
    ],
  },
};
