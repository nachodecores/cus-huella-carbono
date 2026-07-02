-- Vista de conveniencia para navegar `crop_season_submissions` en Supabase
-- Table Editor mostrando el nombre de la empresa como primera columna.
-- No duplica datos: es un JOIN dinámico contra `companies.name`.
-- La app sigue leyendo la tabla base; esta vista es solo para consulta manual.

CREATE OR REPLACE VIEW public.crop_season_submissions_v AS
SELECT
  c.name AS company_name,
  s.*
FROM public.crop_season_submissions s
JOIN public.companies c ON c.id = s.company_id;
