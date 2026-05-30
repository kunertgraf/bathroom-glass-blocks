// Tile options for the room surfaces (walls + floor). All are generated
// procedurally as canvas textures (no image assets needed), so each tiles
// seamlessly and the palette can offer warm/earthy options that complement the
// colored glass + warm light.
import * as THREE from 'three';

// id, name: shown in the selector.
// kind: 'herringbone' | 'zellige' | 'terrazzo' ('image' still supported via src).
// tint: multiplied over the map (image tiles). inPerTile: inches one texture
// repeat spans. roughness: lower = glossier (reflects the colored light more).
export const TILES = [
  { id: 'marble-white', name: 'White Marble Herringbone', kind: 'herringbone', base: '#ece7dd', grout: '#d7d0c4', tint: '#ffffff', inPerTile: 18, roughness: 0.32 },
  { id: 'marble-cream', name: 'Cream Marble Herringbone', kind: 'herringbone', base: '#ece7dd', grout: '#d8cdb8', tint: '#efe0c6', inPerTile: 18, roughness: 0.36 },
  { id: 'marble-mosaic', name: 'Marble Mosaic Herringbone', kind: 'herringbone', base: '#ece7dd', grout: '#cfc6b6', tint: '#ffffff', inPerTile: 4, roughness: 0.3, veinScale: 0.4 },
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

// Deterministic [0,1) hash so a brick and its copy one period away get identical
// shading/veining — that's what makes the herringbone tile seamlessly.
function hash01(a, b, c) {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

// Seamless marble herringbone. 2:1 bricks on the lattice t1=(2u,2u), t2=(-u,u),
// whose axis-aligned period is exactly 4u x 4u — so a 4u canvas is one tile.
// Each brick gets position-keyed (mod 4) value variation + faint veins.
function makeHerringboneCanvas(tile) {
  const u = 128;                 // pixels per brick short side
  const S = 4 * u;               // one full period
  const gap = 5;                 // thin grout joint
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = tile.grout || '#d7d0c4';
  ctx.fillRect(0, 0, S, S);
  const [br, bg, bb] = hexToRgb(tile.base);
  const veinScale = tile.veinScale ?? 1; // < 1 = fewer/fainter veins (small mosaic)

  function brick(x, y, w, h, orient) {
    const ix = Math.round(x / u) & 3, iy = Math.round(y / u) & 3; // mod 4 -> periodic
    const v = 0.93 + hash01(ix, iy, orient) * 0.12;
    ctx.fillStyle = `rgb(${clamp255(br * v)},${clamp255(bg * v)},${clamp255(bb * v)})`;
    const rx = x + gap / 2, ry = y + gap / 2, rw = w - gap, rh = h - gap;
    ctx.fillRect(rx, ry, rw, rh);
    // faint marble veins, clipped to the brick (seeded -> identical each period)
    ctx.save();
    ctx.beginPath();
    ctx.rect(rx, ry, rw, rh);
    ctx.clip();
    const veins = Math.round((1 + Math.floor(hash01(ix, iy, orient + 9) * 2)) * veinScale);
    for (let k = 0; k < veins; k++) {
      const h1 = hash01(ix, iy, orient + k * 5 + 1);
      const h2 = hash01(ix, iy, orient + k * 5 + 2);
      const h3 = hash01(ix, iy, orient + k * 5 + 3);
      ctx.strokeStyle = `rgba(120,116,110,${(0.10 + h3 * 0.10) * veinScale})`;
      ctx.lineWidth = 1 + h2 * 1.5;
      ctx.beginPath();
      ctx.moveTo(rx + h1 * rw, ry);
      ctx.bezierCurveTo(rx + h2 * rw, ry + rh * 0.35, rx + h3 * rw, ry + rh * 0.7, rx + ((h1 + h2) % 1) * rw, ry + rh);
      ctx.stroke();
    }
    ctx.restore();
  }

  for (let m = -4; m <= 7; m++) {
    for (let n = -9; n <= 9; n++) {
      const ox = 2 * u * m - u * n;
      const oy = 2 * u * m + u * n;
      brick(ox, oy, 2 * u, u, 0);       // horizontal
      brick(ox + 2 * u, oy, u, 2 * u, 1); // vertical at its right end
    }
  }
  return cv;
}

// Returns a THREE.Texture for a procedural tile (image tiles are handled in
// scene.js via TextureLoader). Wrapping/anisotropy/colorspace set by caller.
export function makeProceduralTexture(tile) {
  let cv;
  if (tile.kind === 'terrazzo') cv = makeTerrazzoCanvas(tile);
  else if (tile.kind === 'herringbone') cv = makeHerringboneCanvas(tile);
  else cv = makeZelligeCanvas(tile);
  return new THREE.CanvasTexture(cv);
}
