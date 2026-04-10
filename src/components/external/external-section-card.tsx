import type { ReactNode } from "react";

/**
 * Card shell for external questionnaire / review: brand header + body slot.
 */
export function ExternalSectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950/40">
      <h2 className="bg-palette-brand px-4 py-3 text-base font-semibold text-palette-white">
        {title}
      </h2>
      {children}
    </section>
  );
}
