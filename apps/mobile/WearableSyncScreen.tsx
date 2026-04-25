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
import { useDailyTrends } from './useDailyTrends';
import { readGarminHealthConnectData } from './healthConnectGarminReader';
import { createGarminHealthConnectProvisioningRequest } from './wearableSourceProvisioning';

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
  const dailyTrends = useDailyTrends();

  const handleSync = useCallback(async () => {
    if (!appInstallId || isLegacyMockInstallId(appInstallId)) {
      console.warn('[WearableSyncScreen] appInstallId not ready or is legacy mock — aborting sync');
      return;
    }

    setSyncStatus({ kind: 'running' });

    try {
      const provisioningRequest = createGarminHealthConnectProvisioningRequest({
        app_install_id: appInstallId,
      });

      const sourceResponse = await wearableSource.provision(provisioningRequest);
      const healthConnectResult = await readGarminHealthConnectData({
        wearableSourceId: sourceResponse.wearable_source_id,
        lookbackDays: 14,
      });

      if (!healthConnectResult.request) {
        throw new Error(
          `${healthConnectResult.message} Open Garmin Connect, confirm Health Connect sharing, then run sync again.`,
        );
      }

      const syncResult = await wearableSync.submitSync(healthConnectResult.request);

      // submitCompute needs a ComputeDailySummariesParams payload.
      if (sourceResponse.wearable_source_id) {
        await computeDailySummaries.submitCompute({
          wearable_source_id: sourceResponse.wearable_source_id,
          date_from: new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10),
        });
        await dailyTrends.fetchTrends(sourceResponse.wearable_source_id);
      }

      setSyncStatus({
        kind: 'success',
        syncedAt: new Date().toLocaleTimeString(),
        recordsInserted: syncResult.records_inserted,
      });
    } catch (e) {
      setSyncStatus({
        kind: 'error',
        message: e instanceof Error ? e.message : 'Unexpected error during sync.',
      });
    }
  }, [appInstallId, wearableSource, wearableSync, computeDailySummaries, dailyTrends]);

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

      {dailyTrends.trends.length > 0 && (
        <View style={styles.trendContainer}>
          <Text style={styles.trendHeading}>7-Day Trend</Text>
          {dailyTrends.trends.map((trend) => (
            <View key={trend.date} style={styles.trendRow}>
              <Text style={styles.trendDate}>{trend.date.slice(5)}</Text>
              <View style={styles.trendMetrics}>
                <Text style={styles.trendMetric}>
                  ❤️ {trend.resting_heart_rate ?? '--'} bpm
                </Text>
                <Text style={styles.trendMetric}>
                  💤 {trend.sleep_duration_seconds ? (trend.sleep_duration_seconds / 3600).toFixed(1) + 'h' : '--'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
  trendContainer: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  trendHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0f172a',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  trendDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  trendMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  trendMetric: {
    fontSize: 15,
    color: '#0f172a',
  },
});
