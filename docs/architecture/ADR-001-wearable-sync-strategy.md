---
status: current
canonical_for: wearable sync architecture decision
owner: repo
created: 2026-04-19
adr_number: "001"
decision: hybrid — native platform stores first, Terra API as optional later lane
scope: architecture
---

# ADR-001 — Wearable Sync Strategy

## Status

**Accepted**

## Context

The next mobile screen after the Lab Panel is a wearable sync surface. Before building it, we need a decision on the integration architecture: how does wearable data get from the user's device into Supabase?

Three options were evaluated:

1. **Direct native integration** — read from HealthKit (iOS) or Health Connect (Android) directly in the React Native app
2. **Terra API** — use the Terra wearables middleware platform to normalise data from multiple device vendors
3. **Hybrid** — native platform stores first, Terra as an optional later lane for vendor-specific integrations

The decision affects: time to first real data, lock-in exposure, ongoing cost, API key management complexity, and the correctness of the existing `react-native-health-connect` scaffolding already in `main`.

---

## Decision

**Use native platform stores first (Health Connect for Android, HealthKit for iOS). Terra API is parked as a future optional lane, not part of V1.**

---

## Options Analysis

### Option A: Direct native integration (HealthKit / Health Connect)

**What it means:**
- Android: `react-native-health-connect` reads from Health Connect, which aggregates data from Garmin Connect, Oura, Google Fit, Samsung Health, etc.
- iOS: `@kingstinct/react-native-healthkit` (or equivalent) reads from HealthKit, which aggregates Apple Watch, Garmin, Whoop, etc.
- The mobile app owns the sync loop: request permissions, read records, normalise, POST to Supabase.

**Time to ship:** Lowest. `react-native-health-connect` scaffolding is already in `main` with permission gate, hook, and sync client. Android work remaining: `MainActivity.kt` + `AndroidManifest.xml` native wiring (one-time manual step).

**Cost:** Zero API cost. Permission and data access is local to device.

**Lock-in:** None to third-party. Lock-in only to platform APIs (HealthKit/Health Connect), which is the lowest possible for a health-adjacent app in the Apple/Google ecosystem.

**Quality / coverage:** Covers all major consumer wearables (Garmin, Apple Watch, Fitbit, Whoop, Oura, Samsung) indirectly through their Health Connect and HealthKit integrations. No direct vendor API knowledge required.

**Limitations:**
- Requires background-sync opt-in per platform to sync when app is not open. V1 can start with foreground sync on app open.
- Health Connect is Android 9+ only (covers ~97% of active Android devices as of 2025).
- Historical backfill depth is platform-limited (~30 days for some record types on Health Connect without explicit backfill permission).
- iOS requires a real device for any HealthKit testing (no simulator support).

---

### Option B: Terra API

**What it means:**
- Terra is a health-data middleware SaaS that normalises output from 50+ wearable vendors via OAuth-based device connections.
- The mobile app connects a user's Garmin/Oura/Whoop/etc. account via Terra's OAuth widget, then Terra pushes normalised data to a webhook endpoint (Supabase function).
- Terra handles the per-vendor API differences, rate limits, and schema normalisation.

**Time to ship:** Medium. Requires: Terra account + API key setup, webhook endpoint in Supabase, Terra React Native SDK integration, user OAuth flows per device brand, end-to-end webhook delivery testing. Estimate: 2–4 weeks of focused work vs 2–5 days to finish native Android wiring.

**Cost:**
- Terra free tier: up to ~100 connected users, then $0.05–$0.15/user/month depending on plan.
- At 1,000 users: ~$50–$150/month. At 10,000 users: ~$500–$1,500/month.
- Cost is predictable but scales linearly with user count and is non-zero before any revenue.
- Terra can add pricing tiers, change rate limits, or be acquired — cost and availability risk.

**Lock-in:** HIGH. Terra normalises the schema; if Terra changes schema versions or pricing, or discontinues a connector, our ingest path breaks. Migrating away from Terra later means rebuilding all webhook/normalisation logic plus re-authenticating all users. This is the primary concern.

**Quality / coverage:** Best per-vendor raw data access (Garmin Connect API has richer data than Health Connect for some metrics like stress, body battery, VO2max estimates). Terra normalises this, but the normalised schema introduces its own abstraction overhead.

**Limitations:**
- External service dependency for a core data path. Outage = no sync.
- User must authorise each wearable via OAuth (extra friction in onboarding).
- Webhook delivery requires a publicly reachable Supabase function endpoint at all times.
- Terra's normalised schema may not cleanly map to our `wearable_metric_definitions` taxonomy without translation.

---

### Option C: Hybrid (native first, Terra as optional later lane)

**What it means:**
- Ship native Health Connect (Android) + HealthKit (iOS) as the V1 path.
- Treat Terra as a future option for users who want deeper vendor-specific data (e.g. Garmin Body Battery, Oura readiness score) if that demand materialises.
- The internal wearable schema (`wearable_observations`, `wearable_sources`) is designed vendor-agnostic, so a Terra ingest path can be bolted on without schema changes.

**Time to ship:** Same as Option A for V1. Terra lane adds zero work until we decide to build it.

**Cost:** Zero until Terra lane is activated. At that point, only pay for users who specifically opt in to a vendor-direct connection.

**Lock-in:** None in V1. Terra lock-in is limited to the optional lane and is never in the critical path.

---

## Comparison Table

| Dimension | Option A (Native) | Option B (Terra) | Option C (Hybrid) |
|---|---|---|---|
| Time to first data | 2–5 days | 2–4 weeks | 2–5 days |
| V1 API cost | $0 | ~$50–150/mo at 1k users | $0 |
| Lock-in risk | Low (platform APIs) | High (Terra schema + pricing) | Low in V1 |
| Coverage | All major wearables via HC/HK | 50+ vendors natively | All major via HC/HK; more later |
| Schema control | Full | Partial (Terra normalises) | Full in V1 |
| Existing scaffolding | Yes (already in main) | No | Yes |
| Recommended for V1 | Yes | No | Yes (= this decision) |

---

## Rationale for Hybrid

The `react-native-health-connect` path is already scaffolded, permission-gated, and backend-ready. The Android native wiring is the only remaining step. Starting with Terra instead would:
1. Add 2–3 weeks before first real data
2. Introduce a paid external dependency before any user revenue
3. Create schema lock-in that is expensive to undo later

The hybrid framing is correct because the internal schema is already vendor-agnostic. Adding a Terra ingest path later (as a Supabase webhook function + Terra SDK integration) does not require schema changes. We preserve the option without paying for it now.

For the Garmin-first priority: Garmin data reaches Health Connect via the Garmin Connect app on Android. The native path covers the current target device without a direct Garmin API.

---

## Consequences

### What this enables
- Android Health Connect path can be completed within current sprint (manual native wiring + replace `MOCK_APP_INSTALL_ID`).
- iOS HealthKit path can follow once Android is proven.
- No new API keys, external accounts, or SaaS dependencies for V1.

### What this defers
- Direct Garmin Connect API (richer data for Garmin-specific metrics like stress, body battery).
- Oura, Whoop, Fitbit direct integrations.
- Terra integration as optional lane for users needing vendor-specific depth.

### What this does NOT do
- This decision does not affect the backend schema (wearable_sources, wearable_observations, wearable_daily_summaries remain as designed).
- This decision does not affect the Garmin-first metric priority (`resting_heart_rate`, `sleep_duration`, `steps_total`, `hrv`).

---

## Revisit trigger

Revisit if:
- A significant user segment has wearables not covered by Health Connect or HealthKit (unlikely for consumer Garmin/Apple Watch/Oura users).
- A specific vendor metric (e.g. Garmin training readiness) is product-critical and only available via direct vendor API.
- Terra removes free tier and pricing becomes competitive with native maintenance cost.

---

## Related docs

- `docs/architecture/wearables-and-context-schema-draft.md` — wearable schema design
- `docs/planning/wearables-hard-facts-and-automation.md` — ingestion posture
- `apps/mobile/docs/health-connect-native-setup.md` — Android native wiring steps
- `CHECKPOINT.md` — current execution state and native Android blocker
