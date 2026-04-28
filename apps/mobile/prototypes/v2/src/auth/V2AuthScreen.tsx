import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getMobileSupabaseClient } from '../../../../mobileSupabaseAuth';
import { prototypeCopy } from '../data/copy';
import { useTheme } from '../theme/ThemeContext';
import { layout, lineHeights, radius, spacing, typography, type ThemeColors } from '../theme/marathonTheme';
import { upsertRegisteredProfile } from './profile';

type AuthMode = 'login' | 'register';

type V2AuthScreenProps = {
  configError?: string | null;
};

const EMPTY_REGISTER_FIELDS = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  repeatPassword: '',
};

export function V2AuthScreen({ configError = null }: V2AuthScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerFields, setRegisterFields] = useState(EMPTY_REGISTER_FIELDS);
  const [message, setMessage] = useState<string | null>(configError);
  const [busy, setBusy] = useState(false);

  const isRegistering = mode === 'register';

  function switchMode(nextMode: AuthMode) {
    if (busy) return;
    setMode(nextMode);
    setMessage(configError);
  }

  function updateRegisterField(key: keyof typeof EMPTY_REGISTER_FIELDS, value: string) {
    setRegisterFields((current) => ({ ...current, [key]: value }));
  }

  function requireValue(value: string, label: string): string | null {
    return value.trim() ? null : `${label} is required.`;
  }

  function getClientOrMessage() {
    try {
      return { client: getMobileSupabaseClient(), error: null };
    } catch (error) {
      return {
        client: null,
        error: error instanceof Error ? error.message : 'Supabase client config invalid.',
      };
    }
  }

  async function submitLogin() {
    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword;
    const validationError = requireValue(email, 'Email') ?? requireValue(password, 'Password');
    if (validationError) {
      setMessage(validationError);
      return;
    }

    const { client, error } = getClientOrMessage();
    if (!client) {
      setMessage(error);
      return;
    }

    setBusy(true);
    setMessage(null);
    const { error: signInError } = await client.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (signInError) setMessage(signInError.message);
  }

  async function submitRegistration() {
    const firstName = registerFields.firstName.trim();
    const lastName = registerFields.lastName.trim();
    const email = registerFields.email.trim().toLowerCase();
    const password = registerFields.password;
    const repeatPassword = registerFields.repeatPassword;

    const validationError =
      requireValue(firstName, 'First name') ??
      requireValue(lastName, 'Last name') ??
      requireValue(email, 'Email') ??
      requireValue(password, 'Password') ??
      requireValue(repeatPassword, 'Repeat password');

    if (validationError) {
      setMessage(validationError);
      return;
    }

    if (password !== repeatPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const { client, error } = getClientOrMessage();
    if (!client) {
      setMessage(error);
      return;
    }

    setBusy(true);
    setMessage(null);

    const { data, error: signUpError } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          display_name: `${firstName} ${lastName}`,
        },
      },
    });

    if (signUpError) {
      setBusy(false);
      setMessage(signUpError.message);
      return;
    }

    const session = data.session ?? (await client.auth.getSession()).data.session;
    const userId = session?.user.id ?? data.user?.id;

    if (!session || !userId) {
      setBusy(false);
      setMessage('Registration succeeded, but no active session was returned. Check Supabase email confirmation settings.');
      return;
    }

    try {
      await upsertRegisteredProfile(client, userId, { firstName, lastName, email });
      setRegisterFields(EMPTY_REGISTER_FIELDS);
    } catch (profileError) {
      setMessage(profileError instanceof Error ? profileError.message : 'Profile could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.brandBlock}>
              <View style={styles.brandRow}>
                <Text style={styles.brand}>{prototypeCopy.appName}</Text>
                <Text style={styles.version}>{prototypeCopy.prototypeSub}</Text>
              </View>
              <Text style={styles.subtitle}>Private live-use access</Text>
            </View>

            <View style={styles.segmentedControl}>
              <AuthModeButton active={mode === 'login'} label="Login" onPress={() => switchMode('login')} />
              <AuthModeButton active={mode === 'register'} label="Register" onPress={() => switchMode('register')} />
            </View>

            {isRegistering ? (
              <View style={styles.form}>
                <Field label="First name" value={registerFields.firstName} onChangeText={(value) => updateRegisterField('firstName', value)} autoCapitalize="words" />
                <Field label="Last name" value={registerFields.lastName} onChangeText={(value) => updateRegisterField('lastName', value)} autoCapitalize="words" />
                <Field label="Email" value={registerFields.email} onChangeText={(value) => updateRegisterField('email', value)} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
                <Field label="Password" value={registerFields.password} onChangeText={(value) => updateRegisterField('password', value)} secureTextEntry autoCapitalize="none" autoComplete="new-password" />
                <Field label="Repeat password" value={registerFields.repeatPassword} onChangeText={(value) => updateRegisterField('repeatPassword', value)} secureTextEntry autoCapitalize="none" autoComplete="new-password" />
              </View>
            ) : (
              <View style={styles.form}>
                <Field label="Email" value={loginEmail} onChangeText={setLoginEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
                <Field label="Password" value={loginPassword} onChangeText={setLoginPassword} secureTextEntry autoCapitalize="none" autoComplete="current-password" />
              </View>
            )}

            {message ? <Text style={styles.message}>{message}</Text> : null}

            <Pressable
              onPress={isRegistering ? submitRegistration : submitLogin}
              disabled={busy || Boolean(configError)}
              style={({ pressed }) => [
                styles.submitButton,
                (pressed || busy || Boolean(configError)) && styles.submitButtonMuted,
              ]}
              accessibilityRole="button"
            >
              {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>{isRegistering ? 'Create account' : 'Sign in'}</Text>}
            </Pressable>

            <Text style={styles.boundary}>{prototypeCopy.safetyNote}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  function AuthModeButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.modeButton, active && styles.modeButtonActive]}
        accessibilityRole="button"
      >
        <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{label}</Text>
      </Pressable>
    );
  }

  function Field({ label, ...inputProps }: React.ComponentProps<typeof TextInput> & { label: string }) {
    return (
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          {...inputProps}
          style={styles.input}
          placeholder={label}
          placeholderTextColor={colors.textSubtle}
        />
      </View>
    );
  }
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    keyboard: { flex: 1 },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: layout.screenPaddingH,
      paddingVertical: spacing.xxxl,
    },
    card: {
      width: '100%',
      maxWidth: layout.maxWidth,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceElevated,
      padding: spacing.xl,
      gap: spacing.lg,
    },
    brandBlock: { gap: spacing.xs },
    brandRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
    brand: {
      color: colors.text,
      fontSize: typography.heroName,
      fontWeight: '700',
      lineHeight: 30,
    },
    version: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      fontWeight: '500',
      textTransform: 'lowercase',
      opacity: 0.5,
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
    },
    segmentedControl: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      padding: 3,
      gap: 3,
      backgroundColor: colors.surface,
    },
    modeButton: {
      flex: 1,
      minHeight: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
    },
    modeButtonActive: { backgroundColor: colors.surfaceElevated },
    modeButtonText: {
      color: colors.textMuted,
      fontSize: typography.bodySmall,
      fontWeight: '700',
    },
    modeButtonTextActive: { color: colors.text },
    form: { gap: spacing.md },
    fieldWrap: { gap: spacing.xs },
    fieldLabel: {
      color: colors.textMuted,
      fontSize: typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      color: colors.text,
      backgroundColor: colors.surface,
      fontSize: typography.body,
    },
    message: {
      color: colors.danger,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
    },
    submitButton: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.lg,
    },
    submitButtonMuted: { opacity: 0.65 },
    submitText: {
      color: '#FFFFFF',
      fontSize: typography.body,
      fontWeight: '800',
    },
    boundary: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
      textAlign: 'center',
    },
  });
}
