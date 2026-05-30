# Glass Block Bathroom Visualizer

Interactive 3D editor to design and tint the colored glass block window above the
tub in the master bathroom addition (see `assets/`). Helps decide which block
arrangement and color layout looks best, in the context of the tub/wall.

## Tech stack
- Static site, **no build step**. Vanilla JS (ES modules), HTML, CSS.
- **Three.js 0.160** loaded from a CDN via an ESM import map in `index.html`.
- State persists in `localStorage` and the URL hash; PNG export via canvas.

## Run
```
python3 -m http.server 8000   # then open http://localhost:8000
```
Requires internet access (Three.js loads from jsDelivr).

## Layout (all units = inches)
- `src/main.js` — renderer, camera, OrbitControls, pointer painting, wiring. Exposes `window.gbv` for debugging.
- `src/scene.js` — bathroom context: recessed south wall opening, partial side (return) walls, tub, floor, lighting, exterior backdrop. The window daylight is a grid of `RectAreaLight`s (`ZONES_X`×`ZONES_Y`) tiling the opening; `setWindowColors()` tints each zone by the average color of the glass blocks in front of it (dimmer for saturated tints), so the room light takes on the glass colors. `main.js` pushes block colors in each frame when the layout changes. Warm-white interior lights (`interiorAmbient`/`interiorDown`) fade in as the Backlight nears zero (below `INTERIOR_THRESHOLD`), simulating the room's own lights at dusk/night.
- `src/blocks.js` — the glass block grid (one mesh/material per block) + mortar lattice; tinting, rebuild, save/restore colors.
- `src/glassMaterial.js` — refractive glass material (`transmission`/`ior`/`thickness`) whose procedural wavy-ripple normal map warps the transmitted background; `normalScale`/`thickness` tune the distortion strength.
- `src/layout.js` — shared geometry constants and grid math.
- `src/palette.js` — preset glass colors (from the reference photos) + custom colors.
- `src/tiles.js` — room surface tile options for the Tile selectors (walls + floor chosen independently): the real marble photo (white + a cream tint) plus procedurally generated (canvas) zellige and terrazzo textures. `scene.js` caches the base texture per tile and clones it per surface; `setWallTile()`/`setFloorTile()` rebuild the affected surfaces.
- `src/editor.js` — control panel UI.
- `src/state.js` — serialize/share/save/export.
- `src/presets.js` — built-in arrangements shipped with the app (shown under "Built-in" in the Arrangements dropdown, available to all visitors; user saves still live in localStorage).

## Notes
- Real glass colors (golden yellow, pale chartreuse, emerald) and the wavy block
  texture come from `assets/PXL_*.jpg`. All blocks are 6"×6".
- Opening is a fixed 5'×4' (10×8 blocks), per the plan (set in `main.js`; no UI
  size controls). Blocks are recessed (centered) within a 7" wall
  (`WALL_THICKNESS`). Each block has its own mortar frame: gray for clear,
  orange for colored (`MORTAR_*` in `blocks.js`).
- Ceiling height is 7'-8" (`CEILING_BASE = 92`), the low/window-wall height from
  the plan's elevations (the addition's ceiling slopes up to 11'-1" at the peak,
  not modeled). The backyard backdrop is sized within the ceiling and
  center-cropped (texture offset/repeat) so it fills the opening without
  distorting and tucks behind the lintel.
- Walls + floor share a selectable tile (see `tiles.js` / the Tile selector),
  default `assets/herringbone.png` (real marble photo). Each surface clones the
  active tile's base texture with its own `repeat`; large tile scale + anisotropy
  keep repeat seams soft. `scene.js` re-runs setOpening() on image-texture load
  so clones pick up the image, and on `setWallTile()`/`setFloorTile()` to swap surfaces. Exterior view through the glass = `assets/backyard.jpg`,
  part of `contextGroup` so it hides with "Show bathroom context".
