// Shared scene layout constants and grid geometry math (all units = inches).
// 1 world unit = 1 inch.

export const GAP = 0.5;           // mortar gap between blocks
export const BLOCK_DEPTH = 3;     // block thickness
export const SILL_HEIGHT = 36;    // height of the bottom of the glass blocks above the floor
export const WALL_MARGIN = 5;     // wall/frame margin around the block grid
export const WALL_THICKNESS = 7;  // south wall depth; blocks are recessed/centered within it

export const TUB = { width: 60, depth: 30, height: 22 };
export const FLOOR_DEPTH = 72;    // room depth (6'-0")

// blockSize is the *nominal* cell pitch (e.g. 6"), so N blocks span exactly
// N * blockSize (10 x 6" = 5'-0"). The mortar gap is carved out of the cell,
// not added on top, so the overall opening matches the plan dimensions.
export function gridSize(cols, rows, blockSize) {
  const pitch = blockSize;
  const width = cols * pitch;
  const height = rows * pitch;
  return { pitch, width, height };
}

// Center (x, y) of the block at column `col`, row `row` (0-indexed, bottom-left origin).
export function blockCenter(col, row, cols, rows, blockSize) {
  const { width } = gridSize(cols, rows, blockSize);
  const x = -width / 2 + blockSize / 2 + col * blockSize;
  const y = SILL_HEIGHT + blockSize / 2 + row * blockSize;
  return { x, y };
}

// Vertical center of the whole grid, used for camera framing.
export function gridCenterY(rows, blockSize) {
  return SILL_HEIGHT + (rows * blockSize) / 2;
}
