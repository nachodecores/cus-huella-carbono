"use client";

import { useActionState } from "react";
import {
  recalculateAllFootprints,
  type RecalculateAllState,
} from "./actions";

export function RecalculateAllForm() {
  const [state, formAction, pending] = useActionState<
    RecalculateAllState,
    FormData
  >(recalculateAllFootprints, null);

  return (
    <div className="mb-4 space-y-2">
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {pending ? "Recalculando…" : "Recalcular todas"}
        </button>
      </form>
      {state ? (
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {state.okCount} calculadas correctamente
          {state.failCount > 0 ? `, ${state.failCount} con error` : ""}.
          {state.errors.length > 0 ? (
            <span className="block text-red-600 dark:text-red-400">
              {state.errors.join(" · ")}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
