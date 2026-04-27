/**
 * markerSupportFocus.ts
 *
 * Per-marker, lifestyle-supportive copy. Surfaced in the Blood Context card
 * (Home) and the Compare view's per-marker drawer.
 *
 * Wording rules — strictly enforced here so UI components do not need to:
 *   - no diagnosis, no treatment, no drug/supplement prescription
 *   - no "must" / "dangerous" / "guaranteed" / "you have"
 *   - clinician-first wording for persistent out-of-reference values
 *   - allowed verbs: "review alongside", "support a clinician discussion",
 *     "useful context", "worth monitoring", "moved lower"
 */

export type SupportFocus = {
  /** Lifestyle / context line — always shown when expanded. */
  lifestyle: string;
  /** Clinician-first note — only shown when value is outside reference. */
  clinicianNote?: string;
};

const SUPPORT_FOCUS: Record<string, SupportFocus> = {
  glucose: {
    lifestyle:     'Often reviewed alongside carbohydrate intake, sleep, and training volume.',
    clinicianNote: 'Persistent out-of-reference values are worth reviewing with a clinician alongside recent nutrition and lifestyle context.',
  },
  hba1c: {
    lifestyle:     'Often tracked alongside nutrition pattern, training volume, and recovery context.',
    clinicianNote: 'A 3-month trend outside the reference context can be useful to bring to a clinician discussion.',
  },
  chol_total: {
    lifestyle: 'Often reviewed alongside LDL, HDL, ApoB, dietary fat pattern, and training load.',
  },
  ldl: {
    lifestyle:     'Often reviewed alongside ApoB, dietary pattern, and training volume.',
    clinicianNote: 'Useful to review alongside ApoB and total lipid context with a clinician.',
  },
  hdl: {
    lifestyle: 'Regular aerobic training is commonly associated with HDL levels. Often reviewed alongside training frequency and body composition.',
  },
  triglycerides: {
    lifestyle:     'Often reviewed alongside carbohydrate intake, alcohol, sleep quality, and activity level.',
    clinicianNote: 'Persistent elevation can support a clinician discussion about metabolic context.',
  },
  apob: {
    lifestyle:     'Often reviewed alongside LDL, total cholesterol, dietary pattern, and training context.',
    clinicianNote: 'ApoB is a direct lipid-particle marker — useful to raise in a clinician discussion if consistently above reference.',
  },
  hscrp: {
    lifestyle:     'Often reviewed alongside training load, sleep quality, and recovery. Transient elevation after hard training is common.',
    clinicianNote: 'Persistent elevation outside reference range can support a clinician discussion about inflammation context.',
  },
  ferritin: {
    lifestyle:     'Often reviewed alongside dietary iron intake and training volume. Endurance athletes may have higher baseline needs.',
    clinicianNote: 'Low ferritin can be worth discussing with a clinician, particularly in context of fatigue or training adaptation.',
  },
  vitd: {
    lifestyle: 'Often reviewed alongside sun exposure, seasonal variation, and supplementation history.',
  },
  vitb12: {
    lifestyle:     'Often reviewed alongside dietary pattern — particularly relevant for those following plant-based diets.',
    clinicianNote: 'Persistent low B12 can support a clinician discussion, particularly around absorption and dietary context.',
  },
  tsh: {
    lifestyle:     'Often reviewed alongside energy, body composition, sleep, and stress context.',
    clinicianNote: 'TSH outside reference context is worth reviewing with a clinician as part of a broader thyroid panel.',
  },
  alt: {
    lifestyle:     'Can be transiently elevated after intense training. Often reviewed alongside training load and recovery time.',
    clinicianNote: 'Persistent elevation outside reference range is worth raising with a clinician.',
  },
  creatinine: {
    lifestyle:     'Often reviewed alongside hydration, protein intake, and training volume.',
    clinicianNote: 'Persistent out-of-range values can support a clinician discussion about kidney filtration context.',
  },
  homocysteine: {
    lifestyle:     'Often reviewed alongside dietary B-vitamin intake (folate, B6, B12) and nutrition pattern.',
    clinicianNote: 'Elevated homocysteine can support a clinician discussion about B-vitamin status and dietary context.',
  },
  uric_acid: {
    lifestyle:     'Often reviewed alongside hydration, protein intake, and training load.',
    clinicianNote: 'Persistent elevation can be worth discussing with a clinician alongside dietary and hydration context.',
  },
  testosterone: {
    lifestyle:     'Often reviewed alongside sleep quality, training load, stress, and body composition.',
    clinicianNote: 'Persistent out-of-reference values are worth reviewing with a clinician in context of symptoms and lifestyle.',
  },
  shbg: {
    lifestyle: 'Often reviewed alongside testosterone and body composition context.',
  },
};

export function getSupportFocus(markerId: string): SupportFocus | undefined {
  return SUPPORT_FOCUS[markerId];
}
