const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/**
 * Metro config for Expo monorepo.
 *
 * watchFolders must include all workspace packages that the mobile app
 * imports directly (e.g. ../../packages/domain/). Without this, Metro's
 * module resolver cannot traverse outside the app root — causing
 * "Unable to resolve module" errors during `expo export --platform web`.
 *
 * @see https://docs.expo.dev/guides/monorepos/
 */
const config = getDefaultConfig(__dirname);

const monorepoRoot = path.resolve(__dirname, '../..');

config.watchFolders = [
  path.resolve(monorepoRoot, 'packages'),
];

// Ensure Metro resolves .ts extensions for the domain package files
// imported without extension stripping (allowImportingTsExtensions).
config.resolver = {
  ...config.resolver,
  sourceExts: [
    ...config.resolver.sourceExts,
    'ts',
    'tsx',
  ],
};

module.exports = config;
