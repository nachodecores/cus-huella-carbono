export type SaveDraftFertilizerLineInput = {
  fertilizer_id: number;
  application_rate_per_ha: number;
  /**
   * Only set when mapping from DB for display; ignored by validation and never
   * trusted from the client on save.
   */
  total_quantity?: number;
};

export type SaveDraftTillageLineInput = {
  tillage_tool_id: number;
  passes: number;
};

/** Section 7 — cosecha (stored as text in DB). */
export type HarvestMainMethodValue = "directa" | "corte_hilerado";

/** Section 7 — energía principal del secador (stored as text in DB). */
export type DryerEnergySourceValue = "gas" | "gasoil" | "electricidad";

export type SaveDraftPayload = {
  area_cultivated_ha: number | null;
  gross_yield_kg_ha: number | null;
  clean_yield_kg_ha: number | null;
  fallow_used: boolean;
  fallow_spray_passes: number | null;
  tillage_used: boolean;
  tillageLines: SaveDraftTillageLineInput[];
  organic_amendment_used: boolean;
  organic_amendment_area_percent: number | null;
  organic_amendment_rate_kg_ha: number | null;
  seeding_rate_kg_ha: number | null;
  inoculant_used: boolean;
  seed_treatment_used: boolean;
  fertilizers_used: boolean;
  post_emergence_herbicide_passes: number;
  fungicide_passes: number;
  insecticide_passes: number;
  harvest_main_method: HarvestMainMethodValue;
  conditioning_used: boolean;
  drying_used: boolean;
  drying_main_method: DryerEnergySourceValue | null;
  transport_used: boolean;
  transport_total_km: number | null;
  fertilizerLines: SaveDraftFertilizerLineInput[];
};

const GATE_KEYS = [
  "fallow_used",
  "tillage_used",
  "organic_amendment_used",
  "fertilizers_used",
  "conditioning_used",
  "drying_used",
  "transport_used",
] as const;

function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

/** Strips display-only fields before persistence checks. */
function linesForValidation(
  lines: SaveDraftFertilizerLineInput[],
): SaveDraftFertilizerLineInput[] {
  return lines.map(({ fertilizer_id, application_rate_per_ha }) => ({
    fertilizer_id,
    application_rate_per_ha,
  }));
}

function tillageLinesForValidation(
  lines: SaveDraftTillageLineInput[],
): SaveDraftTillageLineInput[] {
  return lines.map(({ tillage_tool_id, passes }) => ({
    tillage_tool_id,
    passes,
  }));
}

function nonNegativeInt(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

export function validateDraftSave(p: SaveDraftPayload): string | null {
  if (
    p.area_cultivated_ha != null &&
    (!Number.isFinite(p.area_cultivated_ha) || p.area_cultivated_ha <= 0)
  ) {
    return "La superficie (hectáreas totales) debe ser mayor a 0.";
  }

  for (const key of GATE_KEYS) {
    if (!isBoolean(p[key])) {
      return "Respondé sí o no en todas las secciones (puertas obligatorias).";
    }
  }

  if (
    p.harvest_main_method !== "directa" &&
    p.harvest_main_method !== "corte_hilerado"
  ) {
    return "Elegí el método principal de cosecha (directa o corte e hilerado previo).";
  }

  if (p.drying_used) {
    if (
      p.drying_main_method !== "gas" &&
      p.drying_main_method !== "gasoil" &&
      p.drying_main_method !== "electricidad"
    ) {
      return "Si usaste secador, elegí la energía principal (gas, gasoil o electricidad).";
    }
  }

  if (p.transport_used) {
    if (
      p.transport_total_km == null ||
      !Number.isFinite(p.transport_total_km) ||
      p.transport_total_km <= 0
    ) {
      return "Si hubo transporte de semilla, indicá la distancia total en km (mayor a 0).";
    }
  }

  if (p.fertilizers_used) {
    if (
      p.area_cultivated_ha == null ||
      !Number.isFinite(p.area_cultivated_ha) ||
      p.area_cultivated_ha <= 0
    ) {
      return "Para cargar fertilizantes, indicá la superficie (hectáreas totales) mayor a 0.";
    }
  }

  if (p.fallow_used) {
    if (
      p.fallow_spray_passes == null ||
      !Number.isFinite(p.fallow_spray_passes) ||
      p.fallow_spray_passes <= 0
    ) {
      return "Si hubo barbecho químico, indicá un número de pasadas mayor a 0.";
    }
  }

  const tillageLines = tillageLinesForValidation(p.tillageLines);
  if (!p.tillage_used) {
    if (tillageLines.length > 0) {
      return "Si no hubo laboreo, no debe haber operaciones de laboreo.";
    }
  } else {
    if (tillageLines.length < 1) {
      return "Si hubo laboreo, agregá al menos una operación (herramienta y pasadas).";
    }
    for (let i = 0; i < tillageLines.length; i++) {
      const line = tillageLines[i];
      if (!Number.isInteger(line.tillage_tool_id) || line.tillage_tool_id < 1) {
        return `Línea ${i + 1} (laboreo): elegí una herramienta.`;
      }
      if (
        !Number.isFinite(line.passes) ||
        !Number.isInteger(line.passes) ||
        line.passes <= 0
      ) {
        return `Línea ${i + 1} (laboreo): las pasadas deben ser un entero mayor a 0.`;
      }
    }
  }

  if (p.organic_amendment_used) {
    if (
      p.organic_amendment_area_percent == null ||
      !Number.isFinite(p.organic_amendment_area_percent) ||
      p.organic_amendment_area_percent <= 0 ||
      p.organic_amendment_area_percent > 100
    ) {
      return "Si usaste enmienda orgánica, indicá el % de superficie tratada (mayor a 0 y hasta 100).";
    }
    if (
      p.organic_amendment_rate_kg_ha == null ||
      !Number.isFinite(p.organic_amendment_rate_kg_ha) ||
      p.organic_amendment_rate_kg_ha <= 0
    ) {
      return "Si usaste enmienda orgánica, indicá la dosis en kg/ha sobre el área tratada (mayor a 0).";
    }
  }

  const passFields: Array<keyof SaveDraftPayload> = [
    "post_emergence_herbicide_passes",
    "fungicide_passes",
    "insecticide_passes",
  ];
  for (const key of passFields) {
    const n = p[key] as number;
    if (
      !Number.isFinite(n) ||
      !Number.isInteger(n) ||
      n < 0
    ) {
      return "Las aplicaciones de protección del cultivo deben ser números enteros mayores o iguales a 0.";
    }
  }

  const fertLines = linesForValidation(p.fertilizerLines);

  if (!p.fertilizers_used) {
    if (fertLines.length > 0) {
      return "Si no usaste fertilizantes, no debe haber líneas de producto.";
    }
  } else {
    if (fertLines.length < 1) {
      return "Si usaste fertilizantes, agregá al menos una línea con producto y dosis por ha.";
    }
    for (let i = 0; i < fertLines.length; i++) {
      const line = fertLines[i];
      if (!Number.isInteger(line.fertilizer_id) || line.fertilizer_id < 1) {
        return `Línea ${i + 1}: elegí un fertilizante.`;
      }
      if (
        !Number.isFinite(line.application_rate_per_ha) ||
        line.application_rate_per_ha <= 0
      ) {
        return `Línea ${i + 1}: la dosis por hectárea debe ser mayor a 0.`;
      }
    }
  }

  return null;
}

/** Reglas de §1 obligatorias para envío final (borrador puede tener campos vacíos). */
export function validateCompleteForSubmit(p: SaveDraftPayload): string | null {
  const draftErr = validateDraftSave(p);
  if (draftErr) {
    return draftErr;
  }
  if (
    p.area_cultivated_ha == null ||
    !Number.isFinite(p.area_cultivated_ha) ||
    p.area_cultivated_ha <= 0
  ) {
    return "La superficie (hectáreas totales) debe ser mayor a 0.";
  }
  if (
    p.clean_yield_kg_ha == null ||
    !Number.isFinite(p.clean_yield_kg_ha) ||
    p.clean_yield_kg_ha <= 0
  ) {
    return "El rendimiento limpio / acondicionado (kg/ha) es obligatorio y debe ser mayor a 0.";
  }
  if (
    p.seeding_rate_kg_ha == null ||
    !Number.isFinite(p.seeding_rate_kg_ha) ||
    p.seeding_rate_kg_ha <= 0
  ) {
    return "La densidad de siembra (kg/ha) es obligatoria y debe ser mayor a 0.";
  }
  return null;
}

/**
 * Clears section-specific fields when the gate is false so stale UI values are
 * not persisted (save/submit).
 */
export function sanitizePayloadByGates(p: SaveDraftPayload): SaveDraftPayload {
  const out: SaveDraftPayload = {
    ...p,
    fertilizerLines: p.fertilizers_used
      ? linesForValidation(p.fertilizerLines)
      : [],
    tillageLines: p.tillage_used
      ? tillageLinesForValidation(p.tillageLines)
      : [],
    post_emergence_herbicide_passes: nonNegativeInt(
      p.post_emergence_herbicide_passes,
    ),
    fungicide_passes: nonNegativeInt(p.fungicide_passes),
    insecticide_passes: nonNegativeInt(p.insecticide_passes),
  };

  if (!out.fallow_used) {
    out.fallow_spray_passes = null;
  }
  if (!out.organic_amendment_used) {
    out.organic_amendment_area_percent = null;
    out.organic_amendment_rate_kg_ha = null;
  }

  if (!out.drying_used) {
    out.drying_main_method = null;
  }
  if (!out.transport_used) {
    out.transport_total_km = null;
  }

  return out;
}

/** Legacy columns cleared on each save/submit. */
export const deprecatedSubmissionFieldsNeutral = {
  diesel_field_used: false,
  electricity_used: false,
  diesel_field_liters: null as null,
  electricity_kwh_attributed: null as null,
  fallow_diesel_liters: null as null,
  tillage_passes: null as null,
  tillage_diesel_liters: null as null,
  organic_amendment_quantity: null as null,
  organic_amendment_unit: null as null,
  crop_protection_used: false,
  crop_protection_spray_passes: null as null,
  crop_protection_diesel_liters: null as null,
  post_emergence_herbicide_used: false,
  fungicide_used: false,
  insecticide_used: false,
} as const;
