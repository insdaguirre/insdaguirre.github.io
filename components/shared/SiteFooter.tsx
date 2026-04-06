import FooterContent from "@/components/shared/FooterContent";

interface SiteFooterProps {
  className?: string;
  contentClassName?: string;
}

export default function SiteFooter({
  className = "",
  contentClassName = "",
}: SiteFooterProps) {
  return (
    <footer
      className={`border-t border-white/10 bg-black/60 backdrop-blur-sm ${className}`.trim()}
    >
      <FooterContent className={contentClassName} />
    </footer>
  );
}
