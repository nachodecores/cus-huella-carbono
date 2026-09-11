-- submission_fertilizer_lines nunca tuvo índice en submission_id, a diferencia
-- de submission_tillage_lines. Toda consulta que filtra por submission_id
-- (formulario externo, cálculo de huella, tabla interna de respuestas) hacía
-- table scan completo.

CREATE INDEX idx_submission_fertilizer_lines_submission_id
  ON submission_fertilizer_lines (submission_id);
