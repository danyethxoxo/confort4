import {renderPage,e,propertyCard,money,imageOf,safeURL} from './ui.mjs?v=32';
import {initializeReferenceMotion} from './reference-motion.mjs?v=32';
const config=window.CONFORT4_FORMS,main=document.querySelector('main'),page=document.body.dataset.page,params=Object.fromEntries(new URLSearchParams(location.search));
params.id=params.id||document.body.dataset.routeId;params.slug=params.slug||document.body.dataset.routeSlug;
let bundle=JSON.parse(document.querySelector('#site-data').textContent),dirty=false;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const storage={get(k,f){try{return JSON.parse(localStorage.getItem('confort4-'+k))??f;}catch{return f;}},set(k,v){try{localStorage.setItem('confort4-'+k,JSON.stringify(v));}catch{}}};
let favorites=new Set(storage.get('favorites',[])),comparisons=new Set(),favoritesOnly=false;
const menu=$('.menu-toggle'),nav=$('#navigation');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav?.addEventListener('click',ev=>{if(ev.target.closest('a'))closeMenu();});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&nav?.classList.contains('open')){closeMenu();menu.focus();}});
$('#year')?.replaceChildren(String(new Date().getFullYear()));
document.addEventListener('input',ev=>{if(ev.target.closest('main'))dirty=true;});
main.addEventListener('change',()=>dirty=true);
function normalize(t){return String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function markFavorites(){
 $$('[data-favorite]').forEach(b=>{const saved=favorites.has(b.dataset.favorite);b.setAttribute('aria-pressed',String(saved));b.setAttribute('aria-label',saved?'Quitar de guardadas':'Guardar propiedad');});
 $$('[data-compare]').forEach(c=>c.checked=comparisons.has(c.dataset.compare));
}
function filterProperties(){
 if(!$('#property-grid'))return;
 const query=normalize($('#property-search').value),op=$('#property-operation').value,currency=$('#property-currency').value,max=currency?(Number($('#property-budget').value)||Infinity):Infinity;
 const results=bundle.properties.filter(p=>(!op||normalize(p.operacion).includes(op))&&(!currency||p.moneda===currency)&&(!query||normalize([p.titulo,p.colonia,p.municipio,p.estado,p.descripcion].join(' ')).includes(query))&&Number(p.precio||0)<=max&&(!favoritesOnly||favorites.has(p.id)));
 $('#property-grid').innerHTML=results.length?results.map(propertyCard).join(''):'<div class="catalog-empty"><h3>No hay coincidencias por ahora.</h3><p>Prueba otra zona, cambia el precio o cuéntanos qué buscas.</p><a class="text-link" href="index.html#contacto">Solicitar opciones →</a></div>';
 $('#catalog-count').textContent=results.length+' '+(results.length===1?'propiedad':'propiedades');markFavorites();
}
function compare(){const panel=$('#comparison');if(!panel)return;const items=bundle.properties.filter(p=>comparisons.has(p.id));panel.hidden=!items.length;if(!items.length)return;
 const rows=[['Precio',p=>money(p.precio,p.moneda)+' '+p.moneda],['Operación',p=>p.operacion],['Zona',p=>[p.colonia,p.municipio].filter(Boolean).join(', ')],['Recámaras',p=>p.recamaras??'Por confirmar'],['Baños',p=>p.banos??'Por confirmar'],['Construcción',p=>p.m2_construccion?p.m2_construccion+' m²':'Por confirmar'],['Estacionamientos',p=>p.estacionamientos??'Por confirmar']];
 panel.innerHTML=`<div class="module-heading"><h3>Compara lo que te importa.</h3><button class="text-button" data-clear-compare>Limpiar comparación</button></div><p role="status">${items.length} de 3 propiedades seleccionadas</p><div class="table-scroll"><table><caption>Comparación de propiedades seleccionadas</caption><thead><tr><th scope="col">Característica</th>${items.map(p=>`<th scope="col"><a href="propiedad.html?id=${encodeURIComponent(p.id)}">${e(p.titulo)}</a></th>`).join('')}</tr></thead><tbody>${rows.map(([label,fn])=>`<tr><th scope="row">${label}</th>${items.map(p=>`<td>${e(fn(p))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function updateChecklist(section){const inputs=$$('input[type=checkbox]',section),done=inputs.filter(c=>c.checked).length;$('progress',section).value=done;$('.checklist-status',section).textContent=done+' de '+inputs.length+' revisados';storage.set('checklist-'+section.dataset.checklist,inputs.map(c=>c.checked));}
function searchText(selector,query,empty){const q=normalize(query);let count=0;$$(selector).forEach(el=>{el.hidden=!normalize(el.textContent).includes(q);if(!el.hidden)count++;});if($(empty))$(empty).hidden=count>0;}
function blogFilter(){let n=0;const q=normalize($('#blog-search').value),category=$('#blog-category').value;$$('[data-post]').forEach(el=>{el.hidden=!(normalize(el.textContent).includes(q)&&(!category||category===el.dataset.category));if(!el.hidden)n++;});$('#blog-empty').hidden=n>0;}
function setStep(form,n){form.dataset.currentStep=n;$$('[data-step]',form).forEach((s,i)=>{s.hidden=i!==n;$$('input,textarea,select',s).forEach(f=>f.disabled=i!==n);});$$('.wizard-progress li',form).forEach((li,i)=>{if(i===n)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});if(n===2){const interest=form.elements.interest;$('.project-summary',form).textContent=interest.selectedOptions[0].textContent+(form.elements.zone.value?' · '+form.elements.zone.value:'');}if(n>0)$('[data-step="'+n+'"] legend',form)?.scrollIntoView({block:'nearest',behavior:'auto'});}
function validateStep(form){let valid=true;$$('[data-step]:not([hidden]) input,[data-step]:not([hidden]) select,[data-step]:not([hidden]) textarea',form).forEach(f=>{const error=$('[data-error-for="'+f.name+'"]',form);if(error)error.textContent=f.validity.valid?'':f.validationMessage;f.setAttribute('aria-invalid',String(!f.validity.valid));if(!f.validity.valid&&valid){f.reportValidity();valid=false;}});return valid;}
function preference(form){const email=form.elements.email,phone=form.elements.phone,phonePreferred=form.elements.contact_preference?.value!=='email';email.required=!phonePreferred;phone.required=phonePreferred;if(phonePreferred)phone.pattern='[+0-9 () .\\-]{7,30}';else phone.removeAttribute('pattern');}
function init(){
 initializeReferenceMotion(main);
 if(preview){$$('a[href]',main).forEach(a=>{const url=new URL(a.getAttribute('href'),location.href);if(url.origin===location.origin&&url.pathname.endsWith('.html')&&!/\/(admin|privacidad|resena)\.html$/.test(url.pathname)){url.searchParams.set('preview','1');a.href=url.href;}});$$('button[type=submit]',main).forEach(b=>{b.disabled=true;b.textContent='Formulario en vista previa';});}
 $$('[data-checklist]').forEach(s=>{const saved=storage.get('checklist-'+s.dataset.checklist,[]);$$('[data-check]',s).forEach((c,i)=>c.checked=!!saved[i]);updateChecklist(s);});
 $$('form[data-kind=contact]').forEach(form=>{form.noValidate=true;const requested=params.interes;if([...form.elements.interest.options].some(o=>o.value===requested))form.elements.interest.value=requested;preference(form);if(form.matches('.project-form'))setStep(form,0);});
 markFavorites();
 if(page==='article'){const post=bundle.content.posts.find(p=>p.slug===params.slug&&p.published!==false);if(post)document.title=post.title+' | Confort4';}
 if(page==='property'){const property=bundle.properties.find(p=>p.id===params.id);if(property)document.title=property.titulo+' | Confort4';}
}
main.addEventListener('click',ev=>{
 const target=ev.target.closest('button');if(!target)return;
 dirty=true;
 if(target.matches('[data-favorite]')){const id=target.dataset.favorite;favorites.has(id)?favorites.delete(id):favorites.add(id);storage.set('favorites',[...favorites]);if(favoritesOnly)filterProperties();else markFavorites();}
 if(target.matches('.favorites-filter')){favoritesOnly=!favoritesOnly;target.setAttribute('aria-pressed',String(favoritesOnly));filterProperties();}
 if(target.matches('[data-clear-compare]')){comparisons.clear();compare();markFavorites();}
 if(target.matches('[data-gallery]')){$('#gallery-main').src=target.dataset.gallery;$$('[data-gallery]').forEach(b=>b.setAttribute('aria-pressed',String(b===target)));}
 if(target.matches('[data-print]')){const checklist=target.closest('[data-checklist]');$$('[data-checklist]').forEach(el=>el.classList.toggle('print-selected',el===checklist));window.print();}
 if(target.matches('[data-next],[data-back]')){const f=target.closest('form'),step=Number(f.dataset.currentStep);if(target.matches('[data-back]'))setStep(f,step-1);else if(validateStep(f))setStep(f,step+1);}
});
main.addEventListener('input',ev=>{const el=ev.target;if(el.matches('#property-search,#property-budget'))filterProperties();if(el.id==='faq-search')searchText('[data-faq]',el.value,'.faq-empty');if(el.id==='blog-search')blogFilter();});
main.addEventListener('change',ev=>{const el=ev.target;if(el.id==='property-operation')filterProperties();if(el.id==='property-currency'){$('#property-budget').disabled=!el.value;$('#property-budget').value='';filterProperties();}if(el.id==='blog-category')blogFilter();if(el.name==='contact_preference')preference(el.form);if(el.matches('[data-check]'))updateChecklist(el.closest('[data-checklist]'));if(el.matches('[data-compare]')){if(el.checked&&comparisons.size>=3){el.checked=false;$('#catalog-count').textContent='Puedes comparar hasta 3 propiedades. Quita una para agregar otra.';return;}el.checked?comparisons.add(el.dataset.compare):comparisons.delete(el.dataset.compare);compare();}});
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
