import type { ReactNode } from "react";
import DesktopRevealFooter from "@/components/shared/DesktopRevealFooter";
import SiteFooter from "@/components/shared/SiteFooter";

interface RevealFooterLayoutProps {
  children: ReactNode;
  className?: string;
  surfaceClassName?: string;
}

export default function RevealFooterLayout({
  children,
  className = "",
  surfaceClassName = "",
}: RevealFooterLayoutProps) {
  return (
    <main
      className={`relative isolate min-h-screen overflow-x-clip bg-black text-white ${className}`.trim()}
    >
      <DesktopRevealFooter surfaceClassName={surfaceClassName}>
        {children}
      </DesktopRevealFooter>

      <div className="lg:hidden">
        <SiteFooter />
      </div>
    </main>
  );
}
