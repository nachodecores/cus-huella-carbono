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
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Carbon MVP: default assumption set + placeholder factors (TEMP — replace
-- with study-based values before relying on footprint results).
-- Depends on: fertilizers, tillage_tools (seeded above).
-- ---------------------------------------------------------------------------

INSERT INTO assumption_set (id, label, is_default, notes)
VALUES (
  'a2000000-0000-4000-8000-000000000001'::uuid,
  'MVP default',
  true,
  'TEMP: all numeric factors below are placeholders (mostly 0). Replace with validated assumptions before production use.'
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
    0,
    'kg_co2e_per_l',
    'TEMP: tillage CO2e = L diesel * this; set to real diesel EF before use.',
    1
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'fallow_pass_kg_co2e_per_ha_per_pass',
    0,
    'kg_co2e_per_ha_per_pass',
    'TEMP placeholder',
    2
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'herbicide_pass_kg_co2e_per_ha_per_pass',
    0,
    'kg_co2e_per_ha_per_pass',
    'TEMP placeholder',
    3
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'fungicide_pass_kg_co2e_per_ha_per_pass',
    0,
    'kg_co2e_per_ha_per_pass',
    'TEMP placeholder',
    4
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'insecticide_pass_kg_co2e_per_ha_per_pass',
    0,
    'kg_co2e_per_ha_per_pass',
    'TEMP placeholder',
    5
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'inoculant_kg_co2e_per_kg_clean_seed_if_used',
    0,
    'kg_co2e_per_kg_clean_seed',
    'TEMP placeholder',
    6
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'seed_treatment_kg_co2e_per_kg_clean_seed_if_used',
    0,
    'kg_co2e_per_kg_clean_seed',
    'TEMP placeholder',
    7
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'harvest_directa_kg_co2e_per_kg_clean_seed',
    0,
    'kg_co2e_per_kg_clean_seed',
    'TEMP placeholder',
    8
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'harvest_corte_hilerado_kg_co2e_per_kg_clean_seed',
    0,
    'kg_co2e_per_kg_clean_seed',
    'TEMP placeholder',
    9
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'drying_gas_kg_co2e_per_kg_clean_seed',
    0,
    'kg_co2e_per_kg_clean_seed',
    'TEMP placeholder',
    10
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'drying_gasoil_kg_co2e_per_kg_clean_seed',
    0,
    'kg_co2e_per_kg_clean_seed',
    'TEMP placeholder',
    11
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'drying_electricidad_kg_co2e_per_kg_clean_seed',
    0,
    'kg_co2e_per_kg_clean_seed',
    'TEMP placeholder',
    12
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'conditioning_kg_co2e_per_kg_clean_seed_if_used',
    0,
    'kg_co2e_per_kg_clean_seed',
    'TEMP placeholder',
    13
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'transport_kg_co2e_per_tonne_km',
    0,
    'kg_co2e_per_tonne_km',
    'TEMP placeholder (transport mass rule: seed_produced_kg in app)',
    14
  ),
  (
    'a2000000-0000-4000-8000-000000000001'::uuid,
    'sowing_diesel_liters_per_ha',
    0,
    'L_per_ha',
    'Diesel siembra mecánica por ha (una operación; línea tillage implícita, no en listado de herramientas).',
    15
  )
ON CONFLICT (assumption_set_id, param_key) DO NOTHING;

INSERT INTO assumption_fertilizer_factor (
  assumption_set_id,
  fertilizer_id,
  kg_co2e_per_kg_product,
  kg_co2e_per_l_product,
  notes
)
SELECT
  'a2000000-0000-4000-8000-000000000001'::uuid,
  f.id,
  CASE WHEN f.application_unit = 'kg_ha' THEN 0::numeric ELSE NULL END,
  CASE WHEN f.application_unit = 'l_ha' THEN 0::numeric ELSE NULL END,
  'TEMP placeholder — replace with product-specific intensity'
FROM fertilizers f
ON CONFLICT (assumption_set_id, fertilizer_id) DO NOTHING;

INSERT INTO assumption_tillage_tool_factor (
  assumption_set_id,
  tillage_tool_id,
  diesel_liters_per_ha_per_pass,
  notes
)
SELECT
  'a2000000-0000-4000-8000-000000000001'::uuid,
  t.id,
  COALESCE(t.diesel_liters_per_ha_per_pass, 0::numeric),
  'TEMP: copied from tillage_tools or 0 if null — replace in admin when known'
FROM tillage_tools t
ON CONFLICT (assumption_set_id, tillage_tool_id) DO NOTHING;
