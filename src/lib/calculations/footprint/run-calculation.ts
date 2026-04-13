import { computeFootprintLines } from "@/lib/calculations/footprint/compute-lines";
import { loadDefaultAssumptionContext } from "@/lib/calculations/footprint/load-assumptions";
import { mapRowToSubmissionFootprintInput } from "@/lib/calculations/footprint/map-submission-row";
import { createServerSupabase } from "@/lib/supabase/server";

export type RunFootprintResult =
  | { ok: true; calculationRunId: string }
  | { ok: false; error: string };

/**
 * Loads a submitted questionnaire, default assumptions, computes kg CO₂e,
 * persists `calculation_run` + `calculation_line_item` rows.
 * Idempotent per call: creates a **new** run each time (history-friendly).
 */
export async function calculateAndPersistSubmissionFootprint(
  submissionId: string,
): Promise<RunFootprintResult> {
  const supabase = createServerSupabase();

  const { data: sub, error: subErr } = await supabase
    .from("crop_season_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (subErr) {
    return { ok: false, error: subErr.message };
  }
  if (!sub) {
    return { ok: false, error: "Envío no encontrado." };
  }
  if (sub.status !== "submitted") {
    return {
      ok: false,
      error: "Solo se puede calcular para envíos en estado enviado (submitted).",
    };
  }

  const assumptionLoad = await loadDefaultAssumptionContext();
  if (!assumptionLoad.ok) {
    return { ok: false, error: assumptionLoad.error };
  }
  const assumption = assumptionLoad.context;

  const { data: fertLines, error: flErr } = await supabase
    .from("submission_fertilizer_lines")
    .select(
      `
      id,
      fertilizer_id,
      total_quantity,
      fertilizers ( label, application_unit )
    `,
    )
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });

  if (flErr) {
    return { ok: false, error: flErr.message };
  }

  const { data: tillLines, error: tlErr } = await supabase
    .from("submission_tillage_lines")
    .select(
      `
      id,
      tillage_tool_id,
      passes,
      tillage_tools ( label )
    `,
    )
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });

  if (tlErr) {
    return { ok: false, error: tlErr.message };
  }

  const fertilizerLines =
    fertLines?.map((row) => {
      const raw = row.fertilizers as unknown;
      const fert = Array.isArray(raw) ? raw[0] : raw;
      const f = fert as { label?: string; application_unit?: string } | null;
      const unit: "kg_ha" | "l_ha" =
        f?.application_unit === "l_ha" ? "l_ha" : "kg_ha";
      return {
        id: row.id as string,
        fertilizer_id: Number(row.fertilizer_id),
        total_quantity: Number(row.total_quantity),
        fertilizer_label: f?.label ?? `Fertilizante ${row.fertilizer_id}`,
        application_unit: unit,
      };
    }) ?? [];

  const tillageLines =
    tillLines?.map((row) => {
      const raw = row.tillage_tools as unknown;
      const tool = Array.isArray(raw) ? raw[0] : raw;
      const t = tool as { label?: string } | null;
      return {
        id: row.id as string,
        tillage_tool_id: Number(row.tillage_tool_id),
        passes: Number(row.passes),
        tool_label: t?.label ?? `Herramienta ${row.tillage_tool_id}`,
      };
    }) ?? [];

  const submission = mapRowToSubmissionFootprintInput(
    sub as unknown as Record<string, unknown>,
  );

  try {
    const { lines, total_kg_co2e } = computeFootprintLines({
      submission,
      fertilizerLines,
      tillageLines,
      assumption,
    });

    const { data: runRow, error: runErr } = await supabase
      .from("calculation_run")
      .insert({
        submission_id: submissionId,
        assumption_set_id: assumption.assumptionSetId,
        status: "complete",
        total_kg_co2e,
        error_message: null,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (runErr || !runRow?.id) {
      return {
        ok: false,
        error: runErr?.message ?? "No se pudo crear calculation_run.",
      };
    }

    const runId = runRow.id as string;

    const inserts = lines.map((line) => ({
      calculation_run_id: runId,
      category: line.category,
      sort_order: line.sort_order,
      label: line.label,
      quantity: line.quantity,
      quantity_unit: line.quantity_unit,
      emission_factor: line.emission_factor,
      emission_factor_unit: line.emission_factor_unit,
      kg_co2e: line.kg_co2e,
      submission_fertilizer_line_id: line.submission_fertilizer_line_id,
      submission_tillage_line_id: line.submission_tillage_line_id,
    }));

    const { error: liErr } = await supabase
      .from("calculation_line_item")
      .insert(inserts);

    if (liErr) {
      await supabase.from("calculation_run").delete().eq("id", runId);
      return { ok: false, error: liErr.message };
    }

    return { ok: true, calculationRunId: runId };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al calcular la huella.";
    await supabase.from("calculation_run").insert({
      submission_id: submissionId,
      assumption_set_id: assumption.assumptionSetId,
      status: "failed",
      total_kg_co2e: null,
      error_message: message,
      completed_at: new Date().toISOString(),
    });
    return { ok: false, error: message };
  }
}
