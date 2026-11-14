-- Preserve the approved/public-consent boundary and expose the review date only.
create or replace function public.confort4_public_site()
returns jsonb language sql set search_path='' as $$
 select jsonb_build_object(
  'content',c.published,'revision',c.revision,
  'properties',public.confort4_inventory(),
  'reviews',(select coalesce(jsonb_agg(jsonb_build_object(
   'id',s.id,'name',s.payload->>'name','rating',(s.payload->>'rating')::integer,
   'message',s.payload->>'message','created_at',s.created_at
  ) order by s.created_at desc,s.id desc),'[]'::jsonb)
  from (select id,payload,created_at from confort4.submissions
   where kind='review' and moderation_status='approved' and payload->>'publishConsent'='true'
   order by created_at desc,id desc limit 100) s)
 ) from confort4.content c where c.id=true;
$$;
