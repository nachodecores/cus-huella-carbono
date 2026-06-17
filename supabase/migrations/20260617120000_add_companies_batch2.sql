-- Segunda tanda de empresas (semilleros + Bayer / Syngenta / Corteva).
-- Tokens generados con 128 bits de entropía. IDs continúan la serie de
-- a1000000-0000-4000-8000-00000000000X (de 10 a 18 en hex: a..f, 10..12).

INSERT INTO public.companies (id, name, access_token) VALUES
  (
    'a1000000-0000-4000-8000-00000000000a',
    'Ricetec',
    'prod_ricetec_141d7f7b39a81d52a04a5cb89b3c5efd'
  ),
  (
    'a1000000-0000-4000-8000-00000000000b',
    'Dambo',
    'prod_dambo_24231129cd06837b09983412ea3a10ca'
  ),
  (
    'a1000000-0000-4000-8000-00000000000c',
    'Saman',
    'prod_saman_71175fa0f89d2791e2f383625bff8ea9'
  ),
  (
    'a1000000-0000-4000-8000-00000000000d',
    'Agroterra (Reylan)',
    'prod_agroterra_a22a3dc995b5b04af85750608ea38891'
  ),
  (
    'a1000000-0000-4000-8000-00000000000e',
    'Satus-Ager',
    'prod_satus_ager_3c543c9d903324644ed03cc453d44216'
  ),
  (
    'a1000000-0000-4000-8000-00000000000f',
    'Erro',
    'prod_erro_8a768a726686bfd5f80ee485b7b664d4'
  ),
  (
    'a1000000-0000-4000-8000-000000000010',
    'Bayer',
    'prod_bayer_dfa0df417b4cf7cea27446a7bc754a9c'
  ),
  (
    'a1000000-0000-4000-8000-000000000011',
    'Syngenta',
    'prod_syngenta_297e6d6a0cfd4658d1dada5703ed250e'
  ),
  (
    'a1000000-0000-4000-8000-000000000012',
    'Corteva',
    'prod_corteva_5cec48dc2ed2c2d5f6de39b8edb6dd01'
  )
ON CONFLICT (id) DO NOTHING;
