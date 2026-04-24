---
status: current
owner: repo
last_verified: 2026-04-24
audience: trusted-user (brother)
---

# One L1fe Android Test Install

Simple guide for installing the first One L1fe test app on a **OnePlus 13R**.

You do **not** need to be in the same country, same Wi-Fi, or near Max.
You only need:

- your Android phone
- internet on the phone
- the APK download link from Max
- your One L1fe login email/password from Max

The app is not from the Play Store yet. You install it directly from a file.

---

## 1. Wait for the download link

Max will send you a link. It may look like this:

```text
https://expo.dev/artifacts/eas/...
```

Open the link **on your OnePlus phone**, not on your laptop.

Good ways to receive the link:

- WhatsApp
- Signal
- Telegram
- email

Same Wi-Fi is **not** needed.

---

## 2. Download the app file

1. Tap the link from Max.
2. Your browser opens.
3. Tap **Download**.
4. Wait until the download is finished.

The file should end with:

```text
.apk
```

Example:

```text
one-l1fe.apk
```

---

## 3. Allow installation from this source

Android may say that apps from the browser are blocked. This is normal.

If you see a warning:

1. Tap **Settings**.
2. Enable **Allow from this source**.
3. Go back.
4. Tap the downloaded APK again.

If you want to find the setting manually:

```text
Settings -> Apps -> Special app access -> Install unknown apps
```

Then choose the app you used to download the file, usually:

- Chrome
- Files
- Gmail
- WhatsApp

Enable:

```text
Allow from this source
```

---

## 4. Install One L1fe

1. Open the downloaded `.apk` file.
2. Tap **Install**.
3. Wait a few seconds.
4. Tap **Open**.

If Google Play Protect asks about the app, choose:

```text
Install anyway
```

Only do this for the One L1fe link from Max.

---

## 5. Log in

1. Open **One L1fe**.
2. Enter the email and password Max sent you.
3. Tap **Log in**.

If login fails:

- check that the email/password are exactly correct
- tell Max the error message

Do not create a new account yourself.

---

## 6. First app guide

When you open the app for the first time, a short guide appears.

It explains:

- One L1fe Score
- confidence and data coverage
- Health / Nutrition / Mind & Sleep / Activity dots
- Ask One L1fe
- Doctor Prep
- Menu
- connecting the first data source

You can tap:

```text
Skip
```

or continue through the guide.

You can open the guide again later with the small:

```text
i
```

button on the Home screen.

---

## 7. Connect the Garmin watch to Garmin Connect

Do this first if you want watch data in One L1fe.

Important:

Do **not** pair the watch only through Android Bluetooth settings.
Pair it inside the **Garmin Connect** app.

1. Install **Garmin Connect** from the Google Play Store.
2. Open **Garmin Connect**.
3. Log in with your Garmin account.
4. Tap **More** in the bottom right.
5. Tap **Garmin Devices**.
6. Tap **Add Device**.
7. Put your Garmin watch into pairing mode.

On many Garmin watches this is under something like:

```text
Settings -> Phone -> Pair Phone
```

or:

```text
Settings -> Connectivity -> Phone -> Pair Phone
```

8. In Garmin Connect, choose your watch.
9. Confirm the code shown on the watch.
10. Finish the setup steps in Garmin Connect.

After pairing, keep Bluetooth on.

---

## 8. Make sure Garmin data is syncing

Before connecting One L1fe, check that Garmin itself works.

1. Wear the watch for a while.
2. Open **Garmin Connect**.
3. Pull down on the Garmin Connect home screen to sync.
4. Wait until sync finishes.
5. Check that Garmin Connect shows some data, for example:
   - steps
   - heart rate
   - sleep
   - workout

If Garmin Connect shows no data, One L1fe cannot receive it yet.
Fix Garmin Connect first.

---

## 9. Connect Garmin Connect to Health Connect

Now connect Garmin to Android Health Connect.

Garmin sends data **one way**:

```text
Garmin watch -> Garmin Connect -> Health Connect
```

Garmin does not read data back from Health Connect.

On Android 14 or newer, Health Connect is usually built into Android.
On some phones it may also appear as a separate **Health Connect** app.

Try this first:

1. Open **Settings** on the phone.
2. Search for **Health Connect**.
3. Open **Health Connect**.
4. Tap **App permissions**.
5. Find **Garmin Connect**.
6. Allow Garmin Connect to write/share the health data you want.

Allow at least:

- Steps
- Heart rate
- Sleep
- Exercise / workouts
- Distance
- Calories

If you cannot find Garmin Connect inside Health Connect:

1. Open **Garmin Connect**.
2. Tap **More**.
3. Search in Garmin settings for **Health Connect**.
4. Follow the Garmin prompts to enable sharing.

Menu names can vary slightly by Android/Garmin version.
If you get stuck, send Max a screenshot.

After enabling it:

1. Open Garmin Connect.
2. Sync the watch again.
3. Open Health Connect.
4. Check that Garmin Connect appears as a connected app.

---

## 10. Connect Health Connect to One L1fe

At the end of the guide, tap:

```text
Yes, connect data
```

This opens the Activity / Wearable Sync area.

You can also open it manually:

1. Open **One L1fe**.
2. On Home, tap **Activity**.
3. Tap **Wearable Sync**.

One L1fe uses **Health Connect** on Android.

If One L1fe asks for access, tap:

```text
Grant access
```

If Android asks for permissions, allow the health data types you want to test.
For the first test, allow at least:

- Steps
- Heart rate
- Resting heart rate
- HRV
- Sleep
- Distance
- Active calories
- Exercise / workouts

After granting access:

1. Return to One L1fe.
2. Tap **Sync Now** on the Wearable Sync screen.
3. Wait for the result.

If sync works, One L1fe should show a success message.
If sync fails, send Max a screenshot of the error.

---

## 11. Quick connection checklist

The full path should be:

```text
Garmin watch
  -> Garmin Connect
  -> Health Connect
  -> One L1fe
```

Check in this order:

1. Garmin watch is paired inside Garmin Connect.
2. Garmin Connect shows recent watch data.
3. Health Connect shows Garmin Connect as a connected app.
4. One L1fe has Health Connect permission.
5. One L1fe Wearable Sync runs without an error.

If one step is broken, the next step will not work.

Garmin direct connection may come later. For now the important path is still:

```text
Garmin watch -> Garmin Connect -> Health Connect -> One L1fe
```

---

## 12. OnePlus 13R battery settings

OnePlus sometimes stops health apps in the background.

For better testing, set these apps to run in the background:

- One L1fe
- Health Connect
- Garmin Connect, if you use Garmin

On the OnePlus 13R, check:

```text
Settings -> Battery -> Battery optimization
```

Set the apps to:

```text
Don't optimize
```

or:

```text
Unrestricted
```

Also check:

```text
Settings -> Apps -> Special app access -> Auto-launch
```

Enable Auto-launch for:

- One L1fe
- Health Connect
- Garmin Connect, if used

This helps background sync work correctly.

---

## 13. Updating the app later

When Max sends a new version:

1. Open the new APK link on your phone.
2. Download the file.
3. Install it.

Usually Android installs it over the old version.

If Android says:

```text
App not installed
```

then:

1. Uninstall the old One L1fe app.
2. Install the new APK again.
3. Log in again.

---

## Quick troubleshooting

### The link does not open

Send Max a screenshot.

### The APK does not download

Try Chrome instead of the app where you opened the link.

### Android blocks the install

Enable:

```text
Allow from this source
```

for Chrome or Files.

### Login does not work

Send Max:

- the email you used
- the exact error message
- a screenshot if possible

### Health Connect does not connect

Send Max:

- screenshot of the Health Connect screen
- Android version
- whether Garmin Connect is installed

### The app opens but looks wrong

Force-close One L1fe and open it again.
If it still looks wrong, send Max a screenshot.

---

## Important

This is a private test app.
Do not forward the APK link to other people.
Do not post screenshots with personal health data publicly.

---

## Source notes for Max

Last checked: 2026-04-24.

- Garmin support: pair the watch through Garmin Connect, not only Android Bluetooth settings.
- Garmin support: Garmin Connect can share data one way into Health Connect on Android 14+; Garmin Connect syncs to Health Connect after a successful device sync.
- Android / Health Connect docs: Health Connect manages app permissions and connected apps; users can start from the Health Connect app or Android settings.
