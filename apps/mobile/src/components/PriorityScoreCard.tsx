import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PriorityScoreResult } from '../../../../packages/domain/scoring.ts';

type PillarKey = keyof PriorityScoreResult['pillarScores'];

export type PriorityScoreCardData = Omit<PriorityScoreResult, 'rawScore'> & {
  rawValue: number;
};

interface PriorityScoreCardProps {
  result: PriorityScoreCardData;
  onPress?: () => void;
  onEvidencePress?: () => void;
}

const PILLAR_LABELS: Record<PillarKey, string> = {
  cardiovascular: 'Cardiovascular',
  metabolic: 'Metabolic',
  inflammation: 'Inflammation',
  nutrientContext: 'Nutrient context',
};

function getPillarTone(bucket: number): string {
  if (bucket >= 4) return '#b42318';
  if (bucket === 3) return '#d97706';
  if (bucket === 2) return '#ca8a04';
  if (bucket === 1) return '#2563eb';
  return '#475569';
}

function getPillarBackground(bucket: number): string {
  if (bucket >= 4) return '#fee4e2';
  if (bucket === 3) return '#ffedd5';
  if (bucket === 2) return '#fef3c7';
  if (bucket === 1) return '#dbeafe';
  return '#e2e8f0';
}

export default function PriorityScoreCard({
  result,
  onPress,
  onEvidencePress,
}: PriorityScoreCardProps): React.JSX.Element {
  const warning = result.bucket === 0 && result.evidenceClass === 'unanchored';

  return (
    <View style={styles.shell}>
      {warning ? (
        <Pressable accessibilityRole="button" onPress={onEvidencePress} style={styles.warningBanner}>
          <Text style={styles.warningText}>No evidence anchors - score suppressed. Tap to learn why.</Text>
        </Pressable>
      ) : null}

      <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
        <View style={styles.row}>
          <View style={styles.bucketBlock}>
            <Text style={styles.label}>Priority Level</Text>
            <Text accessibilityLabel={`Priority level ${result.bucket} out of 4`} style={styles.bucketValue}>
              {result.bucket}
            </Text>
            <Text style={styles.bucketCaption}>0 = all clear, 4 = act now</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onEvidencePress} style={styles.badge}>
            <Text style={styles.badgeText}>{result.evidenceClass}</Text>
          </Pressable>
        </View>

        <View style={styles.pillarRow}>
          {(Object.entries(result.pillarScores) as Array<[PillarKey, PriorityScoreResult['pillarScores'][PillarKey]]>).map(
            ([pillarKey, score]) => (
              <View
                key={pillarKey}
                style={[
                  styles.pillarChip,
                  { backgroundColor: getPillarBackground(score.bucket), borderColor: getPillarTone(score.bucket) },
                ]}
              >
                <Text style={[styles.pillarTitle, { color: getPillarTone(score.bucket) }]}>
                  {PILLAR_LABELS[pillarKey]}
                </Text>
                <Text style={[styles.pillarValue, { color: getPillarTone(score.bucket) }]}>
                  {score.bucket}
                </Text>
              </View>
            ),
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  warningBanner: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  warningText: {
    color: '#9a3412',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  bucketBlock: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: '#52607a',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bucketValue: {
    color: '#152033',
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 60,
  },
  bucketCaption: {
    color: '#52607a',
    fontSize: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#152033',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  pillarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pillarChip: {
    borderRadius: 16,
    borderWidth: 1,
    minWidth: '47%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pillarTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  pillarValue: {
    fontSize: 20,
    fontWeight: '800',
  },
});
