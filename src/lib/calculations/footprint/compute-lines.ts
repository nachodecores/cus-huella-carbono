import { GLOBAL_PARAM_KEYS } from "@/lib/calculations/footprint/global-param-keys";
import type { AssumptionContext, ComputedLineItem } from "@/lib/calculations/footprint/types";
import type {
  DryerEnergySourceValue,
  HarvestMainMethodValue,
} from "@/lib/external/draft-save-validation";

function g(ctx: AssumptionContext, key: string): number {
  return ctx.globals.get(key) ?? 0;
}

/**
 * Transport MVP rule: assumed mass = `seed_produced_kg` only (no fallback).
 * If missing or non-positive, transport line is skipped.
 */
export function transportAssumedMassKg(
  seedProducedKg: number | null,
): number | null {
  if (
    seedProducedKg != null &&
    Number.isFinite(seedProducedKg) &&
    seedProducedKg > 0
  ) {
    return seedProducedKg;
  }
  return null;
}

/**
 * Mass of clean seed for per-kg intensity lines (harvest, drying, etc.):
 * prefers `seed_produced_kg`, else area × clean yield when both known.
 */
export function cleanSeedMassKg(
  seedProducedKg: number | null,
  areaHa: number,
  cleanYieldKgHa: number | null,
): number | null {
  const fromSeed = transportAssumedMassKg(seedProducedKg);
  if (fromSeed != null) return fromSeed;
  if (
    cleanYieldKgHa != null &&
    Number.isFinite(cleanYieldKgHa) &&
    cleanYieldKgHa > 0 &&
    Number.isFinite(areaHa) &&
    areaHa > 0
  ) {
    return areaHa * cleanYieldKgHa;
  }
  return null;
}

/** Snapshot of submission fields needed for footprint (from `crop_season_submissions`). */
export type SubmissionRow = {
  area_cultivated_ha: number | null;
  seed_produced_kg: number | null;
  clean_yield_kg_ha: number | null;
  fallow_used: boolean;
  fallow_spray_passes: number | null;
  tillage_used: boolean;
  fertilizers_used: boolean;
  post_emergence_herbicide_passes: number;
  fungicide_passes: number;
  insecticide_passes: number;
  inoculant_used: boolean;
  seed_treatment_used: boolean;
  harvest_main_method: string;
  conditioning_used: boolean;
  drying_used: boolean;
  drying_main_method: string | null;
  transport_used: boolean;
  transport_total_km: number | null;
};

type FertilizerLineInput = {
  id: string;
  fertilizer_id: number;
  total_quantity: number;
  fertilizer_label: string;
  application_unit: "kg_ha" | "l_ha";
};

type TillageLineInput = {
  id: string;
  tillage_tool_id: number;
  passes: number;
  tool_label: string;
};

export type ComputeInput = {
  submission: SubmissionRow;
  fertilizerLines: FertilizerLineInput[];
  tillageLines: TillageLineInput[];
  assumption: AssumptionContext;
};

export function computeFootprintLines(input: ComputeInput): {
  lines: ComputedLineItem[];
  total_kg_co2e: number;
} {
  const { submission: s, assumption: ctx } = input;
  const areaHa = s.area_cultivated_ha == null ? null : Number(s.area_cultivated_ha);
  if (areaHa == null || !Number.isFinite(areaHa) || areaHa <= 0) {
    throw new Error("Superficie (ha) inválida o ausente.");
  }

  const cleanYield = s.clean_yield_kg_ha == null ? null : Number(s.clean_yield_kg_ha);
  const seedProduced =
    s.seed_produced_kg == null ? null : Number(s.seed_produced_kg);
  const cleanMass = cleanSeedMassKg(seedProduced, areaHa, cleanYield);

  const lines: ComputedLineItem[] = [];
  let sort = 1;

  const dieselCo2PerL = g(ctx, GLOBAL_PARAM_KEYS.dieselKgCo2ePerL);

  // --- Fallow ---
  if (s.fallow_used) {
    const passes = Math.max(0, Math.round(Number(s.fallow_spray_passes ?? 0)));
    const ef = g(ctx, GLOBAL_PARAM_KEYS.fallowPassKgCo2ePerHaPerPass);
    const kg = areaHa * passes * ef;
    lines.push({
      category: "fallow",
      sort_order: sort++,
      label: "Barbecho (pasadas pulverización)",
      quantity: passes,
      quantity_unit: "pasadas",
      emission_factor: ef,
      emission_factor_unit: "kg CO₂e / ha / pasada",
      kg_co2e: kg,
      submission_fertilizer_line_id: null,
      submission_tillage_line_id: null,
    });
  }

  // --- Tillage (per line): L diesel × EF ---
  if (s.tillage_used) {
    for (const tl of input.tillageLines) {
      const dieselLPerHaPass = ctx.tillageDieselLPerHaPerPass.get(
        tl.tillage_tool_id,
      );
      const lPerHaPass =
        dieselLPerHaPass == null || !Number.isFinite(dieselLPerHaPass)
          ? 0
          : dieselLPerHaPass;
      const dieselLiters = areaHa * tl.passes * lPerHaPass;
      const kg = dieselLiters * dieselCo2PerL;
      lines.push({
        category: "tillage",
        sort_order: sort++,
        label: `Laboreo: ${tl.tool_label}`,
        quantity: dieselLiters,
        quantity_unit: "L diesel (estimado)",
        emission_factor: dieselCo2PerL,
        emission_factor_unit: "kg CO₂e / L diesel",
        kg_co2e: kg,
        submission_fertilizer_line_id: null,
        submission_tillage_line_id: tl.id,
      });
    }
  }

  // --- Fertilizers ---
  if (s.fertilizers_used) {
    for (const fl of input.fertilizerLines) {
      const fac = ctx.fertilizerFactors.get(fl.fertilizer_id);
      const qty = fl.total_quantity;
      let intensity = 0;
      let efUnit = "";
      if (fl.application_unit === "kg_ha") {
        intensity = fac?.kgPerKg ?? 0;
        efUnit = "kg CO₂e / kg producto";
      } else {
        intensity = fac?.kgPerL ?? 0;
        efUnit = "kg CO₂e / L producto";
      }
      const kg = qty * intensity;
      lines.push({
        category: "fertilizer",
        sort_order: sort++,
        label: `Fertilizante: ${fl.fertilizer_label}`,
        quantity: qty,
        quantity_unit: fl.application_unit === "kg_ha" ? "kg" : "L",
        emission_factor: intensity,
        emission_factor_unit: efUnit,
        kg_co2e: kg,
        submission_fertilizer_line_id: fl.id,
        submission_tillage_line_id: null,
      });
    }
  }

  // --- Crop protection (aggregated) ---
  const hPasses = Math.max(0, Math.round(s.post_emergence_herbicide_passes));
  const fPasses = Math.max(0, Math.round(s.fungicide_passes));
  const iPasses = Math.max(0, Math.round(s.insecticide_passes));
  const efH = g(ctx, GLOBAL_PARAM_KEYS.herbicidePassKgCo2ePerHaPerPass);
  const efF = g(ctx, GLOBAL_PARAM_KEYS.fungicidePassKgCo2ePerHaPerPass);
  const efI = g(ctx, GLOBAL_PARAM_KEYS.insecticidePassKgCo2ePerHaPerPass);
  const kgProt =
    areaHa * (hPasses * efH + fPasses * efF + iPasses * efI);
  lines.push({
    category: "crop_protection",
    sort_order: sort++,
    label: "Protección del cultivo (pasadas)",
    quantity: hPasses + fPasses + iPasses,
    quantity_unit: "pasadas (suma)",
    emission_factor: null,
    emission_factor_unit: "kg CO₂e / ha / pasada (por tipo)",
    kg_co2e: kgProt,
    submission_fertilizer_line_id: null,
    submission_tillage_line_id: null,
  });

  // --- Seed inputs ---
  if (cleanMass != null && cleanMass > 0) {
    if (s.inoculant_used) {
      const ef = g(ctx, GLOBAL_PARAM_KEYS.inoculantKgCo2ePerKgCleanSeedIfUsed);
      const kg = cleanMass * ef;
      lines.push({
        category: "seed_inputs",
        sort_order: sort++,
        label: "Inoculante",
        quantity: cleanMass,
        quantity_unit: "kg semilla limpia",
        emission_factor: ef,
        emission_factor_unit: "kg CO₂e / kg semilla limpia",
        kg_co2e: kg,
        submission_fertilizer_line_id: null,
        submission_tillage_line_id: null,
      });
    }
    if (s.seed_treatment_used) {
      const ef = g(
        ctx,
        GLOBAL_PARAM_KEYS.seedTreatmentKgCo2ePerKgCleanSeedIfUsed,
      );
      const kg = cleanMass * ef;
      lines.push({
        category: "seed_inputs",
        sort_order: sort++,
        label: "Tratamiento de semilla",
        quantity: cleanMass,
        quantity_unit: "kg semilla limpia",
        emission_factor: ef,
        emission_factor_unit: "kg CO₂e / kg semilla limpia",
        kg_co2e: kg,
        submission_fertilizer_line_id: null,
        submission_tillage_line_id: null,
      });
    }
  }

  // --- Harvest ---
  if (cleanMass != null && cleanMass > 0) {
    const method = s.harvest_main_method as HarvestMainMethodValue;
    const ef =
      method === "corte_hilerado"
        ? g(ctx, GLOBAL_PARAM_KEYS.harvestCorteHileradoKgCo2ePerKgCleanSeed)
        : g(ctx, GLOBAL_PARAM_KEYS.harvestDirectaKgCo2ePerKgCleanSeed);
    const kg = cleanMass * ef;
    lines.push({
      category: "harvest",
      sort_order: sort++,
      label: `Cosecha (${method})`,
      quantity: cleanMass,
      quantity_unit: "kg semilla limpia",
      emission_factor: ef,
      emission_factor_unit: "kg CO₂e / kg semilla limpia",
      kg_co2e: kg,
      submission_fertilizer_line_id: null,
      submission_tillage_line_id: null,
    });
  }

  // --- Drying ---
  if (s.drying_used && cleanMass != null && cleanMass > 0) {
    const m = s.drying_main_method as DryerEnergySourceValue | null;
    let key: string = GLOBAL_PARAM_KEYS.dryingGasKgCo2ePerKgCleanSeed;
    if (m === "gasoil") {
      key = GLOBAL_PARAM_KEYS.dryingGasoilKgCo2ePerKgCleanSeed;
    } else if (m === "electricidad") {
      key = GLOBAL_PARAM_KEYS.dryingElectricidadKgCo2ePerKgCleanSeed;
    }
    const ef = g(ctx, key);
    const kg = cleanMass * ef;
    lines.push({
      category: "drying",
      sort_order: sort++,
      label: `Secado (${m ?? "—"})`,
      quantity: cleanMass,
      quantity_unit: "kg semilla limpia",
      emission_factor: ef,
      emission_factor_unit: "kg CO₂e / kg semilla limpia",
      kg_co2e: kg,
      submission_fertilizer_line_id: null,
      submission_tillage_line_id: null,
    });
  }

  // --- Conditioning ---
  if (s.conditioning_used && cleanMass != null && cleanMass > 0) {
    const ef = g(
      ctx,
      GLOBAL_PARAM_KEYS.conditioningKgCo2ePerKgCleanSeedIfUsed,
    );
    const kg = cleanMass * ef;
    lines.push({
      category: "conditioning",
      sort_order: sort++,
      label: "Acondicionamiento",
      quantity: cleanMass,
      quantity_unit: "kg semilla limpia",
      emission_factor: ef,
      emission_factor_unit: "kg CO₂e / kg semilla limpia",
      kg_co2e: kg,
      submission_fertilizer_line_id: null,
      submission_tillage_line_id: null,
    });
  }

  // --- Transport: tonne-km × EF; mass = seed_produced_kg only ---
  if (s.transport_used) {
    const km = s.transport_total_km == null ? null : Number(s.transport_total_km);
    const massKg = transportAssumedMassKg(seedProduced);
    const ef = g(ctx, GLOBAL_PARAM_KEYS.transportKgCo2ePerTonneKm);
    if (km != null && Number.isFinite(km) && km >= 0 && massKg != null && massKg > 0) {
      const tonnes = massKg / 1000;
      const tonneKm = tonnes * km;
      const kg = tonneKm * ef;
      lines.push({
        category: "transport",
        sort_order: sort++,
        label: "Transporte de semilla",
        quantity: tonneKm,
        quantity_unit: "t·km",
        emission_factor: ef,
        emission_factor_unit: "kg CO₂e / t·km",
        kg_co2e: kg,
        submission_fertilizer_line_id: null,
        submission_tillage_line_id: null,
      });
    }
  }

  const total_kg_co2e = lines.reduce((acc, row) => acc + row.kg_co2e, 0);
  return { lines, total_kg_co2e };
}
