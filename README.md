# Glass Block Bathroom Visualizer

An interactive 3D tool to design and tint the colored glass block window above the
tub in a bathroom addition, and see how arrangements look in context (refractive
glass, marble surround, daylight through the window).

It's a static site — vanilla JS + [Three.js](https://threejs.org/) loaded from a
CDN, no build step.

## Run locally

```
python3 -m http.server 8000
```

then open http://localhost:8000 (needs internet for the Three.js CDN).

## Use

- Pick a color from the palette (or add a custom one), then click/drag across
  blocks to paint. Drag empty space to orbit.
- **Random**: fill a chosen number of blocks with random colors.
- **Backlight**: daylight level — brightens/dims the room and the light through
  the glass.
- **Show bathroom context**: toggle the room (and exterior view) on/off.
- **Save / Load** arrangements, **Copy share link** (encodes the layout in the
  URL), and **Export PNG**.
