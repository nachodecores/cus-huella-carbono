-- MVP v1 seed: crops, fertilizers, companies (dummy access tokens for dev).
-- Does not seed `crop_season_submissions`. When inserting rows there, set
-- `fertilizers_used` and keep it consistent with `submission_fertilizer_lines`
-- (false + zero lines, or true + ≥1 valid line).

INSERT INTO crops (id, label) VALUES
  (1, 'Raigrás'),
  (2, 'Festuca'),
  (3, 'Lotus'),
  (4, 'Trébol Rojo'),
  (5, 'Arroz'),
  (6, 'Soja'),
  (7, 'Maíz'),
  (8, 'Achicoria')
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
  (11, 'Cal agrícola / enmienda calcárea', 'kg_ha')
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
    'mvp_dev_agrofuturo_7a1c9e2f4b608d3a'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'Gentos',
    'mvp_dev_gentos_8b2d0f3a5c719e4b'
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'Procampo',
    'mvp_dev_procampo_9c3e1a4b6d820f5c'
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    'DLF',
    'mvp_dev_dlf_0d4f2b5c7e931a6d'
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    'Virö',
    'mvp_dev_viro_1e5a3c6d8f042b7e'
  ),
  (
    'a1000000-0000-4000-8000-000000000006',
    'DMK Semillas',
    'mvp_dev_dmk_semillas_2f6b4d7e9a153c8f'
  ),
  (
    'a1000000-0000-4000-8000-000000000007',
    'Calvase',
    'mvp_dev_calvase_3a7c5e8f0b264d9a'
  ),
  (
    'a1000000-0000-4000-8000-000000000008',
    'Fadisol',
    'mvp_dev_fadisol_4b8d6f9a1c375e0b'
  ),
  (
    'a1000000-0000-4000-8000-000000000009',
    'Germinar',
    'mvp_dev_germinar_5c9e7a0b2d486f1c'
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
