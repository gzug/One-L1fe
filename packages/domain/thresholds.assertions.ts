import {
  evaluateApoB,
  evaluateB12,
  evaluateByThreshold,
  evaluateDAO,
  evaluateFerritin,
  evaluateMagnesium,
  evaluateTriglycerides,
  evaluateVitaminD,
} from './thresholds.ts';
import { CanonicalStatus } from './biomarkers.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runThresholdAssertions(): void {
  assert(evaluateApoB(60, 'mg/dL')?.canonicalStatus === CanonicalStatus.Optimal, 'ApoB optimal max should be 60 mg/dL.');
  assert(evaluateApoB(80, 'mg/dL')?.canonicalStatus === CanonicalStatus.Good, 'ApoB good max should be 80 mg/dL.');

  assert(evaluateVitaminD(40, 'ng/mL')?.canonicalStatus === CanonicalStatus.Optimal, 'Vitamin D optimal min should be 40 ng/mL.');
  assert(evaluateVitaminD(30, 'ng/mL')?.canonicalStatus === CanonicalStatus.Good, 'Vitamin D good min should be 30 ng/mL.');
  assert(evaluateVitaminD(100, 'nmol/L')?.canonicalStatus === CanonicalStatus.Optimal, 'Vitamin D nmol/L thresholds should scale by 2.5.');

  assert(evaluateFerritin(15, 'ng/mL')?.canonicalStatus === CanonicalStatus.High, 'Ferritin male low critical threshold should move to 15 ng/mL.');

  assert(evaluateTriglycerides(130, 'mg/dL')?.canonicalStatus === CanonicalStatus.Good, 'Triglycerides should use the new upper-bound ladder.');
  assert(evaluateB12(300, 'pg/mL')?.canonicalStatus === CanonicalStatus.Borderline, 'B12 should use the new lower-bound ladder.');
  assert(evaluateMagnesium(1.5, 'mg/dL')?.canonicalStatus === CanonicalStatus.High, 'Magnesium should use the new lower-bound ladder.');

  const dao = evaluateDAO(4, 'U/mL');
  assert(dao?.canonicalStatus === CanonicalStatus.Borderline, 'DAO should use the new low-confidence lower-bound ladder.');
  assert(
    dao?.notes?.some((note) => note.includes('evidenceConfidenceModifier: 0.3')),
    'DAO should carry the low-confidence note.',
  );

  assert(
    evaluateByThreshold({ marker: 'triglycerides', value: 151, unit: 'mg/dL' })?.canonicalStatus === CanonicalStatus.High,
    'evaluateByThreshold should dispatch triglycerides.',
  );
  assert(
    evaluateByThreshold({ marker: 'b12', value: 250, unit: 'pg/mL' })?.canonicalStatus === CanonicalStatus.High,
    'evaluateByThreshold should dispatch B12.',
  );
  assert(
    evaluateByThreshold({ marker: 'magnesium', value: 1.6, unit: 'mg/dL' })?.canonicalStatus === CanonicalStatus.High,
    'evaluateByThreshold should dispatch magnesium.',
  );
  assert(
    evaluateByThreshold({ marker: 'dao', value: 1.9, unit: 'U/mL' })?.canonicalStatus === CanonicalStatus.Critical,
    'evaluateByThreshold should dispatch DAO.',
  );
}
