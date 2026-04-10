"use client";

import { useState, useTransition } from "react";
import { submitFinalQuestionnaire } from "@/lib/external/submit-final-actions";

type ReviewSubmitButtonProps = {
  token: string;
  submissionId: string;
};

export function ReviewSubmitButton({
  token,
  submissionId,
}: ReviewSubmitButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mx-auto max-w-2xl space-y-3 px-4 pb-10">
      {error ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={isPending}
        className="inline-flex rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await submitFinalQuestionnaire(token, submissionId);
            if (result && "error" in result) {
              setError(result.error);
            }
          });
        }}
      >
        {isPending ? "Enviando…" : "Enviar definitivamente"}
      </button>
      <p className="text-xs text-neutral-500 dark:text-neutral-500">
        Luego del envío no podrás editar desde este enlace.
      </p>
    </div>
  );
}
