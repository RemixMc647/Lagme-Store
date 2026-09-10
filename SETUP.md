# Lord & Grace — Multi-Platform Setup Guide

Your site was already a "web app" once hosted (see README.md for GitHub Pages steps).
This adds everything needed for **Android**, **iOS**, **Windows**, and makes the **web
version installable** directly from the browser — no app store needed.

---

## 0. The simplest option: install straight from the browser (no coding, no store)

I added `manifest.json`, `sw.js`, and app icons, and wired them into `index.html`.
This makes the site a **PWA (Progressive Web App)**. Once it's hosted (e.g. GitHub
Pages, per the README):

- **On Android (Chrome):** open the site → menu (⋮) → "Install app" or "Add to Home
  screen". It installs like a real app, with its own icon, and works offline.
- **On desktop (Chrome/Edge):** an install icon appears in the address bar.
- **On iPhone (Safari):** Share button → "Add to Home Screen".

This is the "different way to turn the website into an app on your phone" you asked
about — no Android Studio, no app store review, nothing to install on your computer.
The tradeoff: it's not a listing on the Google Play Store, just an installed
home-screen app.

If this covers what you need, you can stop here.

---

## 1. Android (native, for the Play Store) — via Capacitor

Already scaffolded for you in the `android/` folder using [Capacitor](https://capacitorjs.com),
wrapping the site in `www/` (a copy of the site made for the app builds).

To build it yourself:
```bash
npm install
npx cap sync android
npx cap open android
```
This opens the project in **Android Studio** (install it first: https://developer.android.com/studio).
From there: Build → Build Bundle/APK, or Run ▶ on an emulator/device.

Whenever you edit the site (in the root folder, or in `js/products.js`), re-copy your
changes into `www/` and run `npx cap sync android` again before rebuilding.

## 2. iOS (native, for the App Store) — via Capacitor

Scaffolded in the `ios/` folder. Building iOS **requires a Mac with Xcode** — there's
no way around that, it's an Apple restriction, not a tooling limitation.

On a Mac:
```bash
npm install
npx cap sync ios
npx cap open ios
```
This opens Xcode. You'll need a free or paid Apple Developer account to run on a
device or submit to the App Store.

## 3. Windows (desktop app) — via Electron

Scaffolded in the `electron/` folder.
```bash
cd electron
npm install
npm start          # run it
npm run dist:win    # build a Windows installer (.exe)
```
The installer output lands in `electron/dist/`.

## 4. Web app

Already covered by the main README — host the root folder (GitHub Pages, Netlify,
your own server, etc.). With the PWA files added, it's now also installable (see
section 0).

---

## Keeping things in sync

The **root folder** (`index.html`, `css/`, `js/`, `assets/`) is what you host as the
website and what you keep editing day-to-day (e.g. `js/products.js` for products).

The **`www/` folder** is a snapshot used only by the Android/iOS/Windows builds.
After editing the root site, copy the same files into `www/` before rebuilding an app,
e.g.:
```bash
cp -r index.html css js assets manifest.json sw.js icons www/
```

## What was added, file by file
- `manifest.json`, `sw.js`, `icons/` — makes the site a PWA (section 0)
- `www/` — copy of the site used as the app "webDir"
- `android/` — native Android Studio project (Capacitor)
- `ios/` — native Xcode project (Capacitor)
- `electron/` — Windows (and Mac/Linux) desktop app
- `package.json`, `capacitor.config.json` — Capacitor tooling config
