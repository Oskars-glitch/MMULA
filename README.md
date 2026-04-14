# Mazā Mula Game Engine v1.4.0

A standalone JavaScript game engine for educational art games, featuring interactive learning experiences based on cultural heritage and art education.

## Overview

The Mula Engine is a lightweight, flexible framework designed to create engaging educational games without external dependencies (except Three.js for 3D viewing). It supports multiple game types with responsive, mobile-friendly interfaces and a unified design system.

**Current Version:** 1.4.0

## Features

### Supported Game Types

1. **Find Objects** (`find-objects`)
   - Single or dual-image comparison gameplay
   - Interactive click-based object discovery
   - Visual highlighting with customizable colors and opacity
   - Automatic counter for found objects
   - Debug mode for teacher positioning

2. **3D Object Viewer** (`obj-viewer`)
   - OBJ/MTL model loading and rendering (Three.js)
   - Material/texture swapping via sidebar thumbnails
   - Orbit controls for model interaction
   - Responsive canvas sizing
   - Support for multiple material variations

3. **Drag Objects** (`drag-objects`)
   - Free placement of image pieces on a background painting
   - Drag-and-drop with boundary constraints
   - Layer controls (up, down, delete)
   - Compare view with original artwork
   - Z-index management for layering

4. **Reveal Image** (`reveal-image`)
   - Hidden image areas revealed on click
   - Per-spot custom images
   - Toggle or permanent reveal modes
   - Debug positioning helpers
   - Responsive scaling

5. **Hidden Objects (Spotlight)** (`hidden-objects`)
   - Circular spotlight mechanic (flashlight effect)
   - Foreground image revealed by cursor movement
   - Soft-edged gradient mask with customizable feather
   - Optional find-objects integration
   - Visual ring indicator around spotlight
   - Desktop and touch support

## Core Components

### Info Bar
- Refresh button (restart game)
- PDF viewer button (for methodological materials)
- Task bubble with character animation
- Mobile-responsive sidebar

### Styling System
- Built-in comprehensive CSS (injected at runtime)
- Responsive design for desktop and mobile
- Orientation detection and landscape prompts
- Customizable color scheme per game

## API Usage

### Basic Initialization

```javascript
MulaEngine.init(target, config);
```

**Parameters:**
- `target` - CSS selector (string) or DOM element
- `config` - Game configuration object

### Configuration Examples

#### Find Objects (Single Image)
```javascript
MulaEngine.init('#game-container', {
  type: 'find-objects',
  image: 'assets/img/painting.jpg',
  imageSize: { width: 1920, height: 1440 },
  caption: 'Find the hidden objects',
  objects: [
    { x: 100, y: 150, w: 80, h: 100, alpha: 20 },
    { x: 400, y: 300, w: 60, h: 80, alpha: 15 }
  ],
  color: '#e6381b',
  taskText: 'Click on each object you find',
  mulaAssetsPath: 'mula-assets/'
});
```

#### Find Objects (Dual Images)
```javascript
MulaEngine.init('#game-container', {
  type: 'find-objects',
  imageLeft: 'assets/left.jpg',
  imageRight: 'assets/right.jpg',
  captionLeft: 'Before',
  captionRight: 'After',
  imageSize: { width: 800, height: 600 },
  objectsLeft: [...],
  objectsRight: [...]
});
```

#### 3D Object Viewer
```javascript
MulaEngine.init('#game-container', {
  type: 'obj-viewer',
  objUrl: 'assets/model.obj',
  mtlUrl: 'assets/model.mtl',
  bgColor: 0xF4EDDF,
  caption: 'Rotate to view the sculpture',
  textures: [
    { thumb: 'thumb-bronze.png', mtlUrl: 'assets/bronze.mtl', label: 'Bronze' },
    { thumb: 'thumb-marble.png', mtlUrl: 'assets/marble.mtl', label: 'Marble' }
  ]
});
```

#### Drag Objects
```javascript
MulaEngine.init('#game-container', {
  type: 'drag-objects',
  backgroundImage: 'assets/canvas.jpg',
  originalImage: 'assets/original.jpg',
  caption: 'Arrange the pieces to complete the artwork',
  objects: [
    { src: 'assets/piece1.png' },
    { src: 'assets/piece2.png' }
  ],
  taskText: 'Drag pieces to reconstruct the painting'
});
```

#### Reveal Image
```javascript
MulaEngine.init('#game-container', {
  type: 'reveal-image',
  image: 'assets/bg.jpg',
  imageSize: { width: 1024, height: 768 },
  objects: [
    { x: 100, y: 200, w: 150, h: 150, image: 'assets/hidden1.png' },
    { x: 400, y: 300, w: 100, h: 100, image: 'assets/hidden2.png' }
  ],
  debug: false,
  revealOnce: true
});
```

#### Hidden Objects (Spotlight)
```javascript
MulaEngine.init('#game-container', {
  type: 'hidden-objects',
  image: 'assets/background.jpg',
  hiddenImage: 'assets/foreground.jpg',
  imageSize: { width: 800, height: 600 },
  radius: 100,
  feather: 30,
  ringWidth: 2,
  ringColor: '#2196F3',
  hideCursor: true,
  objects: [
    { x: 150, y: 200, w: 80, h: 80, label: 'Find the tree' },
    { x: 500, y: 400, w: 60, h: 60, label: 'Find the bird' }
  ],
  debug: false
});
```

### Common Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | string | Game type ('find-objects', 'obj-viewer', 'drag-objects', 'reveal-image', 'hidden-objects') |
| `taskText` | string | Instructions shown in the info bubble |
| `pdfUrl` | string | URL to PDF for methodological materials |
| `mulaAssetsPath` | string | Path to Mula character/icon assets (default: 'mula-assets/') |
| `checkOrientation` | boolean | Show landscape hint on mobile (default: true) |
| `caption` | string | Game area caption |
| `color` | string | Hex color for highlights (default: '#e6381b') |

## File Structure

```
mula-engine.js                    # Main engine file
demos/                            # Demo pages
├── demo-find-objects.html
├── demo-3d-viewer-textures.html
├── demo-drag-objects.html
├── demo-reveal-image.html
├── demo-hidden-objects.html
└── assets/                       # Game assets
    ├── img/                      # Background images and art
    ├── obj/                      # 3D models (.obj, .mtl)
    └── pdf/                      # Educational materials
mula-assets/                      # UI assets (character, icons)
data/                             # Game configuration data (SVG data)
```

## Key Features

### Responsive Design
- Automatically scales to viewport
- Mobile touch support for drag games and spotlight mechanics
- Orientation detection with landscape prompts
- Sidebar adapts to mobile layouts

### Accessibility
- Keyboard and mouse support
- Touch input support for all interactive elements
- Debug mode for teacher positioning
- Customizable colors and highlight visibility

### Performance
- Lightweight (~50KB uncompressed)
- No external framework dependencies (Three.js optional for 3D)
- Efficient DOM manipulation
- Canvas-based rendering for 3D viewer

### Educational Features
- Task descriptions with character personality
- Multiple game modes for varied learning styles
- Comparison tools for critical thinking
- Debug positioning for accurate game creation

## Recent Updates (v1.4.0)

- Enhanced 3D viewer with improved material loading
- Added spotlight mode with soft-edged mask gradient
- Improved drag-objects boundary constraints
- Better thumbnail loading and scaling
- Enhanced mobile responsiveness
- Added layer controls (up/down/delete) for drag objects
- Spotlight ring visual indicator
- Improved PDF overlay viewer

## Dependencies

### Required
- None (vanilla JavaScript)

### Optional
- **Three.js** - For 3D model viewing (`obj-viewer` game type)
- **OBJLoader** - For loading OBJ files
- **MTLLoader** - For loading material files
- **OrbitControls** - For 3D camera interaction

## Browser Support

- Modern browsers with ES6 support
- Chrome, Firefox, Safari, Edge (current versions)
- Mobile browsers (iOS Safari, Chrome)
- Touch input support for interactive games

## Asset Preparation Guide

### Images
- Optimize for web (compress without quality loss)
- Provide natural pixel dimensions for accurate scaling
- PNG for transparency, JPG for photographs

### 3D Models
- OBJ format with accompanying MTL file
- Material names must match between OBJ and MTL
- Optimize geometry for web performance
- Test texture paths before deployment

### Coordinates
- All coordinates are in natural image/model pixels
- Origin (0,0) is top-left
- X increases rightward, Y increases downward
- Scaling is automatic based on image display size

## Usage Example

```<!DOCTYPE html>
<html lang="lv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mazā Mula – Atklāj attēlu</title>
  <script src="https://cdn.jsdelivr.net/gh/Oskars-glitch/MMULA@main/mula-engine.js"></script>
</head>
<body>
  <div id="game"></div>
  <script>
    // REVEAL IMAGE — click on invisible spots on the background to reveal hidden images.
    // Each object's image should ideally be the same size as its {w, h} box so it fits
    // perfectly — the engine scales everything proportionally with the background.
    MulaEngine.init('#game', {
      type: 'reveal-image',
      image: 'assets/img/KlusaDaba/Lancmanis_Klusa_daba.jpg',
      imageSize: { width: 934, height: 768 },
      objects: [
        { x: 80,  y: 120, w: 130, h: 180, image: 'assets/img/box_01.png' },
        { x: 310, y: 250, w: 100, h: 140, image: 'assets/img/box_02.png' },
        { x: 500, y: 100, w: 140, h: 120, image: 'assets/img/box_03.png' },
        { x: 650, y: 300, w: 120, h: 160, image: 'assets/img/box_04.png' }
      ],
      // debug: true,      // show spot outlines while positioning
      // revealOnce: false, // allow toggling (click again to hide)
      taskText: 'Uzklikšķini uz gleznas, lai atklātu paslēptos attēlus!',
      pdfUrl: 'assets/pdf/KlusaDaba/2/2_1_Enas_dabu_gaisma_rada.pdf',
      mulaAssetsPath: '../mula-assets/',
      caption: 'Imants Lancmanis. Klusā daba – atklāj detaļas'
    });
  </script>
</body>
</html>
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.4.0 | 2026 | Spotlight game, enhanced 3D viewer, layer controls, improved mobile support |
| 1.3.0 | 2026 | Reveal-image game type, debug mode, enhanced styling |
| 1.2.0 | 2026 | Drag-objects game, PDF viewer, info bar improvements |
| 1.1.0 | 2026 | 3D viewer with texture swapping |
| 1.0.0 | 2026 | Initial release with find-objects game |

## License

Part of the Mazā Mula educational platform for art and cultural heritage learning.
