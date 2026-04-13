# supabase

Backend surface for One L1fe.

## Intended Contents

- database migrations,
- edge or server-side functions,
- seed helpers,
- backend notes.

## Working Rules

- Secrets stay server-side.
- OpenAI access stays server-side.
- Database structure should follow the domain model, not the other way around.

## Current Status

Initial schema draft now exists in `migrations/20260412163000_phase0_initial_schema.sql`.

Current baseline includes:
- `profiles`,
- `biomarker_definitions`,
- `lab_results`,
- `lab_result_entries`,
- `derived_insights`,
- `recommendations`,
- starter RLS policies,
- seed data for the MVP biomarker registry,
- and an authenticated edge-function entrypoint at `functions/save-minimum-slice-interpretation/` for minimum-slice interpretation persistence.
