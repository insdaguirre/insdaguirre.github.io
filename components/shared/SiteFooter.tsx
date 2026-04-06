import Link from "next/link";

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

const footerLinks: FooterLink[] = [
  { href: "/", label: "Home" },
  { href: "/builds", label: "Builds" },
  { href: "https://github.com/insdaguirre", label: "GitHub", external: true },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div className="space-y-2">
          <p className="text-[0.68rem] uppercase tracking-[0.36em] text-white/45">
            Diego Aguirre
          </p>
          <p className="max-w-xl text-sm leading-6 text-white/58">
            Builder, technologist, founder. Shipping products with intent and a
            bias for signal.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-5 text-sm text-white/65"
        >
          {footerLinks.map((link) => (
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
    </footer>
  );
}
