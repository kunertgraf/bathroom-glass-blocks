// Preset glass tints — the real range from the reference photos
// (assets/PXL_*.jpg): a golden/amber yellow, a pale yellow-green, and a vivid
// emerald green. Clear glass is provided separately via fullPalette().
export const PRESETS = [
  { name: 'Green', hex: '#227735' },
  { name: 'Sand', hex: '#cac18a' },
  { name: 'Amber', hex: '#e8a33d' },
];

const CUSTOM_KEY = 'gbv.customColors';

export function loadCustomColors() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCustomColor(hex) {
  const list = loadCustomColors();
  if (!list.some((c) => c.hex.toLowerCase() === hex.toLowerCase())) {
    list.push({ name: hex, hex });
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
  }
  return list;
}

// Remove all saved custom colors, restoring the palette to the presets.
export function clearCustomColors() {
  localStorage.removeItem(CUSTOM_KEY);
}

// The full palette = presets + saved custom colors. `null` hex = clear glass.
export function fullPalette() {
  return [{ name: 'Clear glass', hex: null }, ...PRESETS, ...loadCustomColors()];
}
