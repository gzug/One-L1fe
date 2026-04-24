import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { seedDefaultPreferencesIfAbsent, fetchMarkerPreferences, fetchWearablePreferences, setMarkerPreference, setWearablePreference } from '../data/userPreferences.ts';
import { MANDATORY_MARKER_KEYS, OPTIONAL_MARKER_KEYS, DEFAULT_HC_RECORD_TYPES } from '../../../../packages/domain/userPreferences.ts';
import { theme } from '../../ui/theme';

type PreferenceMap = Record<string, boolean>;
const APP_INSTALL_ID = '00000000-0000-0000-0000-000000000001';

type ToggleRowProps = {
  label: string;
  enabled: boolean;
  onToggle: () => void;
};

function ToggleRow({ label, enabled, onToggle }: ToggleRowProps): React.JSX.Element {
  return (
    <Pressable onPress={onToggle} style={[styles.row, enabled ? styles.rowEnabled : styles.rowDisabled]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{enabled ? 'Enabled' : 'Disabled'}</Text>
    </Pressable>
  );
}

export default function DataSourcesSettingsScreen(): React.JSX.Element {
  const [markerPrefs, setMarkerPrefs] = useState<PreferenceMap>({});
  const [wearablePrefs, setWearablePrefs] = useState<PreferenceMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        await seedDefaultPreferencesIfAbsent(APP_INSTALL_ID);
        const [markers, wearables] = await Promise.all([
          fetchMarkerPreferences(APP_INSTALL_ID),
          fetchWearablePreferences(APP_INSTALL_ID),
        ]);

        if (cancelled) return;
        setMarkerPrefs(Object.fromEntries(markers.map((pref) => [pref.markerKey, pref.enabled])));
        setWearablePrefs(Object.fromEntries(wearables.map((pref) => [pref.hcRecordType, pref.enabled])));
      } catch (nextError) {
        if (cancelled) return;
        setError(nextError instanceof Error ? nextError.message : 'Failed to load preferences.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleMarker = async (markerKey: string): Promise<void> => {
    const previous = markerPrefs[markerKey] ?? true;
    const next = !previous;
    setMarkerPrefs((current) => ({ ...current, [markerKey]: next }));
    try {
      await setMarkerPreference(APP_INSTALL_ID, markerKey, next, (rollback) => {
        setMarkerPrefs((current) => ({ ...current, [markerKey]: rollback }));
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to save marker preference.');
    }
  };

  const toggleWearable = async (recordType: string): Promise<void> => {
    const previous = wearablePrefs[recordType] ?? true;
    const next = !previous;
    setWearablePrefs((current) => ({ ...current, [recordType]: next }));
    try {
      await setWearablePreference(APP_INSTALL_ID, recordType, next, (rollback) => {
        setWearablePrefs((current) => ({ ...current, [recordType]: rollback }));
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to save wearable preference.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} style={styles.scrollView}>
      <Text style={styles.eyebrow}>One L1fe</Text>
      <Text style={styles.title}>Data Sources</Text>
      <Text style={styles.subtitle}>Configure which markers and wearable inputs stay active for this install.</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Marker preferences</Text>
        {[...MANDATORY_MARKER_KEYS, ...OPTIONAL_MARKER_KEYS].map((markerKey) => (
          <ToggleRow
            key={markerKey}
            label={markerKey}
            enabled={markerPrefs[markerKey] ?? true}
            onToggle={() => {
              void toggleMarker(markerKey);
            }}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wearable record types</Text>
        {DEFAULT_HC_RECORD_TYPES.map((recordType) => (
          <ToggleRow
            key={recordType}
            label={recordType}
            enabled={wearablePrefs[recordType] ?? true}
            onToggle={() => {
              void toggleWearable(recordType);
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  loadingBox: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowEnabled: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderColor: theme.colors.borderStrong,
  },
  rowDisabled: {
    backgroundColor: '#fff8f7',
    borderColor: '#f2c2bc',
  },
  rowLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  rowValue: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
