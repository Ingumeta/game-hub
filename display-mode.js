function isPWA() {
  const dm = window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches;
  return dm || window.navigator.standalone === true;
}

function applyDisplayModeClass() {
  document.body.classList.add(isPWA() ? 'pwa' : 'browser');
}

document.addEventListener('DOMContentLoaded', applyDisplayModeClass);