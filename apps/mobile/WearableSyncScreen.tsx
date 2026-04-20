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

export default function WearableSyncScreen() {
  const [appInstallId, setAppInstallId] = useState<string | null>(null);
  const [installIdReady, setInstallIdReady] = useState(false);

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

    const provisioningRequest = createGarminProvisioningRequest({
      app_install_id: appInstallId,
    });

    await wearableSource.resolve(provisioningRequest);
    await wearableSync.run();
    await computeDailySummaries.run();
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
      <Pressable style={styles.button} onPress={handleSync}>
        <Text style={styles.buttonText}>Sync Now</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24, gap: 16 },
  heading: { fontSize: 20, fontWeight: '600' },
  warning: { color: '#b45309', fontSize: 14 },
  button: {
    backgroundColor: '#01696f',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
