const timeEl = document.getElementById('timeEl');
const dateEl = document.getElementById('dateEl');
const overlay = document.getElementById('lock-overlay');
const bgBlur = document.getElementById('lock-bgblur');
const icons = [
  { icon: 'aboutme-icon-img', window: 'aboutme-window' },
  { icon: 'browser-icon-img', window: 'browser-window' },
  { icon: 'minecraft-icon-img', window: 'minecraft-window' },
  { icon: 'ide-icon-img', window: 'ide-window' }
];
const dockTime = document.getElementById('dock-time');
const dockDate = document.getElementById('dock-date');
const HOME = 'https://www.google.com/webhp?igu=1';
const frame = document.getElementById('browser-frame');
const urlForm = document.getElementById('url-form');
const urlInput = document.getElementById('url-input');
const backBtn = document.getElementById('go-back');   // equivalent of import block
const fwdBtn = document.getElementById('go-forward');
const reloadBtn = document.getElementById('go-reload');
const homeBtn = document.getElementById('go-home');


let history = [HOME];
let cursor = 0;

function render() {
  urlInput.value = history[cursor];

}

function navigate(input) {
  const value = input.trim();
  if (!value) return;

  const target = /^https?:\/\//i.test(value)
    ? value
    : `https://www.google.com/webhp?igu=1&q=${encodeURIComponent(value)}`;

  history = history.slice(0, cursor + 1);
  history.push(target);
  cursor = history.length - 1;

  frame.src = target;
  render();
}


urlForm.addEventListener('submit', (e) => {
  e.preventDefault();
  navigate(urlInput.value);
});

backBtn.addEventListener('click', () => {
  if (cursor === 0) return;
  cursor--;
  frame.src = history[cursor];
  render();
});


fwdBtn.addEventListener('click', () => {
  if (cursor === history.length - 1) return;
  cursor++;
  frame.src = history[cursor];
  render();
});

reloadBtn.addEventListener('click', () => {
  frame.src = history[cursor];
});

homeBtn.addEventListener('click', () => {
  navigate(HOME);
});

render();
icons.forEach(({ icon, window: winId }) => {
  const iconEl = document.getElementById(icon);
  const winEl = winId.startsWith('#') ? null : document.getElementById(winId) || document.querySelector(`.${winId}`);

  if (!iconEl || !winEl) return;

  iconEl.addEventListener('click', () => {
    winEl.classList.add('open');
  });
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.window-close');
  if (btn) btn.closest('.window').classList.remove('open');
});

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  timeEl.textContent = time;
  dateEl.textContent = date;
  if (dockTime) dockTime.textContent = time;
  if (dockDate) dockDate.textContent = date;
}
updateClock();
setInterval(updateClock, 1000);

overlay.addEventListener('click', () => {
  overlay.classList.add('unlocked');
  bgBlur.classList.add('unlocked');
});

overlay.addEventListener('transitionend', (e) => {
  if (e.propertyName === 'transform' && e.target === overlay) {
    overlay.style.display = 'none';
  }
});

bgBlur.addEventListener('transitionend', (e) => {
  if (e.propertyName === 'opacity' && e.target === bgBlur) {
    bgBlur.style.display = 'none';
  }
});

let topZ = 100;

document.addEventListener('pointerdown', (e) => {
  const win = e.target.closest('.window');
  if (win) win.style.zIndex = ++topZ;
}, true);

const EDGE = 8;
const MIN_W = 240;
const MIN_H = 120;

let resizing = false;
let resizeWin = null;
let resizeEdge = '';
let startRect = null;
let startX = 0;
let startY = 0;

function detectEdge(win, x, y) {
  const r = win.getBoundingClientRect();
  const nearL = x - r.left <= EDGE;
  const nearR = r.right - x <= EDGE;
  const nearT = y - r.top <= EDGE;
  const nearB = r.bottom - y <= EDGE;

  if (nearT && nearL) return 'nw';
  if (nearT && nearR) return 'ne';
  if (nearB && nearL) return 'sw';
  if (nearB && nearR) return 'se';
  if (nearL) return 'w';
  if (nearR) return 'e';
  if (nearT) return 'n';
  if (nearB) return 's';
  return '';
}

document.addEventListener('pointermove', (e) => {
  if (resizing) return;

  const win = e.target.closest('.window');
  win?.classList.remove('edge-n', 'edge-s', 'edge-e', 'edge-w',
                        'edge-nw', 'edge-ne', 'edge-sw', 'edge-se');

  if (!win || e.target.closest('.window-titlebar')) return;

  const edge = detectEdge(win, e.clientX, e.clientY);
  if (edge) win.classList.add(`edge-${edge}`);
});

document.addEventListener('pointerdown', (e) => {
  const win = e.target.closest('.window');
  if (!win) return;
  if (e.target.closest('button, input, form')) return;

  const edge = detectEdge(win, e.clientX, e.clientY);
  if (!edge) return;

  resizing = true;
  resizeWin = win;
  resizeEdge = edge;
  startRect = win.getBoundingClientRect();
  startX = e.clientX;
  startY = e.clientY;

  win.classList.add('dragging');
  win.classList.remove('edge-n', 'edge-s', 'edge-e', 'edge-w',
                        'edge-nw', 'edge-ne', 'edge-sw', 'edge-se');
  document.body.setPointerCapture(e.pointerId);
});

document.addEventListener('pointermove', (e) => {
  if (!resizing) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  const r = startRect;
  let { left, top, width, height } = r;

  if (resizeEdge.includes('e')) width = Math.max(MIN_W, r.width + dx);
  if (resizeEdge.includes('s')) height = Math.max(MIN_H, r.height + dy);
  if (resizeEdge.includes('w')) {
    width = Math.max(MIN_W, r.width - dx);
    left = r.left + (r.width - width);
  }
  if (resizeEdge.includes('n')) {
    height = Math.max(MIN_H, r.height - dy);
    top = r.top + (r.height - height);
  }

  const win = resizeWin;
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
});

document.addEventListener('pointerup', () => {
  if (!resizing) return;
  resizing = false;
  resizeWin.classList.remove('dragging');
});

let dragging = false;
let dragWindow = null;
let dragTitlebar = null;
let originX = 0;
let originY = 0;

document.addEventListener('pointerdown', (e) => {
  const titlebar = e.target.closest('.window-titlebar');
  if (!titlebar) return;
  if (e.target.closest('button, input, form')) return;
  if (resizing) return;

  dragWindow = titlebar.closest('.window');
  dragTitlebar = titlebar;
  dragging = true;
  dragWindow.classList.add('dragging');
  dragTitlebar.setPointerCapture(e.pointerId);

  const rect = dragWindow.getBoundingClientRect();
  originX = e.clientX - rect.left;
  originY = e.clientY - rect.top;
  startX = rect.left;
  startY = rect.top;
});

document.addEventListener('pointermove', (e) => {
  if (!dragging) return;

  const rect = dragWindow.getBoundingClientRect();
  let left = e.clientX - originX;
  let top = e.clientY - originY;

  top = Math.min(Math.max(top, 0), window.innerHeight);
  left = Math.min(Math.max(left, -rect.width + 80), window.innerWidth - 80);

  dragWindow.style.left = `${left}px`;
  dragWindow.style.top = `${top}px`;
});

document.addEventListener('pointerup', (e) => {
  if (!dragging) return;
  dragging = false;
  dragWindow.classList.remove('dragging');
  if (dragTitlebar.hasPointerCapture(e.pointerId)) {
    dragTitlebar.releasePointerCapture(e.pointerId);
  }
});

document.addEventListener('dblclick', (e) => {
  const titlebar = e.target.closest('.window-titlebar');
  if (!titlebar) return;
  const win = titlebar.closest('.window');
  win.style.left = '';
  win.style.top = '';
});