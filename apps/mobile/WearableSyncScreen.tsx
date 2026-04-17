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
import { createGarminProvisioningRequest } from './wearableSourceProvisioning';

const MOCK_APP_INSTALL_ID = 'dev-install-001';

export default function WearableSyncScreen(): React.JSX.Element {
  const { state: sourceState, provision, reset: resetSource } = useWearableSource();
  const { state: syncState, result, error: syncError, submitSync, reset: resetSync } = useWearableSync();

  const handleProvision = useCallback(async () => {
    const request = createGarminProvisioningRequest({
      app_install_id: MOCK_APP_INSTALL_ID,
    });
    await provision(request);
  }, [provision]);

  const handleSync = useCallback(async () => {
    if (sourceState.status !== 'ready') return;
    await submitSync({
      wearable_source_id: sourceState.wearableSourceId,
      platform: 'android',
      sync_mode: 'incremental',
      started_at: new Date().toISOString(),
      source_cursor: null,
      observations: [],
    });
  }, [sourceState, submitSync]);

  const handleReset = useCallback(() => {
    resetSource();
    resetSync();
  }, [resetSource, resetSync]);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>One L1fe</Text>
        <Text style={styles.title}>Wearable Sync</Text>
        <Text style={styles.subtitle}>
          Provision a wearable source, then trigger a sync run.
        </Text>
      </View>

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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Step 2 — Trigger sync</Text>
        <Text style={styles.statusText}>
          Status: <Text style={styles.mono}>{syncState}</Text>
        </Text>
        {syncState === 'success' && result && (
          <>
            <Text style={styles.statusText}>Run ID: <Text style={styles.mono}>{result.sync_run_id}</Text></Text>
            <Text style={styles.statusText}>Inserted: <Text style={styles.mono}>{result.records_inserted}</Text></Text>
          </>
        )}
        {syncError && <Text style={styles.errorText}>{syncError}</Text>}
        <Pressable
          onPress={handleSync}
          style={[
            styles.primaryButton,
            (sourceState.status !== 'ready' || syncState === 'submitting') && styles.buttonDisabled,
          ]}
          disabled={sourceState.status !== 'ready' || syncState === 'submitting'}
        >
          {syncState === 'submitting' ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Trigger sync</Text>
          )}
        </Pressable>
      </View>

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
  card: { backgroundColor: '#ffffff', borderColor: '#d9e2f2', borderRadius: 16, borderWidth: 1, gap: 12, padding: 16 },
  sectionTitle: { color: '#152033', fontSize: 18, fontWeight: '700' },
  statusText: { color: '#24324a', fontSize: 14, lineHeight: 21 },
  mono: { fontFamily: 'monospace', color: '#4263eb' },
  errorText: { color: '#b42318', fontSize: 14, lineHeight: 20 },
  actions: { gap: 12, marginBottom: 32 },
  primaryButton: { alignItems: 'center', backgroundColor: '#4263eb', borderRadius: 12, minHeight: 52, justifyContent: 'center' },
  buttonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', backgroundColor: '#ffffff', borderColor: '#c8d3e1', borderRadius: 12, borderWidth: 1, minHeight: 52, justifyContent: 'center' },
  secondaryButtonText: { color: '#24324a', fontSize: 16, fontWeight: '600' },
});
