CREATE TABLE public.country_programme_fees (
 country text PRIMARY KEY CHECK (country IN ('india','uk','uae','canada','usa','singapore','europe','australia')),
 currency text NOT NULL CHECK (currency IN ('INR','GBP','AED','CAD','USD','SGD','EUR','AUD')),
 amount numeric(12,2) CHECK (amount > 0 AND amount <= 1000000),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.country_programme_fees TO anon;
GRANT SELECT, INSERT, UPDATE ON public.country_programme_fees TO authenticated;
GRANT ALL ON public.country_programme_fees TO service_role;
ALTER TABLE public.country_programme_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read country registration fees" ON public.country_programme_fees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert registration fees" ON public.country_programme_fees FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update registration fees" ON public.country_programme_fees FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));