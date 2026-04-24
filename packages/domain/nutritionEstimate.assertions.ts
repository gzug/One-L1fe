import { estimateNutritionFromMockInput } from './nutritionEstimate.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runNutritionEstimateAssertions(): void {
  const imageOnly = estimateNutritionFromMockInput('image');
  assert(
    imageOnly.estimateConfidencePercent >= 0 && imageOnly.estimateConfidencePercent <= 100,
    'Image-only confidence must stay within 0..100.',
  );
  assert(
    imageOnly.estimateConfidencePercent < estimateNutritionFromMockInput('image_and_text').estimateConfidencePercent,
    'Image+text confidence should exceed image-only confidence.',
  );

  const detailedText = estimateNutritionFromMockInput('text', 'detailed');
  assert(
    detailedText.estimateConfidencePercent >= 0 && detailedText.estimateConfidencePercent <= 100,
    'Detailed text confidence must stay within 0..100.',
  );
  assert(
    detailedText.missingDetails.length > 0,
    'Nutrition estimate should expose missing details.',
  );
}

