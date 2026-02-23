# How to release the EasyMart iOS app

Use this guide to build the **iOS app** and offer it via **TestFlight** (beta) or the **App Store**. Unlike Android, Apple does not allow direct IPA download from your website for normal users—you use TestFlight or the App Store.

---

## Prerequisites

- **Mac** with **Xcode** (from the Mac App Store)
- **Apple Developer account** ($99/year) – [developer.apple.com/programs](https://developer.apple.com/programs/)
- Your **Laravel app** deployed at a public HTTPS URL
- **Node.js** and **npm** installed

---

## Step 1: Set the app URL

In the project root:

```bash
export CAPACITOR_SERVER_URL=https://your-app.herokuapp.com
```

Or edit `capacitor.config.ts` and set `server.url` to your production URL.

---

## Step 2: Build the web app and sync iOS

```bash
npm run build
npm run cap:sync ios
```

Or: `npm run build && npx cap sync ios`

---

## Step 3: Open the iOS project in Xcode

```bash
npx cap open ios
```

Xcode will open with the `ios/App` project.

---

## Step 4: Configure signing

1. In Xcode, select the **App** target in the left sidebar.
2. Open **Signing & Capabilities**.
3. Check **Automatically manage signing**.
4. Choose your **Team** (your Apple Developer account). If none, add your Apple ID in Xcode → **Settings** → **Accounts**.
5. **Bundle Identifier** must match what you use in App Store Connect (e.g. `com.easymart.app`).

---

## Step 5: Build and upload

### Option A: TestFlight (beta testers)

1. In Xcode: **Product** → **Archive**.
2. When the Organizer opens, select the new archive → **Distribute App**.
3. Choose **App Store Connect** → **Upload** → follow the steps.
4. In [App Store Connect](https://appstoreconnect.apple.com), open your app → **TestFlight**. Add internal/external testers and get the **public link** (or invite by email).
5. Set **APP_IOS_STORE_URL** in your `.env` (or Heroku config) to the TestFlight link, e.g.  
   `https://testflight.apple.com/join/XXXXXXXX`  
   Then the `/download` page will show **Get on App Store** for iOS and open TestFlight.

### Option B: App Store (public release)

1. In [App Store Connect](https://appstoreconnect.apple.com), create the app (Bundle ID `com.easymart.app`) if you haven’t.
2. In Xcode: **Product** → **Archive** → **Distribute App** → **App Store Connect** → **Upload**.
3. In App Store Connect, complete the listing (screenshots, description, privacy, etc.), select the uploaded build, and submit for review.
4. After approval, set **APP_IOS_STORE_URL** to your App Store link, e.g.  
   `https://apps.apple.com/app/easymart/id123456789`  
   so the `/download` page points to the App Store.

Full steps (screenshots, privacy, review) are in **[docs/STORE_PUBLISHING.md](STORE_PUBLISHING.md)** (Apple App Store section).

---

## Step 6: Show the iOS link on your download page

Once you have a TestFlight or App Store URL:

1. **Local / .env:**  
   Add to `.env`:  
   `APP_IOS_STORE_URL=https://testflight.apple.com/join/XXXXXXXX`  
   or your App Store URL.

2. **Heroku:**  
   In Heroku dashboard → **Settings** → **Config Vars**, add:  
   `APP_IOS_STORE_URL` = your TestFlight or App Store URL.

3. Redeploy if needed. The `/download` page will show an **iOS** section with **Get on App Store** (or TestFlight) when **APP_IOS_STORE_URL** is set.

---

## Checklist

- [ ] `npm run build` and `npx cap sync ios` run without errors
- [ ] Xcode opens with `npx cap open ios`
- [ ] Signing & Capabilities: Team selected, Bundle ID = `com.easymart.app`
- [ ] Product → Archive → Distribute to App Store Connect
- [ ] TestFlight or App Store listing set up; link copied
- [ ] `APP_IOS_STORE_URL` set in .env or Heroku; `/download` shows iOS button
