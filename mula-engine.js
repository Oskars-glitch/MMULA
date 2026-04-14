/**
 * Mazā Mula Game Engine v1.1
 * Standalone JavaScript game engine for educational art games.
 * Supports 3 game types: find-objects, obj-viewer, drag-objects
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
.mula-infobar-toggle.hidden { opacity: 0; pointer-events: none; }
.mula-infobar {
  position: fixed; left: -100%; bottom: 50px; z-index: 6000;
  height: 50px; border-radius: 0 100px 100px 0;
  background-color: #4CAF50; display: flex; align-items: center;
  justify-content: flex-end;
  padding: 0 1.5rem; gap: 1rem; transition: left 0.5s ease;
}
.mula-infobar.opened { left: 0; }
.mula-infobar button {
  background: none; border: none; cursor: pointer; width: 40px; height: 40px;
  background-repeat: no-repeat; background-size: 28px 28px; background-position: center;
  opacity: 0.9; padding: 0;
}
.mula-infobar button:hover { opacity: 1; }
.mula-infobar .mula-btn-refresh {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>');
}
.mula-infobar .mula-btn-pdf {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><circle cx="12" cy="8" r="5"/><path d="M3 21c0-4.97 4.03-9 9-9s9 4.03 9 9"/><path d="M12 11v4"/><path d="M10 6c0 0 .5-2 2-2s2 2 2 2"/><path d="M8.5 9.5l-1.5 1"/><path d="M15.5 9.5l1.5 1"/></svg>');
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
  position: absolute; top: -1.5vh; right: -20px; width: 36px; height: 36px;
  border: none; cursor: pointer; padding: 0; background: none;
}
.mula-task-bubble .mula-close-btn img { width: 100%; height: 100%; display: block; }
.mula-task-bubble .mula-btn-row { display: flex; justify-content: center; gap: 1rem; margin-left: auto; min-width: 1px; height: 2rem; }
.mula-task-bubble .mula-btn-download {
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>') no-repeat left center;
  background-size: 1.5rem; border: none; cursor: pointer; font-size: 0.9rem; color: #777;
  padding-left: 2.25rem; line-height: 2rem;
}
@keyframes mulaScaleIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }

/* === FIND OBJECTS GAME === */
.mula-find-wrapper { flex: 1; display: flex; flex-direction: row; align-items: flex-end; justify-content: center; gap: 1.5vh; padding: 1vh; }
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

/* === DRAG OBJECTS GAME === */
.mula-dragobj-wrapper { flex: 1; display: flex; flex-direction: column; }
.mula-dragobj-area { flex: 1; display: flex; flex-direction: row; position: relative; }
.mula-dragobj-canvas-wrap { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; }
.mula-dragobj-bg { max-width: 100%; max-height: 80vh; display: block; user-select: none; -webkit-user-drag: none; }
.mula-dragobj-piece { position: absolute; cursor: grab; user-select: none; }
.mula-dragobj-piece img { width: 100%; height: 100%; pointer-events: none; display: block; }
.mula-dragobj-piece.selected { outline: 2px solid #2196F3; outline-offset: 4px; }
.mula-layer-panel { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem; background: #4CAF50; border-radius: 8px; align-self: flex-start; margin-top: 1rem; }
.mula-layer-btn { width: 40px; height: 40px; background: transparent; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
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
.mula-dragobj-buttons { text-align: center; padding: 0.5rem; }
.mula-dragobj-buttons button { padding: 0.5rem 1.5rem; background: #e6381b; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
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

/* === PDF VIEWER OVERLAY === */
.mula-pdf-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: #f4eddf; z-index: 10000; display: flex;
}
.mula-pdf-close {
  position: fixed; top: 12px; right: 12px; z-index: 10001;
  width: 32px; height: 32px; border: none; cursor: pointer;
  background: rgba(0,0,0,0.08); border-radius: 50%; opacity: 0.7;
  display: flex; align-items: center; justify-content: center;
}
.mula-pdf-close:hover { opacity: 1; background: rgba(0,0,0,0.15); }
.mula-pdf-close svg { width: 18px; height: 18px; }
.mula-pdf-embed {
  width: 100%; height: 100%; border: none;
}

@media (max-width: 768px), (max-height: 500px) {
  .mula-find-wrapper { flex-direction: column; align-items: center; overflow-y: auto; }
  .mula-find-column { max-width: 95%; }
  .mula-find-column img { max-width: 90vw !important; max-height: 40vh !important; }
  .mula-dragobj-area { flex-direction: column; align-items: center; }
  .mula-dragobj-sidebar {
    width: 100%; flex-direction: row; overflow-x: auto; overflow-y: hidden;
    gap: 0.5rem; padding: 0.5rem; padding-left: 60px; justify-content: center;
  }
  .mula-dragobj-sidebar .mula-dragobj-thumb { width: 50px; flex-shrink: 0; }
  .mula-3d-area { flex-direction: column; align-items: center; }
  .mula-3d-sidebar {
    width: 100%; flex-direction: row; overflow-x: auto; overflow-y: hidden;
    max-height: none; gap: 0.5rem; padding: 0.5rem; justify-content: center;
  }
  .mula-3d-sidebar .mula-3d-thumb { width: 50px; flex-shrink: 0; }
  .mula-task-bubble { width: 80vw; left: 10vw; }
  .mula-infobar { width: auto !important; }
  .mula-layer-panel { flex-direction: row; align-self: center; margin-top: 0; order: 10; }
  .mula-dragobj-canvas-wrap { max-height: 70vh; width: 100%; }
  .mula-dragobj-bg { max-height: 70vh; max-width: 95vw; }
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
.mula-rotate-hint .mula-rotate-dismiss { margin-top: 1.5rem; padding: 0.5rem 1.5rem; background: #e6381b; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
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
      var footer = el('div', { class: 'mula-find-footer' });
      var label = el('span', { class: 'mula-find-footer-label' }, 'Atrast');
      var count = el('span', { class: 'mula-find-footer-count' }, '0');
      count.style.background = color;
      footer.appendChild(label);
      footer.appendChild(count);
      col.appendChild(footer);

      return { col: col, imgContainer: imgContainer, img: img, count: count, objs: objs };
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
    container.appendChild(wrapper);

    // Create click areas for each column
    columns.forEach(function (c) {
      var foundSet = new Set();
      var foundCount = 0;

      c.img.onload = function () {
        var scaleX = c.img.clientWidth / iSize.width;
        var scaleY = c.img.clientHeight / iSize.height;

        c.objs.forEach(function (obj, idx) {
          var area = el('div');
          var hasDebug = typeof obj.alphaDebug === 'number';
          var objFill = typeof obj.fill === 'number' ? obj.fill : 1; // default 1 (filled)

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
            'background:' + initBg + ';' +
            'left:' + (obj.x * scaleX) + 'px;top:' + (obj.y * scaleY) + 'px;' +
            'width:' + (obj.w * scaleX) + 'px;height:' + (obj.h * scaleY) + 'px;';
          area.dataset.idx = idx;

          area.addEventListener('click', function () {
            if (foundSet.has(idx)) return;
            foundSet.add(idx);
            foundCount++;
            c.count.textContent = foundCount;
            // Highlight: show border, fill only if fill !== 0
            var a = typeof obj.alpha === 'number' ? obj.alpha / 100 : 0.2;
            area.style.borderColor = color;
            area.style.borderStyle = 'solid';
            if (objFill) {
              area.style.background = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + a + ')';
            } else {
              area.style.background = 'transparent';
            }
          });
          c.imgContainer.appendChild(area);
        });
      };
    });
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
    btnUp.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="6" y1="5" x2="18" y2="5"/><polyline points="8 9 12 5 16 9"/></svg>';
    var btnDown = el('button', { class: 'mula-layer-btn', title: 'Uz leju' });
    btnDown.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="6" y1="19" x2="18" y2="19"/><polyline points="8 15 12 19 16 15"/></svg>';
    var btnDel = el('button', { class: 'mula-layer-btn', title: 'Dzēst' });
    btnDel.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>';
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

    function setupPieces() {
      // Calculate the scale factor: how much the bg image was scaled to fit the container
      var bgNatW = bgImg.naturalWidth;
      var bgNatH = bgImg.naturalHeight;
      var bgDispW = bgImg.clientWidth;
      var bgDispH = bgImg.clientHeight;
      var bgScale = Math.min(bgDispW / bgNatW, bgDispH / bgNatH);

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
            // Scale the piece proportionally to the background image scaling
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

    window.addEventListener('resize', layoutSpots);
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

    window.addEventListener('resize', layoutSpots);
  }

  // ============================================================
  // MAIN API
  // ============================================================
  const MulaEngine = {
    /**
     * Initialize a game.
     * @param {string|HTMLElement} target - CSS selector or DOM element
     * @param {Object} config - Game configuration
     * @param {string} config.type - 'find-objects'|'obj-viewer'|'drag-objects'|'reveal-image'|'hidden-objects'
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
        default:
          console.error('MulaEngine: Unknown game type:', config.type);
      }
    },

    version: '1.4.0'
  };

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MulaEngine;
  } else {
    root.MulaEngine = MulaEngine;
  }

})(typeof window !== 'undefined' ? window : this);