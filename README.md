# Pulsar Garage — Android project

A local-first motorcycle logbook for a 2012 red Bajaj Pulsar 135 LS. The app tracks odometer, fuel fills, estimated fuel range, fuel efficiency, service history and expenses in the device browser storage.

## Build the Android APK

You need Node.js 20+, Android Studio and Android SDK installed on a Windows/Mac/Linux computer.

1. Extract this project.
2. Open a terminal in this folder and run:
   ```bash
   npm install
   npm run build
   npx cap add android
   npx cap sync android
   npx cap open android
   ```
3. In Android Studio, wait for Gradle sync.
4. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. The debug APK is normally created at:
   `android/app/build/outputs/apk/debug/app-debug.apk`
6. Transfer that APK to your Android phone and install it. Allow installation from that file manager if Android asks.

For later web app changes:
```bash
npm run build
npx cap sync android
```

## Important notes
- Records are stored locally on this device. Clearing app/browser storage can erase them; export/backup is not yet included in this starter version.
- Fuel range is an estimate: remaining litres × calculated/entered km per litre. It is not a live reading from the motorcycle.
- Fuel efficiency becomes more reliable after at least two full-tank records with odometer readings. For best accuracy, log each fill-up consistently.
- The dashboard starts with blank odometer/fuel values. Enter your real current odometer, remaining petrol and observed fuel efficiency in Settings.
- The default tank capacity is 8 L, based on the Pulsar 135 LS owner manual. Confirm the specification for your exact market/version.
- Service intervals are editable. Bajaj's maintenance chart lists the first service around 750 km and subsequent general services at 5,000 km intervals; oil-change requirements depend on the oil grade and manual schedule. Follow the manual/mechanic's guidance for your bike.
