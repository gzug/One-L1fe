#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_REF="${SUPABASE_PROJECT_REF:-${1:-}}"

if [[ -z "$PROJECT_REF" ]]; then
  echo "Usage: SUPABASE_PROJECT_REF=<ref> $0"
  echo "   or: $0 <project-ref>"
  exit 1
fi

"$ROOT_DIR/scripts/prepare-supabase-function-domain.sh"

cd "$ROOT_DIR"
supabase functions deploy save-minimum-slice-interpretation --project-ref "$PROJECT_REF"
