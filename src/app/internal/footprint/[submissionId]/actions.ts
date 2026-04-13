"use server";

import { revalidatePath } from "next/cache";
import { calculateAndPersistSubmissionFootprint } from "@/lib/calculations/footprint";

export type InternalFootprintRunState =
  | null
  | { ok: true }
  | { ok: false; error: string };

export async function runInternalFootprintCalculation(
  _prev: InternalFootprintRunState,
  formData: FormData,
): Promise<InternalFootprintRunState> {
  const raw = formData.get("submissionId");
  const submissionId = typeof raw === "string" ? raw.trim() : "";
  if (!submissionId) {
    return { ok: false, error: "Falta submissionId." };
  }

  const result = await calculateAndPersistSubmissionFootprint(submissionId);
  revalidatePath(`/internal/footprint/${submissionId}`);

  if (result.ok) {
    return { ok: true };
  }
  return { ok: false, error: result.error };
}
