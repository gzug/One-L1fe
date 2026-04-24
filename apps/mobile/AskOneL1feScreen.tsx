import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  buildAskOneL1feAnswer,
} from '../../packages/domain/askOneL1fe.ts';
import type { AskOneL1feAnswer } from '../../packages/domain/askOneL1fe.ts';
import { createSyntheticDemoAskOneL1feContext } from '../../packages/domain/syntheticDemoData.ts';

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
          placeholderTextColor="#6b7280"
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
  stack: { gap: 14 },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  title: { color: '#152033', fontSize: 20, fontWeight: '800' },
  sectionTitle: { color: '#152033', fontSize: 15, fontWeight: '800' },
  body: { color: '#24324a', fontSize: 14, lineHeight: 20 },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#c8d3e1',
    borderRadius: 8,
    borderWidth: 1,
    color: '#152033',
    fontSize: 15,
    minHeight: 86,
    padding: 12,
    textAlignVertical: 'top',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#4263eb',
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  metricRow: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  metricLabel: { color: '#52607a', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  metricValue: { color: '#152033', fontSize: 16, fontWeight: '800' },
  sourceRow: {
    backgroundColor: '#f8fafc',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  sourceTitle: { color: '#152033', fontSize: 14, fontWeight: '800' },
  sourceMeta: { color: '#52607a', fontSize: 12, lineHeight: 17 },
  sourceSummary: { color: '#24324a', fontSize: 13, lineHeight: 18 },
  bullet: { color: '#24324a', fontSize: 13, lineHeight: 19 },
});
