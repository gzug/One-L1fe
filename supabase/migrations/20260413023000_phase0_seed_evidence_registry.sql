insert into public.evidence_sources (
  source_id,
  title,
  publisher,
  year,
  canonical_url_or_doi,
  source_type,
  biomedical_evidence_class,
  authority_level,
  bucket,
  main_usable_contribution,
  main_weakness
)
values (
  'src_apob_guideline_consensus_v1',
  'ApoB-first lipid interpretation anchor for V1',
  'One L1fe evidence registry',
  2026,
  'internal://docs/research/v1-targeted-research-reconciliation-2026-04-12#apob-vs-ldl',
  'expert_synthesis',
  'A',
  'high',
  'strong',
  'Anchors ApoB as primary lipid signal and LDL as fallback or secondary lens.',
  'Current registry entry is an internal anchor node, not yet a final external bibliography record.'
)
on conflict (source_id) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  year = excluded.year,
  canonical_url_or_doi = excluded.canonical_url_or_doi,
  source_type = excluded.source_type,
  biomedical_evidence_class = excluded.biomedical_evidence_class,
  authority_level = excluded.authority_level,
  bucket = excluded.bucket,
  main_usable_contribution = excluded.main_usable_contribution,
  main_weakness = excluded.main_weakness,
  updated_at = now();

insert into public.evidence_sources (
  source_id,
  title,
  publisher,
  year,
  canonical_url_or_doi,
  source_type,
  biomedical_evidence_class,
  authority_level,
  bucket,
  main_usable_contribution,
  main_weakness
)
values (
  'src_ldl_fallback_v1',
  'LDL fallback and anti-double-counting posture for V1',
  'One L1fe evidence registry',
  2026,
  'internal://docs/research/v1-targeted-research-reconciliation-2026-04-12#apob-vs-ldl',
  'expert_synthesis',
  'B',
  'high',
  'strong',
  'Defines when LDL may contribute as fallback without co-equal scoring beside ApoB.',
  'Still needs final source-level bibliography expansion.'
)
on conflict (source_id) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  year = excluded.year,
  canonical_url_or_doi = excluded.canonical_url_or_doi,
  source_type = excluded.source_type,
  biomedical_evidence_class = excluded.biomedical_evidence_class,
  authority_level = excluded.authority_level,
  bucket = excluded.bucket,
  main_usable_contribution = excluded.main_usable_contribution,
  main_weakness = excluded.main_weakness,
  updated_at = now();

insert into public.evidence_sources (
  source_id,
  title,
  publisher,
  year,
  canonical_url_or_doi,
  source_type,
  biomedical_evidence_class,
  authority_level,
  bucket,
  main_usable_contribution,
  main_weakness
)
values (
  'src_lpa_unit_policy_v1',
  'Lp(a) unit-specific bounded modifier anchor for V1',
  'One L1fe evidence registry',
  2026,
  'internal://docs/research/v1-targeted-research-reconciliation-2026-04-12#lpa',
  'expert_synthesis',
  'B',
  'high',
  'strong',
  'Anchors explicit mg/dL vs nmol/L handling and bounded modifier posture.',
  'Still represented as internal registry synthesis rather than full citation set.'
)
on conflict (source_id) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  year = excluded.year,
  canonical_url_or_doi = excluded.canonical_url_or_doi,
  source_type = excluded.source_type,
  biomedical_evidence_class = excluded.biomedical_evidence_class,
  authority_level = excluded.authority_level,
  bucket = excluded.bucket,
  main_usable_contribution = excluded.main_usable_contribution,
  main_weakness = excluded.main_weakness,
  updated_at = now();

insert into public.evidence_sources (
  source_id,
  title,
  publisher,
  year,
  canonical_url_or_doi,
  source_type,
  biomedical_evidence_class,
  authority_level,
  bucket,
  main_usable_contribution,
  main_weakness
)
values (
  'src_hba1c_threshold_policy_v1',
  'HbA1c explicit unit-path threshold anchor for V1',
  'One L1fe evidence registry',
  2026,
  'internal://docs/research/v1-research-gaps-and-targeted-followups#core-marker-primary-source-tightening',
  'expert_synthesis',
  'A',
  'high',
  'strong',
  'Anchors explicit percent vs mmol/mol handling for bounded metabolic scoring.',
  'Final source-to-threshold bibliography still needs expansion.'
)
on conflict (source_id) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  year = excluded.year,
  canonical_url_or_doi = excluded.canonical_url_or_doi,
  source_type = excluded.source_type,
  biomedical_evidence_class = excluded.biomedical_evidence_class,
  authority_level = excluded.authority_level,
  bucket = excluded.bucket,
  main_usable_contribution = excluded.main_usable_contribution,
  main_weakness = excluded.main_weakness,
  updated_at = now();

insert into public.evidence_sources (
  source_id,
  title,
  publisher,
  year,
  canonical_url_or_doi,
  source_type,
  biomedical_evidence_class,
  authority_level,
  bucket,
  main_usable_contribution,
  main_weakness
)
values (
  'src_glucose_threshold_policy_v1',
  'Glucose explicit unit-path threshold anchor for V1',
  'One L1fe evidence registry',
  2026,
  'internal://docs/research/v1-research-gaps-and-targeted-followups#core-marker-primary-source-tightening',
  'expert_synthesis',
  'A',
  'high',
  'strong',
  'Anchors explicit mg/dL vs mmol/L handling for bounded glucose interpretation.',
  'Still needs final direct bibliography linkage.'
)
on conflict (source_id) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  year = excluded.year,
  canonical_url_or_doi = excluded.canonical_url_or_doi,
  source_type = excluded.source_type,
  biomedical_evidence_class = excluded.biomedical_evidence_class,
  authority_level = excluded.authority_level,
  bucket = excluded.bucket,
  main_usable_contribution = excluded.main_usable_contribution,
  main_weakness = excluded.main_weakness,
  updated_at = now();

insert into public.evidence_sources (
  source_id,
  title,
  publisher,
  year,
  canonical_url_or_doi,
  source_type,
  biomedical_evidence_class,
  authority_level,
  bucket,
  main_usable_contribution,
  main_weakness
)
values (
  'src_hscrp_assay_policy_v1',
  'hs-CRP assay-gated preventive interpretation anchor for V1',
  'One L1fe evidence registry',
  2026,
  'internal://docs/research/v1-targeted-research-reconciliation-2026-04-12#hs-crp-crp',
  'expert_synthesis',
  'B',
  'high',
  'secondary',
  'Anchors assay clarity and acute-context exclusion before preventive use.',
  'More contextual and softer than ApoB or HbA1c core rule anchors.'
)
on conflict (source_id) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  year = excluded.year,
  canonical_url_or_doi = excluded.canonical_url_or_doi,
  source_type = excluded.source_type,
  biomedical_evidence_class = excluded.biomedical_evidence_class,
  authority_level = excluded.authority_level,
  bucket = excluded.bucket,
  main_usable_contribution = excluded.main_usable_contribution,
  main_weakness = excluded.main_weakness,
  updated_at = now();

insert into public.evidence_sources (
  source_id,
  title,
  publisher,
  year,
  canonical_url_or_doi,
  source_type,
  biomedical_evidence_class,
  authority_level,
  bucket,
  main_usable_contribution,
  main_weakness
)
values (
  'src_coverage_policy_v1',
  'Coverage-is-not-severity policy anchor for V1',
  'One L1fe architecture',
  2026,
  'internal://docs/architecture/measurement-interpretation-policy',
  'regulatory_spec',
  'C',
  'medium',
  'heuristic',
  'Anchors missing-data, unit, assay, and freshness gating as product safety policy.',
  'This is product-governance policy, not biomedical threshold evidence.'
)
on conflict (source_id) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  year = excluded.year,
  canonical_url_or_doi = excluded.canonical_url_or_doi,
  source_type = excluded.source_type,
  biomedical_evidence_class = excluded.biomedical_evidence_class,
  authority_level = excluded.authority_level,
  bucket = excluded.bucket,
  main_usable_contribution = excluded.main_usable_contribution,
  main_weakness = excluded.main_weakness,
  updated_at = now();

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
values (
  'LIP-001',
  'ApoB',
  'Primary lipid interpretation when value and unit are usable.',
  'ApoB above-policy logic acts as the primary lipid driver in V1.',
  'guideline_adopted',
  'src_apob_guideline_consensus_v1',
  '["src_ldl_fallback_v1"]'::jsonb,
  'P0',
  'active'
)
on conflict (rule_id) do update set
  biomarker_or_topic = excluded.biomarker_or_topic,
  logic = excluded.logic,
  description = excluded.description,
  origin = excluded.origin,
  anchor_source_id = excluded.anchor_source_id,
  supporting_source_ids = excluded.supporting_source_ids,
  product_evidence_class = excluded.product_evidence_class,
  status = excluded.status,
  updated_at = now();

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
values (
  'LIP-002',
  'LDL',
  'LDL contributes only as fallback or secondary lens.',
  'Prevents LDL from acting as a co-equal primary lipid score beside ApoB.',
  'evidence_extrapolated',
  'src_ldl_fallback_v1',
  '["src_apob_guideline_consensus_v1"]'::jsonb,
  'P0',
  'active'
)
on conflict (rule_id) do update set
  biomarker_or_topic = excluded.biomarker_or_topic,
  logic = excluded.logic,
  description = excluded.description,
  origin = excluded.origin,
  anchor_source_id = excluded.anchor_source_id,
  supporting_source_ids = excluded.supporting_source_ids,
  product_evidence_class = excluded.product_evidence_class,
  status = excluded.status,
  updated_at = now();

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
values (
  'LIP-003',
  'ApoB coverage',
  'Missing ApoB creates coverage output, not severity.',
  'Coverage protection for missing ApoB in lipid context.',
  'policy_choice',
  'src_coverage_policy_v1',
  '[]'::jsonb,
  'P0',
  'active'
)
on conflict (rule_id) do update set
  biomarker_or_topic = excluded.biomarker_or_topic,
  logic = excluded.logic,
  description = excluded.description,
  origin = excluded.origin,
  anchor_source_id = excluded.anchor_source_id,
  supporting_source_ids = excluded.supporting_source_ids,
  product_evidence_class = excluded.product_evidence_class,
  status = excluded.status,
  updated_at = now();

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
values (
  'LIP-004',
  'Lp(a)',
  'Unit-specific bounded modifier logic only.',
  'Lp(a) acts as bounded inherited-risk context, not a recurring hard score axis.',
  'evidence_extrapolated',
  'src_lpa_unit_policy_v1',
  '[]'::jsonb,
  'P0',
  'active'
)
on conflict (rule_id) do update set
  biomarker_or_topic = excluded.biomarker_or_topic,
  logic = excluded.logic,
  description = excluded.description,
  origin = excluded.origin,
  anchor_source_id = excluded.anchor_source_id,
  supporting_source_ids = excluded.supporting_source_ids,
  product_evidence_class = excluded.product_evidence_class,
  status = excluded.status,
  updated_at = now();

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
values (
  'MET-001',
  'HbA1c',
  'Explicit percent or mmol/mol threshold path.',
  'HbA1c is a core metabolic rule with explicit unit-path handling.',
  'guideline_adopted',
  'src_hba1c_threshold_policy_v1',
  '[]'::jsonb,
  'P0',
  'active'
)
on conflict (rule_id) do update set
  biomarker_or_topic = excluded.biomarker_or_topic,
  logic = excluded.logic,
  description = excluded.description,
  origin = excluded.origin,
  anchor_source_id = excluded.anchor_source_id,
  supporting_source_ids = excluded.supporting_source_ids,
  product_evidence_class = excluded.product_evidence_class,
  status = excluded.status,
  updated_at = now();

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
values (
  'MET-002',
  'Glucose',
  'Explicit mg/dL or mmol/L threshold path.',
  'Glucose is a core metabolic rule with explicit unit-path handling.',
  'guideline_adopted',
  'src_glucose_threshold_policy_v1',
  '[]'::jsonb,
  'P0',
  'active'
)
on conflict (rule_id) do update set
  biomarker_or_topic = excluded.biomarker_or_topic,
  logic = excluded.logic,
  description = excluded.description,
  origin = excluded.origin,
  anchor_source_id = excluded.anchor_source_id,
  supporting_source_ids = excluded.supporting_source_ids,
  product_evidence_class = excluded.product_evidence_class,
  status = excluded.status,
  updated_at = now();

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
values (
  'INF-001',
  'hs-CRP',
  'Assay-gated supporting inflammation interpretation.',
  'hs-CRP contributes only in bounded fashion when assay and context are suitable.',
  'evidence_extrapolated',
  'src_hscrp_assay_policy_v1',
  '[]'::jsonb,
  'P0',
  'active'
)
on conflict (rule_id) do update set
  biomarker_or_topic = excluded.biomarker_or_topic,
  logic = excluded.logic,
  description = excluded.description,
  origin = excluded.origin,
  anchor_source_id = excluded.anchor_source_id,
  supporting_source_ids = excluded.supporting_source_ids,
  product_evidence_class = excluded.product_evidence_class,
  status = excluded.status,
  updated_at = now();

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
values (
  'COV-001',
  'Coverage',
  'Missing core data should not behave like severity.',
  'Coverage rule for missing core lipid data.',
  'policy_choice',
  'src_coverage_policy_v1',
  '[]'::jsonb,
  'P0',
  'active'
)
on conflict (rule_id) do update set
  biomarker_or_topic = excluded.biomarker_or_topic,
  logic = excluded.logic,
  description = excluded.description,
  origin = excluded.origin,
  anchor_source_id = excluded.anchor_source_id,
  supporting_source_ids = excluded.supporting_source_ids,
  product_evidence_class = excluded.product_evidence_class,
  status = excluded.status,
  updated_at = now();

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
values (
  'COV-002',
  'Coverage',
  'Missing or unsupported unit blocks interpretation.',
  'Coverage rule for missing unit metadata.',
  'policy_choice',
  'src_coverage_policy_v1',
  '[]'::jsonb,
  'P0',
  'active'
)
on conflict (rule_id) do update set
  biomarker_or_topic = excluded.biomarker_or_topic,
  logic = excluded.logic,
  description = excluded.description,
  origin = excluded.origin,
  anchor_source_id = excluded.anchor_source_id,
  supporting_source_ids = excluded.supporting_source_ids,
  product_evidence_class = excluded.product_evidence_class,
  status = excluded.status,
  updated_at = now();

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
values (
  'COV-003',
  'Coverage',
  'Missing assay blocks assay-sensitive interpretation.',
  'Coverage rule for missing assay metadata.',
  'policy_choice',
  'src_coverage_policy_v1',
  '[]'::jsonb,
  'P0',
  'active'
)
on conflict (rule_id) do update set
  biomarker_or_topic = excluded.biomarker_or_topic,
  logic = excluded.logic,
  description = excluded.description,
  origin = excluded.origin,
  anchor_source_id = excluded.anchor_source_id,
  supporting_source_ids = excluded.supporting_source_ids,
  product_evidence_class = excluded.product_evidence_class,
  status = excluded.status,
  updated_at = now();

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
values (
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
  biomarker_or_topic = excluded.biomarker_or_topic,
  logic = excluded.logic,
  description = excluded.description,
  origin = excluded.origin,
  anchor_source_id = excluded.anchor_source_id,
  supporting_source_ids = excluded.supporting_source_ids,
  product_evidence_class = excluded.product_evidence_class,
  status = excluded.status,
  updated_at = now();
