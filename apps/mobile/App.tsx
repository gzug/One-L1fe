import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { V2AuthGate } from './prototypes/v2/src/auth/V2AuthGate';

/**
 * Root app surface.
 *
 * One L1fe v2 is now the active mobile app entry for live private use.
 * The previous `v1-marathon` prototype remains in the repo as a snapshot.
 */
export default function App(): React.JSX.Element {
  return (
    <>
      <StatusBar style="auto" />
      <V2AuthGate />
    </>
  );
}
