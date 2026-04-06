import type { ReactNode } from "react";
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
      <div className="hidden lg:block">
        <SiteFooter
          className="fixed inset-x-0 bottom-0 z-0"
          contentClassName="min-h-[14rem] items-center"
        />
      </div>

      <div
        className={`relative z-10 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.6)] ${surfaceClassName}`.trim()}
      >
        {children}
      </div>

      <div aria-hidden="true" className="hidden h-[14rem] lg:block" />

      <div className="lg:hidden">
        <SiteFooter />
      </div>
    </main>
  );
}
