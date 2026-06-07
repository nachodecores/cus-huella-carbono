-- Catálogo de cultivos: distinguir Raigrás anual (ID 1, existente) y agregar
-- Raigrás perenne como nueva entrada (ID 14). Los envíos previos con crop_id = 1
-- quedan reasignados implícitamente a "Raigrás anual".
UPDATE public.crops
SET label = 'Raigrás anual'
WHERE id = 1 AND label = 'Raigrás';

INSERT INTO public.crops (id, label) VALUES
  (14, 'Raigrás perenne')
ON CONFLICT (id) DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('public.crops', 'id'),
  COALESCE((SELECT MAX(id) FROM public.crops), 1)
);
