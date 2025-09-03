function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function applyDisplayModeClass() {
  document.body.classList.add(isPWA() ? 'pwa' : 'browser');
}

document.addEventListener('DOMContentLoaded', applyDisplayModeClass);