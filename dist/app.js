const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const intentButton = document.querySelector('#intent-toggle');
const intentMenu = document.querySelector('#intent-menu');
function closeIntent(){if(intentMenu){intentMenu.hidden=true;intentButton.setAttribute('aria-expanded','false');}}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);if(!open)closeIntent();});
intentButton?.addEventListener('click',()=>{const open=intentMenu.hidden;intentMenu.hidden=!open;intentButton.setAttribute('aria-expanded',String(open));});
document.addEventListener('click',event=>{if(!event.target.closest('.dropdown'))closeIntent();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const wasOpen=intentButton?.getAttribute('aria-expanded')==='true';closeIntent();if(wasOpen)intentButton.focus();else if(menuButton?.getAttribute('aria-expanded')==='true'){menuButton.setAttribute('aria-expanded','false');navigation.classList.remove('open');menuButton.focus();}}});
navigation?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{navigation.classList.remove('open');menuButton.setAttribute('aria-expanded','false');closeIntent();}));
document.querySelector('#year')?.replaceChildren(String(new Date().getFullYear()));
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
// Native scroll remains in control. Each scene progresses in both directions.
const clamp = value => Math.max(0, Math.min(1, value));
const scenes = [...document.querySelectorAll('.hero,.hero-story,.principles-story,.intro,.service,.portraits figure,.contact')];
const principleLabels = [...document.querySelectorAll('.principle-label')];
const principleArticles = [...document.querySelectorAll('.principle-copy article')];
const storyDock = document.querySelector('.story-dock');
const visibleScenes = new Set();
const storyHeading = document.querySelector('.intro h2');
if (storyHeading) {
  const accessibleText = storyHeading.textContent;
  storyHeading.setAttribute('aria-label', accessibleText);
  const fragment = document.createDocumentFragment();
  [...storyHeading.childNodes].forEach(node => {
    if (node.nodeName === 'BR') { fragment.append(document.createElement('br')); return; }
    node.textContent.split(/(\s+)/).forEach(word => {
      if (!word.trim()) { fragment.append(document.createTextNode(word)); return; }
      const span = document.createElement('span');
      span.className = 'story-word';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = word;
      fragment.append(span);
    });
  });
  storyHeading.replaceChildren(fragment);
}
const storyWords = [...document.querySelectorAll('.story-word')];
const progressLine = document.createElement('div');
progressLine.className = 'reading-progress';
progressLine.setAttribute('aria-hidden', 'true');
document.body.append(progressLine);
let frame = 0;
function renderScroll() {
  frame = 0;
  if (document.hidden || reducedMotion.matches) return;
  const height = window.innerHeight;
  const narrow = window.innerWidth <= 680;
  // Read geometry in one batch before writing styles.
  const measurements = [...visibleScenes].map(element => ({element, rect: element.getBoundingClientRect()}));
  const total = document.documentElement.scrollHeight - height;
  progressLine.style.transform = `scaleX(${total > 0 ? clamp(window.scrollY / total) : 0})`;
  storyDock?.classList.toggle('is-visible', window.scrollY > height * .3);
  measurements.forEach(({element, rect}) => {
    const entry = clamp((height * .94 - rect.top) / (height * .62));
    if (element.classList.contains('hero-story')) {
      const progress = clamp(-rect.top / Math.max(1, rect.height - height));
      element.style.setProperty('--fragment-travel', `${progress * (narrow ? 120 : 340)}px`);
      element.style.setProperty('--fragment-fade', (1-clamp(progress*1.7)).toFixed(3));
      element.style.setProperty('--hero-focus', (1+progress*.08).toFixed(3));
      element.style.setProperty('--hero-copy-opacity', clamp((progress-.05)*4+.55).toFixed(3));
    } else if (element.classList.contains('principles-story')) {
      const progress = clamp(-rect.top / Math.max(1,rect.height-height));
      const active = Math.min(2,Math.floor(progress*3));
      principleLabels.forEach((label,index)=>label.classList.toggle('is-active',index===active));
      principleArticles.forEach((article,index)=>{article.classList.toggle('is-active',index===active);article.setAttribute('aria-hidden',String(index!==active));});
      element.style.setProperty('--principle-progress',progress.toFixed(3));
      element.style.setProperty('--brand-turn',`${progress*180}deg`);
    } else if (element.classList.contains('hero')) {
      const progress = clamp(-rect.top / Math.max(1, rect.height));
      element.style.setProperty('--city-drift', `${progress * (narrow ? 35 : 95)}px`);
      element.style.setProperty('--city-scale', (1.10 - progress * .06).toFixed(3));
      element.style.setProperty('--title-drift', `${progress * (narrow ? -12 : -42)}px`);
    } else if (element.classList.contains('intro')) {
      const progress = clamp((height * .78 - rect.top) / Math.max(1, rect.height * .65));
      storyWords.forEach((word, index) => word.classList.toggle('is-read', progress >= index / Math.max(1, storyWords.length)));
    } else if (element.classList.contains('service')) {
      element.classList.toggle('is-current', rect.top < height*.6 && rect.bottom > height*.3);
    } else if (element.matches('.portraits figure')) {
      const direction = element === element.parentElement.firstElementChild ? -1 : 1;
      element.style.setProperty('--portrait-drift', `${(1-entry)*(narrow?0:28)*direction}px`);
      element.style.setProperty('--portrait-reveal', `${(1-entry)*12}%`);
      element.style.setProperty('--portrait-scale', (1.045-entry*.045).toFixed(3));
    } else if (element.classList.contains('values')) {
      element.style.setProperty('--values-progress', entry.toFixed(3));
    } else if (element.classList.contains('contact')) {
      element.style.setProperty('--contact-reveal', `${(1-entry)*(narrow?3:8)}%`);
      element.style.setProperty('--contact-drift', `${(1-entry)*25}px`);
    }
  });
}
function requestScrollFrame(){if (!frame && !reducedMotion.matches && !document.hidden) frame=requestAnimationFrame(renderScroll);}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {if(entry.isIntersecting)visibleScenes.add(entry.target);else visibleScenes.delete(entry.target);});
    requestScrollFrame();
  }, {rootMargin:'15% 0px',threshold:0});
  scenes.forEach(scene => observer.observe(scene));
  document.documentElement.classList.add('scroll-story');
  window.addEventListener('scroll', requestScrollFrame, {passive:true});
  window.addEventListener('resize', requestScrollFrame, {passive:true});
  document.addEventListener('visibilitychange', requestScrollFrame);
  reducedMotion.addEventListener('change', () => {
    document.querySelectorAll('[data-reveal]').forEach(el => el.getAnimations().forEach(animation => animation.cancel()));
    if(reducedMotion.matches)principleArticles.forEach(article=>article.removeAttribute('aria-hidden'));
    requestScrollFrame();
  });
  if (!reducedMotion.matches) {
    const entrance = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.animate([{clipPath:'inset(0 0 18% 0)',transform:'translateY(18px)'},{clipPath:'inset(0)',transform:'translateY(0)'}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)'});
      entrance.unobserve(entry.target);
    }),{threshold:.18});
    document.querySelectorAll('.team-heading h2,.properties-heading h2').forEach(el => entrance.observe(el));
  }
}
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(other=>{other.classList.toggle('active',other===button);other.setAttribute('aria-pressed',String(other===button));});const choice=button.dataset.filter;const title=document.querySelector('.catalog-empty h3');if(title)title.textContent=choice==='venta'?'¿Buscas una propiedad para comprar?':choice==='renta'?'¿Buscas una propiedad en renta?':'Tu búsqueda puede empezar hoy.';const contact=document.querySelector('.catalog-empty a');if(contact){const message=choice==='venta'?'Hola Confort4, busco una propiedad para comprar.':choice==='renta'?'Hola Confort4, busco una propiedad en renta.':'Hola Confort4, me gustaría conocer las propiedades disponibles.';contact.href=`https://wa.me/525534347566?text=${encodeURIComponent(message)}`;}}));
