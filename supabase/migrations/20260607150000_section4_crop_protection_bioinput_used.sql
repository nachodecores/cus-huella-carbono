-- Sección 4: pregunta booleana "¿Utilizó algún bio-insumo para la protección del cultivo?".
-- Se guarda como `crop_protection_bioinput_used` (sin colisionar con la legacy `crop_protection_used`).
-- Sin factor de emisión ni subpreguntas asociadas todavía (MVP boolean only).

ALTER TABLE crop_season_submissions
  ADD COLUMN IF NOT EXISTS crop_protection_bioinput_used boolean NOT NULL DEFAULT false;
