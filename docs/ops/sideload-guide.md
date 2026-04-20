---
status: current
owner: repo
last_verified: 2026-04-20
audience: trusted-user (brother)
---

# Sideload Guide — One L1fe Android APK

This guide lets a trusted user install the One L1fe app directly from an APK
without going through the Play Store.

---

## Step 1 — Enable Unknown Sources (Android)

1. Open **Settings** on your Android phone
2. Go to **Apps** → **Special app access** → **Install unknown apps**
3. Find your browser (e.g. Chrome) or Files app
4. Enable **Allow from this source**

> On some devices this is under **Settings → Security → Install unknown apps**.

---

## Step 2 — Get the APK link

The builder (Max) will send you a direct download link from EAS.
It looks like:
```
https://expo.dev/artifacts/eas/...
```

Open the link on your phone and tap **Download**.

---

## Step 3 — Install

1. Open your **Downloads** folder (Files app)
2. Tap the `.apk` file
3. Tap **Install**
4. If prompted "Play Protect" — tap **Install anyway**

---

## Step 4 — Login

Use the credentials Max sent you.
The app connects to the shared Supabase backend.

---

## Updates

When a new version is ready, Max will send a new APK link.
Install it over the existing app — your data is stored in the cloud, nothing is lost.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "App not installed" | Uninstall old version first, then re-install |
| "Parse error" | Download the APK again — file may be corrupted |
| Can't log in | Ask Max to check your user account in Supabase |
| Blank screen on launch | Force-close and reopen the app |
