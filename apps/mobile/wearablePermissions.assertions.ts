/**
 * Task 7 — Health Connect Permissions Flow: Test-Harness
 *
 * Exercises check() / request() against an injectable WearablePermissionsAdapter
 * so the flow can be validated without a real Android device or Health Connect SDK.
 *
 * Run via: npx ts-node apps/mobile/wearablePermissions.assertions.ts
 */
import type { WearablePermissionStatus, WearablePermissionsAdapter } from './wearablePermissions';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

function makeAdapter(
  checkResult: WearablePermissionStatus,
  requestResult: WearablePermissionStatus,
): WearablePermissionsAdapter {
  return {
    check: async () => checkResult,
    request: async () => requestResult,
  };
}

async function runWearablePermissionsAssertions(): Promise<void> {
  // --- already-granted path ---
  const grantedAdapter = makeAdapter('granted', 'granted');
  const checkGranted = await grantedAdapter.check();
  assert(checkGranted === 'granted', 'check() returns granted when all permissions are held');

  // --- denied → request → granted path ---
  const deniedThenGrantedAdapter = makeAdapter('denied', 'granted');
  const checkDenied = await deniedThenGrantedAdapter.check();
  assert(checkDenied === 'denied', 'check() returns denied before request()');
  const afterRequest = await deniedThenGrantedAdapter.request();
  assert(afterRequest === 'granted', 'request() returns granted after user approval');

  // --- denied → request → still denied (user refused) ---
  const persistentlyDenied = makeAdapter('denied', 'denied');
  const requestDenied = await persistentlyDenied.request();
  assert(requestDenied === 'denied', 'request() returns denied when user refuses');

  // --- Health Connect unavailable (e.g. iOS or no HC install) ---
  const unavailableAdapter = makeAdapter('unavailable', 'unavailable');
  const checkUnavailable = await unavailableAdapter.check();
  assert(checkUnavailable === 'unavailable', 'check() returns unavailable on unsupported platform');
  const requestUnavailable = await unavailableAdapter.request();
  assert(
    requestUnavailable === 'unavailable',
    'request() returns unavailable on unsupported platform',
  );

  // --- unknown initial state (adapter not yet initialised) ---
  const unknownAdapter = makeAdapter('unknown', 'granted');
  const checkUnknown = await unknownAdapter.check();
  assert(checkUnknown === 'unknown', 'check() returns unknown when adapter is uninitialised');

  console.log('[wearablePermissions.assertions] All assertions passed.');
}

runWearablePermissionsAssertions().catch((err) => {
  console.error(err);
  process.exit(1);
});
