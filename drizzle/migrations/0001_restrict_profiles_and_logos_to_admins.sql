DROP POLICY IF EXISTS "Signed-in users read profiles" ON public.people_profiles;
CREATE POLICY "Admins read profiles" ON public.people_profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Country logos are public artwork" ON public.country_logos;
DROP POLICY IF EXISTS "Read country artwork" ON storage.objects;
CREATE POLICY "Admins read country artwork" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'country-logos' AND public.has_role(auth.uid(), 'admin'::public.app_role));