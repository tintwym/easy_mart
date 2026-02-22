# EasyMart native mobile app (Capacitor)

The iOS and Android apps are built with [Capacitor](https://capacitorjs.com/). They load your **deployed** Laravel app in a full-screen WebView (same codebase as the website).

## Prerequisites

- **Deployed app**: Your Laravel app must be live at a public HTTPS URL (e.g. Heroku). The mobile app loads that URL.
- **macOS**: Required for building the iOS app (Xcode).
- **Android Studio**: Required for building the Android app.

## Configuration

- **App URL**: Edit `capacitor.config.ts` and set `server.url` to your production (or staging) URL, or set the env var when syncing:
  ```bash
  CAPACITOR_SERVER_URL=https://your-app.herokuapp.com npm run cap:sync
  ```
- **App name / ID**: In `capacitor.config.ts`, `appName` is "EasyMart" and `appId` is "com.easymart.app". Change `appId` if you need a different bundle identifier for the stores.

## Build and run

1. **Build the web app** (so `public/build` is up to date):
   ```bash
   npm run build
   ```

2. **Sync native projects** (copies config and assets into `ios/` and `android/`):
   ```bash
   npm run cap:sync
   ```

3. **Open in IDE and run**:
   - **iOS**: `npx cap open ios` → Xcode opens; pick a simulator or device and run.
   - **Android**: `npx cap open android` → Android Studio opens; pick an emulator or device and run.

Or use the shortcut scripts:

- **iOS**: `npm run cap:ios` (builds web, syncs, opens Xcode)
- **Android**: `npm run cap:android` (builds web, syncs, opens Android Studio)

## Publishing to the stores

See **[docs/STORE_PUBLISHING.md](STORE_PUBLISHING.md)** for step-by-step instructions to publish EasyMart on Google Play and the Apple App Store (accounts, signing, build, and submission).

## Direct APK distribution (no store)

You can offer the Android APK for download from your own site so users can install without the Play Store:

1. **Build a release APK** in Android Studio (Build → Build Bundle(s) / APK(s) → Build APK(s), or use a signed release APK).
2. **Copy the APK** to `public/downloads/easymart.apk` in this project (create the `downloads` folder if needed).
3. **Deploy** your site. The **Download** page will be available at `/download` with a download button and install instructions.

Users open your site on their phone, go to **/download**, tap **Download APK**, and install (they may need to allow “Install from unknown sources” in Android settings once).

## Notes

- The app is a WebView pointing at your Laravel URL. No separate front-end codebase.
- After deploying changes to your site, users get them on the next app launch (no app update needed for backend/Inertia changes).
- To change the URL the app loads, update `server.url` in `capacitor.config.ts` (or `CAPACITOR_SERVER_URL`) and run `npm run cap:sync` again, then rebuild the native app.
