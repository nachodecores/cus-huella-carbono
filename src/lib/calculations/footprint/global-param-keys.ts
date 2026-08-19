/**
 * Must match `assumption_set_global.param_key` seed values and admin allowlist.
 */
export const GLOBAL_PARAM_KEYS = {
  dieselKgCo2ePerL: "diesel_kg_co2e_per_l",
  /** Diesel L/ha for one implicit sowing pass (not a tillage_tools row). */
  sowingDieselLitersPerHa: "sowing_diesel_liters_per_ha",
  fallowPassKgCo2ePerHaPerPass: "fallow_pass_kg_co2e_per_ha_per_pass",
  herbicidePassKgCo2ePerHaPerPass: "herbicide_pass_kg_co2e_per_ha_per_pass",
  fungicidePassKgCo2ePerHaPerPass: "fungicide_pass_kg_co2e_per_ha_per_pass",
  insecticidePassKgCo2ePerHaPerPass: "insecticide_pass_kg_co2e_per_ha_per_pass",
  inoculantKgCo2ePerKgCleanSeedIfUsed:
    "inoculant_kg_co2e_per_kg_clean_seed_if_used",
  seedTreatmentKgCo2ePerKgCleanSeedIfUsed:
    "seed_treatment_kg_co2e_per_kg_clean_seed_if_used",
  harvestDirectaKgCo2ePerKgCleanSeed:
    "harvest_directa_kg_co2e_per_kg_clean_seed",
  harvestCorteHileradoKgCo2ePerKgCleanSeed:
    "harvest_corte_hilerado_kg_co2e_per_kg_clean_seed",
  dryingGasKgCo2ePerKgCleanSeed: "drying_gas_kg_co2e_per_kg_clean_seed",
  dryingGasoilKgCo2ePerKgCleanSeed: "drying_gasoil_kg_co2e_per_kg_clean_seed",
  dryingElectricidadKgCo2ePerKgCleanSeed:
    "drying_electricidad_kg_co2e_per_kg_clean_seed",
  conditioningKgCo2ePerKgCleanSeedIfUsed:
    "conditioning_kg_co2e_per_kg_clean_seed_if_used",
  transportKgCo2ePerTonneKm: "transport_kg_co2e_per_tonne_km",

  // --- Suelo: N2O (IPCC 2019 Refinement, Tier 1) ---
  n2oEf1Direct: "n2o_ef1_direct",
  n2oFracGasf: "n2o_frac_gasf",
  n2oEf4Volatilization: "n2o_ef4_volatilization",
  n2oFracLeach: "n2o_frac_leach",
  n2oEf5Leaching: "n2o_ef5_leaching",
  n2oNToN2oFactor: "n2o_n_to_n2o_factor",
  n2oGwp100: "n2o_gwp100",

  // --- Suelo: carbono orgánico / cambio de uso de suelo (IPCC 2019 AFOLU) ---
  socRefTCPerHa: "soc_ref_t_c_per_ha",
  socAmortizationYears: "soc_amortization_years",
  socFluSustentable: "soc_flu_sustentable",
  socFmgSustentable: "soc_fmg_sustentable",
  socFiSustentable: "soc_fi_sustentable",
  socFluIntermedio: "soc_flu_intermedio",
  socFmgIntermedio: "soc_fmg_intermedio",
  socFiIntermedio: "soc_fi_intermedio",
  socFluDegradante: "soc_flu_degradante",
  socFmgDegradante: "soc_fmg_degradante",
  socFiDegradante: "soc_fi_degradante",
} as const;
