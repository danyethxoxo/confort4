const menuButton=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function closeNavigation(){navigation?.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){closeNavigation();menuButton.focus();}});
navigation?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeNavigation));
document.querySelector('#year')?.replaceChildren(String(new Date().getFullYear()));
const requestedInterest=new URLSearchParams(location.search).get('interes');
document.querySelectorAll('form.site-form').forEach(form=>{
 const interest=form.querySelector('[name="interest"]');
 if(interest&&[...interest.options].some(option=>option.value===requestedInterest))interest.value=requestedInterest;
 let lastPayload='',requestId='';
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const status=form.querySelector('.form-status'),button=form.querySelector('button[type="submit"]');
  const initialLabel=button.innerHTML;
  const data=new FormData(form);
  const payload={kind:form.dataset.kind,name:String(data.get('name')||'').trim(),email:String(data.get('email')||'').trim(),phone:String(data.get('phone')||'').trim(),interest:String(data.get('interest')||''),message:String(data.get('message')||'').trim(),rating:Number(data.get('rating')||0),consent:data.get('consent')==='on',publishConsent:data.get('publishConsent')==='on',website:String(data.get('website')||'')};
  const serialized=JSON.stringify(payload);
  if(serialized!==lastPayload){requestId=crypto.randomUUID();lastPayload=serialized;}
  status.textContent='Enviando tu mensaje…';status.classList.remove('is-error');
  button.disabled=true;button.textContent='Enviando…';form.setAttribute('aria-busy','true');
  try{
   const config=window.CONFORT4_FORMS;
   if(!config?.endpoint||!config?.anonKey)throw new Error('El formulario no está disponible. Escríbenos por WhatsApp.');
   const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publishableKey,Authorization:'Bearer '+config.anonKey},body:JSON.stringify({...payload,requestId}),signal:AbortSignal.timeout(20000)});
   const result=await response.json().catch(()=>null);
   if(!response.ok||!result?.ok)throw new Error(result?.error||'No pudimos confirmar el envío. Intenta otra vez o usa WhatsApp.');
   status.textContent=result.message;
   form.classList.add('is-complete');
   form.querySelectorAll('input,textarea,select').forEach(field=>field.disabled=true);
   button.textContent=form.dataset.kind==='review'?'Reseña recibida':'Mensaje recibido';
   status.focus();
  }catch(error){
   status.textContent=error.name==='TimeoutError'?'La conexión tardó demasiado. Intenta de nuevo; evitaremos duplicar tu mensaje.':error.message;
   status.classList.add('is-error');button.disabled=false;button.innerHTML=initialLabel;status.focus();
  }finally{form.removeAttribute('aria-busy');}
 });
});
// Restrained entrances; all content remains visible without JavaScript.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;if(!motionPreference.matches)entry.target.animate([{transform:'translateY(18px)',opacity:.65},{transform:'translateY(0)',opacity:1}],{duration:600,easing:'cubic-bezier(.16,1,.3,1)'});observer.unobserve(entry.target);});},{threshold:.16});
 document.querySelectorAll('[data-reveal]').forEach(element=>observer.observe(element));
 motionPreference.addEventListener('change',()=>{if(motionPreference.matches)document.querySelectorAll('[data-reveal]').forEach(element=>element.getAnimations().forEach(animation=>animation.cancel()));});
}
