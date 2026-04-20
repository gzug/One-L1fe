import { aggregateTotalPriorityScoreWithEvidence } from './biomarkers.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runBiomarkersEvidenceAssertions(): void {
  const mockAnchors: Array<{ sourceId: string; tier: number; bucket: string }> = [
    { sourceId: 'src1', tier: 1, bucket: 'strong' },
    { sourceId: 'src2', tier: 2, bucket: 'strong' },
  ];

  const mockBiomarkerValues = {
    apob: 150,
    ldl: 120,
    triglycerides: 200,
    lpa: 50,
    hba1c: 6.0,
    glucose: 110,
    crp: 2.5,
    vitamin_d: 25,
    ferritin: 150,
    b12: 600,
    magnesium: 2.1,
    dao: 15,
  };

  const result = aggregateTotalPriorityScoreWithEvidence(mockBiomarkerValues, mockAnchors);

  assert(typeof result.score === 'number', `Expected score to be a number, got ${typeof result.score}`);
  assert(
    result.product_evidence_class === 'strong',
    `Expected product_evidence_class 'strong', got '${result.product_evidence_class}'`,
  );
  assert(result.anchor_count === 2, `Expected anchor_count 2, got ${result.anchor_count}`);

  let errorThrown = false;
  let errorMessage = '';

  try {
    aggregateTotalPriorityScoreWithEvidence(mockBiomarkerValues, []);
  } catch (e) {
    errorThrown = true;
    errorMessage = e instanceof Error ? e.message : String(e);
  }

  assert(errorThrown, 'Expected error to be thrown for empty anchors');
  assert(
    errorMessage.includes('without evidence anchors'),
    `Expected error message to contain 'without evidence anchors', got '${errorMessage}'`,
  );

  assert(result.score > 0, `Expected score > 0, got ${result.score}`);
  assert(result.score <= 100, `Expected score <= 100, got ${result.score}`);

  const singleAnchor: Array<{ sourceId: string; tier: number; bucket: string }> = [
    { sourceId: 'src1', tier: 1, bucket: 'strong' },
  ];
  const singleResult = aggregateTotalPriorityScoreWithEvidence(mockBiomarkerValues, singleAnchor);
  assert(
    singleResult.product_evidence_class === 'moderate',
    `Expected 'moderate' for single anchor, got '${singleResult.product_evidence_class}'`,
  );

  const multipleAnchors: Array<{ sourceId: string; tier: number; bucket: string }> = [
    { sourceId: 'src1', tier: 1, bucket: 'strong' },
    { sourceId: 'src2', tier: 2, bucket: 'strong' },
    { sourceId: 'src3', tier: 2, bucket: 'secondary' },
  ];

  const multiResult = aggregateTotalPriorityScoreWithEvidence(mockBiomarkerValues, multipleAnchors);
  assert(multiResult.anchor_count === 3, `Expected anchor_count 3, got ${multiResult.anchor_count}`);
}
