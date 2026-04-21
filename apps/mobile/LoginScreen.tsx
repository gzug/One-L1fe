import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getMobileSupabaseClient } from './mobileSupabaseAuth.ts';
import { Card, PrimaryButton, ScreenHeader } from './ui/components';
import { theme } from './ui/theme';

interface LoginScreenProps {
  initialError?: string;
}

export default function LoginScreen({
  initialError,
}: LoginScreenProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(initialError);

  React.useEffect(() => {
    setError(initialError);
  }, [initialError]);

  async function handleSignIn(): Promise<void> {
    if (email.trim().length === 0 || password.length === 0) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const client = getMobileSupabaseClient();
      const { error: signInError } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError !== null) {
        setError(signInError.message);
        return;
      }

      // Navigation is handled automatically by useAuthSession's onAuthStateChange listener.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <ScreenHeader
          eyebrow="One L1fe"
          title="Sign in"
          subtitle="Sign in to submit your lab data."
        />

        <Card>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#8fa0bb"
              style={styles.input}
              value={email}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              onChangeText={setPassword}
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              placeholderTextColor="#8fa0bb"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          {error !== undefined ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </Card>

        <PrimaryButton onPress={handleSignIn} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#ffffff" /> : 'Sign in'}
        </PrimaryButton>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
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
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
});
