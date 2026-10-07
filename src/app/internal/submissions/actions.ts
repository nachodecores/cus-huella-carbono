"use server";

import { revalidatePath } from "next/cache";
import { calculateAndPersistSubmissionFootprint } from "@/lib/calculations/footprint";
import { createServerSupabase } from "@/lib/supabase/server";

export type RecalculateAllState =
  | null
  | { ok: true; okCount: number; failCount: number; errors: string[] };

export async function recalculateAllFootprints(
  _prev: RecalculateAllState,
  _formData: FormData,
): Promise<RecalculateAllState> {
  const supabase = createServerSupabase();

  const { data: subs, error } = await supabase
    .from("crop_season_submissions")
    .select("id")
    .eq("status", "submitted");

  if (error) {
    return { ok: true, okCount: 0, failCount: 0, errors: [error.message] };
  }

  let okCount = 0;
  let failCount = 0;
  const errors: string[] = [];

  for (const row of subs ?? []) {
    const result = await calculateAndPersistSubmissionFootprint(
      row.id as string,
    );
    if (result.ok) {
      okCount++;
    } else {
      failCount++;
      errors.push(`${row.id}: ${result.error}`);
    }
  }

  revalidatePath("/internal/submissions");
  return { ok: true, okCount, failCount, errors };
}
