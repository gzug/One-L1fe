import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useWearableSource } from './useWearableSource';
import { useWearableSync } from './useWearableSync';
import { useComputeDailySummaries } from './useComputeDailySummaries';
import { createGarminProvisioningRequest } from './wearableSourceProvisioning';
import { Card, PrimaryButton, ScreenHeader, SecondaryButton } from './ui/components';
import { theme } from './ui/theme';

const MOCK_APP_INSTALL_ID = 'dev-install-001';

// Returns today and yesterday as ISO date strings (YYYY-MM-DD)
function getSyncDateRange(): { date_from: string; date_to: string } {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { date_from: fmt(yesterday), date_to: fmt(today) };
}

export default function WearableSyncScreen(): React.JSX.Element {
  const { state: sourceState, provision, reset: resetSource } = useWearableSource();
  const { state: syncState, result: syncResult, error: syncError, submitSync, reset: resetSync } = useWearableSync();
  const { state: computeState, result: computeResult, error: computeError, submitCompute, reset: resetCompute } = useComputeDailySummaries();

  const handleProvision = useCallback(async () => {
    const request = createGarminProvisioningRequest({
      app_install_id: MOCK_APP_INSTALL_ID,
    });
    await provision(request);
  }, [provision]);

  const handleSync = useCallback(async () => {
    if (sourceState.status !== 'ready') return;

    const syncPayload = {
      wearable_source_id: sourceState.wearableSourceId,
      platform: 'android' as const,
      sync_mode: 'incremental' as const,
      started_at: new Date().toISOString(),
      source_cursor: null,
      observations: [],
    };

    const syncRes = await submitSync(syncPayload);

    // Auto-compute daily summaries immediately after a successful sync
    if (syncRes !== null) {
      const { date_from, date_to } = getSyncDateRange();
      await submitCompute({
        wearable_source_id: sourceState.wearableSourceId,
        date_from,
        date_to,
      });
    }
  }, [sourceState, submitSync, submitCompute]);

  const handleReset = useCallback(() => {
    resetSource();
    resetSync();
    resetCompute();
  }, [resetSource, resetSync, resetCompute]);

  const isSyncing = syncState === 'submitting' || computeState === 'submitting';

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <ScreenHeader
        eyebrow="One L1fe"
        title="Wearable sync"
        subtitle="Provision a wearable source, then trigger a sync run."
      />

      {/* Step 1 — Provision */}
      <Card>
        <Text style={styles.sectionTitle}>Step 1 — Provision source</Text>
        <Text style={styles.statusText}>
          Status: <Text style={styles.mono}>{sourceState.status}</Text>
        </Text>
        {sourceState.status === 'ready' && (
          <Text style={styles.statusText}>
            ID: <Text style={styles.mono}>{sourceState.wearableSourceId}</Text>
          </Text>
        )}
        {sourceState.status === 'error' && (
          <Text style={styles.errorText}>{sourceState.message}</Text>
        )}
        <PrimaryButton onPress={handleProvision} disabled={sourceState.status === 'loading'}>
          {sourceState.status === 'loading' ? (
            <ActivityIndicator color="#ffffff" />
          ) : sourceState.status === 'ready' ? (
            'Re-provision'
          ) : (
            'Provision Garmin source'
          )}
        </PrimaryButton>
      </Card>

      {/* Step 2 — Sync */}
      <Card>
        <Text style={styles.sectionTitle}>Step 2 — Trigger sync</Text>
        <Text style={styles.statusText}>
          Status: <Text style={styles.mono}>{syncState}</Text>
        </Text>
        {syncState === 'success' && syncResult && (
          <>
            <Text style={styles.statusText}>
              Run ID: <Text style={styles.mono}>{syncResult.sync_run_id}</Text>
            </Text>
            <Text style={styles.statusText}>
              Inserted: <Text style={styles.mono}>{syncResult.records_inserted}</Text>
            </Text>
          </>
        )}
        {syncError && <Text style={styles.errorText}>{syncError}</Text>}
        <PrimaryButton onPress={handleSync} disabled={sourceState.status !== 'ready' || isSyncing}>
          {syncState === 'submitting' ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            'Trigger sync'
          )}
        </PrimaryButton>
      </Card>

      {/* Step 3 — Compute (auto-triggered, shown after sync succeeds) */}
      {(syncState === 'success' || computeState !== 'idle') && (
        <Card variant={computeState === 'error' ? 'danger' : 'default'}>
          <Text style={styles.sectionTitle}>Step 3 — Compute summaries</Text>
          <Text style={styles.statusText}>
            Status: <Text style={styles.mono}>{computeState}</Text>
          </Text>
          {computeState === 'submitting' && (
            <ActivityIndicator color="#4263eb" style={styles.spinner} />
          )}
          {computeState === 'success' && computeResult && (
            <>
              <Text style={styles.statusText}>
                Summaries written:{' '}
                <Text style={styles.mono}>{computeResult.summaries_written}</Text>
              </Text>
              <Text style={styles.statusText}>
                Version:{' '}
                <Text style={styles.mono}>{computeResult.computation_version}</Text>
              </Text>
              {computeResult.error_summary && (
                <Text style={styles.errorText}>{computeResult.error_summary}</Text>
              )}
            </>
          )}
          {computeError && <Text style={styles.errorText}>{computeError}</Text>}
        </Card>
      )}

      <View style={styles.actions}>
        <SecondaryButton onPress={handleReset}>Reset</SecondaryButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 20, gap: 16 },
  sectionTitle: { color: theme.colors.text, ...theme.text.sectionTitle },
  statusText: { color: theme.colors.textLabel, fontSize: 14, lineHeight: 21 },
  mono: { fontFamily: 'monospace', color: theme.colors.primary },
  errorText: { color: theme.colors.danger, fontSize: 14, lineHeight: 20 },
  spinner: { alignSelf: 'flex-start' },
  actions: { gap: 12, marginBottom: 32 },
});
