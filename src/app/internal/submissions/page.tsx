import Link from "next/link";
import { cleanSeedMassKg } from "@/lib/calculations/footprint/compute-lines";
import { createServerSupabase } from "@/lib/supabase/server";
import { AssumptionsNav } from "@/app/internal/assumptions/_components/assumptions-nav";
import { RunCalculationForm } from "@/app/internal/footprint/[submissionId]/run-calculation-form";

export const dynamic = "force-dynamic";

/** Miles con «.» y decimales con «,» (es-AR). */
function formatEsAr(
  value: number | null | undefined,
  maxFractionDigits = 4,
): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  });
}

function seasonLabel(st: string) {
  return st === "primavera" ? "Primavera" : st === "otono" ? "Otoño" : st;
}

function statusLabel(s: string) {
  return s === "draft" ? "Borrador" : s === "submitted" ? "Enviado" : s;
}

type SubmissionRow = {
  id: string;
  company_name: string;
  crop_label: string;
  season_type: string;
  season_year: number;
  status: string;
  submitted_at: string | null;
  area_cultivated_ha: number | null;
  seed_produced_kg: number | null;
  clean_yield_kg_ha: number | null;
};

type RunSummary = {
  status: string;
  total_kg_co2e: number | null;
};

export default async function InternalSubmissionsPage() {
  const supabase = createServerSupabase();

  const { data: submissions, error: subErr } = await supabase
    .from("crop_season_submissions_v")
    .select(
      "id, company_name, crop_label, season_type, season_year, status, submitted_at, area_cultivated_ha, seed_produced_kg, clean_yield_kg_ha",
    )
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (subErr) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-red-600 dark:text-red-400">
          Error al cargar las submissions: {subErr.message}
        </p>
      </div>
    );
  }

  const rows = (submissions ?? []) as SubmissionRow[];
  const ids = rows.map((r) => r.id);

  const runsBySubmission = new Map<string, RunSummary>();
  if (ids.length > 0) {
    const { data: runs } = await supabase
      .from("calculation_run")
      .select("submission_id, status, total_kg_co2e, created_at")
      .in("submission_id", ids)
      .order("created_at", { ascending: false });

    for (const run of runs ?? []) {
      const sid = run.submission_id as string;
      if (!runsBySubmission.has(sid)) {
        runsBySubmission.set(sid, {
          status: run.status as string,
          total_kg_co2e:
            run.total_kg_co2e == null ? null : Number(run.total_kg_co2e),
        });
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
        Interno — sin protección de acceso
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Submissions
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Todas las respuestas de empresas (empresa + cultivo + campaña). Calculá la huella
        directo desde acá o entrá al detalle para ver el desglose por categoría.
      </p>

      <div className="mt-6">
        <AssumptionsNav current="submissions" />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
        <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900">
              <th className="px-3 py-2 font-medium">Empresa</th>
              <th className="px-3 py-2 font-medium">Cultivo</th>
              <th className="px-3 py-2 font-medium">Campaña</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium">Total kg CO₂e</th>
              <th className="px-3 py-2 font-medium">
                Intensidad (kg CO₂e / kg semilla limpia)
              </th>
              <th className="px-3 py-2 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const run = runsBySubmission.get(row.id);
              const failed = run?.status === "failed";
              const complete = run?.status === "complete";

              const areaHa =
                row.area_cultivated_ha == null
                  ? NaN
                  : Number(row.area_cultivated_ha);
              const cleanMassKg =
                Number.isFinite(areaHa) && areaHa > 0
                  ? cleanSeedMassKg(
                      row.seed_produced_kg == null
                        ? null
                        : Number(row.seed_produced_kg),
                      areaHa,
                      row.clean_yield_kg_ha == null
                        ? null
                        : Number(row.clean_yield_kg_ha),
                    )
                  : null;

              const intensity =
                complete &&
                run?.total_kg_co2e != null &&
                cleanMassKg != null &&
                cleanMassKg > 0
                  ? run.total_kg_co2e / cleanMassKg
                  : null;

              return (
                <tr
                  key={row.id}
                  className="border-b border-neutral-100 dark:border-neutral-800"
                >
                  <td className="px-3 py-2">{row.company_name}</td>
                  <td className="px-3 py-2">{row.crop_label}</td>
                  <td className="px-3 py-2">
                    {seasonLabel(row.season_type)} {row.season_year}
                  </td>
                  <td className="px-3 py-2">{statusLabel(row.status)}</td>
                  <td className="px-3 py-2">
                    {failed ? (
                      <span className="text-red-600 dark:text-red-400">
                        Error
                      </span>
                    ) : (
                      formatEsAr(run?.total_kg_co2e ?? null, 6)
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {failed ? (
                      <span className="text-red-600 dark:text-red-400">
                        Error
                      </span>
                    ) : (
                      formatEsAr(intensity, 6)
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <RunCalculationForm
                        submissionId={row.id}
                        canRun={row.status === "submitted"}
                      />
                      <Link
                        href={`/internal/footprint/${row.id}`}
                        className="text-palette-brand underline-offset-2 hover:underline"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          Todavía no hay submissions.
        </p>
      ) : null}
    </div>
  );
}
