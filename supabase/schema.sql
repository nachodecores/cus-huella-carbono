-- MVP Postgres / Supabase DDL (no RLS).
-- Draft/save/submit: `fertilizers_used` must align with fertilizer lines —
--   false ⇒ zero lines; true ⇒ at least one valid line (see product validation).

CREATE TYPE season_type AS ENUM ('primavera', 'otono');

CREATE TYPE submission_status AS ENUM ('draft', 'submitted');

CREATE TYPE transport_mode AS ENUM ('truck', 'own_vehicle', 'other', 'unknown');

CREATE TYPE fertilizer_application_unit AS ENUM ('kg_ha', 'l_ha');

CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  access_token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE crops (
  id smallserial PRIMARY KEY,
  label text NOT NULL UNIQUE
);

CREATE TABLE fertilizers (
  id smallserial PRIMARY KEY,
  label text NOT NULL UNIQUE,
  application_unit fertilizer_application_unit NOT NULL
);

CREATE TABLE tillage_tools (
  id smallserial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  diesel_liters_per_ha_per_pass numeric(12, 4)
);

CREATE TABLE crop_season_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  crop_id smallint NOT NULL REFERENCES crops (id) ON DELETE RESTRICT,
  season_type season_type NOT NULL,
  season_year integer NOT NULL,
  status submission_status NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  area_cultivated_ha numeric(12, 4),
  seed_produced_kg numeric(14, 3),
  fertilizers_used boolean NOT NULL DEFAULT false,
  organic_amendment_used boolean NOT NULL,
  diesel_field_used boolean NOT NULL,
  electricity_used boolean NOT NULL,
  drying_used boolean NOT NULL,
  transport_used boolean NOT NULL,
  organic_amendment_quantity numeric(14, 3),
  organic_amendment_unit text,
  organic_amendment_area_percent numeric(5, 2),
  organic_amendment_rate_kg_ha numeric(14, 3),
  diesel_field_liters numeric(12, 3),
  electricity_kwh_attributed numeric(14, 3),
  drying_main_method text,
  drying_diesel_liters numeric(12, 3),
  drying_electricity_kwh numeric(14, 3),
  transport_total_km numeric(10, 2),
  transport_seed_quantity_kg numeric(14, 3),
  transport_mode transport_mode,
  gross_yield_kg_ha numeric(12, 3),
  clean_yield_kg_ha numeric(12, 3),
  fallow_used boolean NOT NULL DEFAULT false,
  fallow_spray_passes integer,
  fallow_diesel_liters numeric(12, 3),
  tillage_used boolean NOT NULL DEFAULT false,
  tillage_passes integer,
  tillage_diesel_liters numeric(12, 3),
  seeding_rate_kg_ha numeric(14, 3),
  seed_used_kg numeric(14, 3),
  inoculant_used boolean NOT NULL DEFAULT false,
  seed_treatment_used boolean NOT NULL DEFAULT false,
  crop_protection_used boolean NOT NULL DEFAULT false,
  crop_protection_spray_passes integer,
  crop_protection_diesel_liters numeric(12, 3),
  post_emergence_herbicide_used boolean NOT NULL DEFAULT false,
  fungicide_used boolean NOT NULL DEFAULT false,
  insecticide_used boolean NOT NULL DEFAULT false,
  post_emergence_herbicide_passes integer NOT NULL DEFAULT 0,
  fungicide_passes integer NOT NULL DEFAULT 0,
  insecticide_passes integer NOT NULL DEFAULT 0,
  harvest_main_method text NOT NULL,
  harvest_used boolean NOT NULL DEFAULT false,
  harvest_diesel_liters numeric(12, 3),
  conditioning_used boolean NOT NULL DEFAULT false,
  conditioning_electricity_kwh numeric(14, 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crop_season_submissions_area_positive CHECK (
    area_cultivated_ha IS NULL OR area_cultivated_ha > 0
  ),
  CONSTRAINT crop_season_submissions_seed_positive CHECK (
    seed_produced_kg IS NULL OR seed_produced_kg > 0
  ),
  CONSTRAINT crop_season_submissions_season_year_sensible CHECK (
    season_year >= 2000 AND season_year <= 2100
  ),
  CONSTRAINT crop_season_submissions_submitted_at_matches_status CHECK (
    (status = 'submitted' AND submitted_at IS NOT NULL)
    OR (status = 'draft' AND submitted_at IS NULL)
  ),
  CONSTRAINT crop_season_submissions_gross_yield_nonneg CHECK (
    gross_yield_kg_ha IS NULL OR gross_yield_kg_ha >= 0
  ),
  CONSTRAINT crop_season_submissions_clean_yield_nonneg CHECK (
    clean_yield_kg_ha IS NULL OR clean_yield_kg_ha >= 0
  ),
  CONSTRAINT crop_season_submissions_fallow_passes_nonneg CHECK (
    fallow_spray_passes IS NULL OR fallow_spray_passes >= 0
  ),
  CONSTRAINT crop_season_submissions_fallow_diesel_nonneg CHECK (
    fallow_diesel_liters IS NULL OR fallow_diesel_liters >= 0
  ),
  CONSTRAINT crop_season_submissions_tillage_passes_nonneg CHECK (
    tillage_passes IS NULL OR tillage_passes >= 0
  ),
  CONSTRAINT crop_season_submissions_tillage_diesel_nonneg CHECK (
    tillage_diesel_liters IS NULL OR tillage_diesel_liters >= 0
  ),
  CONSTRAINT crop_season_submissions_seed_used_nonneg CHECK (
    seed_used_kg IS NULL OR seed_used_kg >= 0
  ),
  CONSTRAINT crop_season_submissions_seeding_rate_positive CHECK (
    seeding_rate_kg_ha IS NULL OR seeding_rate_kg_ha > 0
  ),
  CONSTRAINT crop_season_submissions_crop_prot_passes_nonneg CHECK (
    crop_protection_spray_passes IS NULL OR crop_protection_spray_passes >= 0
  ),
  CONSTRAINT crop_season_submissions_crop_prot_diesel_nonneg CHECK (
    crop_protection_diesel_liters IS NULL OR crop_protection_diesel_liters >= 0
  ),
  CONSTRAINT crop_season_submissions_herbicide_passes_nonneg CHECK (
    post_emergence_herbicide_passes >= 0
  ),
  CONSTRAINT crop_season_submissions_fungicide_passes_nonneg CHECK (
    fungicide_passes >= 0
  ),
  CONSTRAINT crop_season_submissions_insecticide_passes_nonneg CHECK (
    insecticide_passes >= 0
  ),
  CONSTRAINT crop_season_submissions_harvest_diesel_nonneg CHECK (
    harvest_diesel_liters IS NULL OR harvest_diesel_liters >= 0
  ),
  CONSTRAINT crop_season_submissions_conditioning_kwh_nonneg CHECK (
    conditioning_electricity_kwh IS NULL OR conditioning_electricity_kwh >= 0
  ),
  CONSTRAINT crop_season_submissions_harvest_main_method_check CHECK (
    harvest_main_method IN ('directa', 'corte_hilerado')
  ),
  CONSTRAINT crop_season_submissions_drying_main_method_check CHECK (
    drying_main_method IS NULL
    OR drying_main_method IN ('gas', 'gasoil', 'electricidad')
  ),
  CONSTRAINT crop_season_submissions_organic_amendment_area_percent_range CHECK (
    organic_amendment_area_percent IS NULL
    OR (
      organic_amendment_area_percent >= 0
      AND organic_amendment_area_percent <= 100
    )
  ),
  CONSTRAINT crop_season_submissions_organic_amendment_rate_nonneg CHECK (
    organic_amendment_rate_kg_ha IS NULL OR organic_amendment_rate_kg_ha >= 0
  ),
  CONSTRAINT uq_crop_season_submissions_company_crop_season UNIQUE (
    company_id,
    crop_id,
    season_type,
    season_year
  )
);

CREATE TABLE submission_fertilizer_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES crop_season_submissions (id) ON DELETE CASCADE,
  fertilizer_id smallint NOT NULL REFERENCES fertilizers (id) ON DELETE RESTRICT,
  application_rate_per_ha numeric(14, 3) NOT NULL,
  total_quantity numeric(14, 3) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT submission_fertilizer_lines_rate_positive CHECK (application_rate_per_ha > 0),
  CONSTRAINT submission_fertilizer_lines_total_positive CHECK (total_quantity > 0)
);

CREATE TABLE submission_tillage_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES crop_season_submissions (id) ON DELETE CASCADE,
  tillage_tool_id smallint NOT NULL REFERENCES tillage_tools (id) ON DELETE RESTRICT,
  passes integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT submission_tillage_lines_passes_positive CHECK (passes > 0)
);

CREATE INDEX idx_submission_tillage_lines_submission_id ON submission_tillage_lines (submission_id);
