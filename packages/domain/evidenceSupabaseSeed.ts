import { EvidenceSource, evidenceSources, RuleEvidenceLink, ruleEvidenceLinks } from './evidenceRegistry.ts';

export interface EvidenceSourceSeedRow {
  source_id: string;
  title: string;
  publisher: string;
  year: number;
  canonical_url_or_doi: string;
  source_type: string;
  biomedical_evidence_class: string;
  authority_level: string;
  bucket: string;
  main_usable_contribution: string;
  main_weakness: string;
}

export interface RuleEvidenceLinkSeedRow {
  rule_id: string;
  biomarker_or_topic: string;
  logic: string;
  description: string;
  origin: string;
  anchor_source_id: string;
  supporting_source_ids: string[];
  product_evidence_class: string;
  status: string;
}

export interface EvidenceRegistrySeedBundle {
  evidenceSources: EvidenceSourceSeedRow[];
  ruleEvidenceLinks: RuleEvidenceLinkSeedRow[];
}

function toEvidenceSourceSeedRow(source: EvidenceSource): EvidenceSourceSeedRow {
  return {
    source_id: source.sourceId,
    title: source.title,
    publisher: source.publisher,
    year: source.year,
    canonical_url_or_doi: source.canonicalUrlOrDoi,
    source_type: source.sourceType,
    biomedical_evidence_class: source.biomedicalEvidenceClass,
    authority_level: source.authorityLevel,
    bucket: source.bucket,
    main_usable_contribution: source.mainUsableContribution,
    main_weakness: source.mainWeakness,
  };
}

function toRuleEvidenceLinkSeedRow(link: RuleEvidenceLink): RuleEvidenceLinkSeedRow {
  return {
    rule_id: link.ruleId,
    biomarker_or_topic: link.biomarkerOrTopic,
    logic: link.logic,
    description: link.description,
    origin: link.origin,
    anchor_source_id: link.anchorSourceId,
    supporting_source_ids: link.supportingSourceIds,
    product_evidence_class: link.productEvidenceClass,
    status: link.status,
  };
}

export function toEvidenceRegistrySeedBundle(): EvidenceRegistrySeedBundle {
  return {
    evidenceSources: Object.values(evidenceSources).map(toEvidenceSourceSeedRow),
    ruleEvidenceLinks: Object.values(ruleEvidenceLinks).map(toRuleEvidenceLinkSeedRow),
  };
}

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function toJsonSql(value: unknown): string {
  return `'${escapeSqlString(JSON.stringify(value))}'::jsonb`;
}

export function buildEvidenceRegistryUpsertSql(): string {
  const bundle = toEvidenceRegistrySeedBundle();

  const sourceStatements = bundle.evidenceSources.map((row) => `
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
  '${escapeSqlString(row.source_id)}',
  '${escapeSqlString(row.title)}',
  '${escapeSqlString(row.publisher)}',
  ${row.year},
  '${escapeSqlString(row.canonical_url_or_doi)}',
  '${escapeSqlString(row.source_type)}',
  '${escapeSqlString(row.biomedical_evidence_class)}',
  '${escapeSqlString(row.authority_level)}',
  '${escapeSqlString(row.bucket)}',
  '${escapeSqlString(row.main_usable_contribution)}',
  '${escapeSqlString(row.main_weakness)}'
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
  updated_at = now();`).join('\n');

  const ruleStatements = bundle.ruleEvidenceLinks.map((row) => `
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
  '${escapeSqlString(row.rule_id)}',
  '${escapeSqlString(row.biomarker_or_topic)}',
  '${escapeSqlString(row.logic)}',
  '${escapeSqlString(row.description)}',
  '${escapeSqlString(row.origin)}',
  '${escapeSqlString(row.anchor_source_id)}',
  ${toJsonSql(row.supporting_source_ids)},
  '${escapeSqlString(row.product_evidence_class)}',
  '${escapeSqlString(row.status)}'
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
  updated_at = now();`).join('\n');

  return [sourceStatements, ruleStatements].filter(Boolean).join('\n\n');
}
