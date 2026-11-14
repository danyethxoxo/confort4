import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
const pages=fs.readdirSync(root).filter(file=>file.endsWith('.html'));
let references=0;
for(const file of pages){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 if((html.match(/<h1\b/g)||[]).length!==1)throw Error(`${file}: expected one H1`);
 if(/data-budget=/.test(html))throw Error(`${file}: retired reference-price and savings calculator returned`);
 for(const form of html.matchAll(/<form\b([^>]*)>/g))if(!/\bmethod="post"/i.test(form[1]))throw Error(`${file}: forms must not put visitor data or credentials in URLs`);
 for(const match of html.matchAll(/(?:href|src)="([^"\s]+)"/g)){
  const ref=match[1];if(/^(https?:|tel:|mailto:|data:)/.test(ref))continue;
  const [url,hash]=ref.split('#');const target=(url||file).split('?')[0];
  const resolved=path.resolve(root,target);
  if(!resolved.startsWith(root+path.sep)||!fs.existsSync(resolved))throw Error(`${file}: missing ${ref}`);
  if(hash&&target.endsWith('.html')){
   const content=fs.readFileSync(resolved,'utf8');
   if(!content.includes(`id="${hash}"`))throw Error(`${file}: missing anchor ${ref}`);
  }
  references++;
 }
 if(!html.includes('class="header-contact-button" href="https://wa.me/525527477538"'))throw Error(`${file}: Alberto WhatsApp header action missing`);
}
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const homeMain=home.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
if(/class="(?:intent-section|journal-module|review-form-layout|contact-form-section)/.test(homeMain)||/data-kind="(?:contact|review)"/.test(homeMain))throw Error('Homepage contains retired modules');
const contact=fs.readFileSync(path.join(root,'contacto.html'),'utf8');
if(!contact.includes('data-kind="contact"')||!home.includes('href="contacto.html"')||!home.includes('href="resena.html"'))throw Error('Missing dedicated contact/review flow');
if(/alberto\.webp|renata\.webp/.test(home.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1]))throw Error('Advisor photos belong on the team page only');
const team=fs.readFileSync(path.join(root,'quienes-somos.html'),'utf8');
if(!team.includes('alberto.webp')||!team.includes('renata.webp'))throw Error('Team photographs missing');
const reviews=fs.readFileSync(path.join(root,'resena.html'),'utf8');
if(!reviews.includes('data-kind="review"')||!reviews.includes('name="publishConsent"'))throw Error('Review consent flow missing');
console.log(`PASS: ${pages.length} pages, ${references} local links/assets, simplified home, dedicated contact and review consent.`);
