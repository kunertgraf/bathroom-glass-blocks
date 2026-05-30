// Serialize / restore arrangements: URL hash for sharing, localStorage for
// named saves, and PNG export of the current view.

const SAVED_KEY = 'gbv.saved';

export function serialize(app) {
  return {
    v: 1,
    cols: app.grid.cols,
    rows: app.grid.rows,
    blockSize: app.grid.blockSize,
    backlight: app.grid.backlight,
    colors: app.grid.getColors(),
  };
}

export function applyState(app, s) {
  if (!s || !s.colors) return;
  app.setBacklight(typeof s.backlight === 'number' ? s.backlight : 0.9);
  if (s.blockSize) app.grid.rebuild(s.cols, s.rows, s.blockSize, false);
  app.grid.setColors(s.colors);
}

// --- URL hash ---
export function encodeHash(s) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(s))));
}

export function decodeHash(hash) {
  try {
    const raw = decodeURIComponent(escape(atob(hash.replace(/^#/, ''))));
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function shareURL(app) {
  const s = serialize(app);
  const url = `${location.origin}${location.pathname}#${encodeHash(s)}`;
  return url;
}

// --- Named saves (localStorage) ---
export function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveNamed(name, app) {
  const all = loadSaved();
  all[name] = serialize(app);
  localStorage.setItem(SAVED_KEY, JSON.stringify(all));
}

export function deleteNamed(name) {
  const all = loadSaved();
  delete all[name];
  localStorage.setItem(SAVED_KEY, JSON.stringify(all));
}

// --- PNG export ---
export function exportPNG(renderer, scene, camera) {
  renderer.render(scene, camera); // ensure the buffer is current
  const dataURL = renderer.domElement.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'glass-blocks.png';
  a.click();
}
