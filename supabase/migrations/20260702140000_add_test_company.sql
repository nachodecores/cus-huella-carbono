-- Empresa "sentinela" de uso interno para mantener actividad en la DB
-- (Supabase pausa proyectos free tras ~7 días sin actividad).
-- Los envíos cargados con este token pueden borrarse manualmente cuando
-- quieras: son sólo para generar reads/writes periódicos.
-- Token con prefijo `test_` para distinguirla a simple vista de las 'prod_*'.

INSERT INTO public.companies (id, name, access_token) VALUES
  (
    'a1000000-0000-4000-8000-000000000013',
    'Prueba (interno)',
    'test_prueba_b9a3b6994461855c1f4911113a00e67d'
  )
ON CONFLICT (id) DO NOTHING;
