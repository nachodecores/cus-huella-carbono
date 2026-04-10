-- Remove irrigation from MVP: columns + checks + enum type.

ALTER TABLE crop_season_submissions
  DROP CONSTRAINT IF EXISTS crop_season_submissions_irrigation_area_percent_range;

ALTER TABLE crop_season_submissions
  DROP CONSTRAINT IF EXISTS crop_season_submissions_irrigation_water_mm_cycle_nonneg;

ALTER TABLE crop_season_submissions
  DROP CONSTRAINT IF EXISTS crop_season_submissions_irrigation_fuel_nonneg;

ALTER TABLE crop_season_submissions
  DROP COLUMN IF EXISTS irrigation_used,
  DROP COLUMN IF EXISTS irrigation_water_amount,
  DROP COLUMN IF EXISTS irrigation_water_unit,
  DROP COLUMN IF EXISTS irrigation_pump_kwh,
  DROP COLUMN IF EXISTS irrigation_area_percent,
  DROP COLUMN IF EXISTS irrigation_water_mm_cycle,
  DROP COLUMN IF EXISTS irrigation_energy_source,
  DROP COLUMN IF EXISTS irrigation_fuel_liters;

DROP TYPE IF EXISTS irrigation_water_unit;
