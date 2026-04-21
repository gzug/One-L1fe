import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, ScreenHeader } from './ui/components';
import { theme } from './ui/theme';

type OverviewScreenProps = {
  snapshot: unknown;
};

export default function OverviewScreen({ snapshot }: OverviewScreenProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ScreenHeader
        eyebrow="One L1fe"
        title="Overview"
        subtitle="Quick landing screen while the health and minimum-slice seams are exercised."
      />
      <Card>
        <Text style={styles.body}>Latest snapshot:</Text>
        <Text style={styles.snapshot}>{snapshot === null ? 'No snapshot loaded yet.' : String(snapshot)}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: 20,
    gap: 16,
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  snapshot: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
