-- Organic amendments removed from MVP: drop constraints then columns.

ALTER TABLE public.crop_season_submissions
  DROP CONSTRAINT IF EXISTS crop_season_submissions_organic_amendment_area_percent_range;

ALTER TABLE public.crop_season_submissions
  DROP CONSTRAINT IF EXISTS crop_season_submissions_organic_amendment_rate_nonneg;

ALTER TABLE public.crop_season_submissions
  DROP COLUMN IF EXISTS organic_amendment_quantity,
  DROP COLUMN IF EXISTS organic_amendment_unit,
  DROP COLUMN IF EXISTS organic_amendment_area_percent,
  DROP COLUMN IF EXISTS organic_amendment_rate_kg_ha,
  DROP COLUMN IF EXISTS organic_amendment_used;
