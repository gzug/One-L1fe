import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from './theme';

type CardProps = {
  children: React.ReactNode;
  variant?: 'default' | 'danger';
};

export function Card({ children, variant = 'default' }: CardProps): React.JSX.Element {
  return <View style={[styles.card, variant === 'danger' && styles.cardDanger]}>{children}</View>;
}

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ eyebrow, title, subtitle }: ScreenHeaderProps): React.JSX.Element {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

type ButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: object;
};

export function PrimaryButton({ children, onPress, disabled, style }: ButtonProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryButton, disabled && styles.buttonDisabled, style]}
    >
      <Text style={styles.primaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ children, onPress, disabled, style }: ButtonProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.secondaryButton, disabled && styles.buttonDisabled, style]}
    >
      <Text style={styles.secondaryButtonText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 8,
  },
  cardDanger: {
    borderColor: '#f3b4af',
    backgroundColor: '#fff8f7',
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.pill,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
