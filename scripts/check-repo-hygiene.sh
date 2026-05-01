#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if git grep -nE 'Authorization: Bearer [A-Za-z0-9._-]{16,}|access[_-]?token[[:space:]]*[:=][[:space:]]*["'"'"'][A-Za-z0-9._-]{16,}["'"'"']|session[_-]?cookie[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"']+["'"'"']|set-cookie:' -- . ':(exclude)package-lock.json' ':(exclude)node_modules' ':(exclude)dist' ':(exclude)scripts/check-repo-hygiene.sh'; then
  echo
  echo "Repo hygiene check failed: possible token or auth secret material found in tracked files."
  exit 1
fi

artifact_roots=()
for root in docs memory apps; do
  if [ -d "$root" ]; then
    artifact_roots+=("$root")
  fi
done

suspicious_artifacts=""
if [ "${#artifact_roots[@]}" -gt 0 ]; then
  suspicious_artifacts="$(find "${artifact_roots[@]}" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.gif' -o -iname '*.pdf' \) ! -path '*/node_modules/*' ! -path 'apps/mobile/android/app/src/main/res/*' -print)"
fi

if [ -n "$suspicious_artifacts" ]; then
  echo "Repo hygiene check failed: suspicious tracked artifact files found in docs/, memory/, or apps/."
  echo "$suspicious_artifacts"
  echo
  echo "Use synthetic, reviewed assets only, or keep sensitive artifacts out of the repo."
  exit 1
fi

echo "Repo hygiene check passed."
