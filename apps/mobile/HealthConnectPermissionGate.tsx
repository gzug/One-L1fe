import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useWearablePermissions } from './useWearablePermissions';
import { Card, PrimaryButton, ScreenHeader } from './ui/components';
import { theme } from './ui/theme';

interface Props {
  children: React.ReactNode;
}

export default function HealthConnectPermissionGate({
  children,
}: Props): React.JSX.Element {
  const { status, request } = useWearablePermissions();

  if (status === 'unknown') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4263eb" />
      </View>
    );
  }

  if (status === 'unavailable') {
    return (
      <View style={styles.center}>
        <Card style={styles.gateCard}>
          <ScreenHeader
            eyebrow="One L1fe"
            title="Wearable sync (Android only)"
            subtitle="This screen currently uses Health Connect on Android. iOS HealthKit support is a separate slice."
          />
          <Text style={styles.subtitle}>
            If you’re testing on iPhone today, this is expected — the app will show this placeholder until an iOS adapter is added.
          </Text>
        </Card>
      </View>
    );
  }

  if (status === 'denied') {
    return (
      <View style={styles.center}>
        <Card style={styles.gateCard}>
          <ScreenHeader
            eyebrow="One L1fe"
            title="Health data access needed"
            subtitle="Grant Health Connect permissions to enable Garmin sync."
          />
          <Text style={styles.subtitle}>
            Request access to Steps, Heart Rate, Calories, Distance, and Sleep.
          </Text>
          <PrimaryButton onPress={request}>Grant access</PrimaryButton>
        </Card>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
    backgroundColor: theme.colors.bg,
  },
  gateCard: { width: '100%', maxWidth: 520 },
  subtitle: {
    color: theme.colors.textMuted,
    ...theme.text.body,
  },
});
