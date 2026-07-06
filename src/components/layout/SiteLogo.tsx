import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE_LOGO, SITE_NAME } from "@/lib/site";

type SiteLogoProps = {
  className?: string;
  size?: number;
};

export function SiteLogo({ className, size = 56 }: SiteLogoProps) {
  return (
    <Image
      src={SITE_LOGO}
      alt={SITE_NAME}
      width={size}
      height={size}
      priority
      unoptimized
      className={cn("bg-transparent object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
