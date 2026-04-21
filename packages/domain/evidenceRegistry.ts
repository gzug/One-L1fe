export interface EvidenceRegistrySupabaseClient {
  from(table: 'rule_evidence_links' | 'evidence_sources'): {
    select(columns: string): {
      in(column: string, values: string[]): Promise<{ data: unknown[] | null; error: { message: string } | null }>;
    };
  };
}

export type SourceType =
  | 'guideline'
  | 'consensus_statement'
  | 'systematic_review_meta'
  | 'primary_study'
  | 'narrative_review'
  | 'expert_synthesis'
  | 'regulatory_spec'
  | 'commercial_article'
  | 'media_summary'
  | 'placeholder';

export type BiomedicalEvidenceClass = 'A' | 'B' | 'C' | 'D';
export type AuthorityLevel = 'very_high' | 'high' | 'medium' | 'low' | 'unusable';
export type SourceBucket = 'strong' | 'secondary' | 'heuristic' | 'discard';
export type RuleOrigin = 'guideline_adopted' | 'evidence_extrapolated' | 'policy_choice' | 'heuristic';
export type ProductEvidenceClass = 'P0' | 'P1' | 'P2' | 'P3';

export interface EvidenceSource {
  sourceId: string;
  title: string;
  publisher: string;
  year: number;
  canonicalUrlOrDoi: string;
  sourceType: SourceType;
  biomedicalEvidenceClass: BiomedicalEvidenceClass;
  authorityLevel: AuthorityLevel;
  bucket: SourceBucket;
  mainUsableContribution: string;
  mainWeakness: string;
}

export interface RuleEvidenceLink {
  ruleId: string;
  biomarkerOrTopic: string;
  logic: string;
  description: string;
  origin: RuleOrigin;
  anchorSourceId: string;
  supportingSourceIds: string[];
  productEvidenceClass: ProductEvidenceClass;
  status: 'active' | 'draft';
}

export interface EvidenceAnchor extends RuleEvidenceLink {
  source: EvidenceSource;
}

export const evidenceSources: Record<string, EvidenceSource> = {
  src_apob_guideline_consensus_v1: {
    sourceId: 'src_apob_guideline_consensus_v1',
    title: 'ApoB-first lipid interpretation anchor for V1',
    publisher: 'One L1fe evidence registry',
    year: 2026,
    canonicalUrlOrDoi: 'internal://docs/research/v1-targeted-research-reconciliation-2026-04-12#apob-vs-ldl',
    sourceType: 'expert_synthesis',
    biomedicalEvidenceClass: 'A',
    authorityLevel: 'high',
    bucket: 'strong',
    mainUsableContribution: 'Anchors ApoB as primary lipid signal and LDL as fallback or secondary lens.',
    mainWeakness: 'Current registry entry is an internal anchor node, not yet a final external bibliography record.',
  },
  src_ldl_fallback_v1: {
    sourceId: 'src_ldl_fallback_v1',
    title: 'LDL fallback and anti-double-counting posture for V1',
    publisher: 'One L1fe evidence registry',
    year: 2026,
    canonicalUrlOrDoi: 'internal://docs/research/v1-targeted-research-reconciliation-2026-04-12#apob-vs-ldl',
    sourceType: 'expert_synthesis',
    biomedicalEvidenceClass: 'B',
    authorityLevel: 'high',
    bucket: 'strong',
    mainUsableContribution: 'Defines when LDL may contribute as fallback without co-equal scoring beside ApoB.',
    mainWeakness: 'Still needs final source-level bibliography expansion.',
  },
  src_lpa_unit_policy_v1: {
    sourceId: 'src_lpa_unit_policy_v1',
    title: 'Lp(a) unit-specific bounded modifier anchor for V1',
    publisher: 'One L1fe evidence registry',
    year: 2026,
    canonicalUrlOrDoi: 'internal://docs/research/v1-targeted-research-reconciliation-2026-04-12#lpa',
    sourceType: 'expert_synthesis',
    biomedicalEvidenceClass: 'B',
    authorityLevel: 'high',
    bucket: 'strong',
    mainUsableContribution: 'Anchors explicit mg/dL vs nmol/L handling and bounded modifier posture.',
    mainWeakness: 'Still represented as internal registry synthesis rather than full citation set.',
  },
  src_hba1c_threshold_policy_v1: {
    sourceId: 'src_hba1c_threshold_policy_v1',
    title: 'HbA1c explicit unit-path threshold anchor for V1',
    publisher: 'One L1fe evidence registry',
    year: 2026,
    canonicalUrlOrDoi: 'internal://docs/research/v1-research-gaps-and-targeted-followups#core-marker-primary-source-tightening',
    sourceType: 'expert_synthesis',
    biomedicalEvidenceClass: 'A',
    authorityLevel: 'high',
    bucket: 'strong',
    mainUsableContribution: 'Anchors explicit percent vs mmol/mol handling for bounded metabolic scoring.',
    mainWeakness: 'Final source-to-threshold bibliography still needs expansion.',
  },
  src_glucose_threshold_policy_v1: {
    sourceId: 'src_glucose_threshold_policy_v1',
    title: 'Glucose explicit unit-path threshold anchor for V1',
    publisher: 'One L1fe evidence registry',
    year: 2026,
    canonicalUrlOrDoi: 'internal://docs/research/v1-research-gaps-and-targeted-followups#core-marker-primary-source-tightening',
    sourceType: 'expert_synthesis',
    biomedicalEvidenceClass: 'A',
    authorityLevel: 'high',
    bucket: 'strong',
    mainUsableContribution: 'Anchors explicit mg/dL vs mmol/L handling for bounded glucose interpretation.',
    mainWeakness: 'Still needs final direct bibliography linkage.',
  },
  src_hscrp_assay_policy_v1: {
    sourceId: 'src_hscrp_assay_policy_v1',
    title: 'hs-CRP assay-gated preventive interpretation anchor for V1',
    publisher: 'One L1fe evidence registry',
    year: 2026,
    canonicalUrlOrDoi: 'internal://docs/research/v1-targeted-research-reconciliation-2026-04-12#hs-crp-crp',
    sourceType: 'expert_synthesis',
    biomedicalEvidenceClass: 'B',
    authorityLevel: 'high',
    bucket: 'secondary',
    mainUsableContribution: 'Anchors assay clarity and acute-context exclusion before preventive use.',
    mainWeakness: 'More contextual and softer than ApoB or HbA1c core rule anchors.',
  },
  src_coverage_policy_v1: {
    sourceId: 'src_coverage_policy_v1',
    title: 'Coverage-is-not-severity policy anchor for V1',
    publisher: 'One L1fe architecture',
    year: 2026,
    canonicalUrlOrDoi: 'internal://docs/architecture/measurement-interpretation-policy',
    sourceType: 'regulatory_spec',
    biomedicalEvidenceClass: 'C',
    authorityLevel: 'medium',
    bucket: 'heuristic',
    mainUsableContribution: 'Anchors missing-data, unit, assay, and freshness gating as product safety policy.',
    mainWeakness: 'This is product-governance policy, not biomedical threshold evidence.',
  },
};

export const ruleEvidenceLinks: Record<string, RuleEvidenceLink> = {
  'LIP-001': {
    ruleId: 'LIP-001',
    biomarkerOrTopic: 'ApoB',
    logic: 'Primary lipid interpretation when value and unit are usable.',
    description: 'ApoB above-policy logic acts as the primary lipid driver in V1.',
    origin: 'guideline_adopted',
    anchorSourceId: 'src_apob_guideline_consensus_v1',
    supportingSourceIds: ['src_ldl_fallback_v1'],
    productEvidenceClass: 'P0',
    status: 'active',
  },
  'LIP-002': {
    ruleId: 'LIP-002',
    biomarkerOrTopic: 'LDL',
    logic: 'LDL contributes only as fallback or secondary lens.',
    description: 'Prevents LDL from acting as a co-equal primary lipid score beside ApoB.',
    origin: 'evidence_extrapolated',
    anchorSourceId: 'src_ldl_fallback_v1',
    supportingSourceIds: ['src_apob_guideline_consensus_v1'],
    productEvidenceClass: 'P0',
    status: 'active',
  },
  'LIP-003': {
    ruleId: 'LIP-003',
    biomarkerOrTopic: 'ApoB coverage',
    logic: 'Missing ApoB creates coverage output, not severity.',
    description: 'Coverage protection for missing ApoB in lipid context.',
    origin: 'policy_choice',
    anchorSourceId: 'src_coverage_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P0',
    status: 'active',
  },
  'LIP-004': {
    ruleId: 'LIP-004',
    biomarkerOrTopic: 'Lp(a)',
    logic: 'Unit-specific bounded modifier logic only.',
    description: 'Lp(a) acts as bounded inherited-risk context, not a recurring hard score axis.',
    origin: 'evidence_extrapolated',
    anchorSourceId: 'src_lpa_unit_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P0',
    status: 'active',
  },
  'MET-001': {
    ruleId: 'MET-001',
    biomarkerOrTopic: 'HbA1c',
    logic: 'Explicit percent or mmol/mol threshold path.',
    description: 'HbA1c is a core metabolic rule with explicit unit-path handling.',
    origin: 'guideline_adopted',
    anchorSourceId: 'src_hba1c_threshold_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P0',
    status: 'active',
  },
  'MET-002': {
    ruleId: 'MET-002',
    biomarkerOrTopic: 'Glucose',
    logic: 'Explicit mg/dL or mmol/L threshold path.',
    description: 'Glucose is a core metabolic rule with explicit unit-path handling.',
    origin: 'guideline_adopted',
    anchorSourceId: 'src_glucose_threshold_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P0',
    status: 'active',
  },
  'INF-001': {
    ruleId: 'INF-001',
    biomarkerOrTopic: 'hs-CRP',
    logic: 'Assay-gated supporting inflammation interpretation.',
    description: 'hs-CRP contributes only in bounded fashion when assay and context are suitable.',
    origin: 'evidence_extrapolated',
    anchorSourceId: 'src_hscrp_assay_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P0',
    status: 'active',
  },
  'COV-001': {
    ruleId: 'COV-001',
    biomarkerOrTopic: 'Coverage',
    logic: 'Missing core data should not behave like severity.',
    description: 'Coverage rule for missing core lipid data.',
    origin: 'policy_choice',
    anchorSourceId: 'src_coverage_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P0',
    status: 'active',
  },
  'COV-002': {
    ruleId: 'COV-002',
    biomarkerOrTopic: 'Coverage',
    logic: 'Missing or unsupported unit blocks interpretation.',
    description: 'Coverage rule for missing unit metadata.',
    origin: 'policy_choice',
    anchorSourceId: 'src_coverage_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P0',
    status: 'active',
  },
  'COV-003': {
    ruleId: 'COV-003',
    biomarkerOrTopic: 'Coverage',
    logic: 'Missing assay blocks assay-sensitive interpretation.',
    description: 'Coverage rule for missing assay metadata.',
    origin: 'policy_choice',
    anchorSourceId: 'src_coverage_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P0',
    status: 'active',
  },
  'COV-004': {
    ruleId: 'COV-004',
    biomarkerOrTopic: 'Coverage',
    logic: 'Stale panels do not behave like current severity.',
    description: 'Coverage rule for stale active-use panels.',
    origin: 'policy_choice',
    anchorSourceId: 'src_coverage_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P0',
    status: 'active',
  },
};

export function getEvidenceSource(sourceId: string): EvidenceSource | undefined {
  return evidenceSources[sourceId];
}

export function getRuleEvidenceLink(ruleId: string): RuleEvidenceLink | undefined {
  return ruleEvidenceLinks[ruleId];
}

export async function loadEvidenceForRules(
  supabase: EvidenceRegistrySupabaseClient,
  ruleIds: string[],
): Promise<Map<string, EvidenceAnchor[]>> {
  const uniqueRuleIds = Array.from(new Set(ruleIds)).filter((ruleId) => ruleId.trim().length > 0);
  if (uniqueRuleIds.length === 0) {
    return new Map();
  }

  const { data: linkRows, error: linkError } = await supabase
    .from('rule_evidence_links')
    .select('rule_id, biomarker_or_topic, logic, description, origin, anchor_source_id, supporting_source_ids, product_evidence_class, status')
    .in('rule_id', uniqueRuleIds);

  if (linkError) {
    throw new Error(`Failed to load rule evidence links: ${linkError.message}`);
  }

  const links = (linkRows ?? []) as Array<{
    rule_id: string;
    biomarker_or_topic: string;
    logic: string;
    description: string;
    origin: RuleOrigin;
    anchor_source_id: string;
    supporting_source_ids: string[];
    product_evidence_class: ProductEvidenceClass;
    status: 'active' | 'draft';
  }>;

  const sourceIds = Array.from(new Set(links.map((link) => link.anchor_source_id).filter((value): value is string => Boolean(value))));
  const { data: sourceRows, error: sourceError } = await supabase
    .from('evidence_sources')
    .select('source_id, title, publisher, year, canonical_url_or_doi, source_type, biomedical_evidence_class, authority_level, bucket, main_usable_contribution, main_weakness')
    .in('source_id', sourceIds.length > 0 ? sourceIds : ['__none__']);

  if (sourceError) {
    throw new Error(`Failed to load evidence sources: ${sourceError.message}`);
  }

  const sources = (sourceRows ?? []) as Array<{
    source_id: string;
    title: string;
    publisher: string;
    year: number;
    canonical_url_or_doi: string;
    source_type: SourceType;
    biomedical_evidence_class: BiomedicalEvidenceClass;
    authority_level: AuthorityLevel;
    bucket: SourceBucket;
    main_usable_contribution: string;
    main_weakness: string;
  }>;

  const sourceById = new Map(
    sources.map((source) => [
      source.source_id,
      {
        sourceId: source.source_id,
        title: source.title,
        publisher: source.publisher,
        year: source.year,
        canonicalUrlOrDoi: source.canonical_url_or_doi,
        sourceType: source.source_type,
        biomedicalEvidenceClass: source.biomedical_evidence_class,
        authorityLevel: source.authority_level,
        bucket: source.bucket,
        mainUsableContribution: source.main_usable_contribution,
        mainWeakness: source.main_weakness,
      } as EvidenceSource,
    ]),
  );

  const grouped = new Map<string, EvidenceAnchor[]>();
  for (const link of links) {
    const source = sourceById.get(link.anchor_source_id);
    if (!source) continue;

    const anchor: EvidenceAnchor = {
      ruleId: link.rule_id,
      biomarkerOrTopic: link.biomarker_or_topic,
      logic: link.logic,
      description: link.description,
      origin: link.origin,
      anchorSourceId: link.anchor_source_id,
      supportingSourceIds: link.supporting_source_ids ?? [],
      productEvidenceClass: link.product_evidence_class,
      status: link.status,
      source,
    };

    const existing = grouped.get(link.rule_id) ?? [];
    existing.push(anchor);
    grouped.set(link.rule_id, existing);
  }

  return grouped;
}
