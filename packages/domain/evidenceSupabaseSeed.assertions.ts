import { evidenceSources, ruleEvidenceLinks } from './evidenceRegistry';
import { buildEvidenceRegistryUpsertSql, toEvidenceRegistrySeedBundle } from './evidenceSupabaseSeed';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runEvidenceRegistrySeedAssertions(): void {
  const bundle = toEvidenceRegistrySeedBundle();
  const sql = buildEvidenceRegistryUpsertSql();

  assert(
    bundle.evidenceSources.length === Object.keys(evidenceSources).length,
    'Evidence source seed bundle should include every registered evidence source.',
  );
  assert(
    bundle.ruleEvidenceLinks.length === Object.keys(ruleEvidenceLinks).length,
    'Rule evidence seed bundle should include every registered rule evidence link.',
  );
  assert(
    sql.includes('insert into public.evidence_sources'),
    'Generated SQL should upsert evidence_sources rows.',
  );
  assert(
    sql.includes('insert into public.rule_evidence_links'),
    'Generated SQL should upsert rule_evidence_links rows.',
  );
  assert(
    sql.includes('src_apob_guideline_consensus_v1'),
    'Generated SQL should include known anchor source ids.',
  );
}
