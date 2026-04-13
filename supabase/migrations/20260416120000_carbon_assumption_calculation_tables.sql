-- Carbon footprint MVP: assumption sets, factors, and calculation run storage.
-- Calculation logic and admin UI are not part of this migration.

CREATE TYPE public.calculation_run_status AS ENUM ('pending', 'complete', 'failed');

CREATE TABLE public.assumption_set (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX assumption_set_one_default
  ON public.assumption_set (is_default)
  WHERE is_default = true;

CREATE TABLE public.assumption_set_global (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assumption_set_id uuid NOT NULL REFERENCES public.assumption_set (id) ON DELETE CASCADE,
  param_key text NOT NULL,
  value_numeric numeric NOT NULL,
  unit text,
  notes text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assumption_set_global_param_key_nonempty CHECK (length(trim(param_key)) > 0),
  CONSTRAINT assumption_set_global_unique_key UNIQUE (assumption_set_id, param_key)
);

CREATE INDEX idx_assumption_set_global_set
  ON public.assumption_set_global (assumption_set_id);

CREATE TABLE public.assumption_fertilizer_factor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assumption_set_id uuid NOT NULL REFERENCES public.assumption_set (id) ON DELETE CASCADE,
  fertilizer_id smallint NOT NULL REFERENCES public.fertilizers (id) ON DELETE RESTRICT,
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

CREATE INDEX idx_assumption_fertilizer_factor_set
  ON public.assumption_fertilizer_factor (assumption_set_id);

CREATE TABLE public.assumption_tillage_tool_factor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assumption_set_id uuid NOT NULL REFERENCES public.assumption_set (id) ON DELETE CASCADE,
  tillage_tool_id smallint NOT NULL REFERENCES public.tillage_tools (id) ON DELETE RESTRICT,
  diesel_liters_per_ha_per_pass numeric NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assumption_tillage_tool_factor_unique_pair UNIQUE (assumption_set_id, tillage_tool_id),
  CONSTRAINT assumption_tillage_tool_factor_diesel_nonneg CHECK (diesel_liters_per_ha_per_pass >= 0)
);

CREATE INDEX idx_assumption_tillage_tool_factor_set
  ON public.assumption_tillage_tool_factor (assumption_set_id);

CREATE TABLE public.calculation_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.crop_season_submissions (id) ON DELETE CASCADE,
  assumption_set_id uuid NOT NULL REFERENCES public.assumption_set (id) ON DELETE RESTRICT,
  status public.calculation_run_status NOT NULL DEFAULT 'pending',
  total_kg_co2e numeric,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT calculation_run_total_nonneg CHECK (total_kg_co2e IS NULL OR total_kg_co2e >= 0)
);

CREATE INDEX idx_calculation_run_submission ON public.calculation_run (submission_id);
CREATE INDEX idx_calculation_run_assumption_set ON public.calculation_run (assumption_set_id);
CREATE INDEX idx_calculation_run_status ON public.calculation_run (status);

CREATE TABLE public.calculation_line_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_run_id uuid NOT NULL REFERENCES public.calculation_run (id) ON DELETE CASCADE,
  category text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  label text NOT NULL,
  quantity numeric,
  quantity_unit text,
  emission_factor numeric,
  emission_factor_unit text,
  kg_co2e numeric NOT NULL,
  submission_fertilizer_line_id uuid REFERENCES public.submission_fertilizer_lines (id) ON DELETE SET NULL,
  submission_tillage_line_id uuid REFERENCES public.submission_tillage_lines (id) ON DELETE SET NULL,
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

CREATE INDEX idx_calculation_line_item_run ON public.calculation_line_item (calculation_run_id);
CREATE INDEX idx_calculation_line_item_category
  ON public.calculation_line_item (calculation_run_id, category);
