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
  getStatusFieldMetadata,
  MinimumSliceStatusMarkerKey,
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
  { key: 'b12', label: 'B12', keyboardType: 'numeric' },
  { key: 'magnesium', label: 'Magnesium', keyboardType: 'numeric' },
  { key: 'source', label: 'Source', keyboardType: 'default' },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  keyboardType: KeyboardTypeOptions;
}>;

const FIELD_STATUS_HELPER_TEXT =
  'Choose how each data point should be handled.\n\nActive values are used in calculations.\nMissing values may reduce score precision.\nNot provided values are intentionally excluded and do not affect your score.';

type FieldKey = (typeof FIELD_ORDER)[number]['key'];

function renderTopDrivers(state: MinimumSliceScreenModel): string {
  const topDrivers = state.submissionSummary.lastResultSummary?.topDrivers;
  return topDrivers !== undefined && topDrivers.length > 0
    ? topDrivers.join(', ')
    : 'none';
}

function getMarkerState(state: MinimumSliceScreenModel, marker: MinimumSliceStatusMarkerKey): 'provided' | 'missing' | 'disabled' {
  const meta = getStatusFieldMetadata(state.draft, marker);
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
  const [openStatusMarker, setOpenStatusMarker] = useState<MinimumSliceStatusMarkerKey | null>(null);

  const helperText = useMemo(() => {
    return [
      `Status: ${screenState.submissionSummary.status}`,
      `Coverage: ${screenState.submissionSummary.lastResultSummary?.coverageState ?? 'n/a'}`,
      `Interpretation run: ${screenState.submissionSummary.lastResultSummary?.interpretationRunId ?? 'n/a'}`,
      `Entries: ${screenState.submissionSummary.lastResultSummary?.interpretedEntryCount ?? 'n/a'}`,
      `Recommendations: ${screenState.submissionSummary.lastResultSummary?.recommendationCount ?? 'n/a'}`,
      `Priority Score: ${screenState.submissionSummary.lastResultSummary?.runtimePriorityScoreValue ?? screenState.submissionSummary.lastResultSummary?.priorityScoreValue ?? 'n/a'}`,
      `Evidence Class: ${screenState.submissionSummary.lastResultSummary?.runtimeEvidenceClass ?? screenState.submissionSummary.lastResultSummary?.productEvidenceClass ?? 'n/a'}`,
      `Evidence Anchors: ${screenState.submissionSummary.lastResultSummary?.runtimeEvidenceAnchorCount ?? screenState.submissionSummary.lastResultSummary?.anchorCount ?? 0}`,
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

      if (field === 'b12') {
        patch.b12Meta = createOptionalFieldMetadata('provided');
      }

      if (field === 'magnesium') {
        patch.magnesiumMeta = createOptionalFieldMetadata('provided');
      }

      if (field === 'apob') {
        patch.apobMeta = createOptionalFieldMetadata('provided');
      }

      if (field === 'ldl') {
        patch.ldlMeta = createOptionalFieldMetadata('provided');
      }

      if (field === 'hba1c') {
        patch.hba1cMeta = createOptionalFieldMetadata('provided');
      }

      if (field === 'glucose') {
        patch.glucoseMeta = createOptionalFieldMetadata('provided');
      }

      const nextState = controller.patchDraft(patch as Partial<MinimumSliceScreenModel['draft']>);
      setScreenState(nextState);
    },
    [controller],
  );

  const handleOptionalMarkerStateChange = useCallback(
    (marker: MinimumSliceStatusMarkerKey, fieldState: 'provided' | 'missing' | 'disabled'): void => {
      const nextState = controller.setOptionalMarkerFieldState(marker, fieldState);
      setScreenState(nextState);
      setOpenStatusMarker(null);
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
        <Text style={styles.statusHelper}>{FIELD_STATUS_HELPER_TEXT}</Text>
        {FIELD_ORDER.map((field) => (
          <View key={field.key} style={styles.fieldGroup}>
            <Text style={styles.label}>{field.label}</Text>
            {isStatusFieldKey(field.key) ? (
              <>
                <View style={styles.inputShell}>
                  <TextInput
                    editable={getMarkerState(screenState, field.key) === 'provided'}
                    keyboardType={field.keyboardType}
                    onChangeText={(value: string) => handleChange(field.key, value)}
                    placeholder={getMarkerState(screenState, field.key) === 'provided' ? undefined : 'Select a status first'}
                    placeholderTextColor="#94a3b8"
                    style={[
                      styles.input,
                      styles.inputShellValue,
                      getMarkerState(screenState, field.key) !== 'provided' && styles.inputShellValueDisabled,
                    ]}
                    value={screenState.draft[field.key]}
                  />
                  <Pressable
                    onPress={() =>
                      setOpenStatusMarker((current) =>
                        current === field.key ? null : (field.key as MinimumSliceStatusMarkerKey),
                      )
                    }
                    style={[
                      styles.modeButton,
                      openStatusMarker === field.key && styles.modeButtonActive,
                    ]}
                  >
                    <Text style={styles.modeButtonText}>
                      {renderOptionalFieldModeLabel(getMarkerState(screenState, field.key))}
                    </Text>
                  </Pressable>
                </View>
                {openStatusMarker === field.key ? (
                  <View style={styles.modeMenu}>
                    {OPTIONAL_FIELD_MODE_OPTIONS.map((option) => {
                      const isActive = getMarkerState(screenState, field.key) === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => handleOptionalMarkerStateChange(field.key as MinimumSliceStatusMarkerKey, option.value)}
                          style={[styles.modeMenuItem, isActive && styles.modeMenuItemActive]}
                        >
                          <Text style={[styles.modeMenuItemLabel, isActive && styles.modeMenuItemLabelActive]}>
                            {option.label}
                          </Text>
                          <Text style={[styles.modeMenuItemDescription, isActive && styles.modeMenuItemDescriptionActive]}>
                            {option.description}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
                {getMarkerState(screenState, field.key) !== 'provided' ? (
                  <Text style={styles.fieldHint}>
                    {getMarkerState(screenState, field.key) === 'disabled'
                      ? `${field.label} is intentionally not provided and is excluded from active use.`
                      : `${field.label} is intentionally left without a value and should not break calculations.`}
                  </Text>
                ) : null}
              </>
            ) : (
              <TextInput
                keyboardType={field.keyboardType}
                onChangeText={(value: string) => handleChange(field.key, value)}
                style={styles.input}
                value={screenState.draft[field.key]}
              />
            )}
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

      {screenState.submissionState.lastResult?.evaluation.recommendations && screenState.submissionState.lastResult.evaluation.recommendations.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Interpretation Insights</Text>
          {screenState.submissionState.lastResult.evaluation.recommendations.map((rec, i) => (
            <View key={i} style={styles.insightBox}>
              <Text style={styles.insightVerdict}>{rec.verdict}</Text>
              <Text style={styles.insightText}>{rec.text}</Text>
              <Text style={styles.insightMeta}>Type: {rec.type} • Confidence: {rec.confidence}</Text>
            </View>
          ))}
        </View>
      ) : null}

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
  inputShell: {
    alignItems: 'stretch',
    backgroundColor: '#f8fafc',
    borderColor: '#c8d3e1',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  inputShellValue: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputShellValueDisabled: {
    color: '#94a3b8',
  },
  modeButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#eef2ff',
    borderLeftColor: '#c8d3e1',
    borderLeftWidth: 1,
    justifyContent: 'center',
    minWidth: 112,
    paddingHorizontal: 12,
  },
  modeButtonActive: {
    backgroundColor: '#dbe4ff',
  },
  modeButtonText: {
    color: '#24324a',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  modeMenu: {
    backgroundColor: '#ffffff',
    borderColor: '#c8d3e1',
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
    padding: 8,
  },
  modeMenuItem: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modeMenuItemActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#4263eb',
  },
  modeMenuItemLabel: {
    color: '#152033',
    fontSize: 14,
    fontWeight: '700',
  },
  modeMenuItemLabelActive: {
    color: '#24324a',
  },
  modeMenuItemDescription: {
    color: '#52607a',
    fontSize: 12,
    lineHeight: 16,
  },
  modeMenuItemDescriptionActive: {
    color: '#334155',
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
  statusHelper: {
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
  insightBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4263eb',
  },
  insightVerdict: {
    color: '#152033',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  insightText: {
    color: '#24324a',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  insightMeta: {
    color: '#52607a',
    fontSize: 12,
  },
});

const OPTIONAL_FIELD_MODE_OPTIONS: ReadonlyArray<{
  value: 'provided' | 'missing' | 'disabled';
  label: string;
  description: string;
}> = [
  {
    value: 'provided',
    label: 'Active',
    description: 'Enter and use a numeric value for this metric.',
  },
  {
    value: 'missing',
    label: 'Missing',
    description: 'Keep it explicitly blank without breaking calculations.',
  },
  {
    value: 'disabled',
    label: 'Not provided',
    description: 'Exclude it intentionally from active use.',
  },
] as const;

function isStatusFieldKey(key: FieldKey): key is MinimumSliceStatusMarkerKey {
  return key === 'apob' || key === 'ldl' || key === 'hba1c' || key === 'glucose' || key === 'lpa' || key === 'crp' || key === 'b12' || key === 'magnesium';
}

function renderOptionalFieldModeLabel(
  fieldState: 'provided' | 'missing' | 'disabled',
): string {
  if (fieldState === 'provided') return 'Active';
  if (fieldState === 'missing') return 'Missing';
  return 'Not provided';
}
