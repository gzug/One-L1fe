import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ScreenHeader } from '../../ui/components';
import { theme } from '../../ui/theme';

type DiagnosticRow = {
  label: string;
  count: number;
  latestTimestamp: string | null;
  error?: string;
};

const RECORD_TYPES = [
  ['Steps', 'Steps'],
  ['HeartRate', 'HeartRate'],
  ['RestingHeartRate', 'RestingHeartRate'],
  ['HeartRateVariabilityRmssd', 'HeartRateVariabilityRmssd'],
  ['ActiveCaloriesBurned', 'ActiveCaloriesBurned'],
  ['TotalCaloriesBurned', 'TotalCaloriesBurned'],
  ['ExerciseSession', 'ExerciseSession'],
  ['SleepSession', 'SleepSession'],
  ['Distance', 'Distance'],
  ['Vo2Max', 'Vo2Max'],
  ['OxygenSaturation', 'OxygenSaturation'],
  ['Weight', 'Weight'],
  ['BodyFat', 'BodyFat'],
  ['BloodPressure', 'BloodPressure'],
] as const;

export default function HealthConnectDiagnosticScreen(): React.JSX.Element {
  const [rows, setRows] = useState<DiagnosticRow[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const hc = await import('react-native-health-connect');
        await hc.initialize();

        const endTime = new Date();
        const startTime = new Date(endTime);
        startTime.setDate(endTime.getDate() - 1);

        const nextRows: DiagnosticRow[] = [];

        for (const [label, recordType] of RECORD_TYPES) {
          try {
            const { records } = await hc.readRecords(recordType, {
              timeRangeFilter: {
                operator: 'between',
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
              },
            });

            const latestTimestamp = records.length > 0
              ? (records[0].endTime ?? records[0].startTime ?? null)
              : null;

            nextRows.push({ label, count: records.length, latestTimestamp });
          } catch (error) {
            nextRows.push({
              label,
              count: 0,
              latestTimestamp: null,
              error: error instanceof Error ? error.message : 'Failed to read record type.',
            });
          }
        }

        if (cancelled) return;
        setRows(nextRows);
        setStatus('ready');
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        setRows([
          {
            label: 'Health Connect',
            count: 0,
            latestTimestamp: null,
            error: error instanceof Error ? error.message : 'Health Connect unavailable.',
          },
        ]);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!__DEV__) {
    return <View />;
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <ScreenHeader
        eyebrow="One L1fe"
        title="Health Connect diagnostic"
        subtitle="Dev-only readback for the permitted record types."
      />

      {status === 'loading' ? (
        <Card>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.body}>Reading sample records from Health Connect...</Text>
        </Card>
      ) : null}

      {rows.map((row) => (
        <Card key={row.label} variant={row.error ? 'danger' : 'default'}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.body}>Count: {row.count}</Text>
          <Text style={styles.body}>Latest: {row.latestTimestamp ?? 'none'}</Text>
          {row.error ? <Text style={styles.error}>{row.error}</Text> : null}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 20, gap: 16 },
  label: { color: theme.colors.textLabel, ...theme.text.label },
  body: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 },
  error: { color: theme.colors.danger, fontSize: 13, lineHeight: 18 },
});
