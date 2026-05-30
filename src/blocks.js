import * as THREE from 'three';
import { createGlassMaterial, applyTint, setBacklight } from './glassMaterial.js';
import { GAP, BLOCK_DEPTH, blockCenter } from './layout.js';

const MORTAR_CLEAR = 0x83877e;  // gray grout around clear blocks
const MORTAR_COLOR = 0xa67900;  // warm/orange grout around colored blocks

// The glass block grid. One glass mesh + one mortar frame per block, so each
// block can be tinted and gets its own grout color. Exposes a small API
// consumed by main.js / editor.js.
export function createBlockGrid() {
  const group = new THREE.Group();

  let meshes = [];          // glass block meshes; each .userData.frame is its mortar ring
  let colors = [];          // colors[row][col] = hex string | null (clear)
  let cols = 0, rows = 0, blockSize = 6;
  let backlight = 0.9;
  let geo = null;           // shared glass geometry for current size
  let frameGeo = null;      // shared mortar-ring geometry for current size

  const Z = 0; // block center z = wall center, so blocks sit recessed within the wall
  const mortarClearMat = new THREE.MeshStandardMaterial({ color: MORTAR_CLEAR, roughness: 0.9, metalness: 0 });
  const mortarColorMat = new THREE.MeshStandardMaterial({ color: MORTAR_COLOR, roughness: 0.9, metalness: 0 });

  // A square ring (mortar) for one cell: outer = blockSize, inner = the glass
  // block, so the ring fills the GAP/2 border around the block. Adjacent rings
  // butt together to form the full grout joint between blocks.
  function makeFrameGeo(size, gap) {
    const o = size / 2, i = (size - gap) / 2;
    const shape = new THREE.Shape();
    shape.moveTo(-o, -o); shape.lineTo(o, -o); shape.lineTo(o, o); shape.lineTo(-o, o); shape.lineTo(-o, -o);
    const hole = new THREE.Path();
    hole.moveTo(-i, -i); hole.lineTo(-i, i); hole.lineTo(i, i); hole.lineTo(i, -i); hole.lineTo(-i, -i);
    shape.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(shape, { depth: BLOCK_DEPTH, bevelEnabled: false });
    g.translate(0, 0, -BLOCK_DEPTH / 2);
    return g;
  }

  function disposeMeshes() {
    for (const m of meshes) {
      group.remove(m);
      m.material.dispose();
      if (m.userData.frame) group.remove(m.userData.frame); // shares frameGeo/mat
    }
    meshes = [];
    if (geo) { geo.dispose(); geo = null; }
    if (frameGeo) { frameGeo.dispose(); frameGeo = null; }
  }

  function rebuild(newCols, newRows, newSize, preserve = true) {
    const old = colors;
    cols = Math.max(1, newCols | 0);
    rows = Math.max(1, newRows | 0);
    blockSize = Math.max(1, newSize);

    disposeMeshes();
    colors = [];
    const vis = blockSize - GAP; // visual block is the cell minus the mortar gap
    geo = new THREE.BoxGeometry(vis, vis, BLOCK_DEPTH);
    frameGeo = makeFrameGeo(blockSize, GAP);

    for (let r = 0; r < rows; r++) {
      colors[r] = [];
      for (let c = 0; c < cols; c++) {
        const prev = preserve && old[r] && c < old[r].length ? old[r][c] : null;
        colors[r][c] = prev || null;
        const { x, y } = blockCenter(c, r, cols, rows, blockSize);

        const frame = new THREE.Mesh(frameGeo, colors[r][c] ? mortarColorMat : mortarClearMat);
        frame.position.set(x, y, Z);
        group.add(frame);

        const mat = createGlassMaterial();
        applyTint(mat, colors[r][c], backlight);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, Z);
        mesh.userData = { row: r, col: c, frame };
        group.add(mesh);
        meshes.push(mesh);
      }
    }
  }

  function paint(mesh, hex) {
    const { row, col } = mesh.userData;
    colors[row][col] = hex || null;
    applyTint(mesh.material, hex, backlight);
    mesh.userData.frame.material = hex ? mortarColorMat : mortarClearMat;
  }

  function setBacklightLevel(v) {
    backlight = v;
    for (const m of meshes) setBacklight(m.material, backlight);
  }

  function clearAll() {
    for (const m of meshes) paint(m, null);
  }

  function getColors() {
    return colors.map((row) => row.slice());
  }

  function setColors(grid) {
    if (!Array.isArray(grid) || !grid.length) return;
    const newRows = grid.length;
    const newCols = Math.max(...grid.map((r) => r.length));
    rebuild(newCols, newRows, blockSize, false);
    for (let r = 0; r < newRows; r++) {
      for (let c = 0; c < (grid[r] ? grid[r].length : 0); c++) {
        const mesh = meshes[r * newCols + c];
        if (mesh) paint(mesh, grid[r][c] || null);
      }
    }
  }

  return {
    group,
    rebuild,
    paint,
    clearAll,
    getColors,
    setColors,
    setBacklight: setBacklightLevel,
    get meshes() { return meshes; },
    get cols() { return cols; },
    get rows() { return rows; },
    get blockSize() { return blockSize; },
    get backlight() { return backlight; },
  };
}
