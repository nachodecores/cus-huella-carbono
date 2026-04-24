import Link from "next/link";
import { InvalidToken } from "@/components/external/invalid-token";
import { FormIntroShell } from "@/components/external/form-intro-shell";
import {
  type DraftSubmissionRow,
  type FertilizerLineRow,
  type TillageLineRow,
  QuestionnaireDraftForm,
} from "@/components/external/questionnaire/questionnaire-draft-form";
import { emptyNewDraftSubmissionPayload } from "@/lib/external/submission-payload-mapper";
import { resolveCompanyByToken } from "@/lib/external/resolve-token";
import { createServerSupabase } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function NewSubmissionPage({ params }: PageProps) {
  const { token } = await params;
  const company = await resolveCompanyByToken(token);

  if (!company) {
    return <InvalidToken />;
  }

  const supabase = createServerSupabase();

  const { data: crops, error: cropsErr } = await supabase
    .from("crops")
    .select("id, label")
    .order("id");

  if (cropsErr) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudo cargar el catálogo de cultivos: {cropsErr.message}
        </p>
      </div>
    );
  }

  if (!crops?.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          No hay cultivos en el catálogo. Cargá el seed en Supabase e intentá de
          nuevo.
        </p>
        <p className="mt-4">
          <Link
            href={`/e/${encodeURIComponent(token)}`}
            className="text-sm text-neutral-600 underline dark:text-neutral-400"
          >
            ← Listado
          </Link>
        </p>
      </div>
    );
  }

  const { data: fertRows, error: fertError } = await supabase
    .from("fertilizers")
    .select("id, label, application_unit")
    .order("id");

  if (fertError || !fertRows?.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudo cargar el catálogo de fertilizantes.
        </p>
      </div>
    );
  }

  const { data: tillageToolRows, error: tillageToolsError } = await supabase
    .from("tillage_tools")
    .select("id, code, label")
    .order("id");

  if (tillageToolsError || !tillageToolRows?.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudo cargar el catálogo de laboreo.
        </p>
      </div>
    );
  }

  const basePath = `/e/${encodeURIComponent(token)}`;
  const initialSubmission: DraftSubmissionRow = {
    id: "__new__",
    ...emptyNewDraftSubmissionPayload(),
  };

  const headerTitle = `Calculadora de Huella de Carbono - ${company.name}`;

  return (
    <FormIntroShell headerTitle={headerTitle}>
      <QuestionnaireDraftForm
        mode="create"
        token={token}
        companyName={company.name}
        basePath={basePath}
        headingTitle="Calculadora de Huella de Carbono"
        cropOptions={crops}
        initialSubmission={initialSubmission}
        initialFertilizerLines={[] as FertilizerLineRow[]}
        initialTillageLines={[] as TillageLineRow[]}
        fertilizerCatalog={fertRows}
        tillageToolCatalog={tillageToolRows}
      />
    </FormIntroShell>
  );
}
