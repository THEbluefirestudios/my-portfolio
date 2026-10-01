const timeEl = document.getElementById('timeEl');
const dateEl = document.getElementById('dateEl');
const overlay = document.getElementById('lock-overlay');
const bgBlur = document.getElementById('lock-bgblur');
function updateClock() {
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  dateEl.textContent = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}


document.getElementById('lock-overlay').addEventListener('click', () => {
  overlay.classList.add('unlocked');
  bgBlur.classList.add('unlocked');
});



overlay.addEventListener('click', () => {
  overlay.classList.add('unlocked');
});

overlay.addEventListener('transitionend', (e) => {
  if (e.propertyName === 'transform') {
    overlay.style.display = 'none';
  }
});

bgBlur.addEventListener('transitionend', () => {
  bgBlur.style.display = 'none';
});

overlay.addEventListener('transitionend', () => {
    overlay.style.display = 'none';
});


updateClock();
setInterval(updateClock, 1000);