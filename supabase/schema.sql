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
  diesel_field_used boolean NOT NULL,
  electricity_used boolean NOT NULL,
  drying_used boolean NOT NULL,
  transport_used boolean NOT NULL,
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

-- ---------------------------------------------------------------------------
-- Carbon footprint MVP: assumptions + calculation run / line items
-- ---------------------------------------------------------------------------

CREATE TYPE calculation_run_status AS ENUM ('pending', 'complete', 'failed');

CREATE TABLE assumption_set (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX assumption_set_one_default
  ON assumption_set (is_default)
  WHERE is_default = true;

CREATE TABLE assumption_set_global (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assumption_set_id uuid NOT NULL REFERENCES assumption_set (id) ON DELETE CASCADE,
  param_key text NOT NULL,
  value_numeric numeric NOT NULL,
  unit text,
  notes text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assumption_set_global_param_key_nonempty CHECK (length(trim(param_key)) > 0),
  CONSTRAINT assumption_set_global_unique_key UNIQUE (assumption_set_id, param_key)
);

CREATE INDEX idx_assumption_set_global_set ON assumption_set_global (assumption_set_id);

CREATE TABLE assumption_fertilizer_factor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assumption_set_id uuid NOT NULL REFERENCES assumption_set (id) ON DELETE CASCADE,
  fertilizer_id smallint NOT NULL REFERENCES fertilizers (id) ON DELETE RESTRICT,
  kg_co2e_per_kg_product numeric,
  kg_co2e_per_l_product numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assumption_fertilizer_factor_unique_pair UNIQUE (assumption_set_id, fertilizer_id),
  CONSTRAINT assumption_fertilizer_factor_one_basis CHECK (
    (kg_co2e_per_kg_product IS NOT NULL AND kg_co2e_per_l_product IS NULL)
    OR (kg_co2e_per_kg_product IS NULL AND kg_co2e_per_l_product IS NOT NULL)
  ),
  CONSTRAINT assumption_fertilizer_factor_nonneg CHECK (
    COALESCE(kg_co2e_per_kg_product, 0) >= 0
    AND COALESCE(kg_co2e_per_l_product, 0) >= 0
  )
);

CREATE INDEX idx_assumption_fertilizer_factor_set ON assumption_fertilizer_factor (assumption_set_id);

CREATE TABLE assumption_tillage_tool_factor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assumption_set_id uuid NOT NULL REFERENCES assumption_set (id) ON DELETE CASCADE,
  tillage_tool_id smallint NOT NULL REFERENCES tillage_tools (id) ON DELETE RESTRICT,
  diesel_liters_per_ha_per_pass numeric NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assumption_tillage_tool_factor_unique_pair UNIQUE (assumption_set_id, tillage_tool_id),
  CONSTRAINT assumption_tillage_tool_factor_diesel_nonneg CHECK (diesel_liters_per_ha_per_pass >= 0)
);

CREATE INDEX idx_assumption_tillage_tool_factor_set ON assumption_tillage_tool_factor (assumption_set_id);

CREATE TABLE calculation_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES crop_season_submissions (id) ON DELETE CASCADE,
  assumption_set_id uuid NOT NULL REFERENCES assumption_set (id) ON DELETE RESTRICT,
  status calculation_run_status NOT NULL DEFAULT 'pending',
  total_kg_co2e numeric,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT calculation_run_total_nonneg CHECK (total_kg_co2e IS NULL OR total_kg_co2e >= 0)
);

CREATE INDEX idx_calculation_run_submission ON calculation_run (submission_id);
CREATE INDEX idx_calculation_run_assumption_set ON calculation_run (assumption_set_id);
CREATE INDEX idx_calculation_run_status ON calculation_run (status);

CREATE TABLE calculation_line_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_run_id uuid NOT NULL REFERENCES calculation_run (id) ON DELETE CASCADE,
  category text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  label text NOT NULL,
  quantity numeric,
  quantity_unit text,
  emission_factor numeric,
  emission_factor_unit text,
  kg_co2e numeric NOT NULL,
  submission_fertilizer_line_id uuid REFERENCES submission_fertilizer_lines (id) ON DELETE SET NULL,
  submission_tillage_line_id uuid REFERENCES submission_tillage_lines (id) ON DELETE SET NULL,
  CONSTRAINT calculation_line_item_category_allowed CHECK (
    category IN (
      'fallow',
      'tillage',
      'fertilizer',
      'crop_protection',
      'seed_inputs',
      'harvest',
      'drying',
      'conditioning',
      'transport',
      'other'
    )
  ),
  CONSTRAINT calculation_line_item_kg_co2e_nonneg CHECK (kg_co2e >= 0)
);

CREATE INDEX idx_calculation_line_item_run ON calculation_line_item (calculation_run_id);
CREATE INDEX idx_calculation_line_item_category ON calculation_line_item (calculation_run_id, category);
