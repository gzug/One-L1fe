import { CanonicalStatus } from './biomarkers.ts';
import { BiomarkerKey } from './v1.ts';

export interface ThresholdEvaluation {
  canonicalStatus: CanonicalStatus;
  ruleIds: string[];
  notes?: string[];
}

export interface ThresholdInput {
  marker: BiomarkerKey;
  value: number;
  unit: string;
}

function evaluateUpperBoundThresholds(
  value: number,
  thresholds: {
    optimalMax: number;
    goodMax: number;
    borderlineMax: number;
    highMax: number;
  },
): CanonicalStatus {
  if (value <= thresholds.optimalMax) return CanonicalStatus.Optimal;
  if (value <= thresholds.goodMax) return CanonicalStatus.Good;
  if (value <= thresholds.borderlineMax) return CanonicalStatus.Borderline;
  if (value <= thresholds.highMax) return CanonicalStatus.High;
  return CanonicalStatus.Critical;
}

function evaluateLowerBoundThresholds(
  value: number,
  thresholds: {
    optimalMin: number;
    goodMin: number;
    borderlineMin: number;
    highMin: number;
  },
): CanonicalStatus {
  if (value >= thresholds.optimalMin) return CanonicalStatus.Optimal;
  if (value >= thresholds.goodMin) return CanonicalStatus.Good;
  if (value >= thresholds.borderlineMin) return CanonicalStatus.Borderline;
  if (value >= thresholds.highMin) return CanonicalStatus.High;
  return CanonicalStatus.Critical;
}

/**
 * ApoB — LIP-001
 * optimalMax tightened 80 → 60 per Attia primordial prevention target.
 * goodMax stays 90 as the practical achievable band with intervention.
 */
export function evaluateApoB(value: number, unit: string): ThresholdEvaluation | null {
  if (unit !== 'mg/dL') return null;

  return {
    canonicalStatus: evaluateUpperBoundThresholds(value, {
      optimalMax: 60,
      goodMax: 80,
      borderlineMax: 100,
      highMax: 130,
    }),
    ruleIds: ['LIP-001'],
    notes: ['optimalMax tightened to 60 mg/dL per Attia primordial prevention standard (Medicine 3.0).'],
  };
}

export function evaluateLDL(value: number, unit: string): ThresholdEvaluation | null {
  if (unit !== 'mg/dL') return null;

  return {
    canonicalStatus: evaluateUpperBoundThresholds(value, {
      optimalMax: 70,
      goodMax: 100,
      borderlineMax: 130,
      highMax: 160,
    }),
    ruleIds: ['LIP-002'],
  };
}

export function evaluateHbA1c(value: number, unit: string): ThresholdEvaluation | null {
  if (unit === '%') {
    return {
      canonicalStatus: evaluateUpperBoundThresholds(value, {
        optimalMax: 5.3,
        goodMax: 5.6,
        borderlineMax: 5.9,
        highMax: 6.4,
      }),
      ruleIds: ['MET-001'],
    };
  }

  if (unit === 'mmol/mol') {
    return {
      canonicalStatus: evaluateUpperBoundThresholds(value, {
        optimalMax: 34,
        goodMax: 38,
        borderlineMax: 41,
        highMax: 46,
      }),
      ruleIds: ['MET-001'],
      notes: ['Evaluated through the explicit mmol/mol threshold path.'],
    };
  }

  return null;
}

export function evaluateGlucose(value: number, unit: string): ThresholdEvaluation | null {
  if (unit === 'mg/dL') {
    return {
      canonicalStatus: evaluateUpperBoundThresholds(value, {
        optimalMax: 85,
        goodMax: 99,
        borderlineMax: 109,
        highMax: 125,
      }),
      ruleIds: ['MET-002'],
    };
  }

  if (unit === 'mmol/L') {
    return {
      canonicalStatus: evaluateUpperBoundThresholds(value, {
        optimalMax: 4.7,
        goodMax: 5.5,
        borderlineMax: 6.0,
        highMax: 6.9,
      }),
      ruleIds: ['MET-002'],
      notes: ['Evaluated through the explicit mmol/L threshold path.'],
    };
  }

  return null;
}

export function evaluateLpa(value: number, unit: string): ThresholdEvaluation | null {
  if (unit === 'mg/dL') {
    return {
      canonicalStatus: evaluateUpperBoundThresholds(value, {
        optimalMax: 30,
        goodMax: 50,
        borderlineMax: 75,
        highMax: 125,
      }),
      ruleIds: ['LIP-004'],
      notes: ['Bounded modifier path only.'],
    };
  }

  if (unit === 'nmol/L') {
    return {
      canonicalStatus: evaluateUpperBoundThresholds(value, {
        optimalMax: 75,
        goodMax: 125,
        borderlineMax: 175,
        highMax: 250,
      }),
      ruleIds: ['LIP-004'],
      notes: ['Bounded modifier path only.'],
    };
  }

  return null;
}

export function evaluateCRP(value: number, unit: string): ThresholdEvaluation | null {
  if (unit !== 'mg/L') return null;

  return {
    canonicalStatus: evaluateUpperBoundThresholds(value, {
      optimalMax: 1,
      goodMax: 2,
      borderlineMax: 3,
      highMax: 10,
    }),
    ruleIds: ['INF-001'],
    notes: ['Valid only when assay is known and acute-context exclusion does not apply.'],
  };
}

/**
 * Vitamin D — SUP-001 / SUP-002
 * optimalMin raised 30 → 40 ng/mL per Attia target range 40–60 ng/mL.
 * goodMin stays 30 as the practical floor for sufficiency.
 */
export function evaluateVitaminD(value: number, unit: string): ThresholdEvaluation | null {
  if (unit === 'ng/mL') {
    return {
      canonicalStatus: evaluateLowerBoundThresholds(value, {
        optimalMin: 40,
        goodMin: 30,
        borderlineMin: 20,
        highMin: 10,
      }),
      ruleIds: ['SUP-001', 'SUP-002'],
      notes: ['optimalMin raised to 40 ng/mL per Attia target range 40–60 ng/mL.'],
    };
  }

  if (unit === 'nmol/L') {
    return {
      canonicalStatus: evaluateLowerBoundThresholds(value, {
        optimalMin: 100,
        goodMin: 75,
        borderlineMin: 50,
        highMin: 25,
      }),
      ruleIds: ['SUP-001', 'SUP-002'],
      notes: ['optimalMin raised to 100 nmol/L (≈40 ng/mL) per Attia target range.'],
    };
  }

  return null;
}

/**
 * Ferritin: context-gated interpretation (CTX-001 / CTX-002).
 *
 * Low ferritin is directly interpretable.
 * Elevated ferritin without context → Borderline + context-gate note (CTX-001).
 * Elevated ferritin with inflammation/liver/iron-transport context → escalated (CTX-002, draft).
 *
 * Units: ng/mL (= µg/L, numerically identical).
 * Sex-specific lower bound: female < 15, male < 30 → Low / Critical.
 * Upper escalation thresholds are population-level (not sex-specific in V1).
 *
 * TODO(CTX-002): wire `hasInflammationContext` signal from slice layer once
 * context-field collection is implemented. Until then CTX-002 remains draft.
 */
export function evaluateFerritin(
  value: number,
  unit: string,
  opts: { sex?: 'male' | 'female'; hasInflammationContext?: boolean } = {},
): ThresholdEvaluation | null {
  if (unit !== 'ng/mL' && unit !== 'µg/L') return null;

  const { sex, hasInflammationContext = false } = opts;

  // --- Low end (directly interpretable, sex-specific lower bound) ---
  const lowCriticalThreshold = sex === 'female' ? 7 : 10;
  const lowThreshold = sex === 'female' ? 15 : 30;

  if (value < lowCriticalThreshold) {
    return {
      canonicalStatus: CanonicalStatus.Critical,
      ruleIds: ['CTX-001'],
      notes: ['Critically low ferritin — iron depletion likely.'],
    };
  }

  if (value < lowThreshold) {
    return {
      canonicalStatus: CanonicalStatus.High,
      ruleIds: ['CTX-001'],
      notes: ['Low ferritin — iron stores depleted or borderline.'],
    };
  }

  // --- Optimal / Good band ---
  const optimalMax = sex === 'female' ? 150 : 200;
  const goodMax = sex === 'female' ? 200 : 300;

  if (value <= optimalMax) {
    return {
      canonicalStatus: CanonicalStatus.Optimal,
      ruleIds: ['CTX-001'],
    };
  }

  if (value <= goodMax) {
    return {
      canonicalStatus: CanonicalStatus.Good,
      ruleIds: ['CTX-001'],
    };
  }

  // --- Elevated band (context-gated) ---
  if (hasInflammationContext) {
    return {
      canonicalStatus: value > 500 ? CanonicalStatus.Critical : CanonicalStatus.High,
      ruleIds: ['CTX-001', 'CTX-002'],
      notes: [
        'Elevated ferritin with supporting context (inflammation / liver / iron-transport) — bounded escalation applied.',
        'CTX-002 is draft; context-field wiring pending.',
      ],
    };
  }

  return {
    canonicalStatus: CanonicalStatus.Borderline,
    ruleIds: ['CTX-001'],
    notes: [
      'Elevated ferritin without inflammation, liver, or iron-transport context.',
      'Context collection required before escalation (CTX-001).',
    ],
  };
}

/**
 * Triglycerides — LIP-003
 * optimalMax: 100 mg/dL per Medicine 3.0 / Attia framework.
 * Standard clinical cutoff is 150; tightened here for primordial prevention.
 */
export function evaluateTriglycerides(value: number, unit: string): ThresholdEvaluation | null {
  if (unit === 'mg/dL') {
    return {
      canonicalStatus: evaluateUpperBoundThresholds(value, {
        optimalMax: 100,
        goodMax: 130,
        borderlineMax: 150,
        highMax: 200,
      }),
      ruleIds: ['LIP-003'],
      notes: ['optimalMax set to 100 mg/dL per Medicine 3.0 primordial prevention standard.'],
    };
  }

  if (unit === 'mmol/L') {
    return {
      canonicalStatus: evaluateUpperBoundThresholds(value, {
        optimalMax: 1.13,
        goodMax: 1.47,
        borderlineMax: 1.7,
        highMax: 2.26,
      }),
      ruleIds: ['LIP-003'],
      notes: ['Evaluated through mmol/L path. optimalMax ≈ 100 mg/dL.'],
    };
  }

  return null;
}

/**
 * DAO — CTX-003 [LOW_CONFIDENCE]
 * Diamine oxidase as a proxy for histamine intolerance / gut barrier integrity.
 * Evidence is limited; treat as contextual signal only.
 * evaluateByThreshold routes here but the scoring engine applies
 * evidenceConfidenceModifier: 0.3 from biomarkers.ts, suppressing score contribution.
 */
export function evaluateDAO(value: number, unit: string): ThresholdEvaluation | null {
  if (unit !== 'U/mL') return null;

  return {
    canonicalStatus: evaluateLowerBoundThresholds(value, {
      optimalMin: 10,
      goodMin: 6,
      borderlineMin: 3,
      highMin: 1,
    }),
    ruleIds: ['CTX-003'],
    notes: [
      'LOW_CONFIDENCE: DAO assay standardisation is poor across labs.',
      'Treat as contextual signal only. Score contribution suppressed via evidenceConfidenceModifier: 0.3.',
    ],
  };
}

export function evaluateByThreshold(input: ThresholdInput): ThresholdEvaluation | null {
  switch (input.marker) {
    case 'apob':
      return evaluateApoB(input.value, input.unit);
    case 'ldl':
      return evaluateLDL(input.value, input.unit);
    case 'hba1c':
      return evaluateHbA1c(input.value, input.unit);
    case 'glucose':
      return evaluateGlucose(input.value, input.unit);
    case 'lpa':
      return evaluateLpa(input.value, input.unit);
    case 'crp':
      return evaluateCRP(input.value, input.unit);
    case 'vitamin_d':
      return evaluateVitaminD(input.value, input.unit);
    case 'ferritin':
      return evaluateFerritin(input.value, input.unit);
    case 'triglycerides':
      return evaluateTriglycerides(input.value, input.unit);
    case 'dao':
      return evaluateDAO(input.value, input.unit);
    default:
      return null;
  }
}
