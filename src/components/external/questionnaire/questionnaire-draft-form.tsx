"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  createAndSubmitQuestionnaire,
  createDraftQuestionnaire,
  saveDraftQuestionnaire,
} from "@/lib/external/draft-save-actions";
import type { SaveDraftPayload } from "@/lib/external/draft-save-validation";
import { submitFinalQuestionnaire } from "@/lib/external/submit-final-actions";
import { BinaryPill } from "@/components/external/binary-pill";
import { ExternalSectionCard } from "@/components/external/external-section-card";

export type DraftSubmissionRow = { id: string } & SaveDraftPayload;

export type FertilizerApplicationUnit = "kg_ha" | "l_ha";

export type FertilizerLineRow = {
  id: string;
  fertilizer_id: number;
  application_rate_per_ha: number;
  total_quantity?: number;
};

export type FertilizerOption = {
  id: number;
  label: string;
  application_unit: FertilizerApplicationUnit;
};

export type TillageLineRow = {
  id: string;
  tillage_tool_id: number;
  passes: number;
};

export type TillageToolOption = {
  id: number;
  code: string;
  label: string;
};

export type CropOption = { id: number; label: string };

function RemoveLineIconButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="shrink-0 rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        />
      </svg>
    </button>
  );
}

function AddLineCircleButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 shrink-0" aria-hidden />
      <div className="flex min-w-0 flex-1 justify-center py-1">
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          title={label}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-neutral-300 bg-white text-xl font-medium leading-none text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:ring-offset-neutral-950"
        >
          +
        </button>
      </div>
    </div>
  );
}

type QuestionnaireDraftFormCommonProps = {
  token: string;
  companyName: string;
  basePath: string;
  initialSubmission: DraftSubmissionRow;
  initialFertilizerLines: FertilizerLineRow[];
  initialTillageLines: TillageLineRow[];
  fertilizerCatalog: FertilizerOption[];
  tillageToolCatalog: TillageToolOption[];
};

export type QuestionnaireDraftFormProps =
  | (QuestionnaireDraftFormCommonProps & {
      mode: "edit";
      submissionId: string;
      cropLabel: string;
      seasonType: "primavera" | "otono";
      seasonYear: number;
    })
  | (QuestionnaireDraftFormCommonProps & {
      mode: "create";
      cropOptions: CropOption[];
    });

function numToInput(n: number | null | undefined): string {
  if (n === null || n === undefined) return "";
  return String(n);
}

function seasonTypeLabel(s: "primavera" | "otono") {
  return s === "primavera" ? "Primavera" : "Otoño";
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <ExternalSectionCard title={title}>
      <div className="space-y-10 p-4">{children}</div>
    </ExternalSectionCard>
  );
}

/** Menos aire entre la pregunta madre y el despliegue condicional que entre bloques sueltos. */
function ConditionalQuestionGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="space-y-3">{children}</div>;
}

function YesNo({
  id,
  label,
  value,
  onChange,
  inline = false,
}: {
  id: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  inline?: boolean;
}) {
  return (
    <BinaryPill
      id={id}
      legend={label}
      value={value}
      onChange={onChange}
      optionLeft={{ value: true, label: "Sí" }}
      optionRight={{ value: false, label: "No" }}
      layout={inline ? "inline" : "stacked"}
    />
  );
}

function IntegerStepper({
  id,
  ariaLabel,
  value,
  onChange,
  min,
  max,
  allowNull,
  className,
}: {
  id?: string;
  ariaLabel?: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min: number;
  max?: number;
  allowNull: boolean;
  className?: string;
}) {
  const str = numToInput(value);

  function clamp(n: number): number {
    let x = Math.trunc(n);
    if (x < min) x = min;
    if (max !== undefined && x > max) x = max;
    return x;
  }

  function parseInput(raw: string): number | null {
    if (raw === "") {
      return allowNull ? null : min;
    }
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) {
      return allowNull ? null : min;
    }
    return clamp(n);
  }

  const canDec =
    value != null && (allowNull ? value >= min : value > min);
  const atMax = max != null && value != null && value >= max;

  return (
    <div
      className={`inline-flex w-full items-stretch overflow-hidden rounded-md border border-neutral-300 dark:border-neutral-600 ${className ?? ""}`}
    >
      <button
        type="button"
        className="flex w-9 shrink-0 items-center justify-center bg-neutral-50 text-lg font-medium leading-none text-neutral-800 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
        aria-label="Restar uno"
        disabled={!canDec}
        onClick={() => {
          if (value == null) return;
          if (allowNull && value === min) {
            onChange(null);
            return;
          }
          onChange(clamp(value - 1));
        }}
      >
        −
      </button>
      <input
        id={id}
        aria-label={ariaLabel}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        placeholder="0"
        className="input-number-no-spin min-w-[2.75rem] flex-1 border-0 border-x border-neutral-200 bg-white px-2 py-2 text-center text-sm tabular-nums text-neutral-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-500"
        value={str}
        onChange={(e) => onChange(parseInput(e.target.value))}
      />
      <button
        type="button"
        className="flex w-9 shrink-0 items-center justify-center bg-neutral-50 text-lg font-medium leading-none text-neutral-800 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
        aria-label="Sumar uno"
        disabled={atMax}
        onClick={() => {
          if (value == null) {
            onChange(min);
            return;
          }
          onChange(clamp(value + 1));
        }}
      >
        +
      </button>
    </div>
  );
}

function buildSavePayload(
  sub: DraftSubmissionRow,
  lines: FertilizerLineRow[],
  tillageLines: TillageLineRow[],
): SaveDraftPayload {
  const { id: _rowId, fertilizerLines: _f, tillageLines: _tl, ...rest } = sub;
  return {
    ...rest,
    fertilizerLines: lines.map((l) => ({
      fertilizer_id: l.fertilizer_id,
      application_rate_per_ha: l.application_rate_per_ha,
    })),
    tillageLines: tillageLines.map(({ tillage_tool_id, passes }) => ({
      tillage_tool_id,
      passes,
    })),
  };
}

function rateUnitLabel(u: FertilizerApplicationUnit) {
  return u === "l_ha" ? "L/ha" : "kg/ha";
}

export function QuestionnaireDraftForm(props: QuestionnaireDraftFormProps) {
  const {
    token,
    companyName,
    basePath,
    initialSubmission,
    initialFertilizerLines,
    initialTillageLines,
    fertilizerCatalog,
    tillageToolCatalog,
  } = props;

  const [createCropId, setCreateCropId] = useState<number | "">("");
  const [createSeasonType, setCreateSeasonType] = useState<
    "primavera" | "otono"
  >("primavera");
  const [createSeasonYear, setCreateSeasonYear] = useState(() =>
    new Date().getFullYear(),
  );

  const [sub, setSub] = useState<DraftSubmissionRow>(() => ({
    ...initialSubmission,
    tillageLines: [],
  }));

  const [lines, setLines] = useState<FertilizerLineRow[]>(() => {
    if (initialFertilizerLines.length > 0) return initialFertilizerLines;
    if (initialSubmission.fertilizers_used) {
      return [
        {
          id: crypto.randomUUID(),
          fertilizer_id: fertilizerCatalog[0]?.id ?? 1,
          application_rate_per_ha: 1,
        },
      ];
    }
    return [];
  });

  const [tillageLines, setTillageLines] = useState<TillageLineRow[]>(() => {
    if (initialTillageLines.length > 0) return initialTillageLines;
    if (initialSubmission.tillage_used) {
      return [
        {
          id: crypto.randomUUID(),
          tillage_tool_id: tillageToolCatalog[0]?.id ?? 1,
          passes: 1,
        },
      ];
    }
    return [];
  });

  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();

  const updateSub = <K extends keyof DraftSubmissionRow>(
    key: K,
    value: DraftSubmissionRow[K],
  ) => {
    setSub((s) => ({ ...s, [key]: value }));
  };

  const showFallow = sub.fallow_used;
  const showTillage = sub.tillage_used;
  const showOrganic = sub.organic_amendment_used;
  const showFertilizerDetails = sub.fertilizers_used;
  const showDrying = sub.drying_used;
  const showTransport = sub.transport_used;

  const cropLabelDisplay =
    props.mode === "create"
      ? (props.cropOptions.find((c) => c.id === createCropId)?.label ?? "—")
      : props.cropLabel;
  const seasonTypeDisplay =
    props.mode === "create" ? createSeasonType : props.seasonType;
  const seasonYearDisplay =
    props.mode === "create" ? createSeasonYear : props.seasonYear;

  return (
    <div className="relative isolate min-h-[100dvh] w-full">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/patronsemillas.svg')] bg-[length:480px_720px] bg-repeat opacity-15"
        aria-hidden
      />
      <div className="relative mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          {companyName}
        </p>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Cuestionario (borrador)
        </h1>
        {props.mode === "edit" ? (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
            Envío: {props.submissionId}
          </p>
        ) : null}
      </header>

      <div className="space-y-14">
        <FormSection title="1. Datos generales y resultados productivos">
          {props.mode === "create" ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4 lg:gap-6">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="new_crop_id"
                  className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                  Cultivo
                </label>
                <select
                  id="new_crop_id"
                  required
                  value={createCropId === "" ? "" : String(createCropId)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCreateCropId(v === "" ? "" : Number(v));
                  }}
                  className="mt-1 w-full max-w-md rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <option value="" disabled>
                    Seleccionar…
                  </option>
                  {props.cropOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full min-w-0 shrink-0 md:w-auto">
                <BinaryPill
                  id="create_season_type"
                  legend="Zafra"
                  value={createSeasonType}
                  onChange={setCreateSeasonType}
                  optionLeft={{ value: "primavera", label: "Primavera" }}
                  optionRight={{ value: "otono", label: "Otoño" }}
                />
              </div>
              <div className="w-full min-w-0 shrink-0 md:w-24 lg:w-28">
                <input
                  id="create_season_year"
                  type="number"
                  min={2000}
                  max={2100}
                  step={1}
                  value={createSeasonYear}
                  onChange={(e) =>
                    setCreateSeasonYear(Number(e.target.value) || 2000)
                  }
                  aria-label="Año"
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {cropLabelDisplay} · {seasonTypeLabel(seasonTypeDisplay)}{" "}
              {seasonYearDisplay}
            </p>
          )}
          <div>
            <label
              htmlFor="area_cultivated_ha"
              className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
            >
              Superficie (hectáreas totales)
            </label>
            <input
              id="area_cultivated_ha"
              type="number"
              min={0}
              step="any"
              placeholder="0"
              className="input-number-no-spin mt-1 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
              value={numToInput(sub.area_cultivated_ha)}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  updateSub("area_cultivated_ha", null);
                  return;
                }
                const n = Number(raw);
                updateSub(
                  "area_cultivated_ha",
                  Number.isFinite(n) ? n : null,
                );
              }}
            />
          </div>
          <div>
            <label
              htmlFor="gross_yield_kg_ha"
              className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
            >
              Rendimiento bruto (kg/ha, salida de cosechadora)
            </label>
            <input
              id="gross_yield_kg_ha"
              type="number"
              min={0}
              step="any"
              placeholder="0"
              className="input-number-no-spin mt-1 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
              value={numToInput(sub.gross_yield_kg_ha)}
              onChange={(e) =>
                updateSub(
                  "gross_yield_kg_ha",
                  e.target.value === ""
                    ? null
                    : Number(e.target.value),
                )
              }
            />
          </div>
          <div>
            <label
              htmlFor="clean_yield_kg_ha"
              className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
            >
              Rendimiento limpio / acondicionado (kg/ha)
            </label>
            <input
              id="clean_yield_kg_ha"
              type="number"
              min={0}
              step="any"
              placeholder="0"
              className="input-number-no-spin mt-1 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
              value={numToInput(sub.clean_yield_kg_ha)}
              onChange={(e) =>
                updateSub(
                  "clean_yield_kg_ha",
                  e.target.value === ""
                    ? null
                    : Number(e.target.value),
                )
              }
            />
          </div>
        </FormSection>

        <FormSection title="2. Barbecho y suelo">
          <ConditionalQuestionGroup>
            <YesNo
              id="fallow_used"
              label="¿Hubo barbecho químico?"
              value={sub.fallow_used}
              onChange={(v) => {
                updateSub("fallow_used", v);
                if (!v) updateSub("fallow_spray_passes", null);
              }}
            />
            {showFallow ? (
              <div>
                <label
                  htmlFor="fallow_spray_passes"
                  className="block text-sm text-neutral-800 dark:text-neutral-200"
                >
                  Pasadas de pulverización (barbecho)
                </label>
                <IntegerStepper
                  id="fallow_spray_passes"
                  className="mt-1 max-w-xs"
                  value={sub.fallow_spray_passes}
                  onChange={(v) => updateSub("fallow_spray_passes", v)}
                  min={1}
                  allowNull
                />
              </div>
            ) : null}
          </ConditionalQuestionGroup>

          <ConditionalQuestionGroup>
            <YesNo
              id="tillage_used"
              label="¿Hubo laboreo (más allá del barbecho)?"
              value={sub.tillage_used}
              onChange={(v) => {
                updateSub("tillage_used", v);
                if (!v) {
                  setTillageLines([]);
                } else {
                  setTillageLines((prev) =>
                    prev.length > 0
                      ? prev
                      : [
                          {
                            id: crypto.randomUUID(),
                            tillage_tool_id: tillageToolCatalog[0]?.id ?? 1,
                            passes: 1,
                          },
                        ],
                  );
                }
              }}
            />
            {showTillage ? (
              <ul className="list-none divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
                {tillageLines.map((line, index) => (
                  <li key={line.id} className="px-3 py-3">
                    <div className="flex items-end gap-2">
                      <span
                        className="w-7 shrink-0 pb-2 text-right text-sm tabular-nums text-neutral-500 dark:text-neutral-400"
                        aria-hidden
                      >
                        {index + 1}.
                      </span>
                      <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2">
                        <div className="min-w-[12rem] flex-1">
                          <label className="text-xs text-neutral-600 dark:text-neutral-400">
                            Herramienta
                          </label>
                          <select
                            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-900"
                            value={line.tillage_tool_id}
                            onChange={(e) => {
                              const nid = Number(e.target.value);
                              setTillageLines((prev) =>
                                prev.map((l) =>
                                  l.id === line.id
                                    ? { ...l, tillage_tool_id: nid }
                                    : l,
                                ),
                              );
                            }}
                          >
                            {tillageToolCatalog.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-36">
                          <label className="text-xs text-neutral-600 dark:text-neutral-400">
                            Pasadas
                          </label>
                          <IntegerStepper
                            className="mt-1 w-full"
                            ariaLabel="Pasadas"
                            value={line.passes}
                            onChange={(v) => {
                              const q = v ?? 1;
                              setTillageLines((prev) =>
                                prev.map((l) =>
                                  l.id === line.id
                                    ? { ...l, passes: q }
                                    : l,
                                ),
                              );
                            }}
                            min={1}
                            allowNull={false}
                          />
                        </div>
                        <RemoveLineIconButton
                          label="Quitar operación"
                          onClick={() =>
                            setTillageLines((prev) =>
                              prev.filter((l) => l.id !== line.id),
                            )
                          }
                        />
                      </div>
                    </div>
                  </li>
                ))}
                <li className="px-3 py-3">
                  <AddLineCircleButton
                    label="Agregar operación de laboreo"
                    onClick={() =>
                      setTillageLines((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          tillage_tool_id: tillageToolCatalog[0]?.id ?? 1,
                          passes: 1,
                        },
                      ])
                    }
                  />
                </li>
              </ul>
            ) : null}
          </ConditionalQuestionGroup>

          <ConditionalQuestionGroup>
            <YesNo
              id="organic_amendment_used"
              label="¿Aplicaste estiércol, compost u otra enmienda orgánica?"
              value={sub.organic_amendment_used}
              onChange={(v) => {
                updateSub("organic_amendment_used", v);
                if (!v) {
                  updateSub("organic_amendment_area_percent", null);
                  updateSub("organic_amendment_rate_kg_ha", null);
                }
              }}
            />
            {showOrganic ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                    % de superficie tratada en el lote
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    placeholder="0"
                    className="input-number-no-spin mt-1 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
                    value={numToInput(sub.organic_amendment_area_percent)}
                    onChange={(e) =>
                      updateSub(
                        "organic_amendment_area_percent",
                        e.target.value === ""
                          ? null
                          : Number(e.target.value),
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                    Dosis en kg/ha sobre el área tratada
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="0"
                    className="input-number-no-spin mt-1 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
                    value={numToInput(sub.organic_amendment_rate_kg_ha)}
                    onChange={(e) =>
                      updateSub(
                        "organic_amendment_rate_kg_ha",
                        e.target.value === ""
                          ? null
                          : Number(e.target.value),
                      )
                    }
                  />
                </div>
              </div>
            ) : null}
          </ConditionalQuestionGroup>
        </FormSection>

        <FormSection title="3. Siembra e insumos">
          <div>
            <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Densidad de siembra (kg/ha)
            </label>
            <input
              type="number"
              min={0.0001}
              step="any"
              placeholder="0"
              className="input-number-no-spin mt-1 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
              value={numToInput(sub.seeding_rate_kg_ha)}
              onChange={(e) =>
                updateSub(
                  "seeding_rate_kg_ha",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            />
          </div>
          <YesNo
            id="inoculant_used"
            label="¿Semilla inoculada?"
            value={sub.inoculant_used}
            onChange={(v) => updateSub("inoculant_used", v)}
            inline
          />
          <YesNo
            id="seed_treatment_used"
            label="¿Semilla tratada?"
            value={sub.seed_treatment_used}
            onChange={(v) => updateSub("seed_treatment_used", v)}
            inline
          />

          <ConditionalQuestionGroup>
            <YesNo
              id="fertilizers_used"
              label="¿Usaste fertilizantes de la lista para este cultivo en esta temporada?"
              value={sub.fertilizers_used}
              onChange={(v) => {
                updateSub("fertilizers_used", v);
                if (!v) {
                  setLines([]);
                } else {
                  setLines((prev) =>
                    prev.length > 0
                      ? prev
                      : [
                          {
                            id: crypto.randomUUID(),
                            fertilizer_id: fertilizerCatalog[0]?.id ?? 1,
                            application_rate_per_ha: 1,
                          },
                        ],
                  );
                }
              }}
            />
            {showFertilizerDetails ? (
              <ul className="list-none divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
                {lines.map((line, index) => {
                  const fertMeta = fertilizerCatalog.find(
                    (f) => f.id === line.fertilizer_id,
                  );
                  const appUnit = fertMeta?.application_unit ?? "kg_ha";
                  return (
                    <li key={line.id} className="px-3 py-3">
                      <div className="flex items-end gap-2">
                        <span
                          className="w-7 shrink-0 pb-2 text-right text-sm tabular-nums text-neutral-500 dark:text-neutral-400"
                          aria-hidden
                        >
                          {index + 1}.
                        </span>
                        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2">
                          <div className="min-w-[12rem] flex-1">
                            <label className="text-xs text-neutral-600 dark:text-neutral-400">
                              Producto
                            </label>
                            <select
                              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-900"
                              value={line.fertilizer_id}
                              onChange={(e) => {
                                const nid = Number(e.target.value);
                                setLines((prev) =>
                                  prev.map((l) =>
                                    l.id === line.id
                                      ? { ...l, fertilizer_id: nid }
                                      : l,
                                  ),
                                );
                              }}
                            >
                              {fertilizerCatalog.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-36">
                            <label className="text-xs text-neutral-600 dark:text-neutral-400">
                              Dosis ({rateUnitLabel(appUnit)})
                            </label>
                            <input
                              type="number"
                              min={0}
                              step="any"
                              placeholder="0"
                              className="input-number-no-spin mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-900"
                              value={numToInput(line.application_rate_per_ha)}
                              onChange={(e) => {
                                const q = Number(e.target.value) || 0;
                                setLines((prev) =>
                                  prev.map((l) =>
                                    l.id === line.id
                                      ? {
                                          ...l,
                                          application_rate_per_ha: q,
                                        }
                                      : l,
                                  ),
                                );
                              }}
                            />
                          </div>
                          <RemoveLineIconButton
                            label="Quitar línea"
                            onClick={() =>
                              setLines((prev) =>
                                prev.filter((l) => l.id !== line.id),
                              )
                            }
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
                <li className="px-3 py-3">
                  <AddLineCircleButton
                    label="Agregar fertilizante"
                    onClick={() =>
                      setLines((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          fertilizer_id: fertilizerCatalog[0]?.id ?? 1,
                          application_rate_per_ha: 1,
                        },
                      ])
                    }
                  />
                </li>
              </ul>
            ) : null}
          </ConditionalQuestionGroup>
        </FormSection>

        <FormSection title="4. Protección del cultivo">
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            Indicá 0 si no aplicaste ese tipo de producto.
          </p>
          <div>
            <label
              htmlFor="post_emergence_herbicide_passes"
              className="block text-sm text-neutral-800 dark:text-neutral-200"
            >
              Aplicaciones con herbicida post-emergente
            </label>
            <IntegerStepper
              id="post_emergence_herbicide_passes"
              className="mt-1 max-w-xs"
              value={sub.post_emergence_herbicide_passes}
              onChange={(v) =>
                updateSub(
                  "post_emergence_herbicide_passes",
                  v ?? 0,
                )
              }
              min={0}
              allowNull={false}
            />
          </div>
          <div>
            <label
              htmlFor="fungicide_passes"
              className="block text-sm text-neutral-800 dark:text-neutral-200"
            >
              Aplicaciones con fungicida
            </label>
            <IntegerStepper
              id="fungicide_passes"
              className="mt-1 max-w-xs"
              value={sub.fungicide_passes}
              onChange={(v) => updateSub("fungicide_passes", v ?? 0)}
              min={0}
              allowNull={false}
            />
          </div>
          <div>
            <label
              htmlFor="insecticide_passes"
              className="block text-sm text-neutral-800 dark:text-neutral-200"
            >
              Aplicaciones con insecticida
            </label>
            <IntegerStepper
              id="insecticide_passes"
              className="mt-1 max-w-xs"
              value={sub.insecticide_passes}
              onChange={(v) => updateSub("insecticide_passes", v ?? 0)}
              min={0}
              allowNull={false}
            />
          </div>
        </FormSection>

        <FormSection title="5. Cosecha, secado, acondicionamiento y logística">
          <fieldset>
            <legend className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Método principal de cosecha
            </legend>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
              &quot;Corte e hilerado previo&quot; incluye secado natural en campo
              y maquinaria asociada (no se solicita a parte).
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-900 dark:text-neutral-100">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="harvest_main_method"
                  checked={sub.harvest_main_method === "directa"}
                  onChange={() => updateSub("harvest_main_method", "directa")}
                />
                Cosecha directa
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="harvest_main_method"
                  checked={sub.harvest_main_method === "corte_hilerado"}
                  onChange={() =>
                    updateSub("harvest_main_method", "corte_hilerado")
                  }
                />
                Corte e hilerado previo
              </label>
            </div>
          </fieldset>

          <ConditionalQuestionGroup>
            <YesNo
              id="drying_used"
              label="¿Se usó secador?"
              value={sub.drying_used}
              onChange={(v) => updateSub("drying_used", v)}
            />
            {showDrying ? (
              <div>
                <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                  Energía principal del secador
                </label>
                <select
                  className="mt-1 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
                  value={sub.drying_main_method ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateSub(
                      "drying_main_method",
                      v === ""
                        ? null
                        : (v as DraftSubmissionRow["drying_main_method"]),
                    );
                  }}
                >
                  <option value="">—</option>
                  <option value="gas">Gas</option>
                  <option value="gasoil">Gasoil</option>
                  <option value="electricidad">Electricidad</option>
                </select>
              </div>
            ) : null}
          </ConditionalQuestionGroup>

          <YesNo
            id="conditioning_used"
            label="¿Hubo limpieza / selección / acondicionamiento en línea?"
            value={sub.conditioning_used}
            onChange={(v) => updateSub("conditioning_used", v)}
          />

          <ConditionalQuestionGroup>
            <YesNo
              id="transport_used"
              label="¿Transportaste semilla fuera del campo o entre establecimientos?"
              value={sub.transport_used}
              onChange={(v) => updateSub("transport_used", v)}
            />
            {showTransport ? (
              <div>
                <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                  Distancia total aproximada (km)
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  placeholder="0"
                  className="input-number-no-spin mt-1 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
                  value={numToInput(sub.transport_total_km)}
                  onChange={(e) =>
                    updateSub(
                      "transport_total_km",
                      e.target.value === ""
                        ? null
                        : Number(e.target.value),
                    )
                  }
                />
              </div>
            ) : null}
          </ConditionalQuestionGroup>
        </FormSection>
      </div>

      <div className="mt-8 space-y-3">
        {saveError ? (
          <p
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {saveError}
          </p>
        ) : null}
        {submitError ? (
          <p
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {submitError}
          </p>
        ) : null}
        {saveOk ? (
          <p
            className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-100"
            role="status"
          >
            Borrador guardado.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isSavePending || isSubmitPending}
            className="inline-flex rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            onClick={() => {
              setSaveError(null);
              setSubmitError(null);
              setSaveOk(false);
              const payload = buildSavePayload(sub, lines, tillageLines);
              startSaveTransition(async () => {
                if (props.mode === "create") {
                  const cid = Number(createCropId);
                  if (!Number.isInteger(cid) || cid < 1) {
                    setSaveError("Elegí un cultivo.");
                    return;
                  }
                  const result = await createDraftQuestionnaire(
                    token,
                    cid,
                    createSeasonType,
                    createSeasonYear,
                    payload,
                  );
                  if (result?.error) {
                    setSaveError(result.error);
                  }
                  return;
                }
                const result = await saveDraftQuestionnaire(
                  token,
                  props.submissionId,
                  payload,
                );
                if ("error" in result) {
                  setSaveError(result.error);
                  return;
                }
                setSaveOk(true);
              });
            }}
          >
            {isSavePending ? "Guardando…" : "Guardar borrador"}
          </button>
          <button
            type="button"
            disabled={isSavePending || isSubmitPending}
            className="inline-flex rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            onClick={() => {
              setSaveError(null);
              setSubmitError(null);
              setSaveOk(false);
              const payload = buildSavePayload(sub, lines, tillageLines);
              startSubmitTransition(async () => {
                if (props.mode === "create") {
                  const cid = Number(createCropId);
                  if (!Number.isInteger(cid) || cid < 1) {
                    setSaveError("Elegí un cultivo.");
                    return;
                  }
                  const result = await createAndSubmitQuestionnaire(
                    token,
                    cid,
                    createSeasonType,
                    createSeasonYear,
                    payload,
                  );
                  if (result?.error) {
                    setSubmitError(result.error);
                  }
                  return;
                }
                const saveResult = await saveDraftQuestionnaire(
                  token,
                  props.submissionId,
                  payload,
                );
                if ("error" in saveResult) {
                  setSaveError(saveResult.error);
                  return;
                }
                setSaveOk(true);
                const finalResult = await submitFinalQuestionnaire(
                  token,
                  props.submissionId,
                );
                if (finalResult && "error" in finalResult) {
                  setSubmitError(finalResult.error);
                }
              });
            }}
          >
            {isSubmitPending ? "Enviando…" : "Enviar formulario"}
          </button>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          Luego del envío no podrás editar desde este enlace.
        </p>
      </div>

      <p className="mt-6 flex flex-wrap gap-4">
        <Link
          href={basePath}
          className="text-sm text-neutral-600 dark:text-neutral-400"
        >
          ← Listado
        </Link>
      </p>
      </div>
    </div>
  );
}
