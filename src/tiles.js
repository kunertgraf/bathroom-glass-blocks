// Tile options for the room surfaces (walls + floor). The white marble is the
// real herringbone photo (assets/herringbone.png); the others are generated
// procedurally as canvas textures (no extra image assets needed) so the palette
// can offer warm/earthy options that complement the colored glass + warm light.
import * as THREE from 'three';

// id, name: shown in the selector.
// kind: 'image' (loads src) | 'zellige' | 'terrazzo'.
// tint: multiplied over the map (image tiles). inPerTile: inches one texture
// repeat spans. roughness: lower = glossier (reflects the colored light more).
export const TILES = [
  { id: 'marble-white', name: 'Arctic White Marble', kind: 'image', src: 'assets/herringbone.png', tint: '#ffffff', inPerTile: 50, roughness: 0.5 },
  { id: 'marble-cream', name: 'Cream Marble',         kind: 'image', src: 'assets/herringbone.png', tint: '#f0e4cf', inPerTile: 50, roughness: 0.5 },
  { id: 'zellige-cream', name: 'Cream Zellige',       kind: 'zellige', base: '#ecdfc4', grout: '#ddd2b8', grid: 6, inPerTile: 24, roughness: 0.26 },
  { id: 'zellige-sand', name: 'Sand Zellige',         kind: 'zellige', base: '#d8c39a', grout: '#cabfa6', grid: 6, inPerTile: 24, roughness: 0.28 },
  { id: 'terrazzo',     name: 'Warm Terrazzo',        kind: 'terrazzo', base: '#ece3d0', chips: ['#e8a33d', '#227735', '#b8a67e', '#8a6f4a', '#ffffff'], inPerTile: 34, roughness: 0.4 },
  { id: 'zellige-sage', name: 'Sage Zellige',         kind: 'zellige', base: '#aab394', grout: '#b3b39c', grid: 6, inPerTile: 24, roughness: 0.28 },
];

export const DEFAULT_TILE = 'marble-white';

export function getTile(id) {
  return TILES.find((t) => t.id === id) || TILES[0];
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const clamp255 = (v) => Math.max(0, Math.min(255, Math.round(v)));

// Glazed zellige: a grid of slightly-irregular square tiles with grout lines and
// per-tile lightness variation + a soft diagonal gloss gradient.
function makeZelligeCanvas(tile) {
  const S = 512;
  const n = tile.grid || 6;
  const cell = S / n;
  const grout = Math.max(2, cell * 0.07);
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = tile.grout || '#c8bda6';
  ctx.fillRect(0, 0, S, S);
  const [br, bg, bb] = hexToRgb(tile.base);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const v = 0.84 + Math.random() * 0.3;           // glaze lightness variation
      const hueShift = (Math.random() - 0.5) * 14;     // tiny warm/cool drift
      const r1 = clamp255(br * v + hueShift), g1 = clamp255(bg * v), b1 = clamp255(bb * v - hueShift);
      const r2 = clamp255(r1 * 0.86), g2 = clamp255(g1 * 0.86), b2 = clamp255(b1 * 0.86);
      const gx = x * cell + grout / 2, gy = y * cell + grout / 2, w = cell - grout;
      const grad = ctx.createLinearGradient(gx, gy, gx + w, gy + w);
      grad.addColorStop(0, `rgb(${r1},${g1},${b1})`);
      grad.addColorStop(1, `rgb(${r2},${g2},${b2})`);
      ctx.fillStyle = grad;
      ctx.fillRect(gx, gy, w, w);
    }
  }
  return cv;
}

// Terrazzo: solid base scattered with many small irregular aggregate chips.
function makeTerrazzoCanvas(tile) {
  const S = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = tile.base;
  ctx.fillRect(0, 0, S, S);
  const chips = tile.chips || ['#999999'];
  const COUNT = 520;
  for (let i = 0; i < COUNT; i++) {
    const cx = Math.random() * S, cy = Math.random() * S;
    const rad = 2.5 + Math.random() * 7;
    const sides = 5 + Math.floor(Math.random() * 3);
    const rot = Math.random() * Math.PI;
    ctx.fillStyle = chips[Math.floor(Math.random() * chips.length)];
    ctx.globalAlpha = 0.55 + Math.random() * 0.45;
    ctx.beginPath();
    for (let s = 0; s < sides; s++) {
      const a = rot + (s / sides) * Math.PI * 2;
      const rr = rad * (0.7 + Math.random() * 0.6);
      const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
      if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return cv;
}

// Returns a THREE.Texture for a procedural tile (image tiles are handled in
// scene.js via TextureLoader). Wrapping/anisotropy/colorspace set by caller.
export function makeProceduralTexture(tile) {
  const cv = tile.kind === 'terrazzo' ? makeTerrazzoCanvas(tile) : makeZelligeCanvas(tile);
  return new THREE.CanvasTexture(cv);
}
