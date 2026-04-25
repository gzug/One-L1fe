import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
  getTheme,
  type Theme,
  type ThemeName,
} from './healthOsTheme';
import {
  clearMarathonNotes,
  loadMarathonNotes,
  saveMarathonNotes,
} from './marathonNotesStorage';

/* ─────────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────── */

type SyncUiState =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'done'; result: HealthConnectGarminReadResult }
  | { kind: 'error'; message: string };

type AppFlow = 'splash' | 'profile' | 'connect' | 'dashboard';

const DATA_MODE_OPTIONS: DataMode[] = ['real', 'demo-filled'];

/* ─────────────────────────────────────────────────────────────────────────
   Root
   ───────────────────────────────────────────────────────────────────── */

export default function AntlerHealthOsDemoScreen(): React.JSX.Element {
  const { status, request } = useWearablePermissions();
  const [appFlow, setAppFlow] = useState<AppFlow>('splash');
  const [dataMode, setDataMode] = useState<DataMode>('real');
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const [syncState, setSyncState] = useState<SyncUiState>({ kind: 'idle' });
  const [expandedBiomarker, setExpandedBiomarker] = useState<string | null>(null);
  const [signalsExpanded, setSignalsExpanded] = useState(false);
  const [connectExpanded, setConnectExpanded] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [notesFeedback, setNotesFeedback] = useState<string | null>(null);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [profileForm, setProfileForm] = useState({
    sex: '',
    heightCm: '',
    weightKg: '',
    age: '',
  });

  const theme = useMemo(() => getTheme(themeName), [themeName]);
  const s = useMemo(() => createStyles(theme), [theme]);

  const healthConnectResult = syncState.kind === 'done' ? syncState.result : null;
  const report = useMemo(
    () => buildHealthOsDemoReport({ healthConnectResult, dataMode }),
    [healthConnectResult, dataMode],
  );
  const readinessScore =
    report.exerciseScore > 0 || report.sleepScore > 0
      ? Math.round((report.exerciseScore + report.sleepScore) / 2)
      : null;
  const readinessLabel = getReadinessLabel(readinessScore);
  const biomarkerTiles = useMemo(() => getBiomarkerTiles(dataMode), [dataMode]);
  const signalRows = useMemo(
    () => buildHealthConnectSignalRows(healthConnectResult, dataMode),
    [healthConnectResult, dataMode],
  );
  const biomarkerProgressRows = useMemo(() => buildBiomarkerProgressRows(), []);
  const progressByMarker = useMemo(
    () => new Map(biomarkerProgressRows.map((row) => [row.marker, row])),
    [biomarkerProgressRows],
  );

  useEffect(() => {
    let mounted = true;
    void loadMarathonNotes().then((saved) => {
      if (mounted) setNotesText(saved);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleBiomarkerCard = (key: string): void => {
    setExpandedBiomarker((current) => (current === key ? null : key));
  };

  const handleSaveNotes = async (): Promise<void> => {
    await saveMarathonNotes(notesText);
    setNotesFeedback('Saved locally.');
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

  const liveSignalCount = signalRows.filter((r) => r.sourceStatus !== 'Not available').length;
  const hcSynced = healthConnectResult?.status === 'live';

  /* ── Onboarding screens ── */
  if (appFlow === 'splash') {
    return (
      <SplashScreen
        theme={theme}
        s={s}
        onDone={() => setAppFlow('profile')}
      />
    );
  }

  if (appFlow === 'profile') {
    return (
      <ProfileSetupScreen
        theme={theme}
        s={s}
        profile={profileForm}
        onChange={(key, value) => setProfileForm((c) => ({ ...c, [key]: value }))}
        onContinue={() => setAppFlow('connect')}
      />
    );
  }

  if (appFlow === 'connect') {
    return (
      <ConnectScreen
        theme={theme}
        s={s}
        status={status}
        syncState={syncState}
        onRequest={() => { void request(); }}
        onSync={() => { void handleReadHealthConnect(); }}
        onContinue={() => setAppFlow('dashboard')}
      />
    );
  }

  /* ── Dashboard ── */
  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView style={s.scroll} contentContainerStyle={s.container}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.topBar}>
            <View style={s.headerLeft}>
              <Text style={s.brandMark}>One L1fe</Text>
              <Text style={s.headerSub}>
                {hcSynced
                  ? `${liveSignalCount} signals · ${new Date().toLocaleDateString()}`
                  : 'Marathon readiness'}
              </Text>
            </View>
            <View style={s.headerActions}>
              <Pressable
                onPress={() => setThemeName(themeName === 'dark' ? 'light' : 'dark')}
                style={s.iconBtn}
                accessibilityRole="button"
                accessibilityLabel="Toggle theme"
              >
                <Text style={s.iconBtnText}>{themeName === 'dark' ? '☀' : '☾'}</Text>
              </Pressable>
              <Pressable
                onPress={() => setProfileExpanded((c) => !c)}
                style={[s.iconBtn, profileExpanded ? s.iconBtnActive : null]}
                accessibilityRole="button"
                accessibilityState={{ expanded: profileExpanded }}
                accessibilityLabel="Profile"
              >
                <Text style={[s.iconBtnText, profileExpanded ? s.iconBtnTextActive : null]}>
                  1L
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Profile drawer */}
        {profileExpanded ? (
          <ProfileDrawer
            s={s}
            theme={theme}
            profile={profileForm}
            onChange={(key, value) => setProfileForm((c) => ({ ...c, [key]: value }))}
          />
        ) : null}

        {/* Data mode pill */}
        <DataModePill mode={dataMode} onChange={setDataMode} s={s} />

        {/* Readiness hero */}
        <View style={s.hero}>
          <View style={s.heroScoreBlock}>
            <Text style={s.heroScore}>{readinessScore === null ? '--' : readinessScore}</Text>
            <Text style={s.heroScoreUnit}>/100</Text>
          </View>
          <Text style={s.heroLabel}>{readinessLabel}</Text>
          <View style={s.heroMetrics}>
            <ProgressMetric
              s={s}
              label="Activity"
              value={report.exerciseScore}
              color={theme.progressFill}
            />
            <ProgressMetric
              s={s}
              label="Recovery"
              value={report.sleepScore}
              color={theme.progressFillRecovery}
            />
            <View style={s.heroMetricRow}>
              <Text style={s.heroMetricLabel}>Data</Text>
              <View style={s.progressBarWrap}>
                <View style={s.progressBarTrack}>
                  <View
                    style={[
                      s.progressBarFill,
                      {
                        width: `${report.dataCompleteness}%`,
                        backgroundColor: theme.progressFill,
                      },
                    ]}
                  />
                </View>
                <Text style={s.heroMetricValue}>{report.dataCompleteness}%</Text>
              </View>
            </View>
          </View>
          {report.usesSyntheticData ? (
            <View style={s.syntheticChip}>
              <Text style={s.syntheticChipText}>Demo placeholders active</Text>
            </View>
          ) : null}
        </View>

        {/* Data check strip */}
        <DataCheckStrip
          s={s}
          theme={theme}
          labPanelCount={report.realLabPanelCount}
          dataMode={dataMode}
          hcSynced={hcSynced}
        />

        {/* Blood markers */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Blood Markers</Text>
          <Text style={s.sectionMeta}>
            {report.realLabPanelCount} panel{report.realLabPanelCount === 1 ? '' : 's'}
          </Text>
        </View>
        <BiomarkerGrid
          s={s}
          theme={theme}
          tiles={biomarkerTiles}
          progressByMarker={progressByMarker}
          expandedMarker={expandedBiomarker}
          onToggle={toggleBiomarkerCard}
        />

        {/* Training signals — collapsed */}
        <Pressable
          onPress={() => setSignalsExpanded((c) => !c)}
          style={s.disclosureHeader}
          accessibilityRole="button"
          accessibilityState={{ expanded: signalsExpanded }}
        >
          <Text style={s.disclosureTitle}>Training Signals</Text>
          <View style={s.disclosureRight}>
            <Text style={s.disclosureMeta}>
              {liveSignalCount > 0 ? `${liveSignalCount} active` : 'No live data'}
            </Text>
            <Text style={s.disclosureChevron}>{signalsExpanded ? '▴' : '▾'}</Text>
          </View>
        </Pressable>
        {signalsExpanded ? (
          <View style={s.signalList}>
            {signalRows.map((signal) => (
              <SignalRow key={signal.key} signal={signal} s={s} theme={theme} />
            ))}
          </View>
        ) : null}

        {/* Next steps */}
        {report.actions.length > 0 ? (
          <View style={s.actionsCard}>
            <Text style={s.actionsTitle}>Next Steps</Text>
            {report.actions.slice(0, 3).map((action) => (
              <View key={action} style={s.actionRow}>
                <View style={s.actionDot} />
                <Text style={s.actionText}>{action}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Wearable connection — moved to bottom */}
        <Pressable
          onPress={() => setConnectExpanded((c) => !c)}
          style={s.disclosureHeader}
          accessibilityRole="button"
          accessibilityState={{ expanded: connectExpanded }}
        >
          <Text style={s.disclosureTitle}>Wearable Connection</Text>
          <View style={s.disclosureRight}>
            <Text style={s.disclosureMeta}>
              {hcSynced ? 'Synced' : 'Not connected'}
            </Text>
            <Text style={s.disclosureChevron}>{connectExpanded ? '▴' : '▾'}</Text>
          </View>
        </Pressable>
        {connectExpanded ? (
          <View style={s.disclosureBody}>
            <View style={s.chipRow}>
              <Chip s={s} label={`Permission: ${formatPermissionStatus(status)}`} />
              <Chip s={s} label={dataMode === 'real' ? 'Real Data' : 'Demo Filled'} />
            </View>
            {(status === 'denied' || status === 'unknown') ? (
              <ActionButton
                s={s}
                label="Grant Health Connect access"
                onPress={() => { void request(); }}
              />
            ) : null}
            {status === 'unavailable' ? (
              <Text style={s.mutedNote}>
                Health Connect unavailable.
                {dataMode === 'demo-filled'
                  ? ' Synthetic placeholders active.'
                  : ' Wearable fields stay empty in Real Data mode.'}
              </Text>
            ) : null}
            <ActionButton
              s={s}
              label={syncState.kind === 'reading' ? 'Reading…' : 'Sync from Health Connect'}
              onPress={() => { void handleReadHealthConnect(); }}
              disabled={status !== 'granted' || syncState.kind === 'reading'}
            />
            {syncState.kind === 'reading' ? <ActivityIndicator color={theme.accent} /> : null}
            {syncState.kind === 'error' ? (
              <Text style={s.warningText}>{syncState.message}</Text>
            ) : null}
            {healthConnectResult ? (
              <View style={s.resultChips}>
                <Chip s={s} label={`Status: ${healthConnectResult.status}`} />
                <Chip s={s} label={`${healthConnectResult.observations.length} records`} />
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Notes */}
        <NotesSection
          s={s}
          theme={theme}
          notesText={notesText}
          feedback={notesFeedback}
          onChangeText={(next) => {
            setNotesText(next);
            setNotesFeedback(null);
          }}
          onSave={() => { void handleSaveNotes(); }}
          onClear={() => { void handleClearNotes(); }}
        />

        {/* Disclaimer */}
        <Text style={s.disclaimer}>
          Not medical advice. One L1fe organizes health and training data. It does not provide
          diagnosis, treatment, or emergency guidance.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Onboarding screens
   ───────────────────────────────────────────────────────────────────── */

function SplashScreen({
  theme,
  s,
  onDone,
}: {
  theme: Theme;
  s: ReturnType<typeof createStyles>;
  onDone: () => void;
}): React.JSX.Element {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(onDone, 800);
    });
  }, [opacity, onDone]);

  return (
    <SafeAreaView style={[s.safeArea, s.splashSafeArea]}>
      <Animated.View style={[s.splashContainer, { opacity }]}>
        <Text style={s.splashEyebrow}>Welcome to</Text>
        <Text style={s.splashTitle}>One L1fe</Text>
        <Text style={s.splashSub}>Marathon readiness</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

function ProfileSetupScreen({
  theme,
  s,
  profile,
  onChange,
  onContinue,
}: {
  theme: Theme;
  s: ReturnType<typeof createStyles>;
  profile: { sex: string; heightCm: string; weightKg: string; age: string };
  onChange: (key: 'sex' | 'heightCm' | 'weightKg' | 'age', value: string) => void;
  onContinue: () => void;
}): React.JSX.Element {
  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.onboardingContainer}>
        <View style={s.onboardingHeader}>
          <Text style={s.onboardingStep}>Step 1 of 2</Text>
          <Text style={s.onboardingTitle}>Your profile</Text>
          <Text style={s.onboardingHint}>
            Used for context only. Not uploaded. Scoring does not use these values yet.
          </Text>
        </View>

        <View style={s.onboardingCard}>
          <OnboardingField
            s={s}
            theme={theme}
            label="Sex"
            placeholder="Male / Female / Other"
            value={profile.sex}
            onChange={(v) => onChange('sex', v)}
          />
          <OnboardingField
            s={s}
            theme={theme}
            label="Height (cm)"
            placeholder="e.g. 178"
            value={profile.heightCm}
            onChange={(v) => onChange('heightCm', v)}
            keyboardType="numeric"
          />
          <OnboardingField
            s={s}
            theme={theme}
            label="Weight (kg)"
            placeholder="e.g. 75"
            value={profile.weightKg}
            onChange={(v) => onChange('weightKg', v)}
            keyboardType="numeric"
          />
          <OnboardingField
            s={s}
            theme={theme}
            label="Age (optional)"
            placeholder="e.g. 34"
            value={profile.age}
            onChange={(v) => onChange('age', v)}
            keyboardType="numeric"
          />
        </View>

        <ActionButton s={s} label="Continue" onPress={onContinue} />
        <Text style={s.onboardingSkip} onPress={onContinue}>
          Skip for now
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ConnectScreen({
  theme,
  s,
  status,
  syncState,
  onRequest,
  onSync,
  onContinue,
}: {
  theme: Theme;
  s: ReturnType<typeof createStyles>;
  status: string;
  syncState: SyncUiState;
  onRequest: () => void;
  onSync: () => void;
  onContinue: () => void;
}): React.JSX.Element {
  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.onboardingContainer}>
        <View style={s.onboardingHeader}>
          <Text style={s.onboardingStep}>Step 2 of 2</Text>
          <Text style={s.onboardingTitle}>Connect Garmin</Text>
          <Text style={s.onboardingHint}>
            Garmin data is read through Android Health Connect. Open Garmin Connect first and
            confirm watch sync is complete.
          </Text>
        </View>

        <View style={s.onboardingCard}>
          <View style={s.connectStatusRow}>
            <Text style={s.connectStatusLabel}>Permission</Text>
            <Text style={s.connectStatusValue}>{formatPermissionStatus(status)}</Text>
          </View>

          {(status === 'denied' || status === 'unknown') ? (
            <ActionButton
              s={s}
              label="Grant Health Connect access"
              onPress={onRequest}
            />
          ) : null}

          {status === 'granted' ? (
            <ActionButton
              s={s}
              label={syncState.kind === 'reading' ? 'Reading…' : 'Sync now'}
              onPress={onSync}
              disabled={syncState.kind === 'reading'}
            />
          ) : null}

          {syncState.kind === 'reading' ? (
            <ActivityIndicator color={theme.accent} />
          ) : null}

          {syncState.kind === 'error' ? (
            <Text style={s.warningText}>{syncState.message}</Text>
          ) : null}

          {syncState.kind === 'done' ? (
            <View style={s.connectSuccessRow}>
              <Text style={s.connectSuccessText}>
                ✓ Synced · {syncState.result.observations.length} records
              </Text>
            </View>
          ) : null}

          {status === 'unavailable' ? (
            <Text style={s.mutedNote}>
              Health Connect is not available on this device. You can still view blood marker data.
            </Text>
          ) : null}
        </View>

        <ActionButton s={s} label="Go to dashboard" onPress={onContinue} />
        <Text style={s.onboardingSkip} onPress={onContinue}>
          Skip wearable connection
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function OnboardingField({
  s,
  theme,
  label,
  placeholder,
  value,
  onChange,
  keyboardType,
}: {
  s: ReturnType<typeof createStyles>;
  theme: Theme;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: 'numeric';
}): React.JSX.Element {
  return (
    <View style={s.onboardingFieldWrap}>
      <Text style={s.onboardingFieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
        style={s.onboardingFieldInput}
      />
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Dashboard components
   ───────────────────────────────────────────────────────────────────── */

function ProfileDrawer({
  s,
  theme,
  profile,
  onChange,
}: {
  s: ReturnType<typeof createStyles>;
  theme: Theme;
  profile: { sex: string; heightCm: string; weightKg: string; age: string };
  onChange: (key: 'sex' | 'heightCm' | 'weightKg' | 'age', value: string) => void;
}): React.JSX.Element {
  return (
    <View style={s.profileCard}>
      <View style={s.profileHeader}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>1L</Text>
        </View>
        <View style={s.profileMeta}>
          <Text style={s.profileName}>Training Profile</Text>
          <Text style={s.profileHint}>Local draft · not used in scoring</Text>
        </View>
      </View>
      <View style={s.profileFields}>
        <ProfileField
          s={s}
          theme={theme}
          value={profile.sex}
          placeholder="Sex"
          onChange={(v) => onChange('sex', v)}
        />
        <ProfileField
          s={s}
          theme={theme}
          value={profile.heightCm}
          placeholder="Height cm"
          onChange={(v) => onChange('heightCm', v)}
          keyboardType="numeric"
        />
        <ProfileField
          s={s}
          theme={theme}
          value={profile.weightKg}
          placeholder="Weight kg"
          onChange={(v) => onChange('weightKg', v)}
          keyboardType="numeric"
        />
        <ProfileField
          s={s}
          theme={theme}
          value={profile.age}
          placeholder="Age"
          onChange={(v) => onChange('age', v)}
          keyboardType="numeric"
        />
      </View>
    </View>
  );
}

function ProfileField({
  s,
  theme,
  value,
  placeholder,
  onChange,
  keyboardType,
}: {
  s: ReturnType<typeof createStyles>;
  theme: Theme;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  keyboardType?: 'numeric';
}): React.JSX.Element {
  return (
    <View style={s.profileFieldWrap}>
      <Text style={s.profileFieldLabel}>{placeholder}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="—"
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
        style={s.profileFieldInput}
      />
    </View>
  );
}

function DataModePill({
  mode,
  onChange,
  s,
}: {
  mode: DataMode;
  onChange: (next: DataMode) => void;
  s: ReturnType<typeof createStyles>;
}): React.JSX.Element {
  return (
    <View style={s.modePill}>
      {DATA_MODE_OPTIONS.map((option) => {
        const active = option === mode;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[s.modePillOption, active ? s.modePillOptionActive : null]}
          >
            <Text style={[s.modePillText, active ? s.modePillTextActive : null]}>
              {DATA_MODE_LABELS[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ProgressMetric({
  s,
  label,
  value,
  color,
}: {
  s: ReturnType<typeof createStyles>;
  label: string;
  value: number;
  color: string;
}): React.JSX.Element {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={s.heroMetricRow}>
      <Text style={s.heroMetricLabel}>{label}</Text>
      <View style={s.progressBarWrap}>
        <View style={s.progressBarTrack}>
          <View style={[s.progressBarFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
        <Text style={s.heroMetricValue}>{value > 0 ? value : '--'}</Text>
      </View>
    </View>
  );
}

function DataCheckStrip({
  s,
  theme,
  labPanelCount,
  dataMode,
  hcSynced,
}: {
  s: ReturnType<typeof createStyles>;
  theme: Theme;
  labPanelCount: number;
  dataMode: DataMode;
  hcSynced: boolean;
}): React.JSX.Element {
  const hcDemoFilled = !hcSynced && dataMode === 'demo-filled';
  return (
    <View style={s.dataStrip}>
      <DataStripItem
        s={s}
        theme={theme}
        label="Blood"
        value={labPanelCount > 0 ? 'Loaded' : 'Missing'}
        positive={labPanelCount > 0}
        synthetic={false}
      />
      <View style={s.dataStripDivider} />
      <DataStripItem
        s={s}
        theme={theme}
        label="Garmin"
        value={hcSynced ? 'Synced' : hcDemoFilled ? 'Demo' : 'Missing'}
        positive={hcSynced}
        synthetic={hcDemoFilled}
      />
      <View style={s.dataStripDivider} />
      <DataStripItem
        s={s}
        theme={theme}
        label="Mode"
        value={dataMode === 'real' ? 'Real' : 'Filled'}
        positive={dataMode === 'real'}
        synthetic={dataMode === 'demo-filled'}
      />
    </View>
  );
}

function DataStripItem({
  s,
  theme,
  label,
  value,
  positive,
  synthetic,
}: {
  s: ReturnType<typeof createStyles>;
  theme: Theme;
  label: string;
  value: string;
  positive: boolean;
  synthetic: boolean;
}): React.JSX.Element {
  const valueColor = positive
    ? theme.positiveText
    : synthetic
      ? theme.syntheticText
      : theme.textMuted;
  return (
    <View style={s.dataStripItem}>
      <Text style={s.dataStripLabel}>{label}</Text>
      <Text style={[s.dataStripValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Biomarker grid — fixed expansion bug
   Expanded detail renders as a full-width row BELOW the tile pair,
   not inside the tile, so the adjacent tile never stretches.
   ───────────────────────────────────────────────────────────────────── */

function BiomarkerGrid({
  s,
  theme,
  tiles,
  progressByMarker,
  expandedMarker,
  onToggle,
}: {
  s: ReturnType<typeof createStyles>;
  theme: Theme;
  tiles: BiomarkerTile[];
  progressByMarker: Map<string, BiomarkerProgressRow>;
  expandedMarker: string | null;
  onToggle: (key: string) => void;
}): React.JSX.Element {
  // Pair tiles into rows of 2
  const rows: BiomarkerTile[][] = [];
  for (let i = 0; i < tiles.length; i += 2) {
    rows.push(tiles.slice(i, i + 2));
  }

  return (
    <View style={s.markerGridOuter}>
      {rows.map((pair, rowIdx) => {
        const expandedInRow = pair.find((t) => t.marker === expandedMarker) ?? null;
        return (
          <View key={rowIdx} style={s.markerRowGroup}>
            {/* Tile pair */}
            <View style={s.markerTilePair}>
              {pair.map((tile) => (
                <BiomarkerTileCompact
                  key={tile.marker}
                  s={s}
                  theme={theme}
                  tile={tile}
                  isExpanded={tile.marker === expandedMarker}
                  onToggle={() => onToggle(tile.marker)}
                />
              ))}
              {/* Pad odd row */}
              {pair.length === 1 ? <View style={s.markerTileSpacer} /> : null}
            </View>

            {/* Full-width expansion panel below the row */}
            {expandedInRow ? (
              <BiomarkerExpandedPanel
                s={s}
                theme={theme}
                tile={expandedInRow}
                progress={progressByMarker.get(expandedInRow.marker) ?? null}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function BiomarkerTileCompact({
  s,
  theme,
  tile,
  isExpanded,
  onToggle,
}: {
  s: ReturnType<typeof createStyles>;
  theme: Theme;
  tile: BiomarkerTile;
  isExpanded: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  const statusColor = getMarkerStatusColor(tile.status, theme);
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      style={[
        s.markerTile,
        tile.isSynthetic ? s.markerTileSynthetic : null,
        isExpanded ? s.markerTileActive : null,
      ]}
    >
      <View style={s.markerTileTop}>
        <Text style={s.markerLabel}>{tile.label}</Text>
        <View style={[s.statusDot, { backgroundColor: statusColor }]} />
      </View>
      <Text style={s.markerValue}>{tile.valueText}</Text>
      <Text style={[s.markerCaption, tile.isSynthetic ? s.markerCaptionSynthetic : null]}>
        {tile.isSynthetic ? 'Synthetic' : tile.status}
      </Text>
      <Text style={s.markerExpandHint}>{isExpanded ? 'Hide' : 'Compare'}</Text>
    </Pressable>
  );
}

function BiomarkerExpandedPanel({
  s,
  theme,
  tile,
  progress,
}: {
  s: ReturnType<typeof createStyles>;
  theme: Theme;
  tile: BiomarkerTile;
  progress: BiomarkerProgressRow | null;
}): React.JSX.Element {
  const panelMeta = getPanelInlineMeta(tile.caption);
  return (
    <View style={s.markerExpandedPanel}>
      <Text style={s.markerExpandedPanelTitle}>{tile.label}</Text>
      {panelMeta ? <Text style={s.markerExpandedMeta}>{panelMeta}</Text> : null}
      {progress ? (
        <>
          <View style={s.markerCompareRow}>
            <View style={s.markerCompareBox}>
              <Text style={s.markerCompareYear}>2023</Text>
              <Text style={s.markerCompareValue}>{progress.value2023}</Text>
            </View>
            <View style={s.markerCompareBox}>
              <Text style={s.markerCompareYear}>2025</Text>
              <Text style={s.markerCompareValue}>{progress.value2025}</Text>
            </View>
          </View>
          <Text style={s.markerChange}>{progress.change}</Text>
          <Text style={s.markerInterpretation}>{progress.interpretation}</Text>
        </>
      ) : (
        <Text style={s.mutedNote}>
          {tile.isSynthetic
            ? 'Synthetic placeholder — no real lab data available.'
            : 'No 2023 comparison available for this marker.'}
        </Text>
      )}
    </View>
  );
}

function SignalRow({
  signal,
  s,
  theme,
}: {
  signal: HealthConnectSignalRow;
  s: ReturnType<typeof createStyles>;
  theme: Theme;
}): React.JSX.Element {
  const missing = signal.sourceStatus === 'Not available';
  return (
    <View style={[s.signalRow, signal.isSynthetic ? s.signalRowSynthetic : null]}>
      <View style={s.signalRowLeft}>
        <Text style={s.signalLabel}>{signal.label}</Text>
        <Text style={s.signalUsage}>{signal.scoreUsage}</Text>
      </View>
      <View style={s.signalRowRight}>
        <Text style={[s.signalValue, missing ? s.signalValueMissing : null]}>
          {missing ? '—' : `${signal.value}${signal.unit ? ` ${signal.unit}` : ''}`}
        </Text>
        {!missing ? (
          <Text style={[s.signalSource, signal.isSynthetic ? s.signalSourceSynthetic : null]}>
            {signal.isSynthetic ? 'Demo' : 'Live'}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function NotesSection({
  s,
  theme,
  notesText,
  feedback,
  onChangeText,
  onSave,
  onClear,
}: {
  s: ReturnType<typeof createStyles>;
  theme: Theme;
  notesText: string;
  feedback: string | null;
  onChangeText: (next: string) => void;
  onSave: () => void;
  onClear: () => void;
}): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setExpanded((c) => !c)}
        style={s.disclosureHeader}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text style={s.disclosureTitle}>Notes & Ideas</Text>
        <Text style={s.disclosureChevron}>{expanded ? '▴' : '▾'}</Text>
      </Pressable>
      {expanded ? (
        <View style={s.disclosureBody}>
          <TextInput
            value={notesText}
            onChangeText={onChangeText}
            placeholder="Observations, follow-ups, ideas…"
            placeholderTextColor={theme.textMuted}
            multiline
            style={s.notesInput}
            textAlignVertical="top"
          />
          <View style={s.notesActions}>
            <ActionButton s={s} label="Save" onPress={onSave} />
            <Pressable onPress={onClear} style={s.secondaryBtn}>
              <Text style={s.secondaryBtnText}>Clear</Text>
            </Pressable>
          </View>
          {feedback ? <Text style={s.notesFeedback}>{feedback}</Text> : null}
          <Text style={s.mutedNote}>Local only. Not uploaded. No effect on scores.</Text>
        </View>
      ) : null}
    </>
  );
}

function Chip({
  s,
  label,
}: {
  s: ReturnType<typeof createStyles>;
  label: string;
}): React.JSX.Element {
  return (
    <View style={s.chip}>
      <Text style={s.chipText}>{label}</Text>
    </View>
  );
}

function ActionButton({
  s,
  label,
  onPress,
  disabled,
}: {
  s: ReturnType<typeof createStyles>;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[s.actionBtn, disabled ? s.actionBtnDisabled : null]}
    >
      <Text style={s.actionBtnText}>{label}</Text>
    </Pressable>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────── */

function getMarkerStatusColor(statusText: string, theme: Theme): string {
  const lower = statusText.toLowerCase();
  if (lower.includes('optimal')) return theme.markerOptimal;
  if (lower.includes('good')) return theme.markerGood;
  if (lower.includes('elevated') || lower.includes('needs')) return theme.markerElevated;
  if (lower.includes('low')) return theme.markerLow;
  if (lower.includes('synthetic')) return theme.syntheticText;
  return theme.markerMissing;
}

function getPanelInlineMeta(caption: string): string {
  const panel = REAL_LAB_PANELS.find((c) => caption.includes(c.name));
  if (!panel) return caption;
  return `${panel.name} · ${panel.date} · ${panel.source}`;
}

function formatPermissionStatus(status: string): string {
  if (status === 'granted') return 'Granted';
  if (status === 'denied') return 'Needs permission';
  if (status === 'unavailable') return 'Unavailable';
  return 'Checking';
}

function getReadinessLabel(score: number | null): string {
  if (score === null) return 'Connect data to assess';
  if (score >= 80) return 'Ready to train';
  if (score >= 65) return 'Moderate readiness';
  if (score >= 1) return 'Build carefully';
  return 'Connect data to assess';
}

/* ─────────────────────────────────────────────────────────────────────────
   Styles
   ───────────────────────────────────────────────────────────────────── */

function createStyles(theme: Theme) {
  return StyleSheet.create({
    /* Layout */
    safeArea: { flex: 1, backgroundColor: theme.background },
    scroll: { flex: 1 },
    container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 56, gap: 12 },

    /* Splash */
    splashSafeArea: { justifyContent: 'center', alignItems: 'center' },
    splashContainer: { alignItems: 'center', gap: 10, paddingHorizontal: 32 },
    splashEyebrow: {
      color: theme.textMuted,
      fontSize: 13,
      fontWeight: '500',
      letterSpacing: 1.4,
      textTransform: 'uppercase',
    },
    splashTitle: {
      color: theme.textPrimary,
      fontSize: 48,
      fontWeight: '700',
      letterSpacing: -1,
    },
    splashSub: {
      color: theme.accent,
      fontSize: 15,
      fontWeight: '500',
    },

    /* Onboarding */
    onboardingContainer: {
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 56,
      gap: 20,
    },
    onboardingHeader: { gap: 8 },
    onboardingStep: {
      color: theme.accent,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    onboardingTitle: {
      color: theme.textPrimary,
      fontSize: 30,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    onboardingHint: {
      color: theme.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
    onboardingCard: {
      backgroundColor: theme.surface,
      borderColor: theme.borderSubtle,
      borderWidth: 1,
      borderRadius: 16,
      padding: 20,
      gap: 16,
    },
    onboardingFieldWrap: { gap: 6 },
    onboardingFieldLabel: {
      color: theme.textMuted,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    onboardingFieldInput: {
      height: 46,
      borderRadius: 10,
      borderColor: theme.border,
      borderWidth: 1,
      backgroundColor: theme.surfaceMuted,
      color: theme.textPrimary,
      paddingHorizontal: 14,
      fontSize: 15,
    },
    onboardingSkip: {
      color: theme.textMuted,
      fontSize: 13,
      textAlign: 'center',
      paddingVertical: 8,
    },

    /* Connect screen */
    connectStatusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    connectStatusLabel: {
      color: theme.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    connectStatusValue: {
      color: theme.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    connectSuccessRow: {
      backgroundColor: theme.positiveBackground,
      borderColor: theme.positiveBorder,
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
    },
    connectSuccessText: {
      color: theme.positiveText,
      fontSize: 13,
      fontWeight: '700',
    },

    /* Header */
    header: { paddingBottom: 4 },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: { flex: 1, gap: 2 },
    brandMark: {
      color: theme.textPrimary,
      fontSize: 26,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    headerSub: {
      color: theme.textMuted,
      fontSize: 12,
      fontWeight: '500',
    },
    headerActions: { flexDirection: 'row', gap: 8 },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.surface,
      borderColor: theme.borderSubtle,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconBtnActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    iconBtnText: { color: theme.textPrimary, fontSize: 13, fontWeight: '700' },
    iconBtnTextActive: { color: theme.accentText },

    /* Profile */
    profileCard: {
      backgroundColor: theme.surface,
      borderColor: theme.borderSubtle,
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      gap: 14,
    },
    profileHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.accentSubtle,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: theme.accentSubtleText,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    profileMeta: { flex: 1, gap: 2 },
    profileName: { color: theme.textPrimary, fontSize: 15, fontWeight: '600' },
    profileHint: { color: theme.textMuted, fontSize: 12 },
    profileFields: { flexDirection: 'row', gap: 10 },
    profileFieldWrap: { flex: 1, gap: 4 },
    profileFieldLabel: {
      color: theme.textMuted,
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    profileFieldInput: {
      height: 38,
      borderRadius: 8,
      borderColor: theme.borderSubtle,
      borderWidth: 1,
      backgroundColor: theme.surfaceMuted,
      color: theme.textPrimary,
      paddingHorizontal: 10,
      fontSize: 13,
    },

    /* Data mode pill */
    modePill: {
      flexDirection: 'row',
      backgroundColor: theme.surfaceMuted,
      borderRadius: 10,
      padding: 3,
      gap: 2,
    },
    modePillOption: {
      flex: 1,
      height: 34,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modePillOptionActive: { backgroundColor: theme.accent },
    modePillText: { color: theme.textMuted, fontSize: 13, fontWeight: '600' },
    modePillTextActive: { color: theme.accentText, fontWeight: '700' },

    /* Readiness hero */
    hero: {
      backgroundColor: theme.heroBackground,
      borderColor: theme.heroBorder,
      borderWidth: 1,
      borderRadius: 20,
      padding: 24,
      gap: 14,
      alignItems: 'center',
    },
    heroScoreBlock: { flexDirection: 'row', alignItems: 'flex-end' },
    heroScore: {
      color: theme.accent,
      fontSize: 60,
      fontWeight: '700',
      lineHeight: 60,
      letterSpacing: -2,
    },
    heroScoreUnit: {
      color: theme.textMuted,
      fontSize: 15,
      fontWeight: '500',
      marginBottom: 7,
      marginLeft: 3,
    },
    heroLabel: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    heroMetrics: { width: '100%', gap: 10, marginTop: 2 },
    heroMetricRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heroMetricLabel: {
      color: theme.textMuted,
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      width: 68,
    },
    heroMetricValue: {
      color: theme.textPrimary,
      fontSize: 13,
      fontWeight: '700',
      width: 36,
      textAlign: 'right',
    },
    progressBarWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    progressBarTrack: {
      flex: 1,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.progressTrack,
      overflow: 'hidden',
    },
    progressBarFill: { height: 5, borderRadius: 3 },
    syntheticChip: {
      backgroundColor: theme.syntheticBackground,
      borderColor: theme.syntheticBorder,
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    syntheticChipText: {
      color: theme.syntheticText,
      fontSize: 11,
      fontWeight: '600',
    },

    /* Data strip */
    dataStrip: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderColor: theme.borderSubtle,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 4,
      alignItems: 'center',
    },
    dataStripItem: { flex: 1, alignItems: 'center', gap: 3 },
    dataStripDivider: { width: 1, height: 26, backgroundColor: theme.divider },
    dataStripLabel: {
      color: theme.textMuted,
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    dataStripValue: { color: theme.textPrimary, fontSize: 14, fontWeight: '700' },

    /* Disclosure sections */
    disclosureHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderColor: theme.borderSubtle,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    disclosureTitle: { color: theme.textPrimary, fontSize: 15, fontWeight: '600' },
    disclosureRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    disclosureMeta: { color: theme.textMuted, fontSize: 12, fontWeight: '500' },
    disclosureChevron: { color: theme.textMuted, fontSize: 13 },
    disclosureBody: {
      backgroundColor: theme.surface,
      borderColor: theme.borderSubtle,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      gap: 12,
      marginTop: -4,
    },

    /* Chips */
    chip: {
      backgroundColor: theme.chipBackground,
      borderColor: theme.chipBorder,
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    chipText: { color: theme.chipText, fontSize: 12, fontWeight: '500' },
    chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    resultChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },

    /* Section headers */
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      paddingTop: 8,
      paddingBottom: 2,
    },
    sectionTitle: { color: theme.textPrimary, fontSize: 17, fontWeight: '700' },
    sectionMeta: { color: theme.textMuted, fontSize: 12, fontWeight: '500' },

    /* Biomarker grid — fixed layout */
    markerGridOuter: { gap: 8 },
    markerRowGroup: { gap: 8 },
    markerTilePair: { flexDirection: 'row', gap: 10 },
    markerTile: {
      flex: 1,
      minHeight: 96,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderColor: theme.borderSubtle,
      borderWidth: 1,
      padding: 14,
      gap: 5,
    },
    markerTileSpacer: { flex: 1 },
    markerTileSynthetic: {
      backgroundColor: theme.syntheticBackground,
      borderColor: theme.syntheticBorder,
    },
    markerTileActive: {
      borderColor: theme.accent,
      borderWidth: 1,
    },
    markerTileTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    markerLabel: {
      color: theme.textMuted,
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    markerValue: {
      color: theme.textPrimary,
      fontSize: 19,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    markerCaption: { color: theme.textMuted, fontSize: 11, fontWeight: '500' },
    markerCaptionSynthetic: { color: theme.syntheticText },
    markerExpandHint: {
      color: theme.accentSubtleText,
      fontSize: 10,
      fontWeight: '600',
      marginTop: 2,
    },

    /* Biomarker expanded panel — full width below tile row */
    markerExpandedPanel: {
      backgroundColor: theme.surfaceElevated,
      borderColor: theme.accent,
      borderWidth: 1,
      borderRadius: 14,
      padding: 16,
      gap: 10,
    },
    markerExpandedPanelTitle: {
      color: theme.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    markerExpandedMeta: {
      color: theme.textMuted,
      fontSize: 11,
      fontWeight: '500',
    },
    markerCompareRow: { flexDirection: 'row', gap: 10 },
    markerCompareBox: {
      flex: 1,
      backgroundColor: theme.surfaceMuted,
      borderRadius: 10,
      padding: 12,
      gap: 4,
    },
    markerCompareYear: {
      color: theme.textMuted,
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    markerCompareValue: {
      color: theme.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    markerChange: {
      color: theme.accentSubtleText,
      fontSize: 12,
      fontWeight: '600',
    },
    markerInterpretation: {
      color: theme.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },

    /* Signal rows */
    signalList: { gap: 2 },
    signalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderColor: theme.borderSubtle,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    signalRowSynthetic: {
      backgroundColor: theme.syntheticBackground,
      borderColor: theme.syntheticBorder,
    },
    signalRowLeft: { flex: 1, gap: 2 },
    signalRowRight: { alignItems: 'flex-end', gap: 2 },
    signalLabel: { color: theme.textPrimary, fontSize: 14, fontWeight: '500' },
    signalUsage: { color: theme.textMuted, fontSize: 11, fontWeight: '500' },
    signalValue: { color: theme.textPrimary, fontSize: 15, fontWeight: '700' },
    signalValueMissing: { color: theme.textMuted },
    signalSource: { color: theme.positiveText, fontSize: 10, fontWeight: '600' },
    signalSourceSynthetic: { color: theme.syntheticText },

    /* Actions card */
    actionsCard: {
      backgroundColor: theme.surface,
      borderColor: theme.borderSubtle,
      borderWidth: 1,
      borderRadius: 14,
      padding: 16,
      gap: 12,
    },
    actionsTitle: { color: theme.textPrimary, fontSize: 14, fontWeight: '600' },
    actionRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
    actionDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.accent,
      marginTop: 8,
    },
    actionText: {
      flex: 1,
      color: theme.textSecondary,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: '400',
    },

    /* Notes */
    notesInput: {
      minHeight: 96,
      borderRadius: 10,
      borderColor: theme.borderSubtle,
      borderWidth: 1,
      backgroundColor: theme.surfaceMuted,
      color: theme.textPrimary,
      padding: 12,
      fontSize: 14,
      lineHeight: 20,
    },
    notesActions: { flexDirection: 'row', gap: 10 },
    notesFeedback: {
      color: theme.accentSubtleText,
      fontSize: 12,
      fontWeight: '500',
    },

    /* Buttons */
    actionBtn: {
      height: 46,
      borderRadius: 12,
      backgroundColor: theme.accent,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 22,
    },
    actionBtnDisabled: { opacity: 0.4 },
    actionBtnText: { color: theme.accentText, fontSize: 14, fontWeight: '700' },
    secondaryBtn: {
      height: 46,
      borderRadius: 12,
      borderColor: theme.border,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      backgroundColor: theme.surfaceMuted,
    },
    secondaryBtnText: { color: theme.textPrimary, fontSize: 14, fontWeight: '600' },

    /* Shared */
    warningText: { color: theme.warning, fontSize: 13 },
    mutedNote: { color: theme.textMuted, fontSize: 12, lineHeight: 17 },
    disclaimer: {
      color: theme.textMuted,
      fontSize: 11,
      lineHeight: 16,
      textAlign: 'center',
      paddingTop: 8,
    },
  });
}
