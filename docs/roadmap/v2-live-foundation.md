# One L1fe v2 Live Foundation

Status: active plan for `feat/v2-supabase-live-foundation`.

## Goal

Make the v2 prototype safe for private live use by the owner and brother.

This means authenticated, user-scoped storage for real app data. It does not mean diagnostic use, treatment guidance, emergency triage, or automatic medical scoring.

## Non-negotiable boundaries

- Do not commit Supabase service keys or real personal health data.
- Use `EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL` and `EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY` from local env or EAS secrets.
- Use `getMobileSupabaseClient()` from `apps/mobile/mobileSupabaseAuth.ts`; do not create a second mobile Supabase client.
- v2 auth flow: email + password login and registration only. No Magic Link in this slice.
- Registration requires first name, last name, email, password, and repeated password.
- Passwords must match before calling Supabase. Never store the password locally.
- On successful registration, first name, last name, and email must be written into the user profile.
- Welcome email is allowed after successful registration, but it must not block signup, login, or app access.
- No required email-confirmation link for v2 unless explicitly enabled later in Supabase.
- Respect RLS. User-owned rows must stay scoped to `auth.uid()`.
- RLS verification is a required gate before profile, notes, or blood persistence are considered live-ready.
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
| Auth | historical shell exists | Add v2 email/password login + registration gate |
| Welcome email | not implemented | Optional post-signup email; no login dependency |

## Hard parts

1. Blood PDF/photo/scan extraction: OCR and value parsing are error-prone. Build only after manual entry is live.
2. Score from real data: requires explicit, bounded rules and missing-data behavior.
3. Health Connect sync: requires consent, freshness rules, retry/error handling, and source metadata.
4. Brother/private multi-user use: requires auth, profile ownership, and RLS verification before real data entry.

## Recommended implementation order

### Phase 0 — Schema and RLS check

- Check the current migration chain for the tables v2 will write to.
- Confirm `profiles`, `lab_results`, and `lab_result_entries` have owner-scoped RLS.
- Confirm whether an existing notes/context table is suitable for v2 notes.
- Before live use, verify cross-user isolation: a signed-in user must not be able to read another user's `profiles`, `lab_results`, or notes/context rows.
- If manual SQL is used for verification, document the exact commands and result in the PR.

### Phase 1 — Auth and environment

- Confirm `.env.example` is complete.
- Use local `.env.local` or EAS secrets for the real anon key.
- Add a minimal v2 email+password auth/session surface.
- Add registration fields: first name, last name, email, password, repeat password.
- Validate required fields and matching passwords before Supabase signup.
- On successful signup, create/update the authenticated profile with first name, last name, and email.
- Reuse `getMobileSupabaseClient()` rather than creating a second Supabase client.
- Do not add Magic Link or required email-confirmation logic in this slice.
- Welcome email may be added after signup, but must remain non-blocking and optional.

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

- Owner and brother can register or sign in with email + password.
- Registration requires first name, last name, email, password, and repeat password.
- Password mismatch blocks registration before Supabase call.
- First name, last name, and email appear in the in-app profile after registration.
- Each user only sees their own data.
- RLS isolation is explicitly verified before blood persistence is accepted.
- Profile persists in Supabase.
- Notes persist in Supabase or documented user-scoped fallback.
- Manual blood panel can be created, reviewed, saved, and reloaded.
- Optional welcome email, if implemented, sends after registration and does not block app access.
- No real-data score recomputation unless explicitly implemented and validated.
- Typecheck passes.
- Android device QA passes.
