import {
  UnanchoredScoreError,
  classifyProductEvidence,
  getProductEvidenceUICopy,
} from './evidenceRegistry.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runEvidenceRegistryAssertions(): void {
  const error = new UnanchoredScoreError();
  assert(error instanceof UnanchoredScoreError, 'Should create UnanchoredScoreError instance');
  assert(error.name === 'UnanchoredScoreError', `Expected name 'UnanchoredScoreError', got '${error.name}'`);
  assert(
    error.message.includes('without evidence anchors'),
    `Expected message to contain 'without evidence anchors', got '${error.message}'`,
  );

  const customMsg = 'Custom error message';
  const customError = new UnanchoredScoreError(customMsg);
  assert(customError.message === customMsg, `Expected message '${customMsg}', got '${customError.message}'`);

  const emptyResult = classifyProductEvidence([]);
  assert(emptyResult === 'unanchored', `Expected 'unanchored' for empty anchors, got '${emptyResult}'`);

  const strongAnchors = [
    { sourceId: 'src1', name: 'Source 1', tier: 1, bucket: 'strong' as const },
    { sourceId: 'src2', name: 'Source 2', tier: 2, bucket: 'strong' as const },
  ];
  const strongResult = classifyProductEvidence(strongAnchors);
  assert(strongResult === 'strong', `Expected 'strong' for tier-1 + 2 strong, got '${strongResult}'`);

  const moderateAnchors = [
    { sourceId: 'src1', name: 'Source 1', tier: 1, bucket: 'strong' as const },
  ];
  const moderateResult = classifyProductEvidence(moderateAnchors);
  assert(moderateResult === 'moderate', `Expected 'moderate' for single tier-1, got '${moderateResult}'`);

  const supportingOnlyAnchors = [
    { sourceId: 'src1', name: 'Source 1', tier: 2, bucket: 'strong' as const },
  ];
  const supportingResult = classifyProductEvidence(supportingOnlyAnchors);
  assert(supportingResult === 'limited', `Expected 'limited' for supporting only, got '${supportingResult}'`);

  const nonStrongAnchors = [
    { sourceId: 'src1', name: 'Source 1', tier: 1, bucket: 'secondary' as const },
  ];
  const nonStrongResult = classifyProductEvidence(nonStrongAnchors);
  assert(nonStrongResult === 'limited', `Expected 'limited' for non-strong, got '${nonStrongResult}'`);

  const strongCopy = getProductEvidenceUICopy('strong');
  assert(strongCopy.includes('peer-reviewed'), `Expected 'peer-reviewed' in strong copy, got '${strongCopy}'`);

  const moderateCopy = getProductEvidenceUICopy('moderate');
  assert(moderateCopy.includes('observational'), `Expected 'observational' in moderate copy, got '${moderateCopy}'`);

  const limitedCopy = getProductEvidenceUICopy('limited');
  assert(limitedCopy.includes('Limited evidence'), `Expected 'Limited evidence' in copy, got '${limitedCopy}'`);

  const unanchoredCopy = getProductEvidenceUICopy('unanchored');
  assert(unanchoredCopy === '', `Expected empty string for unanchored, got '${unanchoredCopy}'`);
}
