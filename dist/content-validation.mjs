export const moduleTypes=['intents','properties','process','tool','journal','faq','contact','reviews'];
export function validateContent(data){
 if(!data||typeof data!=='object'||!data.team||!Array.isArray(data.services)||!data.home||!Array.isArray(data.posts)||!Array.isArray(data.faq))throw Error('Faltan secciones de contenido.');
 if(JSON.stringify(data).length>440000)throw Error('El contenido es demasiado grande.');
 function walk(value,depth=0,key=''){
  if(depth>12)throw Error('Estructura demasiado profunda.');
  if(typeof value==='string'){
   if(value.length>18000)throw Error('Un texto supera el límite.');
   if(['photo','image','cover','contact','url'].includes(key)&&value&&!/^(https:\/\/|assets\/)[^\s<>"']+$/i.test(value))throw Error('Usa una URL HTTPS válida o un recurso de assets/.');
  }else if(Array.isArray(value)){if(value.length>100)throw Error('Demasiados elementos.');value.forEach(v=>walk(v,depth+1,key));}
  else if(value&&typeof value==='object')for(const [k,v]of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Campo no permitido.');walk(v,depth+1,k);}
 }
 walk(data);
 const string=(value,label)=>{if(typeof value!=='string'||!value.trim())throw Error('Completa '+label+'.');};
 const list=(value,label)=>{if(!Array.isArray(value))throw Error('Revisa '+label+'.');};
 string(data.home.title,'el título de inicio');string(data.home.intro,'la presentación');string(data.home.photo,'la imagen principal');
 string(data.team.title,'el título del equipo');string(data.team.intro,'la presentación del equipo');list(data.team.paragraphs,'la historia del equipo');list(data.team.members,'los integrantes');
 for(const person of data.team.members){string(person.id,'el identificador del integrante');string(person.name,'el nombre');string(person.photo,'la fotografía');string(person.contact,'el contacto');}
 list(data.process,'el proceso');if(data.process.length!==3)throw Error('El proceso debe conservar tres etapas.');
 for(const step of data.process){string(step.title,'el título de etapa');string(step.text,'el texto de etapa');list(step.items,'los puntos de etapa');}
 if(!data.checklists||!['venta','visita','renta'].every(k=>Array.isArray(data.checklists[k])&&data.checklists[k].length>0))throw Error('Conserva los tres checklists.');
 for(const question of data.faq){string(question.question,'la pregunta');string(question.answer,'la respuesta');string(question.category,'la categoría');}
 for(const service of data.services){if(!['vender','comprar','rentar'].includes(service.id))throw Error('Servicio desconocido.');for(const k of ['title','shortTitle','intro','image','cta','closing'])string(service[k],'el campo '+k+' de '+service.id);list(service.sections,'las secciones del servicio');for(const section of service.sections){string(section.title,'el título de sección');string(section.text,'el contenido de sección');}if(service.id==='rentar'){list(service.audiences,'los públicos de renta');for(const audience of service.audiences){string(audience.id,'el identificador del público');string(audience.title,'el título del público');list(audience.items,'los puntos de renta');}}}
 if(data.services.length!==3||!['vender','comprar','rentar'].every(id=>data.services.some(s=>s.id===id)))throw Error('Conserva los tres servicios.');
 if(!Array.isArray(data.home.modules)||!data.home.modules.every(m=>moduleTypes.includes(m))||new Set(data.home.modules).size!==data.home.modules.length)throw Error('Revisa los módulos de inicio.');
 const slugs=new Set();for(const post of data.posts){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)||slugs.has(post.slug))throw Error('Slug de artículo inválido o repetido.');slugs.add(post.slug);if(!post.title||!Array.isArray(post.sections)||!Array.isArray(post.summary))throw Error('Revisa el artículo.');if(post.checklist&&!['venta','visita','renta'].includes(post.checklist))throw Error('Checklist de artículo inválido.');if(post.published){for(const key of ['title','excerpt','cover','author','updated'])string(post[key],'el campo '+key+' del artículo');if(!post.sections.length||!post.summary.length)throw Error('Completa el artículo antes de hacerlo visible.');for(const section of post.sections){string(section.title,'el título de la sección');string(section.text,'el contenido del artículo');}}}
 return data;
}
