-- Catálogo de fertilizantes: agregar Bio-fertilizante (líquido, l_ha).
-- También se inserta un factor placeholder (0) en el assumption_set por defecto
-- para que pase el CHECK `assumption_fertilizer_factor_one_basis`.

INSERT INTO public.fertilizers (id, label, application_unit) VALUES
  (12, 'Bio-fertilizante', 'l_ha')
ON CONFLICT (id) DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('public.fertilizers', 'id'),
  COALESCE((SELECT MAX(id) FROM public.fertilizers), 1)
);

INSERT INTO public.assumption_fertilizer_factor (
  assumption_set_id,
  fertilizer_id,
  kg_co2e_per_kg_product,
  kg_co2e_per_l_product,
  notes
)
SELECT
  s.id,
  f.id,
  CASE WHEN f.application_unit = 'kg_ha' THEN 0::numeric ELSE NULL END,
  CASE WHEN f.application_unit = 'l_ha' THEN 0::numeric ELSE NULL END,
  'TEMP placeholder — reemplazar con intensidad específica del producto'
FROM public.assumption_set s
CROSS JOIN public.fertilizers f
WHERE f.label = 'Bio-fertilizante'
ON CONFLICT (assumption_set_id, fertilizer_id) DO NOTHING;
