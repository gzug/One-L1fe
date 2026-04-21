import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TrendSkeleton } from '../../../../packages/domain/scoring.ts';

interface TrendSectionReadOnlyProps {
  trendSkeleton: TrendSkeleton | null | undefined;
  onPress?: () => void;
}

function renderPoints(samples: TrendSkeleton['samples']): string {
  return samples.map((sample) => sample.value.toFixed(0)).join(' · ');
}

export default function TrendSectionReadOnly({
  trendSkeleton,
  onPress,
}: TrendSectionReadOnlyProps): React.JSX.Element | null {
  if (trendSkeleton === null || trendSkeleton === undefined) {
    return null;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <Text style={styles.title}>Trend (preview, does not affect score)</Text>
      <Text style={styles.caption}>
        Read-only in v1. Tapping explains why the score is not coupled to trend data yet.
      </Text>
      <View style={styles.sparkline}>
        <Text style={styles.sparklineText} accessibilityLabel={`Trend values ${renderPoints(trendSkeleton.samples)}`}>
          {renderPoints(trendSkeleton.samples)}
        </Text>
      </View>
      {trendSkeleton.sparse ? (
        <Text style={styles.warning}>Sparse data. Preview only.</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  title: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  caption: {
    color: '#64748b',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  sparkline: {
    backgroundColor: '#eef2f7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sparklineText: {
    color: '#64748b',
    fontSize: 12,
    letterSpacing: 1.1,
  },
  warning: {
    color: '#b45309',
    fontSize: 12,
    fontWeight: '600',
  },
});
