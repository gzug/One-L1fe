import { CanonicalStatus, mapPriorityScore } from './biomarkers.ts';
import { getRuleProvenance, ProductEvidenceClass, RuleOrigin } from './provenance.ts';
import { evaluateByThreshold } from './thresholds.ts';
import {
  BiomarkerKey,
  FieldState,
  FreshnessState,
  InterpretabilityAssessment,
  InterpretationInput,
  InterpretabilityState,
  LipidHierarchyDecision,
  V1_RULE_VERSION,
  assessInterpretability,
  canContributeToPriorityScore,
  determineLipidHierarchyDecision,
  getBiomarkerOrThrow,
  statusSeverityMap,
} from './v1.ts';

export type RecommendationType =
  | 'inform'
  | 'monitor'
  | 'collect_more_data'
  | 'behavior_adjustment'
  | 'clinician_clarification';

export interface MinimumSliceEntryInput extends InterpretationInput {
  marker: BiomarkerKey;
}

export interface MinimumSlicePanelInput {
  profileId: string;
  panelId: string;
  collectedAt: string | Date;
  source?: string | null;
  entries: MinimumSliceEntryInput[];
}

export interface Recommendation {
  type: RecommendationType;
  verdict: string;
  text: string;
  evidenceSummary: string;
  confidence: 'high' | 'medium' | 'low';
  scope: string;
  handoffRequired: boolean;
  ruleId: string;
  anchorSourceId: string | undefined;
  ruleOrigin: RuleOrigin | undefined;
  productEvidenceClass: ProductEvidenceClass | undefined;
}

export interface EvaluatedEntry {
  marker: BiomarkerKey;
  displayName: string;
  value: number | null | undefined;
  fieldState?: FieldState;
  unit: string | null | undefined;
  interpretableState: InterpretabilityState;
  freshness: FreshnessState;
  canonicalStatus: CanonicalStatus | 'unknown';
  severity: number | null;
  scoreEligible: boolean;
  scoreContribution: number;
  ruleIds: string[];
  notes: string[];
  blockingReason: string | undefined;
}

export interface MinimumSliceEvaluation {
  profileId: string;
  panelId: string;
  ruleVersion: string;
  coverage: {
    state: 'complete' | 'partial' | 'missing' | 'interpretation_limited' | 'stale';
    notes: string[];
  };
  lipidDecision: LipidHierarchyDecision;
  entries: EvaluatedEntry[];
  priorityScore: {
    name: 'Priority Score';
    rawValue: number;
    value: number;
    includedMarkerCount: number;
    topDrivers: string[];
    boundedModifierNote?: string;
    excludedMarkerNote?: string;
    coverageSummary: string;
    freshnessNote: string;
  };
  recommendations: Recommendation[];
}

const REQUIRED_MINIMUM_SLICE_MARKERS: BiomarkerKey[] = ['apob', 'hba1c', 'glucose', 'ldl'];
const OPTIONAL_MINIMUM_SLICE_MARKERS: BiomarkerKey[] = ['lpa', 'crp', 'ferritin'];

function dedupeRecommendations(recommendations: Recommendation[]): Recommendation[] {
  const seen = new Set<string>();
  return recommendations.filter((recommendation) => {
    const key = [recommendation.type, recommendation.verdict, recommendation.ruleId].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildCoverageRecommendation(entry: EvaluatedEntry): Recommendation | null {
  if (entry.fieldState === 'disabled') {
    return null;
  }

  if (entry.interpretableState === InterpretabilityState.Missing) {
    return {
      type: 'collect_more_data',
      verdict: `${entry.displayName} is missing`,
      text: `Add ${entry.displayName} to the next relevant panel so this area can be interpreted directly.`,
      evidenceSummary: `${entry.displayName} is part of the minimum slice but no usable value is present.`,
      confidence: 'high',
      scope: 'coverage follow-up only, not a severity judgment',
      handoffRequired: false,
      ruleId: entry.ruleIds[0] ?? 'COV-001',
      anchorSourceId: undefined,
      ruleOrigin: undefined,
      productEvidenceClass: undefined,
    };
  }

  if (entry.blockingReason === 'missing_or_unsupported_unit') {
    return {
      type: 'collect_more_data',
      verdict: `${entry.displayName} cannot be interpreted safely yet`,
      text: `Capture ${entry.displayName} again with an explicit supported unit.`,
      evidenceSummary: `A raw ${entry.displayName} value exists, but the unit is missing or unsupported.`,
      confidence: 'high',
      scope: 'measurement-quality follow-up only, not diagnostic interpretation',
      handoffRequired: false,
      ruleId: 'COV-002',
      anchorSourceId: undefined,
      ruleOrigin: undefined,
      productEvidenceClass: undefined,
    };
  }

  if (entry.blockingReason === 'missing_assay') {
    return {
      type: 'collect_more_data',
      verdict: `${entry.displayName} needs assay clarity`,
      text: `Repeat or relabel ${entry.displayName} with explicit assay naming before using it for preventive interpretation.`,
      evidenceSummary: `${entry.displayName} is assay-sensitive and the current entry does not include usable assay metadata.`,
      confidence: 'high',
      scope: 'measurement-quality follow-up only, not a stable prevention signal',
      handoffRequired: false,
      ruleId: 'COV-003',
      anchorSourceId: undefined,
      ruleOrigin: undefined,
      productEvidenceClass: undefined,
    };
  }

  if (entry.blockingReason === 'stale_panel') {
    return {
      type: 'collect_more_data',
      verdict: `${entry.displayName} is too old for active scoring`,
      text: `Use a fresher panel before letting ${entry.displayName} shape the current Priority Score.`,
      evidenceSummary: `The stored ${entry.displayName} result is stale for active-use scoring.`,
      confidence: 'high',
      scope: 'freshness follow-up only, not severity escalation',
      handoffRequired: false,
      ruleId: 'COV-004',
      anchorSourceId: undefined,
      ruleOrigin: undefined,
      productEvidenceClass: undefined,
    };
  }

  return null;
}

function buildInterpretationRecommendation(entry: EvaluatedEntry): Recommendation | null {
  if (entry.interpretableState !== InterpretabilityState.Interpretable) return null;
  if (entry.canonicalStatus === 'unknown') return null;
  if (entry.canonicalStatus === CanonicalStatus.Optimal || entry.canonicalStatus === CanonicalStatus.Good) {
    return null;
  }

  if (entry.marker === 'apob') {
    return {
      type: entry.canonicalStatus === CanonicalStatus.Critical ? 'clinician_clarification' : 'behavior_adjustment',
      verdict: 'ApoB is a current lipid priority',
      text:
        entry.canonicalStatus === CanonicalStatus.Critical
          ? 'Use this as a clinician-clarification topic rather than treating the app output as a diagnosis.'
          : 'Treat the lipid pattern as a preventive focus area and tighten the next lifestyle review around this signal.',
      evidenceSummary: `ApoB is interpretable and currently maps to ${entry.canonicalStatus}.`,
      confidence: 'high',
      scope: 'preventive lipid follow-up only, not diagnostic assessment',
      handoffRequired: entry.canonicalStatus === CanonicalStatus.Critical,
      ruleId: 'LIP-001',
      anchorSourceId: undefined,
      ruleOrigin: undefined,
      productEvidenceClass: undefined,
    };
  }

  if (entry.marker === 'hba1c' || entry.marker === 'glucose') {
    return {
      type: 'behavior_adjustment',
      verdict: `${entry.displayName} deserves metabolic follow-up`,
      text: `Use this as a bounded metabolic review signal and re-check it against routine, meal timing, and the next fresh panel.`,
      evidenceSummary: `${entry.displayName} is interpretable and currently maps to ${entry.canonicalStatus}.`,
      confidence: 'high',
      scope: 'preventive metabolic follow-up only, not diagnosis or treatment advice',
      handoffRequired: false,
      ruleId: entry.marker === 'hba1c' ? 'MET-001' : 'MET-002',
      anchorSourceId: undefined,
      ruleOrigin: undefined,
      productEvidenceClass: undefined,
    };
  }

  if (entry.marker === 'ldl') {
    return {
      type: 'inform',
      verdict: 'LDL is elevated in the fallback / secondary lens',
      text: 'Keep LDL visible, but do not treat it as an independent co-equal lipid driver when ApoB is available.',
      evidenceSummary: `LDL is interpretable and currently maps to ${entry.canonicalStatus}.`,
      confidence: 'medium',
      scope: 'lipid context only, subordinate to ApoB-primary logic',
      handoffRequired: false,
      ruleId: 'LIP-002',
      anchorSourceId: undefined,
      ruleOrigin: undefined,
      productEvidenceClass: undefined,
    };
  }

  if (entry.marker === 'lpa') {
    return {
      type: 'inform',
      verdict: 'Lp(a) acts as a bounded inherited-risk modifier',
      text: 'Keep this as a bounded modifier or discussion point, not a recurring hard score driver.',
      evidenceSummary: `Lp(a) is interpretable in an explicit unit path and currently maps to ${entry.canonicalStatus}.`,
      confidence: 'medium',
      scope: 'bounded inherited-risk context only, not a recurring severity engine',
      handoffRequired: false,
      ruleId: 'LIP-004',
      anchorSourceId: undefined,
      ruleOrigin: undefined,
      productEvidenceClass: undefined,
    };
  }

  if (entry.marker === 'crp') {
    return {
      type: 'monitor',
      verdict: 'Inflammation signal is bounded and context-sensitive',
      text: 'Use this only as a supporting preventive signal when assay and context stay clear over time.',
      evidenceSummary: `CRP / hs-CRP is interpretable and currently maps to ${entry.canonicalStatus}.`,
      confidence: 'medium',
      scope: 'supporting inflammation context only, not a standalone disease conclusion',
      handoffRequired: false,
      ruleId: 'INF-001',
      anchorSourceId: undefined,
      ruleOrigin: undefined,
      productEvidenceClass: undefined,
    };
  }

  if (entry.marker === 'ferritin') {
    // Low ferritin: directly actionable.
    if (
      entry.canonicalStatus === CanonicalStatus.High ||
      entry.canonicalStatus === CanonicalStatus.Critical
    ) {
      return {
        type: entry.canonicalStatus === CanonicalStatus.Critical ? 'clinician_clarification' : 'monitor',
        verdict: 'Low ferritin — iron stores need attention',
        text:
          entry.canonicalStatus === CanonicalStatus.Critical
            ? 'Critically low ferritin warrants clinician review before any supplementation.'
            : 'Ferritin is below the adequate range. Revisit dietary iron intake and track trend over the next panel.',
        evidenceSummary: `Ferritin is interpretable and currently maps to ${entry.canonicalStatus} (low iron stores).`,
        confidence: 'medium',
        scope: 'iron-status context only — not a diagnosis of iron-deficiency anaemia',
        handoffRequired: entry.canonicalStatus === CanonicalStatus.Critical,
        ruleId: 'CTX-001',
        anchorSourceId: undefined,
        ruleOrigin: undefined,
        productEvidenceClass: undefined,
      };
    }

    // Elevated ferritin: context gate — always Borderline until context is collected.
    if (entry.canonicalStatus === CanonicalStatus.Borderline) {
      return {
        type: 'collect_more_data',
        verdict: 'Elevated ferritin — context needed before escalation',
        text:
          'Ferritin is above the good range but context (inflammation markers, liver function, iron-transport panel) is not yet captured. Collect context before treating this as a severity signal.',
        evidenceSummary:
          'Elevated ferritin without inflammation / liver / iron-transport context. CTX-001 holds interpretation at Borderline.',
        confidence: 'medium',
        scope: 'iron-storage context only — not a severity conclusion without supporting data',
        handoffRequired: false,
        ruleId: 'CTX-001',
        anchorSourceId: undefined,
        ruleOrigin: undefined,
        productEvidenceClass: undefined,
      };
    }

    return null;
  }

  return null;
}

function toCoverageState(entries: EvaluatedEntry[]): MinimumSliceEvaluation['coverage']['state'] {
  const requiredEntries = entries.filter((entry) => REQUIRED_MINIMUM_SLICE_MARKERS.includes(entry.marker));

  if (requiredEntries.some((entry) => entry.freshness === FreshnessState.Stale)) return 'stale';
  if (requiredEntries.some((entry) => entry.interpretableState === InterpretabilityState.InterpretationLimited)) {
    return 'interpretation_limited';
  }
  if (requiredEntries.every((entry) => entry.interpretableState === InterpretabilityState.Missing)) return 'missing';
  if (requiredEntries.every((entry) => entry.interpretableState === InterpretabilityState.Interpretable)) return 'complete';
  return 'partial';
}

function summarizeCoverageNotes(entries: EvaluatedEntry[], lipidDecision: LipidHierarchyDecision): string[] {
  const notes = new Set<string>();

  for (const entry of entries) {
    if (entry.fieldState === 'disabled') {
      notes.add(`${entry.displayName} was intentionally not provided and is excluded from active use.`);
      continue;
    }

    if (entry.interpretableState === InterpretabilityState.Missing) {
      notes.add(`Missing ${entry.displayName}.`);
    }
    if (entry.blockingReason === 'missing_or_unsupported_unit') {
      notes.add(`${entry.displayName} has missing or unsupported unit metadata.`);
    }
    if (entry.blockingReason === 'missing_assay') {
      notes.add(`${entry.displayName} is blocked by missing assay metadata.`);
    }
    if (entry.blockingReason === 'stale_panel') {
      notes.add(`${entry.displayName} is stale for active-use scoring.`);
    }
  }

  for (const note of lipidDecision.notes) {
    notes.add(note);
  }

  return Array.from(notes);
}

/**
 * Returns the fallback ruleId list for an entry that has no threshold
 * evaluation output. Extracted from buildEntry() for readability and testability.
 */
function getFallbackRuleIds(
  marker: BiomarkerKey,
  assessment: InterpretabilityAssessment,
  input: MinimumSliceEntryInput,
): string[] {
  if (input.field_state === 'disabled') {
    return [];
  }
  if (marker === 'apob' && assessment.state === InterpretabilityState.Missing) {
    return ['LIP-003', 'COV-001'];
  }
  if (assessment.blockingReason === 'missing_or_unsupported_unit') return ['COV-002'];
  if (assessment.blockingReason === 'missing_assay') return ['COV-003'];
  if (assessment.blockingReason === 'stale_panel') return ['COV-004'];
  return [];
}

function buildEntry(
  input: MinimumSliceEntryInput,
  assessment: InterpretabilityAssessment,
  lipidDecision: LipidHierarchyDecision,
): EvaluatedEntry {
  const biomarker = getBiomarkerOrThrow(input.marker);
  const thresholdEvaluation =
    assessment.state === InterpretabilityState.Interpretable && input.value != null && input.unit
      ? evaluateByThreshold({ marker: input.marker, value: input.value, unit: input.unit })
      : null;

  const canonicalStatus = thresholdEvaluation?.canonicalStatus ?? 'unknown';
  const severity = canonicalStatus === 'unknown' ? null : statusSeverityMap[canonicalStatus];
  const scoreEligible = canContributeToPriorityScore({
    marker: input.marker,
    assessment,
    lipidDecision,
  });

  const definitionWeight = biomarker.priorityWeight ?? 0;
  const scoreContribution = scoreEligible && severity != null ? severity * definitionWeight : 0;

  const ruleIds = thresholdEvaluation?.ruleIds?.length
    ? thresholdEvaluation.ruleIds
    : getFallbackRuleIds(input.marker, assessment, input);

  const notes = [
    ...(thresholdEvaluation?.notes ?? []),
    ...(input.marker === 'ldl' ? lipidDecision.notes : []),
    ...(input.marker === 'glucose' && input.fastingContext == null
      ? ['Fasting context is unknown, so interpretation stays bounded.']
      : []),
  ];

  return {
    marker: input.marker,
    displayName: biomarker.displayName,
    value: input.value,
    ...(input.field_state !== undefined ? { fieldState: input.field_state } : {}),
    unit: input.unit,
    interpretableState: assessment.state,
    freshness: assessment.freshness,
    canonicalStatus,
    severity,
    scoreEligible,
    scoreContribution,
    ruleIds,
    notes,
    blockingReason: assessment.blockingReason,
  };
}

export function evaluateMinimumSlice(
  panel: MinimumSlicePanelInput,
  now: Date = new Date(),
): MinimumSliceEvaluation {
  const entriesByMarker = new Map<BiomarkerKey, MinimumSliceEntryInput>();

  for (const entry of panel.entries) {
    entriesByMarker.set(entry.marker, {
      ...entry,
      collectedAt: entry.collectedAt ?? panel.collectedAt,
    });
  }

  const apobAssessment = assessInterpretability(
    entriesByMarker.get('apob') ?? { marker: 'apob', collectedAt: panel.collectedAt },
    now,
  );
  const ldlAssessment = assessInterpretability(
    entriesByMarker.get('ldl') ?? { marker: 'ldl', collectedAt: panel.collectedAt },
    now,
  );
  const lipidDecision = determineLipidHierarchyDecision({ apob: apobAssessment, ldl: ldlAssessment });

  const orderedMarkers: BiomarkerKey[] = [
    ...REQUIRED_MINIMUM_SLICE_MARKERS,
    ...OPTIONAL_MINIMUM_SLICE_MARKERS.filter((marker) => entriesByMarker.has(marker)),
  ];

  const evaluatedEntries = orderedMarkers.map((marker) => {
    const entry = entriesByMarker.get(marker) ?? { marker, collectedAt: panel.collectedAt };
    const assessment =
      marker === 'apob' ? apobAssessment : marker === 'ldl' ? ldlAssessment : assessInterpretability(entry, now);
    return buildEntry(entry, assessment, lipidDecision);
  });

  const rawScore = evaluatedEntries.reduce((total, entry) => total + entry.scoreContribution, 0);
  const includedEntries = evaluatedEntries.filter((entry) => entry.scoreEligible && entry.scoreContribution > 0);
  const sortedDrivers = [...includedEntries].sort((a, b) => b.scoreContribution - a.scoreContribution);
  const topDrivers = sortedDrivers.map((entry) => entry.displayName);

  const coverageNotes = summarizeCoverageNotes(evaluatedEntries, lipidDecision);
  const coverageState = toCoverageState(evaluatedEntries);
  const recommendations = dedupeRecommendations(
    evaluatedEntries
      .flatMap((entry) => [buildCoverageRecommendation(entry), buildInterpretationRecommendation(entry)])
      .filter((recommendation): recommendation is Recommendation => Boolean(recommendation))
      .map((recommendation) => {
        const provenance = getRuleProvenance(recommendation.ruleId);
        return {
          ...recommendation,
          anchorSourceId: provenance?.anchorSourceId,
          ruleOrigin: provenance?.origin,
          productEvidenceClass: provenance?.productEvidenceClass,
        };
      }),
  );

  const hasBoundedModifier = evaluatedEntries.some(
    (entry) => (entry.marker === 'lpa' || entry.marker === 'crp') && entry.interpretableState === InterpretabilityState.Interpretable,
  );
  const hasExcludedSignals = evaluatedEntries.some((entry) => !entry.scoreEligible && entry.interpretableState === InterpretabilityState.Interpretable);

  const priorityScore: MinimumSliceEvaluation['priorityScore'] = {
    name: 'Priority Score',
    rawValue: rawScore,
    value: mapPriorityScore(rawScore),
    includedMarkerCount: includedEntries.length,
    topDrivers,
    coverageSummary: coverageNotes.join(' '),
    freshnessNote: evaluatedEntries.some((entry) => entry.freshness === FreshnessState.Stale)
      ? 'At least one minimum-slice marker is stale and blocked from active scoring.'
      : 'Freshness is acceptable for the currently included score inputs.',
  };

  if (hasBoundedModifier) {
    priorityScore.boundedModifierNote =
      'Bounded modifiers are visible but do not behave like major recurring core score drivers.';
  }

  if (hasExcludedSignals) {
    priorityScore.excludedMarkerNote =
      'Some interpretable signals are intentionally excluded from the hard core score.';
  }

  return {
    profileId: panel.profileId,
    panelId: panel.panelId,
    ruleVersion: V1_RULE_VERSION,
    coverage: {
      state: coverageState,
      notes: coverageNotes,
    },
    lipidDecision,
    entries: evaluatedEntries,
    priorityScore,
    recommendations,
  };
}
