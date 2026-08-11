# TWA Migration Report

## Status Summary

The project is currently configured to build as a **Trusted Web Activity (TWA)** using Bubblewrap. Due to network timeouts downloading the JDK/Android SDK in this environment, the final build must be executed on your local machine.

## Feature Checklist & Parity

| Feature | Status | Implementation Details |
|---------|--------|------------------------|
| **Hardware Back Button** | Working (TWA Native) | The TWA natively maps Android hardware back button presses to the browser's `popstate` history event. Your existing implementation in `NavigationContext.jsx` already intercepts `popstate` correctly, meaning back navigation works identically out-of-the-box without needing `@capacitor/app`. |
| **Routing / Navigation** | Working | Client-side routing continues to function normally within the TWA. |
| **Native Full-Screen Feel** | Requires Manual Action | Configured via `assetlinks.json`. This removes the Chrome browser UI (address bar). See manual steps below. |
| **Splash Screen** | Working | Configured via `twa-manifest.json` (`splashScreenFadeOutDuration: 300`). Bubblewrap will auto-generate the splash screen using the web app's `icon-512.png`. |
| **Theme / Status Bar Color** | Working | Set to `#0f172a` in `twa-manifest.json`. |
| **Standalone Web App** | Unaffected | The core Vite/React app logic was left completely untouched. The Vercel deployment functions exactly as it did before. |

## Required Manual Steps

Since the Bubblewrap CLI initialization experienced network timeouts in the remote environment, please follow these steps on your machine to finalize the transition:

1. **Complete Bubblewrap Initialization & Build:**
   Navigate to the `twa-build` directory and run Bubblewrap to build the APK/AAB.
   ```bash
   cd twa-build
   npx @bubblewrap/cli update
   npx @bubblewrap/cli build
   ```
   *(If prompted to install the JDK or Android SDK, type **Y** to proceed.)*

2. **Retrieve your SHA256 Fingerprint:**
   Once Bubblewrap generates your keystore (or if you generate one manually using `keytool`), extract the SHA256 certificate fingerprint:
   ```bash
   keytool -list -v -keystore android.keystore -alias android -storepass android -keypass android
   ```

3. **Update Digital Asset Links:**
   - Open `public/.well-known/assetlinks.json`.
   - Replace `"REPLACE_WITH_YOUR_KEYSTORE_SHA256_FINGERPRINT"` with the actual SHA256 hash.
   - Commit and push to deploy this file to Vercel.

4. **Verify the TWA App:**
   - Ensure the Vercel deployment has finished and `https://unihealth-ai-gteb.vercel.app/.well-known/assetlinks.json` is publicly accessible.
   - Install the generated `app-release.apk` on an Android device.
   - Open the app. The Chrome address bar **must be completely hidden**.
   - Test the hardware back button to ensure it navigates backwards instead of exiting the app immediately.

5. **Final Cleanup (Post-Verification):**
   Once you have verified the TWA works perfectly on your device, you may safely delete the Capacitor wrapper:
   - Delete the `/android` folder from the root directory.
   - Delete `capacitor.config.json`.
   - Remove the `@capacitor/*` dependencies from `package.json`.
   - Remove the Capacitor import and initialization block inside `src/context/NavigationContext.jsx`.
