const artwork = [
  'images/artwork/angel.webp',
  'images/artwork/bonzi.webp',
  'images/artwork/china.webp',
  'images/artwork/daggers.webp',
  'images/artwork/dnd.webp',
  'images/artwork/drg.webp',
  'images/artwork/elephant.webp',
  'images/artwork/engi.webp',
  'images/artwork/forro.webp',
  'images/artwork/ghosts.webp',
  'images/artwork/indios.webp',
  'images/artwork/linda.webp',
  'images/artwork/mgs.webp',
  'images/artwork/mickey.webp',
  'images/artwork/moto.webp',
  'images/artwork/mural.webp',
  'images/artwork/WEIWEI.webp',
  'images/artwork/samurai.webp',
  'images/artwork/selknam.webp',
  'images/artwork/tarako.webp',
  'images/artwork/tesla.webp',
  'images/artwork/toribash.webp',
  'images/artwork/toris.webp',
  'images/artwork/venequidad.webp',
  'images/artwork/yeule.webp'
];

const artworkDefinitions = {
  angel: { title: 'ANGEL', subtitle: 'Digital commission for Tristan', description: '2022' },
  bonzi: { title: 'BONZI', subtitle: '21cm x 14.8cm [8.27" x 5.8"]', description: 'November 2023' },
  china: { title: 'CH#1', subtitle: '14.8cm x 10.5cm [5.83" x 4.13"]', description: 'December 2021' },
  daggers: { title: 'DAGGERS', subtitle: '21.6cm x 27.9cm [8.5"x11"]', description: 'Tattoo concept, April 2023' },
  dnd: { title: 'THE END OF IT ALL', subtitle: 'Digital commission for Hal', description: '2022' },
  drg: { title: 'MISSION CONTROLLED', subtitle: 'Digital commission for Confixil', description: '2023' },
  elephant: { title: 'POOKIEPHANT', subtitle: '30cm x 21.6cm [11" x 8"]', description: 'September 2022' },
  engi: { title: 'ENGINEER', subtitle: 'Digital commission for Hal', description: '2021' },
  forro: { title: 'CASE', subtitle: '15.8cm x 7.4cm [6.5"x3"]', description: 'April 2022' },
  indios: { title: 'INDIOS', subtitle: '30cm x 21.6cm [11" x 8"]', description: 'January 2025' },
  linda: { title: 'LINDA EVANGELISTA', subtitle: '15.8cm x 7.4cm [6.5"x3"]', description: 'December 2021' },
  mgs: { title: 'MGS', subtitle: '2m x 4m [6\'6" x 13\' 1"]', description: 'November 2024' },
  moto: { title: 'MOTO', subtitle: '30cm x 21.6cm [11" x 8"]', description: 'September 2022' },
  mural: { title: 'HAVEN', subtitle: '2m x 4.5m [6\'6" x 14\'9"]', description: 'April 2022' },
  WEIWEI: { title: 'WEIWEI', subtitle: "27.9cm x 21.6cm [11' x 8.5']", description: 'November 2023' },
  mickey: { title: 'MICKEY', subtitle: "14.8cm x 10.5cm [5.83\" x 4.13\"]", description: '2020' },
  ghosts: { title: 'GHOSTS', subtitle: "Digital commission for Cragma", description: 'June 2026' },
  samurai: { title: 'MINAMOTO', subtitle: 'Digital commission for Hal', description: '2021' },
  selknam: { title: 'SELKNAM', subtitle: '21cm x 14.8cm [8.27\" x 5.8\"]', description: 'February 2022' },
  tarako: { title: 'TARAKO', subtitle: '45cm x 71cm [18\" x 28\"]', description: 'March 2026' },
  tesla: { title: 'NIKOLA', subtitle: '14.8cm x 10.5cm [5.83\" x 4.13\"]', description: 'December 2021' },
  toribash: { title: 'TORIBASH', subtitle: '2m x 5.5m [6\'6" x 18\']', description: 'June 2024' },
  toris: { title: 'TB WORLD CHAMPIONSHIP', subtitle: 'Digital', description: '2022' },
  venequidad: { title: 'VENEQUIDAD', subtitle: '21.6cm x 27.9cm [8.5"x11"]', description: 'January 2025' },
  yeule: { title: 'YEULE', subtitle: '21cm x 14.8cm [8.27" x 5.8"]', description: 'January 2022' }
};

function normalizeArtworkName(filename) {
  return filename.replace(/\.[^/.]+$/, '');
}

function prettyArtworkTitle(baseName) {
  return baseName.replace(/[_-]/g, ' ').toUpperCase();
}

const stage = document.getElementById('popup-stage');
let activePopup = null;
let pendingQueue = [];
let generationActive = true;
let popupInterval = null;
let rotationInterval = null;
let spawnedCount = 0;
let modalOverlay = null;
let highestPopupZIndex = 40;

function getHeaderHeight() {
  const header = document.querySelector('.topbar');
  return header ? header.getBoundingClientRect().height : 0;
}

function getSafeTopInset() {
  return Math.max(16, getHeaderHeight() - 48);
}

function getRandomPosition({ biasCenterTop = false } = {}) {
  const padding = 24;
  const safeTop = getSafeTopInset();
  const usableWidth = Math.max(220, (stage?.clientWidth || window.innerWidth) - padding * 2 - 220);
  const usableHeight = Math.max(180, (stage?.clientHeight || window.innerHeight) - padding * 2 - 220);

  if (biasCenterTop) {
    const stageWidth = stage?.clientWidth || window.innerWidth;
    const centerX = Math.max(padding, Math.min(stageWidth - padding - 220, stageWidth / 2 + (Math.random() - 0.5) * 140));
    return {
      x: centerX,
      y: safeTop + Math.random() * 80
    };
  }

  return {
    x: padding + Math.random() * usableWidth,
    y: safeTop + Math.random() * Math.max(0, usableHeight - safeTop)
  };
}

function clampPopupToStage(popup, x, y) {
  const minX = -200;
  const minY = getSafeTopInset();
  const maxX = Math.max(minX, (stage?.clientWidth || window.innerWidth) - popup.offsetWidth + 200);
  const maxY = Math.max(minY, (stage?.clientHeight || window.innerHeight) - popup.offsetHeight);
  const clampedX = Math.min(maxX, Math.max(minX, x));
  const clampedY = Math.min(maxY, Math.max(minY, y));
  popup.style.left = `${clampedX}px`;
  popup.style.top = `${clampedY}px`;
  return { x: clampedX, y: clampedY };
}

function bringPopupToFront(popup) {
  if (!popup) return;
  highestPopupZIndex += 1;
  popup.style.zIndex = `${highestPopupZIndex}`;
}

function syncStageHeight() {
  if (!stage) return;

  const popups = Array.from(stage.querySelectorAll('.art-popup'));
  const lowestBottom = popups.reduce((maxBottom, popup) => {
    const top = parseFloat(popup.style.top || 0) || 0;
    const popupBottom = top + (popup.offsetHeight || 0);
    return Math.max(maxBottom, popupBottom);
  }, getSafeTopInset());

  const viewportHeight = Math.max(window.innerHeight, stage.getBoundingClientRect().height || 0);
  const requiredHeight = Math.max(viewportHeight, lowestBottom + 140);
  stage.style.minHeight = `${requiredHeight}px`;
}

function buildQueue() {
  pendingQueue = [...artwork].sort(() => Math.random() - 0.5);
}

function ensureQueue() {
  if (pendingQueue.length) return;
  buildQueue();
}

function removePopup(popup, { respawn = false, delay = 2000 } = {}) {
  if (!popup || !popup.isConnected) return;

  popup.remove();
  if (activePopup === popup) {
    activePopup = null;
    document.body.classList.remove('popup-open');
    document.documentElement.classList.remove('popup-open');
  }

  syncStageHeight();

  if (respawn && generationActive) {
    window.setTimeout(() => {
      if (generationActive) {
        createPopup();
      }
    }, delay);
  }
}

function startRotationLoop() {
  if (!stage || !generationActive || rotationInterval) return;

  if (popupInterval) {
    window.clearInterval(popupInterval);
    popupInterval = null;
  }

  rotationInterval = window.setInterval(() => {
    const popups = Array.from(stage.querySelectorAll('.art-popup'));
    if (!popups.length) {
      if (generationActive) {
        createPopup();
      }
      return;
    }

    const oldest = popups[0];
    removePopup(oldest);
    if (generationActive) {
      createPopup();
    }
  }, 2000);
}

function ensureModal() {
  if (modalOverlay) return modalOverlay;

  modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.innerHTML = `
    <div class="modal-window" role="dialog" aria-modal="true">
      <button class="modal-close-button" type="button" aria-label="Close artwork">×</button>
      <div class="modal-media"></div>
      <aside class="modal-info"></aside>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay || event.target.classList.contains('modal-close-button')) {
      closeModal();
    }
  });

  return modalOverlay;
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
  document.body.classList.remove('popup-open');
  document.documentElement.classList.remove('popup-open');
  activePopup = null;
}

function openModal(src, filename) {
  const overlay = ensureModal();
  const media = overlay.querySelector('.modal-media');
  const info = overlay.querySelector('.modal-info');

  media.innerHTML = '';
  info.innerHTML = '';

  const image = document.createElement('img');
  image.src = src;
  image.alt = filename;
  media.appendChild(image);

  const baseName = normalizeArtworkName(filename);
  const def = artworkDefinitions[baseName];

  const title = document.createElement('h2');
  title.textContent = def && def.title ? def.title : prettyArtworkTitle(baseName);
  info.appendChild(title);

  if (def && def.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.style.marginTop = '0.5rem';
    subtitle.style.fontWeight = '700';
    subtitle.textContent = def.subtitle;
    info.appendChild(subtitle);
  }

  const desc = document.createElement('p');
  desc.style.marginTop = '0.6rem';
  desc.textContent = (def && def.description) || 'A private viewing window for the selected work. The image is presented here in full, with the accompanying title and context to the right.';
  info.appendChild(desc);

  const closeHint = document.createElement('span');
  closeHint.className = 'modal-close-hint';
  closeHint.textContent = 'click outside to close';
  info.appendChild(closeHint);

  overlay.classList.add('open');
  document.body.classList.add('popup-open');
  document.documentElement.classList.add('popup-open');
}

function createPopup() {
  if (!stage || !generationActive) return;

  ensureQueue();
  if (!pendingQueue.length) {
    buildQueue();
  }
  if (!pendingQueue.length) {
    return;
  }

  const initialFill = spawnedCount < artwork.length;
  const biasCenterTop = initialFill && spawnedCount < 2;
  if (initialFill) {
    spawnedCount += 1;
  }

  const popup = document.createElement('article');
  popup.className = 'art-popup';
  popup.tabIndex = 0;
  popup.style.zIndex = '40';

  const src = pendingQueue.shift();
  const filename = src.split('/').pop();

  const closeButton = document.createElement('button');
  closeButton.className = 'popup-close-button';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close artwork');
  closeButton.textContent = '×';

  const positionCloseButton = () => {
    if (!popup.classList.contains('portrait')) {
      closeButton.style.right = '0.6rem';
      return;
    }

    const imageWidth = img.offsetWidth || 0;
    const inset = Math.max(0.6, (popup.offsetWidth - imageWidth) / 2 - 0.6);
    closeButton.style.right = `${inset}px`;
  };

  const img = document.createElement('img');
  img.src = src;
  img.alt = filename;
  img.loading = 'lazy';
  img.draggable = false;
  img.addEventListener('dragstart', (event) => event.preventDefault());
  img.addEventListener('load', () => {
    const isPortrait = img.naturalHeight > img.naturalWidth;
    popup.classList.toggle('portrait', isPortrait);
    popup.classList.toggle('landscape', !isPortrait);
    requestAnimationFrame(() => {
      positionCloseButton();
      syncStageHeight();
    });
  });

  const label = document.createElement('span');
  label.className = 'popup-label';
  label.textContent = prettyArtworkTitle(normalizeArtworkName(filename));

  popup.appendChild(closeButton);
  popup.appendChild(img);
  popup.appendChild(label);
  popup.addEventListener('dragstart', (event) => event.preventDefault());
  stage.appendChild(popup);

  const pos = getRandomPosition({ biasCenterTop });
  clampPopupToStage(popup, pos.x, pos.y);
  syncStageHeight();

  popup.addEventListener('click', () => {
    if (popup.dataset.dragged === 'true') {
      popup.dataset.dragged = 'false';
      return;
    }
    openModal(src, filename);
    activePopup = popup;
  });

  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    removePopup(popup, { respawn: true, delay: 2000 });
  });

  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;

  popup.addEventListener('pointerdown', (event) => {
    if (event.target === closeButton) return;
    event.preventDefault();
    dragging = true;
    popup.dataset.dragged = 'false';
    popup.classList.add('dragging');
    bringPopupToFront(popup);
    popup.style.transition = 'none';
    const rect = popup.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    popup.setPointerCapture(event.pointerId);
  });

  popup.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    event.preventDefault();
    const stageRect = stage.getBoundingClientRect();
    const x = event.clientX - stageRect.left - dragOffsetX;
    const y = event.clientY - stageRect.top - dragOffsetY;
    const moved = Math.abs(event.clientX - dragStartX) > 4 || Math.abs(event.clientY - dragStartY) > 4;
    if (moved) {
      popup.dataset.dragged = 'true';
    }
    clampPopupToStage(popup, x, y);
    syncStageHeight();
  });

  popup.addEventListener('pointerup', () => {
    dragging = false;
    popup.classList.remove('dragging');
    popup.style.transition = 'left 0.18s ease-out, top 0.18s ease-out';
  });

  popup.addEventListener('pointercancel', () => {
    dragging = false;
    popup.classList.remove('dragging');
    popup.style.transition = 'left 0.18s ease-out, top 0.18s ease-out';
  });

  popup.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      popup.classList.remove('expanded');
      document.body.classList.remove('popup-open');
      document.documentElement.classList.remove('popup-open');
      activePopup = null;
    }
  });

  if (initialFill && spawnedCount >= artwork.length) {
    startRotationLoop();
  }
}

function startPopupLoop() {
  buildQueue();
  createPopup();
  popupInterval = window.setInterval(() => {
    if (!generationActive || spawnedCount >= artwork.length) return;
    createPopup();
    if (spawnedCount >= artwork.length) {
      startRotationLoop();
    }
  }, 2000);
}

window.addEventListener('load', startPopupLoop);
window.addEventListener('resize', () => {
  const popups = Array.from(document.querySelectorAll('.art-popup'));
  popups.forEach((popup) => {
    const x = parseFloat(popup.style.left || 0) || 24;
    const y = parseFloat(popup.style.top || 0) || 92;
    clampPopupToStage(popup, x, y);
  });
  syncStageHeight();
});
