import { createServerSupabase } from "@/lib/supabase/server";

export type DefaultAssumptionSetResult =
  | { ok: true; id: string; label: string }
  | { ok: false; message: string };

/**
 * Resolves the single active default assumption set (`is_default = true`).
 * Expects exactly one row; otherwise returns a blocking error message.
 */
export async function getDefaultAssumptionSet(): Promise<DefaultAssumptionSetResult> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("assumption_set")
    .select("id, label")
    .eq("is_default", true);

  if (error) {
    return { ok: false, message: error.message };
  }
  if (!data?.length) {
    return {
      ok: false,
      message:
        "No hay ningún conjunto de supuestos marcado como predeterminado (is_default).",
    };
  }
  if (data.length > 1) {
    return {
      ok: false,
      message:
        "Hay más de un conjunto predeterminado; la base de datos debe tener exactamente uno con is_default = true.",
    };
  }

  const row = data[0];
  return {
    ok: true,
    id: row.id as string,
    label: String(row.label ?? ""),
  };
}
