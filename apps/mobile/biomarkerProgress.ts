import { REAL_LAB_PANELS, type LabMarkerKey } from './realBiomarkerPanels';

export type BiomarkerProgressStatus =
  | 'Improved'
  | 'Declined'
  | 'Stable'
  | 'New value'
  | 'Missing'
  | 'Not comparable';

export interface BiomarkerProgressRow {
  marker: LabMarkerKey;
  label: string;
  value2023: string;
  value2025: string;
  change: string;
  interpretation: string;
  status: BiomarkerProgressStatus;
}

const ORDERED_MARKERS: LabMarkerKey[] = [
  'apoB',
  'lpA',
  'ldl',
  'hdl',
  'triglycerides',
  'totalCholesterol',
  'hba1c',
  'hsCrp',
  'vitaminD',
  'ferritin',
  'b12',
  'magnesium',
  'dao',
];

export function buildBiomarkerProgressRows(): BiomarkerProgressRow[] {
  return ORDERED_MARKERS.map((marker) => buildRow(marker));
}

function buildRow(marker: LabMarkerKey): BiomarkerProgressRow {
  const entry2023 = getEntry('oct-2023', marker);
  const entry2025 = getEntry('apr-2025', marker);
  const label = entry2025?.label ?? entry2023?.label ?? marker;
  const value2023 = formatValue(entry2023);
  const value2025 = formatValue(entry2025);

  switch (marker) {
    case 'apoB':
      return {
        marker,
        label,
        value2023,
        value2025,
        change: 'Still missing',
        interpretation: 'ApoB is missing in both panels. It should be added to the next blood panel before strong lipid risk interpretation.',
        status: 'Missing',
      };
    case 'lpA':
      return {
        marker,
        label,
        value2023,
        value2025,
        change: 'Still missing',
        interpretation: 'Lp(a) is missing in both panels. This is a one-time cardiovascular coverage gap, not a current trend.',
        status: 'Missing',
      };
    case 'ldl':
      return newValue(marker, label, value2023, value2025, 'LDL is now available in 2025. This is a new lipid value, not an improvement/regression because 2023 was missing. ApoB is still missing.');
    case 'hdl':
      return newValue(marker, label, value2023, value2025, 'HDL is now available in 2025. It is useful lipid context but cannot be trended against 2023.');
    case 'triglycerides':
      return newValue(marker, label, value2023, value2025, 'Triglycerides are now available in 2025. This adds metabolic/lipid context but no 2023 trend exists.');
    case 'totalCholesterol':
      return newValue(marker, label, value2023, value2025, 'Total cholesterol is now available in 2025. It is context only until paired with ApoB and repeat panels.');
    case 'hba1c':
      return {
        marker,
        label,
        value2023,
        value2025,
        change: '34 mmol/mol ≈ 5.26% → 5.24%',
        interpretation: 'HbA1c is effectively stable and strong after unit conversion. This supports metabolic confidence, not a treatment claim.',
        status: 'Stable',
      };
    case 'hsCrp':
      return {
        marker,
        label,
        value2023,
        value2025,
        change: '3.0 → 0.6 mg/L',
        interpretation: 'CRP is lower in 2025. This is an improved inflammation marker context for training readiness.',
        status: 'Improved',
      };
    case 'vitaminD':
      return {
        marker,
        label,
        value2023,
        value2025,
        change: '77 nmol/L → 36 ng/mL ≈ 90 nmol/L',
        interpretation: 'Vitamin D is slightly higher after unit conversion and remains in a good range for context.',
        status: 'Improved',
      };
    case 'ferritin':
      return {
        marker,
        label,
        value2023,
        value2025,
        change: '204 µg/L → 188 ng/mL',
        interpretation: 'Ferritin is slightly lower. For ferritin, µg/L and ng/mL are numerically equivalent; this is endurance-relevant iron storage context, not diagnosis.',
        status: 'Stable',
      };
    case 'b12':
      return {
        marker,
        label,
        value2023,
        value2025,
        change: '265 pmol/L → 534 pg/mL ≈ 394 pmol/L',
        interpretation: 'B12 improved after unit conversion. This may support energy-context confidence but is not a treatment recommendation.',
        status: 'Improved',
      };
    case 'magnesium':
      return newValue(marker, label, value2023, value2025, 'Magnesium is available in 2025 only. It is a new micronutrient context value, not a trend.');
    case 'dao':
      return newValue(marker, label, value2023, value2025, 'DAO is available in 2025 only and marked low in the source panel. It should be interpreted as gut/histamine context, not diagnosis.');
    default:
      return {
        marker,
        label,
        value2023,
        value2025,
        change: 'Not comparable',
        interpretation: 'No safe comparison rule is defined for this marker in the prototype.',
        status: 'Not comparable',
      };
  }
}

function newValue(
  marker: LabMarkerKey,
  label: string,
  value2023: string,
  value2025: string,
  interpretation: string,
): BiomarkerProgressRow {
  return {
    marker,
    label,
    value2023,
    value2025,
    change: `Missing → ${value2025}`,
    interpretation,
    status: 'New value',
  };
}

function getEntry(panelId: 'oct-2023' | 'apr-2025', marker: LabMarkerKey) {
  return REAL_LAB_PANELS.find((panel) => panel.id === panelId)?.entries.find((entry) => entry.marker === marker) ?? null;
}

function formatValue(entry: ReturnType<typeof getEntry>): string {
  if (!entry || entry.value === null) return 'Missing';
  return entry.unit ? `${entry.value} ${entry.unit}` : `${entry.value}`;
}
