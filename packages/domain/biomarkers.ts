// biomarkers.ts

// 1) Canonical status enum
enum CanonicalStatus {
    Optimal = 'optimal',
    Good = 'good',
    Borderline = 'borderline',
    High = 'high',
    Critical = 'critical',
    Missing = 'missing',
}

// 2) Biomarkers with thresholds
const biomarkers = {
    ApoB: { threshold: 130, multiplier: 3 },
    LDL: { threshold: 100, multiplier: 1 },
    Triglycerides: { threshold: 150, multiplier: 1 },
    LpA: { threshold: 30, multiplier: 1 },
    HbA1c: { threshold: 5.7, multiplier: 2 },
    FastingGlucose: { threshold: 100, multiplier: 1 },
    CRP: { threshold: 3, multiplier: 1.5 },
    VitaminD: { threshold: 20, multiplier: 1 },
    Ferritin: { threshold: 30, multiplier: 1 },
    B12: { threshold: 400, multiplier: 1 },
    Magnesium: { threshold: 1.8, multiplier: 1 },
    DAO: { threshold: 10, multiplier: 1 },
};

// 3) Gender-specific thresholds (example)
const genderSpecificThresholds = {
    LDL: { Male: 100, Female: 110 },
    HbA1c: { Male: 5.7, Female: 5.4 },
};

// 4) Weight multipliers
function calculateWeightedValue(biomarker: string, value: number): number {
    const { multiplier } = biomarkers[biomarker];
    return value * multiplier;
}

// 5) Evidence levels
enum EvidenceLevel {
    Primary = 'primary',
    Secondary = 'secondary',
    Experimental = 'experimental',
}

// 6) Helper functions
function determineStatus(value: number, threshold: number): CanonicalStatus {
    if (value < threshold) return CanonicalStatus.Optimal;
    if (value < threshold + 10) return CanonicalStatus.Good;
    if (value < threshold + 20) return CanonicalStatus.Borderline;
    if (value < threshold + 30) return CanonicalStatus.High;
    return CanonicalStatus.Critical;
}

function calculatePriorityScore(biomarker: string, value: number): number {
    const weightedValue = calculateWeightedValue(biomarker, value);
    // Add scoring logic based on health-system-map calculation chain and principles
    return weightedValue; // Placeholder
}

export { CanonicalStatus, biomarkers, genderSpecificThresholds, EvidenceLevel, determineStatus, calculatePriorityScore };