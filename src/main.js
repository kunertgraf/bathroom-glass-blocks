import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildScene } from './scene.js';
import { createBlockGrid } from './blocks.js';
import { initEditor } from './editor.js';
import { applyState, decodeHash } from './state.js';
import { gridSize, gridCenterY, BLOCK_DEPTH } from './layout.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const { scene, contextGroup, setOpening, setDaylight, setWindowColors, setTile, tiles } = buildScene();

const grid = createBlockGrid();
scene.add(grid.group);
grid.rebuild(10, 8, 6); // 5' wide x 4' tall, per the plan

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 4000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

const app = {
  scene, camera, renderer, controls, grid,
  activeColor: '#e8a33d',
  tiles,
  tile: 'marble-white',
  // Backlight slider drives both the glass glow and the window daylight.
  setBacklight(v) { grid.setBacklight(v); setDaylight(v); },
  setTile(id) { this.tile = id; setTile(id); },
  setContextVisible(v) { contextGroup.visible = v; },
  updateOpening() {
    const { width, height } = gridSize(grid.cols, grid.rows, grid.blockSize);
    const cy = gridCenterY(grid.rows, grid.blockSize);
    setOpening(width, height, cy); // opening exactly matches the block footprint
  },
  resetView() {
    const { width, height } = gridSize(grid.cols, grid.rows, grid.blockSize);
    const cy = gridCenterY(grid.rows, grid.blockSize);
    const vFov = (camera.fov * Math.PI) / 180;
    const aspect = camera.aspect || 1;
    const distH = (height / 2) / Math.tan(vFov / 2);
    const distW = (width / 2) / Math.tan(vFov / 2) / aspect;
    const dist = Math.max(distH, distW) * 1.35 + 18;
    camera.position.set(0, cy, dist);
    controls.target.set(0, cy, 0);
    controls.update();
  },
};

// --- Hover outline ---
let outline = null;
function rebuildOutline() {
  if (outline) { scene.remove(outline); outline.geometry.dispose(); outline.material.dispose(); }
  const s = grid.blockSize;
  const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(s + 0.6, s + 0.6, BLOCK_DEPTH + 0.6));
  outline = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffffff }));
  outline.visible = false;
  scene.add(outline);
}
rebuildOutline();

// --- Pointer painting / picking ---
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let painting = false;

function pick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(grid.meshes, false);
  return hits.length ? hits[0].object : null;
}

canvas.addEventListener('pointerdown', (e) => {
  const mesh = pick(e);
  if (mesh) {
    painting = true;
    controls.enabled = false;
    grid.paint(mesh, app.activeColor);
  }
});

canvas.addEventListener('pointermove', (e) => {
  const mesh = pick(e);
  if (mesh) {
    outline.visible = true;
    outline.position.copy(mesh.position);
    if (painting) grid.paint(mesh, app.activeColor);
  } else {
    outline.visible = false;
  }
});

function endPaint() {
  painting = false;
  controls.enabled = true;
}
canvas.addEventListener('pointerup', endPaint);
canvas.addEventListener('pointerleave', () => { outline.visible = false; endPaint(); });

// Rebuild the outline whenever the grid is rebuilt (block size may change).
const origRebuild = grid.rebuild;
grid.rebuild = function (...args) {
  origRebuild.apply(grid, args);
  rebuildOutline();
};

// --- Load shared state from URL hash, if any ---
if (location.hash.length > 1) {
  const s = decodeHash(location.hash);
  if (s) applyState(app, s);
}
app.updateOpening();
app.setBacklight(grid.backlight); // sync window daylight to the current backlight level
app.resetView();

initEditor(app);

// expose for quick console/debugging access
window.gbv = app;

// --- Resize + render loop ---
function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
window.addEventListener('resize', resize);

// Push the current block colors into the window lighting so the daylight takes
// on the glass tints. Only recompute when the layout actually changed.
let lastColorKey = '';
function syncWindowLight() {
  const colors = grid.getColors();
  const key = JSON.stringify(colors);
  if (key !== lastColorKey) {
    lastColorKey = key;
    setWindowColors(colors);
  }
}

function animate() {
  requestAnimationFrame(animate);
  resize();
  controls.update();
  syncWindowLight();
  renderer.render(scene, camera);
}
resize();
app.resetView();
animate();
