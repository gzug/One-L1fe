import React from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from './theme';

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }): React.JSX.Element {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({
  children,
  variant = 'default',
  style,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'danger';
  style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  return (
    <View
      style={[
        styles.card,
        variant === 'danger' ? styles.cardDanger : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}): React.JSX.Element {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  children,
  onPress,
  disabled,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryButton, disabled ? styles.buttonDisabled : null, style]}
    >
      {typeof children === 'string' ? (
        <Text style={styles.primaryButtonText}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  children,
  onPress,
  disabled,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.secondaryButton, disabled ? styles.buttonDisabled : null, style]}
    >
      {typeof children === 'string' ? (
        <Text style={styles.secondaryButtonText}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  header: { gap: theme.spacing.xs, marginBottom: 4 },
  eyebrow: { color: theme.colors.primary, ...theme.text.eyebrow },
  title: { color: theme.colors.text, ...theme.text.title },
  subtitle: { color: theme.colors.textMuted, ...theme.text.body },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: 12,
    padding: theme.spacing.md,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#0b1220',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        }
      : { elevation: 1 }),
  },
  cardDanger: {
    borderColor: theme.colors.dangerBorder,
    backgroundColor: theme.colors.dangerSurface,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#ffffff', ...theme.text.button },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    minHeight: 52,
    justifyContent: 'center',
  },
  secondaryButtonText: { color: theme.colors.textLabel, fontSize: 16, fontWeight: '600' as const },
  buttonDisabled: { opacity: 0.5 },
});

