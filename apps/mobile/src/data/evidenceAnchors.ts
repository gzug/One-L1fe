import { getMobileSupabaseClient } from '../../mobileSupabaseAuth.ts';
import { loadEvidenceForRules, EvidenceAnchor } from '../../../../packages/domain/evidenceRegistry.ts';

const evidenceAnchorCache = new Map<string, EvidenceAnchor[]>();

function cacheKey(ruleIds: string[]): string {
  return Array.from(new Set(ruleIds)).sort().join('|');
}

export async function loadEvidenceAnchorsForRuleIds(ruleIds: string[]): Promise<EvidenceAnchor[]> {
  const key = cacheKey(ruleIds);
  const cached = evidenceAnchorCache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const client = getMobileSupabaseClient();
  const grouped = await loadEvidenceForRules(client, ruleIds);
  const anchors = Array.from(grouped.values()).flat();
  evidenceAnchorCache.set(key, anchors);
  return anchors;
}
