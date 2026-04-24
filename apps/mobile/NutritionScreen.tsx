import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { estimateNutritionFromMockInput, type NutritionEstimate, type NutritionInputKind } from '../../packages/domain/nutritionEstimate.ts';

export default function NutritionScreen(): React.JSX.Element {
  const [inputKind, setInputKind] = useState<NutritionInputKind | null>(null);
  const [mealText, setMealText] = useState('');
  const [imageSelected, setImageSelected] = useState(false);

  const detailLevel = mealText.trim().length > 80 ? 'detailed' : 'basic';
  const estimate = useMemo<NutritionEstimate | null>(() => {
    if (!inputKind) return null;
    return estimateNutritionFromMockInput(
      inputKind === 'image' && mealText.trim().length > 0 ? 'image_and_text' : inputKind,
      detailLevel,
    );
  }, [detailLevel, inputKind, mealText]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Nutrition</Text>
      {!inputKind ? (
        <Text style={styles.body}>
          Add a meal photo or describe what you ate to create an approximate nutrition estimate.
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable onPress={() => { setInputKind('image'); setImageSelected(true); }} style={styles.button}>
          <Text style={styles.buttonText}>Upload Meal Picture</Text>
        </Pressable>
        <Pressable onPress={() => setInputKind('text')} style={styles.buttonSecondary}>
          <Text style={styles.buttonSecondaryText}>Describe Meal</Text>
        </Pressable>
      </View>

      {imageSelected ? (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Image preview</Text>
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>Meal image placeholder</Text>
          </View>
        </View>
      ) : null}

      <TextInput
        multiline
        placeholder="Describe what you ate as precisely as possible. Include portion size, ingredients, cooking method, sauces, drinks, and anything added after cooking."
        placeholderTextColor="#94a3b8"
        style={styles.textInput}
        value={mealText}
        onChangeText={(value) => {
          setMealText(value);
          if (!inputKind) setInputKind('text');
        }}
      />

      {estimate ? (
        <View style={styles.results}>
          <Text style={styles.sectionLabel}>Estimated nutrition</Text>
          <Text style={styles.resultText}>
            Calories: {estimate.estimatedCaloriesRange?.min ?? 0}–{estimate.estimatedCaloriesRange?.max ?? 0} kcal
          </Text>
          <Text style={styles.resultText}>
            Protein: {estimate.estimatedMacros?.protein ?? 'unknown'} · Carbs: {estimate.estimatedMacros?.carbs ?? 'unknown'} · Fat: {estimate.estimatedMacros?.fat ?? 'unknown'}
          </Text>
          <Text style={styles.sectionLabel}>Estimate confidence</Text>
          <Text style={styles.resultText}>{estimate.estimateConfidencePercent}%</Text>
          <Text style={styles.sectionLabel}>Why this is uncertain</Text>
          {estimate.missingDetails.map((line) => (
            <Text key={line} style={styles.bullet}>- {line}</Text>
          ))}
          <Text style={styles.sectionLabel}>How to improve this estimate</Text>
          {estimate.improvementTips.map((line) => (
            <Text key={line} style={styles.bullet}>- {line}</Text>
          ))}
          <Text style={styles.disclaimer}>{estimate.disclaimer}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  title: { color: '#152033', fontSize: 18, fontWeight: '800' },
  body: { color: '#52607a', fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  button: {
    backgroundColor: '#4263eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  buttonSecondary: {
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonSecondaryText: { color: '#24324a', fontSize: 13, fontWeight: '700' },
  preview: { gap: 8 },
  previewLabel: { color: '#24324a', fontSize: 13, fontWeight: '700' },
  previewBox: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#c8d3e1',
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 120,
    justifyContent: 'center',
  },
  previewText: { color: '#52607a', fontSize: 13 },
  textInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#c8d3e1',
    borderRadius: 10,
    borderWidth: 1,
    color: '#152033',
    minHeight: 110,
    padding: 12,
    textAlignVertical: 'top',
  },
  results: {
    backgroundColor: '#f8fafc',
    borderColor: '#d9e2f2',
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  sectionLabel: { color: '#152033', fontSize: 13, fontWeight: '800' },
  resultText: { color: '#24324a', fontSize: 14, lineHeight: 20 },
  bullet: { color: '#24324a', fontSize: 13, lineHeight: 18 },
  disclaimer: { color: '#52607a', fontSize: 12, lineHeight: 17, marginTop: 4 },
});

