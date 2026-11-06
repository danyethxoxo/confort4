const menuButton=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function closeNavigation(){navigation?.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){closeNavigation();menuButton.focus();}});
navigation?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeNavigation));
const serviceDetails=[...document.querySelectorAll('.service-accordion details')];
function openService(target){if(!target)return;serviceDetails.forEach(detail=>{detail.open=detail===target;});}
function openRequestedService(){openService(serviceDetails.find(detail=>`#${detail.id}`===location.hash));}
window.addEventListener('hashchange',openRequestedService);
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>openService(serviceDetails.find(detail=>`#${detail.id}`===link.getAttribute('href')))));
openRequestedService();
document.querySelector('#year')?.replaceChildren(String(new Date().getFullYear()));
const choices={comprar:{description:'Un hogar para vivir o una propiedad para invertir. Busquemos opciones que se ajusten a ti.',action:'Cuéntanos qué buscas',message:'Hola Confort4, busco una propiedad para comprar.'},rentar:{description:'Un espacio para empezar o cambiar de etapa. Cuéntanos dónde y cómo te gustaría vivir.',action:'Busquemos tu próxima renta',message:'Hola Confort4, busco una propiedad para rentar.'},vender:{description:'Tu propiedad tiene una historia. Platiquemos de sus características y de cómo presentarla al mercado.',action:'Hablemos de tu propiedad',message:'Hola Confort4, quiero vender mi propiedad.'}};
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{const choice=choices[button.dataset.filter];if(!choice)return;document.querySelectorAll('.filter').forEach(other=>{other.classList.toggle('active',other===button);other.setAttribute('aria-pressed',String(other===button));});document.querySelector('#search-description').textContent=choice.description;const contact=document.querySelector('#search-contact');contact.href=`https://wa.me/525534347566?text=${encodeURIComponent(choice.message)}`;contact.firstChild.textContent=choice.action+' ';}));
// Restrained entrances; all content remains visible without JavaScript.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;if(!motionPreference.matches)entry.target.animate([{transform:'translateY(18px)',opacity:.65},{transform:'translateY(0)',opacity:1}],{duration:600,easing:'cubic-bezier(.16,1,.3,1)'});observer.unobserve(entry.target);});},{threshold:.16});
 document.querySelectorAll('[data-reveal]').forEach(element=>observer.observe(element));
 motionPreference.addEventListener('change',()=>{if(motionPreference.matches)document.querySelectorAll('[data-reveal]').forEach(element=>element.getAnimations().forEach(animation=>animation.cancel()));});
}
