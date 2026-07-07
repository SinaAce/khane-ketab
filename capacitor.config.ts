import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAPACITOR_SERVER_URL || "https://khane-ketab.vercel.app";

const config: CapacitorConfig = {
  appId: "ir.khaneketab.app",
  appName: "خانه کتاب",
  webDir: "public",
  server: {
    url: serverUrl,
    androidScheme: "https",
    iosScheme: "https",
  },
  android: {
    backgroundColor: "#faf6f0",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#0d7377",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0d7377",
    },
  },
};

export default config;
