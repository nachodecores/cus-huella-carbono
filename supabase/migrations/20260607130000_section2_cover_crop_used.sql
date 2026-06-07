-- Sección 2: pregunta booleana "¿Realizó un cultivo de cobertura?".
-- Se guarda como `cover_crop_used` análogo a `fallow_used` / `tillage_used`.
-- Sin factor de emisión ni subpreguntas asociadas todavía (MVP boolean only).

ALTER TABLE crop_season_submissions
  ADD COLUMN IF NOT EXISTS cover_crop_used boolean NOT NULL DEFAULT false;
