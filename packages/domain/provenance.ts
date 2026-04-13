import { getRuleEvidenceLink, ProductEvidenceClass, RuleOrigin } from './evidenceRegistry.ts';

export type { ProductEvidenceClass, RuleOrigin };

export interface RuleProvenance {
  ruleId: string;
  anchorSourceId?: string;
  supportingSourceIds?: string[];
  origin: RuleOrigin;
  productEvidenceClass: ProductEvidenceClass;
}

export function getRuleProvenance(ruleId: string): RuleProvenance | undefined {
  const link = getRuleEvidenceLink(ruleId);
  if (!link) return undefined;

  return {
    ruleId: link.ruleId,
    anchorSourceId: link.anchorSourceId,
    supportingSourceIds: link.supportingSourceIds,
    origin: link.origin,
    productEvidenceClass: link.productEvidenceClass,
  };
}
