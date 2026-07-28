# UniHealth AI - Android Mobile Build & Release Guide

This guide details the steps to compile, sync, test, and release the **UniHealth AI** mobile application as a native Android package (`.apk`) using **Capacitor**.

---

## Prerequisites

Before starting, ensure you have the following installed on your development machine:
1. **Node.js** (v18+)
2. **Android Studio** (with Android SDK 30+ installed)
3. **Gradle** (configured automatically by Android Studio)

---

## 1. Development & Sync Cycle

Every time you change files in the React frontend (`src/` folder), you must compile the web assets and copy them into the native Android package before running in Android Studio.

```bash
# Step A: Compile the React web application
npm run build

# Step B: Copy compiled assets into the native Android folder
npx cap sync
```

---

## 2. Running on Emulators or Devices (Debug)

### Option A: Running inside Android Studio
1. Open **Android Studio**.
2. Click **Open Project** and select the `/android` directory inside the `UniHealth AI` project folder.
3. Open **Device Manager** (**Tools** -> **Device Manager**).
4. Start an emulator (e.g. *Pixel 7 API 34*), or connect a physical phone via USB with **USB Debugging** enabled.
5. In the top toolbar, verify that your device name is shown in the dropdown next to the green play button.
6. Click the green **Play (Run)** button.

### Option B: Running via Command Line
Alternatively, you can boot the app directly from your terminal:
```bash
npx cap run android
```

---

## 3. Connecting to the Local Backend API

If you are running the backend locally (`uvicorn main:app`), your Android emulator/phone won't be able to connect to `localhost:8000` because `localhost` refers to the mobile device itself.

To resolve this:
1. Find your computer's local Wi-Fi IP address (e.g. `192.168.1.100` or `10.64.255.247`).
2. Add this IP address to your `.env.development` configuration:
   ```env
   VITE_API_URL=http://<YOUR_LOCAL_IP>:8000
   ```
3. Run the backend and bind it to your local network:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
4. Ensure both your computer and your test phone are connected to the **same Wi-Fi network**.

---

## 4. Building a Release-Ready Signed APK

To produce a production-ready signed APK that can be installed on any device:

### Step 1: Sync Production Assets
Configure `.env.production` to point to your live backend endpoint, then run:
```bash
# Build React app with production environment configuration
npm run build

# Sync assets to Android project
npx cap sync
```

### Step 2: Open in Android Studio
Open the `/android` folder in **Android Studio**.

### Step 3: Generate a Keystore (Signing Key)
If you don't already have a signing key:
1. In Android Studio, go to **Build** -> **Generate Signed Bundle / APK...**
2. Choose **APK** and click **Next**.
3. Under **Key store path**, click **Create new...**
4. Set a path (e.g., `release-key.jks`), set passwords, alias (e.g., `key0`), and fill in key details.
5. Click **OK** (keep this key file secure; do not commit it to public git repositories!).

### Step 4: Compile and Sign the APK
1. Choose the Keystore you just created.
2. Select the key alias and enter the passwords. Click **Next**.
3. Select the **release** build variant.
4. Click **Create / Finish**.
5. Android Studio will compile and output the signed release APK to:
   `android/app/release/app-release.apk` (or similar output directory shown in the success popup).

---

## Troubleshooting

### Error: "No target device found"
* **Solution**: Ensure your emulator is booted and shows up in Android Studio's device manager, or check that your physical phone has **USB Debugging** enabled in **Developer Options** and you accepted the prompt to allow your computer.

### App is showing a blank white screen
* **Solution**: Ensure you successfully ran `npm run build` followed by `npx cap sync` before running the app. If a JavaScript error occurs on startup, inspect the web view using Chrome DevTools (`chrome://inspect` in your desktop browser).
