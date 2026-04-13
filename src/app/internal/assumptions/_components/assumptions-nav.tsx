import Link from "next/link";

const linkClass =
  "text-sm text-neutral-600 underline-offset-2 hover:underline dark:text-neutral-400";

export function AssumptionsNav({ current }: { current: "home" | "globals" | "fertilizers" | "tillage" }) {
  return (
    <nav className="flex flex-wrap gap-x-4 gap-y-1 border-b border-neutral-200 pb-3 dark:border-neutral-700">
      <Link href="/internal/assumptions" className={linkClass}>
        {current === "home" ? "· Índice" : "Índice"}
      </Link>
      <Link href="/internal/assumptions/globals" className={linkClass}>
        {current === "globals" ? "· Globales" : "Globales"}
      </Link>
      <Link href="/internal/assumptions/fertilizers" className={linkClass}>
        {current === "fertilizers" ? "· Fertilizantes" : "Fertilizantes"}
      </Link>
      <Link href="/internal/assumptions/tillage" className={linkClass}>
        {current === "tillage" ? "· Laboreo" : "Laboreo"}
      </Link>
    </nav>
  );
}
