---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-05-03
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Current facts

- Stable branch: `main`.
- Active mobile app: **One L1fe v2 prototype**.
- Canonical app entry: `apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx`.
- v2 code lives under `apps/mobile/prototypes/v2/src/`; `v1-marathon/` remains the previous Marathon snapshot.
- v2 bottom nav: Home, Trends, Insights, Profile.
- Home and Trends are live; Insights is a v2 placeholder shell; Profile and Test Results now both render in v2.
- v2 latest UI batch is a full premium-calm visual reset: Genoa `#31796D` brand system, refined O+1 mark, coordinated light/dark tokens, consistent header/bottom nav, Home score-first layout, redesigned Trends, Insights shell, Profile shell, and active v2 Test Results surface.
- Home display data is centralized in `homeDataAdapter.ts` / `homeTypes.ts`; adapter guardrail tests are merged.
- Trends uses existing `HomeDisplayData` only: Score, Recovery, Sleep, HRV, Resting HR, Activity, Steps, Training, Calories.
- Home and Trends currently consume adapter data independently; cross-tab mode/range sync is a follow-up only if QA shows confusion.
- Android emulator QA for the latest v2 Home batch was run on `Pixel_9_Pro` emulator (`1280x2856`, `427dp` wide, Android 15); phone score-card split now uses compact contributor rows so the score card no longer stretches/clips on OnePlus-class width.
- Android emulator QA for the full v2 visual reset was run on the same `Pixel_9_Pro` emulator; light Home plus dark Home/Trends/Insights/Profile screenshots were captured and the clipped logo mark found during QA was fixed.
- Follow-up Android QA on the same `Pixel_9_Pro` emulator confirmed: refined logo geometry, Manrope-based brand wordmark, Home contributor accordion rows, stronger disabled Nutrition states, interactive score/trend charts with vertical inspection guide, and a v2-forked `Test Results` screen replacing the legacy Blood Results surface in the active flow.
- Additional follow-up on 2026-05-03: Compare mode for `Test Results` renders the panel overview and per-marker context cards; light and dark Home screenshots were re-captured; `OneL1feV2Screen.tsx` now handles Android hardware back inside the shell (`blood -> profile -> home`) instead of relying on the system default.
- v2 polish pass 2 on 2026-05-03: distinct color families for Recovery (cool teal), Activity (olive-green), and Test Results (blue-teal); sub-shade tokens for all three families plus sub-metrics (sleep/hrv/restingHr, steps/training/calories); BrandMarkV2 O+1 arc/1 glyph overlap fixed; tooltip × changed to pastel red (`tooltipDismiss` token) in all charts; range chips removed from TrendsScreen hero and HomeScreen score trend (range lives in global header only); per-series toggle chips added to score trend on both Home and Trends; Test Results contributor dropdown now populates from loaded blood panel with value + reference range + neutral range context; NutritionHub replaced by "Next Integrations" section with 5 disabled cards (Nutrition, Mental Health, DNA Insights, Stool Analysis, Urine Analysis); blood panels wired to TrendsScreen via shell; key Pressables in BloodResultsScreenV2 now have opacity press feedback.
- v2 UX final pass on 2026-05-03 (branch `codex/v2-ux-final-pass`): Recovery color changed from teal-green to distinct blue (`#2E7DAE` light / `#6EB5D8` dark); BrandMarkV2 SVG arc pulled leftward to create clear gap from "1" glyph; score ring and trend chart title colored "1" in brandGreen; basis text updated to "Based on your active health inputs."; Activity contributor icon changed to lightning bolt; "Coming soon" → "Planned" throughout; demo gate removed from `buildScoreInsight`; Demo badge pill added to AppHeaderV2 and TrendsScreen hero when dataMode=demo; InsightsScreen "Next integrations" section removed; experiment delete requires Alert confirm; ISO date validation with red border added to ExperimentFormModal; empty score trend state adds "Connect a health source" CTA for user data mode.
- Health Connect is foreground display-only: no background sync, no Supabase write, no score recomputation.
- App config: `apps/mobile/app.json`; Expo `0.2.2`, Android `versionCode: 4`, `minSdkVersion: 26`.
- CI is green on latest `main`.

## Run

```bash
cd apps/mobile
npx expo start --clear
# or: npx expo run:android
```

## Working rules

- Keep `One L1fe` as canonical app name; keep `v2` visually secondary.
- Keep v1 Marathon stable unless explicitly fixing that snapshot.
- Fork v1 components into v2 before changing v2-specific behavior.
- Keep demo data labelled and User Data empty states honest.
- Keep product framing bounded: no diagnosis, treatment, emergency triage, or clinical-risk-score claim.
- Do not commit secrets or local build artifacts.
- Do not delete full-app/auth/backend files without import/reference audit.

## Current blockers

- Physical OnePlus-class Android device QA not yet run.
- Full-app shell files not yet reference-audited for safe deletion.
- Native Android version values drift from `app.json` unless regenerated intentionally.

## Next steps

1. Run physical OnePlus-class Android QA for Home, Trends, Profile, and Test Results if hardware is available.
2. Tighten remaining visual density issues: Home contributor row compression and Trends chart spacing on real-device screenshots.
3. If QA shows cross-tab confusion, add a minimal shared mode/range sync layer.
4. Extract pure Dot/Score domain work from issue #116 in an isolated branch with no UI changes.
5. Start Blood Intake / Scanner research as a requirements doc/issue, not code.
