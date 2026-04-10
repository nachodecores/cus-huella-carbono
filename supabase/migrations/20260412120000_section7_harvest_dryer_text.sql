-- Section 7: harvest_main_method (text + CHECK), drying_main_method as text (drop enum).

ALTER TABLE crop_season_submissions
  ADD COLUMN harvest_main_method text;

UPDATE crop_season_submissions
SET harvest_main_method = 'directa'
WHERE harvest_main_method IS NULL;

ALTER TABLE crop_season_submissions
  ALTER COLUMN harvest_main_method SET NOT NULL;

ALTER TABLE crop_season_submissions
  ADD CONSTRAINT crop_season_submissions_harvest_main_method_check
  CHECK (harvest_main_method IN ('directa', 'corte_hilerado'));

ALTER TABLE crop_season_submissions
  ALTER COLUMN drying_main_method TYPE text
  USING drying_main_method::text;

UPDATE crop_season_submissions
SET drying_main_method = NULL
WHERE drying_main_method IS NOT NULL
  AND drying_main_method NOT IN ('gas', 'gasoil', 'electricidad');

DROP TYPE drying_main_method;

ALTER TABLE crop_season_submissions
  ADD CONSTRAINT crop_season_submissions_drying_main_method_check
  CHECK (
    drying_main_method IS NULL
    OR drying_main_method IN ('gas', 'gasoil', 'electricidad')
  );
