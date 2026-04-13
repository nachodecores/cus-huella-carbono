import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { getDefaultAssumptionSet } from "@/app/internal/assumptions/_lib/default-assumption-set";
import { AssumptionsNav } from "@/app/internal/assumptions/_components/assumptions-nav";
import { BlockingDefaultSetError } from "@/app/internal/assumptions/_components/blocking-default-set-error";
import { saveFertilizerFactors } from "@/app/internal/assumptions/actions";

type PageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>;
};

function unwrapFert(rel: unknown): {
  label?: string;
  application_unit?: string;
} | null {
  if (rel == null) return null;
  if (Array.isArray(rel)) return (rel[0] as { label?: string; application_unit?: string }) ?? null;
  if (typeof rel === "object")
    return rel as { label?: string; application_unit?: string };
  return null;
}

export default async function AssumptionsFertilizersPage({
  searchParams,
}: PageProps) {
  const sp = await searchParams;
  const set = await getDefaultAssumptionSet();

  if (!set.ok) {
    return <BlockingDefaultSetError message={set.message} />;
  }

  const supabase = createServerSupabase();
  const { data: rows, error } = await supabase
    .from("assumption_fertilizer_factor")
    .select(
      `
      fertilizer_id,
      kg_co2e_per_kg_product,
      kg_co2e_per_l_product,
      fertilizers ( label, application_unit )
    `,
    )
    .eq("assumption_set_id", set.id)
    .order("fertilizer_id", { ascending: true });

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  const errMsg = typeof sp.error === "string" ? sp.error : undefined;
  const saved = sp.saved === "1";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
        Interno — fertilizantes
      </p>
      <h1 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Factores por fertilizante
      </h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Conjunto: {set.label}
      </p>

      <div className="mt-4">
        <AssumptionsNav current="fertilizers" />
      </div>

      {saved ? (
        <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          Cambios guardados.
        </p>
      ) : null}
      {errMsg ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {errMsg}
        </p>
      ) : null}

      <form action={saveFertilizerFactors} className="mt-6 space-y-4">
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900">
                <th className="px-3 py-2 font-medium">Fertilizante</th>
                <th className="px-3 py-2 font-medium">Unidad aplicación</th>
                <th className="px-3 py-2 font-medium">Intensidad (CO₂e)</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((row) => {
                const f = unwrapFert(row.fertilizers);
                const unit = f?.application_unit === "l_ha" ? "l_ha" : "kg_ha";
                const current =
                  unit === "l_ha"
                    ? row.kg_co2e_per_l_product
                    : row.kg_co2e_per_kg_product;
                const colLabel =
                  unit === "l_ha"
                    ? "kg CO₂e / L producto"
                    : "kg CO₂e / kg producto";
                return (
                  <tr
                    key={Number(row.fertilizer_id)}
                    className="border-b border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="px-3 py-2">
                      {f?.label ?? `id ${row.fertilizer_id}`}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{unit}</td>
                    <td className="px-3 py-2">
                      <span className="sr-only">{colLabel}</span>
                      <input
                        name={`v_${Number(row.fertilizer_id)}`}
                        type="number"
                        min={0}
                        step="any"
                        required
                        defaultValue={
                          current != null ? String(current) : "0"
                        }
                        className="w-full max-w-[12rem] rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-950"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          Guardar
        </button>
      </form>

      <p className="mt-8 text-sm">
        <Link
          href="/internal/assumptions"
          className="text-neutral-600 underline dark:text-neutral-400"
        >
          ← Índice supuestos
        </Link>
      </p>
    </div>
  );
}
