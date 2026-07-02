-- Extiende la vista `crop_season_submissions_v` para resolver también
-- `crop_id` → `crop_label` (nombre legible del cultivo) como segunda columna.
-- Sigue sin duplicar datos: JOIN dinámico contra `crops.label`.
--
-- `CREATE OR REPLACE VIEW` no admite insertar/renombrar columnas en el medio
-- (solo agregar al final). Como queremos `crop_label` en la posición 2,
-- hay que DROP + CREATE. La vista no tiene dependientes.

DROP VIEW IF EXISTS public.crop_season_submissions_v;

CREATE VIEW public.crop_season_submissions_v AS
SELECT
  c.name AS company_name,
  k.label AS crop_label,
  s.*
FROM public.crop_season_submissions s
JOIN public.companies c ON c.id = s.company_id
JOIN public.crops k ON k.id = s.crop_id;
