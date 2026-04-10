-- Section 4 "Protección del cultivo": per-type spray passes only (no gate, no user diesel).
-- Deprecated columns remain: crop_protection_used, crop_protection_spray_passes,
-- crop_protection_diesel_liters, post_emergence_herbicide_used, fungicide_used, insecticide_used.

ALTER TABLE crop_season_submissions
  ADD COLUMN IF NOT EXISTS post_emergence_herbicide_passes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fungicide_passes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS insecticide_passes integer NOT NULL DEFAULT 0;

ALTER TABLE crop_season_submissions
  ADD CONSTRAINT crop_season_submissions_herbicide_passes_nonneg CHECK (
    post_emergence_herbicide_passes >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_fungicide_passes_nonneg CHECK (
    fungicide_passes >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_insecticide_passes_nonneg CHECK (
    insecticide_passes >= 0
  );
