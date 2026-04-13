#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REQUEST_PATH="${REQUEST_PATH:-$ROOT_DIR/supabase/functions/save-minimum-slice-interpretation/example-request.json}"
SUPABASE_URL="${SUPABASE_URL:-http://127.0.0.1:54321}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}"
FUNCTION_NAME="${FUNCTION_NAME:-save-minimum-slice-interpretation}"
TEST_EMAIL="${TEST_EMAIL:-minimum-slice-smoke@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-ChangeMe123456!}"
TEST_TIMEZONE="${TEST_TIMEZONE:-Europe/Berlin}"

if [[ -z "$SUPABASE_ANON_KEY" ]]; then
  echo "SUPABASE_ANON_KEY is required." >&2
  echo "Example: SUPABASE_ANON_KEY=... scripts/smoke-test-save-minimum-slice-function.sh" >&2
  exit 1
fi

if [[ ! -f "$REQUEST_PATH" ]]; then
  echo "Request file not found: $REQUEST_PATH" >&2
  exit 1
fi

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

signup_response_path="$workdir/signup.json"
profile_response_path="$workdir/profile.json"
invoke_response_path="$workdir/invoke.json"

curl --silent --show-error \
  -X POST "$SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  > "$signup_response_path"

access_token="$(node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const token=data.access_token || data.session?.access_token; if(!token){console.error('Signup/signin response did not include an access token.'); process.exit(1);} process.stdout.write(token);" "$signup_response_path")"
user_id="$(node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const userId=data.user?.id || data.session?.user?.id; if(!userId){console.error('Signup/signin response did not include a user id.'); process.exit(1);} process.stdout.write(userId);" "$signup_response_path")"

curl --silent --show-error \
  -X POST "$SUPABASE_URL/rest/v1/profiles" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates,return=representation" \
  -d "[{\"id\":\"$user_id\",\"display_name\":\"Minimum Slice Smoke Test\",\"timezone\":\"$TEST_TIMEZONE\"}]" \
  > "$profile_response_path"

curl --silent --show-error \
  -X POST "$SUPABASE_URL/functions/v1/$FUNCTION_NAME" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json" \
  --data-binary "@$REQUEST_PATH" \
  > "$invoke_response_path"

node - <<'NODE' "$profile_response_path" "$invoke_response_path"
const fs = require('fs');
const [profilePath, invokePath] = process.argv.slice(2);
const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
const invoke = JSON.parse(fs.readFileSync(invokePath, 'utf8'));

if (!Array.isArray(profile) || profile.length === 0) {
  console.error('Profile creation did not return a row.');
  process.exit(1);
}

if (!invoke?.persistence?.interpretationRunId) {
  console.error('Function response did not include persistence.interpretationRunId.');
  console.error(JSON.stringify(invoke, null, 2));
  process.exit(1);
}

console.log('Smoke test passed.');
console.log(JSON.stringify({
  profileId: profile[0].id,
  interpretationRunId: invoke.persistence.interpretationRunId,
  interpretedEntryCount: invoke.persistence.interpretedEntryIds?.length ?? null,
  recommendationCount: invoke.persistence.recommendationIds?.length ?? null,
  coverageState: invoke.evaluation?.coverage?.state ?? null,
}, null, 2));
NODE
