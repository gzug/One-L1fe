import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardTypeOptions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MinimumSliceScreenModel } from './minimumSliceScreenModel.ts';
import { MinimumSliceScreenController } from './minimumSliceScreenController.ts';
import {
  createOptionalFieldMetadata,
  getOptionalFieldMetadata,
  OptionalMinimumSliceMarkerKey,
} from '../../packages/domain/minimumSliceMobileForm.ts';

const FIELD_ORDER = [
  { key: 'panelId', label: 'Panel ID', keyboardType: 'default' },
  { key: 'collectedAt', label: 'Collected at (ISO)', keyboardType: 'default' },
  { key: 'apob', label: 'ApoB', keyboardType: 'numeric' },
  { key: 'ldl', label: 'LDL-C', keyboardType: 'numeric' },
  { key: 'hba1c', label: 'HbA1c', keyboardType: 'numeric' },
  { key: 'glucose', label: 'Glucose', keyboardType: 'numeric' },
  { key: 'lpa', label: 'Lp(a)', keyboardType: 'numeric' },
  { key: 'crp', label: 'CRP', keyboardType: 'numeric' },
  { key: 'source', label: 'Source', keyboardType: 'default' },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  keyboardType: KeyboardTypeOptions;
}>;

type FieldKey = (typeof FIELD_ORDER)[number]['key'];

function renderTopDrivers(state: MinimumSliceScreenModel): string {
  const topDrivers = state.submissionSummary.lastResultSummary?.topDrivers;
  return topDrivers !== undefined && topDrivers.length > 0
    ? topDrivers.join(', ')
    : 'none';
}

function getOptionalMarkerState(state: MinimumSliceScreenModel, marker: OptionalMinimumSliceMarkerKey): 'provided' | 'missing' | 'disabled' {
  const meta = getOptionalFieldMetadata(state.draft, marker);
  if (meta?.fieldState === 'disabled') return 'disabled';
  if (meta?.fieldState === 'provided') return 'provided';
  return 'missing';
}

interface MinimumSliceScreenProps {
  controller: MinimumSliceScreenController;
}

export default function MinimumSliceScreen({
  controller,
}: MinimumSliceScreenProps): React.JSX.Element {
  const [screenState, setScreenState] = useState<MinimumSliceScreenModel>(
    () => controller.reset(),
  );
  const [localError, setLocalError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const helperText = useMemo(() => {
    return [
      `Status: ${screenState.submissionSummary.status}`,
      `Coverage: ${screenState.submissionSummary.lastResultSummary?.coverageState ?? 'n/a'}`,
      `Interpretation run: ${screenState.submissionSummary.lastResultSummary?.interpretationRunId ?? 'n/a'}`,
      `Entries: ${screenState.submissionSummary.lastResultSummary?.interpretedEntryCount ?? 'n/a'}`,
      `Recommendations: ${screenState.submissionSummary.lastResultSummary?.recommendationCount ?? 'n/a'}`,
      `Priority score: ${screenState.submissionSummary.lastResultSummary?.runtimePriorityScoreValue ?? screenState.submissionSummary.lastResultSummary?.priorityScoreValue ?? 'n/a'}`,
      `Evidence class: ${screenState.submissionSummary.lastResultSummary?.runtimeEvidenceClass ?? 'n/a'}`,
      `Evidence anchors: ${screenState.submissionSummary.lastResultSummary?.runtimeEvidenceAnchorCount ?? 'n/a'}`,
      `Top drivers: ${renderTopDrivers(screenState)}`,
    ].join('\n');
  }, [screenState]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    setIsSubmitting(true);
    setLocalError(undefined);
    try {
      const nextState = await controller.submit();
      setScreenState(nextState);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : 'Unknown submission error',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [controller]);

  const handleReset = useCallback((): void => {
    setLocalError(undefined);
    setScreenState(controller.reset());
  }, [controller]);

  const handleChange = useCallback(
    (field: FieldKey, value: string): void => {
      const patch: Record<string, unknown> = { [field]: value };

      if (field === 'lpa') {
        patch.lpaMeta = createOptionalFieldMetadata('provided');
      }

      if (field === 'crp') {
        patch.crpMeta = createOptionalFieldMetadata('provided');
      }

      const nextState = controller.patchDraft(patch as Partial<MinimumSliceScreenModel['draft']>);
      setScreenState(nextState);
    },
    [controller],
  );

  const handleOptionalMarkerStateChange = useCallback(
    (marker: OptionalMinimumSliceMarkerKey, fieldState: 'provided' | 'missing' | 'disabled'): void => {
      const nextState = controller.setOptionalMarkerFieldState(marker, fieldState);
      setScreenState(nextState);
    },
    [controller],
  );

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>One L1fe</Text>
        <Text style={styles.title}>Minimum-slice</Text>
      </View>

      <View style={styles.card}>
        {FIELD_ORDER.map((field) => (
          <View key={field.key} style={styles.fieldGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              keyboardType={field.keyboardType}
              onChangeText={(value: string) => handleChange(field.key, value)}
              style={styles.input}
              value={screenState.draft[field.key]}
            />
            {(field.key === 'lpa' || field.key === 'crp') ? (
              <View style={styles.optionRow}>
                {(['provided', 'missing', 'disabled'] as const).map((stateOption) => {
                  const isActive = getOptionalMarkerState(screenState, field.key) === stateOption;
                  return (
                    <Pressable
                      key={stateOption}
                      onPress={() => handleOptionalMarkerStateChange(field.key, stateOption)}
                      style={[styles.optionChip, isActive ? styles.optionChipActive : null]}
                    >
                      <Text style={[styles.optionChipText, isActive ? styles.optionChipTextActive : null]}>
                        {stateOption === 'provided'
                          ? 'Active'
                          : stateOption === 'missing'
                            ? 'Missing'
                            : 'Not provided'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
            {(field.key === 'lpa' || field.key === 'crp') && getOptionalMarkerState(screenState, field.key) !== 'provided' ? (
              <Text style={styles.fieldHint}>
                {getOptionalMarkerState(screenState, field.key) === 'disabled'
                  ? `${field.label} is intentionally excluded from use.`
                  : `${field.label} is currently unavailable and should not break calculations.`}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Submission summary</Text>
        <Text style={styles.summary}>{helperText}</Text>
        {screenState.submissionSummary.lastError !== undefined ? (
          <Text style={styles.errorText}>
            {screenState.submissionSummary.lastError}
          </Text>
        ) : null}
        {localError !== undefined ? (
          <Text style={styles.errorText}>{localError}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleSubmit}
          style={styles.primaryButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Submit</Text>
          )}
        </Pressable>
        <Pressable onPress={handleReset} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Reset demo draft</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  container: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 6,
    marginBottom: 4,
  },
  eyebrow: {
    color: '#4263eb',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#152033',
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: '#24324a',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#c8d3e1',
    borderRadius: 10,
    borderWidth: 1,
    color: '#152033',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  optionChip: {
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  optionChipActive: {
    backgroundColor: '#4263eb',
    borderColor: '#4263eb',
  },
  optionChipText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  optionChipTextActive: {
    color: '#ffffff',
  },
  fieldHint: {
    color: '#52607a',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: '#152033',
    fontSize: 18,
    fontWeight: '700',
  },
  summary: {
    color: '#24324a',
    fontSize: 14,
    lineHeight: 21,
  },
  errorText: {
    color: '#b42318',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#4263eb',
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#c8d3e1',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 52,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#24324a',
    fontSize: 16,
    fontWeight: '600',
  },
});
