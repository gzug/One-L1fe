#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# --- 1. Token and secret material scan ---
if git grep -nE 'Authorization: Bearer [A-Za-z0-9._-]{16,}|access[_-]?token[[:space:]]*[:=][[:space:]]*["'"'"'][A-Za-z0-9._-]{16,}["'"'"']|session[_-]?cookie[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"']+["'"'"']|set-cookie:' -- . ':(exclude)package-lock.json' ':(exclude)node_modules' ':(exclude)dist' ':(exclude)scripts/check-repo-hygiene.sh'; then
  echo
  echo "Repo hygiene check failed: possible token or auth secret material found in tracked files."
  exit 1
fi

# --- 2. Suspicious binary/media artifact scan ---
suspicious_artifacts="$(find docs memory apps -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.gif' -o -iname '*.pdf' \) ! -path '*/node_modules/*' -print)"

if [ -n "$suspicious_artifacts" ]; then
  echo "Repo hygiene check failed: suspicious tracked artifact files found in docs/, memory/, or apps/."
  echo "$suspicious_artifacts"
  echo
  echo "Use synthetic, reviewed assets only, or keep sensitive artifacts out of the repo."
  exit 1
fi

# --- 3. Local machine path leak scan ---
if git grep -nE '/Users/[A-Za-z0-9_.-]+/' -- . \
    ':(exclude)package-lock.json' \
    ':(exclude)node_modules' \
    ':(exclude)dist' \
    ':(exclude)scripts/check-repo-hygiene.sh'; then
  echo
  echo "Repo hygiene check failed: local machine path found in tracked files."
  echo "Do not commit paths like /Users/yourname/... into repo docs or scripts."
  exit 1
fi

# --- 4. Migration file vs supabase_migrations table drift check (optional, requires env) ---
if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
  echo "==> Checking migration drift (repo files vs supabase_migrations table)"

  repo_versions="$(ls supabase/migrations/*.sql 2>/dev/null \
    | xargs -I{} basename {} \
    | sed 's/_[^.]*\.sql//' \
    | sort)"

  db_versions="$(psql "$SUPABASE_DB_URL" -Atc \
    "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;" \
    2>/dev/null || echo '')"

  if [[ -z "$db_versions" ]]; then
    echo "  (skipped: could not connect to DB or no migrations table found)"
  else
    repo_only="$(comm -23 <(echo "$repo_versions") <(echo "$db_versions"))"
    db_only="$(comm -13 <(echo "$repo_versions") <(echo "$db_versions"))"

    if [[ -n "$repo_only" ]]; then
      echo "  WARNING: These migration files are in the repo but NOT applied on DB:"
      echo "$repo_only" | sed 's/^/    /'
    fi

    if [[ -n "$db_only" ]]; then
      echo "  ERROR: These versions are applied on DB but NOT committed to repo:"
      echo "$db_only" | sed 's/^/    /'
      echo
      echo "Repo hygiene check failed: uncommitted migrations on hosted Supabase."
      exit 1
    fi

    if [[ -z "$repo_only" && -z "$db_only" ]]; then
      echo "  Migration state: repo and DB are in sync."
    fi
  fi
else
  echo "  (migration drift check skipped: SUPABASE_DB_URL not set)"
fi

echo
echo "Repo hygiene check passed."
