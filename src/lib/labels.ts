import type {
  DryerEnergySourceValue,
  HarvestMainMethodValue,
} from "@/lib/external/draft-save-validation";

export function seasonTypeLabel(s: "primavera" | "otono") {
  return s === "primavera" ? "Primavera" : "Otoño";
}

export function yn(v: boolean) {
  return v ? "Sí" : "No";
}

export function harvestMethodLabel(m: HarvestMainMethodValue): string {
  if (m === "corte_hilerado") return "Corte e hilerado previo";
  if (m === "directa") return "Cosecha directa";
  return String(m);
}

export function dryerEnergyLabel(
  m: DryerEnergySourceValue | null | undefined,
): string {
  if (!m) return "—";
  const map: Record<string, string> = {
    gas: "Gas",
    gasoil: "Gasoil",
    electricidad: "Electricidad",
  };
  return map[m] ?? m;
}

export type FertilizerCatalogUnit = "kg_ha" | "l_ha";

export function rateUnitLabel(u: FertilizerCatalogUnit) {
  return u === "l_ha" ? "L/ha" : "kg/ha";
}

export function totalMassUnitLabel(u: FertilizerCatalogUnit) {
  return u === "l_ha" ? "L" : "kg";
}
