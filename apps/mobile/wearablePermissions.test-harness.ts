/**
 * Task 7 — Health Connect Permissions Flow: test harness without real device.
 *
 * Validates the WearablePermissionsAdapter contract by injecting a
 * configurable mock in place of `react-native-health-connect`, allowing
 * permission flow logic to be exercised in CI / Node without an Android device.
 *
 * Run via: npx ts-node apps/mobile/wearablePermissions.test-harness.ts
 */

import type { WearablePermissionsAdapter, WearablePermissionStatus } from './wearablePermissions';
import { GARMIN_READ_PERMISSIONS } from './wearablePermissions';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

// ---------------------------------------------------------------------------
// Mock Health Connect SDK
// ---------------------------------------------------------------------------

interface MockHCConfig {
  /** false → initialize() returns false (HC not installed) */
  installed: boolean;
  /** Which recordTypes are pre-granted before any request */
  preGranted: string[];
  /** Which recordTypes getGrantedPermissions returns after requestPermission */
  postGranted: string[];
}

function buildMockAdapter(config: MockHCConfig): WearablePermissionsAdapter {
  let grantedSet = new Set(config.preGranted);

  return {
    check: async (): Promise<WearablePermissionStatus> => {
      if (!config.installed) return 'unavailable';
      const allGranted = GARMIN_READ_PERMISSIONS.every((p) => grantedSet.has(p.recordType));
      return allGranted ? 'granted' : 'denied';
    },
    request: async (): Promise<WearablePermissionStatus> => {
      if (!config.installed) return 'unavailable';
      grantedSet = new Set(config.postGranted);
      const allGranted = GARMIN_READ_PERMISSIONS.every((p) => grantedSet.has(p.recordType));
      return allGranted ? 'granted' : 'denied';
    },
  };
}

// ---------------------------------------------------------------------------
// Test scenarios
// ---------------------------------------------------------------------------

async function scenario_healthConnectNotInstalled(): Promise<void> {
  const adapter = buildMockAdapter({ installed: false, preGranted: [], postGranted: [] });
  assert((await adapter.check()) === 'unavailable', 'check → unavailable when HC not installed');
  assert((await adapter.request()) === 'unavailable', 'request → unavailable when HC not installed');
  console.log('  ✓ HC not installed → unavailable');
}

async function scenario_allPermissionsAlreadyGranted(): Promise<void> {
  const allTypes = GARMIN_READ_PERMISSIONS.map((p) => p.recordType);
  const adapter = buildMockAdapter({ installed: true, preGranted: allTypes, postGranted: allTypes });
  assert((await adapter.check()) === 'granted', 'check → granted when all permissions pre-granted');
  console.log('  ✓ All permissions pre-granted → granted');
}

async function scenario_partialGrantBecomesFullAfterRequest(): Promise<void> {
  const allTypes = GARMIN_READ_PERMISSIONS.map((p) => p.recordType);
  const adapter = buildMockAdapter({
    installed: true,
    preGranted: ['Steps'],              // only Steps granted initially
    postGranted: allTypes,              // user grants all on request dialog
  });
  assert((await adapter.check()) === 'denied', 'check → denied with partial grant');
  assert((await adapter.request()) === 'granted', 'request → granted after user accepts all');
  console.log('  ✓ Partial grant → denied; after request → granted');
}

async function scenario_userDeniesRequest(): Promise<void> {
  const adapter = buildMockAdapter({
    installed: true,
    preGranted: [],
    postGranted: ['Steps'],             // user only grants Steps, denies the rest
  });
  assert((await adapter.check()) === 'denied', 'check → denied with no grants');
  assert((await adapter.request()) === 'denied', 'request → denied when user partially accepts');
  console.log('  ✓ User denies partial → denied');
}

async function runPermissionsTestHarness(): Promise<void> {
  console.log('[wearablePermissions.test-harness] Running scenarios...');
  await scenario_healthConnectNotInstalled();
  await scenario_allPermissionsAlreadyGranted();
  await scenario_partialGrantBecomesFullAfterRequest();
  await scenario_userDeniesRequest();
  console.log('[wearablePermissions.test-harness] All scenarios passed.');
}

runPermissionsTestHarness().catch((err) => {
  console.error(err);
  process.exit(1);
});
