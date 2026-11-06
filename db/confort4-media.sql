insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('confort4-media','confort4-media',true,3000000,array['image/jpeg','image/png','image/webp']);
-- The files are intended for public website display. All authenticated writes
-- go through the membership-checked Confort4 Edge Function using service_role.
-- RESTRICTIVE prevents unrelated permissive policies granting bucket access.
create policy confort4_media_server_only on storage.objects
as restrictive for all to anon,authenticated
using (bucket_id<>'confort4-media') with check (bucket_id<>'confort4-media');
