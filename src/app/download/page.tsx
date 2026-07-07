import {
  ANDROID_APK_URL,
  IOS_INSTALL_URL,
  PWA_INSTALL_URL,
  SITE_NAME,
  SITE_SLOGAN,
  SITE_URL,
} from "@/lib/site";
import { DownloadClient } from "./DownloadClient";

export const metadata = {
  title: `دانلود اپ ${SITE_NAME}`,
  description: `دانلود اپلیکیشن ${SITE_NAME} برای اندروید و iOS`,
};

export default function DownloadPage() {
  return (
    <DownloadClient
      siteName={SITE_NAME}
      siteSlogan={SITE_SLOGAN}
      siteUrl={SITE_URL}
      androidApkUrl={ANDROID_APK_URL}
      iosInstallUrl={IOS_INSTALL_URL}
      pwaInstallUrl={PWA_INSTALL_URL}
    />
  );
}
