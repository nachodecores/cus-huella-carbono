import type {
  HarvestMainMethodValue,
  DryerEnergySourceValue,
  SaveDraftPayload,
  SaveDraftTillageLineInput,
} from "@/lib/external/draft-save-validation";

export type DbFertilizerLineRow = {
  fertilizer_id: number | string;
  application_rate_per_ha: number | string;
  total_quantity: number | string;
};

export type DbTillageLineRow = {
  tillage_tool_id: number | string;
  passes: number | string;
};

const HARVEST_MAIN_METHOD_VALUES = new Set<HarvestMainMethodValue>([
  "directa",
  "corte_hilerado",
]);

const DRYER_ENERGY_VALUES = new Set<DryerEnergySourceValue>([
  "gas",
  "gasoil",
  "electricidad",
]);

export function parseHarvestMainMethod(raw: unknown): HarvestMainMethodValue {
  const s = raw == null ? "" : String(raw);
  return HARVEST_MAIN_METHOD_VALUES.has(s as HarvestMainMethodValue)
    ? (s as HarvestMainMethodValue)
    : "directa";
}

export function parseDryerEnergySource(
  raw: unknown,
): DryerEnergySourceValue | null {
  if (raw == null || raw === "") return null;
  const s = String(raw);
  return DRYER_ENERGY_VALUES.has(s as DryerEnergySourceValue)
    ? (s as DryerEnergySourceValue)
    : null;
}

/** Maps a DB `crop_season_submissions` row + fertilizer/tillage lines to `SaveDraftPayload`. */
export function mapDbSubmissionToSavePayload(
  row: Record<string, unknown>,
  lineRows: DbFertilizerLineRow[],
  tillageRows: DbTillageLineRow[] = [],
): SaveDraftPayload {
  const fertilizerLines = lineRows.map((l) => ({
    fertilizer_id: Number(l.fertilizer_id),
    application_rate_per_ha: Number(l.application_rate_per_ha),
    total_quantity:
      l.total_quantity == null || l.total_quantity === ""
        ? undefined
        : Number(l.total_quantity),
  }));

  const tillageLines: SaveDraftTillageLineInput[] = tillageRows.map(
    (l) => ({
      tillage_tool_id: Number(l.tillage_tool_id),
      passes: Number(l.passes),
    }),
  );

  return {
    area_cultivated_ha:
      row.area_cultivated_ha == null || row.area_cultivated_ha === ""
        ? null
        : Number(row.area_cultivated_ha),
    gross_yield_kg_ha:
      row.gross_yield_kg_ha == null ? null : Number(row.gross_yield_kg_ha),
    clean_yield_kg_ha:
      row.clean_yield_kg_ha == null ? null : Number(row.clean_yield_kg_ha),
    fallow_used: Boolean(row.fallow_used),
    fallow_spray_passes:
      row.fallow_spray_passes == null
        ? null
        : Number(row.fallow_spray_passes),
    tillage_used: Boolean(row.tillage_used),
    tillageLines,
    seeding_rate_kg_ha:
      row.seeding_rate_kg_ha == null ? null : Number(row.seeding_rate_kg_ha),
    inoculant_used: Boolean(row.inoculant_used),
    seed_treatment_used: Boolean(row.seed_treatment_used),
    fertilizers_used: Boolean(row.fertilizers_used),
    post_emergence_herbicide_passes: Number(
      row.post_emergence_herbicide_passes ?? 0,
    ),
    fungicide_passes: Number(row.fungicide_passes ?? 0),
    insecticide_passes: Number(row.insecticide_passes ?? 0),
    harvest_main_method: parseHarvestMainMethod(row.harvest_main_method),
    conditioning_used: Boolean(row.conditioning_used),
    drying_used: Boolean(row.drying_used),
    drying_main_method: parseDryerEnergySource(row.drying_main_method),
    transport_used: Boolean(row.transport_used),
    transport_total_km:
      row.transport_total_km == null ? null : Number(row.transport_total_km),
    fertilizerLines,
  };
}

/** Default field values for a questionnaire before a DB row exists (`/e/[token]/new`). */
export function emptyNewDraftSubmissionPayload(): SaveDraftPayload {
  return {
    area_cultivated_ha: null,
    gross_yield_kg_ha: null,
    clean_yield_kg_ha: null,
    fallow_used: false,
    fallow_spray_passes: null,
    tillage_used: false,
    tillageLines: [],
    seeding_rate_kg_ha: null,
    inoculant_used: false,
    seed_treatment_used: false,
    fertilizers_used: false,
    post_emergence_herbicide_passes: 0,
    fungicide_passes: 0,
    insecticide_passes: 0,
    harvest_main_method: "directa",
    conditioning_used: false,
    drying_used: false,
    drying_main_method: null,
    transport_used: false,
    transport_total_km: null,
    fertilizerLines: [],
  };
}
