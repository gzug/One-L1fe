import {
  UnanchoredScoreError,
  classifyProductEvidence,
  getProductEvidenceUICopy,
} from './evidenceRegistry.ts';

describe('evidenceRegistry', () => {
  describe('UnanchoredScoreError', () => {
    it('should create error with default message', () => {
      const error = new UnanchoredScoreError();
      if (!(error instanceof UnanchoredScoreError)) {
        throw new Error('Expected UnanchoredScoreError instance');
      }
      if (error.name !== 'UnanchoredScoreError') {
        throw new Error(`Expected name 'UnanchoredScoreError', got '${error.name}'`);
      }
      if (!error.message.includes('without evidence anchors')) {
        throw new Error(`Expected message to contain 'without evidence anchors', got '${error.message}'`);
      }
    });

    it('should create error with custom message', () => {
      const customMsg = 'Custom error message';
      const error = new UnanchoredScoreError(customMsg);
      if (error.message !== customMsg) {
        throw new Error(`Expected message '${customMsg}', got '${error.message}'`);
      }
    });
  });

  describe('classifyProductEvidence', () => {
    it('should return unanchored for empty anchors', () => {
      const result = classifyProductEvidence([]);
      if (result !== 'unanchored') {
        throw new Error(`Expected 'unanchored', got '${result}'`);
      }
    });

    it('should return strong for tier-1 anchor with strong bucket and supporting strong anchors', () => {
      const anchors = [
        { sourceId: 'src1', name: 'Source 1', tier: 1, bucket: 'strong' as const },
        { sourceId: 'src2', name: 'Source 2', tier: 2, bucket: 'strong' as const },
      ];
      const result = classifyProductEvidence(anchors);
      if (result !== 'strong') {
        throw new Error(`Expected 'strong', got '${result}'`);
      }
    });

    it('should return moderate for tier-1 anchor with single strong bucket', () => {
      const anchors = [
        { sourceId: 'src1', name: 'Source 1', tier: 1, bucket: 'strong' as const },
      ];
      const result = classifyProductEvidence(anchors);
      if (result !== 'moderate') {
        throw new Error(`Expected 'moderate', got '${result}'`);
      }
    });

    it('should return limited for supporting strong anchors only', () => {
      const anchors = [
        { sourceId: 'src1', name: 'Source 1', tier: 2, bucket: 'strong' as const },
      ];
      const result = classifyProductEvidence(anchors);
      if (result !== 'limited') {
        throw new Error(`Expected 'limited', got '${result}'`);
      }
    });

    it('should return limited for non-strong anchors', () => {
      const anchors = [
        { sourceId: 'src1', name: 'Source 1', tier: 1, bucket: 'secondary' as const },
      ];
      const result = classifyProductEvidence(anchors);
      if (result !== 'limited') {
        throw new Error(`Expected 'limited', got '${result}'`);
      }
    });
  });

  describe('getProductEvidenceUICopy', () => {
    it('should return strong evidence copy', () => {
      const copy = getProductEvidenceUICopy('strong');
      if (!copy.includes('peer-reviewed')) {
        throw new Error(`Expected 'peer-reviewed' in copy, got '${copy}'`);
      }
    });

    it('should return moderate evidence copy', () => {
      const copy = getProductEvidenceUICopy('moderate');
      if (!copy.includes('observational')) {
        throw new Error(`Expected 'observational' in copy, got '${copy}'`);
      }
    });

    it('should return limited evidence copy', () => {
      const copy = getProductEvidenceUICopy('limited');
      if (!copy.includes('Limited evidence')) {
        throw new Error(`Expected 'Limited evidence' in copy, got '${copy}'`);
      }
    });

    it('should return empty string for unanchored', () => {
      const copy = getProductEvidenceUICopy('unanchored');
      if (copy !== '') {
        throw new Error(`Expected empty string for 'unanchored', got '${copy}'`);
      }
    });
  });
});
