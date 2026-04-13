#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if git grep -nE 'Authorization: Bearer [A-Za-z0-9._-]{16,}|access[_-]?token[[:space:]]*[:=][[:space:]]*["'"'"'][A-Za-z0-9._-]{16,}["'"'"']|session[_-]?cookie[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"']+["'"'"']|set-cookie:' -- . ':(exclude)package-lock.json' ':(exclude)node_modules' ':(exclude)dist'; then
  echo
  echo "Repo hygiene check failed: possible token or auth secret material found in tracked files."
  exit 1
fi

echo "Repo hygiene check passed."
