import * as THREE from 'three';

// Procedurally builds a normal map of a flowing, watery wave pattern to match
// the rippled "wave" glass blocks in the reference photos (assets/PXL_*.jpg).
// The surface is a sum of warped sine waves; normals come from its gradient.
// Cached and shared across all blocks.
let _rippleMap = null;

function waveHeight(u, v) {
  // u, v in [0, 1]. Combine a few warped sine terms for an organic ripple.
  const a = Math.sin(u * 9.0 + Math.sin(v * 5.0) * 1.6);
  const b = Math.sin(v * 11.0 + Math.sin(u * 4.0) * 1.4);
  const c = Math.sin((u + v) * 6.5);
  return 0.5 * a + 0.4 * b + 0.25 * c;
}

export function rippleNormalMap() {
  if (_rippleMap) return _rippleMap;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const eps = 1 / size;
  const strength = 1.4; // height-field amplitude -> normal steepness
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1);
      const v = y / (size - 1);
      // finite-difference gradient of the height field
      const dhdu = (waveHeight(u + eps, v) - waveHeight(u - eps, v)) / (2 * eps);
      const dhdv = (waveHeight(u, v + eps) - waveHeight(u, v - eps)) / (2 * eps);
      let vx = -dhdu * strength * eps * 6;
      let vy = -dhdv * strength * eps * 6;
      let vz = 1;
      const len = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
      const i = (y * size + x) * 4;
      img.data[i] = ((vx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((vy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((vz / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  _rippleMap = tex;
  return tex;
}

const CLEAR_TINT = '#dbe7dd'; // faint green-tinged clear glass (as in the photos)

// Creates an independent material for one glass block so it can be tinted
// without affecting the others.
export function createGlassMaterial() {
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(CLEAR_TINT),
    metalness: 0,
    roughness: 0.18,
    // Real refraction: the wavy normal map warps the transmitted background,
    // approximating the light distortion of real glass blocks. One shared
    // transmission pass covers all blocks, so cost is bounded.
    transmission: 1.0,
    ior: 1.52,
    thickness: 14,
    transparent: false,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
    normalMap: rippleNormalMap(),
    emissive: new THREE.Color(CLEAR_TINT),
    emissiveIntensity: 0.0,
  });
  mat.normalScale.set(1.6, 1.6); // strength of the wavy distortion
  mat.userData.tint = null; // null = clear
  return mat;
}

// Apply a tint (hex string) or null for clear glass.
export function applyTint(mat, hex, backlight) {
  mat.userData.tint = hex || null;
  const base = hex || CLEAR_TINT;
  mat.color.set(base);
  mat.emissive.set(base);
  setBacklight(mat, backlight);
}

// The refracted (transmitted) daylight already lights the glass; the backlight
// adds a subtle emissive glow on top, stronger for tinted blocks.
export function setBacklight(mat, backlight) {
  const tinted = !!mat.userData.tint;
  mat.emissiveIntensity = (tinted ? 0.4 : 0.12) * backlight;
}
