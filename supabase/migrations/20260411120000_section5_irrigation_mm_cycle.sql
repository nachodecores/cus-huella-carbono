-- Section 5 "Riego": total water depth (mm/cycle); % area is the gate; no user m³/kWh/L.
-- Deprecated columns remain: irrigation_used, irrigation_water_amount, irrigation_water_unit,
-- irrigation_pump_kwh, irrigation_fuel_liters.

ALTER TABLE crop_season_submissions
  ADD COLUMN IF NOT EXISTS irrigation_water_mm_cycle numeric(12, 3);

ALTER TABLE crop_season_submissions
  ADD CONSTRAINT crop_season_submissions_irrigation_water_mm_cycle_nonneg CHECK (
    irrigation_water_mm_cycle IS NULL OR irrigation_water_mm_cycle >= 0
  );
