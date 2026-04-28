/**
 * healthConnectLive.ts
 *
 * Foreground Health Connect reader for Prototype V1 - Marathon.
 * Reads a small, display-only snapshot from Health Connect.
 *
 * Boundaries:
 * - no background sync
 * - no Supabase write
 * - no score recomputation
 * - no medical interpretation
 */
import { Platform } from 'react-native';

export type LiveHealthMetric = {
  label: string;
  value: string;
  unit?: string;
  status: 'available' | 'missing' | 'error';
  note?: string;
};

export type LiveHealthConnectSnapshot = {
  status: 'unsupported_platform' | 'module_unavailable' | 'permission_required' | 'available' | 'partial' | 'error';
  fetchedAt: string;
  message?: string;
  metrics: {
    stepsToday: LiveHealthMetric;
    distanceToday: LiveHealthMetric;
    activeCaloriesToday: LiveHealthMetric;
    restingHeartRate: LiveHealthMetric;
    hrvRmssd: LiveHealthMetric;
    sleepDuration: LiveHealthMetric;
  };
};

type HcModule = {
  getSdkStatus: () => Promise<number>;
  initialize: () => Promise<boolean>;
  getGrantedPermissions: () => Promise<any[]>;
  readRecords: (recordType: string, options: any) => Promise<{ records?: any[] }>;
  aggregateRecord: (request: any) => Promise<any>;
  SdkAvailabilityStatus: {
    SDK_UNAVAILABLE: number;
    SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED: number;
    SDK_AVAILABLE: number;
  };
};

const missing = (label: string, note?: string): LiveHealthMetric => ({
  label,
  value: '—',
  status: 'missing',
  note,
});

const failed = (label: string, note?: string): LiveHealthMetric => ({
  label,
  value: '—',
  status: 'error',
  note,
});

const metric = (label: string, value: string, unit?: string, note?: string): LiveHealthMetric => ({
  label,
  value,
  unit,
  status: 'available',
  note,
});

function emptyMetrics(note?: string): LiveHealthConnectSnapshot['metrics'] {
  return {
    stepsToday: missing('Steps today', note),
    distanceToday: missing('Distance today', note),
    activeCaloriesToday: missing('Active calories today', note),
    restingHeartRate: missing('Resting heart rate', note),
    hrvRmssd: missing('HRV RMSSD', note),
    sleepDuration: missing('Sleep last night', note),
  };
}

async function loadModule(): Promise<HcModule | null> {
  if (Platform.OS !== 'android') return null;
  try {
    return (await import('react-native-health-connect')) as unknown as HcModule;
  } catch {
    return null;
  }
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function hasPermission(granted: any[], recordType: string): boolean {
  return granted.some((g) => g?.accessType === 'read' && g?.recordType === recordType);
}

async function safeAggregate(
  mod: HcModule,
  recordType: string,
  startTime: Date,
  endTime: Date,
): Promise<any | null> {
  try {
    return await mod.aggregateRecord({
      recordType,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
  } catch {
    return null;
  }
}

async function safeLatestRecord(
  mod: HcModule,
  recordType: string,
  startTime: Date,
  endTime: Date,
): Promise<any | null> {
  try {
    const result = await mod.readRecords(recordType, {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      ascendingOrder: false,
      pageSize: 20,
    });
    const records = Array.isArray(result?.records) ? result.records : [];
    if (records.length === 0) return null;
    return records.sort((a, b) => {
      const at = new Date(a.endTime ?? a.time ?? a.startTime ?? 0).getTime();
      const bt = new Date(b.endTime ?? b.time ?? b.startTime ?? 0).getTime();
      return bt - at;
    })[0];
  } catch {
    return null;
  }
}

function formatDuration(raw: number | undefined): string | null {
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) return null;

  // Library returns a number for Health Connect duration.
  // Be defensive across possible ms / seconds / minutes representations.
  let minutes: number;
  if (raw > 24 * 60 * 60) {
    minutes = Math.round(raw / 60000); // milliseconds
  } else if (raw > 24 * 60) {
    minutes = Math.round(raw / 60); // seconds
  } else {
    minutes = Math.round(raw); // minutes
  }

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export async function readLiveHealthConnectSnapshot(): Promise<LiveHealthConnectSnapshot> {
  const fetchedAt = new Date().toISOString();

  if (Platform.OS !== 'android') {
    return {
      status: 'unsupported_platform',
      fetchedAt,
      message: 'Health Connect is Android-only.',
      metrics: emptyMetrics('Android-only'),
    };
  }

  const mod = await loadModule();
  if (!mod) {
    return {
      status: 'module_unavailable',
      fetchedAt,
      message: 'Health Connect module is not linked.',
      metrics: emptyMetrics('Module unavailable'),
    };
  }

  try {
    const sdk = await mod.getSdkStatus();
    if (sdk !== mod.SdkAvailabilityStatus.SDK_AVAILABLE) {
      return {
        status: 'permission_required',
        fetchedAt,
        message: 'Health Connect is unavailable or needs an update.',
        metrics: emptyMetrics('Health Connect unavailable'),
      };
    }

    await mod.initialize();
    const granted = await mod.getGrantedPermissions();

    const now = new Date();
    const today = startOfToday();
    const last7Days = daysAgo(7);
    const last36Hours = new Date(now.getTime() - 36 * 60 * 60 * 1000);

    const metrics = emptyMetrics('No permission or no data');

    if (hasPermission(granted, 'Steps')) {
      const agg = await safeAggregate(mod, 'Steps', today, now);
      const count = agg?.COUNT_TOTAL;
      metrics.stepsToday = typeof count === 'number'
        ? metric('Steps today', Math.round(count).toLocaleString('en-US'), undefined, 'Health Connect')
        : missing('Steps today', 'No steps today');
    }

    if (hasPermission(granted, 'Distance')) {
      const agg = await safeAggregate(mod, 'Distance', today, now);
      const km = agg?.DISTANCE?.inKilometers;
      metrics.distanceToday = typeof km === 'number'
        ? metric('Distance today', km.toFixed(1), 'km', 'Health Connect')
        : missing('Distance today', 'No distance today');
    }

    if (hasPermission(granted, 'ActiveCaloriesBurned')) {
      const agg = await safeAggregate(mod, 'ActiveCaloriesBurned', today, now);
      const kcal = agg?.ACTIVE_CALORIES_TOTAL?.inKilocalories;
      metrics.activeCaloriesToday = typeof kcal === 'number'
        ? metric('Active calories today', Math.round(kcal).toLocaleString('en-US'), 'kcal', 'Health Connect')
        : missing('Active calories today', 'No active calories today');
    }

    if (hasPermission(granted, 'RestingHeartRate')) {
      const rec = await safeLatestRecord(mod, 'RestingHeartRate', last7Days, now);
      metrics.restingHeartRate = typeof rec?.beatsPerMinute === 'number'
        ? metric('Resting heart rate', Math.round(rec.beatsPerMinute).toString(), 'bpm', 'Latest 7 days')
        : missing('Resting heart rate', 'No recent value');
    }

    if (hasPermission(granted, 'HeartRateVariabilityRmssd')) {
      const rec = await safeLatestRecord(mod, 'HeartRateVariabilityRmssd', last7Days, now);
      metrics.hrvRmssd = typeof rec?.heartRateVariabilityMillis === 'number'
        ? metric('HRV RMSSD', Math.round(rec.heartRateVariabilityMillis).toString(), 'ms', 'Latest 7 days')
        : missing('HRV RMSSD', 'No recent value');
    }

    if (hasPermission(granted, 'SleepSession')) {
      const agg = await safeAggregate(mod, 'SleepSession', last36Hours, now);
      const duration = formatDuration(agg?.SLEEP_DURATION_TOTAL);
      metrics.sleepDuration = duration
        ? metric('Sleep last night', duration, undefined, 'Last 36 hours')
        : missing('Sleep last night', 'No recent sleep session');
    }

    const availableCount = Object.values(metrics).filter((m) => m.status === 'available').length;

    if (availableCount === 0) {
      return {
        status: granted.length > 0 ? 'partial' : 'permission_required',
        fetchedAt,
        message: granted.length > 0 ? 'Permissions granted, but no recent Health Connect data found.' : 'No Health Connect permissions granted.',
        metrics,
      };
    }

    return {
      status: availableCount === Object.keys(metrics).length ? 'available' : 'partial',
      fetchedAt,
      message: 'Display-only foreground Health Connect snapshot.',
      metrics,
    };
  } catch (err: any) {
    return {
      status: 'error',
      fetchedAt,
      message: err?.message ?? 'Health Connect read failed.',
      metrics: emptyMetrics('Read failed'),
    };
  }
}
