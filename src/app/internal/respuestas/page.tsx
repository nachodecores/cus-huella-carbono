import { createServerSupabase } from "@/lib/supabase/server";
import { AssumptionsNav } from "@/app/internal/assumptions/_components/assumptions-nav";
import {
  dryerEnergyLabel,
  harvestMethodLabel,
  seasonTypeLabel,
  totalMassUnitLabel,
  yn,
  type FertilizerCatalogUnit,
} from "@/lib/labels";
import type {
  DryerEnergySourceValue,
  HarvestMainMethodValue,
} from "@/lib/external/draft-save-validation";

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

function unwrapRel<T>(rel: unknown): T | null {
  if (rel == null) return null;
  if (Array.isArray(rel)) return (rel[0] as T) ?? null;
  if (typeof rel === "object") return rel as T;
  return null;
}

type SubmissionRow = {
  id: string;
  company_name: string;
  crop_label: string;
  season_type: "primavera" | "otono";
  season_year: number;
  submitted_at: string | null;
  area_cultivated_ha: number | null;
  gross_yield_kg_ha: number | null;
  clean_yield_kg_ha: number | null;
  seed_produced_kg: number | null;
  cover_crop_used: boolean;
  fallow_used: boolean;
  fallow_spray_passes: number | null;
  tillage_used: boolean;
  seeding_rate_kg_ha: number | null;
  seed_used_kg: number | null;
  inoculant_used: boolean;
  seed_treatment_used: boolean;
  fertilizers_used: boolean;
  crop_protection_bioinput_used: boolean;
  post_emergence_herbicide_passes: number;
  fungicide_passes: number;
  insecticide_passes: number;
  harvest_main_method: HarvestMainMethodValue;
  drying_used: boolean;
  drying_main_method: DryerEnergySourceValue | null;
  conditioning_used: boolean;
  transport_used: boolean;
  transport_total_km: number | null;
};

const SUBMISSION_COLUMNS = [
  "id",
  "company_name",
  "crop_label",
  "season_type",
  "season_year",
  "submitted_at",
  "area_cultivated_ha",
  "gross_yield_kg_ha",
  "clean_yield_kg_ha",
  "seed_produced_kg",
  "cover_crop_used",
  "fallow_used",
  "fallow_spray_passes",
  "tillage_used",
  "seeding_rate_kg_ha",
  "seed_used_kg",
  "inoculant_used",
  "seed_treatment_used",
  "fertilizers_used",
  "crop_protection_bioinput_used",
  "post_emergence_herbicide_passes",
  "fungicide_passes",
  "insecticide_passes",
  "harvest_main_method",
  "drying_used",
  "drying_main_method",
  "conditioning_used",
  "transport_used",
  "transport_total_km",
].join(", ");

const th = "px-3 py-2 font-medium whitespace-nowrap";
const td = "px-3 py-2 whitespace-nowrap";

export default async function InternalRespuestasPage() {
  const supabase = createServerSupabase();

  const { data: submissions, error: subErr } = await supabase
    .from("crop_season_submissions_v")
    .select(SUBMISSION_COLUMNS)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false });

  if (subErr) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-red-600 dark:text-red-400">
          Error al cargar las respuestas: {subErr.message}
        </p>
      </div>
    );
  }

  const rows = (submissions ?? []) as unknown as SubmissionRow[];
  const ids = rows.map((r) => r.id);

  const tillageBySubmission = new Map<string, string>();
  const fertilizerBySubmission = new Map<string, string>();

  if (ids.length > 0) {
    const [{ data: tillageLines }, { data: fertilizerLines }] =
      await Promise.all([
        supabase
          .from("submission_tillage_lines")
          .select("submission_id, passes, tillage_tools ( label )")
          .in("submission_id", ids),
        supabase
          .from("submission_fertilizer_lines")
          .select(
            "submission_id, total_quantity, fertilizers ( label, application_unit )",
          )
          .in("submission_id", ids),
      ]);

    const tillageGroups = new Map<string, string[]>();
    for (const line of tillageLines ?? []) {
      const tool = unwrapRel<{ label?: string }>(
        (line as { tillage_tools?: unknown }).tillage_tools,
      );
      const label = tool?.label ?? "Herramienta";
      const text = `${label} ${line.passes} ${line.passes === 1 ? "pasada" : "pasadas"}`;
      const list = tillageGroups.get(line.submission_id as string) ?? [];
      list.push(text);
      tillageGroups.set(line.submission_id as string, list);
    }
    for (const [sid, texts] of tillageGroups) {
      tillageBySubmission.set(sid, texts.join(", "));
    }

    const fertilizerGroups = new Map<string, string[]>();
    for (const line of fertilizerLines ?? []) {
      const fert = unwrapRel<{ label?: string; application_unit?: FertilizerCatalogUnit }>(
        (line as { fertilizers?: unknown }).fertilizers,
      );
      const label = fert?.label ?? "Producto";
      const unit = totalMassUnitLabel(fert?.application_unit ?? "kg_ha");
      const text = `${label} ${formatEsAr(line.total_quantity as number, 2)} ${unit}`;
      const list = fertilizerGroups.get(line.submission_id as string) ?? [];
      list.push(text);
      fertilizerGroups.set(line.submission_id as string, list);
    }
    for (const [sid, texts] of fertilizerGroups) {
      fertilizerBySubmission.set(sid, texts.join(", "));
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
        Interno — sin protección de acceso
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Respuestas de la encuesta
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Todas las respuestas enviadas (status = submitted), una fila por respuesta. Los
        campos que dependen de una pregunta «¿usó X?» muestran «—» cuando esa pregunta
        se respondió que no.
      </p>

      <div className="mt-6">
        <AssumptionsNav current="respuestas" />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
        <table className="w-full min-w-[130rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900">
              <th className={th}>Empresa</th>
              <th className={th}>Cultivo</th>
              <th className={th}>Campaña</th>
              <th className={th}>Enviado</th>
              <th className={th}>Superficie (ha)</th>
              <th className={th}>Rend. bruto (kg/ha)</th>
              <th className={th}>Rend. limpio (kg/ha)</th>
              <th className={th}>Semilla producida (kg) (calculado)</th>
              <th className={th}>Cultivo de cobertura</th>
              <th className={th}>Barbecho químico</th>
              <th className={th}>Pasadas pulverización barbecho</th>
              <th className={th}>Laboreo</th>
              <th className={th}>Operaciones de laboreo</th>
              <th className={th}>Densidad de siembra (kg/ha)</th>
              <th className={th}>Semilla inoculada</th>
              <th className={th}>Semilla tratada</th>
              <th className={th}>Fertilizantes usados</th>
              <th className={th}>Fertilizantes aplicados</th>
              <th className={th}>Bio-insumo protección</th>
              <th className={th}>Aplic. herbicida post-emergente</th>
              <th className={th}>Aplic. fungicida</th>
              <th className={th}>Aplic. insecticida</th>
              <th className={th}>Método de cosecha</th>
              <th className={th}>Secador utilizado</th>
              <th className={th}>Energía del secador</th>
              <th className={th}>Acondicionamiento en línea</th>
              <th className={th}>Transporte de semilla</th>
              <th className={th}>Distancia transporte (km)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-neutral-100 dark:border-neutral-800"
              >
                <td className={td}>{row.company_name}</td>
                <td className={td}>{row.crop_label}</td>
                <td className={td}>
                  {seasonTypeLabel(row.season_type)} {row.season_year}
                </td>
                <td className={td}>
                  {row.submitted_at
                    ? new Date(row.submitted_at).toLocaleString("es-UY", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "—"}
                </td>
                <td className={td}>{formatEsAr(row.area_cultivated_ha, 2)}</td>
                <td className={td}>{formatEsAr(row.gross_yield_kg_ha, 2)}</td>
                <td className={td}>{formatEsAr(row.clean_yield_kg_ha, 2)}</td>
                <td className={td}>{formatEsAr(row.seed_produced_kg, 2)}</td>
                <td className={td}>{yn(row.cover_crop_used)}</td>
                <td className={td}>{yn(row.fallow_used)}</td>
                <td className={td}>
                  {row.fallow_used ? formatEsAr(row.fallow_spray_passes, 0) : "—"}
                </td>
                <td className={td}>{yn(row.tillage_used)}</td>
                <td className={td}>
                  {row.tillage_used
                    ? tillageBySubmission.get(row.id) ?? "—"
                    : "—"}
                </td>
                <td className={td}>{formatEsAr(row.seeding_rate_kg_ha, 2)}</td>
                <td className={td}>{yn(row.inoculant_used)}</td>
                <td className={td}>{yn(row.seed_treatment_used)}</td>
                <td className={td}>{yn(row.fertilizers_used)}</td>
                <td className={td}>
                  {row.fertilizers_used
                    ? fertilizerBySubmission.get(row.id) ?? "—"
                    : "—"}
                </td>
                <td className={td}>{yn(row.crop_protection_bioinput_used)}</td>
                <td className={td}>{row.post_emergence_herbicide_passes}</td>
                <td className={td}>{row.fungicide_passes}</td>
                <td className={td}>{row.insecticide_passes}</td>
                <td className={td}>{harvestMethodLabel(row.harvest_main_method)}</td>
                <td className={td}>{yn(row.drying_used)}</td>
                <td className={td}>
                  {row.drying_used ? dryerEnergyLabel(row.drying_main_method) : "—"}
                </td>
                <td className={td}>{yn(row.conditioning_used)}</td>
                <td className={td}>{yn(row.transport_used)}</td>
                <td className={td}>
                  {row.transport_used ? formatEsAr(row.transport_total_km, 1) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          Todavía no hay respuestas enviadas.
        </p>
      ) : null}
    </div>
  );
}
