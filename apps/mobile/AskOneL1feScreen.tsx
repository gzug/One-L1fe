import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  buildAskOneL1feAnswer,
} from '../../packages/domain/askOneL1fe.ts';
import type { AskOneL1feAnswer } from '../../packages/domain/askOneL1fe.ts';
import { createSyntheticDemoAskOneL1feContext } from '../../packages/domain/syntheticDemoData.ts';
import { colors, radius, shadow, spacing, touchTarget, type } from './src/theme/tokens.ts';

interface AskOneL1feScreenProps {
  initialQuestion?: string;
}

export default function AskOneL1feScreen({ initialQuestion = '' }: AskOneL1feScreenProps): React.JSX.Element {
  const [question, setQuestion] = useState(initialQuestion);
  const [submittedQuestion, setSubmittedQuestion] = useState(initialQuestion);

  const context = useMemo(() => createSyntheticDemoAskOneL1feContext(), []);
  const answer = useMemo(
    () => buildAskOneL1feAnswer(submittedQuestion, context),
    [context, submittedQuestion],
  );

  return (
    <View style={styles.stack}>
      <View style={styles.card}>
        <Text style={styles.title}>Ask One L1fe</Text>
        <Text style={styles.body}>
          Ask a question about the synthetic 90-day presentation data. V1 answers are source-gated and will not invent missing health data.
        </Text>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask about your health data..."
          multiline
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />
        <Pressable onPress={() => setSubmittedQuestion(question)} style={styles.button}>
          <Text style={styles.buttonText}>Ask</Text>
        </Pressable>
      </View>

      <AnswerCard answer={answer} />
    </View>
  );
}

function AnswerCard({ answer }: { answer: AskOneL1feAnswer }): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Answer</Text>
      <Text style={styles.body} selectable>
        {answer.answer}
      </Text>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>Estimate confidence</Text>
        <Text style={styles.metricValue}>{answer.estimateConfidencePercent}%</Text>
      </View>
      <Text style={styles.sectionTitle}>Sources used</Text>
      {answer.sourcesUsed.length > 0 ? (
        answer.sourcesUsed.map((source) => (
          <View key={source.id} style={styles.sourceRow}>
            <Text style={styles.sourceTitle}>{source.title}</Text>
            <Text style={styles.sourceMeta}>
              {source.kind} | {source.status} | {source.updatedAt ?? 'No date yet'}
            </Text>
            <Text style={styles.sourceSummary}>{source.summary}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.body}>No sources were used.</Text>
      )}

      <Text style={styles.sectionTitle}>Missing data</Text>
      {answer.missingData.map((item) => (
        <Text key={item} style={styles.bullet}>
          - {item}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>Boundaries</Text>
      {answer.safetyNotes.map((note) => (
        <Text key={note} style={styles.bullet}>
          - {note}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadow.card,
  },
  title: {
    color: colors.textPrimary,
    fontSize: type.size.greetingLine,
    fontWeight: type.weight.semibold,
    lineHeight: 30,
  },
  sectionTitle: {
    color: colors.warmCoral,
    fontSize: type.size.disclaimer,
    fontWeight: type.weight.semibold,
    textTransform: 'uppercase',
  },
  body: {
    color: colors.textSecondary,
    fontSize: type.size.body,
    lineHeight: 21,
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.input,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: type.size.body,
    minHeight: 86,
    padding: spacing.lg,
    textAlignVertical: 'top',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.warmCoral,
    borderRadius: radius.pill,
    minHeight: touchTarget.preferred,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: type.size.body,
    fontWeight: type.weight.semibold,
  },
  metricRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.chip,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: type.size.disclaimer,
    fontWeight: type.weight.semibold,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: type.size.cardTitle,
    fontWeight: type.weight.semibold,
  },
  sourceRow: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.chip,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  sourceTitle: {
    color: colors.textPrimary,
    fontSize: type.size.body,
    fontWeight: type.weight.semibold,
  },
  sourceMeta: {
    color: colors.textMuted,
    fontSize: type.size.disclaimer,
    lineHeight: 17,
  },
  sourceSummary: {
    color: colors.textSecondary,
    fontSize: type.size.meta,
    lineHeight: 18,
  },
  bullet: {
    color: colors.textSecondary,
    fontSize: type.size.meta,
    lineHeight: 19,
  },
});
