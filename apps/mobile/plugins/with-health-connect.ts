import {
  ConfigPlugin,
  withAndroidManifest,
  withMainActivity,
} from '@expo/config-plugins';

const HC_PERMISSIONS = [
  'android.permission.health.READ_STEPS',
  'android.permission.health.READ_SLEEP',
  'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
  'android.permission.health.READ_RESTING_HEART_RATE',
  'android.permission.health.READ_HEART_RATE_VARIABILITY',
  'android.permission.health.READ_DISTANCE',
];

const withHealthConnectManifest: ConfigPlugin = (config) =>
  withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults;
    const mainApplication = manifest.manifest.application?.[0];
    if (!mainApplication) return mod;

    if (!manifest.manifest.queries) {
      manifest.manifest.queries = [];
    }
    const queries = manifest.manifest.queries[0] as any;
    if (!queries?.package?.some((p: any) => p.$?.['android:name'] === 'com.google.android.apps.healthdata')) {
      if (!queries.package) queries.package = [];
      queries.package.push({ $: { 'android:name': 'com.google.android.apps.healthdata' } });
    }

    if (!manifest.manifest['uses-permission']) {
      manifest.manifest['uses-permission'] = [];
    }
    const existing = manifest.manifest['uses-permission'].map(
      (p: any) => p.$?.['android:name']
    );
    for (const perm of HC_PERMISSIONS) {
      if (!existing.includes(perm)) {
        manifest.manifest['uses-permission'].push({ $: { 'android:name': perm } });
      }
    }

    const app = mainApplication as any;
    if (!app['activity-alias']) {
      app['activity-alias'] = [];
    }
    const alreadyHasAlias = app['activity-alias'].some(
      (a: any) => a.$?.['android:name'] === 'ViewPermissionUsageActivity'
    );
    if (!alreadyHasAlias) {
      app['activity-alias'].push({
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

    return mod;
  });

const withHealthConnectMainActivity: ConfigPlugin = (config) =>
  withMainActivity(config, (mod) => {
    let contents = mod.modResults.contents;

    if (contents.includes('HealthConnectPermissionDelegate')) {
      return mod;
    }

    const importLine =
      'import com.healthconnect.reactnative.permission.HealthConnectPermissionDelegate';
    if (!contents.includes(importLine)) {
      contents = contents.replace(
        'import com.facebook.react.ReactActivity',
        `import com.facebook.react.ReactActivity\n${importLine}`
      );
    }

    if (contents.includes('super.onCreate')) {
      contents = contents.replace(
        /super\.onCreate\((.*?)\)/,
        'super.onCreate($1)\n    HealthConnectPermissionDelegate.setPermissionDelegate(this)'
      );
    } else {
      const onCreate = `
  override fun onCreate(savedInstanceState: android.os.Bundle?) {
    super.onCreate(savedInstanceState)
    HealthConnectPermissionDelegate.setPermissionDelegate(this)
  }
`;
      const lastBrace = contents.lastIndexOf('}');
      contents = contents.slice(0, lastBrace) + onCreate + contents.slice(lastBrace);
    }

    mod.modResults.contents = contents;
    return mod;
  });

const withHealthConnect: ConfigPlugin = (config) => {
  config = withHealthConnectManifest(config);
  config = withHealthConnectMainActivity(config);
  return config;
};

export default withHealthConnect;
