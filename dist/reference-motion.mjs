let scrollFrame = null;
let featuredTimer = null;
let wordBlocks = [];
let livingScenes = [];
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

function updateReadingScene() {
  scrollFrame = null;
  const hero = document.querySelector('.hero');
  const header = document.querySelector('.header');
  header?.classList.toggle('over-hero', Boolean(hero && hero.getBoundingClientRect().bottom > 100));

  for (const scene of livingScenes) {
    const bounds = scene.getBoundingClientRect();
    const travel = Math.max(1, bounds.height - window.innerHeight);
    const progress = motionPreference.matches ? 1 : Math.max(0, Math.min(1, -bounds.top / travel));
    scene.style.setProperty('--scene-open', String(progress));
  }

  for (const block of wordBlocks) {
    const bounds = block.element.getBoundingClientRect();
    const travel = Math.max(bounds.height, window.innerHeight * 0.55);
    const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.85 - bounds.top) / travel));
    block.words.forEach((word, index) => {
      word.classList.toggle('is-read', motionPreference.matches || index / block.words.length < progress);
    });
  }
}

function scheduleReadingScene() {
  if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(updateReadingScene);
}

window.addEventListener('scroll', scheduleReadingScene, { passive: true });
window.addEventListener('resize', scheduleReadingScene);
motionPreference.addEventListener('change', scheduleReadingScene);
window.addEventListener('pagehide', () => window.clearInterval(featuredTimer));

function prepareReadingCopy(root) {
  livingScenes = [...root.querySelectorAll('.living-scene')];
  wordBlocks = [...root.querySelectorAll('.scroll-copy')].map(element => {
    if (!element.querySelector('.scroll-word')) {
      const words = element.textContent.trim().split(/\s+/);
      const fragment = document.createDocumentFragment();
      words.forEach((text, index) => {
        const word = document.createElement('span');
        word.className = 'scroll-word';
        word.textContent = text;
        fragment.append(word);
        if (index < words.length - 1) fragment.append(document.createTextNode(' '));
      });
      element.replaceChildren(fragment);
    }
    return { element, words: [...element.querySelectorAll('.scroll-word')] };
  });
  document.body.classList.add('motion-ready');
  updateReadingScene();
}

function prepareFeaturedProperties(root) {
  window.clearInterval(featuredTimer);
  const carousel = root.querySelector('.featured-carousel');
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll('.featured-slide')];
  const count = carousel.querySelector('[data-feature-count]');
  const toggle = carousel.querySelector('[data-feature-toggle]');
  let index = 0;
  let paused = motionPreference.matches || slides.length < 2;

  function updateToggle() {
    toggle.textContent = paused ? 'Reanudar' : 'Pausar';
    toggle.setAttribute('aria-label', paused ? 'Reanudar presentación de propiedades' : 'Pausar presentación de propiedades');
    toggle.disabled = slides.length < 2;
    carousel.dataset.featurePaused = String(paused);
  }

  function showSlide(direction) {
    index = (index + direction + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== index; });
    carousel.dataset.featureIndex = String(index);
    count.textContent = `${index + 1} / ${slides.length}`;
    if (!motionPreference.matches) {
      slides[index].querySelector('img').animate(
        [{ opacity: 0.7, transform: 'scale(1.025)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' }
      );
    }
  }

  carousel.querySelectorAll('[data-feature-direction]').forEach(button => {
    button.disabled = slides.length < 2;
    button.addEventListener('click', () => {
      paused = true;
      updateToggle();
      showSlide(Number(button.dataset.featureDirection));
    });
  });

  toggle.addEventListener('click', () => { paused = !paused; updateToggle(); });
  updateToggle();
  featuredTimer = window.setInterval(() => {
    const bounds = carousel.getBoundingClientRect();
    const visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    const focused = carousel.contains(document.activeElement);
    if (!paused && !motionPreference.matches && !document.hidden && visible && !focused) showSlide(1);
  }, 6500);
}

export function initializeReferenceMotion(root) {
  prepareReadingCopy(root);
  prepareFeaturedProperties(root);
}
