# apps/mobile

Thin Expo app for the One L1fe minimum-slice mobile seam.

## What this is

- A minimal React Native / Expo screen that renders the minimum-slice lab form.
- Uses the shared domain controller (`minimumSliceScreenController.ts`) and model.
- Submits authenticated requests to the hosted Supabase edge function.
- Auth is handled by Supabase (`@supabase/supabase-js`) - real app session, not env placeholders.

## Required env vars

Create `apps/mobile/.env` (never commit):

```
EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY=<your-anon-key>
# Optional: override the default function path slug
# EXPO_PUBLIC_ONE_L1FE_FUNCTION_PATH=save-minimum-slice-interpretation
```

Get `SUPABASE_URL` and `SUPABASE_ANON_KEY` from: Supabase Dashboard -> Project -> Settings -> API.

## How to run

```bash
cd apps/mobile
npm install
npx expo start
```

Then open in iOS Simulator, Android Emulator, or Expo Go.

## How to test a real authenticated submit

1. Ensure `.env` has real `EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL` and `EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY`.
2. Start the app: `npx expo start`.
3. The app opens on the Login screen. Sign in with a real Supabase Auth user.
4. Fill in the minimum-slice form (or use the pre-filled demo draft).
5. Tap **Submit**.
6. Expected: `Status: success`, `Interpretation run: <uuid>` shown in the Submission summary.
7. Verify in Supabase Dashboard -> Table Editor -> `lab_results` that a row exists under the correct `profile_id`.

## Quick failure smoke checks

Run these once before calling the seam proven:

1. Wrong password -> Login screen shows an error, no crash.
2. Missing env vars -> Login screen stays visible and shows a clear config error instead of crashing.
3. Signed-out launch -> Login screen is shown instead of the form.
4. Sign out from the signed-in screen -> app returns cleanly to Login without stale form access.
5. Hosted function error -> submission summary shows an error instead of hanging silently.

## Auth flow

```
App starts
  +-- getMobileSupabaseClient().auth.getSession()
       +-- session exists  -> show SessionBar + MinimumSlice form screen
       +-- no session      -> show LoginScreen
            +-- signInWithPassword() success -> show signed-in screen

Signed-in screen
  +-- SessionBar -> signOut() -> return to LoginScreen

Form screen: Submit button
  +-- controller.submit()
       +-- createMobileSupabaseAuthSessionProvider().getSession()
            +-- passes { user.id, access_token } to minimumSliceScreenController
                 +-- POST /functions/v1/save-minimum-slice-interpretation
```

## File map

| File | Role |
|---|---|
| `App.tsx` | Root component, auth state machine, signed-in shell |
| `LoginScreen.tsx` | Email/password sign-in UI |
| `SessionBar.tsx` | Signed-in session identity + sign-out action |
| `mobileSupabaseAuth.ts` | Supabase client singleton + `MinimumSliceAuthSessionProvider` adapter |
| `minimumSliceScreenController.ts` | Screen controller (auth-provider-agnostic) |
| `minimumSliceScreenModel.ts` | Screen model, submit logic |
| `minimumSliceHostedConfig.ts` | Hosted endpoint config |
| `.env.example` | Env var template |
