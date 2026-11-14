import {renderPage} from './ui.mjs?v=20261114tarjetas';
import {initializeReferenceMotion} from './reference-motion.mjs?v=20261114tarjetas';
const config=window.CONFORT4_FORMS,main=document.querySelector('main'),page=document.body.dataset.page,params=Object.fromEntries(new URLSearchParams(location.search));
if(page==='home'&&location.hash==='#contacto'){const destination=new URL('contacto.html',location.href);destination.search=location.search;location.replace(destination.href);}
params.id=params.id||document.body.dataset.routeId;params.slug=params.slug||document.body.dataset.routeSlug;
let bundle=JSON.parse(document.querySelector('#site-data').textContent),dirty=false;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const storage={get(k,f){try{return JSON.parse(localStorage.getItem('confort4-'+k))??f;}catch{return f;}},set(k,v){try{localStorage.setItem('confort4-'+k,JSON.stringify(v));}catch{}}};
let favorites=new Set(storage.get('favorites',[]));
const menu=$('.menu-toggle'),nav=$('#navigation');
const interest=$('.nav-interest'),interestToggle=$('.nav-interest-toggle'),interestLinks=$('#interest-links');
function setInterest(open){if(!interestToggle||!interestLinks)return;interestToggle.setAttribute('aria-expanded',String(open));interestLinks.hidden=!open;}
interestToggle?.addEventListener('click',()=>setInterest(interestToggle.getAttribute('aria-expanded')!=='true'));
interest?.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&window.innerWidth>1000)setInterest(true);});
interest?.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse'&&!interest.contains(document.activeElement))setInterest(false);});
interest?.addEventListener('focusout',event=>{if(!interest.contains(event.relatedTarget))setInterest(false);});
interest?.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setInterest(false);interestToggle.focus();}if(event.key==='ArrowDown'&&event.target===interestToggle){event.preventDefault();setInterest(true);$('a',interestLinks)?.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.nav-interest'))setInterest(false);});
function setMenu(open){
 if(!menu||!nav)return;
 nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));if(!open)setInterest(false);
 menu.firstChild.textContent=open?'Cerrar ':'Menú ';
 menu.querySelector('path')?.setAttribute('d',open?'M6 6l12 12M6 18 18 6':'M4 8h16M4 16h16');
}
function closeMenu(){setMenu(false);}
menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
document.addEventListener('click',event=>{if(nav?.classList.contains('open')&&!event.target.closest('.header'))closeMenu();});
window.addEventListener('resize',()=>{if(window.innerWidth>1000&&nav?.classList.contains('open'))closeMenu();},{passive:true});
nav?.addEventListener('click',ev=>{if(ev.target.closest('a'))closeMenu();});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&interestToggle?.getAttribute('aria-expanded')==='true'){setInterest(false);interestToggle.focus();return;}if(ev.key==='Escape'&&nav?.classList.contains('open')){closeMenu();menu.focus();}});
$('#year')?.replaceChildren(String(new Date().getFullYear()));
document.addEventListener('input',ev=>{if(ev.target.closest('main'))dirty=true;});
main.addEventListener('change',()=>dirty=true);
function normalize(t){return String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function markFavorites(){
 $$('[data-favorite]').forEach(b=>{const saved=favorites.has(b.dataset.favorite);b.setAttribute('aria-pressed',String(saved));b.setAttribute('aria-label',saved?'Quitar de guardadas':'Guardar propiedad');});
}
function updateChecklist(section){const inputs=$$('input[type=checkbox]',section),done=inputs.filter(c=>c.checked).length;$('progress',section).value=done;$('.checklist-status',section).textContent=done+' de '+inputs.length+' revisados';storage.set('checklist-'+section.dataset.checklist,inputs.map(c=>c.checked));}
function searchText(selector,query,empty){const q=normalize(query);let count=0;$$(selector).forEach(el=>{el.hidden=!normalize(el.textContent).includes(q);if(!el.hidden)count++;});if($(empty))$(empty).hidden=count>0;}
function blogFilter(){
 const query=$('#blog-search').value.trim(), terms=normalize(query).split(/\s+/).filter(t=>t.length>2&&!['que','como','para','una','los','las','del','por','con'].includes(t));let count=0;
 $$('[data-post]').forEach(card=>{const text=normalize(card.dataset.search||card.textContent);card.hidden=!!query&&!terms.every(term=>text.includes(term));if(!card.hidden)count++;});
 $('#blog-empty').hidden=count>0;
 $('#blog-question-link').href='contacto.html?interes=general&duda='+encodeURIComponent(query)+'#contacto';
}
function zoneLabel(form){const label=$('[data-zone-label]',form);if(label)label.textContent=['vender','rentar-arrendador'].includes(form.elements.interest.value)?'¿En qué zona se encuentra tu propiedad? · opcional':'¿Cuál es tu zona de interés? · opcional';}
function setStep(form,n){form.dataset.currentStep=n;$$('[data-step]',form).forEach((s,i)=>{s.hidden=i!==n;$$('input,textarea,select',s).forEach(f=>f.disabled=i!==n);});$$('.wizard-progress li',form).forEach((li,i)=>{if(i===n)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});if(n===2){const interest=form.elements.interest;$('.project-summary',form).textContent=interest.selectedOptions[0].textContent+(form.elements.zone.value?' · '+form.elements.zone.value:'');}if(n>0)$('[data-step="'+n+'"] legend',form)?.scrollIntoView({block:'nearest',behavior:'auto'});}
function validateStep(form){let valid=true;$$('[data-step]:not([hidden]) input,[data-step]:not([hidden]) select,[data-step]:not([hidden]) textarea',form).forEach(f=>{const error=$('[data-error-for="'+f.name+'"]',form);if(error)error.textContent=f.validity.valid?'':f.validationMessage;f.setAttribute('aria-invalid',String(!f.validity.valid));if(!f.validity.valid&&valid){f.reportValidity();valid=false;}});return valid;}
function preference(form){const email=form.elements.email,phone=form.elements.phone,phonePreferred=!!form.elements.contact_preference && form.elements.contact_preference.value!=='email';email.required=!phonePreferred;phone.required=phonePreferred;if(phonePreferred)phone.pattern='[+0-9 () .\\-]{7,30}';else phone.removeAttribute('pattern');}
function initSelects(){
 $$('.site-form select').forEach((select,index)=>{
  if(select.dataset.styled)return;select.dataset.styled='true';
  const wrapper=document.createElement('div');wrapper.className='styled-select';
  const button=document.createElement('button');button.type='button';button.className='select-trigger';button.setAttribute('role','combobox');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');
  const label=select.closest('label').firstChild.textContent.trim();button.setAttribute('aria-label',label);
  const list=document.createElement('div');list.className='select-options';list.role='listbox';list.id='select-options-'+index;list.setAttribute('aria-label',label);list.hidden=true;button.setAttribute('aria-controls',list.id);
  let active=select.selectedIndex;
  const options=[...select.options].map((option,i)=>{const item=document.createElement('div');item.role='option';item.id=list.id+'-'+i;item.textContent=option.textContent;item.addEventListener('click',ev=>{ev.preventDefault();choose(i);});list.append(item);return item;});
  function sync(){button.textContent=select.selectedOptions[0]?.textContent||'';options.forEach((item,i)=>item.setAttribute('aria-selected',String(i===select.selectedIndex)));}
  function highlight(){options.forEach((item,i)=>item.classList.toggle('is-active',i===active));button.setAttribute('aria-activedescendant',options[active].id);options[active].scrollIntoView?.({block:'nearest'});}
  function close(){list.hidden=true;button.setAttribute('aria-expanded','false');button.removeAttribute('aria-activedescendant');}
  function open(){document.dispatchEvent(new window.Event('close-selects'));list.hidden=false;button.setAttribute('aria-expanded','true');active=select.selectedIndex;highlight();}
  function choose(i){select.selectedIndex=i;select.dispatchEvent(new window.Event('change',{bubbles:true}));sync();close();button.focus();}
  button.addEventListener('click',ev=>{ev.preventDefault();list.hidden?open():close();});
  button.addEventListener('keydown',ev=>{if(['ArrowDown','ArrowUp','Home','End'].includes(ev.key)){ev.preventDefault();if(list.hidden)open();else active=ev.key==='Home'?0:ev.key==='End'?options.length-1:Math.max(0,Math.min(options.length-1,active+(ev.key==='ArrowDown'?1:-1)));highlight();}else if(['Enter',' '].includes(ev.key)&&!list.hidden){ev.preventDefault();choose(active);}else if(ev.key==='Escape'){ev.preventDefault();close();}else if(ev.key==='Tab')close();});
  document.addEventListener('close-selects',close);document.addEventListener('click',ev=>{if(!wrapper.contains(ev.target))close();});
  select.addEventListener('change',sync);select.addEventListener('invalid',ev=>{ev.preventDefault();button.focus();button.setAttribute('aria-invalid','true');},{capture:true});select.addEventListener('change',()=>button.removeAttribute('aria-invalid'));
  select.classList.add('select-native');select.tabIndex=-1;select.setAttribute('aria-hidden','true');select.after(wrapper);wrapper.append(button,list);sync();
 });
}
function init(){
 initializeReferenceMotion(main);
 $$('.review-carousel').forEach(carousel=>{
  carousel.dataset.reviewIndex='0';carousel.tabIndex=0;showReviewGroup(carousel,0);
  carousel.addEventListener('keydown',event=>{if(event.target===carousel&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();moveReview(carousel,event.key==='ArrowLeft'?-1:1);}});
  let start=null;
  carousel.addEventListener('touchstart',event=>{start=event.touches[0]?.clientX;},{passive:true});
  carousel.addEventListener('touchend',event=>{const end=event.changedTouches[0]?.clientX;if(start!=null&&Math.abs(end-start)>60)moveReview(carousel,end<start?1:-1);start=null;},{passive:true});
 });
 $$('.property-gallery-thumbs').forEach(track=>{track.addEventListener('scroll',()=>updateThumbArrows(track),{passive:true});updateThumbArrows(track);});
 $$('.review-full-dialog').forEach(dialog=>{dialog.setAttribute('data-lenis-prevent','');dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});});
 if(preview){$$('a[href]',main).forEach(a=>{const url=new URL(a.getAttribute('href'),location.href);if(url.origin===location.origin&&url.pathname.endsWith('.html')&&!/\/(admin|privacidad|resena)\.html$/.test(url.pathname)){url.searchParams.set('preview','1');a.href=url.href;}});$$('button[type=submit]',main).forEach(b=>{b.disabled=true;b.textContent='Formulario en vista previa';});}
 $$('[data-checklist]').forEach(s=>{const saved=storage.get('checklist-'+s.dataset.checklist,[]);$$('[data-check]',s).forEach((c,i)=>c.checked=!!saved[i]);updateChecklist(s);});
 $$('form[data-kind=contact]').forEach(form=>{form.noValidate=true;const requested=params.interes;if([...form.elements.interest.options].some(o=>o.value===requested))form.elements.interest.value=requested;preference(form);zoneLabel(form);if(params.duda){form.elements.message.value='Consulta desde el blog: '+params.duda.slice(0,200); }if(form.matches('.project-form'))setStep(form,0);});
 initSelects();
 markFavorites();
 if(page==='article'){const post=bundle.content.posts.find(p=>p.slug===params.slug&&p.published!==false);if(post)document.title=post.title+' | Confort4';}
 if(page==='property'){
  const property=bundle.properties.find(p=>p.id===params.id);if(property)document.title=property.titulo+' | Confort4';
  const description=$('#property-description'),toggle=$('[data-description-toggle]');
  if(toggle&&description){description.classList.add('is-collapsed');toggle.hidden=false;}
  const viewer=$('.property-viewer');
  viewer?.setAttribute('data-lenis-prevent','');
  viewer?.addEventListener('click',ev=>{if(ev.target===viewer)viewer.close();});
  viewer?.addEventListener('keydown',ev=>{if(['ArrowLeft','ArrowRight'].includes(ev.key)){ev.preventDefault();chooseGallery(Number(viewer.dataset.index||0)+(ev.key==='ArrowLeft'?-1:1));}});
  let swipeStart=null;
  viewer?.addEventListener('touchstart',ev=>{swipeStart=ev.touches[0]?.clientX;},{passive:true});
  viewer?.addEventListener('touchend',ev=>{const end=ev.changedTouches[0]?.clientX;if(swipeStart!=null&&Math.abs(end-swipeStart)>60)chooseGallery(Number(viewer.dataset.index||0)+(end<swipeStart?1:-1));swipeStart=null;},{passive:true});
 }
}
function chooseGallery(index){
 const thumbnails=$$('[data-gallery]');if(!thumbnails.length)return;
 const selected=(index+thumbnails.length)%thumbnails.length,thumb=thumbnails[selected],viewer=$('.property-viewer');
 $('#gallery-main').src=thumb.dataset.gallery;
 thumbnails.forEach(b=>b.setAttribute('aria-pressed',String(b===thumb)));
 if(viewer){viewer.dataset.index=String(selected);const image=$('[data-gallery-full]',viewer);image.src=thumb.dataset.gallery;image.alt=$('#gallery-main').alt+' · Foto '+(selected+1);$('[data-gallery-count]',viewer).textContent=(selected+1)+' / '+thumbnails.length;}
}
function reviewGroupSize(){return window.innerWidth>1000?3:window.innerWidth>600?2:1;}
function showReviewGroup(carousel,index){const slides=$$('[data-review-slide]',carousel),size=reviewGroupSize();if(!slides.length)return;index=Math.min(Math.max(0,index),Math.max(0,slides.length-size));carousel.dataset.reviewIndex=String(index);slides.forEach((slide,i)=>{slide.hidden=i<index||i>=index+size;if(!slide.hidden){const quote=$('blockquote',slide),read=$('[data-review-read]',slide);if(read)read.style.visibility=quote.scrollHeight>quote.clientHeight+1?'visible':'hidden';}});$('[data-review-count]',carousel).textContent=(index+1)+(size>1?'–'+Math.min(index+size,slides.length):'')+' / '+slides.length;}
async function moveReview(carousel,direction){
 if(carousel.dataset.animating==='true')return;
 const slides=$$('[data-review-slide]',carousel),size=reviewGroupSize(),current=Number(carousel.dataset.reviewIndex||0);if(!slides.length)return;
 let next=current+direction*size;if(next>=slides.length)next=0;if(next<0)next=Math.max(0,slides.length-size);
 const visible=slides.filter(slide=>!slide.hidden),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced||!visible[0]?.animate){showReviewGroup(carousel,next);return;}
 carousel.dataset.animating='true';carousel.setAttribute('aria-busy','true');const buttons=$$('[data-review-direction]',carousel);buttons.forEach(button=>button.disabled=true);
 const fold=(cards,enter)=>cards.map((card,i)=>{const origin=(i%2===0)===(direction>0)?'left center':'right center';card.style.transformOrigin=origin;const folded={opacity:0,transform:'perspective(900px) rotateY('+(direction*65)+'deg) scaleX(.3)'};const flat={opacity:1,transform:'perspective(900px) rotateY(0deg) scaleX(1)'};return card.animate(enter?[folded,flat]:[flat,folded],{duration:enter?260:170,delay:i*35,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'});});
 try{const out=fold(visible,false);await Promise.all(out.map(animation=>animation.finished.catch(()=>{})));showReviewGroup(carousel,next);out.forEach(animation=>animation.cancel());const incoming=slides.filter(slide=>!slide.hidden),animations=fold(incoming,true);await Promise.all(animations.map(animation=>animation.finished.catch(()=>{})));animations.forEach(animation=>animation.cancel());}finally{slides.forEach(slide=>slide.style.removeProperty('transform-origin'));carousel.dataset.animating='false';carousel.removeAttribute('aria-busy');buttons.forEach(button=>button.disabled=false);}
}
function updateThumbArrows(track){const wrapper=track.closest('.property-thumbnail-carousel');if(!wrapper)return;$('[data-thumbs-direction="-1"]',wrapper).disabled=track.scrollLeft<=2;$('[data-thumbs-direction="1"]',wrapper).disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;}
window.addEventListener('resize',()=>{$$('.review-carousel').forEach(carousel=>showReviewGroup(carousel,Number(carousel.dataset.reviewIndex||0)));$$('.property-gallery-thumbs').forEach(updateThumbArrows);},{passive:true});
main.addEventListener('click',ev=>{
 const target=ev.target.closest('button');if(!target)return;
 dirty=true;
 if(target.matches('[data-review-direction]'))moveReview(target.closest('.review-carousel'),Number(target.dataset.reviewDirection));
 if(target.matches('[data-review-read]')){const figure=target.closest('figure'),dialog=target.closest('.google-reviews').querySelector('.review-full-dialog');$('h2',dialog).textContent=$('figcaption',figure).firstChild.textContent;$('blockquote',dialog).textContent=$('blockquote',figure).textContent;dialog.showModal();}
 if(target.matches('[data-review-close]'))target.closest('dialog').close();
 if(target.matches('[data-thumbs-direction]')){const track=$('.property-gallery-thumbs',target.closest('.property-thumbnail-carousel'));track.scrollBy({left:Number(target.dataset.thumbsDirection)*track.clientWidth*.85,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 if(target.matches('[data-favorite]')){const id=target.dataset.favorite;favorites.has(id)?favorites.delete(id):favorites.add(id);storage.set('favorites',[...favorites]);markFavorites();}
 if(target.matches('[data-gallery]'))chooseGallery($$('[data-gallery]').indexOf(target));
 if(target.matches('[data-gallery-open]'))$('.property-viewer')?.showModal();
 if(target.matches('[data-gallery-close]'))$('.property-viewer')?.close();
 if(target.matches('[data-gallery-step]'))chooseGallery(Number($('.property-viewer').dataset.index||0)+Number(target.dataset.galleryStep));
 if(target.matches('[data-description-toggle]')){const expanded=target.getAttribute('aria-expanded')!=='true';target.setAttribute('aria-expanded',String(expanded));$('#property-description').classList.toggle('is-collapsed',!expanded);target.textContent=expanded?'Leer menos':'Leer descripción completa';}
 if(target.matches('[data-print]')){const checklist=target.closest('[data-checklist]');$$('[data-checklist]').forEach(el=>el.classList.toggle('print-selected',el===checklist));window.print();}
 if(target.matches('[data-next],[data-back]')){const f=target.closest('form'),step=Number(f.dataset.currentStep);if(target.matches('[data-back]'))setStep(f,step-1);else if(validateStep(f))setStep(f,step+1);}
});
main.addEventListener('input',ev=>{const el=ev.target;if(el.id==='faq-search')searchText('[data-faq]',el.value,'.faq-empty');if(el.id==='blog-search')blogFilter();});
main.addEventListener('change',ev=>{const el=ev.target;if(el.name==='interest'&&el.form?.dataset.kind==='contact')zoneLabel(el.form);if(el.name==='contact_preference')preference(el.form);if(el.matches('[data-check]'))updateChecklist(el.closest('[data-checklist]'));});
const requests=new WeakMap();
main.addEventListener('submit',async ev=>{
 const form=ev.target;if(!form.matches('form.site-form'))return;ev.preventDefault();if(preview||form.getAttribute('aria-busy')==='true')return;
 if(form.matches('.project-form')&&Number(form.dataset.currentStep)!==2){if(validateStep(form))setStep(form,Number(form.dataset.currentStep)+1);return;}
 if(form.matches('.project-form')&&!validateStep(form))return;
 if(!form.matches('.project-form')&&!form.reportValidity())return;
 // All wizard fields are enabled only after the visible step has been validated.
 $$('[data-step] input,[data-step] textarea,[data-step] select',form).forEach(f=>f.disabled=false);
 const data=new FormData(form),get=n=>String(data.get(n)||'').trim();
 const project={zone:get('zone'),property_type:get('property_type'),budget:get('budget'),timeframe:get('timeframe'),contact_preference:get('contact_preference')||'email',property_id:params.propiedad||'',page:location.pathname.split('/').pop()};
 const summary=[get('interest'),project.zone,project.property_type,project.budget,project.timeframe].filter(Boolean).join(' · ');
 const payload={kind:form.dataset.kind,name:get('name'),email:get('email'),phone:get('phone'),interest:get('interest'),message:get('message')||(form.dataset.kind==='contact'?'Proyecto inmobiliario: '+summary:''),rating:Number(get('rating')||0),consent:data.get('consent')==='on',publishConsent:data.get('publishConsent')==='on',website:get('website'),...(form.dataset.kind==='contact'?{project}:{})};
 if(form.matches('.project-form'))setStep(form,2);
 const key=JSON.stringify(payload);let request=requests.get(form);if(!request||request.key!==key){request={key,id:crypto.randomUUID()};requests.set(form,request);}
 const status=$('.form-status',form),button=$('button[type=submit]',form),label=button.innerHTML;
 button.disabled=true;button.textContent='Enviando…';form.setAttribute('aria-busy','true');status.textContent='Enviando tu proyecto…';status.classList.remove('is-error');
 try{const res=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publishableKey,Authorization:'Bearer '+config.anonKey},body:JSON.stringify({...payload,requestId:request.id}),signal:AbortSignal.timeout(20000)});const result=await res.json();if(!res.ok||!result.ok)throw Error(result.error||'No pudimos confirmar el envío.');status.textContent=result.message;form.classList.add('is-complete');$$('input,select,textarea,button',form).forEach(el=>el.disabled=true);button.textContent='Recibido';status.focus();}
 catch(error){status.textContent=error.name==='TimeoutError'?'La conexión tardó demasiado. Intenta de nuevo; evitaremos duplicar el envío.':error.message||'No se pudo enviar. Usa WhatsApp o intenta otra vez.';status.classList.add('is-error');button.disabled=false;button.innerHTML=label;status.focus();}
 finally{form.removeAttribute('aria-busy');}
});
if(['property','article'].includes(page))main.innerHTML=renderPage(bundle,page,params);
let preview=false;
if(params.preview==='1'){const content=storage.get('preview',null);if(content){bundle={...bundle,content};main.innerHTML=renderPage(bundle,page,params)||main.innerHTML;const banner=document.createElement('div');banner.className='preview-banner';banner.textContent='Vista previa del borrador · estos cambios todavía no son públicos.';main.before(banner);preview=true;}}
init();

function heroSignature(hero) {
 if (!hero) return '';
 const heading = hero.querySelector('h1');
 return JSON.stringify([
  heading?.dataset.motionText || heading?.textContent.trim(),
  hero.querySelector('.hero-image')?.getAttribute('src'),
  hero.querySelector('.hero-aside p')?.textContent.trim()
 ]);
}
if (!preview) {
 fetch(config.endpoint.replace('confort4-forms','confort4-site'), {
  method:'POST',
  headers:{'Content-Type':'application/json',apikey:config.publishableKey,Authorization:'Bearer '+config.anonKey},
  body:JSON.stringify({action:'public'}),
  signal:AbortSignal.timeout(15000)
 }).then(async response => {
  if (!response.ok) throw Error('feed');
  const live = await response.json();
  if (!live.content?.home) throw Error('feed');
  bundle = live;
  if (dirty || ['privacy','review'].includes(page)) return;
  const previousHero = main.querySelector('.hero');
  const signature = heroSignature(previousHero);
  const template = document.createElement('template');
  template.innerHTML = renderPage(bundle,page,params);
  const nextHero = template.content.querySelector('.hero');
  if (previousHero && signature === heroSignature(nextHero)) {
   nextHero.remove();
   [...main.children].forEach(element => { if (element !== previousHero) element.remove(); });
   main.append(template.content);
  } else {
   main.replaceChildren(template.content);
  }
  init();
  if (location.hash) $(location.hash)?.scrollIntoView({block:'start'});
 }).catch(() => {
  $$('.catalog-status').forEach(element => {
   element.textContent='Mostrando la última selección disponible. Confirma vigencia con el equipo.';
  });
 });
}

