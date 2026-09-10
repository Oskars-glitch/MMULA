# Mazā Mula Game Engine (MMULA)

A small, standalone JavaScript engine for building educational art games. Designed so that students and teachers can create interactive exercises by writing a single short HTML file — without touching the engine code.

One `<script>` tag, one `MulaEngine.init(...)` call, and you get a fully styled game with task bubble, mobile orientation hints, PDF materials viewer, and responsive scaling.

**Current version:** 1.9.0

---

## Quick start

```html
<!DOCTYPE html>
<html lang="lv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Mula Game</title>
  <script src="https://cdn.jsdelivr.net/gh/Oskars-glitch/MMULA@main/mula-engine.js"></script>
</head>
<body>
  <div id="game"></div>
  <script>
    MulaEngine.init('#game', {
      type: 'find-objects',
      image: 'assets/my-painting.jpg',
      imageSize: { width: 934, height: 768 },
      objects: [
        { x: 80, y: 120, w: 130, h: 180 }
      ],
      taskText: 'Atrodi priekšmetus gleznā!',
      caption: 'Mana glezna'
    });
  </script>
</body>
</html>
```

That's it: one HTML file next to your own pictures. The engine injects its own CSS, builds the UI, loads the Mula character and icons from GitHub, and handles scaling, touch input, and mobile layout automatically.

---

## Project structure

```
MMULA/
├── mula-engine.js        # The engine (one file, no dependencies except THREE for 3D)
├── mula-assets/          # Shared UI assets (Mula character, icons)
│   ├── Mula_doma.png
│   ├── MASKA.png
│   ├── icon-check.svg
│   ├── icon-chevron-right.svg
│   ├── icon-close-menu.svg
│   ├── icon-download.svg
│   └── icon-refresh-1.svg
├── demos/                # Demo games, one per game type (copy one to start your own)
│   ├── demo-find-objects.html
│   ├── demo-find2.html
│   ├── demo-drag-objects.html
│   ├── demo-3d-viewer-textures.html
│   ├── demo-reveal-image.html
│   ├── demo-hidden-objects.html
│   ├── demo-click-through.html
│   ├── demo-timed-preview.html
│   └── assets/           # Per-game images, models, PDFs
└── README.md
```

Paths in each HTML are written relative to that HTML file, so placing the engine one folder above the games (as in demos) lets you reference it as `../mula-engine.js`.

---

## Game types

| Type             | What it does |
| ---------------- | ------------ |
| `find-objects`   | Click to find hotspots on one or two images. |
| `drag-objects`   | Drag PNG pieces from a scrollable sidebar onto a painting, reorder layers, delete. |
| `obj-viewer`     | 3D OBJ/MTL viewer with orbit controls; optional clickable texture previews swap the material live. |
| `reveal-image`   | Clickable invisible spots reveal hidden images underneath. |
| `hidden-objects` | Spotlight reveal — a flashlight-style circle around the cursor shows a hidden overlay image. Can be combined with find-objects. |
| `click-through`  | Clickable hotspots that cycle through a list of image variants (e.g., repaint a vase by clicking it). |
| `timed-preview`  | Shows the original image for a few seconds with a countdown, then lets the player find what's missing on the modified version. |

---

## Common config (all types)

| Option            | Type    | Description |
| ----------------- | ------- | ----------- |
| `type`            | string  | One of the types above. Required. |
| `taskText`        | string  | Task description shown in Mula's speech bubble. |
| `caption`         | string  | Small caption below the image (e.g., artwork + author). |
| `pdfUrl`          | string  | Optional PDF (methodical materials). Adds a 📄 button to the info bar. |
| `mulaAssetsPath`  | string  | Optional. Where the Mula character and icons are. Default: GitHub (`https://cdn.jsdelivr.net/gh/Oskars-glitch/MMULA@main/mula-assets/`), so you normally leave it out. Set it (for example `'../mula-assets/'`) only for an offline copy. |
| `checkOrientation`| boolean | If `true` (default), shows a "rotate your device" hint in portrait on mobile. |

---

## Coordinate system

For every game type that uses `objects`, coordinates are given in the **natural pixel space of the image** (`imageSize: { width, height }`). The engine scales them proportionally when the image is resized to fit the browser, so you only have to measure coordinates once from the original full-size image.

Every object uses the same box: `{ x, y, w, h }` — top-left corner plus width/height, in that natural pixel space.

---

## Game type reference

### `find-objects`

Classic "click-to-find" game with one or two images side by side.

**Single image mode:**
```js
MulaEngine.init('#game', {
  type: 'find-objects',
  image: 'assets/painting.jpg',
  imageSize: { width: 934, height: 768 },
  objects: [
    { x: 80, y: 120, w: 130, h: 180, alpha: 30, fill: 1, label: 'Ābols' }
  ],
  taskText: 'Atrodi 4 lietas.',
  caption: 'Klusā daba'
});
```

**Two images mode:**
```js
MulaEngine.init('#game', {
  type: 'find-objects',
  imageLeft: 'assets/original.jpg',
  imageRight: 'assets/modified.png',
  imageSize: { width: 934, height: 768 },
  objectsLeft:  [ { x: 80, y: 120, w: 130, h: 180, alpha: 30 } ],
  objectsRight: [ { x: 80, y: 120, w: 130, h: 180, alpha: 30 } ],
  captionLeft: 'Oriģināls',
  captionRight: 'Modificēts'
});
```

In two images mode there is **one counter** under both paintings, and the hotspots pair by position: `objectsLeft[0]` and `objectsRight[0]` are the same difference. Finding it on either painting marks it on both and counts once. Keep the two lists in the same order; an index that exists on one side only counts on its own. (If you styled `.mula-find-column .mula-find-footer` or read the second `.mula-find-footer-count`, note that in two images mode there is now one counter element and it sits in `.mula-find-wrapper`.)

**Per-object options:**

| Option       | Default | Description |
| ------------ | ------- | ----------- |
| `alpha`      | `20`    | Fill opacity % when found. |
| `alphaDebug` | —       | If set, highlight the area before clicking (for positioning). |
| `fill`       | `1`     | `0` = border only when found, `1` = filled. |
| `label`      | —       | Optional tooltip text. |

**Global options:** `color` (hex, default `#e6381b`), `fill` (bool), `debug` (bool).

---

### `drag-objects`

Drag PNG pieces from a sidebar onto a background painting. Each piece keeps its original natural size (scaled proportionally to the background). Layer controls (up/down/delete) sit next to the canvas.

```js
MulaEngine.init('#game', {
  type: 'drag-objects',
  backgroundImage: 'assets/painting_empty.png',
  originalImage: 'assets/painting_original.jpg',
  objects: [
    { src: 'assets/piece1.png' },
    { src: 'assets/piece2.png' },
    { src: 'assets/piece3.png' }
  ],
  taskText: 'Novieto priekšmetus uz gleznas!',
  caption: 'Klusā daba'
});
```

**Behavior:**

- Sidebar is scrollable internally (fits any number of pieces).
- Dragging a thumb places it on the canvas and removes it from the sidebar list.
- Clicking 🗑 on a placed piece deletes it and returns the thumb to the sidebar.
- Pieces can be reordered with ↑ / ↓ layer buttons.
- If `originalImage` is provided, a "Salīdzināt ar oriģinālu" button appears to compare.

---

### `obj-viewer`

A 3D model viewer with orbit controls (Three.js). Optionally shows a sidebar of texture previews — clicking a preview swaps the MTL file on the already-loaded geometry.

**Required scripts** (load before `mula-engine.js`):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/MTLLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
```

**Basic usage:**
```js
MulaEngine.init('#game', {
  type: 'obj-viewer',
  objUrl: 'assets/granita.obj',
  mtlUrl: 'assets/granita.mtl',
  bgColor: 0xF4EDDF,
  taskText: 'Pagrozi 3D modeli!',
  caption: 'Granīta skulptūra'
});
```

**With texture swap sidebar:**
```js
MulaEngine.init('#game', {
  type: 'obj-viewer',
  objUrl: 'assets/granita.obj',
  mtlUrl: 'assets/granita.mtl',
  textures: [
    { thumb: 'previews/granita.png', mtlUrl: 'assets/granita.mtl', label: 'Granīts' },
    { thumb: 'previews/bronze.png',  mtlUrl: 'assets/bronze.mtl',  label: 'Bronza' },
    { thumb: 'previews/marble.png',  mtlUrl: 'assets/marble.mtl',  label: 'Marmors' }
  ]
});
```

All MTL files must reference the same material names used in the OBJ; the engine calls `materials.create(name)` for each mesh so the geometry stays loaded.

---

### `reveal-image`

Click invisible spots on a background to reveal images underneath. Each revealed image is scaled to its spot's `{ w, h }`.

```js
MulaEngine.init('#game', {
  type: 'reveal-image',
  image: 'assets/painting.jpg',
  imageSize: { width: 934, height: 768 },
  objects: [
    { x: 80,  y: 120, w: 130, h: 180, image: 'assets/detail1.jpg' },
    { x: 310, y: 250, w: 100, h: 140, image: 'assets/detail2.jpg' }
  ],
  taskText: 'Uzklikšķini uz gleznas, lai atklātu detaļas!'
});
```

**Options:** `debug` (show spot outlines), `revealOnce` (default `true`; set `false` to allow toggling).

Each revealed image should be the same dimensions as its spot box for a clean fit.

---

### `hidden-objects`

A flashlight-style spotlight around the cursor reveals a hidden overlay image on top of a visible background. Optionally combine with find-object hotspots.

```js
MulaEngine.init('#game', {
  type: 'hidden-objects',
  image: 'assets/visible.jpg',
  hiddenImage: 'assets/hidden.jpg',
  imageSize: { width: 934, height: 768 },
  radius: 110,
  feather: 25,
  ringWidth: 2,
  ringColor: '#2196F3',
  objects: [
    { x: 80, y: 120, w: 130, h: 180, label: 'Ābols' }
  ],
  taskText: 'Izgaismo gleznu un atrodi priekšmetus!'
});
```

| Option       | Default     | Description |
| ------------ | ----------- | ----------- |
| `radius`     | `90`        | Spotlight radius in px. |
| `feather`    | `20`        | Soft edge width in px. |
| `ringWidth`  | `2`         | Visible ring thickness in px. `0` hides the ring. |
| `ringColor`  | `'#2196F3'` | Ring color (any CSS color). |
| `hideCursor` | `true`      | Hide the OS cursor over the stage. |
| `objects`    | `[]`        | Optional find-area hotspots. |

`hiddenImage` must be the same dimensions as `image` so overlays align.

---

### `click-through`

Hotspots that cycle through an array of image variants when clicked.

```js
MulaEngine.init('#game', {
  type: 'click-through',
  image: 'assets/background.png',
  imageSize: { width: 600, height: 700 },
  objects: [
    {
      x: 80, y: 60, w: 180, h: 260,
      images: [
        'assets/vase_a.png',
        'assets/vase_b.png',
        'assets/vase_c.png'
      ]
    }
  ],
  taskText: 'Klikšķini uz vāzēm, lai pārslēgtu to izskatu!'
});
```

| Per-object option | Default | Description |
| ----------------- | ------- | ----------- |
| `images`          | —       | Array of image URLs to cycle through. Required. |
| `startIndex`      | `0`     | Which image to show first. |
| `loop`            | `true`  | Wrap back to first after the last. |

Each variant image should match the spot's `{ w, h }` for a clean fit.

---

### `timed-preview`

Shows the original image fullscreen for a few seconds with a countdown, then hides it. The player finds missing/changed objects on the modified version. Find-area logic is identical to `find-objects`.

```js
MulaEngine.init('#game', {
  type: 'timed-preview',
  image: 'assets/modified.png',
  originalImage: 'assets/original.jpg',
  previewSeconds: 5,
  imageSize: { width: 934, height: 768 },
  objects: [
    { x: 80, y: 120, w: 130, h: 180, alpha: 30 }
  ],
  taskText: 'Apskati oriģinālu un atrodi, kas ir pazudis!'
});
```

| Option             | Default              | Description |
| ------------------ | -------------------- | ----------- |
| `previewSeconds`   | `5`                  | How long the original is shown. |
| `previewLabel`     | `'Apskati oriģinālu'`| Button label. |
| `previewsAllowed`  | `Infinity`           | How many peeks the player gets. |

---

## Tips for positioning hotspots

While laying out coordinates, add `debug: true` at the top level (or `alphaDebug: 30` per object in `find-objects`) to visualize the boxes on top of the image. Remove the flag before publishing.

---

## Browser support

- Modern browsers with CSS `mask-image` support (Chrome, Edge, Firefox, Safari). The `hidden-objects` spotlight uses radial-gradient masks.
- Touch input is supported across all game types. On phones (landscape) the piece list and the texture column stay beside the picture; every button is at least 44 px.
- 3D viewer requires WebGL.

---

## Version history

### 1.9.0 (2026-09)
One HTML file is enough.
- The Mula character and the icons come from GitHub unless your game sets `mulaAssetsPath`. The demos no longer set it, so a copied demo works in any folder next to your own pictures.
- The rotate hint shows only on touch screens held upright, never in a PC window, and its "Turpināt tāpat" button now really hides it.
- On small phones (iPhone SE) nothing sits under the green pill any more; the harness now checks that size too.

### 1.8.0 (2026-09)
Hotspots follow the picture.
- When the picture changes size (turning the phone after the rotate hint, resizing the window), every hotspot and every dropped drag piece moves and scales with it, in all six picture games.
- What was already found stays found; the counter does not change.

### 1.7.0 (2026-09)
find-objects with two paintings: one game, not two.
- One counter under both paintings instead of one per painting.
- A difference found on either painting is marked on both and counts once. Hotspots pair by their position in the two lists, so keep `objectsLeft` and `objectsRight` in the same order.

### 1.6.0 (2026-09)
Layout and look fixes, no config or class-name change. Every existing game gets them from the CDN.
- Every button is at least 44 px on phones: info bar, bubble close, PDF close, rotate hint, layer buttons, compare and preview buttons.
- Task bubble on phones is compact and its text centred; it may cover the picture, the child closes it before playing.
- The info bar grows out of the green arrow pill instead of the pill fading and the bar sliding in.
- The original Mula icons are back: refresh, PDF materials (the download arrow), layer up, layer down, delete.
- find-objects on phones: picture up to 70 % of the height, two pictures side by side. timed-preview picture 60 %.
- drag-objects and the 3D viewer keep the desktop row on phones (picture left, list and buttons right); the compare button and the caption sit under the middle of the picture.
- Small pictures are shown at their file size, never enlarged (this was already so; it is now the written rule).

### 1.5.0 (2026-04-16)
- Fixes ("Labojumi 1.5"); seven game types: find-objects, obj-viewer, drag-objects, reveal-image, hidden-objects, click-through, timed-preview.

### 1.1 (2026-04-14)
- First public commit: find-objects, obj-viewer, drag-objects.

---

## License

Educational use. Feel free to fork and adapt.
