import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { OneL1feV2Screen } from './prototypes/v2/src/OneL1feV2Screen';

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
      <OneL1feV2Screen />
    </>
  );
}
