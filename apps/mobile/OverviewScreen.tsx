import React, { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Card, ScreenHeader } from './ui/components';
import { theme } from './ui/theme';
import { METRICS, MetricDefinition, MetricKey } from './metrics/metricDefinitions';
import { MetricAvailabilitySnapshot } from './metrics/appleHealthTypeMapping';
import {
  getISODate,
  loadManualMetricsForDate,
  saveManualMetricForDate,
  ManualMetricsByKey,
} from './metrics/manualMetricsStore';
import { getHealthKitAdapterStatus } from './ios/healthkitAdapter';

function groupByCategory(metrics: ReadonlyArray<MetricDefinition>): Record<string, MetricDefinition[]> {
  return metrics.reduce<Record<string, MetricDefinition[]>>((acc, metric) => {
    acc[metric.category] ??= [];
    acc[metric.category].push(metric);
    return acc;
  }, {});
}

function getTrackedCount(snapshot: MetricAvailabilitySnapshot | null, key: MetricKey): number {
  return snapshot?.countsByMetricKey?.[key] ?? 0;
}

function formatManualValue(value: ManualMetricsByKey[MetricKey] | undefined, unit?: string): string | null {
  if (!value) return null;
  const rendered = value.type === 'number' ? String(value.value) : String(value.value);
  return unit ? `${rendered} ${unit}` : rendered;
}

export default function OverviewScreen({
  snapshot,
}: {
  snapshot: MetricAvailabilitySnapshot | null;
}): React.JSX.Element {
  const isoDate = useMemo(() => getISODate(new Date()), []);
  const [manual, setManual] = useState<ManualMetricsByKey>({});
  const [editingKey, setEditingKey] = useState<MetricKey | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    void (async () => {
      const loaded = await loadManualMetricsForDate(isoDate);
      setManual(loaded);
    })();
  }, [isoDate]);

  const grouped = useMemo(() => groupByCategory(METRICS), []);

  async function startEdit(metric: MetricDefinition): Promise<void> {
    setEditingKey(metric.key);
    const existing = manual[metric.key];
    setDraft(existing ? String(existing.value) : '');
  }

  async function commitEdit(metric: MetricDefinition): Promise<void> {
    const raw = draft.trim();
    if (raw.length === 0) {
      await saveManualMetricForDate(isoDate, metric.key, null);
      const next = { ...manual };
      delete next[metric.key];
      setManual(next);
      setEditingKey(null);
      return;
    }

    if (metric.valueType === 'number') {
      const num = Number(raw.replace(',', '.'));
      if (!Number.isFinite(num)) return;
      const nextValue = { type: 'number' as const, value: num };
      await saveManualMetricForDate(isoDate, metric.key, nextValue);
      setManual({ ...manual, [metric.key]: nextValue });
      setEditingKey(null);
      return;
    }

    const nextValue = { type: 'text' as const, value: raw };
    await saveManualMetricForDate(isoDate, metric.key, nextValue);
    setManual({ ...manual, [metric.key]: nextValue });
    setEditingKey(null);
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <ScreenHeader
        eyebrow="One L1fe"
        title="Overview"
        subtitle="Tracked metrics (device/import) + manual backfill for today."
      />

      <Card>
        <Text style={styles.smallMuted}>
          Today: <Text style={styles.mono}>{isoDate}</Text>
        </Text>
        <Text style={styles.smallMuted}>
          Device layer:{' '}
          <Text style={styles.mono}>
            {snapshot?.source ?? (Platform.OS === 'ios' ? 'healthkit (not wired)' : 'health_connect')}
          </Text>
        </Text>
        {Platform.OS === 'ios' ? (
          <Text style={styles.smallMuted}>
            iOS note: HealthKit adapter status: <Text style={styles.mono}>{getHealthKitAdapterStatus()}</Text>. Manual backfill works now.
          </Text>
        ) : null}
      </Card>

      {Object.entries(grouped).map(([category, metrics]) => (
        <Card key={category}>
          <Text style={styles.sectionTitle}>{category}</Text>
          <View style={styles.metricList}>
            {metrics.map((metric) => {
              const tracked = getTrackedCount(snapshot, metric.key);
              const manualValue = formatManualValue(manual[metric.key], metric.unit);
              const hasTracked = tracked > 0;
              const isEditing = editingKey === metric.key;

              return (
                <View
                  key={metric.key}
                  style={[
                    styles.metricRow,
                    !hasTracked && manualValue === null ? styles.metricRowMuted : null,
                  ]}
                >
                  <View style={styles.metricMeta}>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={styles.metricStatus}>
                      {hasTracked ? `tracked (${tracked})` : 'no device data'} ·{' '}
                      {manualValue !== null ? `manual: ${manualValue}` : 'manual: empty'}
                    </Text>
                    {metric.description ? (
                      <Text style={styles.metricHint}>{metric.description}</Text>
                    ) : null}
                  </View>

                  {isEditing ? (
                    <View style={styles.editBox}>
                      <TextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType={metric.valueType === 'number' ? 'numeric' : 'default'}
                        placeholder={metric.valueType === 'number' ? '0' : '…'}
                        placeholderTextColor={theme.colors.textMuted}
                        style={styles.input}
                        value={draft}
                        onChangeText={setDraft}
                      />
                      <View style={styles.editActions}>
                        <Pressable
                          onPress={() => setEditingKey(null)}
                          style={styles.editSecondary}
                        >
                          <Text style={styles.editSecondaryText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => void commitEdit(metric)}
                          style={styles.editPrimary}
                        >
                          <Text style={styles.editPrimaryText}>Save</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Pressable onPress={() => void startEdit(metric)} style={styles.editButton}>
                      <Text style={styles.editButtonText}>
                        {manualValue !== null ? 'Edit' : 'Add'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 20, gap: 16 },
  sectionTitle: { color: theme.colors.text, ...theme.text.sectionTitle },
  smallMuted: { color: theme.colors.textMuted, ...theme.text.small },
  mono: { fontFamily: 'monospace', color: theme.colors.primary },
  metricList: { gap: 12, marginTop: 8 },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  metricRowMuted: { opacity: 0.6 },
  metricMeta: { flex: 1, gap: 4 },
  metricLabel: { color: theme.colors.textLabel, ...theme.text.label },
  metricStatus: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 18 },
  metricHint: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 17 },
  editButton: {
    backgroundColor: theme.colors.primarySurface,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 72,
    alignItems: 'center',
  },
  editButtonText: { color: theme.colors.textLabel, fontSize: 13, fontWeight: '700' as const },
  editBox: { minWidth: 180, gap: 8 },
  input: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  editActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  editSecondary: {
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  editSecondaryText: { color: theme.colors.textLabel, fontSize: 13, fontWeight: '700' as const },
  editPrimary: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary,
  },
  editPrimaryText: { color: '#ffffff', fontSize: 13, fontWeight: '700' as const },
});
