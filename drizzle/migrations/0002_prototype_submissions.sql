CREATE TABLE public.prototype_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 idea text NOT NULL,
 prototype text NOT NULL,
 funding_goal text NOT NULL,
 eligibility_context text NOT NULL,
 ai_output text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.prototype_submissions TO authenticated;
GRANT ALL ON public.prototype_submissions TO service_role;
ALTER TABLE public.prototype_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read prototype submissions" ON public.prototype_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX prototype_submissions_created_at_idx ON public.prototype_submissions (created_at DESC);