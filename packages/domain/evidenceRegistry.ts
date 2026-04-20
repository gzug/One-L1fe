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
  src_vitamin_d_policy_v1: {
    sourceId: 'src_vitamin_d_policy_v1',
    title: 'Vitamin D deficiency, adequacy, and optional optimization anchor for V1',
    publisher: 'One L1fe evidence registry',
    year: 2026,
    canonicalUrlOrDoi: 'internal://docs/research/v1-targeted-research-reconciliation-2026-04-12#vitamin-d',
    sourceType: 'expert_synthesis',
    biomedicalEvidenceClass: 'B',
    authorityLevel: 'high',
    bucket: 'secondary',
    mainUsableContribution: 'Separates deficiency prevention (stronger) from adequacy and optional optimization bands (policy-based); keeps Vitamin D outside the hard core score.',
    mainWeakness: 'Optimization band (30-50 ng/mL) is product-policy framing rather than universal consensus.',
  },
  src_ferritin_context_policy_v1: {
    sourceId: 'src_ferritin_context_policy_v1',
    title: 'Ferritin context-gated interpretation anchor for V1',
    publisher: 'One L1fe evidence registry',
    year: 2026,
    canonicalUrlOrDoi: 'internal://docs/research/v1-targeted-research-reconciliation-2026-04-12#ferritin',
    sourceType: 'expert_synthesis',
    biomedicalEvidenceClass: 'B',
    authorityLevel: 'high',
    bucket: 'secondary',
    mainUsableContribution: 'Anchors ferritin as context-gated: elevated values require inflammation, liver, or iron-transport context before escalation; low ferritin remains directly interpretable.',
    mainWeakness: 'Still represents internal synthesis; threshold and context-field semantics pending dedicated slice.',
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
  'SUP-001': {
    ruleId: 'SUP-001',
    biomarkerOrTopic: 'Vitamin D',
    logic: 'Bounded deficiency flag when value below deficiency threshold.',
    description: 'Vitamin D deficiency is directly interpretable; stays outside the hard core score.',
    origin: 'evidence_extrapolated',
    anchorSourceId: 'src_vitamin_d_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P1',
    status: 'active',
  },
  'SUP-002': {
    ruleId: 'SUP-002',
    biomarkerOrTopic: 'Vitamin D',
    logic: 'Softer optimization note when adequate but below policy target band.',
    description: 'Value in adequate range but below optional optimization band (30-50 ng/mL); presented as optional framing, not target.',
    origin: 'policy_choice',
    anchorSourceId: 'src_vitamin_d_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P0',
    status: 'active',
  },
  'CTX-001': {
    ruleId: 'CTX-001',
    biomarkerOrTopic: 'Ferritin',
    logic: 'Context gate: elevated ferritin without supporting context is not escalated.',
    description: 'Ferritin elevated without inflammation, liver, or iron-transport context; requests context collection before escalation.',
    origin: 'policy_choice',
    anchorSourceId: 'src_ferritin_context_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P0',
    status: 'active',
  },
  'CTX-002': {
    ruleId: 'CTX-002',
    biomarkerOrTopic: 'Ferritin',
    logic: 'Context-gated escalation: elevated ferritin with inflammation, liver, or iron-transport context signals allows bounded escalation.',
    description: 'Draft rule pending context-field wiring and threshold semantics in threshold evaluation layer.',
    origin: 'evidence_extrapolated',
    anchorSourceId: 'src_ferritin_context_policy_v1',
    supportingSourceIds: [],
    productEvidenceClass: 'P1',
    status: 'draft',
  },
};

export function getEvidenceSource(sourceId: string): EvidenceSource | undefined {
  return evidenceSources[sourceId];
}

export function getRuleEvidenceLink(ruleId: string): RuleEvidenceLink | undefined {
  return ruleEvidenceLinks[ruleId];
}
