export { GLOBAL_PARAM_KEYS } from "@/lib/calculations/footprint/global-param-keys";
export type {
  AssumptionContext,
  ComputedLineItem,
  LineItemCategory,
} from "@/lib/calculations/footprint/types";
export { loadDefaultAssumptionContext } from "@/lib/calculations/footprint/load-assumptions";
export type { LoadAssumptionsResult } from "@/lib/calculations/footprint/load-assumptions";
export {
  computeFootprintLines,
  cleanSeedMassKg,
  transportAssumedMassKg,
} from "@/lib/calculations/footprint/compute-lines";
export type { SubmissionRow, ComputeInput } from "@/lib/calculations/footprint/compute-lines";
export { mapRowToSubmissionFootprintInput } from "@/lib/calculations/footprint/map-submission-row";
export {
  calculateAndPersistSubmissionFootprint,
  type RunFootprintResult,
} from "@/lib/calculations/footprint/run-calculation";
