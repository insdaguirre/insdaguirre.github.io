import type { ReactNode } from "react";
import Link from "next/link";

interface PillLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "subtle";
  external?: boolean;
}

const baseClassName =
  "inline-flex min-h-11 items-center justify-center rounded-full border px-6 py-3 text-[0.68rem] uppercase tracking-[0.34em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30";

const variantClassNames = {
  default:
    "border-white/14 bg-black/35 text-white/88 backdrop-blur-sm hover:border-white/28 hover:bg-black/45 hover:text-white",
  subtle:
    "border-white/10 bg-white/[0.03] text-white/68 hover:border-white/20 hover:bg-white/[0.06] hover:text-white",
} as const;

export default function PillLink({
  href,
  children,
  className = "",
  variant = "default",
  external,
}: PillLinkProps) {
  const isExternal = external ?? href.startsWith("http");
  const combinedClassName =
    `${baseClassName} ${variantClassNames[variant]} ${className}`.trim();

  return (
    <Link
      href={href}
      className={combinedClassName}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
    >
      {children}
    </Link>
  );
}
