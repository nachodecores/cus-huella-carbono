import Link from "next/link";

export type SubmissionListItem = {
  id: string;
  season_type: "primavera" | "otono";
  season_year: number;
  status: "draft" | "submitted";
  updated_at: string;
  crops: { label: string } | null;
};

type SubmissionsListProps = {
  token: string;
  companyName: string;
  submissions: SubmissionListItem[];
};

function seasonLabel(st: "primavera" | "otono") {
  return st === "primavera" ? "Primavera" : "Otoño";
}

function statusLabel(s: "draft" | "submitted") {
  return s === "draft" ? "Borrador" : "Enviado";
}

export function SubmissionsList({
  token,
  companyName,
  submissions,
}: SubmissionsListProps) {
  const base = `/e/${encodeURIComponent(token)}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {companyName}
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Listado de cultivos
        </p>
      </header>

      {submissions.length === 0 ? (
        <p className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-400">
          Todavía no hay envíos. Creá el primero con el botón de abajo.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
              <tr>
                <th className="px-3 py-2 font-medium text-neutral-700 dark:text-neutral-300">
                  Cultivo
                </th>
                <th className="px-3 py-2 font-medium text-neutral-700 dark:text-neutral-300">
                  Temporada
                </th>
                <th className="px-3 py-2 font-medium text-neutral-700 dark:text-neutral-300">
                  Año
                </th>
                <th className="px-3 py-2 font-medium text-neutral-700 dark:text-neutral-300">
                  Estado
                </th>
                <th className="px-3 py-2 text-right font-medium text-neutral-700 dark:text-neutral-300">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => {
                const href =
                  row.status === "draft"
                    ? `${base}/s/${row.id}/edit`
                    : `${base}/s/${row.id}`;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/80"
                  >
                    <td className="px-3 py-2 text-neutral-900 dark:text-neutral-100">
                      {row.crops?.label ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-neutral-800 dark:text-neutral-200">
                      {seasonLabel(row.season_type)}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-neutral-800 dark:text-neutral-200">
                      {row.season_year}
                    </td>
                    <td className="px-3 py-2 text-neutral-800 dark:text-neutral-200">
                      {statusLabel(row.status)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={href}
                        className="font-medium text-neutral-900 underline hover:no-underline dark:text-neutral-100"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6">
        <Link
          href={`${base}/new`}
          className="inline-flex rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
        >
          Nuevo cultivo
        </Link>
      </p>
    </div>
  );
}
