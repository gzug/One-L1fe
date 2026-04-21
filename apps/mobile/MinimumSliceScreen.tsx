import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardTypeOptions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MinimumSliceScreenModel } from './minimumSliceScreenModel.ts';
import { MinimumSliceScreenController } from './minimumSliceScreenController.ts';
import { buildMinimumSlicePanelInputFromMobileDraft } from '../../packages/domain/minimumSliceMobileForm.ts';
import { collectRuleIdsForPanel, evaluateMinimumSlice } from '../../packages/domain/minimumSlice.ts';
import {
  createOptionalFieldMetadata,
  getOptionalFieldMetadata,
  OptionalMinimumSliceMarkerKey,
} from '../../packages/domain/minimumSliceMobileForm.ts';
import { Card, PrimaryButton, ScreenHeader, SecondaryButton } from './ui/components';
import { theme } from './ui/theme';
import { loadEvidenceAnchorsForRuleIds } from './src/data/evidenceAnchors.ts';

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
  const [anchorLoadingState, setAnchorLoadingState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [anchorError, setAnchorError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function loadAnchors(): Promise<void> {
      setAnchorLoadingState('loading');
      setAnchorError(undefined);

      try {
        const previewPanel = buildMinimumSlicePanelInputFromMobileDraft(screenState.draft, {
          profileId: 'mobile-preview',
          defaultSource: 'mobile-minimum-slice-screen',
        });
        const ruleIds = collectRuleIdsForPanel(previewPanel);
        const anchors = await loadEvidenceAnchorsForRuleIds(ruleIds);

        if (cancelled) return;

        controller.setEvidenceAnchors(anchors);
        setAnchorLoadingState(anchors.length > 0 ? 'ready' : 'empty');
      } catch (error) {
        if (cancelled) return;
        setAnchorLoadingState('error');
        setAnchorError(error instanceof Error ? error.message : 'Failed to load evidence anchors.');
        controller.setEvidenceAnchors([]);
      }
    }

    void loadAnchors();

    return () => {
      cancelled = true;
    };
  }, [controller, screenState.draft]);

  const previewEvaluation = useMemo(() => {
    if (anchorLoadingState !== 'ready') return null;
    try {
      const previewPanel = buildMinimumSlicePanelInputFromMobileDraft(screenState.draft, {
        profileId: 'mobile-preview',
        defaultSource: 'mobile-minimum-slice-screen',
      });
      return evaluateMinimumSlice(previewPanel, new Date(), screenState.evidenceAnchors);
    } catch {
      return null;
    }
  }, [anchorLoadingState, screenState.draft, screenState.evidenceAnchors]);

  const helperText = useMemo(() => {
    return [
      `Status: ${screenState.submissionSummary.status}`,
      `Coverage: ${previewEvaluation?.coverage.state ?? screenState.submissionSummary.lastResultSummary?.coverageState ?? 'n/a'}`,
      `Interpretation run: ${screenState.submissionSummary.lastResultSummary?.interpretationRunId ?? 'n/a'}`,
      `Entries: ${previewEvaluation?.entries.length ?? screenState.submissionSummary.lastResultSummary?.interpretedEntryCount ?? 'n/a'}`,
      `Recommendations: ${screenState.submissionSummary.lastResultSummary?.recommendationCount ?? 'n/a'}`,
      `Top drivers: ${renderTopDrivers(screenState)}`,
    ].join('\n');
  }, [previewEvaluation, screenState]);

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
      <ScreenHeader
        eyebrow="One L1fe"
        title="Blood panel"
        subtitle="Minimum-slice mobile seam: shared contract + hosted Supabase function."
      />

      {anchorLoadingState === 'loading' ? (
        <Card>
          <Text style={styles.sectionTitle}>Loading evidence anchors</Text>
          <Text style={styles.summary}>Resolving rule evidence links before calculating the score.</Text>
          <ActivityIndicator color={theme.colors.primary} />
        </Card>
      ) : anchorLoadingState === 'error' ? (
        <Card variant="danger">
          <Text style={styles.sectionTitle}>Evidence anchors unavailable</Text>
          <Text style={styles.errorText}>{anchorError ?? 'No evidence anchors could be loaded.'}</Text>
        </Card>
      ) : anchorLoadingState === 'empty' ? (
        <Card variant="danger">
          <Text style={styles.sectionTitle}>No evidence anchors</Text>
          <Text style={styles.errorText}>
            The current panel has no anchored rule evidence, so the score is not shown.
          </Text>
        </Card>
      ) : null}

      <Card>
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
                    <SecondaryButton
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
                    </SecondaryButton>
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
      </Card>

      <Card>
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
      </Card>

      <View style={styles.actions}>
        <PrimaryButton onPress={handleSubmit} disabled={isSubmitting || anchorLoadingState !== 'ready'}>
          {isSubmitting ? <ActivityIndicator color="#ffffff" /> : 'Submit'}
        </PrimaryButton>
        <SecondaryButton onPress={handleReset}>Reset demo draft</SecondaryButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: theme.colors.textLabel,
    ...theme.text.label,
  },
  input: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    color: theme.colors.text,
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
    minHeight: 36,
    borderRadius: theme.radius.pill,
    borderWidth: 0,
    paddingHorizontal: 12,
  },
  optionChipActive: {
    backgroundColor: theme.colors.primary,
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
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: theme.colors.text,
    ...theme.text.sectionTitle,
  },
  summary: {
    color: theme.colors.textLabel,
    fontSize: 14,
    lineHeight: 21,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
});
