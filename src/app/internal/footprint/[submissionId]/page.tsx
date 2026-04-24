import Link from "next/link";
import { cleanSeedMassKg } from "@/lib/calculations/footprint/compute-lines";
import { createServerSupabase } from "@/lib/supabase/server";
import { RunCalculationForm } from "./run-calculation-form";

type PageProps = {
  params: Promise<{ submissionId: string }>;
};

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

function unwrapSingle<T extends { label?: string; name?: string }>(
  rel: unknown,
): T | null {
  if (rel == null) return null;
  if (Array.isArray(rel)) return (rel[0] as T) ?? null;
  if (typeof rel === "object") return rel as T;
  return null;
}

export default async function InternalFootprintPage({ params }: PageProps) {
  const { submissionId } = await params;
  const supabase = createServerSupabase();

  const { data: submission, error: subErr } = await supabase
    .from("crop_season_submissions")
    .select(
      `
      id,
      status,
      submitted_at,
      season_type,
      season_year,
      area_cultivated_ha,
      seed_produced_kg,
      clean_yield_kg_ha,
      company_id,
      crop_id,
      companies ( name ),
      crops ( label )
    `,
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (subErr) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-red-600 dark:text-red-400">
          Error al cargar el envío: {subErr.message}
        </p>
        <p className="mt-4">
          <Link
            href="/"
            className="text-sm text-neutral-600 underline dark:text-neutral-400"
          >
            ← Inicio
          </Link>
        </p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Envío no encontrado
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Comprueba el UUID en la URL.
        </p>
        <p className="mt-4">
          <Link
            href="/"
            className="text-sm text-neutral-600 underline dark:text-neutral-400"
          >
            ← Inicio
          </Link>
        </p>
      </div>
    );
  }

  const company = unwrapSingle<{ name?: string }>(submission.companies);
  const crop = unwrapSingle<{ label?: string }>(submission.crops);

  const { data: runRow } = await supabase
    .from("calculation_run")
    .select(
      `
      id,
      status,
      total_kg_co2e,
      error_message,
      created_at,
      completed_at,
      assumption_set_id,
      assumption_set ( id, label )
    `,
    )
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const assumption = unwrapSingle<{ id: string; label: string }>(
    runRow?.assumption_set,
  );

  const runId = runRow?.id as string | undefined;
  const { data: lineItems } = runId
    ? await supabase
        .from("calculation_line_item")
        .select(
          "id, sort_order, label, quantity, quantity_unit, emission_factor, emission_factor_unit, kg_co2e",
        )
        .eq("calculation_run_id", runId)
        .order("sort_order", { ascending: true })
    : { data: null };

  const canRun = submission.status === "submitted";

  const areaHaNum =
    submission.area_cultivated_ha == null
      ? NaN
      : Number(submission.area_cultivated_ha);
  const seedKg =
    submission.seed_produced_kg == null
      ? null
      : Number(submission.seed_produced_kg);
  const cleanYieldNum =
    submission.clean_yield_kg_ha == null
      ? null
      : Number(submission.clean_yield_kg_ha);

  const cleanMassKg =
    Number.isFinite(areaHaNum) && areaHaNum > 0
      ? cleanSeedMassKg(seedKg, areaHaNum, cleanYieldNum)
      : null;

  const totalKgCo2e =
    runRow?.total_kg_co2e == null ? null : Number(runRow.total_kg_co2e);
  const intensityPerKgCleanSeed =
    runRow?.status === "complete" &&
    totalKgCo2e != null &&
    Number.isFinite(totalKgCo2e) &&
    cleanMassKg != null &&
    cleanMassKg > 0
      ? totalKgCo2e / cleanMassKg
      : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
        Interno — sin protección de acceso
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Huella del envío
      </h1>
      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
        <Link
          href="/internal/modelo-huella"
          className="text-palette-brand underline-offset-2 hover:underline"
        >
          Ver modelo de cálculo (orden y fórmulas)
        </Link>
      </p>

      <section className="mt-8 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
        <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Contexto del envío
        </h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">ID</dt>
            <dd className="font-mono text-xs break-all">{submission.id}</dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">Estado</dt>
            <dd>{submission.status}</dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">Empresa</dt>
            <dd>{company?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">Especie</dt>
            <dd>{crop?.label ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">Campaña</dt>
            <dd>
              {String(submission.season_type)} {submission.season_year}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">
              Enviado el
            </dt>
            <dd>
              {submission.submitted_at
                ? new Date(submission.submitted_at).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">
              Superficie (ha)
            </dt>
            <dd>
              {submission.area_cultivated_ha != null
                ? formatEsAr(Number(submission.area_cultivated_ha), 4)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">
              Semilla producida (kg)
            </dt>
            <dd>
              {submission.seed_produced_kg != null
                ? formatEsAr(Number(submission.seed_produced_kg), 4)
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
        <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Última ejecución de cálculo
        </h2>
        {!runRow ? (
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Aún no hay ningún <code className="font-mono text-xs">calculation_run</code>{" "}
            para este envío.
          </p>
        ) : (
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-neutral-500 dark:text-neutral-400">
                Estado del cálculo
              </dt>
              <dd>{runRow.status}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 dark:text-neutral-400">
                Conjunto de supuestos
              </dt>
              <dd>{assumption?.label ?? runRow.assumption_set_id}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 dark:text-neutral-400">
                Total kg CO₂e
              </dt>
              <dd>
                {runRow.total_kg_co2e != null
                  ? formatEsAr(Number(runRow.total_kg_co2e), 6)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500 dark:text-neutral-400">
                Masa semilla limpia (kg)
              </dt>
              <dd>
                {cleanMassKg != null && cleanMassKg > 0
                  ? formatEsAr(cleanMassKg, 4)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500 dark:text-neutral-400">
                Intensidad (kg CO₂e / kg semilla limpia)
              </dt>
              <dd>
                {intensityPerKgCleanSeed != null
                  ? formatEsAr(intensityPerKgCleanSeed, 6)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500 dark:text-neutral-400">
                Completado
              </dt>
              <dd>
                {runRow.completed_at
                  ? new Date(runRow.completed_at).toLocaleString()
                  : "—"}
              </dd>
            </div>
            {runRow.error_message ? (
              <div className="sm:col-span-2">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Mensaje de error
                </dt>
                <dd className="text-red-700 dark:text-red-300">
                  {runRow.error_message}
                </dd>
              </div>
            ) : null}
          </dl>
        )}

        {lineItems && lineItems.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <h3 className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
              Desglose por línea
            </h3>
            <table className="mt-2 w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-600">
                  <th className="py-2 pr-2 font-medium">Etiqueta</th>
                  <th className="py-2 pr-2 font-medium">Cantidad</th>
                  <th className="py-2 pr-2 font-medium">Factor</th>
                  <th className="py-2 font-medium">kg CO₂e</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((row) => (
                  <tr
                    key={row.id as string}
                    className="border-b border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="py-1.5 pr-2">{row.label}</td>
                    <td className="py-1.5 pr-2">
                      {row.quantity != null && Number.isFinite(Number(row.quantity))
                        ? `${formatEsAr(Number(row.quantity), 6)} ${row.quantity_unit ?? ""}`.trim()
                        : row.quantity != null
                          ? `${String(row.quantity)} ${row.quantity_unit ?? ""}`.trim()
                          : "—"}
                    </td>
                    <td className="py-1.5 pr-2">
                      {row.emission_factor != null &&
                      Number.isFinite(Number(row.emission_factor))
                        ? `${formatEsAr(Number(row.emission_factor), 6)} ${row.emission_factor_unit ?? ""}`.trim()
                        : row.emission_factor != null
                          ? `${String(row.emission_factor)} ${row.emission_factor_unit ?? ""}`.trim()
                          : "—"}
                    </td>
                    <td className="py-1.5">
                      {Number.isFinite(Number(row.kg_co2e))
                        ? formatEsAr(Number(row.kg_co2e), 6)
                        : String(row.kg_co2e)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : runRow?.status === "complete" ? (
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            No hay líneas de detalle para esta ejecución.
          </p>
        ) : null}
      </section>

      <RunCalculationForm submissionId={submissionId} canRun={canRun} />

      <p className="mt-10 text-sm">
        <Link
          href="/"
          className="text-neutral-600 underline dark:text-neutral-400"
        >
          ← Inicio
        </Link>
      </p>
    </div>
  );
}
