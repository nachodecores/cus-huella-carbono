-- Section 2 "Barbecho y suelo": organic % + rate on treated area; tillage catalog + lines.
-- Does not drop deprecated columns: fallow_diesel_liters, tillage_passes, tillage_diesel_liters,
-- organic_amendment_quantity, organic_amendment_unit.

CREATE TABLE tillage_tools (
  id smallserial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  diesel_liters_per_ha_per_pass numeric(12, 4)
);

INSERT INTO tillage_tools (code, label, diesel_liters_per_ha_per_pass) VALUES
  ('subsolador', 'Subsolador', NULL),
  ('excentrica', 'Excéntrica', NULL),
  ('disquera', 'Disquera', NULL),
  ('rastra_liviana', 'Rastra liviana', NULL),
  ('rastra_dientes', 'Rastra de dientes', NULL)
ON CONFLICT (code) DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('tillage_tools', 'id'),
  COALESCE((SELECT MAX(id) FROM tillage_tools), 1)
);

ALTER TABLE crop_season_submissions
  ADD COLUMN IF NOT EXISTS organic_amendment_area_percent numeric(5, 2),
  ADD COLUMN IF NOT EXISTS organic_amendment_rate_kg_ha numeric(14, 3);

ALTER TABLE crop_season_submissions
  ADD CONSTRAINT crop_season_submissions_organic_amendment_area_percent_range CHECK (
    organic_amendment_area_percent IS NULL
    OR (
      organic_amendment_area_percent >= 0
      AND organic_amendment_area_percent <= 100
    )
  ),
  ADD CONSTRAINT crop_season_submissions_organic_amendment_rate_nonneg CHECK (
    organic_amendment_rate_kg_ha IS NULL OR organic_amendment_rate_kg_ha >= 0
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
