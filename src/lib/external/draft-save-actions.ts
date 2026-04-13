"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deprecatedSubmissionFieldsNeutral,
  sanitizePayloadByGates,
  validateCompleteForSubmit,
  validateDraftSave,
  type SaveDraftPayload,
} from "@/lib/external/draft-save-validation";
import { submitFinalQuestionnaire } from "@/lib/external/submit-final-actions";
import {
  computeSeedProducedKg,
  computeTotalFertilizerQuantity,
} from "@/lib/external/fertilizer-totals";
import { resolveCompanyByToken } from "@/lib/external/resolve-token";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type { SaveDraftPayload } from "@/lib/external/draft-save-validation";

export type SaveDraftResult = { ok: true } | { error: string };

function computeMainRowFields(
  sanitized: SaveDraftPayload,
  now: string,
): Record<string, unknown> {
  const area = sanitized.area_cultivated_ha;
  const clean = sanitized.clean_yield_kg_ha;
  const seeding = sanitized.seeding_rate_kg_ha;

  const seedProducedKg =
    area != null &&
    clean != null &&
    Number.isFinite(area) &&
    Number.isFinite(clean) &&
    area > 0 &&
    clean > 0
      ? computeSeedProducedKg(area, clean)
      : null;

  const seedUsedKg =
    area != null &&
    seeding != null &&
    Number.isFinite(area) &&
    Number.isFinite(seeding) &&
    area > 0 &&
    seeding > 0
      ? area * seeding
      : null;

  return {
    ...deprecatedSubmissionFieldsNeutral,
    area_cultivated_ha: area,
    seed_produced_kg: seedProducedKg,
    gross_yield_kg_ha: sanitized.gross_yield_kg_ha,
    clean_yield_kg_ha: sanitized.clean_yield_kg_ha,
    fallow_used: sanitized.fallow_used,
    fallow_spray_passes: sanitized.fallow_spray_passes,
    tillage_used: sanitized.tillage_used,
    seeding_rate_kg_ha: sanitized.seeding_rate_kg_ha,
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
    updated_at: now,
  };
}

async function replaceFertilizerLines(
  supabase: SupabaseClient,
  submissionId: string,
  sanitized: SaveDraftPayload,
): Promise<string | null> {
  const { error: delErr } = await supabase
    .from("submission_fertilizer_lines")
    .delete()
    .eq("submission_id", submissionId);

  if (delErr) {
    return delErr.message || "No se pudieron actualizar fertilizantes.";
  }

  if (sanitized.fertilizerLines.length === 0) {
    return null;
  }

  const areaHa = sanitized.area_cultivated_ha;
  if (
    areaHa == null ||
    !Number.isFinite(areaHa) ||
    areaHa <= 0
  ) {
    return "No se pudieron guardar fertilizantes sin una superficie válida.";
  }

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
    return insErr.message || "No se pudieron guardar las líneas de fertilizante.";
  }
  return null;
}

async function replaceTillageLines(
  supabase: SupabaseClient,
  submissionId: string,
  sanitized: SaveDraftPayload,
): Promise<string | null> {
  const { error: delTillErr } = await supabase
    .from("submission_tillage_lines")
    .delete()
    .eq("submission_id", submissionId);

  if (delTillErr) {
    return delTillErr.message || "No se pudieron actualizar líneas de laboreo.";
  }

  if (sanitized.tillageLines.length === 0) {
    return null;
  }

  const tillInserts = sanitized.tillageLines.map((l) => ({
    submission_id: submissionId,
    tillage_tool_id: l.tillage_tool_id,
    passes: l.passes,
  }));
  const { error: tillInsErr } = await supabase
    .from("submission_tillage_lines")
    .insert(tillInserts);

  if (tillInsErr) {
    return tillInsErr.message || "No se pudieron guardar las líneas de laboreo.";
  }
  return null;
}

function validateSection1(
  cropId: number,
  seasonType: string,
  seasonYear: number,
): string | null {
  if (!Number.isInteger(cropId) || cropId < 1) {
    return "Elegí un cultivo.";
  }
  if (seasonType !== "primavera" && seasonType !== "otono") {
    return "Elegí el tipo de temporada.";
  }
  if (
    !Number.isInteger(seasonYear) ||
    seasonYear < 2000 ||
    seasonYear > 2100
  ) {
    return "Indicá un año entre 2000 y 2100.";
  }
  return null;
}

export async function saveDraftQuestionnaire(
  token: string,
  submissionId: string,
  payload: SaveDraftPayload,
): Promise<SaveDraftResult> {
  const company = await resolveCompanyByToken(token);
  if (!company) {
    return { error: "Acceso no válido." };
  }

  const supabase = createServerSupabase();

  const sanitized = sanitizePayloadByGates(payload);

  const validationError = validateDraftSave(sanitized);
  if (validationError) {
    return { error: validationError };
  }

  const { data: existing, error: loadErr } = await supabase
    .from("crop_season_submissions")
    .select("id, status, company_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (loadErr || !existing) {
    return { error: "No se encontró el envío." };
  }
  if (existing.company_id !== company.id) {
    return { error: "No se encontró el envío." };
  }
  if (existing.status !== "draft") {
    return { error: "Este envío ya no es un borrador." };
  }

  const now = new Date().toISOString();

  const { data: updatedRow, error: updErr } = await supabase
    .from("crop_season_submissions")
    .update(computeMainRowFields(sanitized, now))
    .eq("id", submissionId)
    .eq("company_id", company.id)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();

  if (updErr) {
    return { error: updErr.message || "No se pudo guardar el borrador." };
  }
  if (!updatedRow) {
    return {
      error:
        "No se pudo guardar (el envío no está disponible como borrador).",
    };
  }

  const fertErr = await replaceFertilizerLines(
    supabase,
    submissionId,
    sanitized,
  );
  if (fertErr) {
    return { error: fertErr };
  }

  const tillErr = await replaceTillageLines(
    supabase,
    submissionId,
    sanitized,
  );
  if (tillErr) {
    return { error: tillErr };
  }

  const enc = encodeURIComponent(token);
  revalidatePath(`/e/${enc}`);
  revalidatePath(`/e/${enc}/s/${submissionId}/edit`);
  revalidatePath(`/e/${enc}/s/${submissionId}/review`);

  return { ok: true };
}

type CompanyRow = { id: string };

async function persistNewDraftSubmission(
  supabase: SupabaseClient,
  company: CompanyRow,
  cropId: number,
  seasonType: "primavera" | "otono",
  seasonYear: number,
  sanitized: SaveDraftPayload,
): Promise<{ id: string } | { error: string }> {
  const now = new Date().toISOString();

  const { data: inserted, error: insErr } = await supabase
    .from("crop_season_submissions")
    .insert({
      company_id: company.id,
      crop_id: cropId,
      season_type: seasonType,
      season_year: seasonYear,
      status: "draft",
      submitted_at: null,
      ...computeMainRowFields(sanitized, now),
    })
    .select("id")
    .single();

  if (insErr) {
    if (insErr.code === "23505") {
      return {
        error:
          "Ya existe un envío para ese cultivo, temporada (primavera/otoño) y año. Elegí otra combinación o abrí el borrador existente.",
      };
    }
    return { error: insErr.message || "No se pudo crear el borrador." };
  }

  if (!inserted?.id) {
    return { error: "No se pudo crear el borrador." };
  }

  const newId = String(inserted.id);

  const fertErr = await replaceFertilizerLines(supabase, newId, sanitized);
  if (fertErr) {
    await supabase.from("crop_season_submissions").delete().eq("id", newId);
    return { error: fertErr };
  }

  const tillErr = await replaceTillageLines(supabase, newId, sanitized);
  if (tillErr) {
    await supabase.from("crop_season_submissions").delete().eq("id", newId);
    return { error: tillErr };
  }

  return { id: newId };
}

/**
 * First save from `/e/[token]/new`: validates Section 1 + full draft rules,
 * inserts the submission and child rows, then redirects to edit.
 */
export async function createDraftQuestionnaire(
  token: string,
  cropId: number,
  seasonType: "primavera" | "otono",
  seasonYear: number,
  payload: SaveDraftPayload,
): Promise<{ error: string } | void> {
  const company = await resolveCompanyByToken(token);
  if (!company) {
    return { error: "Acceso no válido." };
  }

  const section1Err = validateSection1(cropId, seasonType, seasonYear);
  if (section1Err) {
    return { error: section1Err };
  }

  const supabase = createServerSupabase();
  const sanitized = sanitizePayloadByGates(payload);
  const validationError = validateDraftSave(sanitized);
  if (validationError) {
    return { error: validationError };
  }

  const persisted = await persistNewDraftSubmission(
    supabase,
    company,
    cropId,
    seasonType,
    seasonYear,
    sanitized,
  );
  if ("error" in persisted) {
    return { error: persisted.error };
  }

  const enc = encodeURIComponent(token);
  revalidatePath(`/e/${enc}`);
  redirect(`/e/${enc}/s/${persisted.id}/edit`);
}

/**
 * From `/e/[token]/new`: validates for final submit, creates draft + child rows,
 * then runs the same final-submit path as `/edit` (redirects to read-only view).
 */
export async function createAndSubmitQuestionnaire(
  token: string,
  cropId: number,
  seasonType: "primavera" | "otono",
  seasonYear: number,
  payload: SaveDraftPayload,
): Promise<{ error: string } | void> {
  const company = await resolveCompanyByToken(token);
  if (!company) {
    return { error: "Acceso no válido." };
  }

  const section1Err = validateSection1(cropId, seasonType, seasonYear);
  if (section1Err) {
    return { error: section1Err };
  }

  const supabase = createServerSupabase();
  const sanitized = sanitizePayloadByGates(payload);
  const validationError = validateCompleteForSubmit(sanitized);
  if (validationError) {
    return { error: validationError };
  }

  const persisted = await persistNewDraftSubmission(
    supabase,
    company,
    cropId,
    seasonType,
    seasonYear,
    sanitized,
  );
  if ("error" in persisted) {
    return { error: persisted.error };
  }

  return submitFinalQuestionnaire(token, persisted.id);
}
