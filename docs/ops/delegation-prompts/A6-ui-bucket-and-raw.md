# A6 — UI Surface for Bucket and Raw Score

**Target agent:** ChatGPT Codex
**Workstream:** A (Metrics & Logic → Mobile surface)
**Depends on:** A3
**Blocks:** none

---

## Context

Design 2.5 returns both a bounded `bucket` 0–4 (primary signal for the
user) and a `rawScore` (weighted sum, power-user surface). The mobile
app needs to show the bucket prominently and the raw score as a
secondary tap-through. The user explicitly requested: "make it clear
in the app that the trend skeleton is read-only and does not affect
the score."

Relevant screens:

- `apps/mobile/src/screens/MinimumSliceScreen.tsx` — main panel view
  rendered from `evaluateMinimumSlice()`.
- `apps/mobile/src/screens/DeveloperInsightsScreen.tsx` — existing
  power-user surface.

## Goal

Surface Design 2.5 output in the mobile UI in a way that:

1. A non-technical user sees the bucket (0–4) with a pillar breakdown
   and an evidence-class badge, and nothing confusing.
2. A power user can tap through to see the raw weighted score and the
   per-marker contributions.
3. Trend data — when populated later by A7 — renders as a
   "Trend (preview, does not affect score)" section, visually
   de-emphasized and read-only.

## Design spec

### Primary card (bucket)

- Big number: bucket 0–4.
- Label: "Priority Level" (0 = all clear, 4 = act now).
- Pillar chips below: `Cardiovascular`, `Metabolic`, `Inflammation`,
  `Nutrient context` — each tinted by its own pillar bucket.
- Evidence badge: `Strong` / `Moderate` / `Limited` / `Unanchored`.
  Tap opens a sheet listing the anchors.
- If bucket was clamped to 0 due to `NOT_EVIDENCE_ANCHORED`, show a
  warning banner: "No evidence anchors — score suppressed. Tap to
  learn why."

### Secondary tap-through (raw score)

- Raw weighted score (e.g. `rawScore: 17`).
- Per-marker contributions: marker name → weighted score → status.
- Sorted descending by weighted score.
- "Why is this marker contributing?" link per row → opens evidence
  anchors for that marker's rules.

### Trend section (read-only, v1 null)

- Render only if `trendSkeleton !== null`.
- Label: `Trend (preview, does not affect score)`.
- Show sparkline + `sparse: true` warning when applicable.
- Must be visually distinct: muted color, italic caption.
- No tap interaction to score — tapping opens an info sheet explaining
  why trend is read-only in v1.

## Deliverables

1. Updated `MinimumSliceScreen.tsx` — primary card + pillar chips +
   evidence badge.
2. New component `apps/mobile/src/components/PriorityScoreCard.tsx`
   — reused in `MinimumSliceScreen` and `DeveloperInsightsScreen`.
3. New component `apps/mobile/src/components/TrendSectionReadOnly.tsx`
   — renders `trendSkeleton`, hidden when null.
4. Navigation: tapping primary card opens a modal sheet with raw
   score breakdown. No new route needed — modal only.
5. Text copy in English, German translation file updated if i18n is
   already in place; if not, English only.

## Constraints

- Do not change domain layer. Consume `PriorityScoreResult` as-is
  from A3.
- No new third-party dependencies. Use existing chart lib if one
  exists; otherwise simple SVG sparkline is fine.
- Accessibility: every numeric value readable by screen reader.
- Dark mode must work if the app already supports it.

## Acceptance criteria

- Screenshot in PR description: all-optimal panel (bucket 0, no
  warning banner, trend hidden).
- Screenshot: ApoB 165 panel (bucket 4, cardiovascular pillar chip
  red, evidence badge `moderate`).
- Screenshot: unanchored panel (bucket 0 + warning banner).
- Tap-through modal renders per-marker contributions in correct order.

## Hand-back checklist for Opus review

- [ ] No domain-layer edits.
- [ ] Trend section clearly marked read-only with "does not affect
      score" caption.
- [ ] Warning banner fires on `NOT_EVIDENCE_ANCHORED`.
- [ ] Power-user surface lives behind a tap, not on the primary card.
- [ ] Screenshots attached for all three scenarios.
