import Lenis from './vendor/lenis.mjs';
import {motionTiming} from './motion-rules.mjs';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let smoothScroll = null;
let navigating = false;
let navigationRecovery = null;
let overlay = null;

function configureSmoothScroll() {
  smoothScroll?.destroy();
  smoothScroll = null;
  if (reducedMotion.matches || !window.ResizeObserver) return;
  smoothScroll = new Lenis({
    duration: 1.1,
    autoRaf: true,
    anchors: {offset: -82},
    prevent: element => element.matches('textarea,[data-lenis-prevent]')
  });
}

function resetOverlay() {
  navigating = false;
  window.clearTimeout(navigationRecovery);
  if (!overlay) return;
  overlay.style.pointerEvents = 'none';
  overlay.querySelectorAll('.page-transition-panel').forEach(panel => {
    panel.getAnimations?.().forEach(animation => animation.cancel());
    panel.style.transform = 'translateY(101%)';
  });
}

function animatePanel(panel, from, to, duration, delay) {
  panel.style.transform = to;
  const animation = panel.animate(
    [{transform: from}, {transform: to}],
    {duration, delay, easing: motionTiming.inOut, fill: 'both'}
  );
  return animation.finished.catch(() => {}).then(() => animation.cancel());
}

function createOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'page-transition-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  for (let index = 0; index < 5; index++) {
    const panel = document.createElement('div');
    panel.className = 'page-transition-panel';
    overlay.append(panel);
  }
  document.body.append(overlay);
}

function prepareMediaCursor() {
  if (reducedMotion.matches || !window.matchMedia('(pointer:fine)').matches) return;
  const cursor = document.createElement('div');
  cursor.className = 'motion-media-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.append(cursor);
  document.addEventListener('pointermove', event => {
    const target = event.target.closest('[data-cursor]');
    cursor.classList.toggle('is-visible', Boolean(target) && !reducedMotion.matches);
    if (!target) return;
    cursor.textContent = target.dataset.cursor;
    cursor.style.left = `${Math.min(event.clientX + 16, window.innerWidth - 175)}px`;
    cursor.style.top = `${Math.min(event.clientY + 24, window.innerHeight - 65)}px`;
  }, {passive: true});
  window.addEventListener('blur', () => cursor.classList.remove('is-visible'));
}

async function revealIncomingPage() {
  let pending;
  try {
    pending = JSON.parse(sessionStorage.getItem('confort4-page-transition'));
    sessionStorage.removeItem('confort4-page-transition');
  } catch { return; }
  if (!pending || reducedMotion.matches) return;
  const destination = location.pathname + location.search;
  if (pending.destination !== destination || Date.now() - pending.time > 15000) return;

  const panels = [...overlay.children];
  panels.forEach(panel => { panel.style.transform = 'translateY(0%)'; });
  await new Promise(resolve => window.requestAnimationFrame(resolve));
  await Promise.all(panels.map((panel, index) => animatePanel(
    panel, 'translateY(0%)', 'translateY(-101%)', 700, 100 + (4 - index) * 60
  )));
  resetOverlay();
}

async function handleNavigation(event) {
  if (reducedMotion.matches || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href]');
  if (!link || link.target && link.target !== '_self' || link.hasAttribute('download') || link.closest('[data-dragging]')) return;
  const destination = new URL(link.href, location.href);
  if (destination.origin !== location.origin) return;
  if (destination.pathname === location.pathname && destination.search === location.search) return;
  if (!destination.pathname.endsWith('.html') && !destination.pathname.endsWith('/')) return;

  event.preventDefault();
  if (navigating) return;
  navigating = true;
  overlay.style.pointerEvents = 'auto';
  try {
    sessionStorage.setItem('confort4-page-transition', JSON.stringify({
      destination: destination.pathname + destination.search,
      time: Date.now()
    }));
    await Promise.all([...overlay.children].map((panel, index) => animatePanel(
      panel, 'translateY(101%)', 'translateY(0%)', 600, (4 - index) * 60
    )));
    location.assign(destination.href);
    navigationRecovery = window.setTimeout(resetOverlay, 4000);
  } catch {
    resetOverlay();
    location.assign(destination.href);
  }
}

export function initializeMotionNavigation() {
  if (overlay) return;
  configureSmoothScroll();
  createOverlay();
  prepareMediaCursor();
  revealIncomingPage();
  document.addEventListener('click', handleNavigation, true);
  reducedMotion.addEventListener('change', configureSmoothScroll);
  window.addEventListener('pagehide', () => smoothScroll?.destroy());
  window.addEventListener('pageshow', event => {
    if (event.persisted) { resetOverlay(); configureSmoothScroll(); }
  });
}
