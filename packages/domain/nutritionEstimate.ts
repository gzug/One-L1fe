export type NutritionInputKind = 'image' | 'text' | 'image_and_text';

export type MacroLevel = 'low' | 'medium' | 'high';

export type NutritionEstimate = {
  inputKind: NutritionInputKind;
  estimatedCaloriesRange?: {
    min: number;
    max: number;
  };
  estimatedMacros?: {
    protein?: MacroLevel;
    carbs?: MacroLevel;
    fat?: MacroLevel;
  };
  estimateConfidencePercent: number;
  assumptions: string[];
  missingDetails: string[];
  improvementTips: string[];
  disclaimer: string;
};

function clampConfidence(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function baseEstimate(inputKind: NutritionInputKind): NutritionEstimate {
  if (inputKind === 'text') {
    return {
      inputKind,
      estimatedCaloriesRange: { min: 450, max: 750 },
      estimatedMacros: { protein: 'medium', carbs: 'medium', fat: 'medium' },
      estimateConfidencePercent: 45,
      assumptions: ['Portion sizes were described but not weighed.'],
      missingDetails: ['Exact grams or household portions', 'Cooking oil and sauces'],
      improvementTips: ['Add approximate grams or household portions', 'Describe sauces and added fats'],
      disclaimer:
        'This is an approximate lifestyle estimate, not medical advice and not a verified nutrition label.',
    };
  }

  if (inputKind === 'image') {
    return {
      inputKind,
      estimatedCaloriesRange: { min: 400, max: 900 },
      estimatedMacros: { protein: 'medium', carbs: 'medium', fat: 'medium' },
      estimateConfidencePercent: 30,
      assumptions: ['Only the image is available.', 'Portion size and ingredients may be partially visible.'],
      missingDetails: ['Exact ingredients', 'Portion size', 'Cooking method'],
      improvementTips: ['Add a short text description', 'Mention oils, sauces, and drinks'],
      disclaimer:
        'This is an approximate lifestyle estimate, not medical advice and not a verified nutrition label.',
    };
  }

  return {
    inputKind,
    estimatedCaloriesRange: { min: 500, max: 800 },
    estimatedMacros: { protein: 'medium', carbs: 'medium', fat: 'medium' },
    estimateConfidencePercent: 60,
    assumptions: ['Both image and text are available.', 'The meal appears broadly structured.'],
    missingDetails: ['Exact mass', 'Cooking oil quantity', 'Hidden ingredients'],
    improvementTips: ['Upload a clearer top-down image', 'Add portion sizes and cooking method'],
    disclaimer:
      'This is an approximate lifestyle estimate, not medical advice and not a verified nutrition label.',
  };
}

export function estimateNutritionFromMockInput(
  inputKind: NutritionInputKind,
  detailLevel: 'basic' | 'detailed' = 'basic',
): NutritionEstimate {
  const estimate = baseEstimate(inputKind);

  if (detailLevel === 'detailed') {
    estimate.estimateConfidencePercent = clampConfidence(
      estimate.estimateConfidencePercent + 18,
    );
    estimate.estimatedCaloriesRange = {
      min: Math.max(200, (estimate.estimatedCaloriesRange?.min ?? 0) - 100),
      max: (estimate.estimatedCaloriesRange?.max ?? 0) + 100,
    };
    estimate.assumptions.push('User supplied additional detail about the meal.');
    estimate.improvementTips = [
      'Add estimated grams where possible',
      'Include sauces, oils, and drinks',
      'Use a clearer image if available',
    ];
  }

  estimate.estimateConfidencePercent = clampConfidence(estimate.estimateConfidencePercent);
  return estimate;
}

