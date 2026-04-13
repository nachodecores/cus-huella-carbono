"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getDefaultAssumptionSet } from "@/app/internal/assumptions/_lib/default-assumption-set";
import { parseNonNegNumeric } from "@/app/internal/assumptions/_lib/parse-nonneg-numeric";

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function saveGlobals(formData: FormData) {
  const set = await getDefaultAssumptionSet();
  if (!set.ok) {
    redirectWithError("/internal/assumptions/globals", set.message);
  }

  const supabase = createServerSupabase();
  const { data: rows, error: listErr } = await supabase
    .from("assumption_set_global")
    .select("param_key")
    .eq("assumption_set_id", set.id);

  if (listErr) {
    redirectWithError("/internal/assumptions/globals", listErr.message);
  }

  const updates: { param_key: string; value: number }[] = [];
  for (const row of rows ?? []) {
    const key = row.param_key as string;
    const raw = formData.get(`v_${key}`);
    const n = parseNonNegNumeric(raw);
    if (n === null) {
      redirectWithError(
        "/internal/assumptions/globals",
        `Valor no válido para «${key}»: use un número finito ≥ 0.`,
      );
    }
    updates.push({ param_key: key, value: n });
  }

  for (const u of updates) {
    const { error } = await supabase
      .from("assumption_set_global")
      .update({ value_numeric: u.value })
      .eq("assumption_set_id", set.id)
      .eq("param_key", u.param_key);
    if (error) {
      redirectWithError("/internal/assumptions/globals", error.message);
    }
  }

  revalidatePath("/internal/assumptions");
  revalidatePath("/internal/assumptions/globals");
  redirect("/internal/assumptions/globals?saved=1");
}

type FertilizerUnit = "kg_ha" | "l_ha";

export async function saveFertilizerFactors(formData: FormData) {
  const set = await getDefaultAssumptionSet();
  if (!set.ok) {
    redirectWithError("/internal/assumptions/fertilizers", set.message);
  }

  const supabase = createServerSupabase();
  const { data: rows, error: listErr } = await supabase
    .from("assumption_fertilizer_factor")
    .select("fertilizer_id, fertilizers ( application_unit )")
    .eq("assumption_set_id", set.id);

  if (listErr) {
    redirectWithError("/internal/assumptions/fertilizers", listErr.message);
  }

  for (const row of rows ?? []) {
    const fertilizerId = Number(row.fertilizer_id);
    const rawRel = row.fertilizers as unknown;
    const rel = Array.isArray(rawRel) ? rawRel[0] : rawRel;
    const unit = (rel as { application_unit?: string } | null)?.application_unit;
    const appUnit: FertilizerUnit =
      unit === "l_ha" ? "l_ha" : "kg_ha";

    const raw = formData.get(`v_${fertilizerId}`);
    const n = parseNonNegNumeric(raw);
    if (n === null) {
      redirectWithError(
        "/internal/assumptions/fertilizers",
        `Valor no válido para fertilizante id ${fertilizerId}: use un número finito ≥ 0.`,
      );
    }

    const payload =
      appUnit === "kg_ha"
        ? {
            kg_co2e_per_kg_product: n,
            kg_co2e_per_l_product: null as number | null,
          }
        : {
            kg_co2e_per_kg_product: null as number | null,
            kg_co2e_per_l_product: n,
          };

    const { error } = await supabase
      .from("assumption_fertilizer_factor")
      .update(payload)
      .eq("assumption_set_id", set.id)
      .eq("fertilizer_id", fertilizerId);

    if (error) {
      redirectWithError("/internal/assumptions/fertilizers", error.message);
    }
  }

  revalidatePath("/internal/assumptions");
  revalidatePath("/internal/assumptions/fertilizers");
  redirect("/internal/assumptions/fertilizers?saved=1");
}

export async function saveTillageFactors(formData: FormData) {
  const set = await getDefaultAssumptionSet();
  if (!set.ok) {
    redirectWithError("/internal/assumptions/tillage", set.message);
  }

  const supabase = createServerSupabase();
  const { data: rows, error: listErr } = await supabase
    .from("assumption_tillage_tool_factor")
    .select("tillage_tool_id")
    .eq("assumption_set_id", set.id);

  if (listErr) {
    redirectWithError("/internal/assumptions/tillage", listErr.message);
  }

  for (const row of rows ?? []) {
    const toolId = Number(row.tillage_tool_id);
    const raw = formData.get(`v_${toolId}`);
    const n = parseNonNegNumeric(raw);
    if (n === null) {
      redirectWithError(
        "/internal/assumptions/tillage",
        `Valor no válido para herramienta id ${toolId}: use un número finito ≥ 0.`,
      );
    }

    const { error } = await supabase
      .from("assumption_tillage_tool_factor")
      .update({ diesel_liters_per_ha_per_pass: n })
      .eq("assumption_set_id", set.id)
      .eq("tillage_tool_id", toolId);

    if (error) {
      redirectWithError("/internal/assumptions/tillage", error.message);
    }
  }

  revalidatePath("/internal/assumptions");
  revalidatePath("/internal/assumptions/tillage");
  redirect("/internal/assumptions/tillage?saved=1");
}
