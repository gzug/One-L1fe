/**
 * markerContext.ts
 * Neutral health-performance context strings for blood markers.
 *
 * Rules enforced here:
 * - No diagnosis
 * - No treatment advice
 * - No "you should" / "you need" / "this means you have"
 * - No risk prediction
 * - Approved wording only: "useful context", "can support discussion",
 *   "often reviewed alongside", "may be relevant"
 */

export type MarkerContext = {
  id: string;
  what: string;          // neutral one-liner: what this marker represents
  performanceAngle: string; // health-performance relevance, no diagnosis
  lifestyle: string;     // supportive lifestyle factors, no prescriptions
};

export const markerContextCatalogue: MarkerContext[] = [
  {
    id: 'glucose',
    what: 'Fasting blood glucose — a snapshot of blood sugar regulation.',
    performanceAngle: 'Useful context for long-term metabolic tracking alongside training load and nutrition pattern.',
    lifestyle: 'Often reviewed alongside carbohydrate intake, sleep quality, training volume, and stress.',
  },
  {
    id: 'hba1c',
    what: 'A 3-month average of blood sugar levels.',
    performanceAngle: 'Can support discussion with a clinician about metabolic trends over a training season.',
    lifestyle: 'Often reviewed alongside nutrition pattern, body composition, and activity level.',
  },
  {
    id: 'chol_total',
    what: 'Total cholesterol — a general lipid overview marker.',
    performanceAngle: 'Useful as a starting point for lipid-related context. Typically reviewed alongside LDL, HDL, and ApoB for a fuller picture.',
    lifestyle: 'Often reviewed alongside dietary fat intake, training load, and body composition.',
  },
  {
    id: 'ldl',
    what: 'Low-density lipoprotein — one of the primary lipid markers.',
    performanceAngle: 'Can support clinician discussion as part of a broader lipid and cardiovascular context panel.',
    lifestyle: 'Often reviewed alongside dietary pattern, ApoB, and training volume.',
  },
  {
    id: 'hdl',
    what: 'High-density lipoprotein — often considered a protective lipid marker.',
    performanceAngle: 'Useful context alongside other lipid markers. Regular aerobic training is commonly associated with HDL levels.',
    lifestyle: 'Often reviewed alongside training frequency, body composition, and dietary fat quality.',
  },
  {
    id: 'triglycerides',
    what: 'Blood fat levels — influenced by diet and energy balance.',
    performanceAngle: 'Useful context for metabolic and lipid tracking across training periods.',
    lifestyle: 'Often reviewed alongside carbohydrate intake, alcohol, sleep, and activity level.',
  },
  {
    id: 'apob',
    what: 'ApoB reflects the number of atherogenic lipoprotein particles — often used as a more direct lipid marker than LDL alone.',
    performanceAngle: 'Can support long-term cardiovascular and nutrition-context tracking. Useful to review alongside LDL and total cholesterol over time.',
    lifestyle: 'Often reviewed alongside training volume, body composition, nutrition pattern, and clinician feedback.',
  },
  {
    id: 'hscrp',
    what: 'High-sensitivity CRP — a general inflammation marker.',
    performanceAngle: 'Can be useful context during high training load periods. Not specific to any condition — useful as a trend marker over time.',
    lifestyle: 'Often reviewed alongside training load, sleep, recovery quality, and nutrition.',
  },
  {
    id: 'ferritin',
    what: 'A marker of iron storage in the body.',
    performanceAngle: 'Relevant context for endurance athletes where iron availability may affect energy and recovery. Can support a clinician discussion.',
    lifestyle: 'Often reviewed alongside dietary iron intake, training volume, and menstrual or blood loss history where applicable.',
  },
  {
    id: 'vitd',
    what: 'Vitamin D (25-OH) — reflects sun exposure and dietary intake.',
    performanceAngle: 'Useful context for recovery, immune function, and bone health tracking. Can support clinician discussion about supplementation.',
    lifestyle: 'Often reviewed alongside sun exposure, supplementation, and seasonal variation.',
  },
  {
    id: 'vitb12',
    what: 'Vitamin B12 — supports neurological function and red blood cell production.',
    performanceAngle: 'Useful baseline context, particularly relevant for those following plant-based diets or with absorption concerns.',
    lifestyle: 'Often reviewed alongside dietary pattern, supplementation, and digestive health.',
  },
  {
    id: 'tsh',
    what: 'Thyroid-stimulating hormone — a marker of thyroid function.',
    performanceAngle: 'Can support clinician discussion about energy, metabolism, and recovery if changes are observed over time.',
    lifestyle: 'Often reviewed alongside energy levels, body composition, sleep, and stress.',
  },
  {
    id: 'alt',
    what: 'Alanine aminotransferase — a liver enzyme marker.',
    performanceAngle: 'Can be transiently elevated after intense training. Useful as a trend marker alongside training load and recovery.',
    lifestyle: 'Often reviewed alongside training intensity, alcohol intake, and recovery time.',
  },
  {
    id: 'creatinine',
    what: 'A waste product of muscle metabolism, used to assess kidney filtration.',
    performanceAngle: 'Useful context for athletes where muscle mass and training load may influence levels. Can support clinician discussion.',
    lifestyle: 'Often reviewed alongside training volume, hydration, and protein intake.',
  },
  {
    id: 'homocysteine',
    what: 'An amino acid linked to B-vitamin metabolism.',
    performanceAngle: 'Can support clinician discussion as part of a broader metabolic and cardiovascular context panel.',
    lifestyle: 'Often reviewed alongside folate, B6, B12 intake, and dietary pattern.',
  },
  {
    id: 'uric_acid',
    what: 'A metabolic byproduct of purine breakdown.',
    performanceAngle: 'Useful context alongside dietary pattern and hydration. Can support discussion with a clinician if levels change over time.',
    lifestyle: 'Often reviewed alongside protein intake, hydration, alcohol, and training load.',
  },
  {
    id: 'testosterone',
    what: 'A primary androgenic hormone relevant to recovery, adaptation, and body composition.',
    performanceAngle: 'Useful context for long-term training and recovery tracking. Changes over time may be relevant for a clinician discussion.',
    lifestyle: 'Often reviewed alongside sleep quality, training load, stress, and body composition.',
  },
  {
    id: 'shbg',
    what: 'Sex hormone-binding globulin — affects the availability of sex hormones.',
    performanceAngle: 'Often reviewed alongside testosterone to provide fuller context on hormonal availability. Can support a clinician discussion.',
    lifestyle: 'Often reviewed alongside body composition, dietary fat intake, and training load.',
  },
];

export function getMarkerContext(id: string): MarkerContext | undefined {
  return markerContextCatalogue.find((m) => m.id === id);
}
