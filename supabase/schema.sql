CREATE TABLE IF NOT EXISTS public.countries (
  codigo TEXT PRIMARY KEY
    CHECK (codigo ~ '^[A-Z]{2}$'),
  codigo_alpha3 TEXT NOT NULL UNIQUE
    CHECK (codigo_alpha3 ~ '^[A-Z]{3}$'),
  nombre_comun TEXT NOT NULL,
  nombre_oficial TEXT NOT NULL,
  region TEXT,
  subregion TEXT,
  capital TEXT,
  poblacion BIGINT
    CHECK (poblacion IS NULL OR poblacion >= 0),
  bandera_url TEXT,
  bandera_alt TEXT,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.countries FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE public.countries TO authenticated;

DROP POLICY IF EXISTS countries_select_authenticated ON public.countries;

CREATE POLICY countries_select_authenticated
  ON public.countries
  FOR SELECT
  TO authenticated
  USING (true);
