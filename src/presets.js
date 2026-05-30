// Built-in arrangements shipped with the app, so every visitor sees them in the
// Arrangements dropdown (unlike localStorage saves, which are per-browser).
// `colors` is colors[row][col], row 0 = bottom — same shape as serialize().

export const PRESET_ARRANGEMENTS = {
  'Golden Mosaic': {
    v: 1,
    cols: 10,
    rows: 8,
    blockSize: 6,
    backlight: 0.9,
    // Klimt-style gold ombré (dense up top, dissolving down) with emerald woven
    // through as a recurring accent. See research-driven design notes.
    colors: [
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, '#227735', null, null, null, null, null, null, null],
      [null, null, null, null, null, '#227735', '#e8a33d', null, null, null],
      [null, '#cac18a', null, null, '#e8a33d', null, null, '#227735', null, null],
      [null, '#227735', '#e8a33d', null, null, '#cac18a', null, null, null, null],
      [null, '#e8a33d', null, '#cac18a', '#e8a33d', null, '#e8a33d', null, '#227735', null],
      ['#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', null, '#e8a33d', '#227735', '#e8a33d', null, null],
      ['#e8a33d', '#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', '#e8a33d', '#cac18a', '#e8a33d', '#e8a33d', null],
    ],
  },
};
