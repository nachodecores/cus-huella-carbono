-- MVP v1 seed: crops, fertilizers, companies (dummy access tokens for dev).
-- Does not seed `crop_season_submissions`. When inserting rows there, set
-- `fertilizers_used` and keep it consistent with `submission_fertilizer_lines`
-- (false + zero lines, or true + ≥1 valid line).

INSERT INTO crops (id, label) VALUES
  (1, 'Raigrás anual'),
  (2, 'Festuca'),
  (3, 'Lotus'),
  (4, 'Trébol Rojo'),
  (5, 'Arroz'),
  (6, 'Soja'),
  (7, 'Maíz'),
  (8, 'Achicoria'),
  (9, 'Sorgo'),
  (10, 'Vicia'),
  (11, 'Moha'),
  (12, 'Alfalfa'),
  (13, 'Sudán'),
  (14, 'Raigrás perenne')
ON CONFLICT (id) DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('crops', 'id'),
  COALESCE((SELECT MAX(id) FROM crops), 1)
);

INSERT INTO fertilizers (id, label, application_unit) VALUES
  (1, 'Urea', 'kg_ha'),
  (2, 'DAP (fosfato diamónico)', 'kg_ha'),
  (3, 'MAP (fosfato monoamónico)', 'kg_ha'),
  (4, 'Superfosfato simple', 'kg_ha'),
  (5, 'Superfosfato triple', 'kg_ha'),
  (6, 'Cloruro de potasio', 'kg_ha'),
  (7, 'Sulfato de amonio', 'kg_ha'),
  (8, 'Nitrato de amonio', 'kg_ha'),
  (9, 'Mezcla NPK (fórmula comercial)', 'kg_ha'),
  (10, 'Fertilizante líquido', 'l_ha'),
  (11, 'Cal agrícola / enmienda calcárea', 'kg_ha'),
  (12, 'Bio-fertilizante', 'l_ha')
ON CONFLICT (id) DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('fertilizers', 'id'),
  COALESCE((SELECT MAX(id) FROM fertilizers), 1)
);

INSERT INTO tillage_tools (code, label, diesel_liters_per_ha_per_pass) VALUES
  ('subsolador', 'Subsolador', NULL),
  ('excentrica', 'Excéntrica', NULL),
  ('disquera', 'Disquera', NULL),
  ('rastra_liviana', 'Rastra liviana', NULL),
  ('rastra_dientes', 'Rastra de dientes', NULL)
ON CONFLICT (code) DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('tillage_tools', 'id'),
  COALESCE((SELECT MAX(id) FROM tillage_tools), 1)
);

INSERT INTO companies (id, name, access_token) VALUES
  (
    'a1000000-0000-4000-8000-000000000001',
    'Agrofuturo',
    'prod_agrofuturo_b58b803d938dfdb668872b838ab0e7f7'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'Gentos',
    'prod_gentos_46d2ac7bd10df4eb6fcf040f11f26cbf'
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'Procampo',
    'prod_procampo_92e2cad20fa5dbcb0bda7ff7f5933eaf'
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    'DLF',
    'prod_dlf_85e6ec1e16d867b150a60ff94ad890a4'
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    'Virö',
    'prod_viro_b68f0df78ab8c45ed3809f087e62eea0'
  ),
  (
    'a1000000-0000-4000-8000-000000000006',
    'DMK Semillas',
    'prod_dmk_semillas_a54525bd1cf1f7c06706e7c402e1c06f'
  ),
  (
    'a1000000-0000-4000-8000-000000000007',
    'Calvase',
    'prod_calvase_e8eac1d4d41b48c79dee47a679830e86'
  ),
  (
    'a1000000-0000-4000-8000-000000000008',
    'Fadisol',
    'prod_fadisol_c4e0ad585f1c642c9aa43998a0825c03'
  ),
  (
    'a1000000-0000-4000-8000-000000000009',
    'Germinar',
    'prod_germinar_1dd9ab0ec38c0561a1e6e30e9a7bfad9'
  ),
  (
    'a1000000-0000-4000-8000-00000000000a',
    'Ricetec',
    'prod_ricetec_141d7f7b39a81d52a04a5cb89b3c5efd'
  ),
  (
    'a1000000-0000-4000-8000-00000000000b',
    'Dambo',
    'prod_dambo_24231129cd06837b09983412ea3a10ca'
  ),
  (
    'a1000000-0000-4000-8000-00000000000c',
    'Saman',
    'prod_saman_71175fa0f89d2791e2f383625bff8ea9'
  ),
  (
    'a1000000-0000-4000-8000-00000000000d',
    'Agroterra (Reylan)',
    'prod_agroterra_a22a3dc995b5b04af85750608ea38891'
  ),
  (
    'a1000000-0000-4000-8000-00000000000e',
    'Satus-Ager',
    'prod_satus_ager_3c543c9d903324644ed03cc453d44216'
  ),
  (
    'a1000000-0000-4000-8000-00000000000f',
    'Erro',
    'prod_erro_8a768a726686bfd5f80ee485b7b664d4'
  ),
  (
    'a1000000-0000-4000-8000-000000000010',
    'Bayer',
    'prod_bayer_dfa0df417b4cf7cea27446a7bc754a9c'
  ),
  (
    'a1000000-0000-4000-8000-000000000011',
    'Syngenta',
    'prod_syngenta_297e6d6a0cfd4658d1dada5703ed250e'
  ),
  (
    'a1000000-0000-4000-8000-000000000012',
    'Corteva',
    'prod_corteva_5cec48dc2ed2c2d5f6de39b8edb6dd01'
  ),
  (
    'a1000000-0000-4000-8000-000000000013',
    'Prueba (interno)',
    'test_prueba_b9a3b6994461855c1f4911113a00e67d'
  ),
  (
    'a1000000-0000-4000-8000-000000000014',
    'Nufarm',
    'prod_nufarm_8eb4cabc95b9350bd197c6e0e6053b37'
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Carbon MVP: default assumption set + emission factors, sourced from two
-- reference spreadsheets (IPCC/DEFRA/MIEM/INIA factors) plus documented
-- default assumptions where the spreadsheets had no directly usable value
-- (per-pass diesel/product doses, tillage tool fuel use, harvest/drying/
-- conditioning intensity per kg clean seed, SOCref). See
-- src/app/internal/modelo-huella for the full formula writeup and each
-- row's `notes` for [fuente] vs [supuesto].
-- Depends on: fertilizers, tillage_tools (seeded above).
-- ---------------------------------------------------------------------------

INSERT INTO assumption_set (id, label, is_default, notes)
VALUES (
  'a2000000-0000-4000-8000-000000000001'::uuid,
  'MVP default',
  true,
  'Factores sembrados desde planillas IPCC/DEFRA/MIEM/INIA + supuestos documentados (ver notes por fila). Validar sobre todo herramientas de laboreo y SOCref con datos locales.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO assumption_set_global (
  assumption_set_id,
  param_key,
  value_numeric,
  unit,
  notes,
  display_order
)
VALUES
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'diesel_kg_co2e_per_l',
    2.68,
    'kg_co2e_per_l',
    '[fuente] IPCC (2006) Vol.2 Energy — gasoil combustión.',
    1
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'fallow_pass_kg_co2e_per_ha_per_pass',
    33.5,
    'kg_co2e_per_ha_per_pass',
    '[supuesto] diesel pulverizadora (2 L/ha × 2.68) + glifosato (2.5 L/ha × 11.27 kg CO2e/L, dato de planilla).',
    2
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'herbicide_pass_kg_co2e_per_ha_per_pass',
    21.4,
    'kg_co2e_per_ha_per_pass',
    '[supuesto] diesel (2 L/ha × 2.68) + herbicida promedio de planilla (2 L/ha × 8 kg CO2e/L).',
    3
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'fungicide_pass_kg_co2e_per_ha_per_pass',
    9.9,
    'kg_co2e_per_ha_per_pass',
    '[supuesto] diesel (2 L/ha × 2.68) + fungicida promedio de planilla (0.75 L/ha × 6 kg CO2e/kg).',
    4
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'insecticide_pass_kg_co2e_per_ha_per_pass',
    9.4,
    'kg_co2e_per_ha_per_pass',
    '[supuesto] diesel (2 L/ha × 2.68) + cipermetrina (0.4 L/ha × 10 kg CO2e/L, único dato de planilla).',
    5
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'inoculant_kg_co2e_per_kg_clean_seed_if_used',
    0.02,
    'kg_co2e_per_kg_clean_seed',
    '[supuesto] insumo biológico, bajo impacto estimado.',
    6
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'seed_treatment_kg_co2e_per_kg_clean_seed_if_used',
    0.15,
    'kg_co2e_per_kg_clean_seed',
    '[supuesto] recubrimiento fungicida/insecticida de semilla, dosis baja por kg.',
    7
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'harvest_directa_kg_co2e_per_kg_clean_seed',
    0.02,
    'kg_co2e_per_kg_clean_seed',
    '[supuesto] diesel cosechadora (15 L/ha × 2.68) ÷ rendimiento representativo (2000 kg/ha).',
    8
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'harvest_corte_hilerado_kg_co2e_per_kg_clean_seed',
    0.027,
    'kg_co2e_per_kg_clean_seed',
    '[supuesto] diesel 2 pasadas (20 L/ha × 2.68) ÷ rendimiento representativo (2000 kg/ha).',
    9
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'drying_gas_kg_co2e_per_kg_clean_seed',
    0.02,
    'kg_co2e_per_kg_clean_seed',
    '[supuesto] 0.6 kg CO2e/kg agua evaporada (planilla) × 0.06 kg agua/kg semilla, escalado GLP/gasoil (1.51/2.68).',
    10
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'drying_gasoil_kg_co2e_per_kg_clean_seed',
    0.036,
    'kg_co2e_per_kg_clean_seed',
    '[supuesto] 0.6 kg CO2e/kg agua evaporada (planilla) × 0.06 kg agua/kg semilla.',
    11
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'drying_electricidad_kg_co2e_per_kg_clean_seed',
    0.0004,
    'kg_co2e_per_kg_clean_seed',
    '[supuesto] mismo cálculo escalado a electricidad Uruguay (0.03 kg CO2e/kWh, planilla).',
    12
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'conditioning_kg_co2e_per_kg_clean_seed_if_used',
    0.0006,
    'kg_co2e_per_kg_clean_seed',
    '[supuesto] electricidad de limpieza/zarandeo, bajo consumo estimado.',
    13
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'transport_kg_co2e_per_tonne_km',
    0.09,
    'kg_co2e_per_tonne_km',
    '[fuente] DEFRA (2023) — camión carga carretera promedio. Masa de transporte: seed_produced_kg en la app.',
    14
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'sowing_diesel_liters_per_ha',
    5,
    'L_per_ha',
    '[supuesto] siembra mecánica, 1 pasada.',
    15
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'n2o_ef1_direct',
    0.01,
    'kg_N2O_N_per_kg_N',
    '[fuente] IPCC (2019 Refinement) AFOLU Cap.11 Tabla 11.1 — EF1, emisión directa.',
    16
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'n2o_frac_gasf',
    0.11,
    'kg_N_per_kg_N',
    '[fuente] IPCC (2019 Refinement) AFOLU Cap.11 Tabla 11.3 — FracGASF, N volatilizado.',
    17
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'n2o_ef4_volatilization',
    0.01,
    'kg_N2O_N_per_kg_N',
    '[fuente] IPCC (2019 Refinement) AFOLU Cap.11 Tabla 11.3 — EF4, indirecta por volatilización.',
    18
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'n2o_frac_leach',
    0.24,
    'kg_N_per_kg_N',
    '[fuente] IPCC (2019 Refinement) AFOLU Cap.11 Tabla 11.3 — FracLEACH, N lixiviado.',
    19
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'n2o_ef5_leaching',
    0.011,
    'kg_N2O_N_per_kg_N',
    '[fuente] IPCC (2019 Refinement) AFOLU Cap.11 Tabla 11.3 — EF5, indirecta por lixiviación.',
    20
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'n2o_n_to_n2o_factor',
    1.571,
    'ratio',
    '[fuente] IPCC AFOLU — conversión N2O-N a N2O (44/28).',
    21
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'n2o_gwp100',
    273,
    'kg_co2e_per_kg_n2o',
    '[fuente] IPCC (2021) AR6 — GWP100 de N2O.',
    22
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'soc_ref_t_c_per_ha',
    64,
    't_C_per_ha',
    '[supuesto] único valor de ejemplo en la planilla; reemplazar por dato específico de suelo/clima de Uruguay antes de confiar en los resultados agregados.',
    23
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'soc_amortization_years',
    20,
    'years',
    '[fuente] IPCC (2019 Refinement) AFOLU — amortización default a 20 años.',
    24
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'soc_flu_sustentable',
    0.95,
    'dimensionless',
    '[fuente] planilla SOC — tabla "Tipo de manejo", manejo sustentable.',
    25
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'soc_fmg_sustentable',
    1.1,
    'dimensionless',
    '[fuente] planilla SOC — tabla "Tipo de manejo", manejo sustentable.',
    26
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'soc_fi_sustentable',
    1.1,
    'dimensionless',
    '[fuente] planilla SOC — tabla "Tipo de manejo", manejo sustentable.',
    27
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'soc_flu_intermedio',
    0.8,
    'dimensionless',
    '[fuente] planilla SOC — tabla "Tipo de manejo", manejo intermedio.',
    28
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'soc_fmg_intermedio',
    0.95,
    'dimensionless',
    '[fuente] planilla SOC — tabla "Tipo de manejo", manejo intermedio.',
    29
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'soc_fi_intermedio',
    1,
    'dimensionless',
    '[fuente] planilla SOC — tabla "Tipo de manejo", manejo intermedio.',
    30
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'soc_flu_degradante',
    0.8,
    'dimensionless',
    '[fuente] planilla SOC — tabla "Tipo de manejo", manejo degradante.',
    31
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'soc_fmg_degradante',
    0.8,
    'dimensionless',
    '[fuente] planilla SOC — tabla "Tipo de manejo", manejo degradante.',
    32
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'soc_fi_degradante',
    0.9,
    'dimensionless',
    '[fuente] planilla SOC — tabla "Tipo de manejo", manejo degradante.',
    33
  )
ON CONFLICT (assumption_set_id, param_key) DO NOTHING;

-- Factores CO2e [fuente]: Becoña et al. 2020 (INIA 2022), salvo superfosfato
-- triple (Wood & Cowie 2004), cloruro de potasio (Brentrup 2018 vía 4C
-- Services), fertilizante líquido (Wood & Cowie 2004), cal agrícola (IPCC
-- 2006 Vol.4 Cap.11). Bio-fertilizante [supuesto], sin dato en planilla.
-- Contenido de N (kg N / unidad) [fuente]: composición estándar de cada
-- producto, salvo mezcla NPK y bio-fertilizante [supuesto] (ver notes).
INSERT INTO assumption_fertilizer_factor (
  assumption_set_id,
  fertilizer_id,
  kg_co2e_per_kg_product,
  kg_co2e_per_l_product,
  kg_n_per_unit_product,
  notes
)
SELECT
  'a2000000-0000-4000-8000-000000000001'::uuid,
  f.id,
  CASE
    WHEN f.application_unit = 'kg_ha' THEN
      CASE f.id
        WHEN 1 THEN 0.79   -- Urea
        WHEN 2 THEN 0.79   -- DAP
        WHEN 3 THEN 0.05   -- MAP
        WHEN 4 THEN 0.37   -- Superfosfato simple
        WHEN 5 THEN 0.52   -- Superfosfato triple
        WHEN 6 THEN 0.15   -- Cloruro de potasio
        WHEN 7 THEN 0.65   -- Sulfato de amonio
        WHEN 8 THEN 2.37   -- Nitrato de amonio
        WHEN 9 THEN 0.79   -- Mezcla NPK
        WHEN 11 THEN 0.44  -- Cal agrícola (caliza)
        ELSE 0
      END
    ELSE NULL
  END,
  CASE
    WHEN f.application_unit = 'l_ha' THEN
      CASE f.id
        WHEN 10 THEN 1.50  -- Fertilizante líquido (UAN)
        WHEN 12 THEN 0.05  -- Bio-fertilizante [supuesto]
        ELSE 0
      END
    ELSE NULL
  END,
  CASE f.id
    WHEN 1 THEN 0.46   -- Urea, 46% N
    WHEN 2 THEN 0.18   -- DAP, 18% N
    WHEN 3 THEN 0.11   -- MAP, 11% N
    WHEN 4 THEN 0      -- Superfosfato simple, sin N
    WHEN 5 THEN 0      -- Superfosfato triple, sin N
    WHEN 6 THEN 0      -- Cloruro de potasio, sin N
    WHEN 7 THEN 0.21   -- Sulfato de amonio, 21% N
    WHEN 8 THEN 0.34   -- Nitrato de amonio, 34% N
    WHEN 9 THEN 0.15   -- Mezcla NPK [supuesto] blend representativo
    WHEN 10 THEN 0.32  -- Fertilizante líquido (UAN), 32% N
    WHEN 11 THEN 0     -- Cal agrícola, sin N
    WHEN 12 THEN 0     -- Bio-fertilizante [supuesto], sin N
    ELSE 0
  END,
  'Ver notes de assumption_set — [fuente] Becoña et al. 2020/INIA 2022 salvo excepciones documentadas; %N por composición estándar del producto.'
FROM fertilizers f
ON CONFLICT (assumption_set_id, fertilizer_id) DO NOTHING;

-- Diesel L/ha/pasada [supuesto]: no están en ninguna planilla; ballpark de
-- consumo de combustible por tipo de implemento. Mayor punto de
-- incertidumbre del modelo — validar cuanto antes con datos locales.
INSERT INTO assumption_tillage_tool_factor (
  assumption_set_id,
  tillage_tool_id,
  diesel_liters_per_ha_per_pass,
  notes
)
SELECT
  'a2000000-0000-4000-8000-000000000001'::uuid,
  t.id,
  CASE t.code
    WHEN 'subsolador' THEN 16
    WHEN 'excentrica' THEN 12
    WHEN 'disquera' THEN 10
    WHEN 'rastra_liviana' THEN 5
    WHEN 'rastra_dientes' THEN 4
    ELSE COALESCE(t.diesel_liters_per_ha_per_pass, 0::numeric)
  END,
  '[supuesto] ballpark de consumo de combustible por implemento — validar con datos locales.'
FROM tillage_tools t
ON CONFLICT (assumption_set_id, tillage_tool_id) DO NOTHING;
