-- Catálogo de cultivos: agregar Sorgo, Vicia, Moha, Alfalfa y Sudán.
INSERT INTO public.crops (id, label) VALUES
  (9, 'Sorgo'),
  (10, 'Vicia'),
  (11, 'Moha'),
  (12, 'Alfalfa'),
  (13, 'Sudán')
ON CONFLICT (id) DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('public.crops', 'id'),
  COALESCE((SELECT MAX(id) FROM public.crops), 1)
);
