-- Rotación de access_tokens: de los `mvp_dev_*` (públicos en el repo) a
-- valores `prod_*` con 128 bits de entropía generados aleatoriamente.
-- Idempotente por `id` (UUIDs de companies seedeadas). No toca submissions:
-- los borradores siguen atados a `company_id`, no al token.

UPDATE public.companies SET access_token = 'prod_agrofuturo_b58b803d938dfdb668872b838ab0e7f7'
  WHERE id = 'a1000000-0000-4000-8000-000000000001';

UPDATE public.companies SET access_token = 'prod_gentos_46d2ac7bd10df4eb6fcf040f11f26cbf'
  WHERE id = 'a1000000-0000-4000-8000-000000000002';

UPDATE public.companies SET access_token = 'prod_procampo_92e2cad20fa5dbcb0bda7ff7f5933eaf'
  WHERE id = 'a1000000-0000-4000-8000-000000000003';

UPDATE public.companies SET access_token = 'prod_dlf_85e6ec1e16d867b150a60ff94ad890a4'
  WHERE id = 'a1000000-0000-4000-8000-000000000004';

UPDATE public.companies SET access_token = 'prod_viro_b68f0df78ab8c45ed3809f087e62eea0'
  WHERE id = 'a1000000-0000-4000-8000-000000000005';

UPDATE public.companies SET access_token = 'prod_dmk_semillas_a54525bd1cf1f7c06706e7c402e1c06f'
  WHERE id = 'a1000000-0000-4000-8000-000000000006';

UPDATE public.companies SET access_token = 'prod_calvase_e8eac1d4d41b48c79dee47a679830e86'
  WHERE id = 'a1000000-0000-4000-8000-000000000007';

UPDATE public.companies SET access_token = 'prod_fadisol_c4e0ad585f1c642c9aa43998a0825c03'
  WHERE id = 'a1000000-0000-4000-8000-000000000008';

UPDATE public.companies SET access_token = 'prod_germinar_1dd9ab0ec38c0561a1e6e30e9a7bfad9'
  WHERE id = 'a1000000-0000-4000-8000-000000000009';
