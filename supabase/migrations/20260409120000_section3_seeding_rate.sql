-- Section 3 "Siembra e insumos": seed input is a seeding rate (kg/ha).
-- `seed_used_kg` remains stored as a derived backend value.
-- No historical backfill for MVP.

ALTER TABLE crop_season_submissions
  ADD COLUMN IF NOT EXISTS seeding_rate_kg_ha numeric(14, 3);

ALTER TABLE crop_season_submissions
  ADD CONSTRAINT crop_season_submissions_seeding_rate_positive CHECK (
    seeding_rate_kg_ha IS NULL OR seeding_rate_kg_ha > 0
  );
