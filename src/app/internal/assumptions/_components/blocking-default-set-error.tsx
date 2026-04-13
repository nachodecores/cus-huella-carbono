import Link from "next/link";

export function BlockingDefaultSetError({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
        Interno — editor de supuestos
      </p>
      <h1 className="mt-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        No se puede continuar
      </h1>
      <p className="mt-3 text-sm text-red-600 dark:text-red-400">{message}</p>
      <p className="mt-6 text-sm">
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
