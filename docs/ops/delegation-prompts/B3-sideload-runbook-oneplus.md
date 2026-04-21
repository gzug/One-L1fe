# B3 — Sideload Runbook for OnePlus 13R

**Target agent:** Claude Haiku 4.5
**Workstream:** B (Android Build Feasibility)
**Depends on:** B1 (APK exists), B2 (HC + OxygenOS setup documented)
**Blocks:** none — last-mile artifact

---

## Context

Build target is a single OnePlus 13R (OxygenOS 15, global ROM) paired
with a Garmin Forerunner 255. The human operator (Don) will physically
install the APK via USB cable from the Mac Mini M4, or send the APK and
have the end user install from local file storage.

An existing generic sideload guide lives at `docs/ops/sideload-guide.md`.
It is not OnePlus-specific.

## Goal

Produce an OnePlus-13R-specific, step-by-step runbook the operator can
follow without re-deriving each time.

## Deliverables

- `docs/ops/sideload-runbook-oneplus-13r.md` — single markdown file,
  numbered steps, zero filler, verification checkpoints between
  sections.

## Required structure

### Section 1 — Pre-flight on the Mac Mini M4

- APK location (from B1 output path).
- Verify APK signature + size (`apksigner verify`, `ls -lh`).
- `adb devices` sanity check. Expect the OnePlus model string.

### Section 2 — Pre-flight on the OnePlus 13R

- OxygenOS 15 version check: Settings → About device → OS version.
- Confirm global ROM (not ColorOS India build) — About → OxygenOS.
- **Developer Options**: Settings → About device → tap Build number 7×.
- **USB Debugging**: Settings → System → Developer options.
- **Install via USB** / **Disable permission monitoring**: developer
  options (OnePlus toggle name varies between OxygenOS builds; list
  both labels).
- Google account logged in (Health Connect requires it).

### Section 3 — Install

- USB install: `adb install -r <path-to-app-release.apk>`.
- Offline install (messaging APK): enable "Install unknown apps" for
  the receiving app (e.g. Files, Messages, Signal). Open the APK from
  Files.
- Expected: app installs, opens to onboarding screen.

### Section 4 — Post-install configuration (from B2 OxygenOS doc)

- Reference: `apps/mobile/docs/oneplus-oxygenos-setup.md`.
- Inline checklist (copy, don't just link):
  - Auto-launch enabled for Garmin Connect, Health Connect, One L1fe.
  - Battery optimization → Don't optimize for all three.
  - Deep optimization disabled for all three.
  - Sleep standby optimization off while verifying.
  - Background activity allowed for all three.
  - Lock One L1fe in recents.
- Open Health Connect → grant each permission One L1fe requests.
- Open Garmin Connect → Settings → Health Connect → enable all relevant
  data categories.

### Section 5 — Verification

- Open One L1fe → onboarding completes → `HealthConnectPermissionGate`
  shows green.
- Trigger a wearable sync → verify a row lands in Supabase
  `wearable_sync_runs`.
- Open `DeveloperInsightsScreen` → confirm expected markers visible.
- Wait 24h + restart phone → re-open app → data still fresh.

### Section 6 — Garmin Forerunner 255 prerequisites

- Forerunner 255 paired with Garmin Connect on this phone (not
  another phone).
- Last sync within the last 6h — open Garmin Connect, swipe to sync
  before install.
- Note which 255 metrics are **not** available in Health Connect
  (Body Battery, Stress, Training Readiness, Race Predictor, HRV
  Status) so the operator does not chase a ghost.

### Section 7 — Rollback / uninstall

- `adb uninstall com.onelife.app` (or whatever the applicationId is).
- Note: Health Connect retains the permission grant history until
  cleared via HC → Manage data → App permissions.

### Section 8 — Known OnePlus / OxygenOS 15 pitfalls

- Top 3 issues from B2 research doc, each one-line symptom +
  one-line fix.

## Constraints

- Single file. No splits.
- Every command copy-pasteable.
- Every step has a clear "pass" signal.
- No screenshots required in first pass (operator adds later).

## Acceptance criteria

- Operator can go from "APK on laptop" to "verified working install on
  OnePlus 13R" using only this doc.
- Every command verified on OxygenOS 15 (cite source or test run in
  PR description).

## Hand-back checklist for Opus review

- [ ] Eight sections present.
- [ ] OnePlus-specific developer toggle labels captured (not generic
      Android).
- [ ] Garmin 255 pairing prerequisite + HC-coverage note included.
- [ ] Every command copy-pasteable.
- [ ] Verification checkpoint between sections.
- [ ] Uninstall path present.
- [ ] Linked to B2 OxygenOS doc.
