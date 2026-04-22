import { aggregateTotalPriorityScoreWithEvidence, mapPriorityScore } from './biomarkers.ts';
import {
  EvidenceAnchor,
  getEvidenceSource,
  getProductEvidenceUICopy,
  loadEvidenceForRules,
  ProductEvidenceClassification,
} from './evidenceRegistry.ts';
import { evaluateMinimumSlice, MinimumSlicePanelInput, Recommendation } from './minimumSlice.ts';

export interface PriorityScoreRuntimeSummary {
  rawScore: number;
  mappedValue: number;
  productEvidenceClass: ProductEvidenceClassification;
  anchorCount: number;
  uiCopy: string;
  topDrivers: string[];
}

export interface PriorityScoreRuntimeRecommendation {
  ruleId: string;
  verdict: string;
  text: string;
  confidence: Recommendation['confidence'];
  anchorSourceId?: string;
  productEvidenceClass?: string;
}

export interface PriorityScoreRuntimeEvidenceLink {
  ruleId: string;
  sourceId: string;
  title: string;
  canonicalUrlOrDoi: string;
  tier: number;
  bucket: string;
}

export interface ComputePriorityScoreRuntimeResult {
  priorityScore: PriorityScoreRuntimeSummary;
  topRecommendations: PriorityScoreRuntimeRecommendation[];
  evidenceLinks: PriorityScoreRuntimeEvidenceLink[];
  appliedRuleIds: string[];
}

function uniqueRuleIds(input: string[]): string[] {
  return Array.from(new Set(input.filter((value) => value.trim().length > 0)));
}

function toBiomarkerValues(panel: MinimumSlicePanelInput): Record<string, number | null | undefined> {
  return Object.fromEntries(
    panel.entries.map((entry) => [
      entry.marker,
      typeof entry.value === 'number' && Number.isFinite(entry.value) ? entry.value : null,
    ]),
  );
}

function collectRuleIds(panelEvaluation: ReturnType<typeof evaluateMinimumSlice>): string[] {
  return uniqueRuleIds([
    ...panelEvaluation.recommendations.map((recommendation) => recommendation.ruleId),
    ...panelEvaluation.entries.flatMap((entry) => entry.ruleIds),
  ]);
}

function flattenAnchors(evidenceByRule: Record<string, EvidenceAnchor[]>): EvidenceAnchor[] {
  const seen = new Set<string>();
  const anchors: EvidenceAnchor[] = [];

  for (const ruleAnchors of Object.values(evidenceByRule)) {
    for (const anchor of ruleAnchors) {
      const key = `${anchor.sourceId}:${anchor.tier}`;
      if (seen.has(key)) continue;
      seen.add(key);
      anchors.push(anchor);
    }
  }

  return anchors;
}

function buildEvidenceLinks(evidenceByRule: Record<string, EvidenceAnchor[]>): PriorityScoreRuntimeEvidenceLink[] {
  const links: PriorityScoreRuntimeEvidenceLink[] = [];
  const seen = new Set<string>();

  for (const [ruleId, anchors] of Object.entries(evidenceByRule)) {
    for (const anchor of anchors) {
      const source = getEvidenceSource(anchor.sourceId);
      if (!source) continue;

      const key = `${ruleId}:${anchor.sourceId}:${anchor.tier}`;
      if (seen.has(key)) continue;
      seen.add(key);

      links.push({
        ruleId,
        sourceId: anchor.sourceId,
        title: source.title,
        canonicalUrlOrDoi: source.canonicalUrlOrDoi,
        tier: anchor.tier,
        bucket: anchor.bucket,
      });
    }
  }

  return links;
}

function buildTopRecommendations(recommendations: Recommendation[]): PriorityScoreRuntimeRecommendation[] {
  return recommendations.slice(0, 3).map((recommendation) => ({
    ruleId: recommendation.ruleId,
    verdict: recommendation.verdict,
    text: recommendation.text,
    confidence: recommendation.confidence,
    ...(recommendation.anchorSourceId !== undefined ? { anchorSourceId: recommendation.anchorSourceId } : {}),
    ...(recommendation.productEvidenceClass !== undefined
      ? { productEvidenceClass: recommendation.productEvidenceClass }
      : {}),
  }));
}

export async function computePriorityScoreRuntime(
  supabase: any,
  panel: MinimumSlicePanelInput,
  now: Date = new Date(),
): Promise<ComputePriorityScoreRuntimeResult> {
  const evaluation = evaluateMinimumSlice(panel, now);
  const appliedRuleIds = collectRuleIds(evaluation);
  const evidenceByRule = await loadEvidenceForRules(supabase, appliedRuleIds);
  const anchors = flattenAnchors(evidenceByRule);

  if (anchors.length === 0) {
    throw new Error('Priority score runtime could not load evidence anchors for the applicable rules.');
  }

  const aggregate = aggregateTotalPriorityScoreWithEvidence(
    toBiomarkerValues(panel),
    anchors.map((anchor) => ({
      sourceId: anchor.sourceId,
      tier: anchor.tier,
      bucket: anchor.bucket,
    })),
  );

  return {
    priorityScore: {
      rawScore: aggregate.score,
      mappedValue: mapPriorityScore(aggregate.score),
      productEvidenceClass: aggregate.product_evidence_class,
      anchorCount: aggregate.anchor_count,
      uiCopy: getProductEvidenceUICopy(aggregate.product_evidence_class),
      topDrivers: evaluation.priorityScore.topDrivers,
    },
    topRecommendations: buildTopRecommendations(evaluation.recommendations),
    evidenceLinks: buildEvidenceLinks(evidenceByRule),
    appliedRuleIds,
  };
}
