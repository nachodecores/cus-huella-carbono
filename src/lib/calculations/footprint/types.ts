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
  | "soil_n2o"
  | "soil_carbon"
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
    {
      kgPerKg: number | null;
      kgPerL: number | null;
      /** kg N / kg or / L producto (null = sin dato de N, se trata como 0). */
      kgNPerUnit: number | null;
    }
  >;
  tillageDieselLPerHaPerPass: Map<number, number>;
};
