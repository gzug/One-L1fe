import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import {
  buildHealthConnectSignalRows,
  type HealthConnectSignalRow,
} from './healthConnectSignalRows';
import {
  buildBiomarkerProgressRows,
  type BiomarkerProgressRow,
} from './biomarkerProgress';
import { REAL_LAB_PANELS } from './realBiomarkerPanels';
import {
  THEME_LABELS,
  getTheme,
  type Theme,
  type ThemeName,
} from './healthOsTheme';
import {
  clearMarathonNotes,
  loadMarathonNotes,
  saveMarathonNotes,
} from './marathonNotesStorage';

type SyncUiState =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'done'; result: HealthConnectGarminReadResult }
  | { kind: 'error'; message: string };

const DATA_MODE_OPTIONS: DataMode[] = ['real', 'demo-filled'];
const THEME_OPTIONS: ThemeName[] = ['light', 'dark'];


export default function AntlerHealthOsDemoScreen(): React.JSX.Element {
  const { status, request } = useWearablePermissions();
  const [dataMode, setDataMode] = useState<DataMode>('real');
  const [themeName, setThemeName] = useState<ThemeName>('dark');
  const [syncState, setSyncState] = useState<SyncUiState>({ kind: 'idle' });
  const [expandedSignals, setExpandedSignals] = useState<Set<string>>(new Set());
  const [expandedProgressRows, setExpandedProgressRows] = useState<Set<string>>(new Set());
  const [notesText, setNotesText] = useState('');
  const [notesFeedback, setNotesFeedback] = useState<string | null>(null);

  const theme = useMemo(() => getTheme(themeName), [themeName]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const healthConnectResult = syncState.kind === 'done' ? syncState.result : null;
  const report = useMemo(
    () => buildHealthOsDemoReport({ healthConnectResult, dataMode }),
    [healthConnectResult, dataMode],
  );
  const biomarkerTiles = useMemo(() => getBiomarkerTiles(dataMode), [dataMode]);
  const signalRows = useMemo(
    () => buildHealthConnectSignalRows(healthConnectResult, dataMode),
    [healthConnectResult, dataMode],
  );
  const biomarkerProgressRows = useMemo(() => buildBiomarkerProgressRows(), []);

  useEffect(() => {
    let mounted = true;

    void loadMarathonNotes().then((savedNotes) => {
      if (mounted) setNotesText(savedNotes);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleSignalCard = (key: string): void => {
    setExpandedSignals((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleProgressCard = (key: string): void => {
    setExpandedProgressRows((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSaveNotes = async (): Promise<void> => {
    await saveMarathonNotes(notesText);
    setNotesFeedback('Saved locally on this device.');
  };

  const handleClearNotes = async (): Promise<void> => {
    await clearMarathonNotes();
    setNotesText('');
    setNotesFeedback('Cleared.');
  };

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
          <Text style={styles.eyebrow}>MARATHON PROTOTYPE</Text>
          <Text style={styles.title}>One L1fe</Text>
          <Text style={styles.subtitle}>
            Feature-reduced prototype for training toward the Brisbane Marathon. It connects blood markers, Garmin / Health Connect signals, and training goals into a focused assistant-coach view.
          </Text>
        </View>

        <View style={styles.toggleRowGroup}>
          <DataModeToggle mode={dataMode} onChange={setDataMode} styles={styles} />
          <ThemeToggle theme={theme} mode={themeName} onChange={setThemeName} styles={styles} />
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>What this demo proves</Text>
          <Text style={styles.noticeText}>
            One L1fe connects real blood markers with Garmin / Health Connect training signals. Real Data Mode never invents missing wearable values.
          </Text>
          <Text style={styles.noticeText}>
            {dataMode === 'real'
              ? 'Current mode: real-only. Missing Health Connect values stay empty.'
              : 'Current mode: demo-filled. Synthetic placeholders are clearly labelled.'}
          </Text>
        </View>

        <View style={styles.priorityCard}>
          <Text style={styles.priorityEyebrow}>Today’s focus</Text>
          <Text style={styles.priorityTitle}>
            {healthConnectResult?.status === 'live'
              ? 'Review recovery, activity, and blood-marker progress.'
              : 'Connect Garmin / Health Connect before trusting training readiness.'}
          </Text>
          <Text style={styles.priorityText}>
            {healthConnectResult?.status === 'live'
              ? 'Live wearable data is available. Use the signal cards and progress section to check what changed.'
              : 'Blood markers are loaded. Wearable-based training signals are still missing in Real Data Mode.'}
          </Text>
        </View>

        <Section title="1. Connect Data" styles={styles}>
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

        <Section title="2. Sync Garmin Signals" styles={styles}>
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
          {syncState.kind === 'error' ? <Text style={styles.warningText}>{syncState.message}</Text> : null}
          {healthConnectResult ? <HealthConnectResultCard styles={styles} result={healthConnectResult} /> : null}
          {!healthConnectResult && dataMode === 'real' ? (
            <Text style={styles.bodyText}>
              No live Health Connect data available yet. In Real Data Mode, no synthetic Garmin / Health Connect values are shown.
            </Text>
          ) : null}
        </Section>

        <Section title="3. Raw Training Signals" styles={styles}>
          <Text style={styles.bodyText}>
            Tap a card to see source, status, and score usage.
          </Text>
          <View style={styles.signalGrid}>
            {signalRows.map((signal) => (
              <SignalRowCard
                key={signal.key}
                signal={signal}
                styles={styles}
                isExpanded={expandedSignals.has(signal.key)}
                onToggle={() => toggleSignalCard(signal.key)}
              />
            ))}
          </View>
        </Section>

        <Section title="4. Marathon Baseline" styles={styles}>
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

        <Section title="5. Blood Markers" styles={styles}>
          <Text style={styles.bodyText}>
            Real 2023 and 2025 lab panels. Focus: iron, inflammation, lipids, and metabolic context.
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
          <View style={styles.progressBlock}>
            <Text style={styles.progressTitle}>Blood Marker Progress</Text>
            <Text style={styles.captionText}>
              Tap a marker to see interpretation and conversion notes.
            </Text>
            {biomarkerProgressRows.map((row) => (
              <BiomarkerProgressCard
                key={row.marker}
                row={row}
                styles={styles}
                isExpanded={expandedProgressRows.has(row.marker)}
                onToggle={() => toggleProgressCard(row.marker)}
              />
            ))}
          </View>
        </Section>

        <Section title="6. Training Readiness" styles={styles}>
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
            <ScoreTile styles={styles} label="Activity" score={report.exerciseScore} />
            <ScoreTile styles={styles} label="Recovery" score={report.sleepScore} />
          </View>
          <Text style={styles.captionText}>
            Activity uses steps, distance, and active energy. Recovery uses sleep duration, HRV, and resting heart rate. Nutrition and emotional self-reports are excluded from V1 Marathon scoring.
          </Text>
          <StatusRow styles={styles} label="Data completeness" value={`${report.dataCompleteness}%`} />
          <StatusRow styles={styles} label="Garmin connection" value={report.garminConnectionState} />
          <StatusRow styles={styles} label="Real lab panels" value={`${report.realLabPanelCount} loaded`} />
          <StatusRow styles={styles} label="Weakest measured area" value={report.weakestPillar} />
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

        <NotesIdeasSection
          styles={styles}
          notesText={notesText}
          feedback={notesFeedback}
          onChangeText={(next) => {
            setNotesText(next);
            setNotesFeedback(null);
          }}
          onSave={() => {
            void handleSaveNotes();
          }}
          onClear={() => {
            void handleClearNotes();
          }}
        />

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Not medical advice</Text>
          <Text style={styles.noticeText}>
            One L1fe is a data organization and marathon training-context demo. It does not provide diagnosis, treatment, or emergency guidance.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DataModeToggle({ mode, onChange, styles }: { mode: DataMode; onChange: (next: DataMode) => void; styles: ReturnType<typeof createStyles>; }): React.JSX.Element {
  return (
    <View style={styles.toggleCard}>
      <Text style={styles.toggleLabel}>Data mode</Text>
      <View style={styles.toggleRow}>
        {DATA_MODE_OPTIONS.map((option) => {
          const active = option === mode;
          return (
            <Pressable key={option} onPress={() => onChange(option)} accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.toggleButton, active ? styles.toggleButtonActive : null]}>
              <Text style={[styles.toggleButtonText, active ? styles.toggleButtonTextActive : null]}>{DATA_MODE_LABELS[option]}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.toggleHint}>{mode === 'real' ? 'Showing only real values. Missing Garmin / Health Connect fields are not invented.' : 'Showing real values where available; synthetic placeholders fill missing live fields.'}</Text>
    </View>
  );
}

function ThemeToggle({ theme, mode, onChange, styles }: { theme: Theme; mode: ThemeName; onChange: (next: ThemeName) => void; styles: ReturnType<typeof createStyles>; }): React.JSX.Element {
  return (
    <View style={styles.toggleCard}>
      <Text style={styles.toggleLabel}>Appearance</Text>
      <View style={styles.toggleRow}>
        {THEME_OPTIONS.map((option) => {
          const active = option === mode;
          return (
            <Pressable key={option} onPress={() => onChange(option)} accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.toggleButton, active ? styles.toggleButtonActive : null]}>
              <Text style={[styles.toggleButtonText, active ? styles.toggleButtonTextActive : null]}>{THEME_LABELS[option]}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.toggleHint}>{theme.name === 'dark' ? 'Dark graphite surface with coral accents. Amber stays reserved for synthetic data.' : 'Premium light surface. Synthetic data still highlighted in amber.'}</Text>
    </View>
  );
}

function Section({ title, children, styles }: { title: string; children: React.ReactNode; styles: ReturnType<typeof createStyles>; }): React.JSX.Element {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function PrimaryButton({ label, onPress, disabled, styles }: { label: string; onPress: () => void; disabled?: boolean; styles: ReturnType<typeof createStyles>; }): React.JSX.Element {
  return <Pressable onPress={onPress} disabled={disabled} style={[styles.primaryButton, disabled ? styles.buttonDisabled : null]}><Text style={styles.primaryButtonText}>{label}</Text></Pressable>;
}

function HealthConnectResultCard({ result, styles }: { result: HealthConnectGarminReadResult; styles: ReturnType<typeof createStyles>; }): React.JSX.Element {
  return (
    <View style={styles.resultCard}>
      <StatusRow styles={styles} label="Read status" value={result.status} />
      <StatusRow styles={styles} label="Message" value={result.message} />
      <StatusRow styles={styles} label="Records normalized" value={`${result.observations.length}`} />
      <StatusRow styles={styles} label="Sync request" value={result.request ? 'Valid WearableSyncRequest built' : 'Not built without records'} />
    </View>
  );
}

function SignalRowCard({
  signal,
  styles,
  isExpanded,
  onToggle,
}: {
  signal: HealthConnectSignalRow;
  styles: ReturnType<typeof createStyles>;
  isExpanded: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  const missing = signal.sourceStatus === 'Not available';
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      style={[styles.signalCard, signal.isSynthetic ? styles.signalCardSynthetic : null]}
    >
      <View style={styles.signalTopRow}>
        <Text style={styles.signalLabel}>{signal.label}</Text>
        <Text style={[styles.signalPill, signal.isSynthetic ? styles.signalPillSynthetic : null, missing ? styles.signalPillMissing : null]}>{signal.sourceStatus}</Text>
      </View>
      <Text style={styles.signalValue}>{signal.value}{signal.unit ? ` ${signal.unit}` : ''}</Text>
      <Text style={styles.signalUsage}>{signal.scoreUsage}</Text>
      {isExpanded ? (
        <View style={styles.expandedDetails}>
          <DetailRow styles={styles} label="Source" value={signal.source} />
          <DetailRow styles={styles} label="Status" value={signal.sourceStatus} />
          <DetailRow styles={styles} label="Score usage" value={signal.scoreUsage} />
        </View>
      ) : null}
      <Text style={styles.expandHint}>{isExpanded ? 'Hide details' : 'Show details'}</Text>
    </Pressable>
  );
}

function StatusRow({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof createStyles>; }): React.JSX.Element {
  return <View style={styles.statusRow}><Text style={styles.statusLabel}>{label}</Text><Text style={styles.statusValue}>{value}</Text></View>;
}

function BiomarkerTileView({ tile, styles }: { tile: BiomarkerTile; styles: ReturnType<typeof createStyles>; }): React.JSX.Element {
  return <View style={[styles.metricTile, tile.isSynthetic ? styles.metricTileSynthetic : null]}><Text style={styles.metricLabel}>{tile.label}</Text><Text style={styles.metricValue}>{tile.valueText}</Text><Text style={[styles.metricCaption, tile.isSynthetic ? styles.metricCaptionSynthetic : null]}>{tile.caption}</Text></View>;
}

function BiomarkerProgressCard({
  row,
  styles,
  isExpanded,
  onToggle,
}: {
  row: BiomarkerProgressRow;
  styles: ReturnType<typeof createStyles>;
  isExpanded: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      style={styles.progressCard}
    >
      <View style={styles.progressHeader}>
        <Text style={styles.progressMarker}>{row.label}</Text>
        <Text style={styles.progressStatus}>{row.status}</Text>
      </View>
      <View style={styles.progressValueRow}>
        <View style={styles.progressValueBox}>
          <Text style={styles.progressYear}>2023</Text>
          <Text style={styles.progressValue}>{row.value2023}</Text>
        </View>
        <View style={styles.progressValueBox}>
          <Text style={styles.progressYear}>2025</Text>
          <Text style={styles.progressValue}>{row.value2025}</Text>
        </View>
      </View>
      <Text style={styles.progressChange}>{row.change}</Text>
      {isExpanded ? <Text style={styles.progressInterpretation}>{row.interpretation}</Text> : null}
      <Text style={styles.expandHint}>{isExpanded ? 'Hide details' : 'Show details'}</Text>
    </Pressable>
  );
}

function NotesIdeasSection({
  styles,
  notesText,
  feedback,
  onChangeText,
  onSave,
  onClear,
}: {
  styles: ReturnType<typeof createStyles>;
  notesText: string;
  feedback: string | null;
  onChangeText: (next: string) => void;
  onSave: () => void;
  onClear: () => void;
}): React.JSX.Element {
  return (
    <Section title="Notes & Ideas" styles={styles}>
      <Text style={styles.bodyText}>
        Private local notes for observations, follow-ups, and ideas while reviewing your marathon data.
      </Text>
      <TextInput
        value={notesText}
        onChangeText={onChangeText}
        placeholder="Write notes or ideas from this data check…"
        multiline
        style={styles.notesInput}
        textAlignVertical="top"
      />
      <View style={styles.notesButtonRow}>
        <PrimaryButton styles={styles} label="Save note" onPress={onSave} />
        <Pressable onPress={onClear} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Clear</Text>
        </Pressable>
      </View>
      {feedback ? <Text style={styles.noteStatusText}>{feedback}</Text> : null}
      <Text style={styles.captionText}>
        Local only. Notes are not uploaded and do not affect scores.
      </Text>
    </Section>
  );
}

function DetailRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}): React.JSX.Element {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ScoreTile({ label, score, styles }: { label: string; score: number; styles: ReturnType<typeof createStyles>; }): React.JSX.Element {
  return <View style={styles.scoreTile}><Text style={styles.scoreLabel}>{label}</Text><Text style={styles.scoreValue}>{score > 0 ? score : '--'}</Text></View>;
}

function formatPermissionStatus(status: string): string {
  if (status === 'granted') return 'Granted';
  if (status === 'denied') return 'Needs permission';
  if (status === 'unavailable') return 'Unavailable';
  return 'Checking';
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    scroll: { flex: 1 },
    container: { padding: 18, paddingBottom: 42, gap: 14 },
    header: { paddingTop: 12, gap: 6 },
    eyebrow: { color: theme.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    title: { color: theme.textPrimary, fontSize: 32, fontWeight: '800' },
    subtitle: { color: theme.textSecondary, fontSize: 15, lineHeight: 22 },
    toggleRowGroup: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    toggleCard: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 10, padding: 14, gap: 10, flexGrow: 1, flexBasis: '47%', minWidth: 220 },
    toggleLabel: { color: theme.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    toggleRow: { flexDirection: 'row', gap: 8 },
    toggleButton: { flex: 1, minHeight: 42, borderRadius: 8, borderWidth: 1, borderColor: theme.toggleBorder, backgroundColor: theme.toggleTrack, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
    toggleButtonActive: { backgroundColor: theme.toggleTrackActive, borderColor: theme.toggleTrackActive },
    toggleButtonText: { color: theme.toggleText, fontSize: 13, fontWeight: '800' },
    toggleButtonTextActive: { color: theme.toggleTextActive },
    toggleHint: { color: theme.textMuted, fontSize: 12, lineHeight: 18 },
    priorityCard: {
      backgroundColor: theme.surfaceElevated,
      borderColor: theme.accent,
      borderWidth: 1,
      borderRadius: 14,
      padding: 16,
      gap: 8,
    },
    priorityEyebrow: {
      color: theme.accent,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    priorityTitle: {
      color: theme.textPrimary,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '800',
    },
    priorityText: {
      color: theme.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    noticeCard: { backgroundColor: theme.noticeBackground, borderColor: theme.noticeBorder, borderWidth: 1, borderRadius: 10, padding: 14, gap: 8 },
    noticeTitle: { color: theme.noticeTitle, fontSize: 15, fontWeight: '800' },
    noticeText: { color: theme.noticeText, fontSize: 13, lineHeight: 19 },
    syntheticNotice: { color: theme.syntheticText, backgroundColor: theme.syntheticBackground, borderColor: theme.syntheticBorder, borderWidth: 1, borderRadius: 6, padding: 8, fontSize: 12, fontWeight: '700' },
    section: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 10, padding: 14, gap: 12 },
    sectionTitle: { color: theme.textPrimary, fontSize: 17, fontWeight: '800' },
    bodyText: { color: theme.textSecondary, fontSize: 14, lineHeight: 20 },
    captionText: { color: theme.textMuted, fontSize: 12, lineHeight: 18 },
    warningText: { color: theme.warning, fontSize: 13, lineHeight: 19 },
    primaryButton: { minHeight: 48, borderRadius: 8, backgroundColor: theme.accent, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
    buttonDisabled: { opacity: 0.5 },
    primaryButtonText: { color: theme.accentText, fontSize: 15, fontWeight: '800' },
    resultCard: { backgroundColor: theme.resultBackground, borderColor: theme.resultBorder, borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 },
    statusRow: { gap: 4, borderBottomColor: theme.borderSubtle, borderBottomWidth: 1, paddingBottom: 8 },
    statusLabel: { color: theme.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    statusValue: { color: theme.textPrimary, fontSize: 14, lineHeight: 20, fontWeight: '600' },
    signalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    signalCard: { width: '47%', minHeight: 132, borderRadius: 10, backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle, borderWidth: 1, padding: 12, gap: 8 },
    signalCardSynthetic: { backgroundColor: theme.syntheticBackground, borderColor: theme.syntheticBorder },
    signalTopRow: { gap: 6 },
    signalLabel: { color: theme.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
    signalValue: { color: theme.textPrimary, fontSize: 22, fontWeight: '900' },
    signalMeta: { color: theme.textSecondary, fontSize: 12, lineHeight: 17 },
    signalPill: { alignSelf: 'flex-start', color: theme.accentSubtleText, backgroundColor: theme.accentSubtle, borderRadius: 999, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '800' },
    signalPillSynthetic: { color: theme.syntheticText, backgroundColor: theme.syntheticBackground },
    signalPillMissing: { color: theme.textMuted, backgroundColor: theme.surface },
    signalUsage: { color: theme.textMuted, fontSize: 11, fontWeight: '700' },
    panelList: { gap: 8 },
    panelCard: { backgroundColor: theme.surfaceMuted, borderRadius: 8, padding: 10, gap: 4 },
    panelTitle: { color: theme.textPrimary, fontSize: 14, fontWeight: '800' },
    panelMeta: { color: theme.textSecondary, fontSize: 12, fontWeight: '700' },
    panelNotes: { color: theme.textSecondary, fontSize: 12, lineHeight: 18 },
    metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    metricTile: { width: '47%', minHeight: 96, borderRadius: 8, backgroundColor: theme.surfaceMuted, padding: 12, justifyContent: 'space-between' },
    metricTileSynthetic: { backgroundColor: theme.syntheticBackground, borderColor: theme.syntheticBorder, borderWidth: 1 },
    metricLabel: { color: theme.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
    metricValue: { color: theme.textPrimary, fontSize: 18, fontWeight: '800' },
    metricCaption: { color: theme.textMuted, fontSize: 12 },
    metricCaptionSynthetic: { color: theme.syntheticText, fontWeight: '700' },
    progressBlock: { gap: 10, marginTop: 4 },
    progressTitle: { color: theme.textPrimary, fontSize: 16, fontWeight: '800' },
    progressCard: { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle, borderWidth: 1, borderRadius: 10, padding: 12, gap: 8 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' },
    progressMarker: { color: theme.textPrimary, fontSize: 14, fontWeight: '800' },
    progressStatus: { color: theme.accentSubtleText, backgroundColor: theme.accentSubtle, borderRadius: 999, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '800' },
    progressValueRow: { flexDirection: 'row', gap: 10 },
    progressValueBox: { flex: 1, backgroundColor: theme.surfaceMuted, borderRadius: 8, padding: 10, gap: 4 },
    progressYear: { color: theme.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase' },
    progressValue: { color: theme.textPrimary, fontSize: 14, fontWeight: '800' },
    progressChange: { color: theme.accentSubtleText, fontSize: 13, fontWeight: '800' },
    progressInterpretation: { color: theme.textSecondary, fontSize: 12, lineHeight: 18 },
    reportHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' },
    reportSource: { color: theme.textSecondary, fontSize: 13, fontWeight: '700', flex: 1 },
    reportBadge: { color: theme.accentSubtleText, backgroundColor: theme.accentSubtle, borderRadius: 8, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, fontWeight: '800' },
    reportBadgeDemo: { color: theme.syntheticText, backgroundColor: theme.syntheticBackground },
    scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    scoreTile: { width: '47%', backgroundColor: theme.scoreTileBackground, borderRadius: 8, padding: 12, minHeight: 88, justifyContent: 'space-between' },
    scoreLabel: { color: theme.scoreTileLabel, fontSize: 12, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
    scoreValue: { color: theme.scoreTileValue, fontSize: 28, fontWeight: '900' },
    actionRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: theme.surfaceMuted, borderRadius: 8, padding: 12 },
    actionIndex: { width: 26, height: 26, borderRadius: 13, backgroundColor: theme.accent, color: theme.accentText, textAlign: 'center', lineHeight: 26, fontWeight: '800' },
    actionText: { flex: 1, color: theme.textPrimary, fontSize: 14, lineHeight: 20, fontWeight: '600' },
    expandedDetails: { borderTopColor: theme.borderSubtle, borderTopWidth: 1, paddingTop: 8, gap: 6 },
    expandHint: { color: theme.accentSubtleText, fontSize: 11, fontWeight: '800', marginTop: 2 },
    detailRow: { gap: 2 },
    detailLabel: { color: theme.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
    detailValue: { color: theme.textSecondary, fontSize: 12, lineHeight: 17, fontWeight: '600' },
    notesInput: {
      minHeight: 132,
      borderRadius: 10,
      borderColor: theme.border,
      borderWidth: 1,
      backgroundColor: theme.surfaceMuted,
      color: theme.textPrimary,
      padding: 12,
      fontSize: 14,
      lineHeight: 20,
    },
    notesButtonRow: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
    secondaryButton: {
      minHeight: 48,
      borderRadius: 8,
      borderColor: theme.border,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      backgroundColor: theme.surfaceMuted,
    },
    secondaryButtonText: { color: theme.textPrimary, fontSize: 14, fontWeight: '800' },
    noteStatusText: { color: theme.accentSubtleText, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  });
}
