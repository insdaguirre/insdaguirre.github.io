import DotGrid from "@/components/shared/DotGrid";

export default function BuildsAmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 opacity-85">
        <DotGrid
          dotSize={4}
          gap={18}
          baseColor="#23192f"
          activeColor="#6b42ff"
          proximity={100}
          shockRadius={200}
          shockStrength={3.5}
          resistance={800}
          returnDuration={1.3}
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_50%_18%,rgba(82,39,255,0.23),transparent_16%),radial-gradient(circle_at_70%_24%,rgba(255,0,209,0.12),transparent_16%),linear-gradient(180deg,rgba(0,0,0,0.14),rgba(0,0,0,0.32)_18%,rgba(0,0,0,0.5)_55%,#000_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_18%,transparent_80%,rgba(255,255,255,0.03)),linear-gradient(180deg,transparent,rgba(255,255,255,0.04)_78%,transparent)]" />
      <div className="absolute left-[12%] top-[8%] h-52 w-52 rounded-full bg-[#5227ff]/18 blur-[110px]" />
      <div className="absolute right-[12%] top-[16%] h-44 w-44 rounded-full bg-[#ff00d1]/12 blur-[100px]" />
    </div>
  );
}
