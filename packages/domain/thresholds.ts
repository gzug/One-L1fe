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

export function evaluateApoB(value: number, unit: string): ThresholdEvaluation | null {
  if (unit !== 'mg/dL') return null;

  return {
    canonicalStatus: evaluateUpperBoundThresholds(value, {
      optimalMax: 60,
      goodMax: 80,
      borderlineMax: 100,
      highMax: 120,
    }),
    ruleIds: ['LIP-001'],
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

export function evaluateVitaminD(value: number, unit: string): ThresholdEvaluation | null {
  if (unit === 'ng/mL') {
    return {
      canonicalStatus: evaluateLowerBoundThresholds(value, {
        optimalMin: 40,
        goodMin: 30,
        borderlineMin: 20,
        highMin: 12,
      }),
      ruleIds: ['SUP-001', 'SUP-002'],
    };
  }

  if (unit === 'nmol/L') {
    return {
      canonicalStatus: evaluateLowerBoundThresholds(value, {
        optimalMin: 100,
        goodMin: 75,
        borderlineMin: 50,
        highMin: 30,
      }),
      ruleIds: ['SUP-001', 'SUP-002'],
    };
  }

  return null;
}

export function evaluateFerritin(value: number, unit: string): ThresholdEvaluation | null {
  if (unit !== 'ng/mL') return null;

  return {
    canonicalStatus: evaluateLowerBoundThresholds(value, {
      optimalMin: 50,
      goodMin: 30,
      borderlineMin: 20,
      highMin: 15,
    }),
    ruleIds: ['SUP-001', 'SUP-002'],
  };
}

export function evaluateTriglycerides(value: number, unit: string): ThresholdEvaluation | null {
  if (unit !== 'mg/dL') return null;

  return {
    canonicalStatus: evaluateUpperBoundThresholds(value, {
      optimalMax: 100,
      goodMax: 130,
      borderlineMax: 150,
      highMax: 200,
    }),
    ruleIds: ['MET-003'],
  };
}

export function evaluateB12(value: number, unit: string): ThresholdEvaluation | null {
  if (unit !== 'pg/mL') return null;

  return {
    canonicalStatus: evaluateLowerBoundThresholds(value, {
      optimalMin: 500,
      goodMin: 400,
      borderlineMin: 300,
      highMin: 200,
    }),
    ruleIds: ['SUP-003'],
  };
}

export function evaluateMagnesium(value: number, unit: string): ThresholdEvaluation | null {
  if (unit !== 'mg/dL') return null;

  return {
    canonicalStatus: evaluateLowerBoundThresholds(value, {
      optimalMin: 2.0,
      goodMin: 1.9,
      borderlineMin: 1.7,
      highMin: 1.5,
    }),
    ruleIds: ['SUP-004'],
  };
}

export function evaluateDAO(value: number, unit: string): ThresholdEvaluation | null {
  if (unit !== 'U/mL') return null;

  return {
    canonicalStatus: evaluateLowerBoundThresholds(value, {
      optimalMin: 10,
      goodMin: 7,
      borderlineMin: 4,
      highMin: 2,
    }),
    ruleIds: ['CTX-003'],
    notes: ['LOW_CONFIDENCE: lab-manufacturer reference only. evidenceConfidenceModifier: 0.3'],
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
    case 'b12':
      return evaluateB12(input.value, input.unit);
    case 'magnesium':
      return evaluateMagnesium(input.value, input.unit);
    case 'dao':
      return evaluateDAO(input.value, input.unit);
    default:
      return null;
  }
}
