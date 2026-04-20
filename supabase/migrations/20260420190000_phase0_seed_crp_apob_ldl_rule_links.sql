-- Phase 0 evidence registry: seed rule_evidence_links for CRP, ApoB/LDL,
-- metabolic, and coverage rules.
--
-- evidence_sources for all anchor IDs below were already inserted in the
-- initial phase0 seed migration (20260413023000_phase0_evidence_registry_seed.sql).
-- This migration is safe to run multiple times (ON CONFLICT DO UPDATE).

insert into public.rule_evidence_links (
  rule_id,
  biomarker_or_topic,
  logic,
  description,
  origin,
  anchor_source_id,
  supporting_source_ids,
  product_evidence_class,
  status
)
values
  (
    'INF-001',
    'hs-CRP',
    'Assay-gated supporting inflammation interpretation.',
    'hs-CRP contributes only in bounded fashion when assay and context are suitable.',
    'evidence_extrapolated',
    'src_hscrp_assay_policy_v1',
    '[]'::jsonb,
    'P0',
    'active'
  ),
  (
    'LIP-001',
    'ApoB',
    'Primary lipid interpretation when value and unit are usable.',
    'ApoB above-policy logic acts as the primary lipid driver in V1.',
    'guideline_adopted',
    'src_apob_guideline_consensus_v1',
    '["src_ldl_fallback_v1"]'::jsonb,
    'P0',
    'active'
  ),
  (
    'LIP-002',
    'LDL',
    'LDL contributes only as fallback or secondary lens.',
    'Prevents LDL from acting as a co-equal primary lipid score beside ApoB.',
    'evidence_extrapolated',
    'src_ldl_fallback_v1',
    '["src_apob_guideline_consensus_v1"]'::jsonb,
    'P0',
    'active'
  ),
  (
    'LIP-003',
    'ApoB coverage',
    'Missing ApoB creates coverage output, not severity.',
    'Coverage protection for missing ApoB in lipid context.',
    'policy_choice',
    'src_coverage_policy_v1',
    '[]'::jsonb,
    'P0',
    'active'
  ),
  (
    'LIP-004',
    'Lp(a)',
    'Unit-specific bounded modifier logic only.',
    'Lp(a) acts as bounded inherited-risk context, not a recurring hard score axis.',
    'evidence_extrapolated',
    'src_lpa_unit_policy_v1',
    '[]'::jsonb,
    'P0',
    'active'
  ),
  (
    'MET-001',
    'HbA1c',
    'Explicit percent or mmol/mol threshold path.',
    'HbA1c is a core metabolic rule with explicit unit-path handling.',
    'guideline_adopted',
    'src_hba1c_threshold_policy_v1',
    '[]'::jsonb,
    'P0',
    'active'
  ),
  (
    'MET-002',
    'Glucose',
    'Explicit mg/dL or mmol/L threshold path.',
    'Glucose is a core metabolic rule with explicit unit-path handling.',
    'guideline_adopted',
    'src_glucose_threshold_policy_v1',
    '[]'::jsonb,
    'P0',
    'active'
  ),
  (
    'COV-001',
    'Coverage',
    'Missing core data should not behave like severity.',
    'Coverage rule for missing core lipid data.',
    'policy_choice',
    'src_coverage_policy_v1',
    '[]'::jsonb,
    'P0',
    'active'
  ),
  (
    'COV-002',
    'Coverage',
    'Missing or unsupported unit blocks interpretation.',
    'Coverage rule for missing unit metadata.',
    'policy_choice',
    'src_coverage_policy_v1',
    '[]'::jsonb,
    'P0',
    'active'
  ),
  (
    'COV-003',
    'Coverage',
    'Missing assay blocks assay-sensitive interpretation.',
    'Coverage rule for missing assay metadata.',
    'policy_choice',
    'src_coverage_policy_v1',
    '[]'::jsonb,
    'P0',
    'active'
  ),
  (
    'COV-004',
    'Coverage',
    'Stale panels do not behave like current severity.',
    'Coverage rule for stale active-use panels.',
    'policy_choice',
    'src_coverage_policy_v1',
    '[]'::jsonb,
    'P0',
    'active'
  )
on conflict (rule_id) do update set
  biomarker_or_topic     = excluded.biomarker_or_topic,
  logic                  = excluded.logic,
  description            = excluded.description,
  origin                 = excluded.origin,
  anchor_source_id       = excluded.anchor_source_id,
  supporting_source_ids  = excluded.supporting_source_ids,
  product_evidence_class = excluded.product_evidence_class,
  status                 = excluded.status,
  updated_at             = now();
