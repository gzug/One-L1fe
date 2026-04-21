import { biomarkers, getBiomarkerDefinition } from './biomarkers.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runBiomarkerAssertions(): void {
  const apob = getBiomarkerDefinition('apob');
  const hba1c = getBiomarkerDefinition('hba1c');
  const glucose = getBiomarkerDefinition('glucose');
  const vitaminD = getBiomarkerDefinition('vitamin_d');
  const dao = getBiomarkerDefinition('dao');

  assert(apob?.referenceRange.optimalMax === 60, 'ApoB reference range should sync to 60 mg/dL.');
  assert(hba1c?.referenceRange.optimalMax === 5.3, 'HbA1c reference range should sync to 5.3%.');
  assert(glucose?.referenceRange.optimalMax === 85, 'Glucose reference range should sync to 85 mg/dL.');
  assert(vitaminD?.referenceRange.optimalMin === 40, 'Vitamin D reference range should sync to 40 ng/mL.');

  assert(apob?.evidenceConfidenceModifier === 1, 'ApoB should stay a causal-primary signal.');
  assert(apob?.scoringClass === 'causal-primary', 'ApoB should remain causal-primary.');
  assert(hba1c?.scoringClass === 'causal-primary', 'HbA1c should remain causal-primary.');
  assert(glucose?.scoringClass === 'supporting-actionable', 'Glucose should remain supporting-actionable.');
  assert(dao?.evidenceConfidenceModifier === 0.3, 'DAO should be the lowest-confidence contextual marker.');
  assert(dao?.scoringClass === 'contextual-low-certainty', 'DAO should remain contextual-low-certainty.');
  assert(biomarkers.some((biomarker) => biomarker.key === 'triglycerides'), 'Triglycerides should remain in the registry.');
}
