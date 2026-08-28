import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { TUB, SILL_HEIGHT, WALL_THICKNESS } from './layout.js';
import { createTub } from './tub.js';
import { TILES, DEFAULT_TILE, getTile, makeProceduralTexture } from './tiles.js';

const CEILING_BASE = 92;           // 7'-8" — the low (window-wall) ceiling height per the plan's elevations
const SIDE_BORDER = 0;             // none — the block grid runs edge to edge across the room
const SIDE_DEPTH = 100;            // how far the partial side walls return into the room
const BACKDROP_ASPECT = 165 / 220; // backyard.jpg width/height
// The window daylight is split into a grid of small area lights tiling the
// opening, so each patch can take on the color of the glass blocks in front of
// it (green cluster -> green light on that side, etc.). 3 across x 2 high reads
// the horizontal/vertical color spread without being costly.
const ZONES_X = 3;
const ZONES_Y = 2;
const ZONE_BASE = 4.0;                       // per-zone area-light intensity at daylight=1, clear glass
const CLEAR_RGB = [1, 0.957, 0.886];         // warm daylight cast through clear glass (~#fff4e2)

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
// How much light the glass passes (its perceived luminance) — saturated greens
// pass less than pale sand/amber, so colored light also reads dimmer.
function luma(r, g, b) { return 0.2126 * r + 0.7152 * g + 0.0722 * b; }

// Builds the bathroom context (south wall with a recessed opening, partial side
// walls, tub, floor) plus lighting and the exterior backdrop. The wall is
// rebuilt to match the grid via setOpening(). Context geometry lives in
// `contextGroup` so it can be toggled on/off.
export function buildScene(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x3b3630); // soft warm grey (shows above the wall / at edges)

  const contextGroup = new THREE.Group();
  scene.add(contextGroup);

  // A soft indoor environment, used *only* by the tub's acrylic. White acrylic
  // reads as flat grey without something to reflect; scoping it to that one
  // material keeps the glass block look untouched.
  let acrylicEnv = null;
  if (renderer) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    acrylicEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }

  // --- Lighting ---
  // Low flat fill, so the window light below creates real gradients/contrast.
  RectAreaLightUniformsLib.init();
  scene.add(new THREE.AmbientLight(0xffffff, 0.24));
  scene.add(new THREE.HemisphereLight(0xe8eeff, 0x2a1f18, 0.24));
  const fill = new THREE.DirectionalLight(0xfff4e6, 0.18);
  fill.position.set(40, 120, 140);
  scene.add(fill);

  // Interior lights: simulate the room's own warm-white lighting. Off in
  // daylight, they fade in as the Backlight (daylight) nears zero, so a dim/
  // night setting reads as "lights on inside" instead of going black. A
  // downward warm directional gives ceiling-light shading + a soft warm ambient
  // lifts the shadows. Driven by setDaylight().
  const interiorAmbient = new THREE.AmbientLight(0xffe2bd, 0);
  scene.add(interiorAmbient);
  const interiorDown = new THREE.DirectionalLight(0xffdcb0, 0);
  interiorDown.position.set(10, 160, 40);
  interiorDown.target.position.set(0, 0, 30);
  scene.add(interiorDown);
  scene.add(interiorDown.target);
  // Daylight through the window: a grid of small area lights filling the
  // opening, each facing straight into the room. Each zone's color/intensity is
  // driven by the glass blocks in front of it (see applyZoneLighting). Sized/
  // positioned to the opening in setOpening().
  const windowZones = [];
  for (let j = 0; j < ZONES_Y; j++) {
    for (let i = 0; i < ZONES_X; i++) {
      const light = new THREE.RectAreaLight(0xfff4e2, ZONE_BASE, 10, 10);
      scene.add(light);
      windowZones.push({ light, i, j });
    }
  }

  // --- Tiled surfaces (walls + floor) ---
  // The active tile's base texture is created once and cached, then cloned per
  // surface for independent tiling. Image tiles (the real marble photo) load
  // async and re-run setOpening via onTexLoad so the clones pick up the image;
  // the others are generated procedurally (see tiles.js). Large tile scale +
  // anisotropy keep repeat seams soft.
  const loader = new THREE.TextureLoader();
  const tileTexCache = {};            // tile id -> base THREE.Texture
  let activeWallTile = getTile(DEFAULT_TILE);
  let activeFloorTile = getTile(DEFAULT_TILE);
  let activeTubTile = getTile(DEFAULT_TILE);

  function baseTexture(tile) {
    if (tileTexCache[tile.id]) return tileTexCache[tile.id];
    const tex = tile.kind === 'image'
      ? loader.load(tile.src, onTexLoad)
      : makeProceduralTexture(tile);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    tileTexCache[tile.id] = tex;
    return tex;
  }

  function tileMaterial(w, h, doubleSide = false, tile = activeWallTile, scale = 1) {
    const t = baseTexture(tile).clone();
    const per = tile.inPerTile * scale; // larger scale -> fewer repeats -> bigger tiles
    t.repeat.set(Math.max(1, w / per), Math.max(1, h / per));
    t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({
      map: t,
      color: new THREE.Color(tile.tint || '#ffffff'),
      roughness: tile.roughness ?? 0.5,
      metalness: 0,
      side: doubleSide ? THREE.DoubleSide : THREE.FrontSide,
    });
  }

  // Switch the wall or floor tile and rebuild the affected surfaces.
  function setWallTile(id) {
    activeWallTile = getTile(id);
    if (lastArgs) setOpening(...lastArgs);
  }
  function setFloorTile(id) {
    activeFloorTile = getTile(id);
    if (lastArgs) setOpening(...lastArgs);
  }
  function setTubTile(id) {
    activeTubTile = getTile(id);
    if (lastArgs) setOpening(...lastArgs);
  }

  // Flat slabs (tub platform + step) are ShapeGeometry, whose UVs come out in
  // inches rather than 0..1 — so the repeat is set from the tile's real size
  // and the tile lands at true scale however the slab is shaped.
  function slabMaterial(tile) {
    const t = baseTexture(tile).clone();
    t.repeat.set(1 / tile.inPerTile, 1 / tile.inPerTile);
    t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({
      map: t,
      color: new THREE.Color(tile.tint || '#ffffff'),
      roughness: tile.roughness ?? 0.5,
      metalness: 0,
    });
  }

  // Re-run the last wall build once a texture image finishes loading, so the
  // material clones get the loaded image uploaded.
  let lastArgs = null;
  function onTexLoad() { if (lastArgs) setOpening(...lastArgs); }

  // The Backlight slider (level ~0..2) is the daylight level: it scales the
  // window light AND the brightness of the exterior backdrop, so the glass —
  // which is lit by transmitting that backdrop — visibly brightens/dims with it.
  let daylightLevel = 0.9;
  let glassColors = null; // latest colors[row][col] (row 0 = bottom), or null = all clear
  function applyBackdropBrightness() {
    const g = Math.min(1, 0.12 + daylightLevel * 0.78); // dusk (dim) -> full daylight
    if (backdropMat.map) backdropMat.color.setScalar(g);
  }

  // Tint each window zone by the average color of the glass blocks in front of
  // it: hue from the mean block color (clear = warm daylight), brightness scaled
  // by how much light that glass passes. This is what colors the room light.
  function applyZoneLighting() {
    const colors = glassColors;
    const rows = colors ? colors.length : 0;
    for (const z of windowZones) {
      let rs = 0, gs = 0, bs = 0, ts = 0, n = 0;
      for (let r = 0; r < rows; r++) {
        const cols = colors[r].length;
        const zj = Math.min(ZONES_Y - 1, Math.floor((r / rows) * ZONES_Y));
        if (zj !== z.j) continue;
        for (let c = 0; c < cols; c++) {
          const zi = Math.min(ZONES_X - 1, Math.floor((c / cols) * ZONES_X));
          if (zi !== z.i) continue;
          const hex = colors[r][c];
          const [rr, gg, bb] = hex ? hexToRgb(hex) : CLEAR_RGB;
          rs += rr; gs += gg; bs += bb; ts += luma(rr, gg, bb);
          n++;
        }
      }
      if (!n) { rs = CLEAR_RGB[0]; gs = CLEAR_RGB[1]; bs = CLEAR_RGB[2]; ts = luma(...CLEAR_RGB); n = 1; }
      const r = rs / n, g = gs / n, b = bs / n, t = ts / n;
      const mx = Math.max(r, g, b, 1e-4); // normalize hue to full; dimming carried by intensity
      z.light.color.setRGB(r / mx, g / mx, b / mx);
      // Lift the transmittance off zero so saturated tints (esp. green, which
      // passes least light) still cast a visible colored glow, not near-black.
      z.light.intensity = ZONE_BASE * daylightLevel * (0.4 + 0.6 * t);
    }
  }

  function setWindowColors(colors) {
    glassColors = colors;
    applyZoneLighting();
  }
  // Interior lighting ramps in only as daylight nears zero (off at/above the
  // threshold, full at level 0).
  const INTERIOR_THRESHOLD = 0.35;
  function applyInteriorLight() {
    const f = Math.max(0, (INTERIOR_THRESHOLD - daylightLevel) / INTERIOR_THRESHOLD);
    interiorAmbient.intensity = 0.55 * f;
    interiorDown.intensity = 0.8 * f;
  }
  function setDaylight(level) {
    daylightLevel = level;
    applyZoneLighting();
    applyBackdropBrightness();
    applyInteriorLight();
  }

  // --- Exterior view backdrop (the outside scene seen through the window) ---
  const backdropMat = new THREE.MeshBasicMaterial({ color: 0x9fb39a }); // fallback until loaded
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(60, 80), backdropMat);
  backdrop.position.set(0, 55, -30);
  contextGroup.add(backdrop); // part of context, so it hides with "Show bathroom context"
  // Cover-fit the photo to the backdrop plane via texture repeat/offset: keeps
  // the image undistorted by center-cropping the overflow (the portrait photo
  // is taller than the landscape opening).
  let backdropSize = [60, 80];
  function applyBackdropCrop() {
    const tex = backdropMat.map;
    if (!tex) return;
    const planeA = backdropSize[0] / backdropSize[1];
    let rx = 1, ry = 1;
    if (planeA >= BACKDROP_ASPECT) ry = BACKDROP_ASPECT / planeA; // crop top/bottom
    else rx = planeA / BACKDROP_ASPECT;                          // crop sides
    tex.repeat.set(rx, ry);
    tex.offset.set((1 - rx) / 2, (1 - ry) / 2);
    tex.needsUpdate = true;
  }
  new THREE.TextureLoader().load('assets/backyard.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    backdropMat.map = tex;
    backdropMat.needsUpdate = true;
    applyBackdropCrop();
    applyBackdropBrightness(); // respect the current daylight level
  });

  // --- Floor (marble) — resized to the room footprint in setOpening() ---
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(72, SIDE_DEPTH), tileMaterial(72, SIDE_DEPTH));
  floor.rotation.x = -Math.PI / 2;
  contextGroup.add(floor);

  // --- Tub: rebuilt by setOpening() so it always spans the alcove ---
  const tubGroup = new THREE.Group();
  contextGroup.add(tubGroup);
  let tubBuilt = null;

  function buildTub(alcoveWidth) {
    if (tubBuilt) { tubGroup.remove(tubBuilt.group); tubBuilt.dispose(); }
    tubBuilt = createTub({
      width: alcoveWidth,
      depth: TUB.depth,
      height: TUB.height,
      chamfer: TUB.chamfer,
      stepHeight: TUB.stepHeight,
      wallZ: WALL_THICKNESS / 2,
      envMap: acrylicEnv,
      deckMaterial: () => slabMaterial(activeTubTile),
      panelMaterial: (w, h) => tileMaterial(w, h, false, activeTubTile),
    });
    tubGroup.add(tubBuilt.group);
  }

  // --- Rebuildable walls ---
  const wallGroup = new THREE.Group();
  contextGroup.add(wallGroup);

  function clearWall() {
    for (let i = wallGroup.children.length - 1; i >= 0; i--) {
      const c = wallGroup.children[i];
      wallGroup.remove(c);
      c.geometry.dispose();
      if (c.material.map) c.material.map.dispose();
      c.material.dispose();
    }
  }

  function box(w, h, d, x, y, z, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    wallGroup.add(m);
    return m;
  }

  // openW/openH: opening size; cy: vertical center of the opening
  function setOpening(openW, openH, cy) {
    lastArgs = [openW, openH, cy];
    clearWall();
    const wallW = openW + 2 * SIDE_BORDER; // wall tracks the window (≈ alcove width)
    const D = WALL_THICKNESS;
    const top = cy + openH / 2;
    const bottom = cy - openH / 2;
    const sideW = SIDE_BORDER;

    // Real ceiling height (no longer inflated to hide the backdrop — the
    // backdrop is sized/cropped to stay within it instead).
    const ceiling = CEILING_BASE;

    // Backdrop fills the wall width and spans from just above the floor up to the
    // ceiling, so its top is hidden behind the lintel above the window and never
    // peeks above the wall. The photo is center-cropped (applyBackdropCrop) so
    // this landscape plane doesn't distort the portrait image.
    // Slightly wider than the opening: with the grid running edge to edge you can
    // see past the backdrop's sides at an angle. Kept modest (and the plane sits
    // close behind the wall) so it doesn't stick out when orbiting outside the room.
    const pw = wallW + 24;
    const bdBottom = 12;          // hidden behind the wall below the window
    const ph = ceiling - bdBottom;
    const bdCy = (ceiling + bdBottom) / 2;

    // south wall, tiled in marble, built from the pieces around the recessed
    // opening. The flanking pieces vanish when the grid runs edge to edge.
    if (sideW > 0) {
      box(sideW, ceiling, D, -(openW / 2 + sideW / 2), ceiling / 2, 0, tileMaterial(sideW, ceiling));
      box(sideW, ceiling, D, (openW / 2 + sideW / 2), ceiling / 2, 0, tileMaterial(sideW, ceiling));
    }
    box(openW, ceiling - top, D, 0, (ceiling + top) / 2, 0, tileMaterial(openW, ceiling - top));
    if (bottom > 0) box(openW, bottom, D, 0, bottom / 2, 0, tileMaterial(openW, bottom));

    // partial side (return) walls, also tiled in marble, showing the room depth
    const sideLen = SIDE_DEPTH + WALL_THICKNESS / 2;      // back to the wall's rear face
    const sideCz = SIDE_DEPTH / 2 - WALL_THICKNESS / 4;   // centre of that span
    const sideGeo = new THREE.PlaneGeometry(sideLen, ceiling);
    const leftWall = new THREE.Mesh(sideGeo, tileMaterial(sideLen, ceiling, true));
    leftWall.position.set(-wallW / 2, ceiling / 2, sideCz);
    leftWall.rotation.y = Math.PI / 2;
    wallGroup.add(leftWall);
    const rightWall = new THREE.Mesh(sideGeo, tileMaterial(sideLen, ceiling, true));
    rightWall.position.set(wallW / 2, ceiling / 2, sideCz);
    rightWall.rotation.y = -Math.PI / 2;
    wallGroup.add(rightWall);

    backdrop.geometry.dispose();
    backdrop.geometry = new THREE.PlaneGeometry(pw, ph);
    backdrop.position.set(0, bdCy, -7); // close behind the wall: less parallax, so less overhang is needed
    backdropSize = [pw, ph];
    applyBackdropCrop();

    // window daylight: tile the opening with the zone lights, each facing
    // straight into the room so the whole window casts (not just the bottom)
    const zw = openW / ZONES_X, zh = openH / ZONES_Y;
    for (const z of windowZones) {
      const zx = -openW / 2 + (z.i + 0.5) * zw;
      const zy = (cy - openH / 2) + (z.j + 0.5) * zh;
      z.light.width = zw;
      z.light.height = zh;
      z.light.position.set(zx, zy, WALL_THICKNESS / 2 + 1);
      z.light.lookAt(zx, zy, SIDE_DEPTH);
    }

    // fit the floor to the room footprint (wall width x side-wall depth) and
    // rebuild its material so a tile change applies to the floor too
    floor.geometry.dispose();
    floor.geometry = new THREE.PlaneGeometry(wallW, SIDE_DEPTH);
    floor.position.set(0, 0, SIDE_DEPTH / 2);
    if (floor.material.map) floor.material.map.dispose();
    floor.material.dispose();
    floor.material = tileMaterial(wallW, SIDE_DEPTH, false, activeFloorTile, activeFloorTile.floorScale ?? 1);

    buildTub(wallW); // the tub spans the alcove, so it tracks the wall width
  }

  return { scene, contextGroup, setOpening, setDaylight, setWindowColors, setWallTile, setFloorTile, setTubTile, tiles: TILES };
}

export { SILL_HEIGHT };
