import {motionTiming as timing, clampProgress, intervalProgress, expansionState, lineGradientPosition} from './motion-rules.mjs';
import {initializeMotionNavigation} from './motion-navigation.mjs?v=39';

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollFrame = null;
let sceneElements = {};
let lineBlocks = [];
let gradientBlocks = [];
let entranceObserver = null;
let sizeObserver = null;
let carouselCleanup = null;
let generation = 0;
let heroPlayed = false;
let resizePending = false;

function animateSceneCounts(scene) {
  if (scene.dataset.countsStarted) return;
  scene.dataset.countsStarted = 'true';
  scene.querySelectorAll('[data-count-target]').forEach(counter => {
    const target = Number(counter.dataset.countTarget);
    if (motionPreference.matches || !counter.animate) { counter.textContent = String(target); return; }
    const animation = counter.animate(
      [{'--motion-count': '0'}, {'--motion-count': String(target)}],
      {duration: 1600, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both'}
    );
    let frame;
    function updateCount() {
      if (!counter.isConnected) { animation.cancel(); return; }
      const value = Number.parseFloat(getComputedStyle(counter).getPropertyValue('--motion-count'));
      counter.textContent = String(Math.round(Number.isFinite(value) ? value : target));
      if (animation.playState !== 'finished' && animation.playState !== 'idle') frame = window.requestAnimationFrame(updateCount);
    }
    updateCount();
    animation.finished.catch(() => {}).then(() => {
      window.cancelAnimationFrame(frame);
      counter.textContent = String(target);
      animation.cancel();
    });
  });
}

function play(element, frames, duration, delay = 0, easing = timing.out) {
  if (motionPreference.matches || !element.animate) return Promise.resolve();
  const animation = element.animate(frames, {duration, delay, easing, fill: 'both'});
  return animation.finished.catch(() => {}).then(() => animation.cancel());
}

function originalText(element) {
  if (element.dataset.motionText) return element.dataset.motionText;
  const copy = element.cloneNode(true);
  copy.querySelectorAll('br').forEach(lineBreak => lineBreak.replaceWith(document.createTextNode(' ')));
  const text = copy.textContent.trim().replace(/\s+/g, ' ');
  element.dataset.motionText = text;
  return text;
}

function measureLines(element, kind = 'entrance') {
  const text = originalText(element);
  const fragment = document.createDocumentFragment();
  text.split(' ').forEach((word, index) => {
    const span = document.createElement('span');
    span.dataset.measureWord = '';
    span.textContent = (index ? ' ' : '') + word;
    fragment.append(span);
  });
  element.replaceChildren(fragment);

  const groups = [];
  let lastTop = null;
  element.querySelectorAll('[data-measure-word]').forEach(word => {
    if (lastTop === null || Math.abs(word.offsetTop - lastTop) > 2) groups.push([]);
    groups[groups.length - 1].push(word.textContent.trim());
    lastTop = word.offsetTop;
  });

  const result = document.createDocumentFragment();
  const lines = groups.map((words, index) => {
    const clip = document.createElement('span');
    clip.className = kind === 'gradient' ? 'motion-gradient-clip' : 'motion-line-clip';
    const line = document.createElement('span');
    line.className = kind === 'gradient' ? 'motion-gradient-line' : 'motion-line';
    line.textContent = words.join(' ');
    clip.append(line);
    result.append(clip);
    if (index < groups.length - 1) result.append(document.createTextNode(' '));
    return line;
  });
  element.replaceChildren(result);
  element.classList.add('motion-lines');
  element.dataset.motionKind = kind;
  return {element, lines, kind, width: element.getBoundingClientRect().width};
}

function revealLines(block, delay = 0) {
  block.element.dataset.motionSeen = 'true';
  block.lines.forEach((line, index) => {
    line.style.transform = 'translateY(0%)';
    play(line, [{transform: 'translateY(110%)'}, {transform: 'translateY(0%)'}], timing.line, delay + index * timing.lineStagger);
  });
}

function prepareHero(hero) {
  if (!hero || hero.dataset.motionPrepared) return;
  hero.dataset.motionPrepared = 'true';
  const visual = hero.querySelector('.hero-visual');
  const image = visual.querySelector('img');
  const frame = document.createElement('div');
  frame.className = 'hero-frame';
  const parallax = document.createElement('div');
  parallax.className = 'hero-parallax';
  parallax.append(image);
  frame.append(parallax);
  visual.append(frame);
  const title = measureLines(hero.querySelector('h1'));

  if (heroPlayed || motionPreference.matches || hero.getBoundingClientRect().bottom <= 0) {
    document.documentElement.classList.remove('confort4-motion-loading');
    return;
  }
  hero.classList.add('hero-awaiting-image');
  const loaded = image.complete && image.naturalWidth ? Promise.resolve() : image.decode?.().catch(() => {});
  const timeout = new Promise(resolve => window.setTimeout(resolve, 2500));
  Promise.race([loaded || timeout, timeout]).then(() => {
    if (!hero.isConnected) return;
    hero.classList.remove('hero-awaiting-image');
    document.documentElement.classList.remove('confort4-motion-loading');
    if (heroPlayed || motionPreference.matches) return;
    heroPlayed = true;
    hero.classList.add('hero-intro-playing');
    title.lines.forEach((line, index) => {
      play(line, [{transform: 'translateY(105%)'}, {transform: 'translateY(0%)'}], timing.heroLine, timing.heroFirstDelay + index * timing.heroLineStagger);
    });
    const description = hero.querySelector('.hero-aside');
    play(description, [{opacity: 0, transform: 'translateY(12px)'}, {opacity: 1, transform: 'translateY(0px)'}], 900, timing.heroDescriptionDelay);
    const navigation = document.querySelector('.nav-inner');
    play(navigation, [{clipPath: 'inset(0% 0% 100%)'}, {clipPath: 'inset(0%)'}], 900, 450);
  });
}

function prepareEntranceObserver(root) {
  entranceObserver?.disconnect();
  const canObserve = Boolean(window.IntersectionObserver) && !motionPreference.matches;
  if (canObserve) {
    entranceObserver = new window.IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target;
        if (element.dataset.motionKind === 'entrance') {
          const block = lineBlocks.find(item => item.element === element);
          if (block) revealLines(block, Number(element.dataset.motionDelay || 0));
        } else if (element.dataset.motionKind === 'image') {
          element.dataset.motionSeen = 'true';
          play(element, [{clipPath: 'inset(100% 0% 0%)'}, {clipPath: 'inset(0%)'}], timing.imageWipe, 0, timing.inOut);
          const settle = element.querySelector('.motion-image-settle');
          if (settle) play(settle, [{transform: element.dataset.motionFraming==='faces'?'scale(1.03)':'scale(1.15)'}, {transform: 'scale(1)'}], timing.imageSettle);
        } else if (element.dataset.motionKind === 'rule') {
          play(element, [{transform:'scaleX(0)'}, {transform:'scaleX(1)'}], 900);
        } else {
          play(element, [{opacity: 0.001, transform: 'translateY(24px)'}, {opacity: 1, transform: 'translateY(0px)'}], 900, Number(element.dataset.motionDelay || 0));
        }
        entranceObserver.unobserve(element);
      }
    }, {rootMargin: '0px 0px -10% 0px', threshold: 0});
  }

  const lineTargets = root.querySelectorAll('.brand-statement p,.module-heading h2,.module-heading>p,.module-heading>div>p,.process-stage h3,.process-stage>div>p,.living-copy h2,.faq-module h2,.contact-form-intro h2,.contact-form-intro h1,[data-team-text]');
  lineBlocks = [...lineTargets].map(element => {
    const block = measureLines(element);
    if (canObserve && !element.dataset.motionSeen) {
      block.lines.forEach(line => { line.style.transform = 'translateY(110%)'; });
      entranceObserver.observe(element);
    } else {
      element.dataset.motionSeen = 'true';
    }
    return block;
  });

  gradientBlocks = [...root.querySelectorAll('.process-guide .scroll-copy')].map(element => measureLines(element, 'gradient'));

  root.querySelectorAll('.narrative-process figure,.journal-card>a,[data-motion-image]').forEach(element => {
    if (!element.querySelector('.motion-image-settle')) {
      const image = element.querySelector('img');
      const settle = document.createElement('div');
      settle.className = 'motion-image-settle';
      const parallax = document.createElement('div');
      parallax.className = 'motion-image-parallax';
      parallax.append(image);
      settle.append(parallax);
      element.append(settle);
    }
    element.dataset.motionKind = 'image';
    if (canObserve && !element.dataset.motionSeen) entranceObserver.observe(element);
  });

  root.querySelectorAll('[data-team-rule]').forEach(element => {
    element.dataset.motionKind='rule';
    if(canObserve)entranceObserver.observe(element);
  });

  root.querySelectorAll('.module-heading>.text-link,.living-copy>.text-link,.contact-direct').forEach(element => {
    element.dataset.motionKind = 'text';
    if (canObserve) entranceObserver.observe(element);
  });
}

function prepareFooter() {
  const footer = document.querySelector('.footer-wordmark');
  if (footer && !footer.querySelector('.footer-letter')) {
    const letters = [...footer.textContent.trim()];
    footer.replaceChildren(...letters.map(character => {
      const letter = document.createElement('span');
      letter.className = 'footer-letter';
      letter.textContent = character;
      return letter;
    }));
  }
  return footer;
}

// Read geometry together, then apply styles; offscreen scenes keep their last frame.
function updateScrollScene() {
 scrollFrame = null;
 const height=window.innerHeight,width=window.innerWidth,reduced=motionPreference.matches;
 if(resizePending){
  resizePending=false;
  for(const block of [...lineBlocks,...gradientBlocks]){
   if(Math.abs(block.element.getBoundingClientRect().width-block.width)>1){
    Object.assign(block,measureLines(block.element,block.kind));
    if(block.kind==='entrance'&&!block.element.dataset.motionSeen&&!reduced)block.lines.forEach(line=>line.style.transform='translateY(110%)');
   }
  }
 }
 const {hero,header}=sceneElements;
 const bounds=new Map();
 const measure=element=>{if(element&&!bounds.has(element))bounds.set(element,element.getBoundingClientRect());};
 measure(hero);measure(sceneElements.footer);
 (sceneElements.expanding||[]).forEach(scene=>measure(scene.element));
 (sceneElements.scattered||[]).forEach(scene=>measure(scene.element));
 (sceneElements.parallax||[]).forEach(image=>measure(image.figure));
 gradientBlocks.forEach(block=>measure(block.element));
 const visible=rect=>rect&&rect.top<height+160&&rect.bottom>-160;
 const set=(element,property,value)=>{if(element&&element.style[property]!==value)element.style[property]=value;};
 const overHero=Boolean(hero&&window.scrollY<24);
 if(header&&header.classList.contains('over-hero')!==overHero)header.classList.toggle('over-hero',overHero);
 if(hero&&visible(bounds.get(hero))){
  const rect=bounds.get(hero),progress=reduced?0:clampProgress(-rect.top/Math.max(1,rect.height));
  set(sceneElements.heroParallax,'transform', 'translateY('+progress*45+'%)');
 }
 for(const scene of sceneElements.expanding||[]){
  const rect=bounds.get(scene.element);if(!visible(rect))continue;
  const progress=reduced?1:clampProgress(-rect.top/Math.max(1,rect.height-height)),state=expansionState(progress,width);
  set(scene.frame,'clipPath','inset('+state.verticalInset+'% '+state.horizontalInset+'%)');
  set(scene.image,'transform','scale('+state.scale+')');set(scene.scrim,'opacity',String(state.scrim));
  set(scene.copy,'opacity',String(state.opacity));set(scene.copy,'transform','translateY('+state.offset+'px)');set(scene.copy,'pointerEvents',state.opacity>.9?'auto':'none');
  if('inert' in scene.copy&&scene.copy.inert!==(state.opacity<.9))scene.copy.inert=state.opacity<.9;
  if(progress>.6)animateSceneCounts(scene.element);
  scene.metrics.forEach((metric,index)=>{const value=String(reduced?1:intervalProgress(progress,.6+index*.04,.76+index*.04));if(metric.style.getPropertyValue('--option-progress')!==value)metric.style.setProperty('--option-progress',value);});
 }
 for(const scene of sceneElements.scattered||[]){
  const rect=bounds.get(scene.element);if(!visible(rect))continue;
  const progress=clampProgress((height-rect.top)/(height+rect.height));
  scene.photos.forEach(photo=>set(photo,'transform','translateY('+(reduced||width<1200?0:progress*Number(photo.dataset.sceneDrift))+'px)'));
 }
 for(const image of sceneElements.parallax||[]){
  const rect=bounds.get(image.figure);if(!visible(rect))continue;
  const progress=clampProgress((height-rect.top)/(height+rect.height));
  if(image.figure.dataset.motionFraming==='faces'){set(image.element,'transform','none');continue;}
  const team=image.figure.hasAttribute('data-motion-image');
  set(image.element,'transform',reduced?'none':'translateY('+((team?-4:-8)+progress*(team?8:16))+'%) scale('+(team?1.12:1.18)+')');
 }
 for(const block of gradientBlocks){
  const rect=bounds.get(block.element);if(!visible(rect))continue;
  const progress=reduced?1:clampProgress((height*.85-rect.top)/(rect.height+height*.4));
  block.lines.forEach((line,index)=>{const position=lineGradientPosition(progress,index,block.lines.length);set(line,'backgroundImage','linear-gradient(90deg,var(--ink) '+(position-9)+'%,#cfcfcf '+(position+9)+'%)');});
 }
 const footer=sceneElements.footer,rect=bounds.get(footer);
 if(footer&&visible(rect)){
  const progress=reduced?1:clampProgress((height-rect.top)/Math.max(1,rect.height)),letters=sceneElements.footerLetters;
  letters.forEach((letter,index)=>{const start=index/letters.length*.45;set(letter,'transform','translateY('+100*(1-intervalProgress(progress,start,start+.55))+'%)');});
 }
}

function scheduleScrollScene() {
  if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(updateScrollScene);
}

window.addEventListener('scroll', scheduleScrollScene, {passive: true});
window.addEventListener('resize', () => { resizePending = true; scheduleScrollScene(); });
motionPreference.addEventListener('change', scheduleScrollScene);

function prepareAccordions(root) {
  root.querySelectorAll('.service-choice').forEach(details => {
    if (details.dataset.motionPrepared) return;
    details.dataset.motionPrepared = 'true';
    const summary = details.querySelector('summary');
    const content = summary.nextElementSibling;
    let transition = null;
    let requestedOpen = details.open;

    summary.addEventListener('click', event => {
      if (motionPreference.matches) return;
      event.preventDefault();
      const currentHeight = details.open ? content.getBoundingClientRect().height : 0;
      requestedOpen = !requestedOpen;
      transition?.cancel();
      details.open = true;
      content.style.height = 'auto';
      const targetHeight = requestedOpen ? content.getBoundingClientRect().height : 0;
      content.style.overflow = 'hidden';
      const animation = content.animate(
        [{height: `${currentHeight}px`, opacity: currentHeight ? 1 : 0}, {height: `${targetHeight}px`, opacity: requestedOpen ? 1 : 0}],
        {duration: timing.accordion, easing: timing.inOut, fill: 'both'}
      );
      transition = animation;
      if (requestedOpen) {
        const image = content.querySelector('img');
        if (image) play(image, [{transform: 'scale(1.2)'}, {transform: 'scale(1)'}], 900);
      }
      animation.finished.then(() => {
        if (transition !== animation) return;
        details.open = requestedOpen;
        animation.cancel();
        content.style.height = '';
        content.style.overflow = '';
        transition = null;
      }).catch(() => {});
    });
  });
}

function prepareFeaturedProperties(root) {
  carouselCleanup?.();
  const carousel = root.querySelector('.featured-carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.featured-slide')];
  const toggle = carousel.querySelector('[data-feature-toggle]');
  const count = carousel.querySelector('[data-feature-count]');
  const progress = document.createElement('div');
  progress.className = 'featured-progress';
  progress.setAttribute('aria-hidden', 'true');
  const progressFill = document.createElement('span');
  progress.append(progressFill);
  carousel.append(progress);

  let inView = !window.IntersectionObserver;
  let visibilityObserver = null;
  let index = 0;
  let paused = motionPreference.matches || slides.length < 2;
  let advanceTimer = null;
  let progressAnimation = null;
  let zoomAnimation = null;
  let unlockAt = 0;
  let pointerStart = null;
  let dragged = false;
  const ghosts = new Set();

  function updateToggle() {
    toggle.textContent = paused ? 'Reanudar' : 'Pausar';
    toggle.setAttribute('aria-label', paused ? 'Reanudar presentación de propiedades' : 'Pausar presentación de propiedades');
    toggle.hidden = motionPreference.matches || slides.length < 2;
    carousel.dataset.featurePaused = String(paused);
  }

  function armAutoplay() {
    window.clearTimeout(advanceTimer);
    progressAnimation?.cancel();
    zoomAnimation?.cancel();
    progressFill.style.transform = 'scaleX(0)';
    if (paused || !inView || motionPreference.matches || document.hidden || slides.length < 2) return;
    progressAnimation = progressFill.animate?.([{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: timing.slideInterval, easing: 'linear', fill: 'both'});
    const image = slides[index].querySelector('img');
    zoomAnimation = image.animate?.([{transform: 'scale(1)'}, {transform: 'scale(1.08)'}], {duration: timing.slideInterval, easing: 'linear', fill: 'both'});
    advanceTimer = window.setTimeout(() => showSlide(1), timing.slideInterval);
  }

  function showSlide(direction) {
    if (performance.now() < unlockAt) return;
    const outgoing = slides[index];
    const previousCount = count.textContent;
    index = (index + direction + slides.length) % slides.length;
    const incoming = slides[index];
    carousel.dataset.featureIndex = String(index);
    count.textContent = `${index + 1} / ${slides.length}`;
    slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== index; });

    if (!motionPreference.matches) {
      unlockAt = performance.now() + 900;
      const ghost = outgoing.querySelector('.featured-image').cloneNode(true);
      ghost.className = 'featured-outgoing';
      ghost.removeAttribute('href');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.inert = true;
      ghost.querySelector('img').style.transform = getComputedStyle(outgoing.querySelector('img')).transform;
      carousel.append(ghost);
      ghosts.add(ghost);
      const media = incoming.querySelector('.featured-image');
      play(ghost, [{transform: 'translateX(0%)'}, {transform: `translateX(${-100 * direction}%)`}], 900, 0, 'cubic-bezier(.45,0,.15,1)').then(() => { ghost.remove(); ghosts.delete(ghost); });
      play(ghost.querySelector('.featured-image-motion'), [{transform: 'translateX(0%)'}, {transform: `translateX(${50 * direction}%)`}], 900, 0, 'cubic-bezier(.45,0,.15,1)');
      play(media, [{transform: `translateX(${100 * direction}%)`}, {transform: 'translateX(0%)'}], 900, 0, 'cubic-bezier(.45,0,.15,1)');
      const image = incoming.querySelector('img');
      const inner = image.closest('.featured-image-motion');
      play(inner, [{transform: `translateX(${-50 * direction}%)`}, {transform: 'translateX(0%)'}], 900, 0, 'cubic-bezier(.45,0,.15,1)');
      for (const text of incoming.querySelectorAll('.featured-caption h3,.featured-caption>div>p,.featured-caption>.property-price')) {
        play(text, [{transform: 'translateY(110%)', opacity: 0}, {transform: 'translateY(0%)', opacity: 1}], timing.slideText, 200);
      }
      const oldCount = document.createElement('span');
      oldCount.textContent = previousCount;
      oldCount.setAttribute('aria-hidden', 'true');
      const newCount = document.createElement('span');
      newCount.textContent = count.textContent;
      count.replaceChildren(oldCount, newCount);
      play(oldCount, [{transform: 'translateY(0%)'}, {transform: 'translateY(-110%)'}], timing.slideText).then(() => oldCount.remove());
      play(newCount, [{transform: 'translateY(110%)'}, {transform: 'translateY(0%)'}], timing.slideText, 200);
    }
    armAutoplay();
  }

  slides.forEach(slide => {
    slide.querySelector('.featured-image').dataset.cursor = 'Ver propiedad';
    const image = slide.querySelector('img');
    image.draggable = false;
    const inner = document.createElement('div');
    inner.className = 'featured-image-motion';
    image.replaceWith(inner);
    inner.append(image);
  });

  carousel.querySelectorAll('[data-feature-direction]').forEach(button => {
    button.disabled = slides.length < 2;
    button.addEventListener('click', () => showSlide(Number(button.dataset.featureDirection)));
  });
  toggle.addEventListener('click', () => { paused = !paused; updateToggle(); armAutoplay(); });
  carousel.addEventListener('focusin', event => {
    if (event.target.matches(':focus-visible')) { window.clearTimeout(advanceTimer); progressAnimation?.pause(); zoomAnimation?.pause(); }
  });
  carousel.addEventListener('focusout', event => { if (!carousel.contains(event.relatedTarget)) armAutoplay(); });
  carousel.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || event.button !== 0) return;
    pointerStart = {x: event.clientX, y: event.clientY};
    dragged = false;
    carousel.removeAttribute('data-dragging');
  });
  carousel.addEventListener('pointermove', event => {
    if (!pointerStart) return;
    const horizontal = event.clientX - pointerStart.x;
    const vertical = event.clientY - pointerStart.y;
    if (Math.abs(horizontal) < 8 || Math.abs(horizontal) <= Math.abs(vertical)) return;
    dragged = true;
    carousel.setAttribute('data-dragging', '');
    slides[index].querySelector('.featured-image').style.transform = `translateX(${horizontal * 0.08}px)`;
  });
  carousel.addEventListener('pointerup', event => {
    if (pointerStart === null) return;
    const distance = event.clientX - pointerStart.x;
    pointerStart = null;
    const media = slides[index].querySelector('.featured-image');
    const dragTransform = media.style.transform || 'translateX(0px)';
    media.style.transform = '';
    if (Math.abs(distance) < 80) {
      if (dragged) play(media, [{transform: dragTransform}, {transform: 'translateX(0px)'}], 300);
      return;
    }
    dragged = true;
    showSlide(distance < 0 ? 1 : -1);
  });
  carousel.addEventListener('pointercancel', () => {
    pointerStart = null;
    dragged = false;
    carousel.removeAttribute('data-dragging');
    slides[index].querySelector('.featured-image').style.transform = '';
  });
  carousel.addEventListener('click', event => {
    if (dragged) { event.preventDefault(); dragged = false; carousel.removeAttribute('data-dragging'); }
  }, true);
  const visibilityChange = () => armAutoplay();
  document.addEventListener('visibilitychange', visibilityChange);
  if(window.IntersectionObserver){visibilityObserver=new window.IntersectionObserver(entries=>{const visible=entries[0]?.isIntersecting||false;if(visible!==inView){inView=visible;armAutoplay();}},{rootMargin:'160px'});visibilityObserver.observe(carousel);}
  updateToggle();
  armAutoplay();
  carouselCleanup = () => {
    visibilityObserver?.disconnect();
    window.clearTimeout(advanceTimer);
    progressAnimation?.cancel();
    zoomAnimation?.cancel();
    ghosts.forEach(ghost => ghost.remove());
    document.removeEventListener('visibilitychange', visibilityChange);
  };
}

export function initializeReferenceMotion(root) {
  generation += 1;
  const currentGeneration = generation;
  initializeMotionNavigation();
  prepareFeaturedProperties(root);
  prepareAccordions(root);
  const hero = root.querySelector('.hero');
  sceneElements = {
    hero,
    header: document.querySelector('.header'),
    heroParallax: hero?.querySelector('.hero-parallax'),
    expanding: [...root.querySelectorAll('.expanding-scene')].map(element=>({element,frame:element.querySelector('.expanding-frame'),image:element.querySelector('.expanding-frame img'),scrim:element.querySelector('.expanding-scrim'),copy:element.querySelector('.expanding-copy'),metrics:[...element.querySelectorAll('.expanding-metric')]})),
    scattered: [...root.querySelectorAll('.living-scene')].map(element=>({element,photos:[...element.querySelectorAll('[data-scene-drift]')]})),
    parallax: [],
    footer: prepareFooter(),
    footerLetters: []
  };

  Promise.resolve(document.fonts?.ready).then(() => {
    if (currentGeneration !== generation || !root.isConnected) return;
    prepareHero(hero);
    sceneElements.heroParallax=hero?.querySelector('.hero-parallax');
    sceneElements.footerLetters=[...document.querySelectorAll('.footer-letter')];
    prepareEntranceObserver(root);
    sceneElements.parallax = [...root.querySelectorAll('.narrative-process .motion-image-parallax,[data-motion-image] .motion-image-parallax')].map(element=>({element,figure:element.closest('[data-motion-image]')||element.closest('figure')}));
    sizeObserver?.disconnect();
    if (window.ResizeObserver) {
      sizeObserver = new window.ResizeObserver(() => { resizePending = true; scheduleScrollScene(); });
      [...lineBlocks, ...gradientBlocks].forEach(block => sizeObserver.observe(block.element));
    }
    document.body.classList.add('motion-ready');
    updateScrollScene();
  });
}

window.addEventListener('pagehide', () => carouselCleanup?.());
