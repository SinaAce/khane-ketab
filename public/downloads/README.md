# Android APK

فایل `khane-ketab.apk` پس از build با Android Studio اینجا قرار می‌گیرد.

## ساخت APK (ویندوز)

1. Java JDK 17+ و Android Studio را نصب کنید
2. در ریشه پروژه:

```powershell
npm run mobile:sync
cd android
.\gradlew.bat assembleDebug
copy app\build\outputs\apk\debug\app-debug.apk ..\public\downloads\khane-ketab.apk
```

3. لینک دانلود: https://khane-ketab.vercel.app/downloads/khane-ketab.apk

## iOS

نیاز به Mac و Xcode دارد:

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

تا زمان انتشار App Store، از «افزودن به صفحه Home» در Safari استفاده کنید.
