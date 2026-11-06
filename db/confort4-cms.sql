create table confort4.members(user_id uuid primary key references auth.users(id) on delete cascade,role text not null check(role in ('admin','editor')));
insert into confort4.members(user_id,role) select id,'admin' from auth.users where lower(email) in ('dani.guerrero@kwmexico.mx','albertoflores@kwmexico.mx');
create table confort4.content(id boolean primary key default true check(id),draft jsonb not null default '{}',published jsonb not null default '{}',revision integer not null default 0,updated_at timestamptz not null default now());
insert into confort4.content(id) values(true);
create table confort4.versions(id bigint generated always as identity primary key,content jsonb not null,actor uuid references auth.users(id),created_at timestamptz not null default now());
create table confort4.audit(id bigint generated always as identity primary key,actor uuid,action text not null,detail jsonb not null default '{}',created_at timestamptz not null default now());
create table confort4.property_selections(property_id uuid primary key references public.propiedades(id) on delete cascade);
alter table confort4.settings add column inventory_advisor_id text;
update confort4.settings set inventory_advisor_id='2000102839' where singleton;
alter table confort4.submissions add column followup text not null default 'new' check(followup in ('new','contacted','in_progress','closed','archived'));
alter table confort4.members enable row level security;
alter table confort4.content enable row level security;
alter table confort4.versions enable row level security;
alter table confort4.audit enable row level security;
alter table confort4.property_selections enable row level security;
revoke all on all tables in schema confort4 from public,anon,authenticated;
grant select,insert,update,delete on all tables in schema confort4 to service_role;
grant usage,select on all sequences in schema confort4 to service_role;

create function public.confort4_inventory(p_query text default '',p_public boolean default true)
returns jsonb language sql security invoker set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') from (
 select p.id,p.titulo,p.descripcion,p.tipo,p.operacion,p.precio,p.moneda,p.colonia,p.municipio,p.estado,p.recamaras,p.banos,p.estacionamientos,p.m2_construccion,p.m2_terreno,p.imagenes,p.updated_at,p.asesor_nombre,
 exists(select 1 from confort4.property_selections s where s.property_id=p.id) as selected
 from public.propiedades p where p.estatus='publicada'
 and (not p_public or p.asesor_kw_id=(select inventory_advisor_id from confort4.settings where singleton) or exists(select 1 from confort4.property_selections s where s.property_id=p.id))
 and (p_query='' or concat_ws(' ',p.titulo,p.colonia,p.municipio,p.asesor_nombre) ilike '%'||left(p_query,100)||'%')
 order by p.updated_at desc limit 40) t;
$$;
create function public.confort4_public_site()
returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object('content',c.published,'revision',c.revision,'properties',public.confort4_inventory(), 'reviews',
 (select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'name',s.payload->>'name','rating',(s.payload->>'rating')::integer,'message',s.payload->>'message')),'[]') from (select * from confort4.submissions where kind='review' and moderation_status='approved' and payload->>'publishConsent'='true' order by created_at desc limit 12) s))
 from confort4.content c where c.id=true;
$$;

create function public.confort4_admin(p_user uuid,p_action text,p_args jsonb default '{}')
returns jsonb language plpgsql security invoker set search_path='' as $$
declare member_role text; result jsonb; current_revision integer;
begin
 select role into member_role from confort4.members where user_id=p_user;
 if member_role is null then raise exception 'not_a_member'; end if;
 if p_action in ('publish','moderate','settings','select_property','followup') and member_role<>'admin' then raise exception 'admin_required';end if;
 if p_action='bootstrap' then
  select jsonb_build_object('role',member_role,'draft',draft,'revision',revision,'settings',(select jsonb_build_object('notification_email',notification_email,'inventory_advisor_id',inventory_advisor_id) from confort4.settings where singleton),'versions',(select coalesce(jsonb_agg(to_jsonb(v)),'[]') from (select id,created_at from confort4.versions order by id desc limit 15)v)) into result from confort4.content where id;
 elsif p_action='save' then
  if jsonb_typeof(p_args->'content')<>'object' or length((p_args->'content')::text)>450000 then raise exception 'invalid_content';end if;
  update confort4.content set draft=p_args->'content',revision=revision+1,updated_at=now() where id and revision=(p_args->>'revision')::integer returning revision into current_revision;
  if not found then raise exception 'version_conflict'; end if;
  result:=jsonb_build_object('revision',current_revision);
 elsif p_action='publish' then
  perform 1 from confort4.content where id and revision=(p_args->>'revision')::integer for update;
  if not found then raise exception 'version_conflict'; end if;
  insert into confort4.versions(content,actor) select published,p_user from confort4.content where id;
  update confort4.content set published=draft,revision=revision+1,updated_at=now() where id returning revision into current_revision;
  result:=jsonb_build_object('revision',current_revision);
 elsif p_action='restore' then
  select content into result from confort4.versions where id=(p_args->>'id')::bigint;
  if result is null then raise exception 'version_missing';end if;
  update confort4.content set draft=result,revision=revision+1,updated_at=now() where id and revision=(p_args->>'revision')::integer returning revision into current_revision;
  if not found then raise exception 'version_conflict';end if;
  result:=jsonb_build_object('revision',current_revision);
 elsif p_action='submissions' then
  select coalesce(jsonb_agg(to_jsonb(s)),'[]') into result from (select id,kind,payload,moderation_status,email_status,followup,created_at from confort4.submissions where kind=coalesce(p_args->>'kind','contact') order by created_at desc limit 50 offset greatest(0,least(coalesce((p_args->>'offset')::integer,0),10000)))s;
 elsif p_action='followup' then
  update confort4.submissions set followup=p_args->>'status' where id=(p_args->>'id')::uuid;result:='{"ok":true}';
 elsif p_action='moderate' then
  update confort4.submissions set moderation_status=p_args->>'status' where id=(p_args->>'id')::uuid and kind='review' and (p_args->>'status' in ('pending','rejected') or (p_args->>'status'='approved' and payload->>'publishConsent'='true'));
  if not found then raise exception 'publication_consent_required';end if;result:='{"ok":true}';
 elsif p_action='inventory' then result:=public.confort4_inventory(coalesce(p_args->>'query',''),false);
 elsif p_action='select_property' then
  if (p_args->>'selected')::boolean then
   insert into confort4.property_selections(property_id) select id from public.propiedades where id=(p_args->>'id')::uuid and estatus='publicada' on conflict do nothing;
  else delete from confort4.property_selections where property_id=(p_args->>'id')::uuid;end if;result:='{"ok":true}';
 elsif p_action='settings' then
  if coalesce(p_args->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid_email';end if;
  update confort4.settings set notification_email=p_args->>'email',updated_at=now() where singleton;result:='{"ok":true}';
 else raise exception 'unknown_action';end if;
 if p_action not in ('bootstrap','submissions','inventory') then insert into confort4.audit(actor,action,detail)values(p_user,p_action,jsonb_build_object('id',p_args->>'id'));end if;
 return result;
end $$;
revoke all on function public.confort4_inventory(text,boolean) from public,anon,authenticated;
revoke all on function public.confort4_public_site() from public,anon,authenticated;
revoke all on function public.confort4_admin(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.confort4_inventory(text,boolean),public.confort4_public_site(),public.confort4_admin(uuid,text,jsonb) to service_role;
