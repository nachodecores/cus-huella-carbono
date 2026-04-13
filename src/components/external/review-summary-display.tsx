import { ExternalSectionCard } from "@/components/external/external-section-card";
import type { SaveDraftPayload } from "@/lib/external/draft-save-validation";

function seasonTypeLabel(s: "primavera" | "otono") {
  return s === "primavera" ? "Primavera" : "Otoño";
}

function yn(v: boolean) {
  return v ? "Sí" : "No";
}

function harvestMethodLabel(m: SaveDraftPayload["harvest_main_method"]): string {
  if (m === "corte_hilerado") return "Corte e hilerado previo";
  if (m === "directa") return "Cosecha directa";
  return String(m);
}

function dryerEnergyLabel(m: SaveDraftPayload["drying_main_method"]): string {
  if (!m) return "—";
  const map: Record<string, string> = {
    gas: "Gas",
    gasoil: "Gasoil",
    electricidad: "Electricidad",
  };
  return map[m] ?? m;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="shrink-0 font-medium text-neutral-600 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="min-w-0">{value}</dd>
    </div>
  );
}

export type FertilizerCatalogUnit = "kg_ha" | "l_ha";

export type SubmissionReadonlySummaryProps = {
  companyName: string;
  cropLabel: string;
  seasonType: "primavera" | "otono";
  seasonYear: number;
  payload: SaveDraftPayload;
  fertilizerLabelsById: Record<number, string>;
  fertilizerApplicationUnitById: Record<number, FertilizerCatalogUnit>;
  tillageToolLabelsById: Record<number, string>;
  submittedAt?: string | null;
};

function rateUnitLabel(u: FertilizerCatalogUnit) {
  return u === "l_ha" ? "L/ha" : "kg/ha";
}

function totalMassUnitLabel(u: FertilizerCatalogUnit) {
  return u === "l_ha" ? "L" : "kg";
}

export function SubmissionReadonlySummary({
  companyName,
  cropLabel,
  seasonType,
  seasonYear,
  payload,
  fertilizerLabelsById,
  fertilizerApplicationUnitById,
  tillageToolLabelsById,
  submittedAt,
}: SubmissionReadonlySummaryProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <header>
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          {companyName}
        </p>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {submittedAt ? "Cultivo enviado" : "Revisión antes de enviar"}
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {cropLabel} · {seasonTypeLabel(seasonType)} {seasonYear}
        </p>
        {submittedAt ? (
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Enviado:{" "}
            {new Date(submittedAt).toLocaleString("es-UY", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        ) : null}
      </header>

      <ExternalSectionCard title="1. Datos generales y resultados productivos">
        <dl className="space-y-2 p-4 text-sm text-neutral-800 dark:text-neutral-200">
        <Row label="Cultivo" value={cropLabel} />
        <Row
          label="Zafra"
          value={seasonTypeLabel(seasonType)}
        />
        <Row label="Año" value={String(seasonYear)} />
        <Row
          label="Superficie (hectáreas totales)"
          value={
            payload.area_cultivated_ha != null
              ? String(payload.area_cultivated_ha)
              : "—"
          }
        />
        <Row
          label="Rendimiento bruto (kg/ha)"
          value={
            payload.gross_yield_kg_ha != null
              ? String(payload.gross_yield_kg_ha)
              : "—"
          }
        />
        <Row
          label="Rendimiento limpio / acondicionado (kg/ha)"
          value={
            payload.clean_yield_kg_ha != null
              ? String(payload.clean_yield_kg_ha)
              : "—"
          }
        />
        </dl>
      </ExternalSectionCard>

      <ExternalSectionCard title="2. Barbecho y suelo">
        <dl className="space-y-2 p-4 text-sm text-neutral-800 dark:text-neutral-200">
        <Row label="¿Hubo barbecho químico?" value={yn(payload.fallow_used)} />
        {payload.fallow_used ? (
          <Row
            label="Pasadas pulverización (barbecho)"
            value={
              payload.fallow_spray_passes != null
                ? String(payload.fallow_spray_passes)
                : "—"
            }
          />
        ) : null}
        <Row label="¿Laboreo?" value={yn(payload.tillage_used)} />
        {payload.tillage_used && payload.tillageLines.length > 0 ? (
          <div className="mt-2 space-y-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            {payload.tillageLines.map((l, i) => (
              <div
                key={`${l.tillage_tool_id}-${i}`}
                className="rounded-md bg-neutral-50/80 px-3 py-2 text-sm dark:bg-neutral-900/50"
              >
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {tillageToolLabelsById[l.tillage_tool_id] ??
                    `Herramienta ${l.tillage_tool_id}`}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Pasadas: {l.passes}
                </p>
              </div>
            ))}
          </div>
        ) : null}
        </dl>
      </ExternalSectionCard>

      <ExternalSectionCard title="3. Siembra e insumos">
        <dl className="space-y-2 p-4 text-sm text-neutral-800 dark:text-neutral-200">
        <Row
          label="Densidad de siembra (kg/ha)"
          value={
            payload.seeding_rate_kg_ha != null
              ? String(payload.seeding_rate_kg_ha)
              : "—"
          }
        />
        <Row label="¿Semilla inoculada?" value={yn(payload.inoculant_used)} />
        <Row label="¿Semilla tratada?" value={yn(payload.seed_treatment_used)} />
        <Row label="¿Fertilizantes (lista)?" value={yn(payload.fertilizers_used)} />
        {payload.fertilizers_used && payload.fertilizerLines.length > 0 ? (
          <div className="mt-2 space-y-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            {payload.fertilizerLines.map((l, i) => {
              const unit =
                fertilizerApplicationUnitById[l.fertilizer_id] ?? "kg_ha";
              return (
                <div
                  key={`${l.fertilizer_id}-${i}`}
                  className="rounded-md bg-neutral-50/80 px-3 py-2 text-sm dark:bg-neutral-900/50"
                >
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {fertilizerLabelsById[l.fertilizer_id] ??
                      `Producto ${l.fertilizer_id}`}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Dosis: {l.application_rate_per_ha}{" "}
                    {rateUnitLabel(unit)}
                  </p>
                  {l.total_quantity != null &&
                  Number.isFinite(l.total_quantity) ? (
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Total: {l.total_quantity} {totalMassUnitLabel(unit)}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
        </dl>
      </ExternalSectionCard>

      <ExternalSectionCard title="4. Protección del cultivo">
        <dl className="space-y-2 p-4 text-sm text-neutral-800 dark:text-neutral-200">
        <Row
          label="Aplicaciones con herbicida post-emergente"
          value={String(payload.post_emergence_herbicide_passes)}
        />
        <Row
          label="Aplicaciones con fungicida"
          value={String(payload.fungicide_passes)}
        />
        <Row
          label="Aplicaciones con insecticida"
          value={String(payload.insecticide_passes)}
        />
        </dl>
      </ExternalSectionCard>

      <ExternalSectionCard title="5. Cosecha, secado, acondicionamiento y logística">
        <dl className="space-y-2 p-4 text-sm text-neutral-800 dark:text-neutral-200">
        <Row
          label="Método principal de cosecha"
          value={harvestMethodLabel(payload.harvest_main_method)}
        />
        <Row label="¿Se usó secador?" value={yn(payload.drying_used)} />
        {payload.drying_used ? (
          <Row
            label="Energía principal del secador"
            value={dryerEnergyLabel(payload.drying_main_method)}
          />
        ) : null}
        <Row label="¿Acondicionamiento en línea?" value={yn(payload.conditioning_used)} />
        <Row label="¿Transporte de semilla?" value={yn(payload.transport_used)} />
        {payload.transport_used ? (
          <>
            <Row
              label="Distancia total (km)"
              value={
                payload.transport_total_km != null
                  ? String(payload.transport_total_km)
                  : "—"
              }
            />
          </>
        ) : null}
        </dl>
      </ExternalSectionCard>
    </div>
  );
}
