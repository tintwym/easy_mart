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

## Submitting to the stores

- **Apple App Store**: In Xcode, set up signing (Apple Developer account), then Archive and upload to App Store Connect.
- **Google Play**: In Android Studio, build a release bundle (e.g. Build → Generate Signed Bundle / APK) and upload to Google Play Console.

## Notes

- The app is a WebView pointing at your Laravel URL. No separate front-end codebase.
- After deploying changes to your site, users get them on the next app launch (no app update needed for backend/Inertia changes).
- To change the URL the app loads, update `server.url` in `capacitor.config.ts` (or `CAPACITOR_SERVER_URL`) and run `npm run cap:sync` again, then rebuild the native app.
