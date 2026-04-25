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
import {
  THEME_LABELS,
  getTheme,
  type Theme,
  type ThemeName,
} from './healthOsTheme';

type SyncUiState =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'done'; result: HealthConnectGarminReadResult }
  | { kind: 'error'; message: string };

const DATA_MODE_OPTIONS: DataMode[] = ['real', 'demo-filled'];
const THEME_OPTIONS: ThemeName[] = ['light', 'dark'];

interface PlannedModule {
  title: string;
  summary: string;
  source: string;
}

const PLANNED_MODULES: PlannedModule[] = [
  {
    title: 'Recovery & Wearable Hub',
    summary:
      'Sleep, HRV, resting heart rate, and cardiovascular load tracked as a recovery surface for training load decisions.',
    source: 'docs/architecture/wearable-metric-keys-v1.md',
  },
  {
    title: 'Biomarker Hub',
    summary:
      'Longitudinal lipid, iron, and inflammation panels with bounded interpretation. Relevant for endurance bottlenecks like ferritin and LDL.',
    source: 'docs/architecture/biomarker-model.md',
  },
  {
    title: 'Data Coverage Hub',
    summary:
      'Tracks freshness and missingness across wearable and lab sources so reports never silently degrade.',
    source: 'docs/architecture/v1-rule-matrix.md',
  },
  {
    title: 'Clinician Handoff',
    summary:
      'Generates a doctor-summary export from the same data the assistant-coach view reads from.',
    source: 'docs/product/one-l1fe-documentation.md',
  },
  {
    title: 'Genetics / DNA Module',
    summary:
      'Planned future integration of DNA-test data into the longitudinal profile. Not active in V1 Marathon.',
    source: 'docs/product/one-l1fe-documentation.md',
  },
];

export default function AntlerHealthOsDemoScreen(): React.JSX.Element {
  const { status, request } = useWearablePermissions();
  const [dataMode, setDataMode] = useState<DataMode>('real');
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const [syncState, setSyncState] = useState<SyncUiState>({ kind: 'idle' });

  const theme = useMemo(() => getTheme(themeName), [themeName]);
  const styles = useMemo(() => createStyles(theme), [theme]);

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
        wearableSourceId: 'one-l1fe-marathon-health-connect',
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
          <Text style={styles.eyebrow}>Marathon Prototype</Text>
          <Text style={styles.title}>One L1fe — V1 Marathon</Text>
          <Text style={styles.subtitle}>
            Feature-reduced prototype for training toward the Brisbane Marathon. It connects blood markers, Garmin / Health Connect signals, and training goals into a focused assistant-coach view.
          </Text>
        </View>

        <View style={styles.toggleRowGroup}>
          <DataModeToggle mode={dataMode} onChange={setDataMode} styles={styles} />
          <ThemeToggle theme={theme} mode={themeName} onChange={setThemeName} styles={styles} />
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Scope</Text>
          <Text style={styles.noticeText}>
            Garmin is read only through Android Health Connect. No direct Garmin API and no Terra OAuth. Live Garmin data is only claimed when Health Connect actually returns records.
          </Text>
          <Text style={styles.noticeText}>
            {dataMode === 'real'
              ? 'Real Data Mode: only real values are shown. Missing Garmin / Health Connect fields stay empty — they are never invented.'
              : 'Demo Filled Mode: real values stay real. Missing live fields are filled with clearly labelled synthetic placeholders so the marathon view can be previewed end-to-end.'}
          </Text>
        </View>

        <Section title="1. Connect Garmin / Health Data" styles={styles}>
          <StatusRow styles={styles} label="Permission state" value={formatPermissionStatus(status)} />
          <Text style={styles.bodyText}>
            Open Garmin Connect, confirm the watch has synced, then enable Garmin Connect sharing into Android Health Connect before granting permissions here.
          </Text>
          {status === 'denied' || status === 'unknown' ? (
            <PrimaryButton
              styles={styles}
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
                ? ' Demo Filled Mode will substitute synthetic placeholders for the readiness preview.'
                : ' Real Data Mode will only show real lab values until a live Health Connect read succeeds.'}
            </Text>
          ) : null}
        </Section>

        <Section title="2. Live Training Signals" styles={styles}>
          <Text style={styles.bodyText}>
            Reads Steps, SleepSession, HeartRate, RestingHeartRate, HeartRateVariabilityRmssd, ActiveCaloriesBurned, and Distance from Health Connect.
          </Text>
          <PrimaryButton
            styles={styles}
            label={syncState.kind === 'reading' ? 'Reading Health Connect…' : 'Sync from Health Connect'}
            onPress={() => {
              void handleReadHealthConnect();
            }}
            disabled={status !== 'granted' || syncState.kind === 'reading'}
          />
          {syncState.kind === 'reading' ? <ActivityIndicator color={theme.accent} /> : null}
          {syncState.kind === 'error' ? (
            <Text style={styles.warningText}>{syncState.message}</Text>
          ) : null}
          {healthConnectResult ? (
            <HealthConnectResultCard styles={styles} result={healthConnectResult} />
          ) : null}
          {!healthConnectResult && dataMode === 'real' ? (
            <Text style={styles.bodyText}>
              No live Health Connect data available yet. In Real Data Mode, no synthetic Garmin / Health Connect values are shown.
            </Text>
          ) : null}
        </Section>

        <Section title="3. Training Baseline" styles={styles}>
          <StatusRow styles={styles} label="Profile" value="Male (real lab profile)" />
          <StatusRow styles={styles} label="Goal" value="Brisbane Marathon — finish-line readiness" />
          <StatusRow
            styles={styles}
            label="Anchors"
            value="Aerobic capacity, recovery quality, iron + inflammation, source completeness"
          />
          <StatusRow
            styles={styles}
            label="Mode"
            value={dataMode === 'real' ? 'Real Data — no synthetic fill' : 'Demo Filled — synthetic placeholders allowed'}
          />
        </Section>

        <Section title="4. Blood Markers" styles={styles}>
          <Text style={styles.bodyText}>
            Real lab values come from the Apr 2025 (ALAB) and Oct 2023 (Danish hospital lab) panels stored in the Notion export. Iron, inflammation, and lipid markers are the marathon-relevant focus.
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
              <BiomarkerTileView key={tile.marker} styles={styles} tile={tile} />
            ))}
          </View>
        </Section>

        <Section title="5. Training Readiness Report" styles={styles}>
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
            <ScoreTile styles={styles} label="Exercise" score={report.exerciseScore} />
            <ScoreTile styles={styles} label="Sleep" score={report.sleepScore} />
            <ScoreTile styles={styles} label="Nutrition" score={report.nutritionScore} />
            <ScoreTile styles={styles} label="Emotional" score={report.emotionalHealthScore} />
          </View>
          <Text style={styles.captionText}>
            Exercise and Sleep are wearable-derived. Nutrition and Emotional are supporting context only and never override measured signals.
          </Text>
          <StatusRow styles={styles} label="Data completeness" value={`${report.dataCompleteness}%`} />
          <StatusRow styles={styles} label="Garmin connection" value={report.garminConnectionState} />
          <StatusRow styles={styles} label="Real lab panels" value={`${report.realLabPanelCount} loaded`} />
          <StatusRow styles={styles} label="Weakest pillar" value={report.weakestPillar} />
          <StatusRow styles={styles} label="Biggest opportunity" value={report.biggestOpportunity} />
          <StatusRow styles={styles} label="Long-term risk" value={report.longTermRisk} />
          <StatusRow styles={styles} label="Bottleneck" value={report.bottleneck} />
        </Section>

        <Section title="Next Training Actions" styles={styles}>
          {report.actions.slice(0, 3).map((action, index) => (
            <View key={action} style={styles.actionRow}>
              <Text style={styles.actionIndex}>{index + 1}</Text>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
          <Text style={styles.captionText}>
            Recommendations are bounded, non-medical, and tied to measured signals. They never replace a coach or clinician.
          </Text>
        </Section>

        <Section title="Planned Modules" styles={styles}>
          <Text style={styles.bodyText}>
            Future hubs documented in the repo. Listed for orientation only — they are not part of the V1 Marathon prototype.
          </Text>
          <View style={styles.plannedList}>
            {PLANNED_MODULES.map((module) => (
              <View key={module.title} style={styles.plannedCard}>
                <Text style={styles.plannedTitle}>{module.title}</Text>
                <Text style={styles.plannedSummary}>{module.summary}</Text>
                <Text style={styles.plannedSource}>{module.source}</Text>
              </View>
            ))}
          </View>
        </Section>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Not medical advice</Text>
          <Text style={styles.noticeText}>
            One L1fe — V1 Marathon is a data organization and training-context demo. It does not provide diagnosis, treatment, or emergency guidance.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DataModeToggle({
  mode,
  onChange,
  styles,
}: {
  mode: DataMode;
  onChange: (next: DataMode) => void;
  styles: ReturnType<typeof createStyles>;
}): React.JSX.Element {
  return (
    <View style={styles.toggleCard}>
      <Text style={styles.toggleLabel}>Data mode</Text>
      <View style={styles.toggleRow}>
        {DATA_MODE_OPTIONS.map((option) => {
          const active = option === mode;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.toggleButton, active ? styles.toggleButtonActive : null]}
            >
              <Text style={[styles.toggleButtonText, active ? styles.toggleButtonTextActive : null]}>
                {DATA_MODE_LABELS[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.toggleHint}>
        {mode === 'real'
          ? 'Showing only real values. Missing Garmin / Health Connect fields are not invented.'
          : 'Showing real values where available; synthetic placeholders fill missing live fields.'}
      </Text>
    </View>
  );
}

function ThemeToggle({
  theme,
  mode,
  onChange,
  styles,
}: {
  theme: Theme;
  mode: ThemeName;
  onChange: (next: ThemeName) => void;
  styles: ReturnType<typeof createStyles>;
}): React.JSX.Element {
  return (
    <View style={styles.toggleCard}>
      <Text style={styles.toggleLabel}>Appearance</Text>
      <View style={styles.toggleRow}>
        {THEME_OPTIONS.map((option) => {
          const active = option === mode;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.toggleButton, active ? styles.toggleButtonActive : null]}
            >
              <Text style={[styles.toggleButtonText, active ? styles.toggleButtonTextActive : null]}>
                {THEME_LABELS[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.toggleHint}>
        {theme.name === 'dark'
          ? 'Dark graphite surface with muted teal accents. Amber stays reserved for synthetic data.'
          : 'Minimal sport-focused light surface. Synthetic data still highlighted in amber.'}
      </Text>
    </View>
  );
}

function Section({
  title,
  children,
  styles,
}: {
  title: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
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
  styles,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  styles: ReturnType<typeof createStyles>;
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
  styles,
}: {
  result: HealthConnectGarminReadResult;
  styles: ReturnType<typeof createStyles>;
}): React.JSX.Element {
  const summary = result.summary;
  return (
    <View style={styles.resultCard}>
      <StatusRow styles={styles} label="Read status" value={result.status} />
      <StatusRow styles={styles} label="Message" value={result.message} />
      <StatusRow styles={styles} label="Records normalized" value={`${result.observations.length}`} />
      <StatusRow
        styles={styles}
        label="Sync request"
        value={result.request ? 'Valid WearableSyncRequest built' : 'Not built without records'}
      />
      <StatusRow styles={styles} label="Steps" value={formatNumber(summary.stepsTotal, 'steps')} />
      <StatusRow styles={styles} label="Sleep" value={formatHours(summary.sleepDurationSeconds)} />
      <StatusRow styles={styles} label="Resting HR" value={formatNumber(summary.restingHeartRateBpm, 'bpm')} />
      <StatusRow styles={styles} label="HRV RMSSD" value={formatNumber(summary.hrvRmssdMs, 'ms')} />
      <StatusRow styles={styles} label="Active energy" value={formatNumber(summary.activeEnergyKcal, 'kcal')} />
      <StatusRow styles={styles} label="Distance" value={formatMeters(summary.distanceMeters)} />
      <StatusRow
        styles={styles}
        label="Data origins"
        value={summary.sourceOrigins.length > 0 ? summary.sourceOrigins.join(', ') : 'Not reported by Health Connect'}
      />
    </View>
  );
}

function StatusRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}): React.JSX.Element {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

function BiomarkerTileView({
  tile,
  styles,
}: {
  tile: BiomarkerTile;
  styles: ReturnType<typeof createStyles>;
}): React.JSX.Element {
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

function ScoreTile({
  label,
  score,
  styles,
}: {
  label: string;
  score: number;
  styles: ReturnType<typeof createStyles>;
}): React.JSX.Element {
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

function createStyles(theme: Theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
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
      color: theme.accent,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    title: {
      color: theme.textPrimary,
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: 0,
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    toggleRowGroup: {
      flexDirection: 'row',
      gap: 10,
      flexWrap: 'wrap',
    },
    toggleCard: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 10,
      padding: 14,
      gap: 10,
      flexGrow: 1,
      flexBasis: '47%',
      minWidth: 220,
    },
    toggleLabel: {
      color: theme.textMuted,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    toggleRow: {
      flexDirection: 'row',
      gap: 8,
    },
    toggleButton: {
      flex: 1,
      minHeight: 42,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.toggleBorder,
      backgroundColor: theme.toggleTrack,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    toggleButtonActive: {
      backgroundColor: theme.toggleTrackActive,
      borderColor: theme.toggleTrackActive,
    },
    toggleButtonText: {
      color: theme.toggleText,
      fontSize: 13,
      fontWeight: '800',
    },
    toggleButtonTextActive: {
      color: theme.toggleTextActive,
    },
    toggleHint: {
      color: theme.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    noticeCard: {
      backgroundColor: theme.noticeBackground,
      borderColor: theme.noticeBorder,
      borderWidth: 1,
      borderRadius: 10,
      padding: 14,
      gap: 8,
    },
    noticeTitle: {
      color: theme.noticeTitle,
      fontSize: 15,
      fontWeight: '800',
    },
    noticeText: {
      color: theme.noticeText,
      fontSize: 13,
      lineHeight: 19,
    },
    syntheticNotice: {
      color: theme.syntheticText,
      backgroundColor: theme.syntheticBackground,
      borderColor: theme.syntheticBorder,
      borderWidth: 1,
      borderRadius: 6,
      padding: 8,
      fontSize: 12,
      fontWeight: '700',
    },
    section: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 10,
      padding: 14,
      gap: 12,
    },
    sectionTitle: {
      color: theme.textPrimary,
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: 0,
    },
    bodyText: {
      color: theme.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    captionText: {
      color: theme.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    warningText: {
      color: theme.warning,
      fontSize: 13,
      lineHeight: 19,
    },
    primaryButton: {
      minHeight: 48,
      borderRadius: 8,
      backgroundColor: theme.accent,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    primaryButtonText: {
      color: theme.accentText,
      fontSize: 15,
      fontWeight: '800',
    },
    statusRow: {
      gap: 4,
      borderBottomColor: theme.borderSubtle,
      borderBottomWidth: 1,
      paddingBottom: 8,
    },
    statusLabel: {
      color: theme.textMuted,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    statusValue: {
      color: theme.textPrimary,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
    },
    panelList: {
      gap: 8,
    },
    panelCard: {
      backgroundColor: theme.surfaceMuted,
      borderRadius: 8,
      padding: 10,
      gap: 4,
    },
    panelTitle: {
      color: theme.textPrimary,
      fontSize: 14,
      fontWeight: '800',
    },
    panelMeta: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    panelNotes: {
      color: theme.textSecondary,
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
      backgroundColor: theme.surfaceMuted,
      padding: 12,
      justifyContent: 'space-between',
    },
    metricTileSynthetic: {
      backgroundColor: theme.syntheticBackground,
      borderColor: theme.syntheticBorder,
      borderWidth: 1,
    },
    metricLabel: {
      color: theme.textMuted,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    metricValue: {
      color: theme.textPrimary,
      fontSize: 18,
      fontWeight: '800',
    },
    metricCaption: {
      color: theme.textMuted,
      fontSize: 12,
    },
    metricCaptionSynthetic: {
      color: theme.syntheticText,
      fontWeight: '700',
    },
    resultCard: {
      backgroundColor: theme.resultBackground,
      borderColor: theme.resultBorder,
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
      color: theme.textSecondary,
      fontSize: 13,
      fontWeight: '700',
      flex: 1,
    },
    reportBadge: {
      color: theme.accentSubtleText,
      backgroundColor: theme.accentSubtle,
      borderRadius: 8,
      overflow: 'hidden',
      paddingHorizontal: 10,
      paddingVertical: 6,
      fontSize: 12,
      fontWeight: '800',
    },
    reportBadgeDemo: {
      color: theme.syntheticText,
      backgroundColor: theme.syntheticBackground,
    },
    scoreGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    scoreTile: {
      width: '47%',
      backgroundColor: theme.scoreTileBackground,
      borderRadius: 8,
      padding: 12,
      minHeight: 88,
      justifyContent: 'space-between',
    },
    scoreLabel: {
      color: theme.scoreTileLabel,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    scoreValue: {
      color: theme.scoreTileValue,
      fontSize: 28,
      fontWeight: '900',
    },
    actionRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
      backgroundColor: theme.surfaceMuted,
      borderRadius: 8,
      padding: 12,
    },
    actionIndex: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.accent,
      color: theme.accentText,
      textAlign: 'center',
      lineHeight: 26,
      fontWeight: '800',
    },
    actionText: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
    },
    plannedList: {
      gap: 10,
    },
    plannedCard: {
      backgroundColor: theme.surfaceMuted,
      borderRadius: 8,
      padding: 12,
      gap: 4,
    },
    plannedTitle: {
      color: theme.textPrimary,
      fontSize: 14,
      fontWeight: '800',
    },
    plannedSummary: {
      color: theme.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    plannedSource: {
      color: theme.textMuted,
      fontSize: 11,
      fontWeight: '700',
    },
  });
}
