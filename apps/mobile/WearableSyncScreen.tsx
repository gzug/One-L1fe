import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useWearableSource } from './useWearableSource';
import { useWearableSync } from './useWearableSync';
import { useComputeDailySummaries } from './useComputeDailySummaries';
import { createGarminProvisioningRequest } from './wearableSourceProvisioning';
import { getOrCreateAppInstallId } from './appInstallIdentity';

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
    const appInstallId = await getOrCreateAppInstallId();
    const request = createGarminProvisioningRequest({
      app_install_id: appInstallId,
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
      <View style={styles.header}>
        <Text style={styles.eyebrow}>One L1fe</Text>
        <Text style={styles.title}>Wearable Sync</Text>
        <Text style={styles.subtitle}>
          Provision a wearable source, then trigger a sync run.
        </Text>
      </View>

      {/* Step 1 — Provision */}
      <View style={styles.card}>
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
        <Pressable
          onPress={handleProvision}
          style={[styles.primaryButton, sourceState.status === 'loading' && styles.buttonDisabled]}
          disabled={sourceState.status === 'loading'}
        >
          {sourceState.status === 'loading' ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {sourceState.status === 'ready' ? 'Re-provision' : 'Provision Garmin source'}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Step 2 — Sync */}
      <View style={styles.card}>
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
        <Pressable
          onPress={handleSync}
          style={[
            styles.primaryButton,
            (sourceState.status !== 'ready' || isSyncing) && styles.buttonDisabled,
          ]}
          disabled={sourceState.status !== 'ready' || isSyncing}
        >
          {syncState === 'submitting' ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Trigger sync</Text>
          )}
        </Pressable>
      </View>

      {/* Step 3 — Compute (auto-triggered, shown after sync succeeds) */}
      {(syncState === 'success' || computeState !== 'idle') && (
        <View style={[styles.card, computeState === 'error' && styles.cardError]}>
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
        </View>
      )}

      <View style={styles.actions}>
        <Pressable onPress={handleReset} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Reset</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#f4f7fb' },
  container: { padding: 20, gap: 16 },
  header: { gap: 6, marginBottom: 4 },
  eyebrow: { color: '#4263eb', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: '#152033', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#52607a', fontSize: 15, lineHeight: 21 },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  cardError: {
    borderColor: '#f5b8b8',
    backgroundColor: '#fff8f8',
  },
  sectionTitle: { color: '#152033', fontSize: 18, fontWeight: '700' },
  statusText: { color: '#24324a', fontSize: 14, lineHeight: 21 },
  mono: { fontFamily: 'monospace', color: '#4263eb' },
  errorText: { color: '#b42318', fontSize: 14, lineHeight: 20 },
  spinner: { alignSelf: 'flex-start' },
  actions: { gap: 12, marginBottom: 32 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#4263eb',
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#c8d3e1',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 52,
    justifyContent: 'center',
  },
  secondaryButtonText: { color: '#24324a', fontSize: 16, fontWeight: '600' },
});
