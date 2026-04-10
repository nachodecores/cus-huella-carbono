type Option<T> = { value: T; label: string };

export type BinaryPillProps<T extends string | boolean> = {
  id: string;
  legend: string;
  value: T;
  onChange: (value: T) => void;
  optionLeft: Option<T>;
  optionRight: Option<T>;
  className?: string;
  /** "inline": leyenda y control en la misma fila (con wrap si no entra). */
  layout?: "stacked" | "inline";
};

/**
 * Two-option segmented control (pill): selected side uses palette warm-5.
 */
export function BinaryPill<T extends string | boolean>({
  id,
  legend,
  value,
  onChange,
  optionLeft,
  optionRight,
  className,
  layout = "stacked",
}: BinaryPillProps<T>) {
  const legendId = `${id}-legend`;
  const inline = layout === "inline";
  const btnBase =
    "flex-1 px-3 py-2 text-center text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-palette-brand focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-950";
  const inactive =
    "bg-white text-neutral-800 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800/80";
  const active = "bg-palette-warm-5 text-palette-white";

  return (
    <fieldset
      className={[
        className,
        inline
          ? "flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <legend
        id={legendId}
        className={[
          "text-sm font-medium text-neutral-800 dark:text-neutral-200",
          inline ? "shrink-0" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {legend}
      </legend>
      <div
        className={[
          inline
            ? "inline-flex max-w-sm shrink-0 overflow-hidden rounded-sm border border-neutral-300 shadow-sm dark:border-neutral-600"
            : "mt-2 inline-flex w-full max-w-sm overflow-hidden rounded-sm border border-neutral-300 shadow-sm dark:border-neutral-600",
        ].join(" ")}
        role="group"
        aria-labelledby={legendId}
      >
        <button
          type="button"
          aria-pressed={value === optionLeft.value}
          className={`${btnBase} border-r border-neutral-300 dark:border-neutral-600 ${
            value === optionLeft.value ? active : inactive
          }`}
          onClick={() => onChange(optionLeft.value)}
        >
          {optionLeft.label}
        </button>
        <button
          type="button"
          aria-pressed={value === optionRight.value}
          className={`${btnBase} ${
            value === optionRight.value ? active : inactive
          }`}
          onClick={() => onChange(optionRight.value)}
        >
          {optionRight.label}
        </button>
      </div>
    </fieldset>
  );
}
