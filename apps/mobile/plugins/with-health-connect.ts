import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withMainActivity,
} from 'expo/config-plugins';

const HEALTH_CONNECT_PERMISSIONS = [
  'android.permission.health.READ_STEPS',
  'android.permission.health.READ_HEART_RATE',
  'android.permission.health.READ_SLEEP',
  'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
  'android.permission.health.READ_EXERCISE',
  'android.permission.health.READ_WEIGHT',
  'android.permission.health.READ_RESTING_HEART_RATE',
  'android.permission.health.READ_HEART_RATE_VARIABILITY',
  'android.permission.health.READ_VO2_MAX',
  'android.permission.health.READ_BODY_FAT',
  'android.permission.health.READ_OXYGEN_SATURATION',
  'android.permission.health.READ_BLOOD_PRESSURE',
  'android.permission.health.READ_DISTANCE',
];

function ensurePermission(manifest: any, permission: string): void {
  const existing = manifest['uses-permission'] ?? [];
  if (existing.some((item: { $?: { 'android:name'?: string } }) => item?.$?.['android:name'] === permission)) {
    return;
  }
  existing.push({ $: { 'android:name': permission } });
  manifest['uses-permission'] = existing;
}

function ensureMainActivityAlias(manifest: any): void {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  const activities = application.activity ?? [];
  const mainActivity = activities.find(
    (activity: { $?: { 'android:name'?: string } }) =>
      activity?.$?.['android:name'] === '.MainActivity' ||
      activity?.$?.['android:name']?.endsWith('.MainActivity'),
  );

  if (mainActivity) {
    mainActivity['intent-filter'] ??= [];
    const hasRationaleIntent = mainActivity['intent-filter'].some((filter: any) =>
      filter.action?.some(
        (action: any) =>
          action?.$?.['android:name'] === 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE',
      ),
    );
    if (!hasRationaleIntent) {
      mainActivity['intent-filter'].push({
        action: [{ $: { 'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE' } }],
        category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
      });
    }
  }

  application['activity-alias'] ??= [];
  const existingAlias = application['activity-alias'].find(
    (alias: { $?: { 'android:name'?: string } }) =>
      alias?.$?.['android:name'] === '.ViewPermissionUsageActivity',
  );
  if (!existingAlias) {
    application['activity-alias'].push({
      $: {
        'android:name': '.ViewPermissionUsageActivity',
        'android:exported': 'true',
        'android:targetActivity': '.MainActivity',
        'android:permission': 'android.permission.START_VIEW_PERMISSION_USAGE',
      },
      'intent-filter': [
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW_PERMISSION_USAGE' } }],
          category: [{ $: { 'android:name': 'android.intent.category.HEALTH_PERMISSIONS' } }],
        },
      ],
    });
  }
}

function injectMainActivityPermissionDelegate(contents: string): string {
  if (contents.includes('HealthConnectPermissionDelegate.setPermissionDelegate(this)')) {
    return contents;
  }

  // Verify the delegate class exists in node_modules at plugin-resolution time.
  // If the import injection fails (pattern not found), throw explicitly so prebuild
  // fails loudly rather than silently producing a broken APK.
  const importBundlePattern = /import android\.os\.Bundle;\n/;
  const importDelegate =
    'import android.os.Bundle;\nimport com.healthconnect.reactnative.permission.HealthConnectPermissionDelegate;\n';

  const onCreateBlock =
    `  override fun onCreate(savedInstanceState: Bundle?) {\n` +
    `    super.onCreate(savedInstanceState)\n` +
    `    HealthConnectPermissionDelegate.setPermissionDelegate(this)\n` +
    `  }\n`;

  let next = contents;

  if (importBundlePattern.test(next)) {
    next = next.replace(importBundlePattern, importDelegate);
  } else {
    throw new Error(
      '[with-health-connect] Could not inject HealthConnectPermissionDelegate import: ' +
        '"import android.os.Bundle;" not found in MainActivity.kt. ' +
        'Run expo prebuild --clean and verify the template has not changed.',
    );
  }

  const anchor = 'override fun createReactActivityDelegate(): ReactActivityDelegate =';
  if (next.includes(anchor)) {
    next = next.replace(anchor, `${onCreateBlock}\n  ${anchor}`);
  } else if (!next.includes('override fun onCreate(savedInstanceState: Bundle?)')) {
    throw new Error(
      '[with-health-connect] Could not inject onCreate override: anchor ' +
        '"override fun createReactActivityDelegate" not found in MainActivity.kt.',
    );
  }

  return next;
}

const withHealthConnect: ConfigPlugin = (config) => {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    HEALTH_CONNECT_PERMISSIONS.forEach((permission) => ensurePermission(manifest, permission));
    ensureMainActivityAlias(manifest);
    return config;
  });

  config = withMainActivity(config, (config) => {
    config.modResults.contents = injectMainActivityPermissionDelegate(config.modResults.contents);
    return config;
  });

  return config;
};

export default withHealthConnect;
