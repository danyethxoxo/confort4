import fs from 'node:fs';
import path from 'node:path';
import {validateContent} from '../dist/content-validation.mjs';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,v)=>fs.writeFileSync(path.join(root,p),v);
const content=JSON.parse(read('content/site.json'));validateContent(content);
const properties=JSON.parse(read('content/inventory.json'));
const articleRoutes=Object.fromEntries(content.posts.filter(p=>p.published).map(p=>[p.slug,'lectura-'+p.slug+'.html']));
const propertyRoutes=Object.fromEntries(properties.map(p=>[p.id,'inmueble-'+p.id+'.html']));
write('dist/routes.mjs','export const articleRoutes='+JSON.stringify(articleRoutes)+';\nexport const propertyRoutes='+JSON.stringify(propertyRoutes)+';\n');
write('supabase/functions/confort4-site/content-validation.mjs',read('dist/content-validation.mjs'));
const {renderPage,e}=await import('../dist/ui.mjs');
const bundle={content,properties,reviews:[],revision:1};
const origin='https://danyethxoxo.github.io/confort4/';
const header=read('templates/header.html').replace('href="https://wa.me/525534347566" target="_blank" rel="noopener">Hablemos','href="index.html#contacto">Hablemos').replace('href="index.html#propiedades"','href="propiedades.html"').replace('<div class="header-social"','<a href="blog.html">Blog</a><a class="nav-contact" href="index.html#contacto">Contacto</a><div class="header-social"');
const footer=read('templates/footer.html').replace('<div class="footer-bottom">','<div class="footer-wordmark" aria-hidden="true">Confort4</div><div class="footer-bottom">').replace('href="index.html#propiedades"','href="propiedades.html"').replace('href="index.html#servicios"','href="vender.html"').replace('<a href="privacidad.html">','<a href="recursos.html">Recursos</a><a href="preguntas.html">Preguntas frecuentes</a><a href="blog.html">Blog</a><a href="admin.html">Acceso del equipo</a><a href="privacidad.html">');
const routes=[['index','home','Compra, vende y renta en CDMX'],['quienes-somos','team','Quiénes somos'],['vender','vender','Vender una propiedad'],['comprar','comprar','Comprar una propiedad'],['rentar','rentar','Rentar una propiedad'],['propiedades','catalog','Propiedades'],['propiedad','property','Detalle de propiedad'],['blog','blog','Guías inmobiliarias'],['articulo','article','Lecturas Confort4'],['recursos','resources','Herramientas y checklists'],['preguntas','faq','Preguntas frecuentes'],['resena','review','Dejar una reseña'],['privacidad','privacy','Privacidad'],['admin','admin','Acceso del equipo']];
for(const post of content.posts.filter(p=>p.published))routes.push([articleRoutes[post.slug].slice(0,-5),'article',post.title,{slug:post.slug}]);
for(const property of properties)routes.push([propertyRoutes[property.id].slice(0,-5),'property',property.titulo,{id:property.id}]);
const admin='<section class="admin-login wrap"><h1>Un espacio para<br>tu equipo.</h1><p>Administra el contenido y los proyectos de Confort4.</p><form method="post" id="login-form" class="site-form"><label>Correo de tu cuenta<input type="email" name="email" autocomplete="username" required></label><label>Contraseña<input type="password" name="password" autocomplete="current-password" required></label><button class="button" type="submit">Entrar al panel</button><p role="status" id="login-status"></p></form><p>Usa tu cuenta existente autorizada para Confort4. El acceso se valida en el servidor.</p></section><section id="admin-panel" hidden></section>';
for(const [file,page,title,params={}] of routes){
 const post=page==='article'&&content.posts.find(p=>p.slug===params.slug);
 const property=page==='property'&&properties.find(p=>p.id===params.id);
 const description=post?.excerpt||'Confort4: acompañamiento inmobiliario para comprar, vender y rentar en Ciudad de México.';
 const image=post?.cover||content.home.photo;
 const main=['review','privacy'].includes(page)?read('templates/'+file+'-main.html'):page==='admin'?admin:renderPage(bundle,page,params);
 const jsonld=post?{'@context':'https://schema.org','@type':'BlogPosting',headline:post.title,description:post.excerpt,dateModified:post.updated,author:{'@type':'Organization',name:post.author},publisher:{'@type':'Organization',name:'Confort4'},image:origin+image,url:origin+file+'.html'}:page==='home'?{'@context':'https://schema.org','@type':'RealEstateAgent',name:'Confort4',url:origin,telephone:'+525534347566',areaServed:'Ciudad de México',image:origin+'assets/confort4.jpg'}:null;
 const indexable=page!=='admin'&&!(['article','property'].includes(page)&&!post&&!property);
 write('dist/'+file+'.html',`<!doctype html><html lang="es-MX"><head>
 <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff">
 <title>${e(title)} | Confort4</title><meta name="description" content="${e(description)}">${!indexable?'<meta name="robots" content="noindex,nofollow">':`<link rel="canonical" href="${origin+file+'.html'}">`}
 <meta property="og:title" content="${e(title)} | Confort4"><meta property="og:description" content="${e(description)}"><meta property="og:type" content="${post?'article':'website'}"><meta property="og:image" content="${origin+image}">
 <link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="assets/inter-tight-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="styles.css?v=14"><link rel="stylesheet" href="modules.css?v=14"><link rel="stylesheet" href="identity.css?v=30">
 <script src="form-config.js"></script><script type="module" src="${page==='admin'?'admin.mjs':'site.mjs'}?v=30"></script>${jsonld?'<script type="application/ld+json">'+JSON.stringify(jsonld).replaceAll('<','\\u003c')+'</script>':''}</head>
 <body data-page="${page}" data-route-id="${e(params.id||'')}" data-route-slug="${e(params.slug||'')}"><a class="skip" href="#contenido">Saltar al contenido</a>${header.replaceAll('href="'+file+'.html"','href="'+file+'.html" aria-current="page"')}<main id="contenido">${main}</main>${footer}<script type="application/json" id="site-data">${JSON.stringify(bundle).replaceAll('<','\\u003c')}</script></body></html>`);
}
write('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.filter(([file])=>!['admin','articulo','propiedad'].includes(file)).map(([file])=>'<url><loc>'+origin+file+'.html</loc></url>').join('')+'</urlset>');
console.log('Built '+routes.length+' public and administrative pages, static article/property routes and sitemap.');
