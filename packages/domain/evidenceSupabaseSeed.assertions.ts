import { evidenceSources, ruleEvidenceLinks } from './evidenceRegistry.ts';
import { buildEvidenceRegistryUpsertSql, toEvidenceRegistrySeedBundle } from './evidenceSupabaseSeed.ts';

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

  // Vitamin D evidence rules
  const vitaminDSup001 = ruleEvidenceLinks['SUP-001'];
  assert(
    vitaminDSup001 && vitaminDSup001.biomarkerOrTopic === 'Vitamin D' && vitaminDSup001.status === 'active',
    'SUP-001 should be an active Vitamin D deficiency rule.',
  );
  const vitaminDSup002 = ruleEvidenceLinks['SUP-002'];
  assert(
    vitaminDSup002 && vitaminDSup002.origin === 'policy_choice' && vitaminDSup002.productEvidenceClass === 'P0',
    'SUP-002 should be a policy-choice optimization rule.',
  );
  assert(
    sql.includes('SUP-001') && sql.includes('Vitamin D deficiency'),
    'Generated SQL should include SUP-001 Vitamin D deficiency rule.',
  );

  // Ferritin evidence rules
  const ferritinCtx001 = ruleEvidenceLinks['CTX-001'];
  assert(
    ferritinCtx001 && ferritinCtx001.biomarkerOrTopic === 'Ferritin' && ferritinCtx001.status === 'active',
    'CTX-001 should be an active Ferritin context-gate rule.',
  );
  const ferritinCtx002 = ruleEvidenceLinks['CTX-002'];
  assert(
    ferritinCtx002 && ferritinCtx002.status === 'draft',
    'CTX-002 should be a draft Ferritin context-escalation rule pending wiring.',
  );
  assert(
    sql.includes('CTX-001'),
    'Generated SQL should include CTX-001 Ferritin context rule.',
  );

  // Vitamin D and Ferritin sources
  assert(
    evidenceSources['src_vitamin_d_policy_v1'] && evidenceSources['src_vitamin_d_policy_v1'].bucket === 'secondary',
    'Vitamin D source should be in secondary bucket (outside hard core score).',
  );
  assert(
    evidenceSources['src_ferritin_context_policy_v1'] && evidenceSources['src_ferritin_context_policy_v1'].biomedicalEvidenceClass === 'B',
    'Ferritin source should be evidence class B.',
  );
}
