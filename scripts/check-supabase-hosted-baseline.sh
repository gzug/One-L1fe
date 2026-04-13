#!/usr/bin/env bash
set -euo pipefail

SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"
SCHEMA="${SCHEMA:-public}"

if [[ -z "$SUPABASE_PROJECT_REF" ]]; then
  echo "SUPABASE_PROJECT_REF is required." >&2
  exit 1
fi

if [[ -z "$SUPABASE_ACCESS_TOKEN" ]]; then
  echo "SUPABASE_ACCESS_TOKEN is required." >&2
  exit 1
fi

export SUPABASE_ACCESS_TOKEN

echo "==> Lint linked Supabase project"
supabase db lint --project-ref "$SUPABASE_PROJECT_REF"

echo

echo "==> Diff linked Supabase project (schema: $SCHEMA)"
supabase db diff --schema "$SCHEMA" --project-ref "$SUPABASE_PROJECT_REF"
