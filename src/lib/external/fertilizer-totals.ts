/** Server-side: total = rate × ha (same physical unit as rate: kg or L). */
export function computeTotalFertilizerQuantity(
  applicationRatePerHa: number,
  areaCultivatedHa: number,
): number {
  const raw = applicationRatePerHa * areaCultivatedHa;
  return Math.round(raw * 1000) / 1000;
}

/** Server-side: semilla producida (kg) = ha × rendimiento limpio (kg/ha). */
export function computeSeedProducedKg(
  areaCultivatedHa: number,
  cleanYieldKgHa: number,
): number {
  const raw = areaCultivatedHa * cleanYieldKgHa;
  return Math.round(raw * 1000) / 1000;
}
