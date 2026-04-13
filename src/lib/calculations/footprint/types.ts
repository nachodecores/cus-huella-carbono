export type LineItemCategory =
  | "fallow"
  | "tillage"
  | "fertilizer"
  | "crop_protection"
  | "seed_inputs"
  | "harvest"
  | "drying"
  | "conditioning"
  | "transport"
  | "other";

/** One row to insert into `calculation_line_item`. */
export type ComputedLineItem = {
  category: LineItemCategory;
  sort_order: number;
  label: string;
  quantity: number | null;
  quantity_unit: string | null;
  emission_factor: number | null;
  emission_factor_unit: string | null;
  kg_co2e: number;
  submission_fertilizer_line_id: string | null;
  submission_tillage_line_id: string | null;
};

export type AssumptionContext = {
  assumptionSetId: string;
  globals: Map<string, number>;
  fertilizerFactors: Map<
    number,
    { kgPerKg: number | null; kgPerL: number | null }
  >;
  tillageDieselLPerHaPerPass: Map<number, number>;
};
