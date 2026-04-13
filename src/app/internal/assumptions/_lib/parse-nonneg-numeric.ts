/**
 * Parses a form string into a finite number >= 0, or null if invalid.
 */
export function parseNonNegNumeric(raw: unknown): number | null {
  if (raw == null) return null;
  const s = typeof raw === "string" ? raw.trim() : String(raw);
  if (s === "") return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}
