-- EstateAI: 0010_property_images_storage
--
-- Public bucket (property photos need to be visible to leads, including via
-- the anonymous chat widget) with writes restricted to the owning agency.
-- Path convention enforced by policy: <agency_id>/<property_id>/<filename>.

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

create policy "property_images_public_read"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "property_images_agency_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = current_agency_id()::text
  );

create policy "property_images_agency_update"
  on storage.objects for update
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = current_agency_id()::text
  );

create policy "property_images_agency_delete"
  on storage.objects for delete
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = current_agency_id()::text
  );
