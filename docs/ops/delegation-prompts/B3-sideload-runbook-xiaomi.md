# B3 — Sideload Runbook for Brother's Xiaomi Phone

**Target agent:** Claude Haiku 4.5
**Workstream:** B (Android Build Feasibility)
**Depends on:** B1 (APK exists), B2 (HC + MIUI setup documented)
**Blocks:** none — this is the last-mile artifact

---

## Context

Build target is a single Xiaomi phone. The human operator (Don) will
physically install the APK, either via USB cable or by messaging the
APK and having the brother install from local file storage.

An existing generic sideload guide lives at `docs/ops/sideload-guide.md`.
It is not Xiaomi-specific.

## Goal

Produce a Xiaomi-specific, step-by-step runbook the human operator can
follow without re-deriving from first principles each time.

## Deliverables

- `docs/ops/sideload-runbook-xiaomi.md` — single markdown file, numbered
  steps, zero filler, verification checkpoints between sections.

## Required structure

### Section 1 — Pre-flight on the Mac Mini M4

- APK location (from B1 output path).
- Verify APK signature + size.
- `adb devices` sanity check.

### Section 2 — Pre-flight on the Xiaomi phone

- MIUI / HyperOS version check.
- Enable **Developer Options**: Settings → About → tap MIUI version 7x.
- Enable **USB Debugging** + **Install via USB**.
- Disable **MIUI Optimization** (Developer Options toggle).
- Account: Xiaomi account must be logged in (required for
  "Install via USB" on recent MIUI builds). Flag this — has blocked
  installs before.

### Section 3 — Install

- USB install: `adb install -r apps/mobile/.../app-release.apk`.
- Offline install (messaging APK): enable "Install from unknown
  sources" for the app used to receive the APK.
- Expected: app installs, opens to onboarding screen.

### Section 4 — Post-install configuration (from B2 MIUI doc)

- Reference: `apps/mobile/docs/xiaomi-miui-setup.md`.
- Checklist (copy inline, not just link):
  - Autostart enabled for: Garmin Connect, Health Connect, One L1fe.
  - Battery saver → No restrictions for the three apps.
  - Lock in recents for One L1fe.
  - Background activity enabled.
- Health Connect: open app, grant each permission One L1fe requests.

### Section 5 — Verification

- Open One L1fe → onboarding completes → HealthConnectPermissionGate
  shows green.
- Trigger a wearable sync → verify a row lands in Supabase
  `wearable_sync_runs`.
- Open DeveloperInsightsScreen → confirm the expected marker data
  is visible.
- Wait 24h + restart phone → re-open app → sync still fresh.

### Section 6 — Rollback / uninstall

- `adb uninstall com.onelife.app` (or whatever the applicationId is).
- Note: uninstall does not remove Health Connect permissions history.

### Section 7 — Known MIUI pitfalls

- Short list of the top 3 issues from B2 research doc, each with a
  one-line symptom + one-line fix.

## Constraints

- Single file. Do not split across multiple docs.
- No screenshots required (can be added later by human operator).
- Every command must be copy-pasteable. No pseudocode.
- Every step must have a clear "pass" signal.

## Acceptance criteria

- Human operator can go from "APK on laptop" to "verified working
  install on brother's phone" using only this document.
- Every referenced command verified to work on MIUI 14 / HyperOS 1.x
  (cite source or test run in PR description).

## Hand-back checklist for Opus review

- [ ] Seven sections present.
- [ ] Every command copy-pasteable.
- [ ] Xiaomi-account caveat in Section 2.
- [ ] Verification checkpoint between sections.
- [ ] Uninstall path present.
- [ ] Linked to B2 MIUI doc.
