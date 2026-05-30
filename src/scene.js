import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { TUB, SILL_HEIGHT, WALL_THICKNESS } from './layout.js';

const CEILING_BASE = 96;           // ~8' ceiling; raised dynamically if needed to hide the backdrop
const SIDE_BORDER = 6;             // marble wall to each side of the window (≈ plan's 6' alcove around a 5' window)
const SIDE_DEPTH = 60;             // how far the partial side walls return into the room
const BACKDROP_ASPECT = 165 / 220; // backyard.jpg width/height
const MARBLE_IN_PER_TILE = 50;     // herringbone.png maps to ~50" of surface (few repeats -> few seams)

// Builds the bathroom context (south wall with a recessed opening, partial side
// walls, tub, floor) plus lighting and the exterior backdrop. The wall is
// rebuilt to match the grid via setOpening(). Context geometry lives in
// `contextGroup` so it can be toggled on/off.
export function buildScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x3b3630); // soft warm grey (shows above the wall / at edges)

  const contextGroup = new THREE.Group();
  scene.add(contextGroup);

  // --- Lighting ---
  // Low flat fill, so the window light below creates real gradients/contrast.
  RectAreaLightUniformsLib.init();
  scene.add(new THREE.AmbientLight(0xffffff, 0.32));
  scene.add(new THREE.HemisphereLight(0xe8eeff, 0x2a1f18, 0.3));
  const fill = new THREE.DirectionalLight(0xfff4e6, 0.18);
  fill.position.set(40, 120, 140);
  scene.add(fill);
  // Daylight through the window: a soft area light filling the opening and
  // facing straight into the room (so the whole window casts, not just the
  // bottom). Sized/positioned to the opening in setOpening().
  const windowLight = new THREE.RectAreaLight(0xfff4e2, 3, 60, 48);
  scene.add(windowLight);

  // --- Textured material (real herringbone marble photo from assets/) ---
  // Loaded once; clones (one per surface, for independent tiling) pick up the
  // image when it arrives via the re-run of setOpening in onTexLoad().
  // Large tile scale (few repeats) + anisotropic filtering keeps repeat seams
  // rare and soft. (Mirrored wrapping was avoided: it turns the directional
  // herringbone into obvious reflected diamonds.)
  const loader = new THREE.TextureLoader();
  const marbleTex = loader.load('assets/herringbone.png', onTexLoad);
  marbleTex.wrapS = marbleTex.wrapT = THREE.RepeatWrapping;
  marbleTex.colorSpace = THREE.SRGBColorSpace;
  marbleTex.anisotropy = 8;

  function tileMaterial(w, h, doubleSide = false) {
    const t = marbleTex.clone();
    t.repeat.set(Math.max(1, w / MARBLE_IN_PER_TILE), Math.max(1, h / MARBLE_IN_PER_TILE));
    t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({
      map: t, roughness: 0.5, metalness: 0,
      side: doubleSide ? THREE.DoubleSide : THREE.FrontSide,
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
  function applyBackdropBrightness() {
    const g = Math.min(1, 0.12 + daylightLevel * 0.78); // dusk (dim) -> full daylight
    if (backdropMat.map) backdropMat.color.setScalar(g);
  }
  function setDaylight(level) {
    daylightLevel = level;
    windowLight.intensity = 3 * level;
    applyBackdropBrightness();
  }

  // --- Exterior view backdrop (the outside scene seen through the window) ---
  const backdropMat = new THREE.MeshBasicMaterial({ color: 0x9fb39a }); // fallback until loaded
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(60, 80), backdropMat);
  backdrop.position.set(0, 55, -30);
  contextGroup.add(backdrop); // part of context, so it hides with "Show bathroom context"
  new THREE.TextureLoader().load('assets/backyard.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    backdropMat.map = tex;
    backdropMat.needsUpdate = true;
    applyBackdropBrightness(); // respect the current daylight level
  });

  // --- Floor (marble) — resized to the room footprint in setOpening() ---
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(72, SIDE_DEPTH), tileMaterial(72, SIDE_DEPTH));
  floor.rotation.x = -Math.PI / 2;
  contextGroup.add(floor);

  // --- Tub (sits in front of the wall) ---
  const tubZ = WALL_THICKNESS / 2 + TUB.depth / 2;
  const tub = new THREE.Mesh(
    new THREE.BoxGeometry(TUB.width, TUB.height, TUB.depth),
    new THREE.MeshStandardMaterial({ color: 0xf3efe8, roughness: 0.35, metalness: 0 })
  );
  tub.position.set(0, TUB.height / 2, tubZ);
  contextGroup.add(tub);
  const basin = new THREE.Mesh(
    new THREE.BoxGeometry(TUB.width - 6, 3, TUB.depth - 6),
    new THREE.MeshStandardMaterial({ color: 0xe6ddcf, roughness: 0.5 })
  );
  basin.position.set(0, TUB.height - 1.5, tubZ);
  contextGroup.add(basin);

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

    // Backdrop sits just behind the wall and is oversized (×1.2) so perspective
    // never reveals its edges through the opening — clamped to the wall width so
    // it can't peek past the wall. Portrait photo overflows vertically; raise the
    // ceiling enough to keep that overflow hidden behind the wall.
    const coverH = Math.max(openH, openW / BACKDROP_ASPECT);
    const pw = Math.min(coverH * BACKDROP_ASPECT * 1.2, wallW);
    const ph = pw / BACKDROP_ASPECT;
    const ceiling = Math.max(CEILING_BASE, cy + ph / 2 + 4);

    // south wall, tiled in marble, built as 4 pieces leaving the recessed opening
    box(sideW, ceiling, D, -(openW / 2 + sideW / 2), ceiling / 2, 0, tileMaterial(sideW, ceiling));
    box(sideW, ceiling, D, (openW / 2 + sideW / 2), ceiling / 2, 0, tileMaterial(sideW, ceiling));
    box(openW, ceiling - top, D, 0, (ceiling + top) / 2, 0, tileMaterial(openW, ceiling - top));
    if (bottom > 0) box(openW, bottom, D, 0, bottom / 2, 0, tileMaterial(openW, bottom));

    // partial side (return) walls, also tiled in marble, showing the room depth
    const sideGeo = new THREE.PlaneGeometry(SIDE_DEPTH, ceiling);
    const leftWall = new THREE.Mesh(sideGeo, tileMaterial(SIDE_DEPTH, ceiling, true));
    leftWall.position.set(-wallW / 2, ceiling / 2, SIDE_DEPTH / 2);
    leftWall.rotation.y = Math.PI / 2;
    wallGroup.add(leftWall);
    const rightWall = new THREE.Mesh(sideGeo, tileMaterial(SIDE_DEPTH, ceiling, true));
    rightWall.position.set(wallW / 2, ceiling / 2, SIDE_DEPTH / 2);
    rightWall.rotation.y = -Math.PI / 2;
    wallGroup.add(rightWall);

    backdrop.geometry.dispose();
    backdrop.geometry = new THREE.PlaneGeometry(pw, ph);
    backdrop.position.set(0, cy, -12); // just behind the wall, to minimize the perspective gap

    // window daylight: area light filling the opening, facing straight into the
    // room at window height so the whole window casts (not just the bottom)
    windowLight.width = openW;
    windowLight.height = openH;
    windowLight.position.set(0, cy, WALL_THICKNESS / 2 + 1);
    windowLight.lookAt(0, cy, SIDE_DEPTH);

    // fit the floor to the room footprint (wall width x side-wall depth)
    floor.geometry.dispose();
    floor.geometry = new THREE.PlaneGeometry(wallW, SIDE_DEPTH);
    floor.position.set(0, 0, SIDE_DEPTH / 2);
    floor.material.map.repeat.set(
      Math.max(1, wallW / MARBLE_IN_PER_TILE),
      Math.max(1, SIDE_DEPTH / MARBLE_IN_PER_TILE)
    );
    floor.material.map.needsUpdate = true;
  }

  return { scene, contextGroup, setOpening, setDaylight };
}

export { SILL_HEIGHT };
