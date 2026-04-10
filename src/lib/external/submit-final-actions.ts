"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deprecatedSubmissionFieldsNeutral,
  sanitizePayloadByGates,
  validateCompleteForSubmit,
} from "@/lib/external/draft-save-validation";
import {
  computeSeedProducedKg,
  computeTotalFertilizerQuantity,
} from "@/lib/external/fertilizer-totals";
import { resolveCompanyByToken } from "@/lib/external/resolve-token";
import { mapDbSubmissionToSavePayload } from "@/lib/external/submission-payload-mapper";
import { createServerSupabase } from "@/lib/supabase/server";

export type SubmitFinalResult = { error: string } | void;

export async function submitFinalQuestionnaire(
  token: string,
  submissionId: string,
): Promise<SubmitFinalResult> {
  const company = await resolveCompanyByToken(token);
  if (!company) {
    return { error: "Acceso no válido." };
  }

  const supabase = createServerSupabase();

  const { data: row, error: rowErr } = await supabase
    .from("crop_season_submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("company_id", company.id)
    .maybeSingle();

  if (rowErr || !row) {
    return { error: "No se encontró el envío." };
  }
  if (row.status !== "draft") {
    return { error: "Este envío ya no es un borrador." };
  }

  const { data: lineRows, error: linesErr } = await supabase
    .from("submission_fertilizer_lines")
    .select("fertilizer_id, application_rate_per_ha, total_quantity")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });

  if (linesErr) {
    return { error: "No se pudieron leer las líneas de fertilizante." };
  }

  const { data: tillageRows, error: tillageErr } = await supabase
    .from("submission_tillage_lines")
    .select("tillage_tool_id, passes")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });

  if (tillageErr) {
    return { error: "No se pudieron leer las líneas de laboreo." };
  }

  const payload = mapDbSubmissionToSavePayload(
    row as unknown as Record<string, unknown>,
    lineRows ?? [],
    tillageRows ?? [],
  );
  const sanitized = sanitizePayloadByGates(payload);

  const validationError = validateCompleteForSubmit(sanitized);
  if (validationError) {
    return { error: validationError };
  }

  const now = new Date().toISOString();

  const areaHa = sanitized.area_cultivated_ha!;
  const cleanYield = sanitized.clean_yield_kg_ha!;
  const seedingRate = sanitized.seeding_rate_kg_ha!;

  const seedProducedKg = computeSeedProducedKg(areaHa, cleanYield);
  const seedUsedKg = areaHa * seedingRate;

  const { data: updatedRow, error: updErr } = await supabase
    .from("crop_season_submissions")
    .update({
      ...deprecatedSubmissionFieldsNeutral,
      area_cultivated_ha: areaHa,
      seed_produced_kg: seedProducedKg,
      gross_yield_kg_ha: sanitized.gross_yield_kg_ha,
      clean_yield_kg_ha: sanitized.clean_yield_kg_ha,
      fallow_used: sanitized.fallow_used,
      fallow_spray_passes: sanitized.fallow_spray_passes,
      tillage_used: sanitized.tillage_used,
      organic_amendment_used: sanitized.organic_amendment_used,
      organic_amendment_area_percent: sanitized.organic_amendment_area_percent,
      organic_amendment_rate_kg_ha: sanitized.organic_amendment_rate_kg_ha,
      seeding_rate_kg_ha: seedingRate,
      seed_used_kg: seedUsedKg,
      inoculant_used: sanitized.inoculant_used,
      seed_treatment_used: sanitized.seed_treatment_used,
      fertilizers_used: sanitized.fertilizers_used,
      post_emergence_herbicide_passes:
        sanitized.post_emergence_herbicide_passes,
      fungicide_passes: sanitized.fungicide_passes,
      insecticide_passes: sanitized.insecticide_passes,
      harvest_main_method: sanitized.harvest_main_method,
      harvest_used: false,
      harvest_diesel_liters: null,
      conditioning_used: sanitized.conditioning_used,
      conditioning_electricity_kwh: null,
      drying_used: sanitized.drying_used,
      drying_main_method: sanitized.drying_main_method,
      drying_diesel_liters: null,
      drying_electricity_kwh: null,
      transport_used: sanitized.transport_used,
      transport_total_km: sanitized.transport_total_km,
      transport_seed_quantity_kg: null,
      transport_mode: null,
      status: "submitted",
      submitted_at: now,
      updated_at: now,
    })
    .eq("id", submissionId)
    .eq("company_id", company.id)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();

  if (updErr) {
    return { error: updErr.message || "No se pudo enviar." };
  }
  if (!updatedRow) {
    return { error: "No se pudo enviar (el borrador ya no está disponible)." };
  }

  const { error: delErr } = await supabase
    .from("submission_fertilizer_lines")
    .delete()
    .eq("submission_id", submissionId);

  if (delErr) {
    return { error: delErr.message || "No se pudieron actualizar fertilizantes." };
  }

  if (sanitized.fertilizerLines.length > 0) {
    const inserts = sanitized.fertilizerLines.map((l) => ({
      submission_id: submissionId,
      fertilizer_id: l.fertilizer_id,
      application_rate_per_ha: l.application_rate_per_ha,
      total_quantity: computeTotalFertilizerQuantity(
        l.application_rate_per_ha,
        areaHa,
      ),
    }));

    const { error: insErr } = await supabase
      .from("submission_fertilizer_lines")
      .insert(inserts);

    if (insErr) {
      return {
        error: insErr.message || "No se pudieron guardar las líneas de fertilizante.",
      };
    }
  }

  const { error: delTillErr } = await supabase
    .from("submission_tillage_lines")
    .delete()
    .eq("submission_id", submissionId);

  if (delTillErr) {
    return {
      error:
        delTillErr.message || "No se pudieron actualizar líneas de laboreo.",
    };
  }

  if (sanitized.tillageLines.length > 0) {
    const tillInserts = sanitized.tillageLines.map((l) => ({
      submission_id: submissionId,
      tillage_tool_id: l.tillage_tool_id,
      passes: l.passes,
    }));
    const { error: tillInsErr } = await supabase
      .from("submission_tillage_lines")
      .insert(tillInserts);

    if (tillInsErr) {
      return {
        error:
          tillInsErr.message || "No se pudieron guardar las líneas de laboreo.",
      };
    }
  }

  const enc = encodeURIComponent(token);
  revalidatePath(`/e/${enc}`);
  revalidatePath(`/e/${enc}/s/${submissionId}/edit`);
  revalidatePath(`/e/${enc}/s/${submissionId}/review`);
  revalidatePath(`/e/${enc}/s/${submissionId}`);

  redirect(`/e/${enc}/s/${submissionId}`);
}
