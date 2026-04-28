import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { PrototypeV1MarathonScreen } from './prototypes/v1-marathon/src/PrototypeV1MarathonScreen';

/**
 * Root app surface.
 *
 * Prototype V1 - Marathon is now the canonical mobile app entry.
 * The previous authenticated minimum-slice shell is intentionally removed from
 * the active path so APK builds are predictable and login-free.
 */
export default function App(): React.JSX.Element {
  return (
    <>
      <StatusBar style="auto" />
      <PrototypeV1MarathonScreen />
    </>
  );
}
