import type {
  HealthConnectGarminReadResult,
  HealthConnectGarminSummary,
} from './healthConnectGarminReader';
import {
  REAL_LAB_PANELS,
  getAllLatestRealMarkers,
  type LabMarkerKey,
  type LatestMarkerReading,
} from './realBiomarkerPanels';

export type DataMode = 'real' | 'demo-filled';

export const DATA_MODE_LABELS: Record<DataMode, string> = {
  real: 'Real Data',
  'demo-filled': 'Demo Filled',
};

// Synthetic placeholders are plausible mid-range values used only when the
// user has explicitly opted into Demo Filled Mode. Each synthetic field must
// remain clearly labelled in the UI as "synthetic demo".
export const SYNTHETIC_HEALTH_CONNECT_SUMMARY: HealthConnectGarminSummary = {
  stepsTotal: 9_000,
  sleepDurationSeconds: 7.5 * 3600,
  sleepSessionCount: 1,
  heartRateAvgBpm: 68,
  restingHeartRateBpm: 58,
  hrvRmssdMs: 55,
  activeEnergyKcal: 380,
  distanceMeters: 6_500,
  latestRecordAt: null,
  sourceOrigins: ['synthetic-demo'],
  recordCounts: {
    Steps: 1,
    SleepSession: 1,
    HeartRate: 1,
    RestingHeartRate: 1,
    HeartRateVariabilityRmssd: 1,
    ActiveCaloriesBurned: 1,
    Distance: 1,
  },
  skippedRecords: 0,
};

export type SummaryNumericKey =
  | 'stepsTotal'
  | 'sleepDurationSeconds'
  | 'restingHeartRateBpm'
  | 'hrvRmssdMs'
  | 'activeEnergyKcal'
  | 'distanceMeters'
  | 'heartRateAvgBpm';

export interface AppliedSummary {
  summary: HealthConnectGarminSummary | null;
  syntheticFields: ReadonlySet<SummaryNumericKey>;
  hasAnyLiveValue: boolean;
}

export function applyDataModeToSummary(
  result: HealthConnectGarminReadResult | null,
  mode: DataMode,
): AppliedSummary {
  const live = result?.status === 'live' ? result.summary : null;
  const hasAnyLiveValue = live !== null;

  if (mode === 'real') {
    return { summary: live, syntheticFields: new Set(), hasAnyLiveValue };
  }

  const syntheticFields = new Set<SummaryNumericKey>();
  const base: HealthConnectGarminSummary = live
    ? { ...live }
    : { ...SYNTHETIC_HEALTH_CONNECT_SUMMARY };

  const numericKeys: SummaryNumericKey[] = [
    'stepsTotal',
    'sleepDurationSeconds',
    'restingHeartRateBpm',
    'hrvRmssdMs',
    'activeEnergyKcal',
    'distanceMeters',
    'heartRateAvgBpm',
  ];

  for (const key of numericKeys) {
    if (base[key] === null || base[key] === undefined) {
      base[key] = SYNTHETIC_HEALTH_CONNECT_SUMMARY[key];
      syntheticFields.add(key);
    } else if (!live) {
      syntheticFields.add(key);
    }
  }

  if (!live) {
    base.sleepSessionCount = SYNTHETIC_HEALTH_CONNECT_SUMMARY.sleepSessionCount;
  }

  return { summary: base, syntheticFields, hasAnyLiveValue };
}

export interface BiomarkerTile {
  marker: LabMarkerKey;
  label: string;
  valueText: string;
  caption: string;
  isSynthetic: boolean;
  status: string;
}

// Synthetic demo placeholders for markers that are never measured in real
// panels but help show a "fully connected" feel in Demo Filled Mode.
const SYNTHETIC_BIOMARKER_FILLERS: Partial<Record<LabMarkerKey, { value: number; unit: string; status: string }>> = {
  apoB: { value: 82, unit: 'mg/dL', status: 'Synthetic demo' },
  lpA: { value: 18, unit: 'mg/dL', status: 'Synthetic demo' },
  fastingGlucose: { value: 88, unit: 'mg/dL', status: 'Synthetic demo' },
  homocysteine: { value: 8.4, unit: 'µmol/L', status: 'Synthetic demo' },
  uricAcid: { value: 5.6, unit: 'mg/dL', status: 'Synthetic demo' },
  alt: { value: 22, unit: 'U/L', status: 'Synthetic demo' },
};

const FEATURED_MARKERS: LabMarkerKey[] = [
  'apoB',
  'hba1c',
  'hsCrp',
  'vitaminD',
  'ldl',
  'hdl',
  'triglycerides',
  'ferritin',
  'b12',
  'magnesium',
  'dao',
];

export function getBiomarkerTiles(mode: DataMode): BiomarkerTile[] {
  const realByMarker = new Map<LabMarkerKey, LatestMarkerReading>();
  for (const reading of getAllLatestRealMarkers()) {
    realByMarker.set(reading.marker, reading);
  }

  const tiles: BiomarkerTile[] = [];

  for (const marker of FEATURED_MARKERS) {
    const real = realByMarker.get(marker);
    if (real) {
      tiles.push({
        marker,
        label: real.label,
        valueText: formatRealValue(real),
        caption: `${real.rawStatus} · ${real.panelName}`,
        isSynthetic: false,
        status: real.rawStatus,
      });
      continue;
    }

    if (mode === 'demo-filled') {
      const filler = SYNTHETIC_BIOMARKER_FILLERS[marker];
      const label = findLabelForMarker(marker);
      if (filler && label) {
        tiles.push({
          marker,
          label,
          valueText: `${filler.value} ${filler.unit}`,
          caption: 'Synthetic demo · not from real lab',
          isSynthetic: true,
          status: filler.status,
        });
        continue;
      }
    }

    if (mode === 'real') {
      const label = findLabelForMarker(marker);
      if (label) {
        tiles.push({
          marker,
          label,
          valueText: 'Not measured',
          caption: 'No real lab value yet',
          isSynthetic: false,
          status: 'Missing',
        });
      }
    }
  }

  return tiles;
}

function formatRealValue(reading: LatestMarkerReading): string {
  if (reading.unit === '%') return `${reading.value}%`;
  if (reading.unit === null) return `${reading.value}`;
  return `${reading.value} ${reading.unit}`;
}

function findLabelForMarker(marker: LabMarkerKey): string | null {
  for (const panel of REAL_LAB_PANELS) {
    const entry = panel.entries.find((candidate) => candidate.marker === marker);
    if (entry) return entry.label;
  }
  return null;
}
