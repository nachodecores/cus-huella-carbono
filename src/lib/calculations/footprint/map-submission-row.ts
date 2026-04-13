import type { SubmissionRow } from "@/lib/calculations/footprint/compute-lines";

/** Maps a raw Supabase `crop_season_submissions` row to `SubmissionRow`. */
export function mapRowToSubmissionFootprintInput(
  row: Record<string, unknown>,
): SubmissionRow {
  return {
    area_cultivated_ha:
      row.area_cultivated_ha == null || row.area_cultivated_ha === ""
        ? null
        : Number(row.area_cultivated_ha),
    seed_produced_kg:
      row.seed_produced_kg == null || row.seed_produced_kg === ""
        ? null
        : Number(row.seed_produced_kg),
    clean_yield_kg_ha:
      row.clean_yield_kg_ha == null || row.clean_yield_kg_ha === ""
        ? null
        : Number(row.clean_yield_kg_ha),
    fallow_used: Boolean(row.fallow_used),
    fallow_spray_passes:
      row.fallow_spray_passes == null
        ? null
        : Number(row.fallow_spray_passes),
    tillage_used: Boolean(row.tillage_used),
    fertilizers_used: Boolean(row.fertilizers_used),
    post_emergence_herbicide_passes: Number(
      row.post_emergence_herbicide_passes ?? 0,
    ),
    fungicide_passes: Number(row.fungicide_passes ?? 0),
    insecticide_passes: Number(row.insecticide_passes ?? 0),
    inoculant_used: Boolean(row.inoculant_used),
    seed_treatment_used: Boolean(row.seed_treatment_used),
    harvest_main_method: String(row.harvest_main_method ?? "directa"),
    conditioning_used: Boolean(row.conditioning_used),
    drying_used: Boolean(row.drying_used),
    drying_main_method:
      row.drying_main_method == null || row.drying_main_method === ""
        ? null
        : String(row.drying_main_method),
    transport_used: Boolean(row.transport_used),
    transport_total_km:
      row.transport_total_km == null || row.transport_total_km === ""
        ? null
        : Number(row.transport_total_km),
  };
}
