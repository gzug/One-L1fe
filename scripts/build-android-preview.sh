#!/bin/bash
# build-android-preview.sh
# Builds an Android APK using the EAS 'preview' profile.
# Output: downloadable APK link printed by EAS on completion (~10 min).
#
# Prerequisites:
#   - eas-cli installed: npm install -g eas-cli
#   - Logged in to EAS: eas login
#   - EAS secrets set (SUPABASE_URL, SUPABASE_ANON_KEY): see docs/ops/sideload-guide.md
#
# Usage:
#   bash scripts/build-android-preview.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
MOBILE_DIR="$REPO_ROOT/apps/mobile"

echo "→ One L1fe — EAS Android Preview Build"
echo "  Mobile dir: $MOBILE_DIR"
echo ""

cd "$MOBILE_DIR"

echo "→ Installing dependencies..."
npm install

echo "→ Submitting build to EAS (preview profile, Android)..."
eas build \
  --profile preview \
  --platform android \
  --non-interactive

echo ""
echo "✓ Build submitted. The APK download link will appear above when complete."
echo "  Typical build time: 8-12 minutes."
echo "  Send the link to the tester once the build status shows 'Finished'."
