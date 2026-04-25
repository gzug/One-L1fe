import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useWearablePermissions } from './useWearablePermissions';
import { readGarminHealthConnectData } from './healthConnectGarminReader';
import type { HealthConnectGarminReadResult } from './healthConnectGarminReader';
import {
  DEFAULT_MANUAL_DEMO_INPUTS,
  buildHealthOsDemoReport,
} from './healthOsDemoReport';

type SyncUiState =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'done'; result: HealthConnectGarminReadResult }
  | { kind: 'error'; message: string };

export default function AntlerHealthOsDemoScreen(): React.JSX.Element {
  const { status, request } = useWearablePermissions();
  const [manualFallbackEnabled, setManualFallbackEnabled] = useState(false);
  const [syncState, setSyncState] = useState<SyncUiState>({ kind: 'idle' });

  const healthConnectResult = syncState.kind === 'done' ? syncState.result : null;
  const report = useMemo(
    () => buildHealthOsDemoReport({
      healthConnectResult,
      manualInputs: DEFAULT_MANUAL_DEMO_INPUTS,
      manualFallbackEnabled,
    }),
    [healthConnectResult, manualFallbackEnabled],
  );

  const handleReadHealthConnect = async (): Promise<void> => {
    setSyncState({ kind: 'reading' });
    try {
      const result = await readGarminHealthConnectData({
        wearableSourceId: 'antler-demo-health-connect-local',
        lookbackDays: 14,
      });
      setSyncState({ kind: 'done', result });
      if (result.status !== 'live') {
        setManualFallbackEnabled(true);
      }
    } catch (error) {
      setSyncState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Unknown sync error.',
      });
      setManualFallbackEnabled(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>One L1fe Demo</Text>
          <Text style={styles.title}>Antler Health OS</Text>
          <Text style={styles.subtitle}>
            Reduced Android demo for Health Connect, Garmin-origin data visibility, and a weekly Health OS report.
          </Text>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Demo boundary</Text>
          <Text style={styles.noticeText}>
            Garmin is read only through Android Health Connect. This demo does not use direct Garmin API or Terra OAuth, and it only claims live Garmin data when Health Connect records are readable.
          </Text>
        </View>

        <Section title="1. Health Connect Onboarding">
          <StatusRow label="Permission state" value={formatPermissionStatus(status)} />
          <Text style={styles.bodyText}>
            Before opening One L1fe, connect the Garmin watch in Garmin Connect and enable Garmin Connect sharing into Android Health Connect.
          </Text>
          {status === 'denied' || status === 'unknown' ? (
            <PrimaryButton
              label="Grant Health Connect access"
              onPress={() => {
                void request();
              }}
            />
          ) : null}
          {status === 'unavailable' ? (
            <Text style={styles.warningText}>
              Health Connect is not available on this device. Use manual demo mode for the report preview.
            </Text>
          ) : null}
        </Section>

        <Section title="2. Live Health Connect Reader">
          <Text style={styles.bodyText}>
            Reads Steps, SleepSession, HeartRate, RestingHeartRate, HeartRateVariabilityRmssd, ActiveCaloriesBurned, and Distance from Health Connect.
          </Text>
          <PrimaryButton
            label={syncState.kind === 'reading' ? 'Reading Health Connect...' : 'Sync from Health Connect'}
            onPress={() => {
              void handleReadHealthConnect();
            }}
            disabled={status !== 'granted' || syncState.kind === 'reading'}
          />
          {syncState.kind === 'reading' ? <ActivityIndicator color="#0f766e" /> : null}
          {syncState.kind === 'error' ? (
            <Text style={styles.warningText}>{syncState.message}</Text>
          ) : null}
          {healthConnectResult ? <HealthConnectResultCard result={healthConnectResult} /> : null}
        </Section>

        <Section title="3. Baseline Assessment">
          <StatusRow label="Baseline" value="Manual demo complete" />
          <StatusRow label="Goal context" value="Energy, recovery, long-term consistency" />
          <StatusRow label="Mode" value={manualFallbackEnabled ? 'Manual fallback enabled' : 'Waiting for live data'} />
        </Section>

        <Section title="4. Blood Panel / Biomarkers">
          <Text style={styles.bodyText}>
            Manual demo values are shown as context only. They are not imported from Garmin or Health Connect.
          </Text>
          <View style={styles.metricGrid}>
            <MetricTile label="ApoB" value="82 mg/dL" caption="manual demo" />
            <MetricTile label="HbA1c" value="5.2%" caption="manual demo" />
            <MetricTile label="hsCRP" value="1.1 mg/L" caption="manual demo" />
            <MetricTile label="Vitamin D" value="38 ng/mL" caption="manual demo" />
          </View>
        </Section>

        <Section title="5. Weekly Health Report">
          <View style={styles.reportHeader}>
            <Text style={styles.reportSource}>{report.sourceLabel}</Text>
            <Text style={styles.reportBadge}>
              {report.isManualFallback ? 'Manual demo fallback' : 'Live Health Connect'}
            </Text>
          </View>
          <View style={styles.scoreGrid}>
            <ScoreTile label="Exercise" score={report.exerciseScore} />
            <ScoreTile label="Sleep" score={report.sleepScore} />
            <ScoreTile label="Nutrition" score={report.nutritionScore} />
            <ScoreTile label="Emotional Health" score={report.emotionalHealthScore} />
          </View>
          <StatusRow label="Data completeness" value={`${report.dataCompleteness}%`} />
          <StatusRow label="Garmin connection" value={report.garminConnectionState} />
          <StatusRow label="Weakest pillar" value={report.weakestPillar} />
          <StatusRow label="Biggest opportunity" value={report.biggestOpportunity} />
          <StatusRow label="Long-term risk" value={report.longTermRisk} />
          <StatusRow label="Bottleneck" value={report.bottleneck} />
        </Section>

        <Section title="Focus Actions">
          {report.actions.slice(0, 3).map((action, index) => (
            <View key={action} style={styles.actionRow}>
              <Text style={styles.actionIndex}>{index + 1}</Text>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </Section>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Not medical advice</Text>
          <Text style={styles.noticeText}>
            One L1fe is a data organization and health interpretation demo. It does not provide diagnosis, treatment, or emergency guidance.
          </Text>
          <Pressable
            onPress={() => setManualFallbackEnabled((current) => !current)}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {manualFallbackEnabled ? 'Disable manual fallback' : 'Enable manual demo fallback'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryButton, disabled ? styles.buttonDisabled : null]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function HealthConnectResultCard({
  result,
}: {
  result: HealthConnectGarminReadResult;
}): React.JSX.Element {
  const summary = result.summary;
  return (
    <View style={styles.resultCard}>
      <StatusRow label="Read status" value={result.status} />
      <StatusRow label="Message" value={result.message} />
      <StatusRow label="Records normalized" value={`${result.observations.length}`} />
      <StatusRow label="Sync request" value={result.request ? 'Valid WearableSyncRequest built' : 'Not built without records'} />
      <StatusRow label="Steps" value={formatNumber(summary.stepsTotal, 'steps')} />
      <StatusRow label="Sleep" value={formatHours(summary.sleepDurationSeconds)} />
      <StatusRow label="Resting HR" value={formatNumber(summary.restingHeartRateBpm, 'bpm')} />
      <StatusRow label="HRV RMSSD" value={formatNumber(summary.hrvRmssdMs, 'ms')} />
      <StatusRow label="Active energy" value={formatNumber(summary.activeEnergyKcal, 'kcal')} />
      <StatusRow label="Distance" value={formatMeters(summary.distanceMeters)} />
      <StatusRow
        label="Data origins"
        value={summary.sourceOrigins.length > 0 ? summary.sourceOrigins.join(', ') : 'Not reported by Health Connect'}
      />
    </View>
  );
}

function StatusRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

function MetricTile({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}): React.JSX.Element {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricCaption}>{caption}</Text>
    </View>
  );
}

function ScoreTile({ label, score }: { label: string; score: number }): React.JSX.Element {
  return (
    <View style={styles.scoreTile}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{score > 0 ? score : '--'}</Text>
    </View>
  );
}

function formatPermissionStatus(status: string): string {
  if (status === 'granted') return 'Granted';
  if (status === 'denied') return 'Needs permission';
  if (status === 'unavailable') return 'Unavailable';
  return 'Checking';
}

function formatNumber(value: number | null, unit: string): string {
  return value === null ? 'No data' : `${Math.round(value).toLocaleString()} ${unit}`;
}

function formatHours(seconds: number | null): string {
  return seconds === null ? 'No data' : `${(seconds / 3600).toFixed(1)} h`;
}

function formatMeters(meters: number | null): string {
  return meters === null ? 'No data' : `${(meters / 1000).toFixed(1)} km`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f4ef',
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 18,
    paddingBottom: 42,
    gap: 14,
  },
  header: {
    paddingTop: 12,
    gap: 6,
  },
  eyebrow: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#17211b',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: '#52635b',
    fontSize: 15,
    lineHeight: 22,
  },
  noticeCard: {
    backgroundColor: '#fffaf2',
    borderColor: '#e0caa3',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  noticeTitle: {
    color: '#3b2b13',
    fontSize: 15,
    fontWeight: '800',
  },
  noticeText: {
    color: '#5f4b2b',
    fontSize: 13,
    lineHeight: 19,
  },
  section: {
    backgroundColor: '#ffffff',
    borderColor: '#e6e0d7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    color: '#17211b',
    fontSize: 18,
    fontWeight: '800',
  },
  bodyText: {
    color: '#52635b',
    fontSize: 14,
    lineHeight: 20,
  },
  warningText: {
    color: '#9a3412',
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9bb8b4',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 8,
    borderColor: '#b99b62',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: '#5f4316',
    fontSize: 14,
    fontWeight: '800',
  },
  statusRow: {
    gap: 4,
    borderBottomColor: '#eee7de',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  statusLabel: {
    color: '#6b7b73',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusValue: {
    color: '#17211b',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricTile: {
    width: '47%',
    minHeight: 96,
    borderRadius: 8,
    backgroundColor: '#f5f7f2',
    padding: 12,
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: '#52635b',
    fontSize: 12,
    fontWeight: '800',
  },
  metricValue: {
    color: '#17211b',
    fontSize: 18,
    fontWeight: '800',
  },
  metricCaption: {
    color: '#7b8780',
    fontSize: 12,
  },
  resultCard: {
    backgroundColor: '#eef7f5',
    borderColor: '#b7d6d0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },
  reportSource: {
    color: '#52635b',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  reportBadge: {
    color: '#0f766e',
    backgroundColor: '#e0f2ef',
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '800',
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  scoreTile: {
    width: '47%',
    backgroundColor: '#17211b',
    borderRadius: 8,
    padding: 12,
    minHeight: 88,
    justifyContent: 'space-between',
  },
  scoreLabel: {
    color: '#d8e7df',
    fontSize: 12,
    fontWeight: '800',
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: '#f5f7f2',
    borderRadius: 8,
    padding: 12,
  },
  actionIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0f766e',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '800',
  },
  actionText: {
    flex: 1,
    color: '#17211b',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});
