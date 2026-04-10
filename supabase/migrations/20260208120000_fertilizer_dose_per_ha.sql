-- MVP migration: fertilizer catalog units + dose/ha + totals (destructive for lines).
-- Run after backup if needed. Clears all fertilizer lines (dev-friendly).

CREATE TYPE fertilizer_application_unit AS ENUM ('kg_ha', 'l_ha');

DELETE FROM submission_fertilizer_lines;

ALTER TABLE submission_fertilizer_lines
  DROP COLUMN IF EXISTS quantity,
  DROP COLUMN IF EXISTS unit,
  DROP COLUMN IF EXISTS custom_label;

ALTER TABLE submission_fertilizer_lines
  ADD COLUMN application_rate_per_ha numeric(14, 3) NOT NULL,
  ADD COLUMN total_quantity numeric(14, 3) NOT NULL;

ALTER TABLE submission_fertilizer_lines
  DROP CONSTRAINT IF EXISTS submission_fertilizer_lines_quantity_positive;

ALTER TABLE submission_fertilizer_lines
  ADD CONSTRAINT submission_fertilizer_lines_rate_positive CHECK (application_rate_per_ha > 0),
  ADD CONSTRAINT submission_fertilizer_lines_total_positive CHECK (total_quantity > 0);

ALTER TABLE fertilizers
  ADD COLUMN IF NOT EXISTS application_unit fertilizer_application_unit;

UPDATE fertilizers SET application_unit = 'kg_ha' WHERE application_unit IS NULL;
UPDATE fertilizers SET application_unit = 'l_ha' WHERE id = 10;

ALTER TABLE fertilizers
  ALTER COLUMN application_unit SET NOT NULL;

DELETE FROM fertilizers WHERE id = 12;

SELECT setval(
  pg_get_serial_sequence('fertilizers', 'id'),
  COALESCE((SELECT MAX(id) FROM fertilizers), 1)
);
