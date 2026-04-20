import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getOrCreateAppInstallId, isLegacyMockInstallId } from './appInstallId';
import { useWearableSource } from './useWearableSource';
import { useWearableSync } from './useWearableSync';
import { useComputeDailySummaries } from './useComputeDailySummaries';
import { createGarminProvisioningRequest } from './wearableSourceProvisioning';

type SyncStatus =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'success'; syncedAt: string; recordsInserted: number }
  | { kind: 'error'; message: string };

export default function WearableSyncScreen() {
  const [appInstallId, setAppInstallId] = useState<string | null>(null);
  const [installIdReady, setInstallIdReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ kind: 'idle' });

  useEffect(() => {
    getOrCreateAppInstallId().then((id) => {
      setAppInstallId(id);
      setInstallIdReady(true);
    });
  }, []);

  const wearableSource = useWearableSource();
  const wearableSync = useWearableSync();
  const computeDailySummaries = useComputeDailySummaries();

  const handleSync = useCallback(async () => {
    if (!appInstallId || isLegacyMockInstallId(appInstallId)) {
      console.warn('[WearableSyncScreen] appInstallId not ready or is legacy mock — aborting sync');
      return;
    }

    setSyncStatus({ kind: 'running' });

    try {
      const provisioningRequest = createGarminProvisioningRequest({
        app_install_id: appInstallId,
      });

      await wearableSource.resolve(provisioningRequest);
      const syncResult = await wearableSync.run();
      await computeDailySummaries.run();

      if (syncResult && typeof syncResult === 'object' && 'kind' in syncResult && syncResult.kind === 'error') {
        setSyncStatus({
          kind: 'error',
          message: typeof syncResult.message === 'string' ? syncResult.message : 'Sync failed.',
        });
        return;
      }

      const recordsInserted =
        syncResult && typeof syncResult === 'object' && 'records_inserted' in syncResult
          ? Number(syncResult.records_inserted)
          : 0;

      setSyncStatus({
        kind: 'success',
        syncedAt: new Date().toLocaleTimeString(),
        recordsInserted,
      });
    } catch (e) {
      setSyncStatus({
        kind: 'error',
        message: e instanceof Error ? e.message : 'Unexpected error during sync.',
      });
    }
  }, [appInstallId, wearableSource, wearableSync, computeDailySummaries]);

  if (!installIdReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Wearable Sync</Text>

      {isLegacyMockInstallId(appInstallId) && (
        <Text style={styles.warning}>
          ⚠️ Legacy mock install ID detected — re-install app to generate real ID.
        </Text>
      )}

      {syncStatus.kind === 'success' && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>
            ✅ Synced at {syncStatus.syncedAt}
          </Text>
          <Text style={styles.successSubtext}>
            {syncStatus.recordsInserted} record{syncStatus.recordsInserted !== 1 ? 's' : ''} inserted
          </Text>
        </View>
      )}

      {syncStatus.kind === 'error' && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>❌ Sync failed</Text>
          <Text style={styles.errorSubtext}>{syncStatus.message}</Text>
        </View>
      )}

      <Pressable
        style={[styles.button, syncStatus.kind === 'running' && styles.buttonDisabled]}
        onPress={handleSync}
        disabled={syncStatus.kind === 'running'}
      >
        {syncStatus.kind === 'running' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sync Now</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24, gap: 16 },
  heading: { fontSize: 20, fontWeight: '600' },
  warning: { color: '#b45309', fontSize: 14 },
  successBanner: {
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },
  successText: { color: '#1a5c2a', fontWeight: '600', fontSize: 15 },
  successSubtext: { color: '#2d7a42', fontSize: 13 },
  errorBanner: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },
  errorText: { color: '#8b1a1a', fontWeight: '600', fontSize: 15 },
  errorSubtext: { color: '#a83232', fontSize: 13 },
  button: {
    backgroundColor: '#01696f',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: '#7aacaf' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
