import { createServerSupabase } from "@/lib/supabase/server";

export type ResolvedCompany = {
  id: string;
  name: string;
};

/**
 * Looks up a company by `companies.access_token`. Returns null if invalid.
 */
export async function resolveCompanyByToken(
  token: string,
): Promise<ResolvedCompany | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .eq("access_token", token)
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id, name: data.name };
}
