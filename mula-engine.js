/**
 * Mazā Mula Game Engine v1.7.0
 * Standalone JavaScript game engine for educational art games.
 * Supports 7 game types: find-objects, obj-viewer, drag-objects, reveal-image,
 * hidden-objects, click-through, timed-preview
 */
(function (root) {
  'use strict';

  // ============================================================
  // CSS INJECTION
  // ============================================================
  function injectCSS() {
    if (document.getElementById('mula-engine-css')) return;
    const style = document.createElement('style');
    style.id = 'mula-engine-css';
    style.textContent = MULA_CSS;
    document.head.appendChild(style);
  }

  const MULA_CSS = `
/* === MULA ENGINE BASE === */
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4eddf; overflow: auto; }
.mula-game-container { width: 100vw; min-height: 100vh; display: flex; flex-direction: column; position: relative; }
.mula-game-area { flex: 1; display: flex; overflow: auto; position: relative; justify-content: center; align-items: center; }
.mula-caption { text-align: center; padding: 0.5rem; font-size: 0.9rem; color: #777; font-weight: 600; width: 100%; }

/* === INFO BAR === */
.mula-infobar-toggle {
  position: fixed; left: 0; bottom: 50px; z-index: 6001;
  width: 50px; height: 50px; border-radius: 0 100px 100px 0;
  background-color: #4CAF50; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.3s ease;
}
.mula-infobar-toggle img { width: 16px; height: 28px; }
.mula-infobar-toggle:hover { background-color: rgba(76,175,80,0.85); }
.mula-infobar-toggle.hidden { pointer-events: none; } /* D29: the pill stays visible; the growing bar covers it, so nothing fades before it is replaced */
.mula-infobar {
  /* SPEC-02c D29: the bar sits at the pill's place and is revealed left to right, so the pill
     grows into the bar. Above the pill (z 6002 > 6001) so it covers the arrow as it grows (D30). */
  position: fixed; left: 0; bottom: 50px; z-index: 6002;
  height: 50px; border-radius: 0 100px 100px 0;
  background-color: #4CAF50; display: flex; align-items: center;
  justify-content: flex-end;
  padding: 0 1.5rem; gap: 1rem;
  clip-path: inset(0 100% 0 0 round 0 100px 100px 0); transition: clip-path 0.5s ease;
}
.mula-infobar.opened { clip-path: inset(0 0 0 0 round 0 100px 100px 0); }
.mula-infobar button {
  background: none; border: none; cursor: pointer; width: 44px; height: 44px; /* D15: 44 px tap target, icon stays 28 px */
  background-repeat: no-repeat; background-size: 28px 28px; background-position: center;
  opacity: 0.9; padding: 0;
}
.mula-infobar button:hover { opacity: 1; }
.mula-infobar .mula-btn-refresh {
  /* original icon-refresh-1.svg (D21): white disc, red arrow (D22) */
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54"><circle cx="27" cy="27" r="27" fill="%23ffffff"/><g transform="translate(11,11.5)" fill="none" stroke="%23e6381b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 29,16 C 29,22 24,29 16,29 8,29 3,22 3,16 3,10 8,3 16,3 c 5,0 9,3 11,6 m -7,1 7,-1 1,-7"/></g></svg>');
}
.mula-infobar .mula-btn-pdf {
  /* original icon-download.svg (D21), white on green (D22) */
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"><path d="M28 22 L28 30 4 30 4 22 M16 4 L16 24 M8 16 L16 24 24 16"/></svg>');
}
.mula-task-bubble {
  position: fixed; z-index: 5998; left: 3vw; bottom: 83px;
  background: #fff; border: 2px solid #e6381b; border-radius: 24px;
  padding: 1.5vh; width: 33vw; font-weight: 600; font-size: 1.1rem;
  color: #777; text-align: center; line-height: 1.2; display: none;
  transform-origin: left bottom; animation: mulaScaleIn 0.4s ease;
}
.mula-task-bubble.visible { display: flex; flex-wrap: wrap; }
.mula-task-bubble .mula-task-text { width: 100%; padding: 1rem; text-align: center; }
.mula-task-bubble .mula-char {
  position: absolute; left: 0; top: -17.5vh; height: 20vh; width: auto;
}
.mula-task-bubble .mula-close-btn {
  position: absolute; top: -1.5vh; right: -20px; width: 44px; height: 44px; /* D15: 44 px tap target, icon stays 36 px */
  border: none; cursor: pointer; padding: 0; background: none;
  display: flex; align-items: center; justify-content: center;
}
.mula-task-bubble .mula-close-btn img { width: 36px; height: 36px; display: block; }
.mula-task-bubble .mula-btn-row { display: flex; justify-content: center; gap: 1rem; margin-left: auto; min-width: 1px; height: 2rem; }
.mula-task-bubble .mula-btn-download {
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>') no-repeat left center;
  background-size: 1.5rem; border: none; cursor: pointer; font-size: 0.9rem; color: #777;
  padding-left: 2.25rem; line-height: 2rem;
}
@keyframes mulaScaleIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }

/* === FIND OBJECTS GAME === */
.mula-find-wrapper { flex: 1; display: flex; flex-direction: row; flex-wrap: wrap; align-items: flex-end; justify-content: center; gap: 1.5vh; padding: 1vh; }
.mula-find-wrapper > .mula-find-footer { flex-basis: 100%; } /* SPEC-11 D39: one counter under both paintings */
.mula-find-wrapper.single { align-items: center; }
.mula-find-column { display: flex; flex-direction: column; align-items: center; max-width: 48%; }
.mula-find-column.single { max-width: 90%; }
.mula-find-svg-container { display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
.mula-find-footer { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.3rem 0; }
.mula-find-footer-label { font-size: 0.85rem; color: #777; }
.mula-find-footer-count { width: 28px; height: 28px; border-radius: 50%; background: #e6381b; color: #fff; font-size: 0.85rem; font-weight: bold; display: flex; align-items: center; justify-content: center; }

/* === 3D VIEWER GAME === */
.mula-3d-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.mula-3d-area { display: flex; flex-direction: row; align-items: flex-start; }
.mula-3d-canvas-container { position: relative; }
.mula-3d-canvas-container canvas { display: block; }
.mula-3d-preloader { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 1.5rem; color: #999; }
.mula-3d-preloader.loaded { display: none; }
.mula-3d-sidebar {
  width: 14vh; background: #f4eddf; display: flex; flex-direction: column;
  align-items: center; padding: 1vh; gap: 1vh;
  max-height: 80vh; overflow-y: auto; overflow-x: hidden;
  scrollbar-width: thin; scrollbar-color: #bbb #f4eddf;
}
.mula-3d-sidebar::-webkit-scrollbar { width: 8px; }
.mula-3d-sidebar::-webkit-scrollbar-thumb { background: #bbb; border-radius: 4px; }
.mula-3d-sidebar .mula-3d-thumb {
  width: 10vh; cursor: pointer; border: 2px solid transparent; border-radius: 4px;
  flex-shrink: 0; display: block;
}
.mula-3d-sidebar .mula-3d-thumb:hover { border-color: #e6381b; }
.mula-3d-sidebar .mula-3d-thumb.active { border-color: #2196F3; }
/* SPEC-05 D33: the caption shares the canvas axis; the row above also holds the 14vh texture column,
   so the same width is taken off the right. If the column width changes, this number must follow. */
.mula-3d-wrapper > .mula-caption { padding-left: 0; padding-right: 14vh; }

/* === DRAG OBJECTS GAME === */
.mula-dragobj-wrapper { flex: 1; display: flex; flex-direction: column; }
.mula-dragobj-area { flex: 1; display: flex; flex-direction: row; position: relative; }
.mula-dragobj-canvas-wrap { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; }
.mula-dragobj-bg { max-width: 100%; max-height: 80vh; display: block; user-select: none; -webkit-user-drag: none; }
.mula-dragobj-piece { position: absolute; cursor: grab; user-select: none; }
.mula-dragobj-piece img { width: 100%; height: 100%; pointer-events: none; display: block; }
.mula-dragobj-piece.selected { outline: 2px solid #2196F3; outline-offset: 4px; }
.mula-layer-panel { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem; background: #4CAF50; border-radius: 8px; align-self: flex-start; margin-top: 1rem; }
.mula-layer-btn { width: 44px; height: 44px; /* D15: 44 px tap target */ background: transparent; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.mula-layer-btn:hover { background: rgba(255,255,255,0.2); }
.mula-layer-btn svg { width: 24px; height: 24px; }
.mula-dragobj-sidebar {
  width: 14vh; background: #f4eddf; display: flex; flex-direction: column;
  align-items: center; padding: 1vh; gap: 1vh;
  max-height: 80vh; overflow-y: auto; overflow-x: hidden;
  scrollbar-width: thin; scrollbar-color: #bbb #f4eddf;
}
.mula-dragobj-sidebar::-webkit-scrollbar { width: 8px; }
.mula-dragobj-sidebar::-webkit-scrollbar-thumb { background: #bbb; border-radius: 4px; }
.mula-dragobj-sidebar::-webkit-scrollbar-track { background: transparent; }
.mula-dragobj-sidebar .mula-dragobj-thumb { width: 10vh; flex-shrink: 0; cursor: grab; border: 2px solid transparent; border-radius: 4px; }
.mula-dragobj-sidebar .mula-dragobj-thumb:hover { border-color: #e6381b; }
.mula-dragobj-compare { flex: 1; display: flex; flex-direction: row; gap: 1.5vh; padding: 1vh; justify-content: center; align-items: center; }
.mula-dragobj-compare .mula-compare-img { flex: 1; max-width: 90vw; height: 80vh; background-size: contain; background-repeat: no-repeat; background-position: center center; }
/* SPEC-04 D27: button row, caption and compare view share the painting's axis. The row that holds the
   painting also holds the layer panel (44 px + 2 x 0.5rem = 60 px) and the piece list (14vh), so the
   same width is taken off the right. If the list or panel width changes, this number must follow. */
.mula-dragobj-buttons, .mula-dragobj-wrapper > .mula-caption, .mula-dragobj-compare { padding-left: 0; padding-right: calc(14vh + 60px); }
.mula-dragobj-buttons { text-align: center; padding-top: 0.5rem; padding-bottom: 0.5rem; }
.mula-dragobj-buttons button { padding: 0.5rem 1.5rem; min-height: 44px; /* D15 */ background: #e6381b; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
.mula-dragobj-buttons button:hover { background: #c42f17; }

/* === RESPONSIVE / MOBILE === */
/* === REVEAL IMAGE GAME === */
.mula-reveal-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1vh; }
.mula-reveal-stage { position: relative; display: inline-block; max-width: 95vw; max-height: 80vh; }
.mula-reveal-bg { max-width: 95vw; max-height: 80vh; display: block; user-select: none; -webkit-user-drag: none; }
.mula-reveal-spot { position: absolute; cursor: pointer; border-radius: 4px; transition: background 0.2s; }
.mula-reveal-spot.debug { border: 2px dashed rgba(230,56,27,0.6); background: rgba(230,56,27,0.15); }
.mula-reveal-spot:not(.revealed):hover { background: rgba(255,255,255,0.1); }
.mula-reveal-spot img { width: 100%; height: 100%; display: block; opacity: 0; transition: opacity 0.35s ease; pointer-events: none; user-select: none; }
.mula-reveal-spot.revealed img { opacity: 1; }

/* === HIDDEN OBJECTS (SPOTLIGHT) GAME === */
.mula-hidden-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1vh; }
.mula-hidden-stage { position: relative; display: inline-block; max-width: 95vw; max-height: 80vh; cursor: none; touch-action: none; }
.mula-hidden-stage.no-hide-cursor { cursor: default; }
.mula-hidden-bg { max-width: 95vw; max-height: 80vh; display: block; user-select: none; -webkit-user-drag: none; }
.mula-hidden-fg {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; user-select: none; -webkit-user-drag: none;
  -webkit-mask-image: radial-gradient(circle at -100px -100px, black 0px, transparent 0px);
          mask-image: radial-gradient(circle at -100px -100px, black 0px, transparent 0px);
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
}
.mula-hidden-ring {
  position: absolute; pointer-events: none;
  border-radius: 50%; transform: translate(-50%, -50%);
  left: -9999px; top: -9999px;
  box-sizing: border-box;
}
.mula-hidden-spot { position: absolute; cursor: pointer; border-radius: 4px; }
.mula-hidden-spot.debug { border: 2px dashed rgba(230,56,27,0.6); background: rgba(230,56,27,0.15); }
.mula-hidden-spot.found { background: rgba(230,56,27,0.25); border: 2px solid #e6381b; }

/* === CLICK-THROUGH GAME === */
.mula-click-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1vh; }
.mula-click-stage { position: relative; display: inline-block; max-width: 95vw; max-height: 80vh; }
.mula-click-bg { max-width: 95vw; max-height: 80vh; display: block; user-select: none; -webkit-user-drag: none; }
.mula-click-spot { position: absolute; cursor: pointer; }
.mula-click-spot.debug { border: 2px dashed rgba(230,56,27,0.6); background: rgba(230,56,27,0.15); border-radius: 4px; }
.mula-click-spot img { width: 100%; height: 100%; display: block; pointer-events: none; user-select: none; -webkit-user-drag: none; }

/* === TIMED-PREVIEW GAME === */
.mula-timed-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1vh; }
.mula-timed-toolbar { display: flex; justify-content: center; padding: 0.5rem 0; }
.mula-timed-btn {
  padding: 0.5rem 1.5rem; min-height: 44px; /* D15: 44 px tap target */ background: #e6381b; color: #fff; border: none;
  border-radius: 4px; cursor: pointer; font-size: 0.95rem; font-weight: 600;
}
.mula-timed-btn:hover { background: #c42f17; }
.mula-timed-btn:disabled { background: #aaa; cursor: not-allowed; }
.mula-timed-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.85); z-index: 9000;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.mula-timed-overlay-img { max-width: 90vw; max-height: 80vh; display: block; }
.mula-timed-countdown {
  position: absolute; top: 20px; right: 30px;
  width: 60px; height: 60px; border-radius: 50%; background: #e6381b;
  color: #fff; font-size: 2rem; font-weight: bold;
  display: flex; align-items: center; justify-content: center;
}

/* === PDF VIEWER OVERLAY === */
.mula-pdf-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: #f4eddf; z-index: 10000; display: flex;
}
.mula-pdf-close {
  position: fixed; top: 12px; right: 12px; z-index: 10001;
  width: 44px; height: 44px; /* D15: 44 px tap target, icon stays 18 px */ border: none; cursor: pointer;
  background: rgba(0,0,0,0.08); border-radius: 50%; opacity: 0.7;
  display: flex; align-items: center; justify-content: center;
}
.mula-pdf-close:hover { opacity: 1; background: rgba(0,0,0,0.15); }
.mula-pdf-close svg { width: 18px; height: 18px; }
.mula-pdf-embed {
  width: 100%; height: 100%; border: none;
}

@media (max-width: 768px), (max-height: 500px) {
  /* SPEC-03: two images stay side by side on phone (D24); image cap 40vh -> 70vh (D23); captions stay (D25) */
  .mula-find-wrapper { overflow-y: auto; }
  .mula-find-column { max-width: 48%; }
  .mula-find-column.single { max-width: 95%; }
  .mula-find-column img { max-width: 45vw !important; max-height: 70vh !important; }
  .mula-find-column.single img { max-width: 90vw !important; }
  .mula-timed-wrapper .mula-find-column img { max-height: 60vh !important; } /* D26: preview button above needs the room */
  /* SPEC-04 D27: phone keeps the desktop row: painting left, piece list (50 px thumbs) and layer panel right */
  .mula-dragobj-sidebar { width: calc(50px + 1rem); max-height: 70vh; padding: 0.5rem; gap: 0.5rem; }
  .mula-dragobj-sidebar .mula-dragobj-thumb { width: 50px; flex-shrink: 0; }
  .mula-dragobj-buttons, .mula-dragobj-wrapper > .mula-caption, .mula-dragobj-compare { padding-right: calc(50px + 1rem + 60px); } /* list + panel, see above */
  .mula-dragobj-compare .mula-compare-img { height: 70vh; } /* D28 */
  /* SPEC-05 D32: phone keeps the desktop row: canvas left, texture column (50 px thumbs) right */
  .mula-3d-sidebar { width: calc(50px + 1rem); padding: 0.5rem; gap: 0.5rem; }
  .mula-3d-sidebar .mula-3d-thumb { width: 50px; flex-shrink: 0; }
  .mula-3d-wrapper > .mula-caption { padding-right: calc(50px + 1rem); } /* D33: column width, see above */
  .mula-task-bubble { width: 80vw; left: 10vw; padding: 0.75vh; align-content: center; } /* D20 */
  .mula-task-bubble .mula-btn-row:empty { display: none; } /* D20: no download button, no empty 2rem row */
  .mula-infobar { width: auto !important; }
  .mula-dragobj-canvas-wrap { max-height: 70vh; }
  .mula-dragobj-bg { max-height: 70vh; }
}
@media (orientation: portrait) and (max-width: 900px) {
  .mula-rotate-hint { display: flex !important; }
}
.mula-rotate-hint {
  display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.85); z-index: 99999; color: #fff;
  flex-direction: column; align-items: center; justify-content: center;
  font-size: 1.3rem; text-align: center; padding: 2rem;
}
.mula-rotate-hint .mula-rotate-icon { font-size: 4rem; margin-bottom: 1rem; }
.mula-rotate-hint .mula-rotate-dismiss { margin-top: 1.5rem; padding: 0.5rem 1.5rem; min-height: 44px; /* D15 */ background: #e6381b; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
`;

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================
  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(k => {
      if (k === 'style' && typeof attrs[k] === 'object') Object.assign(e.style, attrs[k]);
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    if (children) {
      if (typeof children === 'string') e.textContent = children;
      else if (Array.isArray(children)) children.forEach(c => { if (c) e.appendChild(c); });
      else e.appendChild(children);
    }
    return e;
  }

  // SPEC-13 (D45): call onSize whenever the picture changes size, whatever caused it.
  // ResizeObserver watches the image itself; where a browser lacks it, window resize is the fallback.
  function watchImageSize(img, onSize) {
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(function () { onSize(); }).observe(img);
    } else {
      window.addEventListener('resize', onSize);
    }
  }

  // ============================================================
  // INFO BAR
  // ============================================================
  function createInfoBar(config) {
    const mulaAssetsPath = config.mulaAssetsPath || 'mula-assets/';
    const mulaImgSrc = mulaAssetsPath + 'Mula_doma.png';
    const closeIconSrc = mulaAssetsPath + 'icon-close-menu.svg';
    const chevronSrc = mulaAssetsPath + 'icon-chevron-right.svg';

    // Toggle button (stays fixed at left:0, always on top)
    const toggle = el('button', { class: 'mula-infobar-toggle', title: 'Atvērt izvēlni' });
    const chevronImg = el('img', { src: chevronSrc, alt: '>' });
    toggle.appendChild(chevronImg);

    // Navbar (slides out from behind the toggle, icons aligned right)
    const navbar = el('div', { class: 'mula-infobar' });
    const refreshBtn = el('button', { class: 'mula-btn-refresh', title: 'Sākt no jauna', onclick: () => location.reload() });
    navbar.appendChild(refreshBtn);
    if (config.pdfUrl) {
      const pdfBtn = el('button', { class: 'mula-btn-pdf', title: 'Metodiskie materiāli', onclick: () => openPdfOverlay(config.pdfUrl) });
      navbar.appendChild(pdfBtn);
    }

    // Size bar: 2x wider for comfortable display
    let btnCount = 1;
    if (config.pdfUrl) btnCount++;
    const barW = 50 + btnCount * 80 + 40;
    navbar.style.width = barW + 'px';

    // Task bubble
    const bubble = el('div', { class: 'mula-task-bubble' });
    const charImg = el('img', { class: 'mula-char', src: mulaImgSrc, alt: 'Mula' });
    const taskText = el('div', { class: 'mula-task-text' }, config.taskText || '');
    const closeBtn = el('button', { class: 'mula-close-btn', onclick: () => {
      bubble.classList.remove('visible');
      navbar.classList.remove('opened');
      toggle.classList.remove('hidden');
    }});
    const closeIcon = el('img', { src: closeIconSrc, alt: 'X' });
    closeBtn.appendChild(closeIcon);
    bubble.appendChild(charImg);
    bubble.appendChild(taskText);
    const btnRow = el('div', { class: 'mula-btn-row' });
    if (config.showDownload) {
      const dlBtn = el('button', { class: 'mula-btn-download', onclick: () => { if (config.onDownload) config.onDownload(); } });
      dlBtn.textContent = 'Saglabāt';
      btnRow.appendChild(dlBtn);
    }
    bubble.appendChild(btnRow);
    bubble.appendChild(closeBtn);

    toggle.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('opened');
      bubble.classList.toggle('visible', isOpen);
      // Arrow disappears when opened, reappears when closed
      toggle.classList.toggle('hidden', isOpen);
    });

    // Click on the bar itself to close
    navbar.addEventListener('click', (e) => {
      if (e.target === navbar) {
        navbar.classList.remove('opened');
        bubble.classList.remove('visible');
        toggle.classList.remove('hidden');
      }
    });

    document.body.appendChild(navbar);
    document.body.appendChild(toggle);
    document.body.appendChild(bubble);

    return { toggle, navbar, bubble };
  }

  // ============================================================
  // PDF OVERLAY VIEWER
  // ============================================================
  function openPdfOverlay(url) {
    // Remove existing overlay if any
    var existing = document.querySelector('.mula-pdf-overlay');
    if (existing) existing.remove();

    var overlay = el('div', { class: 'mula-pdf-overlay' });
    var closeBtn = el('button', { class: 'mula-pdf-close', title: 'Aizvērt' });
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.addEventListener('click', function () { overlay.remove(); });

    var iframe = el('iframe', { class: 'mula-pdf-embed', src: url });
    overlay.appendChild(closeBtn);
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);
  }

  // ============================================================
  // GAME: FIND OBJECTS
  // ============================================================
  // Single image mode:
  //   image: URL, caption: string, objects: [{x,y,w,h}]
  // Two images mode:
  //   imageLeft, imageRight, captionLeft, captionRight
  //   objectsLeft: [{x,y,w,h}], objectsRight: [{x,y,w,h}]
  // imageSize: {width, height} — coordinate system in px
  //
  // Global option:
  //   color: hex string (default '#e6381b') — highlight color
  //
  // Per-object options:
  //   alpha: number 0-100 — opacity % when found (default 20)
  //   alphaDebug: number 0-100 — show outline+fill before clicking (for positioning)
  //   fill: 0 or 1 — 0 = transparent (border only), 1 = filled (default 1)
  // ============================================================
  function initFindObjects(container, config) {
    var isSingle = !!config.image && !config.imageLeft;
    var color = config.color || '#e6381b';
    var iSize = config.imageSize || { width: 800, height: 600 };

    // Parse color hex to r,g,b for rgba usage
    function hexToRgb(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    }
    var rgb = hexToRgb(color);

    var wrapper = el('div', { class: 'mula-find-wrapper' });
    if (isSingle) wrapper.classList.add('single');

    // Build one column (image + caption + counter)
    function buildColumn(imgSrc, caption, objs, maxW) {
      var col = el('div', { class: 'mula-find-column' });
      if (isSingle) col.classList.add('single');
      var imgContainer = el('div', { class: 'mula-find-svg-container' });
      imgContainer.style.position = 'relative';
      var img = el('img', { src: imgSrc, draggable: 'false' });
      img.style.cssText = 'max-width:' + maxW + ';max-height:78vh;display:block;user-select:none;';
      imgContainer.appendChild(img);
      col.appendChild(imgContainer);
      if (caption) {
        col.appendChild(el('div', { class: 'mula-caption' }, caption));
      }
      return { col: col, imgContainer: imgContainer, img: img, objs: objs };
    }

    var columns = [];

    if (isSingle) {
      var objs = config.objects || [];
      columns.push(buildColumn(config.image, config.caption, objs, '85vw'));
    } else {
      var objsLeft = config.objectsLeft || config.objects || [];
      var objsRight = config.objectsRight || config.objects || [];
      columns.push(buildColumn(config.imageLeft, config.captionLeft, objsLeft, '45vw'));
      columns.push(buildColumn(config.imageRight, config.captionRight, objsRight, '45vw'));
    }

    columns.forEach(function (c) { wrapper.appendChild(c.col); });

    // One counter. Single image: inside the column as before. Two images: under both
    // paintings, centred (SPEC-11, D39).
    var footer = el('div', { class: 'mula-find-footer' });
    footer.appendChild(el('span', { class: 'mula-find-footer-label' }, 'Atrast'));
    var count = el('span', { class: 'mula-find-footer-count' }, '0');
    count.style.background = color;
    footer.appendChild(count);
    if (isSingle) columns[0].col.appendChild(footer); else wrapper.appendChild(footer);
    container.appendChild(wrapper);

    // Shared state (SPEC-11, D37): hotspot i on the left pairs with hotspot i on the right.
    // Finding either side marks both and counts once. An index that exists on one side only
    // counts alone. In single-image mode this is the old behaviour.
    var foundPairs = new Set();
    var foundCount = 0;
    var areasByColumn = columns.map(function () { return []; });

    function markFound(area, obj) {
      var objFill = typeof obj.fill === 'number' ? obj.fill : 1; // default 1 (filled)
      var a = typeof obj.alpha === 'number' ? obj.alpha / 100 : 0.2;
      area.style.borderColor = color;
      area.style.borderStyle = 'solid';
      area.style.background = objFill ? 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + a + ')' : 'transparent';
    }

    // Create click areas for each column
    columns.forEach(function (c, ci) {
      c.img.onload = function () {
        c.objs.forEach(function (obj, idx) {
          var area = el('div');
          var hasDebug = typeof obj.alphaDebug === 'number';

          // Initial style: if alphaDebug is set, show the area visibly
          var initBorder, initBg;
          if (hasDebug) {
            var da = obj.alphaDebug / 100;
            initBorder = '2px dashed rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + Math.max(da, 0.3) + ')';
            initBg = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + da + ')';
          } else {
            initBorder = '2px solid transparent';
            initBg = 'transparent';
          }

          area.style.cssText = 'position:absolute;cursor:pointer;border:' + initBorder + ';border-radius:4px;' +
            'background:' + initBg + ';';
          area.dataset.idx = idx;
          areasByColumn[ci][idx] = { area: area, obj: obj };
          if (foundPairs.has(idx)) markFound(area, obj); // the other side was found before this image loaded

          area.addEventListener('click', function () {
            if (foundPairs.has(idx)) return;
            foundPairs.add(idx);
            foundCount++;
            count.textContent = foundCount;
            areasByColumn.forEach(function (list) { if (list[idx]) markFound(list[idx].area, list[idx].obj); });
          });
          c.imgContainer.appendChild(area);
        });
        placeAreas(ci);
      };
      watchImageSize(c.img, function () { placeAreas(ci); }); // SPEC-13
    });

    // SPEC-13 (D43): hotspot boxes come from the picture's current size, at load and whenever
    // it changes. The elements stay, so found marks stay.
    function placeAreas(ci) {
      var img = columns[ci].img;
      var scaleX = img.clientWidth / iSize.width;
      var scaleY = img.clientHeight / iSize.height;
      areasByColumn[ci].forEach(function (a) {
        if (!a) return;
        a.area.style.left = (a.obj.x * scaleX) + 'px';
        a.area.style.top = (a.obj.y * scaleY) + 'px';
        a.area.style.width = (a.obj.w * scaleX) + 'px';
        a.area.style.height = (a.obj.h * scaleY) + 'px';
      });
    }
  }

  // ============================================================
  // GAME: OBJ VIEWER (3D model viewer with Three.js)
  // Config:
  //   objUrl, mtlUrl — initial model + material
  //   bgColor
  //   textures: [{ thumb, mtlUrl, label? }] — optional. If provided,
  //     a sidebar of clickable PNG previews is shown; clicking one
  //     swaps the MTL file on the already-loaded OBJ (cheap — no
  //     re-parsing of geometry).
  // ============================================================
  function initObjViewer(container, config) {
    const wrapper = el('div', { class: 'mula-3d-wrapper' });
    const area = el('div', { class: 'mula-3d-area' });
    const canvasContainer = el('div', { class: 'mula-3d-canvas-container' });
    const canvas = el('canvas');
    const preloader = el('div', { class: 'mula-3d-preloader' }, 'Ielādē 3D modeli...');
    canvasContainer.appendChild(canvas);
    canvasContainer.appendChild(preloader);
    area.appendChild(canvasContainer);

    const textures = Array.isArray(config.textures) ? config.textures : null;
    let sidebar = null;
    if (textures && textures.length) {
      sidebar = el('div', { class: 'mula-3d-sidebar' });
      area.appendChild(sidebar);
    }

    wrapper.appendChild(area);
    if (config.caption) wrapper.appendChild(el('div', { class: 'mula-caption' }, config.caption));
    container.appendChild(wrapper);

    const objUrl = config.objUrl || '';
    const mtlUrl = config.mtlUrl || '';
    const bgColor = config.bgColor || 0xF4EDDF;

    // Check if THREE is available
    if (typeof THREE === 'undefined') {
      preloader.textContent = 'Error: Three.js is not loaded. Include three.js, OBJLoader, MTLLoader, and OrbitControls.';
      return;
    }

    const width = window.innerWidth * 0.7;
    const height = window.innerHeight * 0.9 - 50;
    const scale = (width / height) / 7;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);

    const camera = new THREE.PerspectiveCamera(37, width / height, 0.1, 1000);
    camera.position.set(-10, 10, 37);
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.autoRotate = false;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.rotateSpeed = 0.5;
    controls.update();

    const light = new THREE.HemisphereLight(0xffffff, 0x2d2d2d, 1.5);
    scene.add(light);

    // Load model (first time: parse OBJ + MTL; later: swap MTL only)
    let object = null;
    let loadedObjText = null; // cached OBJ text for re-parsing with new MTL

    function applyMaterials(obj, materials) {
      obj.traverse(function (child) {
        if (child.isMesh) {
          var name = child.material && child.material.name;
          var mat = materials.create(name);
          if (mat) child.material = mat;
        }
      });
    }

    function loadMtlAndApply(newMtlUrl) {
      preloader.classList.remove('loaded');
      preloader.textContent = 'Mainām materiālu...';
      const mtlLoader = new THREE.MTLLoader();
      mtlLoader.load(newMtlUrl, function (materials) {
        materials.preload();
        if (object) {
          applyMaterials(object, materials);
          preloader.classList.add('loaded');
          renderer.render(scene, camera);
        } else {
          // First load — parse the OBJ with these materials
          const objLoader = new THREE.OBJLoader();
          objLoader.setMaterials(materials);
          objLoader.load(objUrl, function (obj) {
            obj.scale.set(scale, scale, scale);
            object = obj;
            scene.add(obj);
            preloader.classList.add('loaded');
            renderer.render(scene, camera);
          }, function (xhr) {
            if (xhr.total > 0) {
              const pct = Math.round(xhr.loaded / xhr.total * 100);
              preloader.textContent = 'Ielādē... ' + pct + '%';
            }
          }, function (err) {
            preloader.textContent = 'Kļūda ielādējot 3D modeli.';
            console.error('OBJ load error:', err);
          });
        }
      }, undefined, function (err) {
        preloader.textContent = 'Kļūda ielādējot materiālu.';
        console.error('MTL load error:', err);
      });
    }

    // Initial load
    loadMtlAndApply(mtlUrl);

    // Build texture sidebar
    if (sidebar) {
      textures.forEach(function (tex, idx) {
        var thumb = el('img', { class: 'mula-3d-thumb', src: tex.thumb, draggable: 'false' });
        if (tex.label) thumb.title = tex.label;
        if (idx === 0 && !config.mtlUrl) {
          // if student only provided textures (no initial mtlUrl), mark first active
        }
        // Mark the thumb that matches initial mtlUrl as active
        if (tex.mtlUrl === mtlUrl) thumb.classList.add('active');
        thumb.addEventListener('click', function () {
          sidebar.querySelectorAll('.mula-3d-thumb').forEach(function (t) { t.classList.remove('active'); });
          thumb.classList.add('active');
          loadMtlAndApply(tex.mtlUrl);
        });
        sidebar.appendChild(thumb);
      });
    }

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    window.addEventListener('resize', function () {
      const w = window.innerWidth * 0.7;
      const h = window.innerHeight * 0.9 - 50;
      const s = (w / h) / 7;
      if (object) object.scale.set(s, s, s);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // Store screenshot capability
    config._generateScreenshot = function () {
      return canvas.toDataURL('image/png');
    };
  }

  // ============================================================
  // GAME 5: DRAG OBJECTS (Free placement on painting with layer controls)
  // Config:
  //   backgroundImage: URL of the painting background
  //   objects: [{src}] — draggable piece image URLs (original size preserved)
  //   originalImage: URL of original painting for compare
  //   caption, taskText, pdfUrl
  // ============================================================
  function initDragObjects(container, config) {
    const outerWrapper = el('div', { class: 'mula-dragobj-wrapper' });
    const area = el('div', { class: 'mula-dragobj-area' });
    const canvasWrap = el('div', { class: 'mula-dragobj-canvas-wrap' });
    canvasWrap.style.position = 'relative';
    canvasWrap.style.overflow = 'hidden';
    const sidebar = el('div', { class: 'mula-dragobj-sidebar' });

    const bgImage = config.backgroundImage || '';
    const objects = config.objects || [];
    const originalImage = config.originalImage || '';

    // Background image
    const bgImg = el('img', { class: 'mula-dragobj-bg', src: bgImage, draggable: 'false' });
    canvasWrap.appendChild(bgImg);

    // Layer controls panel (right side, green with white SVG icons)
    const layerPanel = el('div', { class: 'mula-layer-panel' });
    var btnUp = el('button', { class: 'mula-layer-btn', title: 'Uz augšu' });
    btnUp.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>'; // original arrow_upward-24px.svg (D21, D22)
    var btnDown = el('button', { class: 'mula-layer-btn', title: 'Uz leju' });
    btnDown.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>'; // original arrow_downward-24px.svg (D21, D22)
    var btnDel = el('button', { class: 'mula-layer-btn', title: 'Dzēst' });
    btnDel.innerHTML = '<svg viewBox="0 0 32 32" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"><path d="M30 18 L16 5 2 18Z M2 25 L30 25"/></svg>'; // original icon-eject.svg (D21, D22)
    layerPanel.appendChild(btnUp);
    layerPanel.appendChild(btnDown);
    layerPanel.appendChild(btnDel);

    area.appendChild(canvasWrap);
    area.appendChild(layerPanel);
    area.appendChild(sidebar);
    outerWrapper.appendChild(area);

    // Compare & caption
    var btnContainer = el('div', { class: 'mula-dragobj-buttons' });
    if (originalImage) {
      var compareBtn = el('button', {}, 'Salīdzināt ar oriģinālu');
      btnContainer.appendChild(compareBtn);
      compareBtn.addEventListener('click', function () {
        var isOpen = compareView.style.display !== 'none';
        if (isOpen) {
          area.style.display = 'flex';
          compareView.style.display = 'none';
          compareBtn.textContent = 'Salīdzināt ar oriģinālu';
        } else {
          area.style.display = 'none';
          compareView.style.display = 'flex';
          compareBtn.textContent = 'Paslēpt oriģinālu';
        }
      });
    }
    outerWrapper.appendChild(btnContainer);
    if (config.caption) outerWrapper.appendChild(el('div', { class: 'mula-caption' }, config.caption));

    // Compare view — centered
    var compareView = el('div', { class: 'mula-dragobj-compare' });
    compareView.style.cssText = 'display:none;justify-content:center;align-items:center;';
    if (originalImage) {
      var compareOrig = el('div', { class: 'mula-compare-img' });
      compareOrig.style.backgroundImage = 'url(' + originalImage + ')';
      compareOrig.style.backgroundPosition = 'center center';
      compareView.appendChild(compareOrig);
    }
    outerWrapper.appendChild(compareView);
    container.appendChild(outerWrapper);

    var selectedPiece = null;
    var zCounter = 10;
    var placedPieces = [];

    function selectPiece(piece) {
      if (selectedPiece) selectedPiece.classList.remove('selected');
      selectedPiece = piece;
      if (piece) piece.classList.add('selected');
    }

    // Layer control handlers
    btnUp.addEventListener('click', function () {
      if (!selectedPiece) return;
      zCounter++;
      selectedPiece.style.zIndex = zCounter;
    });
    btnDown.addEventListener('click', function () {
      if (!selectedPiece) return;
      var z = parseInt(selectedPiece.style.zIndex || 10);
      selectedPiece.style.zIndex = Math.max(1, z - 1);
    });
    btnDel.addEventListener('click', function () {
      if (!selectedPiece) return;
      // Return the thumb to the sidebar list
      var src = selectedPiece.dataset.src;
      var thumbs = sidebar.querySelectorAll('.mula-dragobj-thumb');
      thumbs.forEach(function (t) {
        if (t.dataset.src === src) {
          t.style.display = '';
          t.style.opacity = '';
          t.style.pointerEvents = '';
        }
      });
      var idx = placedPieces.indexOf(selectedPiece);
      if (idx >= 0) placedPieces.splice(idx, 1);
      selectedPiece.remove();
      selectedPiece = null;
    });

    bgImg.onload = function () { setupPieces(); };

    // How much the bg image is scaled to fit the container, read at the moment it is needed
    // (SPEC-13: the painting can change size after load).
    function currentBgScale() {
      return Math.min(bgImg.clientWidth / bgImg.naturalWidth, bgImg.clientHeight / bgImg.naturalHeight);
    }

    // SPEC-13 (D44): dropped pieces keep their place and relative size on the painting when it
    // changes size. Positions are px inside the canvas wrap, so the painting's offset is part of it.
    var lastBg = null;
    function bgMetrics() {
      return { left: bgImg.offsetLeft, top: bgImg.offsetTop, w: bgImg.clientWidth, h: bgImg.clientHeight };
    }
    function rescalePieces() {
      var now = bgMetrics();
      if (!lastBg || !lastBg.w || !lastBg.h || !now.w || !now.h) { lastBg = now; return; }
      placedPieces.forEach(function (piece) {
        var l = parseFloat(piece.style.left) || 0, t = parseFloat(piece.style.top) || 0;
        var w = parseFloat(piece.style.width) || 0, h = parseFloat(piece.style.height) || 0;
        piece.style.left = (now.left + (l - lastBg.left) / lastBg.w * now.w) + 'px';
        piece.style.top = (now.top + (t - lastBg.top) / lastBg.h * now.h) + 'px';
        piece.style.width = (w / lastBg.w * now.w) + 'px';
        piece.style.height = (h / lastBg.h * now.h) + 'px';
      });
      lastBg = now;
    }
    watchImageSize(bgImg, rescalePieces);

    function setupPieces() {

      objects.forEach(function (obj) {
        var thumb = el('img', { class: 'mula-dragobj-thumb', src: obj.src, draggable: 'false' });
        thumb.dataset.src = obj.src;
        sidebar.appendChild(thumb);

        function startDragFromThumb(e) {
          e.preventDefault();
          // Remove thumb from the sidebar list — only one instance per object
          thumb.style.display = 'none';

          // Preload to get natural dimensions
          var tempImg = new Image();
          tempImg.onload = function () {
            // Scale the piece proportionally to the background image scaling (current, SPEC-13)
            var bgScale = currentBgScale();
            var w = tempImg.naturalWidth * bgScale;
            var h = tempImg.naturalHeight * bgScale;

            var piece = el('div', { class: 'mula-dragobj-piece' });
            piece.dataset.src = obj.src;
            piece.style.width = w + 'px';
            piece.style.height = h + 'px';
            piece.style.position = 'absolute';
            piece.style.zIndex = ++zCounter;

            var pieceImg = el('img', { src: obj.src, draggable: 'false' });
            piece.appendChild(pieceImg);

            // Place centered on the bg image
            var bgLeft = bgImg.offsetLeft;
            var bgTop = bgImg.offsetTop;
            var bgRect = bgImg.getBoundingClientRect();
            piece.style.left = (bgLeft + (bgRect.width - w) / 2) + 'px';
            piece.style.top = (bgTop + (bgRect.height - h) / 2) + 'px';

            canvasWrap.appendChild(piece);
            placedPieces.push(piece);
            selectPiece(piece);
            makeDraggable(piece);
          };
          tempImg.src = obj.src;
        }

        thumb.addEventListener('mousedown', startDragFromThumb);
        thumb.addEventListener('touchstart', startDragFromThumb, { passive: false });
      });
    }

    function makeDraggable(piece) {
      piece.addEventListener('mousedown', function (e) {
        e.preventDefault();
        selectPiece(piece);
        beginDrag(piece, e);
      });
      piece.addEventListener('touchstart', function (e) {
        e.preventDefault();
        selectPiece(piece);
        beginDrag(piece, e);
      }, { passive: false });
    }

    function beginDrag(piece, e) {
      var t = e.touches ? e.touches[0] : e;
      var startLeft = parseFloat(piece.style.left) || 0;
      var startTop = parseFloat(piece.style.top) || 0;
      var startX = t.clientX;
      var startY = t.clientY;

      // Boundaries: keep piece within bgImg area
      var bgLeft = bgImg.offsetLeft;
      var bgTop = bgImg.offsetTop;
      var bgRight = bgLeft + bgImg.clientWidth;
      var bgBottom = bgTop + bgImg.clientHeight;
      var pw = piece.clientWidth;
      var ph = piece.clientHeight;

      function onMove(ev) {
        ev.preventDefault();
        var tt = ev.touches ? ev.touches[0] : ev;
        var dx = tt.clientX - startX;
        var dy = tt.clientY - startY;
        var newL = startLeft + dx;
        var newT = startTop + dy;
        // Clamp to bg image bounds
        newL = Math.max(bgLeft, Math.min(newL, bgRight - pw));
        newT = Math.max(bgTop, Math.min(newT, bgBottom - ph));
        piece.style.left = newL + 'px';
        piece.style.top = newT + 'px';
      }
      function onEnd() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    }
  }

  // ============================================================
  // GAME: REVEAL IMAGE
  // Background image with invisible clickable spots defined by student.
  // Each spot reveals its own image (scaled to the spot's box).
  // Coordinates are in the background image's natural px space and
  // scale proportionally with the background on resize.
  //
  // Config:
  //   type: 'reveal-image'
  //   image: URL of background image
  //   imageSize: { width, height } — natural px coordinate system
  //   objects: [{ x, y, w, h, image }]  — image shown when clicked
  //   caption, taskText, pdfUrl
  //   debug: true — show spot outlines while positioning
  //   revealOnce: true (default) — once revealed stays revealed; false = toggle
  // ============================================================
  function initRevealImage(container, config) {
    var iSize = config.imageSize || { width: 800, height: 600 };
    var objs = config.objects || [];
    var debug = !!config.debug;
    var revealOnce = config.revealOnce !== false;

    var wrapper = el('div', { class: 'mula-reveal-wrapper' });
    var stage = el('div', { class: 'mula-reveal-stage' });
    var bgImg = el('img', { class: 'mula-reveal-bg', src: config.image, draggable: 'false' });
    stage.appendChild(bgImg);
    wrapper.appendChild(stage);
    if (config.caption) wrapper.appendChild(el('div', { class: 'mula-caption' }, config.caption));
    container.appendChild(wrapper);

    var spots = [];

    function layoutSpots() {
      var scaleX = bgImg.clientWidth / iSize.width;
      var scaleY = bgImg.clientHeight / iSize.height;
      spots.forEach(function (s) {
        s.el.style.left   = (s.obj.x * scaleX) + 'px';
        s.el.style.top    = (s.obj.y * scaleY) + 'px';
        s.el.style.width  = (s.obj.w * scaleX) + 'px';
        s.el.style.height = (s.obj.h * scaleY) + 'px';
      });
    }

    function buildSpots() {
      objs.forEach(function (obj) {
        var spot = el('div', { class: 'mula-reveal-spot' + (debug ? ' debug' : '') });
        if (obj.image) {
          var img = el('img', { src: obj.image, draggable: 'false' });
          spot.appendChild(img);
        }
        spot.addEventListener('click', function () {
          if (revealOnce) {
            spot.classList.add('revealed');
          } else {
            spot.classList.toggle('revealed');
          }
        });
        stage.appendChild(spot);
        spots.push({ el: spot, obj: obj });
      });
      layoutSpots();
    }

    if (bgImg.complete && bgImg.naturalWidth) {
      buildSpots();
    } else {
      bgImg.onload = buildSpots;
    }

    watchImageSize(bgImg, layoutSpots); // SPEC-13 (D45): the picture itself is watched
  }

  // ============================================================
  // GAME: HIDDEN OBJECTS (SPOTLIGHT)
  // A foreground image is hidden; only a circular area around the cursor
  // is visible (like a flashlight) revealing the foreground image on top
  // of a visible background image.
  // Optionally combined with find-objects: clickable spots that get
  // marked as found and incremented in a counter.
  //
  // Config:
  //   type: 'hidden-objects'
  //   image: URL of VISIBLE background image (what user sees always)
  //   hiddenImage: URL of the image revealed by the spotlight
  //   imageSize: { width, height } — natural px coordinate system
  //   radius: spotlight radius in px (default 90)
  //   feather: soft edge width in px (default 20)
  //   hideCursor: boolean (default true) — hide OS cursor over the stage
  //   objects: [{x,y,w,h,label}] — optional clickable "find" spots
  //   color: hex for find highlight (default '#e6381b')
  //   debug: show spot outlines while positioning
  //   caption, taskText, pdfUrl
  // ============================================================
  function initHiddenObjects(container, config) {
    var iSize = config.imageSize || { width: 800, height: 600 };
    var radius = typeof config.radius === 'number' ? config.radius : 90;
    var feather = typeof config.feather === 'number' ? config.feather : 20;
    var hideCursor = config.hideCursor !== false;
    var ringWidth = typeof config.ringWidth === 'number' ? config.ringWidth : 2;
    var ringColor = config.ringColor || '#2196F3';
    var objs = config.objects || [];
    var color = config.color || '#e6381b';
    var debug = !!config.debug;
    var hasFind = objs.length > 0;

    var wrapper = el('div', { class: 'mula-hidden-wrapper' });
    var stage = el('div', { class: 'mula-hidden-stage' });
    if (!hideCursor) stage.classList.add('no-hide-cursor');

    var bgImg = el('img', { class: 'mula-hidden-bg', src: config.image, draggable: 'false' });
    var fgImg = el('img', { class: 'mula-hidden-fg', src: config.hiddenImage, draggable: 'false' });
    stage.appendChild(bgImg);
    stage.appendChild(fgImg);

    // Spotlight ring (visual circle around the reveal area)
    var ring = el('div', { class: 'mula-hidden-ring' });
    if (ringWidth > 0) {
      ring.style.width = (radius * 2) + 'px';
      ring.style.height = (radius * 2) + 'px';
      ring.style.border = ringWidth + 'px solid ' + ringColor;
    }
    stage.appendChild(ring);
    wrapper.appendChild(stage);

    // Optional find-objects footer (counter)
    var count = null, foundSet = null;
    if (hasFind) {
      foundSet = new Set();
      var footer = el('div', { class: 'mula-find-footer' });
      var label = el('span', { class: 'mula-find-footer-label' }, 'Atrast');
      count = el('span', { class: 'mula-find-footer-count' }, '0');
      count.style.background = color;
      footer.appendChild(label);
      footer.appendChild(count);
      wrapper.appendChild(footer);
    }

    if (config.caption) wrapper.appendChild(el('div', { class: 'mula-caption' }, config.caption));
    container.appendChild(wrapper);

    // Spot elements (scaled with bg on resize)
    var spots = [];

    function layoutSpots() {
      var scaleX = bgImg.clientWidth / iSize.width;
      var scaleY = bgImg.clientHeight / iSize.height;
      spots.forEach(function (s) {
        s.el.style.left   = (s.obj.x * scaleX) + 'px';
        s.el.style.top    = (s.obj.y * scaleY) + 'px';
        s.el.style.width  = (s.obj.w * scaleX) + 'px';
        s.el.style.height = (s.obj.h * scaleY) + 'px';
      });
    }

    function buildSpots() {
      objs.forEach(function (obj, idx) {
        var spot = el('div', { class: 'mula-hidden-spot' + (debug ? ' debug' : '') });
        if (obj.label) spot.title = obj.label;
        spot.addEventListener('click', function (e) {
          e.stopPropagation();
          if (foundSet.has(idx)) return;
          foundSet.add(idx);
          count.textContent = foundSet.size;
          spot.classList.add('found');
        });
        stage.appendChild(spot);
        spots.push({ el: spot, obj: obj });
      });
      layoutSpots();
    }

    // Spotlight mask update
    function setSpotlight(x, y) {
      // x,y are in stage-local pixel coords (or negative to hide)
      var inner = Math.max(0, radius - feather);
      var outer = radius;
      var mask = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, ' +
                 'black ' + inner + 'px, transparent ' + outer + 'px)';
      fgImg.style.webkitMaskImage = mask;
      fgImg.style.maskImage = mask;
      if (ringWidth > 0) {
        ring.style.left = x + 'px';
        ring.style.top = y + 'px';
      }
    }

    function hideSpotlight() {
      setSpotlight(-9999, -9999);
      ring.style.left = '-9999px';
      ring.style.top = '-9999px';
    }

    function onMove(e) {
      var t = e.touches ? e.touches[0] : e;
      var rect = stage.getBoundingClientRect();
      var x = t.clientX - rect.left;
      var y = t.clientY - rect.top;
      setSpotlight(x, y);
    }

    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', hideSpotlight);
    stage.addEventListener('touchstart', onMove, { passive: true });
    stage.addEventListener('touchmove', onMove, { passive: true });
    stage.addEventListener('touchend', hideSpotlight);

    function init() {
      hideSpotlight();
      if (hasFind) buildSpots();
    }

    if (bgImg.complete && bgImg.naturalWidth) init();
    else bgImg.onload = init;

    watchImageSize(bgImg, layoutSpots); // SPEC-13 (D45): the picture itself is watched
  }

  // ============================================================
  // GAME: CLICK-THROUGH
  // Clickable hotspots on a background. Each click cycles to the next
  // image in that spot's `images` array. Useful for "try variants"
  // style exercises (e.g., repaint the same vase with different colors).
  //
  // Config:
  //   type: 'click-through'
  //   image: URL of background image
  //   imageSize: { width, height } — natural px coordinate system
  //   objects: [{
  //     x, y, w, h,
  //     images: [url, url, url, ...],  // cycles on each click
  //     startIndex: 0,                  // optional, initial shown image (default 0 = first)
  //     loop: true                      // optional, wrap around (default true)
  //   }]
  //   caption, taskText, pdfUrl, debug
  // ============================================================
  function initClickThrough(container, config) {
    var iSize = config.imageSize || { width: 800, height: 600 };
    var objs = config.objects || [];
    var debug = !!config.debug;

    var wrapper = el('div', { class: 'mula-click-wrapper' });
    var stage = el('div', { class: 'mula-click-stage' });
    var bgImg = el('img', { class: 'mula-click-bg', src: config.image, draggable: 'false' });
    stage.appendChild(bgImg);
    wrapper.appendChild(stage);
    if (config.caption) wrapper.appendChild(el('div', { class: 'mula-caption' }, config.caption));
    container.appendChild(wrapper);

    var spots = [];

    function layoutSpots() {
      var scaleX = bgImg.clientWidth / iSize.width;
      var scaleY = bgImg.clientHeight / iSize.height;
      spots.forEach(function (s) {
        s.el.style.left   = (s.obj.x * scaleX) + 'px';
        s.el.style.top    = (s.obj.y * scaleY) + 'px';
        s.el.style.width  = (s.obj.w * scaleX) + 'px';
        s.el.style.height = (s.obj.h * scaleY) + 'px';
      });
    }

    function buildSpots() {
      objs.forEach(function (obj) {
        var imgs = obj.images || [];
        if (!imgs.length) return;
        var loop = obj.loop !== false;
        var idx = typeof obj.startIndex === 'number' ? obj.startIndex : 0;
        if (idx < 0 || idx >= imgs.length) idx = 0;

        var spot = el('div', { class: 'mula-click-spot' + (debug ? ' debug' : '') });
        var img = el('img', { src: imgs[idx], draggable: 'false' });
        spot.appendChild(img);

        spot.addEventListener('click', function () {
          idx++;
          if (idx >= imgs.length) {
            if (loop) idx = 0;
            else { idx = imgs.length - 1; return; }
          }
          img.src = imgs[idx];
        });

        stage.appendChild(spot);
        spots.push({ el: spot, obj: obj });
      });
      layoutSpots();
    }

    if (bgImg.complete && bgImg.naturalWidth) buildSpots();
    else bgImg.onload = buildSpots;

    watchImageSize(bgImg, layoutSpots); // SPEC-13 (D45): the picture itself is watched
  }

  // ============================================================
  // GAME: TIMED-PREVIEW
  // Find-objects variant with a "Apskati oriģinālu" button that shows
  // the original image fullscreen for N seconds with a visible countdown,
  // then hides it. Player then finds missing objects on the modified image.
  //
  // Config:
  //   type: 'timed-preview'
  //   image: URL of modified image (what player explores)
  //   originalImage: URL shown during preview
  //   previewSeconds: 5 — how long the preview stays (default 5)
  //   imageSize: { width, height }
  //   objects: [{ x, y, w, h, alpha?, alphaDebug?, fill? }]  — same as find-objects
  //   color: hex for highlight (default '#e6381b')
  //   previewLabel: 'Apskati oriģinālu' (default)
  //   previewsAllowed: number (default Infinity) — how many times they can peek
  //   caption, taskText, pdfUrl, debug
  // ============================================================
  function initTimedPreview(container, config) {
    var iSize = config.imageSize || { width: 800, height: 600 };
    var objs = config.objects || [];
    var color = config.color || '#e6381b';
    var previewSeconds = typeof config.previewSeconds === 'number' ? config.previewSeconds : 5;
    var previewLabel = config.previewLabel || 'Apskati oriģinālu';
    var previewsAllowed = typeof config.previewsAllowed === 'number' ? config.previewsAllowed : Infinity;
    var debug = !!config.debug;

    function hexToRgb(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    }
    var rgb = hexToRgb(color);

    var wrapper = el('div', { class: 'mula-timed-wrapper' });

    // Preview button
    var toolbar = el('div', { class: 'mula-timed-toolbar' });
    var previewBtn = el('button', { class: 'mula-timed-btn' }, previewLabel);
    toolbar.appendChild(previewBtn);
    wrapper.appendChild(toolbar);

    // Build image column (reusing find-objects style)
    var column = el('div', { class: 'mula-find-column single' });
    var imgContainer = el('div', { class: 'mula-find-svg-container' });
    imgContainer.style.position = 'relative';
    var mainImg = el('img', { src: config.image, draggable: 'false' });
    mainImg.style.cssText = 'max-width:85vw;max-height:70vh;display:block;user-select:none;';
    imgContainer.appendChild(mainImg);
    column.appendChild(imgContainer);
    if (config.caption) column.appendChild(el('div', { class: 'mula-caption' }, config.caption));

    var footer = el('div', { class: 'mula-find-footer' });
    var label = el('span', { class: 'mula-find-footer-label' }, 'Atrast');
    var countEl = el('span', { class: 'mula-find-footer-count' }, '0');
    countEl.style.background = color;
    footer.appendChild(label);
    footer.appendChild(countEl);
    column.appendChild(footer);

    wrapper.appendChild(column);
    container.appendChild(wrapper);

    // Build find-object click areas (same as find-objects logic)
    var foundSet = new Set();
    var foundCount = 0;

    var timedAreas = [];
    mainImg.onload = function () {
      objs.forEach(function (obj, idx) {
        var area = el('div');
        var hasDebug = debug || typeof obj.alphaDebug === 'number';
        var objFill = typeof obj.fill === 'number' ? obj.fill : 1;

        var initBorder, initBg;
        if (hasDebug) {
          var da = (typeof obj.alphaDebug === 'number' ? obj.alphaDebug : 30) / 100;
          initBorder = '2px dashed rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + Math.max(da, 0.3) + ')';
          initBg = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + da + ')';
        } else {
          initBorder = '2px solid transparent';
          initBg = 'transparent';
        }

        area.style.cssText = 'position:absolute;cursor:pointer;border:' + initBorder + ';border-radius:4px;' +
          'background:' + initBg + ';';
        timedAreas.push({ area: area, obj: obj });

        area.addEventListener('click', function () {
          if (foundSet.has(idx)) return;
          foundSet.add(idx);
          foundCount++;
          countEl.textContent = foundCount;
          var a = typeof obj.alpha === 'number' ? obj.alpha / 100 : 0.2;
          area.style.borderColor = color;
          area.style.borderStyle = 'solid';
          if (objFill) {
            area.style.background = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + a + ')';
          } else {
            area.style.background = 'transparent';
          }
        });
        imgContainer.appendChild(area);
      });
      placeTimedAreas();
    };
    watchImageSize(mainImg, placeTimedAreas); // SPEC-13

    // SPEC-13 (D43): same as find-objects, boxes follow the picture, elements stay.
    function placeTimedAreas() {
      var scaleX = mainImg.clientWidth / iSize.width;
      var scaleY = mainImg.clientHeight / iSize.height;
      timedAreas.forEach(function (a) {
        a.area.style.left = (a.obj.x * scaleX) + 'px';
        a.area.style.top = (a.obj.y * scaleY) + 'px';
        a.area.style.width = (a.obj.w * scaleX) + 'px';
        a.area.style.height = (a.obj.h * scaleY) + 'px';
      });
    }

    // Preview overlay logic
    var previewsUsed = 0;
    previewBtn.addEventListener('click', function () {
      if (previewsUsed >= previewsAllowed) return;
      previewsUsed++;

      var overlay = el('div', { class: 'mula-timed-overlay' });
      var origImg = el('img', { class: 'mula-timed-overlay-img', src: config.originalImage, draggable: 'false' });
      var countdown = el('div', { class: 'mula-timed-countdown' }, String(previewSeconds));
      overlay.appendChild(origImg);
      overlay.appendChild(countdown);
      document.body.appendChild(overlay);

      var remaining = previewSeconds;
      var timer = setInterval(function () {
        remaining--;
        if (remaining <= 0) {
          clearInterval(timer);
          overlay.remove();
          if (previewsUsed >= previewsAllowed) {
            previewBtn.disabled = true;
          }
        } else {
          countdown.textContent = String(remaining);
        }
      }, 1000);
    });
  }

  // ============================================================
  // MAIN API
  // ============================================================
  const MulaEngine = {
    /**
     * Initialize a game.
     * @param {string|HTMLElement} target - CSS selector or DOM element
     * @param {Object} config - Game configuration
     * @param {string} config.type - 'find-objects'|'obj-viewer'|'drag-objects'|'reveal-image'|'hidden-objects'|'click-through'|'timed-preview'
     *
     * Find-objects (single image):
     *   image, caption, objects:[{x,y,w,h}], imageSize:{width,height}
     * Find-objects (two images):
     *   imageLeft, imageRight, captionLeft, captionRight,
     *   objectsLeft:[{x,y,w,h}], objectsRight:[{x,y,w,h}], imageSize
     * Find-objects options: color (hex), fill (bool), debug (bool)
     *
     * Drag-objects: backgroundImage, objects:[{src}], originalImage
     * Obj-viewer: objUrl, mtlUrl, bgColor, textures:[{thumb,mtlUrl,label}]
     * Reveal-image: image, imageSize:{width,height}, objects:[{x,y,w,h,image}], debug, revealOnce
     * Hidden-objects: image, hiddenImage, imageSize, radius, feather, hideCursor,
     *                 ringWidth, ringColor, objects:[{x,y,w,h,label}] (optional), color, debug
     * Click-through: image, imageSize, objects:[{x,y,w,h,images:[urls],startIndex,loop}], debug
     * Timed-preview: image, originalImage, previewSeconds, previewLabel, previewsAllowed,
     *                imageSize, objects:[{x,y,w,h,alpha,fill}], color, debug
     * Common: taskText, pdfUrl, mulaAssetsPath, checkOrientation
     */
    init: function (target, config) {
      injectCSS();

      const container = typeof target === 'string' ? document.querySelector(target) : target;
      if (!container) {
        console.error('MulaEngine: Target element not found:', target);
        return;
      }

      container.classList.add('mula-game-container');
      const gameArea = el('div', { class: 'mula-game-area' });
      container.appendChild(gameArea);

      // Rotation hint for portrait on mobile
      if (config.checkOrientation !== false) {
        const hint = el('div', { class: 'mula-rotate-hint' });
        hint.innerHTML = '<div class="mula-rotate-icon">&#128257;</div>' +
          '<div>Lūdzu, pagrieziet ierīci horizontāli!</div>' +
          '<button class="mula-rotate-dismiss">Turpināt tāpat</button>';
        document.body.appendChild(hint);
        hint.querySelector('.mula-rotate-dismiss').addEventListener('click', function () {
          hint.style.display = 'none';
        });
        window.addEventListener('resize', function () {
          if (window.innerWidth > window.innerHeight) hint.style.display = 'none';
        });
      }

      // Create info bar
      createInfoBar(config);

      // Initialize game by type
      switch (config.type) {
        case 'find-objects':
          initFindObjects(gameArea, config);
          break;
        case 'obj-viewer':
          initObjViewer(gameArea, config);
          break;
        case 'drag-objects':
          initDragObjects(gameArea, config);
          break;
        case 'reveal-image':
          initRevealImage(gameArea, config);
          break;
        case 'hidden-objects':
          initHiddenObjects(gameArea, config);
          break;
        case 'click-through':
          initClickThrough(gameArea, config);
          break;
        case 'timed-preview':
          initTimedPreview(gameArea, config);
          break;
        default:
          console.error('MulaEngine: Unknown game type:', config.type);
      }
    },

    version: '1.7.0'
  };

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MulaEngine;
  } else {
    root.MulaEngine = MulaEngine;
  }

})(typeof window !== 'undefined' ? window : this);