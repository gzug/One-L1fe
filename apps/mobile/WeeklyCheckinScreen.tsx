import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useWeeklyCheckin, WeeklyCheckinPayload } from './useWeeklyCheckin';

export default function WeeklyCheckinScreen() {
  const { isSubmitting, error, success, submitCheckin } = useWeeklyCheckin();

  const [form, setForm] = useState<WeeklyCheckinPayload>({
    week_date: new Date().toISOString().slice(0, 10),
    exercise_score: 5,
    sleep_score: 5,
    nutrition_score: 5,
    emotional_health_score: 5,
    bottleneck: '',
    biggest_risk: '',
    intended_action: '',
  });

  const handleScoreChange = (field: keyof WeeklyCheckinPayload, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      setForm((prev) => ({ ...prev, [field]: num }));
    } else if (value === '') {
      // Temporarily allow empty string for typing
      setForm((prev) => ({ ...prev, [field]: 0 }));
    }
  };

  const handleTextChange = (field: keyof WeeklyCheckinPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    await submitCheckin(form);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Weekly Check-in</Text>
      <Text style={styles.subtitle}>Self-report your context to improve interpretation accuracy.</Text>

      {success && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✅ Check-in saved for {form.week_date}!</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Scores (0-10)</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Exercise & Movement</Text>
          <TextInput
            style={styles.scoreInput}
            keyboardType="number-pad"
            value={String(form.exercise_score)}
            onChangeText={(val) => handleScoreChange('exercise_score', val)}
            maxLength={2}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Sleep Quality</Text>
          <TextInput
            style={styles.scoreInput}
            keyboardType="number-pad"
            value={String(form.sleep_score)}
            onChangeText={(val) => handleScoreChange('sleep_score', val)}
            maxLength={2}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Nutrition Alignment</Text>
          <TextInput
            style={styles.scoreInput}
            keyboardType="number-pad"
            value={String(form.nutrition_score)}
            onChangeText={(val) => handleScoreChange('nutrition_score', val)}
            maxLength={2}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Emotional Health / Stress</Text>
          <TextInput
            style={styles.scoreInput}
            keyboardType="number-pad"
            value={String(form.emotional_health_score)}
            onChangeText={(val) => handleScoreChange('emotional_health_score', val)}
            maxLength={2}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Context & Friction</Text>

        <Text style={styles.label}>What is your biggest bottleneck?</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="e.g. Work travel disrupted my routine..."
          value={form.bottleneck}
          onChangeText={(val) => handleTextChange('bottleneck', val)}
        />

        <Text style={styles.label}>What is the biggest risk next week?</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="e.g. Coming down with a cold..."
          value={form.biggest_risk}
          onChangeText={(val) => handleTextChange('biggest_risk', val)}
        />

        <Text style={styles.label}>Intended Action</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="e.g. Prioritize 8 hours in bed..."
          value={form.intended_action}
          onChangeText={(val) => handleTextChange('intended_action', val)}
        />
      </View>

      <Pressable
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Submit Check-in</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7fb' },
  content: { padding: 20, gap: 16, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: '700', color: '#152033' },
  subtitle: { fontSize: 15, color: '#52607a', marginBottom: 8 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderColor: '#d9e2f2',
    borderWidth: 1,
    gap: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#152033', marginBottom: 4 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '600', color: '#24324a' },
  scoreInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#c8d3e1',
    borderWidth: 1,
    borderRadius: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 8,
    color: '#152033',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#c8d3e1',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
    padding: 12,
    fontSize: 15,
    color: '#152033',
    marginTop: -8,
  },
  successBanner: { backgroundColor: '#d4edda', padding: 12, borderRadius: 8 },
  successText: { color: '#1a5c2a', fontWeight: '600' },
  errorBanner: { backgroundColor: '#fdecea', padding: 12, borderRadius: 8 },
  errorText: { color: '#8b1a1a', fontWeight: '600' },
  button: {
    backgroundColor: '#4263eb',
    borderRadius: 12,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#8ea1f0' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
