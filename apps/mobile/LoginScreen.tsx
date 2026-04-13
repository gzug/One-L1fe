import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getMobileSupabaseClient } from './mobileSupabaseAuth.ts';

interface LoginScreenProps {
  onSignedIn: () => void;
}

export default function LoginScreen({ onSignedIn }: LoginScreenProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

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

      onSignedIn();
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
        <View style={styles.header}>
          <Text style={styles.eyebrow}>One L1fe</Text>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Sign in to submit your lab data.</Text>
        </View>

        <View style={styles.card}>
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
        </View>

        <Pressable
          disabled={isLoading}
          onPress={handleSignIn}
          style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign in</Text>
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 6,
    marginBottom: 8,
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
    gap: 14,
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
  errorText: {
    color: '#b42318',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#4263eb',
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
