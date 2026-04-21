# OnePlus 13R / OxygenOS 15 — End-User Setup Runbook

Target device: **OnePlus 13R**, OxygenOS 15 (Android 15 base, global ROM).

Apply all six steps before running the 24-hour verification checkpoint.
Three apps are affected throughout: **Garmin Connect**, **Health Connect**, **One L1fe**.

---

## Step 1 — Auto-launch

> Settings → Apps → Special app access → Auto-launch

- Enable Auto-launch for: Garmin Connect, Health Connect, One L1fe.

_Why:_ OxygenOS 15 blocks apps from starting themselves after a reboot unless
auto-launch is explicitly granted. Without this, Garmin Connect cannot push data
to Health Connect after the phone restarts.

---

## Step 2 — Battery optimization

> Settings → Battery → Battery optimization

- Set all three apps to **Don't optimize** (labelled "Unrestricted" on some OxygenOS 15 builds).

_Why:_ Standard battery optimization defers or kills background work after the screen
turns off. Health Connect sync from Garmin Connect runs in the background and will
be silently dropped.

---

## Step 3 — Deep optimization / Advanced optimization

> Settings → Battery → More settings → Advanced optimization

- Disable deep/advanced optimization for all three apps.

_Why:_ OxygenOS 15 adds a second optimization layer on top of stock Android battery
management. Even with Step 2 applied, this layer can freeze apps during extended
idle periods.

---

## Step 4 — Sleep standby optimization

> Settings → Battery → More settings → Sleep standby optimization

- Disable **globally** during the initial verification period.
- After 24 h of confirmed sync, you may re-enable it if desired.

_Why:_ Sleep standby aggressively terminates processes while the phone is on the
charger overnight — exactly when Garmin Connect typically performs its full sync.

---

## Step 5 — Background activity (per app)

For each of the three apps:

> Long-press app icon → App info → Battery usage → Allow background activity

_Why:_ This is a third, per-app gate in OxygenOS that overrides the global battery
settings above for specific apps.

---

## Step 6 — Lock in Recents

- Open the three apps so they appear in the Recents screen.
- Swipe the card **down** (or long-press) → tap the **padlock** icon.

_Why:_ Locked apps are excluded from the automatic Recents cleanup that runs when
memory pressure occurs. Without the lock, the OS can kill Garmin Connect between
sync cycles.

---

## Verification checkpoint (after 24 h + one phone restart)

- [ ] Open Health Connect → Browse data → Garmin Connect is listed as a data source.
- [ ] At least one data type (e.g. Steps) shows a record with timestamp within the **last 12 h**.
- [ ] Open One L1fe → Wearable Sync screen → last sync shows within **12 h**.
- [ ] In Supabase: `select * from wearable_sync_runs order by started_at desc limit 1;`
  — `started_at` is within 12 h of now.

If the checkpoint fails after one restart, recheck Step 4 (Sleep standby) and
confirm Garmin Connect has Bluetooth / location permissions as well.
