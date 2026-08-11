# UniHealth AI - Mobile & PWA Application Guide

This guide details the mobile setup for **UniHealth AI**. The project features a Progressive Web Application (PWA) setup for web installability and a standalone **React Native / Expo** mobile application in `/mobile-app`.

---

## 1. Web Application & PWA Installation

The main web application can be accessed via any modern browser and installed natively on desktop or mobile devices (iOS/Android) as a **Progressive Web App (PWA)**.

### Development & Build
```bash
# Start frontend dev server
npm run dev

# Build production web bundle
npm run build
```

---

## 2. Dedicated Native Mobile App (React Native / Expo)

A native mobile application built with **React Native** and **Expo** is located in the `/mobile-app` directory.

### Prerequisites
- **Node.js** (v18+)
- **Expo Go App** (installed on your iOS/Android device) or Android Studio / Xcode for emulators.

### Development Workflow
```bash
# Navigate to mobile app directory
cd mobile-app

# Install dependencies (if not installed)
npm install

# Start Expo development server
npm start
```

### Running on Devices
- **Android**: Run `npm run android` or scan the QR code with the Expo Go app.
- **iOS**: Run `npm run ios` or scan the QR code with the Camera app (Expo Go).

---

## 3. Connecting Mobile to Local Backend API

When running the mobile app on physical devices or emulators, ensure `EXPO_PUBLIC_API_URL` points to your machine's local IP address (e.g., `http://192.168.x.x:8000`) and the backend is running with:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```
