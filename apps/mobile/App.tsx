import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MinimumSliceScreenModel } from './minimumSliceScreenModel.ts';
import { createMinimumSliceScreenController } from './minimumSliceScreenController.ts';
import { getOneL1feSupabaseUrl, ONE_L1FE_SUPABASE_PROJECT_REF } from './minimumSliceHostedConfig.ts';
import { createMobileSupabaseAuthSessionProvider, getMobileSupabaseClient } from './mobileSupabaseAuth.ts';
import LoginScreen from './LoginScreen.tsx';

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
] as const;

type FieldKey = (typeof FIELD_ORDER)[number]['key'];


const controller = createMinimumSliceScreenController({
  authSessionProvider: createMobileSupabaseAuthSessionProvider(),
    supabaseUrl: process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL ?? getOneL1feSupabaseUrl(ONE_L1FE_SUPABASE_PROJECT_REF),
    functionPath: process.env.EXPO_PUBLIC_ONE_L1FE_FUNCTION_PATH,
});

function renderTopDrivers(state: MinimumSliceScreenModel): string {
  const topDrivers = state.submissionSummary.lastResultSummary?.topDrivers;
  return topDrivers !== undefined && topDrivers.length > 0 ? topDrivers.join(', ') : 'none';
}

type AuthState = 'loading' | 'signed-out' | 'signed-in';

export default function App(): React.JSX.Element {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [screenState, setScreenState] = useState<MinimumSliceScreenModel>(() => controller.reset());
  const [localError, setLocalError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const client = getMobileSupabaseClient();

    client.auth.getSession().then(({ data }) => {
      setAuthState(data.session !== null ? 'signed-in' : 'signed-out');
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setAuthState(session !== null ? 'signed-in' : 'signed-out');
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignedIn = useCallback(() => {
    setAuthState('signed-in');
  }, []);

  const helperText = useMemo(() => {
    return [
      `Status: ${screenState.submissionSummary.status}`,
      `Coverage: ${screenState.submissionSummary.lastResultSummary?.coverageState ?? 'n/a'}`,
      `Interpretation run: ${screenState.submissionSummary.lastResultSummary?.interpretationRunId ?? 'n/a'}`,
      `Entries: ${screenState.submissionSummary.lastResultSummary?.interpretedEntryCount ?? 'n/a'}`,
      `Recommendations: ${screenState.submissionSummary.lastResultSummary?.recommendationCount ?? 'n/a'}`,
      `Top drivers: ${renderTopDrivers(screenState)}`,
    ].join('\n');
  }, [screenState]);

  async function handleSubmit(): Promise<void> {
    setIsSubmitting(true);
    setLocalError(undefined);

    try {
      const nextState = await controller.submit();
      setScreenState(nextState);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Unknown submission error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset(): void {
    setLocalError(undefined);
    setScreenState(controller.reset());
  }

  function handleChange(field: FieldKey, value: string): void {
    const nextState = controller.patchDraft({ [field]: value });
    setScreenState(nextState);
  }

  if (authState === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color="#4263eb" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (authState === 'signed-out') {
    return <LoginScreen onSignedIn={handleSignedIn} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>One L1fe</Text>
          <Text style={styles.title}>Minimum-slice mobile seam</Text>
          <Text style={styles.subtitle}>
            Thin Expo screen, shared domain contract, hosted Supabase function.
          </Text>
        </View>

        <View style={styles.card}>
          {FIELD_ORDER.map((field) => (
            <View key={field.key} style={styles.fieldGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType={field.keyboardType}
                onChangeText={(value) => handleChange(field.key, value)}
                style={styles.input}
                value={screenState.draft[field.key]}
              />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Submission summary</Text>
          <Text style={styles.summary}>{helperText}</Text>
          {screenState.submissionSummary.lastError !== undefined ? (
            <Text style={styles.errorText}>{screenState.submissionSummary.lastError}</Text>
          ) : null}
          {localError !== undefined ? <Text style={styles.errorText}>{localError}</Text> : null}
        </View>

        <View style={styles.actions}>
          <Pressable disabled={isSubmitting} onPress={handleSubmit} style={styles.primaryButton}>
            {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Submit</Text>}
          </Pressable>
          <Pressable disabled={isSubmitting} onPress={handleReset} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Reset demo draft</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  subtitle: {
    color: '#52607a',
    fontSize: 15,
    lineHeight: 21,
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
