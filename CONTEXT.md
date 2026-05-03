---
status: current
canonical_for: rolling session context
owner: repo
last_verified: 2026-05-02
scope: all-agents
---

# CONTEXT.md — Rolling Session Summary

Last 2–3 sessions. Hard cap: 60 lines. Max 5 bullets per entry. Updated by closing agents.
For startup: read after CHECKPOINT.md. Never load `memory/` or `docs/archive/` at startup.

---

## 2026-05-02 — Codex (v2 QA fixes: logo, charts, test results)

- Addressed concrete Android/UI issues after the premium-calm reset: removed the empty font-loading gate that caused a white screen, refined the O+1 logo geometry, and applied a Manrope-based brand wordmark for the active v2 shell.
- Home now removes the floating ring glyph, renames `Medical Test Results` to `Test Results`, swaps Nutrition to a fork/knife icon, strengthens disabled styling, and supports expandable contributor rows using existing `contributors.inputs` data only.
- Trends and Home score charts now use a shared interactive chart primitive with tap inspection, tooltip, and dashed vertical guide; bar charts were rebuilt into the same visual language.
- Forked the active Blood Results flow into `apps/mobile/prototypes/v2/src/screens/BloodResultsScreenV2.tsx` so Test Results now render in v2 instead of dropping into the legacy v1 surface; no backend/domain/scoring/auth/native config changes.
- `cd apps/mobile && npm run typecheck` passes; Android `Pixel_9_Pro` QA captured updated Home, Trends with tooltip, Profile, and Test Results screenshots.

## 2026-05-03 — Codex (v2 polish pass 2)

- Added distinct color families to v2 tokens: Recovery = cool teal (`#31796D`), Activity = olive-green (`#6E8C4A`), Test Results = blue-teal (`#4D8A91`); sub-shade triplets for sleep/hrv/restingHr and steps/training/calories; `tooltipDismiss` pastel red for chart tooltip × in all charts (light + dark).
- BrandMarkV2 O+1 geometry fixed: arc closes before x=44, "1" glyph shifted right to x≈47–55 to eliminate overlap.
- Range chips removed from TrendsScreen hero and scoreRangePill removed from HomeScreen ScoreTrendMiniChart; time range now lives exclusively in global header. Per-series toggle chips (Score/Recovery/Activity) added to Home and Trends score charts.
- Test Results contributor dropdown now populates from loaded blood panel markers with `displayValue` (string) + neutral `refContext` ("Ref lo–hi unit · Within/Above/Below range"); blood panels wired to TrendsScreen via `shellBloodPanels` state in OneL1feV2Screen shell.
- NutritionHub replaced by "Next Integrations" section: 5 premium disabled cards (Nutrition, Mental Health, DNA Insights, Stool Analysis, Urine Analysis) with icon + empty bar + "Coming soon" pill. `cd apps/mobile && npm run typecheck` passes.

## 2026-05-03 — Codex (v2 UX final pass)

- Recovery color changed to distinct blue (`#2E7DAE` light, `#6EB5D8` dark) — was identical to `brandGreen`, now visually separable in score rings and charts.
- BrandMarkV2 arc SVG pulled leftward (endpoints x=38 vs old x=44); "1" glyph shifted slightly right (x=48–56); clear gap at all sizes 24–40. Score ring label and trend chart title now show colored "1" (brandGreen).
- `buildScoreInsight` demo gate removed — insight line shows whenever deltas are non-null. Demo badge pill added to AppHeaderV2 header and TrendsScreen hero. "Coming soon" → "Planned" everywhere except type keys. Basis text updated to "Based on your active health inputs."
- Activity contributor icon replaced with lightning bolt SVG. Experiment delete requires Alert.alert confirmation. ISO regex validation + red border added to ExperimentFormModal date fields. Empty score trend state shows "Connect a health source →" CTA.
- InsightsScreen "Next integrations" section removed entirely. `cd apps/mobile && npm run typecheck` passes.

## 2026-05-03 — Codex (v2 follow-up QA closeout)

- Rechecked the unfinished parts from the prior pass: `Test Results` Compare mode now visibly renders the panel overview plus marker comparison cards, and Home dark mode was recaptured after the chart changes.
- Added Android hardware-back handling in `OneL1feV2Screen.tsx` so the active shell route stack unwinds `blood -> profile -> home` instead of depending on the system back default.
- `cd apps/mobile && npm run typecheck` still passes after the navigation change.

## 2026-05-02 — Codex (v2 full premium-calm visual reset)

- Implemented the v2 visual reset around Genoa `#31796D`: updated light/dark tokens, removed orange action styling from v2 UI, added a reusable refined O+1 `BrandMarkV2`, and aligned header/bottom nav.
- Kept Home functional boundaries intact while retuning its palette and icon/metric colors; Nutrition remains coming soon and demo/user states remain labelled.
- Rebuilt Trends into the same premium-calm shell with hero, range chips, score trend card, and quiet sage analytics cards using existing `HomeDisplayData`.
- Added v2 Insights placeholder and Profile shell; Profile now hands off to legacy Blood Results only when requested.
- `cd apps/mobile && npm run typecheck` passes; Android `Pixel_9_Pro` emulator QA captured light Home and dark Home/Trends/Insights/Profile, fixing a clipped logo mark found during QA.

