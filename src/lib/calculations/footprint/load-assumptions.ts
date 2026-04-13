import { createServerSupabase } from "@/lib/supabase/server";
import type { AssumptionContext } from "@/lib/calculations/footprint/types";

export type LoadAssumptionsResult =
  | { ok: true; context: AssumptionContext }
  | { ok: false; error: string };

export async function loadDefaultAssumptionContext(): Promise<LoadAssumptionsResult> {
  const supabase = createServerSupabase();

  const { data: setRow, error: setErr } = await supabase
    .from("assumption_set")
    .select("id")
    .eq("is_default", true)
    .maybeSingle();

  if (setErr) {
    return { ok: false, error: setErr.message };
  }
  if (!setRow?.id) {
    return {
      ok: false,
      error: "No hay un conjunto de supuestos por defecto (assumption_set.is_default).",
    };
  }

  const assumptionSetId = setRow.id as string;

  const { data: globalsRows, error: gErr } = await supabase
    .from("assumption_set_global")
    .select("param_key, value_numeric")
    .eq("assumption_set_id", assumptionSetId);

  if (gErr) {
    return { ok: false, error: gErr.message };
  }

  const globals = new Map<string, number>();
  for (const row of globalsRows ?? []) {
    const k = row.param_key as string;
    globals.set(k, Number(row.value_numeric));
  }

  const { data: fertRows, error: fErr } = await supabase
    .from("assumption_fertilizer_factor")
    .select("fertilizer_id, kg_co2e_per_kg_product, kg_co2e_per_l_product")
    .eq("assumption_set_id", assumptionSetId);

  if (fErr) {
    return { ok: false, error: fErr.message };
  }

  const fertilizerFactors = new Map<
    number,
    { kgPerKg: number | null; kgPerL: number | null }
  >();
  for (const row of fertRows ?? []) {
    const id = Number(row.fertilizer_id);
    fertilizerFactors.set(id, {
      kgPerKg:
        row.kg_co2e_per_kg_product == null
          ? null
          : Number(row.kg_co2e_per_kg_product),
      kgPerL:
        row.kg_co2e_per_l_product == null
          ? null
          : Number(row.kg_co2e_per_l_product),
    });
  }

  const { data: tillRows, error: tErr } = await supabase
    .from("assumption_tillage_tool_factor")
    .select("tillage_tool_id, diesel_liters_per_ha_per_pass")
    .eq("assumption_set_id", assumptionSetId);

  if (tErr) {
    return { ok: false, error: tErr.message };
  }

  const tillageDieselLPerHaPerPass = new Map<number, number>();
  for (const row of tillRows ?? []) {
    tillageDieselLPerHaPerPass.set(
      Number(row.tillage_tool_id),
      Number(row.diesel_liters_per_ha_per_pass),
    );
  }

  return {
    ok: true,
    context: {
      assumptionSetId,
      globals,
      fertilizerFactors,
      tillageDieselLPerHaPerPass,
    },
  };
}
