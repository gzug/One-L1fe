import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, touchTarget, type } from './src/theme/tokens.ts';

export const FIRST_RUN_GUIDE_STEP_COUNT = 7;

interface FirstRunGuideStep {
  title: string;
  body: string;
}

const GUIDE_STEPS: readonly FirstRunGuideStep[] = [
  {
    title: 'One L1fe Score',
    body: 'Your One L1fe Score summarizes your current health picture. It becomes more reliable as more data is connected.',
  },
  {
    title: 'Score confidence + Data coverage',
    body: 'Score confidence shows how reliable the score is. Data coverage shows how complete your connected data is.',
  },
  {
    title: 'Dots',
    body: 'Each dot represents one health area. Tap a dot to open its insight screen.',
  },
  {
    title: 'Ask One L1fe',
    body: 'Ask questions based on your available health data.',
  },
  {
    title: 'Doctor Prep',
    body: 'Doctor Prep helps you prepare a clear summary for appointments.',
  },
  {
    title: 'Menu',
    body: 'Menu gives access to profile, settings, score details, and other tools.',
  },
  {
    title: 'First data source',
    body: 'Do you want to connect your first data source?',
  },
] as const;

interface FirstRunGuideOverlayProps {
  visible: boolean;
  stepIndex: number;
  platformSupportsHealthConnect: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onConnectData: () => void;
  onNotNow: () => void;
}

export default function FirstRunGuideOverlay({
  visible,
  stepIndex,
  platformSupportsHealthConnect,
  onBack,
  onNext,
  onSkip,
  onConnectData,
  onNotNow,
}: FirstRunGuideOverlayProps): React.JSX.Element {
  const safeStepIndex = Math.max(0, Math.min(stepIndex, GUIDE_STEPS.length - 1));
  const step = GUIDE_STEPS[safeStepIndex];
  const isFinalStep = safeStepIndex === GUIDE_STEPS.length - 1;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.stepCounter}>
              {safeStepIndex + 1} / {FIRST_RUN_GUIDE_STEP_COUNT}
            </Text>
            <Pressable onPress={onSkip} style={styles.skipButton} accessibilityLabel="Skip guide">
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>

          {isFinalStep ? (
            <View style={styles.finalStack}>
              <Pressable onPress={onConnectData} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  {platformSupportsHealthConnect ? 'Yes, connect data' : 'Yes, connect data'}
                </Text>
              </Pressable>
              <Pressable onPress={onNotNow} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Not now</Text>
              </Pressable>
              <Text style={styles.helperText}>
                {platformSupportsHealthConnect
                  ? 'Android opens Health Connect through the Activity sync path.'
                  : 'Health Connect is Android-only in this prototype. This opens the Activity sync placeholder.'}
              </Text>
            </View>
          ) : (
            <View style={styles.actionRow}>
              <Pressable
                onPress={onBack}
                disabled={safeStepIndex === 0}
                style={[styles.secondaryButton, safeStepIndex === 0 && styles.disabledButton]}
              >
                <Text style={[styles.secondaryButtonText, safeStepIndex === 0 && styles.disabledButtonText]}>
                  Back
                </Text>
              </Pressable>
              <Pressable onPress={onNext} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Next</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(23, 33, 38, 0.48)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.lg,
    maxWidth: 460,
    padding: spacing.xl,
    width: '100%',
    ...shadow.card,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepCounter: {
    color: colors.warmCoral,
    fontSize: type.size.disclaimer,
    fontWeight: type.weight.semibold,
    textTransform: 'uppercase',
  },
  skipButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: touchTarget.minimum,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  skipText: {
    color: colors.textPrimary,
    fontSize: type.size.meta,
    fontWeight: type.weight.semibold,
  },
  title: {
    color: colors.textPrimary,
    fontSize: type.size.greetingLine,
    fontWeight: type.weight.semibold,
    lineHeight: 30,
  },
  body: {
    color: colors.textSecondary,
    fontSize: type.size.body,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  finalStack: {
    gap: spacing.sm,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.warmCoral,
    borderRadius: radius.pill,
    flex: 1,
    minHeight: touchTarget.preferred,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: type.size.body,
    fontWeight: type.weight.semibold,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    minHeight: touchTarget.preferred,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: type.size.body,
    fontWeight: type.weight.semibold,
  },
  disabledButton: {
    opacity: 0.45,
  },
  disabledButtonText: {
    color: colors.textMuted,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: type.size.disclaimer,
    lineHeight: 17,
  },
});
