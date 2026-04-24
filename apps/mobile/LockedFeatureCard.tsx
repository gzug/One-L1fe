import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LockedFeatureCardProps {
  title: string;
  description?: string;
  compact?: boolean;
}

export default function LockedFeatureCard({
  title,
  description,
  compact = false,
}: LockedFeatureCardProps): React.JSX.Element {
  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Locked</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>
        {description ?? 'Planned for a later private V1 increment.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  compactCard: {
    minHeight: 126,
    width: 184,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#4263eb',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#152033',
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    color: '#52607a',
    fontSize: 13,
    lineHeight: 18,
  },
});
