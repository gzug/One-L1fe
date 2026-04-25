import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useWearablePermissions } from './useWearablePermissions';

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
        <Text style={styles.title}>Health Connect not available</Text>
        <Text style={styles.subtitle}>
          This feature requires Health Connect on Android. iOS support coming soon.
        </Text>
      </View>
    );
  }

  if (status === 'denied') {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Health data access needed</Text>
        <Text style={styles.subtitle}>
          Grant access to Steps, Sleep, Heart Rate, Resting Heart Rate, HRV, Calories and Distance to enable Garmin-over-Health-Connect sync.
        </Text>
        <Pressable onPress={request} style={styles.button}>
          <Text style={styles.buttonText}>Grant access</Text>
        </Pressable>
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
  },
  title: {
    color: '#152033',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#52607a',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#4263eb',
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
