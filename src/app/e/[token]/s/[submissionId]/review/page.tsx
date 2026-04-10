import Link from "next/link";
import { redirect } from "next/navigation";
import { InvalidToken } from "@/components/external/invalid-token";
import { ReviewSubmitButton } from "@/components/external/review-submit-button";
import { SubmissionReadonlySummary } from "@/components/external/review-summary-display";
import { mapDbSubmissionToSavePayload } from "@/lib/external/submission-payload-mapper";
import { resolveCompanyByToken } from "@/lib/external/resolve-token";
import { createServerSupabase } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ token: string; submissionId: string }>;
};

function cropLabelFromRow(crops: unknown): { label: string } | null {
  if (crops == null) return null;
  if (Array.isArray(crops)) return crops[0] ?? null;
  if (typeof crops === "object" && "label" in crops) {
    return { label: String((crops as { label: string }).label) };
  }
  return null;
}

export default async function SubmissionReviewPage({ params }: PageProps) {
  const { token, submissionId } = await params;
  const company = await resolveCompanyByToken(token);

  if (!company) {
    return <InvalidToken />;
  }

  const supabase = createServerSupabase();
  const { data: row, error: subError } = await supabase
    .from("crop_season_submissions")
    .select(
      `
      *,
      crops ( label )
    `,
    )
    .eq("id", submissionId)
    .eq("company_id", company.id)
    .maybeSingle();

  if (subError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudo cargar el envío: {subError.message}
        </p>
        <p className="mt-4">
          <Link
            href={`/e/${encodeURIComponent(token)}`}
            className="text-sm text-neutral-600 underline dark:text-neutral-400"
          >
            ← Listado
          </Link>
        </p>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Envío no encontrado
        </h1>
        <p className="mt-4">
          <Link
            href={`/e/${encodeURIComponent(token)}`}
            className="text-sm text-neutral-600 underline dark:text-neutral-400"
          >
            ← Listado
          </Link>
        </p>
      </div>
    );
  }

  if (row.status === "submitted") {
    redirect(`/e/${encodeURIComponent(token)}/s/${submissionId}`);
  }

  const { data: lineRows, error: linesError } = await supabase
    .from("submission_fertilizer_lines")
    .select("fertilizer_id, application_rate_per_ha, total_quantity")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });

  if (linesError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudieron cargar las líneas de fertilizante: {linesError.message}
        </p>
      </div>
    );
  }

  const { data: submissionTillageLines, error: tillageLinesError } =
    await supabase
      .from("submission_tillage_lines")
      .select("tillage_tool_id, passes")
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: true });

  if (tillageLinesError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudieron cargar las líneas de laboreo:{" "}
          {tillageLinesError.message}
        </p>
      </div>
    );
  }

  const { data: fertRows, error: fertError } = await supabase
    .from("fertilizers")
    .select("id, label, application_unit")
    .order("id");

  if (fertError || !fertRows?.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudo cargar el catálogo de fertilizantes.
        </p>
      </div>
    );
  }

  const { data: tillageToolRows, error: tillageToolsError } = await supabase
    .from("tillage_tools")
    .select("id, label")
    .order("id");

  if (tillageToolsError || !tillageToolRows?.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudo cargar el catálogo de laboreo.
        </p>
      </div>
    );
  }

  const payload = mapDbSubmissionToSavePayload(
    row as unknown as Record<string, unknown>,
    lineRows ?? [],
    submissionTillageLines ?? [],
  );

  const fertilizerLabelsById = Object.fromEntries(
    fertRows.map((f) => [f.id, f.label]),
  ) as Record<number, string>;

  const fertilizerApplicationUnitById = Object.fromEntries(
    fertRows.map((f) => [f.id, f.application_unit]),
  ) as Record<number, "kg_ha" | "l_ha">;

  const tillageToolLabelsById = Object.fromEntries(
    tillageToolRows.map((t) => [t.id, t.label]),
  ) as Record<number, string>;

  const crop = cropLabelFromRow(
    (row as unknown as { crops?: unknown }).crops,
  );
  const cropLabel = crop?.label ?? "—";
  const basePath = `/e/${encodeURIComponent(token)}`;

  return (
    <>
      <SubmissionReadonlySummary
        companyName={company.name}
        cropLabel={cropLabel}
        seasonType={row.season_type as "primavera" | "otono"}
        seasonYear={Number(row.season_year)}
        payload={payload}
        fertilizerLabelsById={fertilizerLabelsById}
        fertilizerApplicationUnitById={fertilizerApplicationUnitById}
        tillageToolLabelsById={tillageToolLabelsById}
      />
      <div className="mx-auto max-w-2xl space-y-4 px-4">
        <ReviewSubmitButton token={token} submissionId={submissionId} />
        <p className="flex flex-wrap gap-4 pb-8 text-sm">
          <Link
            href={`${basePath}/s/${submissionId}/edit`}
            className="text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-400"
          >
            ← Volver al cuestionario
          </Link>
          <Link
            href={basePath}
            className="text-neutral-600 dark:text-neutral-400"
          >
            Listado
          </Link>
        </p>
      </div>
    </>
  );
}
