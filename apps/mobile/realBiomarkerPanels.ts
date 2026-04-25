// Source: data/notion-export/05_1_Biomarker Panel Tabel.csv
// Only values that exist in the CSV are encoded here. Missing or "Unknown"
// markers are left as null so Real Data Mode never invents a value.

export type LabEntryStatus =
  | 'optimal'
  | 'good'
  | 'needs-improvement'
  | 'elevated'
  | 'low'
  | 'missing';

export type LabMarkerKey =
  | 'apoB'
  | 'lpA'
  | 'ldl'
  | 'hdl'
  | 'triglycerides'
  | 'totalCholesterol'
  | 'hba1c'
  | 'fastingGlucose'
  | 'homocysteine'
  | 'uricAcid'
  | 'hsCrp'
  | 'alt'
  | 'vitaminD'
  | 'ferritin'
  | 'b12'
  | 'magnesium'
  | 'dao';

export interface LabEntry {
  marker: LabMarkerKey;
  label: string;
  value: number | null;
  unit: string | null;
  status: LabEntryStatus;
  rawStatus: string;
}

export interface LabPanel {
  id: 'oct-2023' | 'apr-2025';
  name: string;
  date: string;
  isoDate: string;
  source: string;
  profile: string;
  notes: string;
  primaryFocus: string;
  totalPriorityScore: number;
  entries: LabEntry[];
}

const OCT_2023: LabPanel = {
  id: 'oct-2023',
  name: 'Oct 2023 Panel',
  date: 'October 11, 2023',
  isoDate: '2023-10-11',
  source: 'Danish hospital lab (sundhed.dk)',
  profile: 'Male',
  notes:
    'Baseline panel from 2023. No lipid panel available. Higher CRP compared to 2025. Strong metabolic health already present.',
  primaryFocus: 'Metabolic',
  totalPriorityScore: 33,
  entries: [
    { marker: 'apoB', label: 'ApoB', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'lpA', label: 'Lp(a)', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'ldl', label: 'LDL', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'hdl', label: 'HDL', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'triglycerides', label: 'Triglycerides', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'totalCholesterol', label: 'Total Cholesterol', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'hba1c', label: 'HbA1c', value: 34, unit: 'mmol/mol', status: 'needs-improvement', rawStatus: 'Needs improvement' },
    { marker: 'fastingGlucose', label: 'Fasting Glucose', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'homocysteine', label: 'Homocysteine', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'uricAcid', label: 'Uric Acid', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'hsCrp', label: 'hs-CRP', value: 3, unit: 'mg/L', status: 'elevated', rawStatus: 'Elevated' },
    { marker: 'alt', label: 'ALT', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'vitaminD', label: 'Vitamin D', value: 77, unit: 'nmol/L', status: 'optimal', rawStatus: 'Optimal' },
    { marker: 'ferritin', label: 'Ferritin', value: 204, unit: 'µg/L', status: 'needs-improvement', rawStatus: 'Needs improvement' },
    { marker: 'b12', label: 'B12', value: 265, unit: 'pmol/L', status: 'needs-improvement', rawStatus: 'Needs improvement' },
    { marker: 'magnesium', label: 'Magnesium', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'dao', label: 'DAO', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
  ],
};

const APR_2025: LabPanel = {
  id: 'apr-2025',
  name: 'Apr 2025 Panel',
  date: 'April 18, 2025',
  isoDate: '2025-04-18',
  source: 'ALAB blood test',
  profile: 'Male',
  notes:
    'Blood test from April 2025. Post H. pylori phase. Good metabolic and inflammation markers. LDL elevated. DAO low, likely gut recovery related.',
  primaryFocus: 'General Optimization',
  totalPriorityScore: 20,
  entries: [
    { marker: 'apoB', label: 'ApoB', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'lpA', label: 'Lp(a)', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'ldl', label: 'LDL', value: 133, unit: 'mg/dL', status: 'needs-improvement', rawStatus: 'Needs improvement' },
    { marker: 'hdl', label: 'HDL', value: 56, unit: 'mg/dL', status: 'optimal', rawStatus: 'Optimal' },
    { marker: 'triglycerides', label: 'Triglycerides', value: 101, unit: 'mg/dL', status: 'good', rawStatus: 'Good' },
    { marker: 'totalCholesterol', label: 'Total Cholesterol', value: 209, unit: 'mg/dL', status: 'missing', rawStatus: 'Missing' },
    { marker: 'hba1c', label: 'HbA1c', value: 5.24, unit: '%', status: 'optimal', rawStatus: 'Optimal' },
    { marker: 'fastingGlucose', label: 'Fasting Glucose', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'homocysteine', label: 'Homocysteine', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'uricAcid', label: 'Uric Acid', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'hsCrp', label: 'hs-CRP', value: 0.6, unit: 'mg/L', status: 'optimal', rawStatus: 'Optimal' },
    { marker: 'alt', label: 'ALT', value: null, unit: null, status: 'missing', rawStatus: 'Missing' },
    { marker: 'vitaminD', label: 'Vitamin D', value: 36, unit: 'ng/mL', status: 'good', rawStatus: 'Good' },
    { marker: 'ferritin', label: 'Ferritin', value: 188, unit: 'ng/mL', status: 'needs-improvement', rawStatus: 'Needs improvement' },
    { marker: 'b12', label: 'B12', value: 534, unit: 'pg/mL', status: 'optimal', rawStatus: 'Optimal' },
    { marker: 'magnesium', label: 'Magnesium', value: 2.02, unit: 'mg/dL', status: 'optimal', rawStatus: 'Optimal' },
    { marker: 'dao', label: 'DAO', value: 5.1, unit: 'U/mL', status: 'low', rawStatus: 'Low' },
  ],
};

export const REAL_LAB_PANELS: readonly LabPanel[] = [OCT_2023, APR_2025];

export interface LatestMarkerReading {
  marker: LabMarkerKey;
  label: string;
  value: number;
  unit: string | null;
  status: LabEntryStatus;
  rawStatus: string;
  panelId: LabPanel['id'];
  panelName: string;
  panelDate: string;
  panelIsoDate: string;
  source: string;
}

export function getLatestRealMarker(marker: LabMarkerKey): LatestMarkerReading | null {
  const sorted = [...REAL_LAB_PANELS].sort((a, b) => b.isoDate.localeCompare(a.isoDate));
  for (const panel of sorted) {
    const entry = panel.entries.find((candidate) => candidate.marker === marker);
    if (!entry || entry.value === null) continue;
    return {
      marker,
      label: entry.label,
      value: entry.value,
      unit: entry.unit,
      status: entry.status,
      rawStatus: entry.rawStatus,
      panelId: panel.id,
      panelName: panel.name,
      panelDate: panel.date,
      panelIsoDate: panel.isoDate,
      source: panel.source,
    };
  }
  return null;
}

export function getAllLatestRealMarkers(): LatestMarkerReading[] {
  const seen = new Set<LabMarkerKey>();
  const readings: LatestMarkerReading[] = [];
  for (const panel of [...REAL_LAB_PANELS].sort((a, b) => b.isoDate.localeCompare(a.isoDate))) {
    for (const entry of panel.entries) {
      if (seen.has(entry.marker) || entry.value === null) continue;
      seen.add(entry.marker);
      readings.push({
        marker: entry.marker,
        label: entry.label,
        value: entry.value,
        unit: entry.unit,
        status: entry.status,
        rawStatus: entry.rawStatus,
        panelId: panel.id,
        panelName: panel.name,
        panelDate: panel.date,
        panelIsoDate: panel.isoDate,
        source: panel.source,
      });
    }
  }
  return readings;
}
