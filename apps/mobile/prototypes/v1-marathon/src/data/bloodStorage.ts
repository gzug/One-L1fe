/**
 * bloodStorage.ts
 * Local blood panel data layer — AsyncStorage only.
 * Data lives on the user's device. No network calls. No Supabase.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@one_l1fe_blood_panels_v1';

export type BloodMarker = {
  id: string;
  label: string;
  unit: string;
  value: string;
  refLow?: string;
  refHigh?: string;
  enabled: boolean;
  source: 'manual' | 'pdf_import_pending';
};

export type BloodPanel = {
  id: string;
  label: string;      // e.g. "2025"
  dateLabel: string;  // e.g. "2025" — year only, month not confirmed
  markers: BloodMarker[];
};

export function defaultPanels(): BloodPanel[] {
  return [
    {
      id: 'panel_2023',
      label: '2023',
      dateLabel: '2023',
      markers: [
        { id: 'glucose',       label: 'Glucose',            unit: 'mmol/L', value: '5.1',  refLow: '3.9',  refHigh: '5.6',  enabled: true, source: 'manual' },
        { id: 'hba1c',         label: 'HbA1c',              unit: '%',      value: '5.3',  refLow: '',     refHigh: '5.7',  enabled: true, source: 'manual' },
        { id: 'chol_total',    label: 'Total Cholesterol',  unit: 'mmol/L', value: '4.8',  refLow: '',     refHigh: '5.2',  enabled: true, source: 'manual' },
        { id: 'ldl',           label: 'LDL',                unit: 'mmol/L', value: '2.9',  refLow: '',     refHigh: '3.4',  enabled: true, source: 'manual' },
        { id: 'hdl',           label: 'HDL',                unit: 'mmol/L', value: '1.4',  refLow: '1.0',  refHigh: '',     enabled: true, source: 'manual' },
        { id: 'triglycerides', label: 'Triglycerides',      unit: 'mmol/L', value: '1.1',  refLow: '',     refHigh: '1.7',  enabled: true, source: 'manual' },
        { id: 'apob',          label: 'ApoB',               unit: 'g/L',    value: '0.82', refLow: '',     refHigh: '1.0',  enabled: true, source: 'manual' },
        { id: 'hscrp',         label: 'hsCRP',              unit: 'mg/L',   value: '0.8',  refLow: '',     refHigh: '3.0',  enabled: true, source: 'manual' },
        { id: 'ferritin',      label: 'Ferritin',           unit: 'µg/L',   value: '68',   refLow: '30',   refHigh: '400',  enabled: true, source: 'manual' },
        { id: 'vitd',          label: 'Vitamin D (25-OH)',  unit: 'nmol/L', value: '62',   refLow: '50',   refHigh: '200',  enabled: true, source: 'manual' },
        { id: 'vitb12',        label: 'Vitamin B12',        unit: 'pmol/L', value: '310',  refLow: '148',  refHigh: '740',  enabled: true, source: 'manual' },
        { id: 'tsh',           label: 'TSH',                unit: 'mIU/L',  value: '2.1',  refLow: '0.4',  refHigh: '4.0',  enabled: true, source: 'manual' },
        { id: 'alt',           label: 'ALT',                unit: 'U/L',    value: '24',   refLow: '',     refHigh: '56',   enabled: true, source: 'manual' },
        { id: 'creatinine',    label: 'Creatinine',         unit: 'µmol/L', value: '88',   refLow: '64',   refHigh: '111',  enabled: true, source: 'manual' },
      ],
    },
    {
      id: 'panel_2025',
      label: '2025',
      dateLabel: '2025',
      markers: [
        { id: 'glucose',       label: 'Glucose',            unit: 'mmol/L', value: '4.9',  refLow: '3.9',  refHigh: '5.6',  enabled: true, source: 'manual' },
        { id: 'hba1c',         label: 'HbA1c',              unit: '%',      value: '5.1',  refLow: '',     refHigh: '5.7',  enabled: true, source: 'manual' },
        { id: 'chol_total',    label: 'Total Cholesterol',  unit: 'mmol/L', value: '4.6',  refLow: '',     refHigh: '5.2',  enabled: true, source: 'manual' },
        { id: 'ldl',           label: 'LDL',                unit: 'mmol/L', value: '2.7',  refLow: '',     refHigh: '3.4',  enabled: true, source: 'manual' },
        { id: 'hdl',           label: 'HDL',                unit: 'mmol/L', value: '1.5',  refLow: '1.0',  refHigh: '',     enabled: true, source: 'manual' },
        { id: 'triglycerides', label: 'Triglycerides',      unit: 'mmol/L', value: '0.9',  refLow: '',     refHigh: '1.7',  enabled: true, source: 'manual' },
        { id: 'apob',          label: 'ApoB',               unit: 'g/L',    value: '0.78', refLow: '',     refHigh: '1.0',  enabled: true, source: 'manual' },
        { id: 'hscrp',         label: 'hsCRP',              unit: 'mg/L',   value: '0.6',  refLow: '',     refHigh: '3.0',  enabled: true, source: 'manual' },
        { id: 'ferritin',      label: 'Ferritin',           unit: 'µg/L',   value: '74',   refLow: '30',   refHigh: '400',  enabled: true, source: 'manual' },
        { id: 'vitd',          label: 'Vitamin D (25-OH)',  unit: 'nmol/L', value: '71',   refLow: '50',   refHigh: '200',  enabled: true, source: 'manual' },
        { id: 'vitb12',        label: 'Vitamin B12',        unit: 'pmol/L', value: '340',  refLow: '148',  refHigh: '740',  enabled: true, source: 'manual' },
        { id: 'tsh',           label: 'TSH',                unit: 'mIU/L',  value: '1.9',  refLow: '0.4',  refHigh: '4.0',  enabled: true, source: 'manual' },
        { id: 'alt',           label: 'ALT',                unit: 'U/L',    value: '22',   refLow: '',     refHigh: '56',   enabled: true, source: 'manual' },
        { id: 'creatinine',    label: 'Creatinine',         unit: 'µmol/L', value: '91',   refLow: '64',   refHigh: '111',  enabled: true, source: 'manual' },
        { id: 'homocysteine',  label: 'Homocysteine',       unit: 'µmol/L', value: '9.2',  refLow: '',     refHigh: '15.0', enabled: true, source: 'manual' },
        { id: 'uric_acid',     label: 'Uric Acid',          unit: 'µmol/L', value: '310',  refLow: '200',  refHigh: '420',  enabled: true, source: 'manual' },
        { id: 'testosterone',  label: 'Testosterone',       unit: 'nmol/L', value: '18.4', refLow: '9.9',  refHigh: '27.8', enabled: true, source: 'manual' },
        { id: 'shbg',          label: 'SHBG',               unit: 'nmol/L', value: '38',   refLow: '18',   refHigh: '54',   enabled: true, source: 'manual' },
      ],
    },
  ];
}

export async function loadPanels(): Promise<BloodPanel[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPanels();
    const parsed = JSON.parse(raw) as BloodPanel[];
    return mergePanels(parsed, defaultPanels());
  } catch {
    return defaultPanels();
  }
}

export async function savePanels(panels: BloodPanel[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(panels));
}

function mergePanels(stored: BloodPanel[], defaults: BloodPanel[]): BloodPanel[] {
  return defaults.map((defaultPanel) => {
    const storedPanel = stored.find((p) => p.id === defaultPanel.id);
    if (!storedPanel) return defaultPanel;
    const mergedMarkers = defaultPanel.markers.map((defaultMarker) => {
      const storedMarker = storedPanel.markers.find((m) => m.id === defaultMarker.id);
      return storedMarker ?? defaultMarker;
    });
    return { ...storedPanel, label: defaultPanel.label, dateLabel: defaultPanel.dateLabel, markers: mergedMarkers };
  });
}
