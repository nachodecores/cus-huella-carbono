-- Borradores: superficie y semilla producida pueden quedar sin completar (NULL).

ALTER TABLE crop_season_submissions
  DROP CONSTRAINT IF EXISTS crop_season_submissions_area_positive,
  DROP CONSTRAINT IF EXISTS crop_season_submissions_seed_positive;

ALTER TABLE crop_season_submissions
  ALTER COLUMN area_cultivated_ha DROP NOT NULL,
  ALTER COLUMN seed_produced_kg DROP NOT NULL;

ALTER TABLE crop_season_submissions
  ADD CONSTRAINT crop_season_submissions_area_positive
    CHECK (area_cultivated_ha IS NULL OR area_cultivated_ha > 0),
  ADD CONSTRAINT crop_season_submissions_seed_positive
    CHECK (seed_produced_kg IS NULL OR seed_produced_kg > 0);
