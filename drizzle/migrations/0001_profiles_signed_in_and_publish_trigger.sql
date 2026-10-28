DROP POLICY IF EXISTS "Profiles are public" ON public.people_profiles;
REVOKE SELECT ON public.people_profiles FROM anon;
CREATE POLICY "Signed-in users read profiles" ON public.people_profiles FOR SELECT TO authenticated USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS people_profiles_source_application_uidx ON public.people_profiles (source_application_id) WHERE source_application_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_profile_from_application()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _group text := CASE NEW.category WHEN 'startup' THEN 'startups' WHEN 'mentor' THEN 'mentors' WHEN 'investor' THEN 'investors' WHEN 'business' THEN 'businesses' END;
  _d jsonb := coalesce(NEW.details, '{}'::jsonb);
  _name text;
  _summary text;
BEGIN
  IF NEW.status IS DISTINCT FROM 'approved' OR _group IS NULL THEN
    DELETE FROM public.people_profiles WHERE source_application_id = NEW.id;
    RETURN NEW;
  END IF;
  _name := coalesce(nullif(_d->>'startupName', ''), nullif(_d->>'businessName', ''), NEW.full_name);
  _summary := left(coalesce(nullif(_d->>'product', ''), nullif(_d->>'products', ''), nullif(_d->>'mentorAreas', ''), nullif(_d->>'investmentThesis', ''), ''), 400);
  INSERT INTO public.people_profiles (person_group, slug, name, role, location, focus, summary, bio, source_application_id)
  VALUES (
    _group,
    trim(both '-' from regexp_replace(lower(_name), '[^a-z0-9]+', '-', 'g')) || '-' || left(NEW.id::text, 6),
    _name,
    coalesce(nullif(_d->>'designation', ''), nullif(_d->>'investorType', ''), nullif(_d->>'startupStage', ''), ''),
    coalesce(nullif(_d->>'location', ''), nullif(_d->>'headquarter', ''), ''),
    CASE WHEN coalesce(_d->>'industry', '') <> '' THEN ARRAY[_d->>'industry'] ELSE '{}'::text[] END,
    _summary, _summary, NEW.id)
  ON CONFLICT (source_application_id) WHERE source_application_id IS NOT NULL
  DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, location = EXCLUDED.location, focus = EXCLUDED.focus, summary = EXCLUDED.summary, bio = EXCLUDED.bio;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.sync_profile_from_application() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER registration_status_publishes_profile
AFTER INSERT OR UPDATE OF status, details ON public.registration_applications
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_from_application();