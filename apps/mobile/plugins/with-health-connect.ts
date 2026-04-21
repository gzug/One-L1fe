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

function ensureMainActivityMainActivityAlias(manifest: any): void {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  const activities = application.activity ?? [];
  const mainActivity = activities.find((activity: { $?: { 'android:name'?: string } }) =>
    activity?.$?.['android:name'] === '.MainActivity' ||
    activity?.$?.['android:name']?.endsWith('.MainActivity'),
  );

  if (mainActivity) {
    mainActivity['intent-filter'] ??= [];
    const hasRationaleIntent = mainActivity['intent-filter'].some((filter: any) =>
      filter.action?.some((action: any) => action?.$?.['android:name'] === 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE'),
    );

    if (!hasRationaleIntent) {
      mainActivity['intent-filter'].push({
        action: [{ $: { 'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE' } }],
        category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
      });
    }
  }

  application['activity-alias'] ??= [];
  const existingAlias = application['activity-alias'].find((alias: { $?: { 'android:name'?: string } }) =>
    alias?.$?.['android:name'] === 'ViewPermissionUsageActivity',
  );

  if (!existingAlias) {
    application['activity-alias'].push({
      $: {
        'android:name': 'ViewPermissionUsageActivity',
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
  const importBundlePattern = /import android\.os\.Bundle;\n/;
  const importDelegate = 'import android.os.Bundle;\nimport com.healthconnect.reactnative.permission.HealthConnectPermissionDelegate;\n';
  const onCreateBlock = `override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    HealthConnectPermissionDelegate.setPermissionDelegate(this)\n  }\n`;

  let next = contents;
  if (!next.includes('HealthConnectPermissionDelegate.setPermissionDelegate(this)')) {
    if (importBundlePattern.test(next) && !next.includes('HealthConnectPermissionDelegate')) {
      next = next.replace(importBundlePattern, importDelegate);
    }

    if (next.includes('override fun onCreate(savedInstanceState: Bundle?)')) {
      return next;
    }

    const anchor = 'override fun createReactActivityDelegate(): ReactActivityDelegate =';
    if (next.includes(anchor)) {
      next = next.replace(anchor, `${onCreateBlock}\n  ${anchor}`);
      return next;
    }
  }

  return next;
}

const withHealthConnect: ConfigPlugin = (config) => {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    HEALTH_CONNECT_PERMISSIONS.forEach((permission) => ensurePermission(manifest, permission));
    ensureMainActivityMainActivityAlias(manifest);
    return config;
  });

  config = withMainActivity(config, (config) => {
    config.modResults.contents = injectMainActivityPermissionDelegate(config.modResults.contents);
    return config;
  });

  return config;
};

export default withHealthConnect;
