#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/packages/domain"
TARGET_DIR="$ROOT_DIR/supabase/functions/save-minimum-slice-interpretation/_lib/domain"

rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

while IFS= read -r path; do
  cp "$path" "$TARGET_DIR/$(basename "$path")"
done < <(
  find "$SOURCE_DIR" -maxdepth 1 -type f -name '*.ts' \
    ! -name '*.assertions.ts' \
    ! -name 'runMinimumSliceAssertions.ts' \
    | sort
)

echo "Prepared vendored domain files in $TARGET_DIR"
