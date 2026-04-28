# One L1fe v2 Live Foundation

Status: active plan for `feat/v2-supabase-live-foundation`.

## Goal

Make the v2 prototype safe for private live use by the owner and brother.

This means authenticated, user-scoped storage for real app data. It does not mean diagnostic use, treatment guidance, emergency triage, or automatic medical scoring.

## Non-negotiable boundaries

- Do not commit Supabase service keys or real personal health data.
- Use `EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL` and `EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY` from local env or EAS secrets.
- Use the existing mobile Supabase client path.
- Respect RLS. User-owned rows must stay scoped to `auth.uid()`.
- Imported, uploaded, or scanned blood values must be reviewed by the user before storage or scoring.
- Health Connect remains foreground display-only until a separate ingest path is implemented.

## Already available in repo

- Supabase backend baseline with user-owned `profiles`, `lab_results`, `lab_result_entries`, interpretation tables, recommendations, evidence tables, wearable/context schema, and RLS.
- Mobile Supabase client in `apps/mobile/mobileSupabaseAuth.ts`.
- v2 active app root at `apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx`.
- Local blood panel storage in the old v1 data module, currently AsyncStorage only.
- Health Connect foreground snapshot UI.

## Current simulation vs real status

| Area | Current state | Live-readiness action |
|---|---|---|
| Profile | UI/demo/local state | Add authenticated Supabase profile load/save |
| Notes | local device storage | Add user-scoped Supabase persistence |
| Blood panels | AsyncStorage demo/manual data | Add manual Supabase save/read via `lab_results` + `lab_result_entries` |
| Score/trends | demo/static | Keep demo until score V0 rules are explicitly defined |
| Health Connect | foreground display-only | Keep display-only; no Supabase ingest yet |
| Upload/photo/scan | UI buttons only | Later: upload storage + extraction + review screen |
| Auth | historical shell exists | Add minimal v2 session gate or reuse existing auth components after review |

## Hard parts

1. Blood PDF/photo/scan extraction: OCR and value parsing are error-prone. Build only after manual entry is live.
2. Score from real data: requires explicit, bounded rules and missing-data behavior.
3. Health Connect sync: requires consent, freshness rules, retry/error handling, and source metadata.
4. Brother/private multi-user use: requires auth, profile ownership, and RLS verification before real data entry.

## Recommended implementation order

### Phase 1 — Auth and environment

- Confirm `.env.example` is complete.
- Use local `.env.local` or EAS secrets for the real anon key.
- Add a minimal v2 auth/session surface.
- Reuse `getMobileSupabaseClient()` rather than creating a second Supabase client.

### Phase 2 — Supabase-backed profile and notes

- Profile: load/save authenticated user profile.
- Notes/context: store simple user-scoped notes in existing context tables if schema supports it; otherwise add a small migration.
- Keep local fallback only for signed-out/demo state.

### Phase 3 — Manual blood panels

- Build v2 manual blood panel editor.
- Persist one panel as `lab_results` plus entries as `lab_result_entries`.
- Allow custom markers, but mark unknown markers as stored-only, not score-eligible.
- Require user confirmation before save.

### Phase 4 — Real-data scoring V0

- Only after manual blood persistence works.
- Use supported markers only.
- Keep recommendations bounded and non-diagnostic.
- Store score provenance if writing interpretation tables.

### Phase 5 — Upload/photo/scan

- Add PDF/image upload first.
- Add scan UX later if device QA proves native scanner compatibility.
- Extraction must create candidate values, not final values.
- User review and confirmation remain mandatory.

## Definition of done for first live-use slice

- Owner and brother can sign in separately.
- Each user only sees their own data.
- Profile persists in Supabase.
- Notes persist in Supabase or documented user-scoped fallback.
- Manual blood panel can be created, reviewed, saved, and reloaded.
- No real-data score recomputation unless explicitly implemented and validated.
- Typecheck passes.
- Android device QA passes.
