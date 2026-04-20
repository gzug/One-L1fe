import { aggregateTotalPriorityScoreWithEvidence } from './biomarkers.ts';

describe('biomarkersEvidence', () => {
  describe('aggregateTotalPriorityScoreWithEvidence', () => {
    const mockAnchors = [
      { sourceId: 'src1', tier: 1, bucket: 'strong' as const },
      { sourceId: 'src2', tier: 2, bucket: 'strong' as const },
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

    it('should return PriorityScoreResult with strong classification for valid anchors', () => {
      const result = aggregateTotalPriorityScoreWithEvidence(mockBiomarkerValues, mockAnchors);

      if (typeof result.score !== 'number') {
        throw new Error(`Expected score to be a number, got ${typeof result.score}`);
      }

      if (result.product_evidence_class !== 'strong') {
        throw new Error(
          `Expected product_evidence_class to be 'strong', got '${result.product_evidence_class}'`,
        );
      }

      if (result.anchor_count !== 2) {
        throw new Error(`Expected anchor_count to be 2, got ${result.anchor_count}`);
      }
    });

    it('should throw UnanchoredScoreError for empty anchors', () => {
      let errorThrown = false;
      let errorMessage = '';

      try {
        aggregateTotalPriorityScoreWithEvidence(mockBiomarkerValues, []);
      } catch (e) {
        errorThrown = true;
        errorMessage = e instanceof Error ? e.message : String(e);
      }

      if (!errorThrown) {
        throw new Error('Expected UnanchoredScoreError to be thrown for empty anchors');
      }

      if (!errorMessage.includes('without evidence anchors')) {
        throw new Error(
          `Expected error message to contain 'without evidence anchors', got '${errorMessage}'`,
        );
      }
    });

    it('should calculate correct score value', () => {
      const result = aggregateTotalPriorityScoreWithEvidence(mockBiomarkerValues, mockAnchors);

      if (result.score <= 0) {
        throw new Error(`Expected score to be greater than 0, got ${result.score}`);
      }

      if (result.score > 100) {
        throw new Error(`Expected score to be reasonable (<=100), got ${result.score}`);
      }
    });

    it('should classify as moderate for single strong anchor', () => {
      const singleAnchor = [{ sourceId: 'src1', tier: 1, bucket: 'strong' as const }];

      const result = aggregateTotalPriorityScoreWithEvidence(mockBiomarkerValues, singleAnchor);

      if (result.product_evidence_class !== 'moderate') {
        throw new Error(
          `Expected product_evidence_class to be 'moderate', got '${result.product_evidence_class}'`,
        );
      }
    });

    it('should preserve anchor_count in result', () => {
      const multipleAnchors = [
        { sourceId: 'src1', tier: 1, bucket: 'strong' as const },
        { sourceId: 'src2', tier: 2, bucket: 'strong' as const },
        { sourceId: 'src3', tier: 2, bucket: 'secondary' as const },
      ];

      const result = aggregateTotalPriorityScoreWithEvidence(mockBiomarkerValues, multipleAnchors);

      if (result.anchor_count !== 3) {
        throw new Error(`Expected anchor_count to be 3, got ${result.anchor_count}`);
      }
    });
  });
});
