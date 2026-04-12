import Link from "next/link";
import PillLink from "@/components/shared/PillLink";
import { siteConfig } from "@/lib/site";

interface FooterContentProps {
  className?: string;
}

export default function FooterContent({
  className = "",
}: FooterContentProps) {
  const footerNavLinks = siteConfig.footerLinks.map((link) =>
    link.label === "Contact"
      ? {
          href: "https://github.com/insdaguirre",
          label: "GitHub",
          external: true,
          ariaLabel: "Open Diego Aguirre's GitHub profile",
        }
      : link
  );

  return (
    <div
      className={`mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 sm:px-8 lg:flex-row lg:justify-between lg:gap-10 lg:px-12 lg:py-12 ${className}`.trim()}
    >
      <div className="max-w-2xl space-y-4">
        <p className="text-[0.68rem] uppercase tracking-[0.36em] text-white/45">
          Diego Aguirre
        </p>
        <p className="max-w-xl text-sm leading-6 text-white/58">
          Builder, Technologist, & Founder
        </p>
        <div className="flex flex-wrap gap-3">
          {siteConfig.contact.surfaceLinks.map((link) => (
            <PillLink key={link.href} href={link.href} external={link.external}>
              {link.label}
            </PillLink>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-[0.68rem] uppercase tracking-[0.36em] text-white/38">
          Explore
        </p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-5 text-sm text-white/65"
        >
          {footerNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
