import {
  getEvidenceSource,
  getRuleEvidenceLink,
  ProductEvidenceClass,
  RuleOrigin,
  SourceBucket,
} from './evidenceRegistry.ts';

export type PriorityPillar = 'cardiovascular' | 'metabolic' | 'inflammation' | 'nutrientContext';
export type PriorityBucket = 0 | 1 | 2 | 3 | 4;
export type EvidenceClass = 'strong' | 'moderate' | 'limited' | 'unanchored';
export type BucketReason =
  | 'NO_DATA'
  | 'HIGHEST_WEIGHTED_MARKER'
  | 'CLAMPED_BY_APOB_PRIMARY'
  | 'NOT_EVIDENCE_ANCHORED';

export interface BucketAndReason {
  bucket: PriorityBucket;
  reason: BucketReason;
  markerKey: string | null;
  weightedScore: number;
}

export interface EvidenceAnchor {
  ruleId: string;
  anchorSourceId: string;
  title: string;
  sourceBucket: SourceBucket;
  origin: RuleOrigin;
  productEvidenceClass: ProductEvidenceClass;
  supportingSourceIds: string[];
}

export interface TrendSkeleton {
  markerKey: string;
  samples: Array<{ timestamp: string; value: number }>;
  windowDays: number;
  sparse: boolean;
  note: 'READ_ONLY_V1_NOT_COUPLED_TO_SCORE';
}

export interface PriorityScoreResult {
  rawScore: number;
  bucket: PriorityBucket;
  pillarScores: {
    cardiovascular: BucketAndReason;
    metabolic: BucketAndReason;
    inflammation: BucketAndReason;
    nutrientContext: BucketAndReason;
  };
  evidenceClass: EvidenceClass;
  anchors: EvidenceAnchor[];
  trendSkeleton: TrendSkeleton | null;
}

export function emptyBucketAndReason(reason: BucketReason = 'NO_DATA'): BucketAndReason {
  return {
    bucket: 0,
    reason,
    markerKey: null,
    weightedScore: 0,
  };
}

export function loadEvidenceForRules(ruleIds: string[]): EvidenceAnchor[] {
  const seen = new Set<string>();
  const anchors: EvidenceAnchor[] = [];

  for (const ruleId of ruleIds) {
    const link = getRuleEvidenceLink(ruleId);
    if (!link) {
      continue;
    }

    const dedupeKey = `${ruleId}:${link.anchorSourceId}`;
    if (seen.has(dedupeKey)) {
      continue;
    }

    const source = getEvidenceSource(link.anchorSourceId);
    if (!source) {
      continue;
    }

    seen.add(dedupeKey);
    anchors.push({
      ruleId,
      anchorSourceId: link.anchorSourceId,
      title: source.title,
      sourceBucket: source.bucket,
      origin: link.origin,
      productEvidenceClass: link.productEvidenceClass,
      supportingSourceIds: link.supportingSourceIds,
    });
  }

  return anchors;
}

export function classifyEvidenceClass(anchors: EvidenceAnchor[]): EvidenceClass {
  if (anchors.length === 0) {
    return 'unanchored';
  }

  if (
    anchors.some(
      (anchor) =>
        anchor.sourceBucket === 'heuristic' ||
        anchor.sourceBucket === 'discard' ||
        anchor.origin === 'policy_choice' ||
        anchor.productEvidenceClass === 'P2' ||
        anchor.productEvidenceClass === 'P3',
    )
  ) {
    return 'limited';
  }

  if (
    anchors.some(
      (anchor) => anchor.sourceBucket === 'secondary' || anchor.origin === 'evidence_extrapolated',
    )
  ) {
    return 'moderate';
  }

  return 'strong';
}
