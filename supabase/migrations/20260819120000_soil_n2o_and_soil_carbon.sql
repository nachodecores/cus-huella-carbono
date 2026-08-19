-- Carbon footprint: add soil_n2o and soil_carbon categories.
-- soil_carbon can be negative (sequestration credit), so the previous
-- nonneg constraints on calculation_line_item.kg_co2e and
-- calculation_run.total_kg_co2e are relaxed accordingly.

ALTER TABLE public.assumption_fertilizer_factor
  ADD COLUMN kg_n_per_unit_product numeric,
  ADD CONSTRAINT assumption_fertilizer_factor_n_nonneg CHECK (
    kg_n_per_unit_product IS NULL OR kg_n_per_unit_product >= 0
  );

ALTER TABLE public.calculation_line_item
  DROP CONSTRAINT calculation_line_item_category_allowed;

ALTER TABLE public.calculation_line_item
  ADD CONSTRAINT calculation_line_item_category_allowed CHECK (
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
      'soil_n2o',
      'soil_carbon',
      'other'
    )
  );

ALTER TABLE public.calculation_line_item
  DROP CONSTRAINT calculation_line_item_kg_co2e_nonneg;

ALTER TABLE public.calculation_line_item
  ADD CONSTRAINT calculation_line_item_kg_co2e_nonneg CHECK (
    kg_co2e >= 0 OR category = 'soil_carbon'
  );

ALTER TABLE public.calculation_run
  DROP CONSTRAINT calculation_run_total_nonneg;
