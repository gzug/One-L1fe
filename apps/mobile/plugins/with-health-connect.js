const {
  AndroidConfig,
  withAndroidManifest,
  withMainActivity,
} = require('expo/config-plugins');

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

function ensurePermission(manifest, permission) {
  const existing = manifest['uses-permission'] ?? [];
  if (existing.some((item) => item?.$?.['android:name'] === permission)) {
    return;
  }

  existing.push({ $: { 'android:name': permission } });
  manifest['uses-permission'] = existing;
}

function ensureMainActivityRationale(manifest) {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  const activities = application.activity ?? [];
  const mainActivity = activities.find(
    (activity) =>
      activity?.$?.['android:name'] === '.MainActivity' ||
      activity?.$?.['android:name']?.endsWith('.MainActivity'),
  );

  if (mainActivity) {
    mainActivity['intent-filter'] ??= [];
    const hasRationaleIntent = mainActivity['intent-filter'].some((filter) =>
      filter.action?.some(
        (action) => action?.$?.['android:name'] === 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE',
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
    (alias) => alias?.$?.['android:name'] === 'ViewPermissionUsageActivity',
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

function injectMainActivityPermissionDelegate(contents) {
  const delegateImport = 'import com.healthconnect.reactnative.permission.HealthConnectPermissionDelegate;';
  const onCreateBlock =
    '  override fun onCreate(savedInstanceState: Bundle?) {\n' +
    '    super.onCreate(savedInstanceState)\n' +
    '    HealthConnectPermissionDelegate.setPermissionDelegate(this)\n' +
    '  }\n';

  let next = contents;
  if (!next.includes('HealthConnectPermissionDelegate.setPermissionDelegate(this)')) {
    if (!next.includes(delegateImport)) {
      next = next.replace(
        /import android\.os\.Bundle;\n/,
        `import android.os.Bundle;\n${delegateImport}\n`,
      );
    }

    if (next.includes('override fun onCreate(savedInstanceState: Bundle?)')) {
      next = next.replace(
        /override fun onCreate\(savedInstanceState: Bundle\?\) \{\n([\s\S]*?)\n  \}/,
        (match, body) => {
          if (body.includes('HealthConnectPermissionDelegate.setPermissionDelegate(this)')) {
            return match;
          }

          return `override fun onCreate(savedInstanceState: Bundle?) {\n${body}\n    HealthConnectPermissionDelegate.setPermissionDelegate(this)\n  }`;
        },
      );
      return next;
    }

    const anchor = 'override fun createReactActivityDelegate(): ReactActivityDelegate =';
    if (next.includes(anchor)) {
      next = next.replace(anchor, `${onCreateBlock}\n${anchor}`);
    }
  }

  return next;
}

module.exports = function withHealthConnect(config) {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    HEALTH_CONNECT_PERMISSIONS.forEach((permission) => ensurePermission(manifest, permission));
    ensureMainActivityRationale(manifest);
    return config;
  });

  config = withMainActivity(config, (config) => {
    config.modResults.contents = injectMainActivityPermissionDelegate(config.modResults.contents);
    return config;
  });

  return config;
};
