import Link from "next/link";
import { AssumptionsNav } from "@/app/internal/assumptions/_components/assumptions-nav";

/**
 * Documentación del orden y las fórmulas de `computeFootprintLines`
 * (`src/lib/calculations/footprint/compute-lines.ts`). Mantener alineado con ese archivo.
 */
export default function InternalModeloHuellaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
        Interno — sin protección de acceso
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Modelo de cálculo de huella
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Orden de las líneas que se persisten en{" "}
        <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">
          calculation_line_item
        </code>{" "}
        y suma para el total de la corrida. Cada bloque condicional solo genera líneas
        cuando aplica (salvo protección del cultivo, que siempre agrega una fila
        agregada; puede dar 0 kg si no hay pasadas).
      </p>

      <div className="mt-6">
        <AssumptionsNav current="modelo" />
      </div>

      <section className="mt-8 space-y-8 text-sm text-neutral-800 dark:text-neutral-200">
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Condiciones previas
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-neutral-700 dark:text-neutral-300">
            <li>
              <strong>Superficie (ha):</strong> obligatoria, finita y &gt; 0. Si no, el
              cálculo falla antes de generar líneas.
            </li>
            <li>
              <strong>Masa de semilla limpia (kg)</strong> para intensidades “por kg de
              semilla”: si <code className="font-mono text-xs">seed_produced_kg</code>{" "}
              es finito y &gt; 0, se usa; si no,{" "}
              <code className="font-mono text-xs">area_ha × clean_yield_kg_ha</code> cuando
              ambos son válidos; si no hay masa, no se generan líneas que la requieran
              (insumos de siembra, cosecha, secado, acondicionamiento).
            </li>
            <li>
              <strong>Transporte:</strong> la masa asumida es solo{" "}
              <code className="font-mono text-xs">seed_produced_kg</code> (sin
              sustituto por rendimiento). Si falta o no es positiva, no hay línea de
              transporte aunque haya km.
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Total
          </h2>
          <p className="mt-2 font-mono text-neutral-700 dark:text-neutral-300">
            total_kg_CO₂e = Σ (kg_CO₂e de cada línea generada)
          </p>
        </div>

        <ol className="list-decimal space-y-8 pl-5 marker:font-semibold">
          <li>
            <h3 className="inline text-base font-semibold">
              Barbecho — <code className="font-mono text-xs">fallow</code>
            </h3>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Si hay barbecho con pulverización:{" "}
              <span className="font-mono whitespace-normal break-words">
                kg = area_ha × pasadas × EF_fallow_pass (kg CO₂e / ha / pasada)
              </span>
              . Supuesto global:{" "}
              <code className="text-xs">fallow_pass_kg_co2e_per_ha_per_pass</code>.
            </p>
          </li>

          <li>
            <h3 className="inline text-base font-semibold">
              Laboreo — <code className="font-mono text-xs">tillage</code>
            </h3>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              <strong>Herramientas declaradas:</strong> una línea por operación si el
              laboreo está activo. Diesel estimado:{" "}
              <span className="font-mono whitespace-normal break-words">
                L = area_ha × pasadas × (L diesel / ha / pasada)
              </span>{" "}
              (tabla por herramienta). Luego{" "}
              <span className="font-mono">kg = L × EF_diesel</span> con{" "}
              <code className="text-xs">diesel_kg_co2e_per_l</code>.
            </p>
            <p className="mt-3 text-neutral-700 dark:text-neutral-300">
              <strong>Siembra implícita (siempre):</strong> además, siempre se agrega
              una línea categoría <code className="font-mono text-xs">tillage</code>{" "}
              sin fila en el cuestionario:{" "}
              <span className="font-mono whitespace-normal break-words">
                L = area_ha × sowing_diesel_liters_per_ha
              </span>
              , luego <span className="font-mono">kg = L × EF_diesel</span>. Una sola
              operación por hectárea (no se modelan pasadas de siembra).
            </p>
          </li>

          <li>
            <h3 className="inline text-base font-semibold">
              Fertilizantes — <code className="font-mono text-xs">fertilizer</code>
            </h3>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Por línea del cuestionario:{" "}
              <span className="font-mono">kg = cantidad_total × factor</span>. El factor
              es <strong>kg CO₂e / kg producto</strong> si la aplicación es en kg/ha, o{" "}
              <strong>kg CO₂e / L producto</strong> si es en L/ha (catálogo por
              fertilizante).
            </p>
          </li>

          <li>
            <h3 className="inline text-base font-semibold">
              Protección del cultivo —{" "}
              <code className="font-mono text-xs">crop_protection</code>
            </h3>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Una sola línea agregada:{" "}
              <span className="font-mono whitespace-normal break-words">
                kg = area_ha × (pasadas_herbicida × EF_h + pasadas_fungicida × EF_f +
                pasadas_insecticida × EF_i)
              </span>
              . Claves globales:{" "}
              <code className="text-xs">herbicide_pass_kg_co2e_per_ha_per_pass</code>,{" "}
              <code className="text-xs">fungicide_pass_kg_co2e_per_ha_per_pass</code>,{" "}
              <code className="text-xs">insecticide_pass_kg_co2e_per_ha_per_pass</code>.
            </p>
          </li>

          <li>
            <h3 className="inline text-base font-semibold">
              Insumos de siembra — <code className="font-mono text-xs">seed_inputs</code>
            </h3>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Si hay masa de semilla limpia: inoculante y/o tratamiento de semilla, cada
              uno si corresponde:{" "}
              <span className="font-mono">kg = masa_kg × EF</span> (EF por kg de semilla
              limpia). Claves:{" "}
              <code className="text-xs">
                inoculant_kg_co2e_per_kg_clean_seed_if_used
              </code>
              ,{" "}
              <code className="text-xs">
                seed_treatment_kg_co2e_per_kg_clean_seed_if_used
              </code>
              .
            </p>
          </li>

          <li>
            <h3 className="inline text-base font-semibold">
              Cosecha — <code className="font-mono text-xs">harvest</code>
            </h3>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Si hay masa de semilla limpia:{" "}
              <span className="font-mono">kg = masa_kg × EF_método</span>. Método
              directa:{" "}
              <code className="text-xs">harvest_directa_kg_co2e_per_kg_clean_seed</code>
              ; corte hilerado:{" "}
              <code className="text-xs">
                harvest_corte_hilerado_kg_co2e_per_kg_clean_seed
              </code>
              .
            </p>
          </li>

          <li>
            <h3 className="inline text-base font-semibold">
              Secado — <code className="font-mono text-xs">drying</code>
            </h3>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Si hay secado y masa de semilla limpia:{" "}
              <span className="font-mono">kg = masa_kg × EF_fuente</span>. Fuente gas:{" "}
              <code className="text-xs">drying_gas_kg_co2e_per_kg_clean_seed</code>;
              gasoil:{" "}
              <code className="text-xs">drying_gasoil_kg_co2e_per_kg_clean_seed</code>;
              electricidad:{" "}
              <code className="text-xs">
                drying_electricidad_kg_co2e_per_kg_clean_seed
              </code>
              .
            </p>
          </li>

          <li>
            <h3 className="inline text-base font-semibold">
              Acondicionamiento — <code className="font-mono text-xs">conditioning</code>
            </h3>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Si aplica y hay masa de semilla limpia:{" "}
              <span className="font-mono">kg = masa_kg × EF</span> con{" "}
              <code className="text-xs">
                conditioning_kg_co2e_per_kg_clean_seed_if_used
              </code>
              .
            </p>
          </li>

          <li>
            <h3 className="inline text-base font-semibold">
              Transporte — <code className="font-mono text-xs">transport</code>
            </h3>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Si transporte activo, km válidos y{" "}
              <code className="font-mono text-xs">seed_produced_kg</code> &gt; 0:{" "}
              <span className="font-mono whitespace-normal break-words">
                t·km = (seed_produced_kg / 1000) × km
              </span>
              , luego{" "}
              <span className="font-mono">kg = t·km × EF</span> con{" "}
              <code className="text-xs">transport_kg_co2e_per_tonne_km</code>.
            </p>
          </li>
        </ol>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Implementación:{" "}
          <code className="font-mono">computeFootprintLines</code> en{" "}
          <code className="font-mono">src/lib/calculations/footprint/compute-lines.ts</code>
          . Categoría reservada <code className="font-mono">other</code> en tipos no se
          usa en este flujo.
        </p>
      </section>

      <p className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link
          href="/internal/assumptions"
          className="text-palette-brand underline-offset-2 hover:underline"
        >
          ← Supuestos de huella
        </Link>
        <Link
          href="/"
          className="text-neutral-600 underline dark:text-neutral-400"
        >
          Inicio
        </Link>
      </p>
    </div>
  );
}
