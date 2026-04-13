import Link from "next/link";
import { getDefaultAssumptionSet } from "@/app/internal/assumptions/_lib/default-assumption-set";

export const dynamic = "force-dynamic";
import { AssumptionsNav } from "@/app/internal/assumptions/_components/assumptions-nav";
import { BlockingDefaultSetError } from "@/app/internal/assumptions/_components/blocking-default-set-error";

export default async function InternalAssumptionsIndexPage() {
  const set = await getDefaultAssumptionSet();

  if (!set.ok) {
    return <BlockingDefaultSetError message={set.message} />;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
        Interno — sin protección de acceso
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Supuestos de huella
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Conjunto activo: <strong>{set.label}</strong>
      </p>

      <div className="mt-6">
        <AssumptionsNav current="home" />
      </div>

      <ul className="mt-6 list-inside list-disc space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
        <li>
          <Link
            href="/internal/assumptions/globals"
            className="text-palette-brand underline-offset-2 hover:underline"
          >
            Parámetros globales
          </Link>
        </li>
        <li>
          <Link
            href="/internal/assumptions/fertilizers"
            className="text-palette-brand underline-offset-2 hover:underline"
          >
            Factores por fertilizante
          </Link>
        </li>
        <li>
          <Link
            href="/internal/assumptions/tillage"
            className="text-palette-brand underline-offset-2 hover:underline"
          >
            Laboreo (diesel por ha y pasada)
          </Link>
        </li>
      </ul>

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
