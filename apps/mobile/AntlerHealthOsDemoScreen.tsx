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
import { buildHealthOsDemoReport } from './healthOsDemoReport';
import {
  DATA_MODE_LABELS,
  getBiomarkerTiles,
  type BiomarkerTile,
  type DataMode,
} from './healthOsDataMode';
import { REAL_LAB_PANELS } from './realBiomarkerPanels';

type SyncUiState =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'done'; result: HealthConnectGarminReadResult }
  | { kind: 'error'; message: string };

const DATA_MODE_OPTIONS: DataMode[] = ['real', 'demo-filled'];

export default function AntlerHealthOsDemoScreen(): React.JSX.Element {
  const { status, request } = useWearablePermissions();
  const [dataMode, setDataMode] = useState<DataMode>('real');
  const [syncState, setSyncState] = useState<SyncUiState>({ kind: 'idle' });

  const healthConnectResult = syncState.kind === 'done' ? syncState.result : null;
  const report = useMemo(
    () => buildHealthOsDemoReport({ healthConnectResult, dataMode }),
    [healthConnectResult, dataMode],
  );
  const biomarkerTiles = useMemo(() => getBiomarkerTiles(dataMode), [dataMode]);

  const handleReadHealthConnect = async (): Promise<void> => {
    setSyncState({ kind: 'reading' });
    try {
      const result = await readGarminHealthConnectData({
        wearableSourceId: 'antler-demo-health-connect-local',
        lookbackDays: 14,
      });
      setSyncState({ kind: 'done', result });
    } catch (error) {
      setSyncState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Unknown sync error.',
      });
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

        <DataModeToggle mode={dataMode} onChange={setDataMode} />

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Demo boundary</Text>
          <Text style={styles.noticeText}>
            Garmin is read only through Android Health Connect. This demo does not use direct Garmin API or Terra OAuth, and it only claims live Garmin data when Health Connect records are readable.
          </Text>
          <Text style={styles.noticeText}>
            {dataMode === 'real'
              ? 'Real Data Mode: only real values are shown. Missing Garmin / Health Connect fields stay empty — they are never invented.'
              : 'Demo Filled Mode: real values are still real, but missing live fields are filled with clearly labelled synthetic placeholders so the app can be previewed end-to-end.'}
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
              Health Connect is not available on this device.
              {dataMode === 'demo-filled'
                ? ' Demo Filled Mode will substitute synthetic placeholders for the report preview.'
                : ' Real Data Mode will only show real lab values until a live Health Connect read succeeds.'}
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
          {!healthConnectResult && dataMode === 'real' ? (
            <Text style={styles.bodyText}>
              No live Health Connect data available yet. In Real Data Mode, no synthetic Garmin / Health Connect values are shown.
            </Text>
          ) : null}
        </Section>

        <Section title="3. Baseline Assessment">
          <StatusRow label="Profile" value="Male (real lab profile)" />
          <StatusRow label="Goal context" value="Energy, recovery, long-term consistency" />
          <StatusRow
            label="Mode"
            value={dataMode === 'real' ? 'Real Data — no synthetic fill' : 'Demo Filled — synthetic placeholders allowed'}
          />
        </Section>

        <Section title="4. Blood Panel / Biomarkers">
          <Text style={styles.bodyText}>
            Real lab values come from the Apr 2025 (ALAB) and Oct 2023 (Danish hospital lab) panels stored in the Notion export.
          </Text>
          <View style={styles.panelList}>
            {REAL_LAB_PANELS.map((panel) => (
              <View key={panel.id} style={styles.panelCard}>
                <Text style={styles.panelTitle}>{panel.name}</Text>
                <Text style={styles.panelMeta}>{panel.date} · {panel.source}</Text>
                <Text style={styles.panelNotes}>{panel.notes}</Text>
              </View>
            ))}
          </View>
          <View style={styles.metricGrid}>
            {biomarkerTiles.map((tile) => (
              <BiomarkerTileView key={tile.marker} tile={tile} />
            ))}
          </View>
        </Section>

        <Section title="5. Weekly Health Report">
          <View style={styles.reportHeader}>
            <Text style={styles.reportSource}>{report.sourceLabel}</Text>
            <Text style={[styles.reportBadge, dataMode === 'demo-filled' ? styles.reportBadgeDemo : null]}>
              {DATA_MODE_LABELS[dataMode]}
            </Text>
          </View>
          {report.usesSyntheticData ? (
            <Text style={styles.syntheticNotice}>
              Synthetic placeholders in use for: {report.syntheticFields.join(', ')}
            </Text>
          ) : null}
          <View style={styles.scoreGrid}>
            <ScoreTile label="Exercise" score={report.exerciseScore} />
            <ScoreTile label="Sleep" score={report.sleepScore} />
            <ScoreTile label="Nutrition" score={report.nutritionScore} />
            <ScoreTile label="Emotional Health" score={report.emotionalHealthScore} />
          </View>
          <StatusRow label="Data completeness" value={`${report.dataCompleteness}%`} />
          <StatusRow label="Garmin connection" value={report.garminConnectionState} />
          <StatusRow label="Real lab panels" value={`${report.realLabPanelCount} loaded`} />
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DataModeToggle({
  mode,
  onChange,
}: {
  mode: DataMode;
  onChange: (next: DataMode) => void;
}): React.JSX.Element {
  return (
    <View style={styles.modeToggle}>
      <Text style={styles.modeToggleLabel}>Data mode</Text>
      <View style={styles.modeToggleRow}>
        {DATA_MODE_OPTIONS.map((option) => {
          const active = option === mode;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.modeToggleButton, active ? styles.modeToggleButtonActive : null]}
            >
              <Text style={[styles.modeToggleButtonText, active ? styles.modeToggleButtonTextActive : null]}>
                {DATA_MODE_LABELS[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.modeToggleHint}>
        {mode === 'real'
          ? 'Showing only real values. Missing Garmin / Health Connect fields are not invented.'
          : 'Showing real values where available; synthetic placeholders fill missing live fields.'}
      </Text>
    </View>
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

function BiomarkerTileView({ tile }: { tile: BiomarkerTile }): React.JSX.Element {
  return (
    <View style={[styles.metricTile, tile.isSynthetic ? styles.metricTileSynthetic : null]}>
      <Text style={styles.metricLabel}>{tile.label}</Text>
      <Text style={styles.metricValue}>{tile.valueText}</Text>
      <Text style={[styles.metricCaption, tile.isSynthetic ? styles.metricCaptionSynthetic : null]}>
        {tile.caption}
      </Text>
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
  modeToggle: {
    backgroundColor: '#ffffff',
    borderColor: '#e6e0d7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 10,
  },
  modeToggleLabel: {
    color: '#6b7b73',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeToggleButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5d1',
    backgroundColor: '#f5f7f2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  modeToggleButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  modeToggleButtonText: {
    color: '#17211b',
    fontSize: 14,
    fontWeight: '800',
  },
  modeToggleButtonTextActive: {
    color: '#ffffff',
  },
  modeToggleHint: {
    color: '#52635b',
    fontSize: 12,
    lineHeight: 18,
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
  syntheticNotice: {
    color: '#7a4f00',
    backgroundColor: '#fff3d9',
    borderColor: '#e7c98a',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
    fontWeight: '700',
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
  panelList: {
    gap: 8,
  },
  panelCard: {
    backgroundColor: '#f5f7f2',
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  panelTitle: {
    color: '#17211b',
    fontSize: 14,
    fontWeight: '800',
  },
  panelMeta: {
    color: '#52635b',
    fontSize: 12,
    fontWeight: '700',
  },
  panelNotes: {
    color: '#52635b',
    fontSize: 12,
    lineHeight: 18,
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
  metricTileSynthetic: {
    backgroundColor: '#fff3d9',
    borderColor: '#e7c98a',
    borderWidth: 1,
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
  metricCaptionSynthetic: {
    color: '#7a4f00',
    fontWeight: '700',
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
  reportBadgeDemo: {
    color: '#7a4f00',
    backgroundColor: '#fff3d9',
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
