# OnePlus 13R OxygenOS 15 Setup

This runbook is for a OnePlus 13R running OxygenOS 15 on the Android 15 base.
It focuses on keeping Garmin Connect, Health Connect, and One L1fe alive long enough for the Garmin -> Health Connect -> One L1fe path to stay visible after normal daily use and a reboot.

## What to configure

### 1. Auto-launch
Open `Settings > Apps > Special app access > Auto-launch` and enable auto-launch for:
- Garmin Connect
- Health Connect
- One L1fe

### 2. Battery optimization
Open `Settings > Battery > Battery optimization` and set each of the three apps to:
- Don’t optimize

On OxygenOS this may also appear as:
- Unrestricted

### 3. Deep optimization / advanced optimization
Open `Settings > Battery > More settings` and disable any deep optimization or advanced optimization toggle for the same three apps while you verify sync reliability.

### 4. Sleep standby optimization
Open `Settings > Battery > More settings` and disable `Sleep standby optimization` globally during verification.

### 5. Background activity
Long-press each app, open `App info`, then `Battery usage`, and allow background activity.

### 6. Lock in recents
Open each app in recents and lock it so OxygenOS is less likely to evict it during background cleanup.

## Verification checkpoint

After 24 hours and at least one phone restart:
- Health Connect should show Garmin data with timestamps within the last 12 hours.
- The One L1fe `wearable_sync_runs` table should contain a row with `created_at` within the last 12 hours.

If the data is stale or missing, re-check auto-launch and battery controls first. On OxygenOS the background policy is usually less aggressive than some ColorOS builds, but the battery manager can still suspend sync when the app is not explicitly whitelisted. That is an operational inference from the platform behavior and the OnePlus battery settings surface, not a vendor guarantee.

