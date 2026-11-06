// Public anonymous form via the project's anon JWT; no client can read stored data.
const allowedOrigin='https://danyethxoxo.github.io';
const headers={'Access-Control-Allow-Origin':allowedOrigin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin','Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
const env=(key:string)=>Deno.env.get(key)||'';
const url=env('SUPABASE_URL');
const serviceKey=env('SUPABASE_SERVICE_ROLE_KEY')||env('SERVICE_ROLE_KEY');
const resendKey=env('RESEND_API_KEY');
const sharedSender=env('CORREO_REMITENTE');
const verifiedAddress=sharedSender.match(/<([^>]+)>/)?.[1]||(sharedSender.includes('@')?sharedSender:'');
const sender=env('CONFORT4_FROM')||(verifiedAddress?`Confort4 <${verifiedAddress}>`:'');
function respond(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers});}
async function rpc(name:string,args:unknown={}){
 const result=await fetch(url+'/rest/v1/rpc/'+name,{method:'POST',headers:{Authorization:'Bearer '+serviceKey,apikey:serviceKey,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(10000)});
 const data=await result.json().catch(()=>null);
 if(!result.ok)throw new Error(data?.message||'database_unavailable');
 return data;
}
function text(value:unknown,max:number){return typeof value==='string'?value.trim().slice(0,max):'';}
export function validate(body:Record<string,unknown>){
 const kind=body.kind;
 if(kind!=='contact'&&kind!=='review')throw new Error('Selecciona el tipo de solicitud.');
 const name=text(body.name,100),email=text(body.email,254).toLowerCase(),message=text(body.message,3000),phone=text(body.phone,30);
 const interest=text(body.interest,40);
 if(name.length<2)throw new Error('Escribe tu nombre.');
 if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))throw new Error('Revisa tu correo electrónico.');
 if(message.length<10)throw new Error('Cuéntanos un poco más: escribe al menos 10 caracteres.');
 if(phone&&!/^[+\d\s().-]{7,30}$/.test(phone))throw new Error('Revisa tu teléfono.');
 if(body.consent!==true)throw new Error('Necesitamos tu autorización para recibir la información.');
 if(!['vender','comprar','rentar-arrendador','rentar-inquilino','general'].includes(interest))throw new Error('Selecciona el motivo de contacto.');
 const rating=Number(body.rating);
 if(kind==='review'&&(!Number.isInteger(rating)||rating<1||rating>5))throw new Error('Selecciona una calificación de 1 a 5.');
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(body.requestId)))throw new Error('Recarga la página e intenta de nuevo.');
 return {kind,requestId:String(body.requestId),payload:{name,email,phone,interest,message,...(kind==='review'?{rating,publishConsent:body.publishConsent===true}:{}),consent:true,consentVersion:'confort4-2026-11-05',source:kind==='review'?'resena.html':'index.html#contacto'}};
}
Deno.serve(async(req:Request)=>{
 if(req.headers.get('origin')!==allowedOrigin)return respond({error:'Origen no permitido.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return respond({error:'Método no permitido.'},405);
 if(!url||!serviceKey)return respond({error:'El servicio no está disponible. Escríbenos por WhatsApp.'},503);
 try{
  if(!req.headers.get('content-type')?.includes('application/json'))return respond({error:'Formato no permitido.'},415);
  const reader=req.body?.getReader();
  if(!reader)return respond({error:'Solicitud vacía.'},400);
  const chunks:Uint8Array[]=[];let bytes=0;
  while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>16000){await reader.cancel();return respond({error:'El mensaje es demasiado largo.'},413);}chunks.push(part.value);}
  const buffer=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.byteLength;}
  const content=new TextDecoder().decode(buffer);
  let body;try{body=JSON.parse(content);}catch{return respond({error:'No pudimos leer la solicitud.'},400);}
  if(!body||typeof body!=='object'||Array.isArray(body))return respond({error:'Solicitud inválida.'},400);
  if(body.website)return respond({error:'No pudimos validar el envío. Contáctanos por WhatsApp.'},400);
  let input;try{input=validate(body);}catch(error){return respond({error:(error as Error).message},400);}
  const ip=req.headers.get('cf-connecting-ip')||req.headers.get('x-real-ip')||req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()||'unknown';
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(serviceKey+':confort4:'+ip));
  const subject=Array.from(new Uint8Array(digest)).map(value=>value.toString(16).padStart(2,'0')).join('');
  const saved=await rpc('confort4_submit',{p_kind:input.kind,p_payload:input.payload,p_subject:subject,p_request_id:input.requestId});
  let emailStatus=saved.email_status;
  let claimed=false;
  // Contact capture never disappears if email delivery is temporarily unavailable.
  try{
   const config=await rpc('confort4_email_config');
   if(config?.to&&resendKey&&sender&&emailStatus!=='sent'&&(claimed=await rpc('confort4_claim_notification',{p_id:saved.id}))){
    const p=input.payload;
    const lines=[input.kind==='review'?'Nueva reseña de Confort4':'Nuevo contacto de Confort4','',`Nombre: ${p.name}`,`Correo: ${p.email}`,`Teléfono: ${p.phone||'No indicado'}`,`Interés: ${p.interest}`,...(input.kind==='review'?[`Calificación: ${p.rating}/5`,`Permiso de publicación: ${p.publishConsent?'Sí':'No'}`]:[]),'',p.message,'',`Referencia: ${saved.id}`];
    const mail=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+resendKey,'Content-Type':'application/json; charset=utf-8','Idempotency-Key':'confort4-'+saved.id},body:JSON.stringify({from:sender,to:[config.to],reply_to:p.email,subject:(input.kind==='review'?'Confort4 · Nueva reseña: ':'Confort4 · Nuevo contacto: ')+p.name.replace(/[\r\n]/g,' '),text:lines.join('\n')}),signal:AbortSignal.timeout(8000)});
    const result=await mail.json().catch(()=>({}));
    emailStatus=mail.ok?'sent':'failed';
    await rpc('confort4_notification_result',{p_id:saved.id,p_sent:mail.ok,p_provider_id:mail.ok?result.id:null});
   }
  }catch{emailStatus='pending';if(claimed)await rpc('confort4_notification_result',{p_id:saved.id,p_sent:false,p_provider_id:null}).catch(()=>{});}
  return respond({ok:true,id:saved.id,emailStatus,message:input.kind==='review'?'Gracias. Recibimos tu reseña para revisión.':'Recibimos tus datos. El equipo de Confort4 dará seguimiento a tu proyecto.'});
 }catch(error){
  const message=(error as Error).message;
  if(message.includes('rate_limit'))return respond({error:'Ya recibimos varias solicitudes. Intenta más tarde o escríbenos por WhatsApp.'},429);
  if(message.includes('request_conflict'))return respond({error:'Recarga la página antes de enviar otro mensaje.'},409);
  console.error('confort4-forms: request failed');
  return respond({error:'No pudimos guardar tu mensaje. Intenta otra vez o escríbenos por WhatsApp.'},503);
 }
});
