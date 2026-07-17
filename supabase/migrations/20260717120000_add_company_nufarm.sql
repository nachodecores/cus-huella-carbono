-- Empresa adicional: Nufarm. Token con 128 bits de entropía.
-- Continúa la serie a1000000-0000-4000-8000-0000000000XX (14 en hex).

INSERT INTO public.companies (id, name, access_token) VALUES
  (
    'a1000000-0000-4000-8000-000000000014',
    'Nufarm',
    'prod_nufarm_8eb4cabc95b9350bd197c6e0e6053b37'
  )
ON CONFLICT (id) DO NOTHING;
