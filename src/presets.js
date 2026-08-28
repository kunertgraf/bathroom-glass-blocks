// Built-in arrangements shipped with the app, so every visitor sees them in the
// Arrangements dropdown (unlike localStorage saves, which are per-browser).
// `colors` is colors[row][col], row 0 = bottom — same shape as serialize().
//
// All four presets share a 12x8 grid and the same Klimt-style gold ombré
// motif — dense mosaic up top, dissolving to clear glass at the bottom — with
// emerald and sand woven through as recurring accents. 'Golden Mosaic' is
// kept at its original 10-wide composition (framed by a one-block clear-glass
// buffer column on each side) as a reference; the newer arrangements span the
// full 12-wide opening edge to edge.

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
  'Amber Cascade': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Amber-forward ombré across the full width, sand secondary, green a rare accent.
    colors: [
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, '#e8a33d', null, null, null, null, null],
      [null, null, null, null, null, null, null, '#cac18a', null, null, '#227735', null],
      [null, null, '#227735', null, '#cac18a', '#cac18a', null, null, null, null, null, '#e8a33d'],
      ['#227735', null, null, null, null, '#e8a33d', null, '#cac18a', null, null, null, '#cac18a'],
      ['#e8a33d', null, '#e8a33d', '#cac18a', '#e8a33d', null, null, null, null, '#cac18a', null, '#e8a33d'],
      ['#e8a33d', '#cac18a', '#cac18a', null, '#227735', '#227735', null, '#cac18a', null, '#cac18a', '#cac18a', null],
      ['#cac18a', '#cac18a', '#227735', null, '#cac18a', '#227735', '#227735', '#cac18a', '#cac18a', '#e8a33d', '#e8a33d', '#e8a33d'],
    ],
  },
  'Emerald Veil': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Green-forward canopy across the full width, amber/sand woven in beneath.
    colors: [
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, '#e8a33d', null, null, null, null],
      [null, null, '#227735', null, '#cac18a', null, null, null, null, null, null, null],
      [null, '#cac18a', null, null, null, '#227735', '#227735', '#cac18a', null, null, null, null],
      ['#e8a33d', null, '#cac18a', null, null, null, null, null, '#227735', null, null, '#cac18a'],
      ['#227735', '#227735', null, null, null, null, null, '#cac18a', '#227735', null, '#227735', '#227735'],
      ['#227735', '#227735', '#227735', '#227735', null, null, '#227735', null, '#227735', '#227735', null, '#cac18a'],
      ['#cac18a', '#cac18a', '#227735', '#227735', '#e8a33d', '#e8a33d', '#227735', null, '#227735', '#e8a33d', '#227735', '#227735'],
    ],
  },
  'Gilded Dusk': {
    v: 1,
    cols: 12,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Sand-forward dusk fade across the full width, amber secondary, green rare.
    colors: [
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, '#cac18a', null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, '#cac18a', '#cac18a', null, null],
      [null, null, null, '#cac18a', '#cac18a', null, null, '#e8a33d', null, '#227735', null, null],
      [null, null, null, null, null, '#cac18a', null, '#cac18a', null, '#227735', null, '#cac18a'],
      [null, null, '#e8a33d', null, '#cac18a', null, null, null, '#cac18a', '#e8a33d', '#e8a33d', '#e8a33d'],
      ['#cac18a', '#cac18a', '#227735', '#e8a33d', '#cac18a', null, null, '#e8a33d', '#e8a33d', null, null, '#cac18a'],
      ['#e8a33d', '#cac18a', '#e8a33d', '#cac18a', '#e8a33d', '#cac18a', '#e8a33d', null, '#cac18a', '#cac18a', '#cac18a', '#cac18a'],
    ],
  },
};
