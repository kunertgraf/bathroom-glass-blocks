import { fullPalette, saveCustomColor, clearCustomColors } from './palette.js';
import {
  serialize, applyState, shareURL, loadSaved, saveNamed, deleteNamed, exportPNG,
} from './state.js';

const $ = (id) => document.getElementById(id);

// Wires the control panel to the app. `app` exposes:
//   grid, scene, camera, renderer, resetView(), updateOpening(), setContextVisible(b)
export function initEditor(app) {
  // --- Palette ---
  function renderSwatches() {
    const container = $('swatches');
    container.innerHTML = '';
    for (const c of fullPalette()) {
      const el = document.createElement('div');
      el.className = 'swatch' + (c.hex === null ? ' clear' : '');
      if (c.hex) el.style.background = c.hex;
      el.title = c.name;
      el.addEventListener('click', () => setActive(c));
      el.dataset.hex = c.hex === null ? 'clear' : c.hex;
      container.appendChild(el);
    }
    markActive();
  }

  function setActive(c) {
    app.activeColor = c.hex; // hex string or null
    $('activeSwatch').style.background = c.hex || 'transparent';
    $('activeName').textContent = c.name;
    markActive();
  }

  function markActive() {
    const cur = app.activeColor === null ? 'clear' : app.activeColor;
    for (const el of document.querySelectorAll('.swatch')) {
      el.classList.toggle('selected', el.dataset.hex === cur);
    }
  }

  $('addColor').addEventListener('click', () => {
    const hex = $('customColor').value;
    saveCustomColor(hex);
    renderSwatches();
    setActive({ name: hex, hex });
  });

  $('resetPalette').addEventListener('click', () => {
    clearCustomColors();
    renderSwatches();
    setActive(fullPalette()[1] || fullPalette()[0]); // back to first preset
  });

  // --- Random arrangement ---
  $('randomize').addEventListener('click', () => {
    const meshes = app.grid.meshes;
    const total = meshes.length;
    let n = Math.max(0, Math.min(total, parseInt($('randCount').value, 10) || 0));
    const palette = fullPalette().filter((c) => c.hex).map((c) => c.hex);
    if (!palette.length) return;

    // Fisher–Yates shuffle of cell indices, then color the first n.
    const order = meshes.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    app.grid.clearAll();
    for (let k = 0; k < n; k++) {
      const hex = palette[Math.floor(Math.random() * palette.length)];
      app.grid.paint(meshes[order[k]], hex);
    }
  });

  // --- Lighting ---
  $('backlight').addEventListener('input', (e) => {
    app.setBacklight(parseFloat(e.target.value));
  });

  // --- Display ---
  $('showContext').addEventListener('change', (e) => {
    app.setContextVisible(e.target.checked);
  });
  $('resetView').addEventListener('click', () => app.resetView());

  // --- Arrangements ---
  function refreshSavedList() {
    const sel = $('savedList');
    const saved = loadSaved();
    sel.innerHTML = '';
    const names = Object.keys(saved);
    if (!names.length) {
      const opt = document.createElement('option');
      opt.textContent = '(none saved)';
      opt.value = '';
      sel.appendChild(opt);
      return;
    }
    for (const name of names) {
      const opt = document.createElement('option');
      opt.textContent = name;
      opt.value = name;
      sel.appendChild(opt);
    }
  }

  $('saveArr').addEventListener('click', () => {
    const name = $('arrName').value.trim();
    if (!name) { alert('Enter a name for the arrangement.'); return; }
    saveNamed(name, app);
    refreshSavedList();
    $('savedList').value = name;
  });

  $('loadArr').addEventListener('click', () => {
    const name = $('savedList').value;
    if (!name) return;
    const saved = loadSaved()[name];
    if (!saved) return;
    applyState(app, saved);
    app.updateOpening();
    app.resetView();
    syncInputs();
  });

  $('deleteArr').addEventListener('click', () => {
    const name = $('savedList').value;
    if (!name) return;
    deleteNamed(name);
    refreshSavedList();
  });

  $('shareLink').addEventListener('click', async () => {
    const url = shareURL(app);
    location.hash = url.split('#')[1] || '';
    try {
      await navigator.clipboard.writeText(url);
      flash($('shareLink'), 'Copied!');
    } catch {
      prompt('Copy this link:', url);
    }
  });

  $('exportPng').addEventListener('click', () => {
    exportPNG(app.renderer, app.scene, app.camera);
  });

  $('clearAll').addEventListener('click', () => {
    if (confirm('Clear all block tints?')) app.grid.clearAll();
  });

  // Reflect current state back into the controls (after a load).
  function syncInputs() {
    $('backlight').value = app.grid.backlight;
  }

  function flash(btn, msg) {
    const old = btn.textContent;
    btn.textContent = msg;
    setTimeout(() => { btn.textContent = old; }, 1200);
  }

  // initial render
  renderSwatches();
  setActive(fullPalette()[1] || fullPalette()[0]); // default to first tint
  refreshSavedList();
  syncInputs();
}
