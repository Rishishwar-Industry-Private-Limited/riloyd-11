CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, email text NOT NULL, phone text NOT NULL,
  service text NOT NULL, industry text NOT NULL, message text NOT NULL,
  status text NOT NULL DEFAULT 'new', admin_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read enquiries" ON public.contact_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update enquiries" ON public.contact_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.registration_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_code text NOT NULL UNIQUE,
  category text NOT NULL, full_name text NOT NULL, email text NOT NULL, phone text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  document_path text, document_name text,
  status text NOT NULL DEFAULT 'new', admin_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.registration_applications TO authenticated;
GRANT ALL ON public.registration_applications TO service_role;
ALTER TABLE public.registration_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read applications" ON public.registration_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update applications" ON public.registration_applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.customer_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number text NOT NULL, publish_date date NOT NULL,
  title text NOT NULL, category text NOT NULL,
  file_path text NOT NULL, file_name text NOT NULL, file_size integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_reports TO authenticated;
GRANT ALL ON public.customer_reports TO service_role;
ALTER TABLE public.customer_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage reports" ON public.customer_reports FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.form_submission_limits (
  key_hash text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.form_submission_limits TO service_role;
ALTER TABLE public.form_submission_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_form_submission_limit(_key_hash text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _attempts integer;
BEGIN
  INSERT INTO public.form_submission_limits AS l (key_hash, window_started_at, attempts)
  VALUES (_key_hash, now(), 1)
  ON CONFLICT (key_hash) DO UPDATE SET
    attempts = CASE WHEN l.window_started_at < now() - interval '1 hour' THEN 1 ELSE l.attempts + 1 END,
    window_started_at = CASE WHEN l.window_started_at < now() - interval '1 hour' THEN now() ELSE l.window_started_at END
  RETURNING attempts INTO _attempts;
  RETURN _attempts <= 5;
END $$;
REVOKE EXECUTE ON FUNCTION public.consume_form_submission_limit(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_form_submission_limit(text) TO service_role;

CREATE TABLE public.people_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_group text NOT NULL, slug text NOT NULL, name text NOT NULL,
  role text NOT NULL DEFAULT '', location text NOT NULL DEFAULT '',
  focus text[] NOT NULL DEFAULT '{}', summary text NOT NULL DEFAULT '', bio text NOT NULL DEFAULT '',
  photo_url text, sort_order integer NOT NULL DEFAULT 0,
  source_application_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (person_group, slug)
);
GRANT SELECT ON public.people_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.people_profiles TO authenticated;
GRANT ALL ON public.people_profiles TO service_role;
ALTER TABLE public.people_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are public" ON public.people_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert profiles" ON public.people_profiles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update profiles" ON public.people_profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete profiles" ON public.people_profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL UNIQUE, code_hash text NOT NULL,
  full_name text NOT NULL, photo_url text, designation text NOT NULL, department text NOT NULL,
  status text NOT NULL DEFAULT 'active', valid_until date,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read employees" ON public.employees FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete employees" ON public.employees FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.employee_verification_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id text NOT NULL, success boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.employee_verification_attempts TO service_role;
ALTER TABLE public.employee_verification_attempts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.admin_save_employee(
  _employee_id text, _code text, _full_name text, _photo_url text,
  _designation text, _department text, _status text, _valid_until text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  IF EXISTS (SELECT 1 FROM public.employees WHERE employee_id = _employee_id) THEN
    UPDATE public.employees SET
      full_name = _full_name, photo_url = NULLIF(_photo_url, ''), designation = _designation,
      department = _department, status = _status, valid_until = NULLIF(_valid_until, '')::date,
      code_hash = CASE WHEN coalesce(_code, '') <> '' THEN crypt(_code, gen_salt('bf')) ELSE code_hash END,
      updated_at = now()
    WHERE employee_id = _employee_id;
  ELSE
    IF length(coalesce(_code, '')) < 6 THEN RAISE EXCEPTION 'Code too short'; END IF;
    INSERT INTO public.employees (employee_id, code_hash, full_name, photo_url, designation, department, status, valid_until)
    VALUES (_employee_id, crypt(_code, gen_salt('bf')), _full_name, NULLIF(_photo_url, ''), _designation, _department, _status, NULLIF(_valid_until, '')::date);
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_save_employee(text,text,text,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_employee(text,text,text,text,text,text,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.verify_employee(_employee_id text, _code text)
RETURNS TABLE (employee_id text, full_name text, photo_url text, designation text, department text, status text, valid_until text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE _failures integer; _ok boolean;
BEGIN
  SELECT count(*) INTO _failures FROM public.employee_verification_attempts a
   WHERE a.employee_id = _employee_id AND NOT a.success AND a.created_at > now() - interval '15 minutes';
  IF _failures >= 5 THEN RAISE EXCEPTION 'Too many attempts. Try again later.'; END IF;
  SELECT EXISTS (SELECT 1 FROM public.employees e WHERE e.employee_id = _employee_id AND e.code_hash = crypt(_code, e.code_hash)) INTO _ok;
  INSERT INTO public.employee_verification_attempts (employee_id, success) VALUES (_employee_id, _ok);
  IF NOT _ok THEN RETURN; END IF;
  RETURN QUERY SELECT e.employee_id, e.full_name, coalesce(e.photo_url, ''), e.designation, e.department, e.status, coalesce(e.valid_until::text, '')
    FROM public.employees e WHERE e.employee_id = _employee_id;
END $$;
GRANT EXECUTE ON FUNCTION public.verify_employee(text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_setup_metadata()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  RETURN jsonb_build_object(
    'tables', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'name', c.relname, 'rls', c.relrowsecurity,
        'columns', (SELECT coalesce(jsonb_agg(jsonb_build_object('name', a.attname, 'type', format_type(a.atttypid, a.atttypmod), 'nullable', NOT a.attnotnull) ORDER BY a.attnum), '[]'::jsonb)
                    FROM pg_attribute a WHERE a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped)))
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r'), '[]'::jsonb),
    'functions', coalesce((SELECT jsonb_agg(DISTINCT p.proname) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public'), '[]'::jsonb)
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_setup_metadata() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_setup_metadata() TO authenticated;

CREATE POLICY "Admins read private files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id IN ('registration-documents','customer-reports') AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upload reports" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'customer-reports' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete reports" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'customer-reports' AND public.has_role(auth.uid(), 'admin'));