CREATE TABLE public.country_logos (
 country text NOT NULL CHECK (country IN ('india','uk','uae','canada','usa','singapore','europe','australia')),
 theme text NOT NULL CHECK (theme IN ('light','dark')),
 file_path text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (country, theme)
);
GRANT SELECT ON public.country_logos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.country_logos TO authenticated;
GRANT ALL ON public.country_logos TO service_role;
ALTER TABLE public.country_logos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Country logos are public artwork" ON public.country_logos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage country logos" ON public.country_logos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Read country artwork" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'country-logos');
CREATE POLICY "Admins upload country artwork" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'country-logos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins remove country artwork" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'country-logos' AND public.has_role(auth.uid(), 'admin'));