import DotGrid from "@/components/shared/DotGrid";

export default function AboutHeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 opacity-80">
        <DotGrid
          dotSize={4}
          gap={18}
          baseColor="#22182d"
          activeColor="#7d5cff"
          proximity={90}
          shockRadius={180}
          shockStrength={3}
          resistance={820}
          returnDuration={1.25}
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.1),transparent_18%),radial-gradient(circle_at_22%_28%,rgba(82,39,255,0.18),transparent_18%),radial-gradient(circle_at_78%_32%,rgba(255,0,209,0.1),transparent_16%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.3)_44%,rgba(0,0,0,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_16%,transparent_84%,rgba(255,255,255,0.03))]" />
      <div className="absolute left-[10%] top-[18%] h-44 w-44 rounded-full bg-[#5227ff]/16 blur-[100px]" />
      <div className="absolute right-[14%] top-[24%] h-36 w-36 rounded-full bg-[#ff00d1]/10 blur-[90px]" />
    </div>
  );
}
