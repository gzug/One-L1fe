/**
 * Guardrail tests for getHomeDisplayData.
 * Uses Node-compatible assertions only — no new packages.
 * Run: npx ts-node --project tsconfig.json apps/mobile/prototypes/v2/src/data/__tests__/homeDataAdapter.test.ts
 */
import assert from 'node:assert/strict';
import { getHomeDisplayData } from '../homeDataAdapter';
import type { HomeDisplayData } from '../homeTypes';

const EMPTY_CUSTOM = { start: null, end: null };

function demoData(overrides: Partial<Parameters<typeof getHomeDisplayData>[0]> = {}): HomeDisplayData {
  return getHomeDisplayData({
    mode: 'demo',
    timeRange: '7d',
    customRange: EMPTY_CUSTOM,
    bloodPanels: [],
    ...overrides,
  });
}

function userData(overrides: Partial<Parameters<typeof getHomeDisplayData>[0]> = {}): HomeDisplayData {
  return getHomeDisplayData({
    mode: 'user',
    timeRange: '7d',
    customRange: EMPTY_CUSTOM,
    bloodPanels: [],
    ...overrides,
  });
}

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${(e as Error).message}`);
    failed++;
  }
}

console.log('\nhomeDataAdapter guardrails\n');

// ─── 1. Demo mode returns complete display data ───────────────────────────────
test('demo: isDemo is true', () => {
  assert.equal(demoData().isDemo, true);
});

test('demo: score.overall is a number between 0 and 100', () => {
  const score = demoData().score.overall;
  assert.ok(score !== null && score >= 0 && score <= 100, `Expected 0–100, got ${score}`);
});

test('demo: score.recovery is non-null', () => {
  assert.notEqual(demoData().score.recovery, null);
});

test('demo: score.activity is non-null', () => {
  assert.notEqual(demoData().score.activity, null);
});

test('demo: scoreTrend has 3 series', () => {
  const trend = demoData().scoreTrend;
  assert.equal(trend.isEmpty, false);
  assert.equal(trend.series.length, 3);
});

test('demo: scoreTrend series labels are Score, Recovery, Activity', () => {
  const labels = demoData().scoreTrend.series.map((s) => s.label);
  assert.deepEqual(labels, ['Score', 'Recovery', 'Activity']);
});

test('demo: recoveryMetrics.sleep has chart data', () => {
  const data = demoData().recoveryMetrics.sleep.data;
  assert.ok(data.length > 0, 'Expected non-empty sleep chart data');
});

test('demo: activityMetrics.steps has chart data', () => {
  const data = demoData().activityMetrics.steps.data;
  assert.ok(data.length > 0, 'Expected non-empty steps chart data');
});

test('demo: healthInputs has exactly 4 items', () => {
  assert.equal(demoData().healthInputs.length, 4);
});

test('demo: nutritionHub is disabled', () => {
  assert.equal(demoData().nutritionHub.disabled, true);
});

// ─── 2. User Data mode does not fake unavailable values ───────────────────────
test('user: isDemo is false', () => {
  assert.equal(userData().isDemo, false);
});

test('user: score.overall is null', () => {
  assert.equal(userData().score.overall, null);
});

test('user: score.recovery is null', () => {
  assert.equal(userData().score.recovery, null);
});

test('user: score.activity is null', () => {
  assert.equal(userData().score.activity, null);
});

test('user: score.dataCoverage is null', () => {
  assert.equal(userData().score.dataCoverage, null);
});

test('user: scoreTrend isEmpty is true', () => {
  assert.equal(userData().scoreTrend.isEmpty, true);
});

test('user: scoreTrend series is empty', () => {
  assert.equal(userData().scoreTrend.series.length, 0);
});

test('user: recoveryMetrics.sleep chart data is empty', () => {
  assert.equal(userData().recoveryMetrics.sleep.data.length, 0);
});

test('user: activityMetrics.steps chart data is empty', () => {
  assert.equal(userData().activityMetrics.steps.data.length, 0);
});

test('user: contributors.recovery.value is null', () => {
  assert.equal(userData().contributors.recovery.value, null);
});

test('user: contributors.activity.value is null', () => {
  assert.equal(userData().contributors.activity.value, null);
});

// ─── 3. Time range selection returns stable data ─────────────────────────────
const TIME_RANGES = ['1d', '7d', '1m', '3m', '6m', 'max'] as const;

for (const range of TIME_RANGES) {
  test(`demo: timeRange ${range} returns non-empty scoreTrend series`, () => {
    const trend = demoData({ timeRange: range }).scoreTrend;
    assert.equal(trend.isEmpty, false);
    assert.ok(trend.series.length > 0);
    assert.ok(trend.series[0].data.length > 0, `Expected chart data for range ${range}`);
  });
}

// ─── 4. Custom range with no data returns calm empty states ──────────────────
test('demo: custom range with null start/end falls back to 7D trend', () => {
  const data = demoData({ timeRange: 'custom', customRange: EMPTY_CUSTOM });
  assert.equal(data.scoreTrend.isEmpty, false);
  assert.ok(data.scoreTrend.series.length > 0);
});

test('user: custom range returns isEmpty scoreTrend', () => {
  const data = userData({ timeRange: 'custom', customRange: EMPTY_CUSTOM });
  assert.equal(data.scoreTrend.isEmpty, true);
});

test('user: custom range emptyText is non-empty string', () => {
  const text = userData({ timeRange: 'custom', customRange: EMPTY_CUSTOM }).scoreTrend.emptyText;
  assert.ok(typeof text === 'string' && text.length > 0);
});

// ─── 5. Blood panel availability affects Blood Markers only ──────────────────
test('demo: no blood panels — bloodMarkers subtitle shows fallback', () => {
  const hi = demoData({ bloodPanels: [] }).healthInputs.find((h) => h.id === 'bloodMarkers')!;
  assert.ok(hi);
  assert.equal(hi.state, 'active');
  // subtitle should not crash and should be a string
  assert.ok(typeof hi.subtitle === 'string');
});

test('demo: score.bloodMarkers is non-null regardless of panels', () => {
  assert.notEqual(demoData({ bloodPanels: [] }).score.bloodMarkers, null);
});

test('user: score.bloodMarkers is null when no panels', () => {
  assert.equal(userData({ bloodPanels: [] }).score.bloodMarkers, null);
});

test('demo: bloodMarkers healthInput is always state active', () => {
  const hi = demoData().healthInputs.find((h) => h.id === 'bloodMarkers')!;
  assert.equal(hi.state, 'active');
});

// ─── 6. Future contributors remain disabled / Coming soon ─────────────────────
test('demo: future contributors are exactly 4', () => {
  assert.equal(demoData().contributors.future.length, 4);
});

test('demo: future contributor labels match spec', () => {
  const labels = demoData().contributors.future.map((f) => f.label);
  assert.deepEqual(labels, ['DNA Insights', 'Stool Test', 'Urine Test', 'Nutrition']);
});

test('demo: dnaInsights healthInput state is comingSoon', () => {
  const hi = demoData().healthInputs.find((h) => h.id === 'dnaInsights')!;
  assert.equal(hi.state, 'comingSoon');
  assert.equal(hi.action, null);
});

test('demo: stoolTest healthInput state is comingSoon', () => {
  const hi = demoData().healthInputs.find((h) => h.id === 'stoolTest')!;
  assert.equal(hi.state, 'comingSoon');
});

test('demo: urineTest healthInput state is comingSoon', () => {
  const hi = demoData().healthInputs.find((h) => h.id === 'urineTest')!;
  assert.equal(hi.state, 'comingSoon');
});

test('demo: nutritionHub stateLabel is Coming soon', () => {
  assert.equal(demoData().nutritionHub.stateLabel, 'Coming soon');
});

test('demo: nutritionHub disabled is true', () => {
  assert.equal(demoData().nutritionHub.disabled, true);
});

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
