import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

interface SessionBarProps {
  email?: string;
  userId: string;
  onSignOut: () => Promise<void>;
}

function formatIdentity(email: string | undefined, userId: string): string {
  if (email !== undefined && email.length > 0) {
    return email;
  }

  return `user ${userId.slice(0, 8)}`;
}

export default function SessionBar({
  email,
  userId,
  onSignOut,
}: SessionBarProps): React.JSX.Element {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);
    setError(undefined);

    try {
      await onSignOut();
    } catch (signOutError) {
      setError(
        signOutError instanceof Error ? signOutError.message : 'Sign out failed.',
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.identityBlock}>
          <Text style={styles.label}>Signed in</Text>
          <Text style={styles.identity}>{formatIdentity(email, userId)}</Text>
        </View>

        <Pressable
          disabled={isSigningOut}
          onPress={handleSignOut}
          style={[styles.button, isSigningOut && styles.buttonDisabled]}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#24324a" size="small" />
          ) : (
            <Text style={styles.buttonText}>Sign out</Text>
          )}
        </Pressable>
      </View>

      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#d9e2f2',
    borderBottomWidth: 1,
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  identityBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: '#52607a',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  identity: {
    color: '#152033',
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderColor: '#c8d3e1',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 92,
    paddingHorizontal: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#24324a',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: '#b42318',
    fontSize: 13,
    lineHeight: 18,
  },
});
