"use client";

import { useActionState } from "react";
import {
  runInternalFootprintCalculation,
  type InternalFootprintRunState,
} from "./actions";

type Props = {
  submissionId: string;
  canRun: boolean;
};

export function RunCalculationForm({ submissionId, canRun }: Props) {
  const [state, formAction, pending] = useActionState<
    InternalFootprintRunState,
    FormData
  >(runInternalFootprintCalculation, null);

  return (
    <div className="mt-6 space-y-3">
      {state?.ok === false ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      {state?.ok === true ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          Cálculo guardado. Resultado actualizado abajo.
        </p>
      ) : null}
      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="submissionId" value={submissionId} />
        <button
          type="submit"
          disabled={!canRun || pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {pending ? "Calculando…" : "Ejecutar cálculo"}
        </button>
        {!canRun ? (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Solo disponible si el envío está en estado enviado (submitted).
          </span>
        ) : null}
      </form>
    </div>
  );
}
