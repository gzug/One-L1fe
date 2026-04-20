package com.onel1fe

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

/**
 * Task 4 — Native Android Health Connect stub.
 *
 * Placeholder MainActivity wired for Health Connect permission handling.
 * The actual `requestPermissions` call must be triggered from JS via
 * `react-native-health-connect`'s `requestPermission()` bridge, which
 * internally calls `HealthConnectClient.requestPermissionsActivityContract()`.
 *
 * TODO(hardware-verification): Once a physical Android device is available,
 * verify that `initialize()` returns true and the permission dialog appears.
 * Track in: docs/garmin-datapath-tech-debt.md
 */
class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "OneL1fe"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
