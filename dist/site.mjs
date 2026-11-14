import {renderPage} from './ui.mjs?v=20261113servicios';
import {initializeReferenceMotion} from './reference-motion.mjs?v=20261113servicios';
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
 if(preview){$$('a[href]',main).forEach(a=>{const url=new URL(a.getAttribute('href'),location.href);if(url.origin===location.origin&&url.pathname.endsWith('.html')&&!/\/(admin|privacidad|resena)\.html$/.test(url.pathname)){url.searchParams.set('preview','1');a.href=url.href;}});$$('button[type=submit]',main).forEach(b=>{b.disabled=true;b.textContent='Formulario en vista previa';});}
 $$('[data-checklist]').forEach(s=>{const saved=storage.get('checklist-'+s.dataset.checklist,[]);$$('[data-check]',s).forEach((c,i)=>c.checked=!!saved[i]);updateChecklist(s);});
 $$('form[data-kind=contact]').forEach(form=>{form.noValidate=true;const requested=params.interes;if([...form.elements.interest.options].some(o=>o.value===requested))form.elements.interest.value=requested;preference(form);zoneLabel(form);if(params.duda){form.elements.message.value='Consulta desde el blog: '+params.duda.slice(0,200); }if(form.matches('.project-form'))setStep(form,0);});
 initSelects();
 markFavorites();
 if(page==='article'){const post=bundle.content.posts.find(p=>p.slug===params.slug&&p.published!==false);if(post)document.title=post.title+' | Confort4';}
 if(page==='property'){const property=bundle.properties.find(p=>p.id===params.id);if(property)document.title=property.titulo+' | Confort4';}
}
main.addEventListener('click',ev=>{
 const target=ev.target.closest('button');if(!target)return;
 dirty=true;
 if(target.matches('[data-favorite]')){const id=target.dataset.favorite;favorites.has(id)?favorites.delete(id):favorites.add(id);storage.set('favorites',[...favorites]);markFavorites();}
 if(target.matches('[data-gallery]')){$('#gallery-main').src=target.dataset.gallery;$$('[data-gallery]').forEach(b=>b.setAttribute('aria-pressed',String(b===target)));}
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

