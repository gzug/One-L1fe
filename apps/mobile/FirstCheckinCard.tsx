import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function FirstCheckinCard(): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Start here</Text>
      <Text style={styles.title}>First Check-in</Text>
      <Text style={styles.body}>
        Capture this week's sleep, movement, nutrition, stress, and main
        bottleneck before reading the rest of the app.
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
    padding: 16,
  },
  eyebrow: {
    color: '#4263eb',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#152033',
    fontSize: 22,
    fontWeight: '800',
  },
  body: {
    color: '#52607a',
    fontSize: 14,
    lineHeight: 20,
  },
});
