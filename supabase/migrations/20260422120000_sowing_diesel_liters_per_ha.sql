-- Implicit mechanical sowing: diesel L/ha (one operation), same EF as other tillage diesel.
INSERT INTO public.assumption_set_global (
  assumption_set_id,
  param_key,
  value_numeric,
  unit,
  notes,
  display_order
)
SELECT
  s.id,
  'sowing_diesel_liters_per_ha',
  0,
  'L_per_ha',
  'Diesel de siembra mecánica por hectárea (una operación; no figura en el listado de herramientas de laboreo).',
  (SELECT COALESCE(MAX(g.display_order), 0) + 1
   FROM public.assumption_set_global g
   WHERE g.assumption_set_id = s.id)
FROM public.assumption_set s
ON CONFLICT (assumption_set_id, param_key) DO NOTHING;
