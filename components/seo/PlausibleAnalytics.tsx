import Script from "next/script";
import { siteConfig } from "@/lib/site";

export default function PlausibleAnalytics() {
  const { plausibleDomain, plausibleScriptSrc, plausibleApiHost } =
    siteConfig.analytics;

  if (!plausibleDomain) {
    return null;
  }

  const normalizedApiHost = plausibleApiHost?.replace(/\/$/, "");

  return (
    <Script
      src={plausibleScriptSrc}
      strategy="afterInteractive"
      data-domain={plausibleDomain}
      data-api={normalizedApiHost ? `${normalizedApiHost}/api/event` : undefined}
    />
  );
}