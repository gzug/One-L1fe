/**
 * DEV-ONLY: Health Connect Diagnostic Screen
 * Invisible in release builds — guarded by __DEV__.
 * Shows record count + latest timestamp for each HC data type.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  initialize,
  readRecords,
} from 'react-native-health-connect';

if (!__DEV__) {
  throw new Error('HealthConnectDiagnosticScreen must never be imported in release builds.');
}

const DATA_TYPES = [
  'Steps',
  'HeartRate',
  'RestingHeartRate',
  'HeartRateVariabilityRmssd',
  'ActiveCaloriesBurned',
  'TotalCaloriesBurned',
  'ExerciseSession',
  'SleepSession',
  'Distance',
  'Vo2Max',
  'OxygenSaturation',
  'Weight',
] as const;

type DataType = typeof DATA_TYPES[number];

interface TypeResult {
  type: DataType;
  count: number;
  latest: string | null;
  error?: string;
}

async function fetchType(type: DataType): Promise<TypeResult> {
  try {
    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); // last 7 days
    const { records } = await readRecords(type as any, {
      timeRangeFilter: {
        operator: 'between',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      },
    });
    const sorted = [...records].sort((a: any, b: any) => {
      const ta = a.endTime ?? a.time ?? '';
      const tb = b.endTime ?? b.time ?? '';
      return tb.localeCompare(ta);
    });
    const latest = sorted[0]
      ? ((sorted[0] as any).endTime ?? (sorted[0] as any).time ?? null)
      : null;
    return { type, count: records.length, latest };
  } catch (e: any) {
    return { type, count: 0, latest: null, error: e?.message ?? 'unknown error' };
  }
}

export default function HealthConnectDiagnosticScreen(): React.JSX.Element {
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState<TypeResult[]>([]);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const available = await initialize();
        if (!available) {
          setInitError('Health Connect not available on this device.');
          return;
        }
        const all = await Promise.all(DATA_TYPES.map(fetchType));
        setResults(all);
      } catch (e: any) {
        setInitError(e?.message ?? 'init failed');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4263eb" />
        <Text style={styles.loading}>Querying Health Connect…</Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{initError}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>HC Diagnostic (DEV)</Text>
      <Text style={styles.sub}>Last 7 days · {new Date().toLocaleString()}</Text>
      {results.map((r) => (
        <View key={r.type} style={[styles.row, r.error ? styles.rowError : null]}>
          <Text style={styles.typeName}>{r.type}</Text>
          <Text style={styles.count}>{r.error ? `⚠ ${r.error}` : `${r.count} records`}</Text>
          <Text style={styles.latest}>
            {r.latest ? `Latest: ${new Date(r.latest).toLocaleString()}` : 'No data'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  loading: { color: '#52607a', fontSize: 14 },
  error: { color: '#c0392b', fontSize: 15, textAlign: 'center' },
  container: { padding: 20, paddingBottom: 48 },
  header: { fontSize: 22, fontWeight: '700', color: '#152033', marginBottom: 4 },
  sub: { fontSize: 12, color: '#8897a8', marginBottom: 20 },
  row: {
    backgroundColor: '#f4f6fb',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  rowError: { backgroundColor: '#fdf0ef' },
  typeName: { fontSize: 15, fontWeight: '600', color: '#152033' },
  count: { fontSize: 13, color: '#4263eb', marginTop: 2 },
  latest: { fontSize: 12, color: '#8897a8', marginTop: 2 },
});
