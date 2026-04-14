---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-14
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

The repo has a credible domain seam, a real Supabase backend, and a strong truth/ops layer. It is not yet a privately usable product core — not because of the idea or the architecture, but because the mobile/auth seam on `main` is technically incomplete: dependencies are undeclared, there is no mobile CI, no central token refresh path, and no wearables sync client on `main`. The immediate need is **mobile seam hardening + CI coverage**, not more architecture or planning docs.

---

## What is genuinely solid today

- **Domain sharpness** [Fact]: Clear product boundary — ApoB primary, LDL fallback. Priority Score is a bounded prioritisation aid, not a clinical risk score. Shared domain lives in `packages/domain`, not scattered in UI or prompt logic.
- **Truth/ops layer** [Fact]: `README → CHECKPOINT → MEMORY → memory/ → deep docs` follows a single consistent logic. Current state in `CHECKPOINT`, durable decisions in `MEMORY`, daily/short-term in `memory/`, deep docs on demand.
- **Backend seam** [Fact]: `save-minimum-slice-interpretation` is deployed with real JWT enforcement. The edge function overwrites `profileId` server-side with `user.id`. Not a mock auth check — a real one. One authenticated hosted smoke call returned HTTP 200 with a confirmed DB write end to end.
- **Wearables foundation** [Fact]: `src/lib/wearables/metricRegistry.ts` and `src/lib/wearables/syncContract.ts` exist on `main` and are exported. Types and contracts are in place. The sync client is on branch `feat/wearables-sync-client` (PR #26), not yet on `main`.

---

## File-by-file status (as of main @ 95e1fb6d)

### `apps/mobile/package.json` — ❌ Direct blocker
**Fact:** `dependencies` contains only `expo ~53.0.0`, `expo-status-bar ~2.2.3`, `react 19.0.0`, `react-native 0.79.5`. `devDependencies` contains only `@babel/core ^7.28.0`, `typescript ^5.9.3`. Scripts: only `start`, `android`, `ios`, `web`.

**Missing:** `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill` are all absent. Fresh clone + fresh install breaks here immediately.

**Minimal delta (additive, no overwrite):**
```json
"dependencies": {
  "@react-native-async-storage/async-storage": "^2.1.2",
  "@supabase/supabase-js": "^2.49.4",
  "react-native-url-polyfill": "^2.0.0"
},
"scripts": {
  "typecheck": "npx tsc --noEmit"
}
```

---

### `apps/mobile/mobileSupabaseAuth.ts` — ❌ Direct blocker
**Fact:** `createClient(url, anonKey)` is called without a third config parameter. No `AsyncStorage` import. No `react-native-url-polyfill` import. No `getFreshAccessToken()` function. `createMobileSupabaseAuthSessionProvider().getSession()` calls `client.auth.getSession()` and returns `data.session.access_token` directly — no central refresh or error path.

**Missing:** AsyncStorage-based session persistence (sessions do not survive background idle on RN without it). No central token path for the wearables sync client.

**Minimal delta — full replacement:**
```ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  MinimumSliceAuthSession,
  MinimumSliceAuthSessionProvider,
} from './minimumSliceScreenController.ts';

let _client: SupabaseClient | undefined;

export function getMobileSupabaseClient(): SupabaseClient {
  if (_client !== undefined) return _client;

  const url = process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL and EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY must be set.',
    );
  }

  _client = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return _client;
}

export type FreshAccessTokenResult =
  | { kind: 'ok'; accessToken: string }
  | { kind: 'signed-out' }
  | { kind: 'error'; message: string };

export async function getFreshAccessToken(): Promise<FreshAccessTokenResult> {
  let client: SupabaseClient;
  try {
    client = getMobileSupabaseClient();
  } catch (e) {
    return {
      kind: 'error',
      message: e instanceof Error ? e.message : 'Supabase client config invalid.',
    };
  }

  const { data, error } = await client.auth.getSession();
  if (error) return { kind: 'error', message: `getSession failed: ${error.message}` };
  if (!data.session?.access_token) return { kind: 'signed-out' };
  return { kind: 'ok', accessToken: data.session.access_token };
}

export function createMobileSupabaseAuthSessionProvider(): MinimumSliceAuthSessionProvider {
  return {
    async getSession(): Promise<MinimumSliceAuthSession> {
      const result = await getFreshAccessToken();
      if (result.kind === 'ok') {
        const client = getMobileSupabaseClient();
        const { data } = await client.auth.getSession();
        return {
          user: { id: data.session!.user.id },
          accessToken: result.accessToken,
        };
      }
      if (result.kind === 'signed-out')
        throw new Error('No active session. Please sign in first.');
      throw new Error(result.message);
    },
  };
}
```

---

### `apps/mobile/useAuthSession.ts` — ✅ Good
**Fact:** 4 states (`loading / signed-out / signed-in / config-error`), `onAuthStateChange` wired, calls `getMobileSupabaseClient()` directly. Automatically benefits from AsyncStorage config once the patch above lands. No changes needed.

### `apps/mobile/App.tsx` — ✅ Good
**Fact:** Clean ~55-line auth-gate shell. Renders `loading → blank`, `signed-out/config-error → LoginScreen`, `signed-in → SessionBar + MinimumSliceScreen`. No changes needed.

### `apps/mobile/LoginScreen.tsx` — ⚠️ Architecturally half-consistent
**Fact:** Calls `getMobileSupabaseClient().auth.signInWithPassword()` directly from UI. Not a day blocker — but after auth seam hardening, consciously decide whether to keep UI-direct login or move to a controller.

### `.github/workflows/ci.yml` — ❌ Direct blocker
**Fact:** One job `validate` with steps: `npm ci → check:repo-hygiene → typecheck → test:domain`. No mobile install, no mobile typecheck, no web export smoke. Mobile lives entirely outside the quality net. As long as this is true, the mobile seam is believed, not verified.

**Minimal delta (insert after domain tests step):**
```yaml
      - name: Mobile install
        working-directory: apps/mobile
        run: npm install

      - name: Mobile typecheck
        working-directory: apps/mobile
        run: npx tsc --noEmit
```
Optional later: `npx expo export --platform web` as smoke.

### `package.json` (root) — ⚠️ Minor
**Fact:** No `typecheck:mobile` script. Not a top blocker if CI handles mobile directly.
**Optional delta:** `"typecheck:mobile": "npm --prefix apps/mobile run typecheck"`

### `src/lib/wearables/` — ❌ syncClient not on main
**Fact:** `index.ts` exports only `metricRegistry` and `syncContract`. `syncClient.ts` exists on branch `feat/wearables-sync-client` (PR #26) but is not on `main`. There is no `apps/mobile/src/` directory.

### `CHECKPOINT.md` — ⚠️ Partial drift (now corrected in this version)
**Fact:** Previous version did not mention AsyncStorage-based session persistence or mobile CI coverage gaps. Both are now documented here.

### `docs/architecture/repo-structure.md` — ⚠️ Stale
**Fact:** File describes itself as "Target Structure". Real repo also contains: `memory/`, `scripts/`, `docs/ops/`, `docs/planning/`, `docs/research/`, `docs/archive/`, `docs/notion/`, `src/`, `CHECKPOINT.md`, `CONTRIBUTING.md`, `checkpoint.yaml` — none of which appear in the documented tree. No product blocker, but clear signal of doc drift.

---

## PR sequence — what is needed now

### PR #27 — Mobile seam hardening (do this first)
**Scope:** `apps/mobile/package.json` + `apps/mobile/mobileSupabaseAuth.ts` + `.github/workflows/ci.yml`

**Why first:** [Fact] PR #26 (`syncClient.ts`) expects `getAccessToken` as an async callback — that contract is only reliable once `getFreshAccessToken()` exists on `main`. [Fact] Without AsyncStorage config, session persistence after background idle is not guaranteed on RN.

**Definition of Done:**
- `cd apps/mobile && npm install` — no errors
- `cd apps/mobile && npx tsc --noEmit` — no errors
- App starts in Expo; session survives 30+ seconds background
- `getFreshAccessToken()` → `{ kind: 'ok', accessToken }` after login
- `getFreshAccessToken()` → `{ kind: 'signed-out' }` after sign-out
- CI green on PR branch

### PR #28 — Wearables sync client on main (merge PR #26)
**After PR #27 is done.**

The `getAccessToken` binding pattern for `syncClient.ts`:
```ts
getAccessToken: async () => {
  const result = await getFreshAccessToken();
  if (result.kind === 'ok') return result.accessToken;
  if (result.kind === 'signed-out') throw new Error('User is signed out.');
  throw new Error(result.message);
},
```

**Definition of Done:** `src/lib/wearables/syncClient.ts` on `main`, CI green, `wearablesSyncClient.example.ts` manually runnable against real `.env`.

### PR #29 — First reader (HealthKit first, not both platforms simultaneously)
**After PR #28.**

**Why not immediately:** [Inference] iOS + Android simultaneously = two permission models + two SDK APIs + two mapping layers on top of a not-yet-verified auth seam. One reader first is the enforced smallest slice.

**Scope:**
- Typed input shapes: `HealthKitSleepSample`, `HealthKitStepsSample`, etc.
- Mapping functions: `mapHealthKitStepsToMobileObservations()`, `mapHealthKitSleepToRaw()`, etc.
- `buildWearablesSyncRequest()` as the single aggregation entry point
- `readTodayStepsFromHealthKit()` — real bridge, not pseudo
- Permissions request (`NSHealthShareUsageDescription` in `app.json`)

**Definition of Done:** HealthKit permissions granted, last 24h steps mapped into `MobileObservation[]`, `invokeWearablesSync()` → `{ ok: true }` with real data, DB write in Supabase verified.

---

## Systemic risks — not blockers today, not ignorable

| Risk | Severity | Source |
|------|----------|--------|
| `labResultId` / `derivedInsightId` forwarded without server-side ownership check | ⚠️ Medium-term | [Fact] not guarded in read code |
| Edge Function catch-all 400 too coarse for real private use | ⚠️ Medium-term | [Fact] |
| `repo-structure.md` stale | ⚠️ Minor | [Fact] |

---

## Priority order

1. **Mobile seam hardening** (PR #27) — `package.json` + `mobileSupabaseAuth.ts` + CI [Fact: direct blockers]
2. **Wearables client on main** (PR #28 = merge PR #26) [Fact]
3. **First real intake path** (PR #29, HealthKit only) [Inference]
4. **Truth layer sync** — update `CHECKPOINT.md` drift, mark `repo-structure.md` as target or extend it [Fact]
5. **Backend integrity** — reference ownership + error granularity (after stable mobile loop) [Fact]

**The one sentence that matters:**
Treat One-L1fe as a seam-hardening problem, not a structure problem. The architecture is good enough. The first real private usage loop can only be built once the mobile/auth path on `main` is technically complete. Sequence without exception: Dependencies → AsyncStorage config + `getFreshAccessToken()` → Mobile CI → merge PR #26 → then HealthKit.

---

## Confirmed facts (carry-forward)

- Hosted migrations match repo
- RLS and policies are live
- `save-minimum-slice-interpretation` deployed with JWT enforcement
- One authenticated hosted smoke call returned HTTP 200 with DB write confirmed
- Backend hardening migration `20260413093000_phase0_backend_hardening.sql` is on `main`
- PR #1 (phase0 backend hardening) merged to `main` on 2026-04-13
- Supabase CI runs linked-project lint + local `supabase start` + `supabase db reset`
- Supabase test user: `test@one-l1fe.dev` (UID `3aa48a6f-0f7b-47d3-9875-7353064dd359`)
- `apps/mobile/.env.example` has `EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL` + `EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY`
- Supabase project: `lbqgjourpsodqglputkj` · `https://lbqgjourpsodqglputkj.supabase.co` · status: ACTIVE_HEALTHY
- Domain files are vendored into `_lib/domain` at deploy time via `scripts/prepare-supabase-function-domain.sh`; source of truth stays in `packages/domain/`
- `useAuthSession.ts` owns the thin React auth-state wrapper — merged PR #17 on 2026-04-13
- `MinimumSliceScreen.tsx` is the standalone minimum-slice form component — merged PR #19 on 2026-04-13
- `App.tsx` is a ~55-line pure auth-gate shell — merged PR #20 on 2026-04-13
- Missing mobile Supabase env no longer hard-crashes; login surface stays visible with a clear config error
- Signed-in shell includes a thin session bar with explicit sign-out

---

## Startup rule

For meaningful repo work, start with `CHECKPOINT.md`.
Read `README.md` first only when a person or agent needs broad repo orientation.
Only read deeper docs when the task actually touches them.

## Read-on-demand map

- `docs/compliance/intended-use.md` — health-adjacent copy, recommendation wording, compliance boundaries
- `docs/architecture/evidence-registry-and-rule-governance-v1.md` — provenance / evidence logic
- `docs/roadmap/v1-checkpoint-and-next-agent-brief.md` — planning the next implementation seam
- `GLOSSARY.md` — abbreviations and term meanings
- `README.md` — broad repo orientation
- `supabase/README.md` — Supabase workflow, CI commands, secrets, deploy procedure

## Guardrails

- Keep the product boundary explicit; normative detail in `docs/compliance/intended-use.md`.
- Keep ApoB primary and LDL fallback/secondary.
- Keep severity separate from coverage.
- Keep Notion out of hidden runtime logic.
- Do not treat the Priority Score as a clinical risk score.
- Keep raw personal health data, direct identifiers, and unsafe artifacts out of the repo. Use `docs/compliance/data-handling-and-redaction.md` as the canonical operational policy.
