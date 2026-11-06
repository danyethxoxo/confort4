import {validateContent} from './content-validation.mjs';
const env=(name:string)=>Deno.env.get(name)||'';
const base=env('SUPABASE_URL'),key=env('SUPABASE_SERVICE_ROLE_KEY')||env('SERVICE_ROLE_KEY');
const headers={'Access-Control-Allow-Origin':'https://danyethxoxo.github.io','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
const response=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
async function rpc(name:string,args:unknown={}){const r=await fetch(base+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(15000)});const data=await r.json().catch(()=>null);if(!r.ok)throw Error(data?.message||'database_unavailable');return data;}
export async function handle(req:Request){
 if(req.headers.get('origin')!=='https://danyethxoxo.github.io')return response({error:'Origen no permitido.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return response({error:'Método no permitido.'},405);
 try{
  const reader=req.body?.getReader();if(!reader)return response({error:'Falta la solicitud.'},400);
  const parts:Uint8Array[]=[];let size=0;while(true){const item=await reader.read();if(item.done)break;size+=item.value.length;if(size>4500000){await reader.cancel();return response({error:'Archivo o contenido demasiado grande.'},413);}parts.push(item.value);}
  const buffer=new Uint8Array(size);let offset=0;for(const part of parts){buffer.set(part,offset);offset+=part.length;}
  let body;try{body=JSON.parse(new TextDecoder().decode(buffer));}catch{return response({error:'Solicitud inválida.'},400);}
  if(!body||typeof body!=='object'||Array.isArray(body)||typeof body.action!=='string')return response({error:'Solicitud inválida.'},400);
  if(!['public','bootstrap','save','publish','restore','submissions','followup','moderate','inventory','select_property','settings','upload'].includes(body.action))return response({error:'Acción no permitida.'},400);
  if(body.action==='public')return response(await rpc('confort4_public_site'));
  const auth=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:req.headers.get('authorization')||''},signal:AbortSignal.timeout(10000)});
  if(!auth.ok)return response({error:'Inicia sesión para continuar.'},401);
  const user=await auth.json();if(!user.id)return response({error:'Inicia sesión para continuar.'},401);
  // getUser validated the token; require the account's native MFA when enabled.
  if(user.factors?.some((factor:{status:string})=>factor.status==='verified')){
   const token=(req.headers.get('authorization')||'').split(' ')[1];
   const claims=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
   if(claims.aal!=='aal2')return response({error:'Completa la verificación de tu cuenta.',code:'mfa_required'},403);
  }
  if(body.action==='save'){try{validateContent(body.args?.content);}catch(e){return response({error:(e as Error).message},400);}}
  if(body.action==='upload'){
   await rpc('confort4_admin',{p_user:user.id,p_action:'bootstrap',p_args:{}});
   const mime=body.args?.mime,data=body.args?.data;
   if(!['image/jpeg','image/png','image/webp'].includes(mime)||typeof data!=='string')return response({error:'Usa JPG, PNG o WebP.'},400);
   let bytes;try{bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));}catch{return response({error:'Archivo inválido.'},400);}
   const valid=(mime==='image/jpeg'&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)||(mime==='image/png'&&bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)||(mime==='image/webp'&&new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP');
   if(!valid||bytes.length>3000000)return response({error:'Imagen inválida o mayor a 3 MB.'},400);
   const file=crypto.randomUUID()+'.'+({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[mime]);
   const result=await fetch(base+'/storage/v1/object/confort4-media/'+file,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':mime},body:bytes});
   if(!result.ok)throw Error('upload_failed');
   return response({url:base+'/storage/v1/object/public/confort4-media/'+file});
  }
  const data=await rpc('confort4_admin',{p_user:user.id,p_action:body.action,p_args:body.args||{}});
  return response(data);
 }catch(error){
  const code=(error as Error).message;
  if(code.includes('not_a_member')||code.includes('admin_required'))return response({error:'Tu cuenta no tiene acceso a esta acción de Confort4.'},403);
  if(code.includes('version_conflict'))return response({error:'Hay cambios más recientes. Recarga el panel antes de guardar.'},409);
  if(code.includes('publication_consent_required'))return response({error:'Esta reseña no autoriza publicación.'},400);
  console.error('confort4-site: operation failed');return response({error:'No se pudo completar la operación. Intenta de nuevo.'},503);
 }
}
Deno.serve(handle);
