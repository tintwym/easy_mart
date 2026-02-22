# How to release the EasyMart APK

Use this guide to build a **release APK** and offer it on your site (e.g. at `/download`) so users can install without the Play Store.

---

## Prerequisites

- **Node.js** and **npm** installed
- **Android Studio** installed ([developer.android.com/studio](https://developer.android.com/studio))
- Your **Laravel app deployed** at a public HTTPS URL (e.g. `https://easymart-db88033013be.herokuapp.com`)
- **Java** (usually comes with Android Studio)

---

## Step 1: Set the app URL (if needed)

If your live site URL is different from the one in the project, set it before building:

```bash
# Replace with your real URL
export CAPACITOR_SERVER_URL=https://your-app.herokuapp.com
```

Or edit `capacitor.config.ts` and set `server.url` to your production URL.

---

## Step 2: Build the web app and sync Android

From the project root:

```bash
npm run build
npm run cap:sync
```

Or in one go:

```bash
npm run build && npx cap sync android
```

This updates the Android project with the latest web build and config.

---

## Step 3: Open the Android project

```bash
npx cap open android
```

Android Studio will open with the `android` project.

---

## Step 4: Create a release APK

### Option A: Unsigned APK (quick test only)

- **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- Wait for the build. When it finishes, click **locate** in the notification.
- The APK is at:  
  `android/app/build/outputs/apk/debug/app-debug.apk`  
  (Debug APKs are not signed for release; use only for testing.)

### Option B: Signed release APK (for real users)

1. **Build** → **Generate Signed Bundle / APK**
2. Choose **APK** → **Next**
3. **Create new** (first time) or **Choose existing** (later):
   - **Key store path**: e.g. `easymart-upload-key.jks` (store this file safely).
   - **Password** and **Key alias** + **Key password**.
   - Fill in certificate details (name, org, city, country). Validity e.g. 25 years.
4. Click **Next**, choose **release** build variant.
5. Click **Create**. The signed APK is at:  
   `android/app/build/outputs/apk/release/app-release.apk`

**Important:** Keep the `.jks` file and all passwords safe. You need them for every future update.

---

## Step 5: Put the APK on your site

1. Copy the **release** APK you built (e.g. `app-release.apk`) into your project:
   ```bash
   cp android/app/build/outputs/apk/release/app-release.apk public/downloads/easymart.apk
   ```
2. If `public/downloads` doesn’t exist, create it first:
   ```bash
   mkdir -p public/downloads
   ```
3. Commit and **deploy** your app (e.g. push to Heroku). The file `public/downloads/easymart.apk` will be served at:
   `https://your-site.com/downloads/easymart.apk`

---

## Step 6: Download page

Your site already has a **Download** page at:

**`https://your-site.com/download`**

There users can:

- Tap **Download APK** to get `easymart.apk`
- Read short install steps (allow “Install from unknown sources” on Android if asked)

No extra code is needed as long as `public/downloads/easymart.apk` exists after deploy.

---

## Checklist

- [ ] `npm run build` and `npx cap sync android` run without errors
- [ ] Android Studio opens with `npx cap open android`
- [ ] Signed release APK built (Generate Signed Bundle / APK → APK → release)
- [ ] APK copied to `public/downloads/easymart.apk`
- [ ] Project deployed (e.g. `git push heroku main`)
- [ ] Visit `https://your-site.com/download` and confirm the download button works

---

## Updating the APK later

1. Change code or config as needed.
2. Run again: `npm run build && npx cap sync android`
3. In Android Studio: **Build** → **Generate Signed Bundle / APK** → use the **same keystore** as before.
4. Replace `public/downloads/easymart.apk` with the new `app-release.apk` (renamed to `easymart.apk`).
5. Deploy again.

Users who already installed the app will keep it; new installs will get the latest APK from `/download`.
