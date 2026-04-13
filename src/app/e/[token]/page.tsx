import { FormHeader } from "@/components/external/form-header";
import { InvalidToken } from "@/components/external/invalid-token";
import {
  type SubmissionListItem,
  SubmissionsList,
} from "@/components/external/submissions-list";
import { resolveCompanyByToken } from "@/lib/external/resolve-token";
import { createServerSupabase } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function ExternalHomePage({ params }: PageProps) {
  const { token } = await params;
  const company = await resolveCompanyByToken(token);

  if (!company) {
    return <InvalidToken />;
  }

  const supabase = createServerSupabase();
  const { data: rows, error } = await supabase
    .from("crop_season_submissions")
    .select(
      "id, season_type, season_year, status, updated_at, crops ( label )",
    )
    .eq("company_id", company.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudieron cargar los envíos: {error.message}
        </p>
      </div>
    );
  }

  const submissions: SubmissionListItem[] = (rows ?? []).map((row) => {
    const nested = row.crops as
      | { label: string }
      | { label: string }[]
      | null
      | undefined;
    const crop =
      nested == null
        ? null
        : Array.isArray(nested)
          ? nested[0] ?? null
          : nested;
    return {
      id: row.id,
      season_type: row.season_type,
      season_year: row.season_year,
      status: row.status,
      updated_at: row.updated_at,
      crops: crop,
    };
  });

  const pageTitle = `Calculadora de Huella de Carbono - ${company.name}`;

  return (
    <div className="relative isolate min-h-[100dvh] w-full pt-[5.75rem] sm:pt-20">
      <FormHeader title={pageTitle} />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/patronsemillas.svg')] bg-[length:480px_720px] bg-repeat opacity-15"
        aria-hidden
      />
      <SubmissionsList token={token} submissions={submissions} />
    </div>
  );
}
