# Android Build Environment

This file documents the environment expected by the local APK build path and the EAS fallback.

## Required tools

- Node.js 20.x or newer
- JDK 17
- Android SDK installed either via Android Studio or `sdkmanager`
- Expo CLI via `npx expo`

## JDK pin

Use JDK 17 for Android builds. If your machine uses `asdf`, set it in `.tool-versions` at the repo root or export `JAVA_HOME` to a JDK 17 install.

Check the active version:

```bash
java -version
```

## Android SDK path

Use whichever SDK path is already configured on the machine:

- Android Studio default on macOS: `~/Library/Android/sdk`
- `sdkmanager` installs should point to the same root via `ANDROID_SDK_ROOT`

Recommended exports:

```bash
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$PATH"
```

## Mobile app environment variables

Set these before `expo prebuild` or `eas build`:

```bash
export EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL="https://<project-ref>.supabase.co"
export EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY="<anon-key>"
export EXPO_PUBLIC_ONE_L1FE_FUNCTION_PATH="save-minimum-slice-interpretation"
```

## Signing material

- Release signing is managed by EAS credentials and must not be committed.
- Store the real debug or development keystore outside the repo, for example under `~/Library/Application Support/One-L1fe/android/keystores/dev.keystore`.
- The committed file `android/keystores/dev.keystore.example` is only a placeholder reference.
