-- Stage-based questionnaire columns on `crop_season_submissions` (MVP).
-- Does not drop deprecated electricity_* / diesel_field_* columns.
-- Does not modify `submission_fertilizer_lines`.

ALTER TABLE crop_season_submissions
  ADD COLUMN IF NOT EXISTS gross_yield_kg_ha numeric(12, 3),
  ADD COLUMN IF NOT EXISTS clean_yield_kg_ha numeric(12, 3),
  ADD COLUMN IF NOT EXISTS fallow_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fallow_spray_passes integer,
  ADD COLUMN IF NOT EXISTS fallow_diesel_liters numeric(12, 3),
  ADD COLUMN IF NOT EXISTS tillage_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tillage_passes integer,
  ADD COLUMN IF NOT EXISTS tillage_diesel_liters numeric(12, 3),
  ADD COLUMN IF NOT EXISTS seed_used_kg numeric(14, 3),
  ADD COLUMN IF NOT EXISTS inoculant_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS seed_treatment_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS crop_protection_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS crop_protection_spray_passes integer,
  ADD COLUMN IF NOT EXISTS crop_protection_diesel_liters numeric(12, 3),
  ADD COLUMN IF NOT EXISTS post_emergence_herbicide_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fungicide_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS insecticide_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS irrigation_area_percent numeric(5, 2),
  ADD COLUMN IF NOT EXISTS irrigation_energy_source text,
  ADD COLUMN IF NOT EXISTS irrigation_fuel_liters numeric(12, 3),
  ADD COLUMN IF NOT EXISTS harvest_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS harvest_diesel_liters numeric(12, 3),
  ADD COLUMN IF NOT EXISTS conditioning_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS conditioning_electricity_kwh numeric(14, 3);

ALTER TABLE crop_season_submissions
  ADD CONSTRAINT crop_season_submissions_gross_yield_nonneg CHECK (
    gross_yield_kg_ha IS NULL OR gross_yield_kg_ha >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_clean_yield_nonneg CHECK (
    clean_yield_kg_ha IS NULL OR clean_yield_kg_ha >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_fallow_passes_nonneg CHECK (
    fallow_spray_passes IS NULL OR fallow_spray_passes >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_fallow_diesel_nonneg CHECK (
    fallow_diesel_liters IS NULL OR fallow_diesel_liters >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_tillage_passes_nonneg CHECK (
    tillage_passes IS NULL OR tillage_passes >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_tillage_diesel_nonneg CHECK (
    tillage_diesel_liters IS NULL OR tillage_diesel_liters >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_seed_used_nonneg CHECK (
    seed_used_kg IS NULL OR seed_used_kg >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_crop_prot_passes_nonneg CHECK (
    crop_protection_spray_passes IS NULL OR crop_protection_spray_passes >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_crop_prot_diesel_nonneg CHECK (
    crop_protection_diesel_liters IS NULL OR crop_protection_diesel_liters >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_irrigation_area_percent_range CHECK (
    irrigation_area_percent IS NULL
    OR (
      irrigation_area_percent >= 0
      AND irrigation_area_percent <= 100
    )
  ),
  ADD CONSTRAINT crop_season_submissions_irrigation_fuel_nonneg CHECK (
    irrigation_fuel_liters IS NULL OR irrigation_fuel_liters >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_harvest_diesel_nonneg CHECK (
    harvest_diesel_liters IS NULL OR harvest_diesel_liters >= 0
  ),
  ADD CONSTRAINT crop_season_submissions_conditioning_kwh_nonneg CHECK (
    conditioning_electricity_kwh IS NULL OR conditioning_electricity_kwh >= 0
  );
