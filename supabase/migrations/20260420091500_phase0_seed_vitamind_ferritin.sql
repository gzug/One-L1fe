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
  'src_vitamin_d_policy_v1',
  'Vitamin D deficiency, adequacy, and optional optimization anchor for V1',
  'One L1fe evidence registry',
  2026,
  'internal://docs/research/v1-targeted-research-reconciliation-2026-04-12#vitamin-d',
  'expert_synthesis',
  'B',
  'high',
  'secondary',
  'Separates deficiency prevention (stronger) from adequacy and optional optimization bands (policy-based); keeps Vitamin D outside the hard core score.',
  'Optimization band (30-50 ng/mL) is product-policy framing rather than universal consensus.'
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
  'src_ferritin_context_policy_v1',
  'Ferritin context-gated interpretation anchor for V1',
  'One L1fe evidence registry',
  2026,
  'internal://docs/research/v1-targeted-research-reconciliation-2026-04-12#ferritin',
  'expert_synthesis',
  'B',
  'high',
  'secondary',
  'Anchors ferritin as context-gated: elevated values require inflammation, liver, or iron-transport context before escalation; low ferritin remains directly interpretable.',
  'Still represents internal synthesis; threshold and context-field semantics pending dedicated slice.'
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
  'SUP-001',
  'Vitamin D',
  'Bounded deficiency flag when value below deficiency threshold.',
  'Vitamin D deficiency is directly interpretable; stays outside the hard core score.',
  'evidence_extrapolated',
  'src_vitamin_d_policy_v1',
  '[]'::jsonb,
  'P1',
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
  'SUP-002',
  'Vitamin D',
  'Softer optimization note when adequate but below policy target band.',
  'Value in adequate range but below optional optimization band (30-50 ng/mL); presented as optional framing, not target.',
  'policy_choice',
  'src_vitamin_d_policy_v1',
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
  'CTX-001',
  'Ferritin',
  'Context gate: elevated ferritin without supporting context is not escalated.',
  'Ferritin elevated without inflammation, liver, or iron-transport context; requests context collection before escalation.',
  'policy_choice',
  'src_ferritin_context_policy_v1',
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
  'CTX-002',
  'Ferritin',
  'Context-gated escalation: elevated ferritin with inflammation, liver, or iron-transport context signals allows bounded escalation.',
  'Draft rule pending context-field wiring and threshold semantics in threshold evaluation layer.',
  'evidence_extrapolated',
  'src_ferritin_context_policy_v1',
  '[]'::jsonb,
  'P1',
  'draft'
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
