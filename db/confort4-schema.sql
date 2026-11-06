-- Confort4 owns its records. No KW Premier tables or policies are changed.
create schema if not exists confort4;
revoke all on schema confort4 from public, anon, authenticated;
grant usage on schema confort4 to service_role;

create table confort4.settings (
  singleton boolean primary key default true check(singleton),
  notification_email text,
  updated_at timestamptz not null default now()
);
insert into confort4.settings(singleton) values(true);
create table confort4.submissions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  kind text not null check(kind in ('contact','review')),
  payload jsonb not null check(jsonb_typeof(payload)='object'),
  moderation_status text not null default 'private' check(moderation_status in ('private','pending','approved','rejected')),
  email_status text not null default 'pending' check(email_status in ('pending','sending','sent','failed')),
  email_provider_id text,
  email_attempts integer not null default 0,
  last_email_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  constraint review_publication_consent check(moderation_status<>'approved' or (kind='review' and coalesce(payload->>'publishConsent','false')='true'))
);
create index confort4_submissions_created_idx on confort4.submissions(created_at desc);
create table confort4.rate_limits (
  bucket text primary key,
  attempts integer not null,
  expires_at timestamptz not null
);
alter table confort4.settings enable row level security;
alter table confort4.submissions enable row level security;
alter table confort4.rate_limits enable row level security;
revoke all on all tables in schema confort4 from public,anon,authenticated;
grant select,insert,update,delete on all tables in schema confort4 to service_role;

create function public.confort4_submit(p_kind text,p_payload jsonb,p_subject text,p_request_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare saved confort4.submissions; counter integer; hour_bucket text;
begin
  if p_kind not in ('contact','review') or jsonb_typeof(p_payload)<>'object' or length(p_payload::text)>12000
     or length(p_subject)<>64 or p_request_id is null then raise exception 'invalid_submission'; end if;
  -- Prevent simultaneous retries from creating two records or emails.
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
  select * into saved from confort4.submissions where request_id=p_request_id;
  if found then
    if saved.kind<>p_kind or saved.payload<>p_payload then raise exception 'request_conflict'; end if;
    return jsonb_build_object('id',saved.id,'duplicate',true,'email_status',saved.email_status);
  end if;
  hour_bucket:=to_char(date_trunc('hour',now()),'YYYYMMDDHH24');
  insert into confort4.rate_limits(bucket,attempts,expires_at)
  values('ip:'||p_subject||':'||hour_bucket,1,now()+interval '2 hours')
  on conflict(bucket) do update set attempts=confort4.rate_limits.attempts+1 returning attempts into counter;
  if counter>4 then raise exception 'rate_limit'; end if;
  insert into confort4.rate_limits(bucket,attempts,expires_at)
  values('site:'||hour_bucket,1,now()+interval '2 hours')
  on conflict(bucket) do update set attempts=confort4.rate_limits.attempts+1 returning attempts into counter;
  if counter>60 then raise exception 'rate_limit'; end if;
  delete from confort4.rate_limits where expires_at<now();
  insert into confort4.submissions(request_id,kind,payload,moderation_status)
  values(p_request_id,p_kind,p_payload,case when p_kind='review' then 'pending' else 'private' end)
  returning * into saved;
  return jsonb_build_object('id',saved.id,'duplicate',false,'email_status',saved.email_status);
end $$;

create function public.confort4_email_config()
returns jsonb language sql security invoker set search_path='' as $$
  select jsonb_build_object('to',notification_email) from confort4.settings where singleton=true;
$$;
create function public.confort4_claim_notification(p_id uuid)
returns boolean language plpgsql security invoker set search_path='' as $$
declare claimed uuid;
begin
 update confort4.submissions set email_status='sending',email_attempts=email_attempts+1,last_email_attempt_at=now()
 where id=p_id and email_attempts<3 and (email_status in ('pending','failed') or (email_status='sending' and last_email_attempt_at<now()-interval '5 minutes'))
 returning id into claimed;
 return claimed is not null;
end $$;
create function public.confort4_notification_result(p_id uuid,p_sent boolean,p_provider_id text default null)
returns void language sql security invoker set search_path='' as $$
 update confort4.submissions set email_status=case when p_sent then 'sent' else 'failed' end,email_provider_id=p_provider_id
 where id=p_id;
$$;
revoke all on function public.confort4_submit(text,jsonb,text,uuid) from public,anon,authenticated;
revoke all on function public.confort4_email_config() from public,anon,authenticated;
revoke all on function public.confort4_claim_notification(uuid) from public,anon,authenticated;
revoke all on function public.confort4_notification_result(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.confort4_submit(text,jsonb,text,uuid) to service_role;
grant execute on function public.confort4_email_config() to service_role;
grant execute on function public.confort4_claim_notification(uuid) to service_role;
grant execute on function public.confort4_notification_result(uuid,boolean,text) to service_role;
