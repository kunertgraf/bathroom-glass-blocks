// The corner tub: a platform spanning the alcove wall-to-wall under one smooth
// white counter top, with a corner-tub basin set into it, a 45° chamfer at the front-left
// corner and a lower step filling that chamfer. All units = inches.
//
// Plan (looking down; x = across the alcove, z = out from the window wall):
//
//     x=-W/2                                x=+W/2
//   z=0  +-------------------------------------+   <- window wall
//        |                                     |
//        |            (basin, rotated 45°      |
//        |             to face the chamfer)    |
//        +--.                                  |
//   step -> \  <- chamfer riser                |
//   z=D      `------------------------------- -+
//
// The platform top and the step top are flat `ShapeGeometry` slabs, so their
// UVs come out in inches and the tile maps at true scale (see deckMaterial in
// scene.js). The aprons are plain panels with 0..1 UVs.
import * as THREE from 'three';

// Basin form: a trefoil (three lobes with pinches between, like the real tub).
// The phase puts a PINCH on the tub's axis facing the chamfer — the end that
// narrows to a rounded point in the photo — and a LOBE on the back corner, with
// the other two lobes to the sides. A lobe facing the chamfer instead would both
// read wrong and shoulder the basin out past the 60" unit's chamfered edge.
const RIM_LOBE = 0.17;    // lobe depth at the rim
const FLOOR_LOBE = 0.24;  // the bowl floor is a more pronounced rounded triangle
const SEG = 128;          // angular segments around the bowl
const RINGS = 28;         // rings from rim down to floor

const trefoil = (theta, lobe) => 1 - lobe * Math.cos(3 * (theta - Math.PI / 2));

// Bowl profile. `t` runs 0 (rim) -> 1 (floor). Descending fast while the radius
// barely moves gives a near-vertical wall under the rim; the radius then draws
// in as the descent flattens, rounding into the floor.
const dropAt = (t) => Math.pow(t, 0.62);
const drawInAt = (t) => 1 - 0.46 * Math.pow(t, 1.7);

export function createTub({
  width,                 // spans the alcove wall-to-wall
  depth = 64,
  height = 21,
  chamfer = 20,          // 45° cut at the front-left corner (leg length)
  stepHeight = 10.5,
  basinRadius = 23,      // ~52" across, the basin of a 60" corner tub unit
  basinDepth = 15.5,
  basinAxis = 1.12,      // stretch ALONG the tub's diagonal axis (local, so the
  basinSpan = 1.0,       // basin stays symmetric about that axis — see rimPoint)
  wallZ = 0,             // z of the window-wall face
  envMap = null,         // reflections for the acrylic (see buildScene)
  deckMaterial,          // () => material for flat slabs (UVs in inches)
  panelMaterial,         // (w, h) => material for upright aprons (UVs 0..1)
}) {
  const group = new THREE.Group();
  const owned = [];      // geometries/materials to dispose on rebuild
  const track = (o) => { owned.push(o); return o; };

  const W = width, D = depth, H = height, CH = chamfer;
  const xL = -W / 2, xR = W / 2, zBack = wallZ, zFront = wallZ + D;

  const PHI = -Math.PI / 4; // rotate the trefoil to face the front-left chamfer

  // Basin point at angle theta, in the platform's frame but not yet centred.
  // The stretch is applied in the tub's own frame, BEFORE the 45° rotation:
  // stretching in world x/z afterwards would shear the form off its diagonal
  // axis and the three lobes would collapse into a lopsided egg.
  function rawPoint(theta, radiusScale = 1, lobe = RIM_LOBE) {
    const r = basinRadius * trefoil(theta, lobe) * radiusScale;
    const lx = r * Math.cos(theta) * basinSpan;   // across the tub
    const lz = r * Math.sin(theta) * basinAxis;   // along its axis
    return [lx * Math.cos(PHI) + lz * Math.sin(PHI),
            -lx * Math.sin(PHI) + lz * Math.cos(PHI)];
  }

  // Centre the basin in the platform. Rotated 45°, the trefoil's bounding box is
  // NOT centred on its own origin — the lobes fall off-axis — so measure the box
  // and centre that. Placing the origin at the centre leaves the tub visibly off
  // to one side, which is exactly what it looks like.
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let i = 0; i < SEG; i++) {
    const [x, z] = rawPoint((i / SEG) * Math.PI * 2);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x);
    z0 = Math.min(z0, z); z1 = Math.max(z1, z);
  }
  const bx = (xL + xR) / 2 - (x0 + x1) / 2;
  const bz = (zBack + zFront) / 2 - (z0 + z1) / 2;

  const rimPoint = (theta, radiusScale, lobe) => {
    const [x, z] = rawPoint(theta, radiusScale, lobe);
    return [bx + x, bz + z];
  };

  // The top is one continuous smooth white counter, so the deck and the basin
  // share a material — any separate rim or collar would show up as a seam.
  const white = track(new THREE.MeshPhysicalMaterial({
    color: 0xfaf8f5,
    roughness: 0.13,
    metalness: 0,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
    envMap,
    envMapIntensity: 0.5,
    side: THREE.DoubleSide, // the rim is seen from both sides at grazing angles
  }));

  // --- flat slabs -----------------------------------------------------------
  // Shapes are built in XY and laid down with rotation.x = -90°, which maps
  // shape Y -> world -Z. So every shape point is (x, -z).
  function slab(shape, y, material) {
    const geo = track(new THREE.ShapeGeometry(shape));
    const mesh = new THREE.Mesh(geo, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = y;
    group.add(mesh);
    return mesh;
  }

  // Platform top: the alcove rectangle with the front-left corner chamfered,
  // holding the basin opening.
  const deck = new THREE.Shape();
  deck.moveTo(xL, -zBack);
  deck.lineTo(xL, -(zFront - CH));
  deck.lineTo(xL + CH, -zFront);
  deck.lineTo(xR, -zFront);
  deck.lineTo(xR, -zBack);
  deck.closePath();

  const rim = [];
  for (let i = 0; i < SEG; i++) rim.push(rimPoint((i / SEG) * Math.PI * 2));
  // The outer shape winds CCW, so the hole has to wind CW.
  let area = 0;
  for (let i = 0; i < rim.length; i++) {
    const [x1, z1] = rim[i], [x2, z2] = rim[(i + 1) % rim.length];
    area += x1 * -z2 - x2 * -z1;
  }
  const holePts = area > 0 ? [...rim].reverse() : rim;
  const hole = new THREE.Path();
  holePts.forEach(([x, z], i) => (i ? hole.lineTo(x, -z) : hole.moveTo(x, -z)));
  hole.closePath();
  deck.holes.push(hole);
  slab(deck, H, white);

  // Step: the triangle the chamfer cuts off, at half tub height.
  const step = new THREE.Shape();
  step.moveTo(xL, -(zFront - CH));
  step.lineTo(xL, -zFront);
  step.lineTo(xL + CH, -zFront);
  step.closePath();
  slab(step, stepHeight, track(deckMaterial())); // tiled tread

  // --- upright aprons -------------------------------------------------------
  // Each panel is placed by its centre and turned to face out of the platform.
  function panel(w, h, x, y, z, rotY) {
    const mesh = new THREE.Mesh(track(new THREE.PlaneGeometry(w, h)), track(panelMaterial(w, h)));
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotY;
    group.add(mesh);
  }

  const midH = H / 2;
  panel(W - CH, H, (xL + CH + xR) / 2, midH, zFront, 0);                       // front
  panel(D, H, xR, midH, zBack + D / 2, Math.PI / 2);                           // right
  panel(D - CH, H, xL, midH, zBack + (D - CH) / 2, -Math.PI / 2);              // left
  panel(CH * Math.SQRT2, H, xL + CH / 2, midH, zFront - CH / 2, -Math.PI / 4); // chamfer riser

  // Step aprons (its diagonal side is buried in the chamfer riser above).
  panel(CH, stepHeight, xL + CH / 2, stepHeight / 2, zFront, 0);
  panel(CH, stepHeight, xL, stepHeight / 2, zFront - CH / 2, -Math.PI / 2);

  // --- acrylic basin --------------------------------------------------------
  // Lofted ring by ring from the deck opening down to a rounded-triangle floor,
  // blending the rim trefoil toward the more pronounced floor form as it drops.
  const pos = [], idx = [];
  for (let i = 0; i <= RINGS; i++) {
    const t = i / RINGS;
    const y = H - basinDepth * dropAt(t);
    const shrink = drawInAt(t);
    const lobe = RIM_LOBE + (FLOOR_LOBE - RIM_LOBE) * t;
    for (let j = 0; j < SEG; j++) {
      const [x, z] = rimPoint((j / SEG) * Math.PI * 2, shrink, lobe);
      pos.push(x, y, z);
    }
  }
  for (let i = 0; i < RINGS; i++) {
    for (let j = 0; j < SEG; j++) {
      const a = i * SEG + j, b = i * SEG + ((j + 1) % SEG);
      const c = a + SEG, d = b + SEG;
      idx.push(a, c, b, b, c, d);   // wound so the normals face into the bowl
    }
  }
  const centre = pos.length / 3;
  pos.push(bx, H - basinDepth, bz);
  for (let j = 0; j < SEG; j++) {
    const a = RINGS * SEG + j, b = RINGS * SEG + ((j + 1) % SEG);
    idx.push(a, centre, b);
  }
  const bowlGeo = track(new THREE.BufferGeometry());
  bowlGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  bowlGeo.setIndex(idx);
  bowlGeo.computeVertexNormals();

  group.add(new THREE.Mesh(bowlGeo, white));

  function dispose() {
    for (const o of owned) {
      if (o.isTexture) o.dispose();
      else if (o.map) { o.map.dispose(); o.dispose(); }
      else o.dispose();
    }
    owned.length = 0;
  }

  return { group, dispose };
}
