import Image from "next/image";
import type { RecentWorkSignal } from "@/components/builds/types";

interface RecentWorkSignalCardProps {
  signal: RecentWorkSignal;
}

function toDomId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function RecentWorkSignalCard({
  signal,
}: RecentWorkSignalCardProps) {
  const signalId = toDomId(signal.title);
  const titleId = `recent-work-${signalId}-title`;
  const detailId = `recent-work-${signalId}-detail`;

  return (
    <article
      tabIndex={0}
      aria-labelledby={titleId}
      aria-describedby={detailId}
      className="group relative isolate min-h-[12.5rem] overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-sm transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none"
    >
      <div className="absolute inset-0">
        <Image
          src={signal.image}
          alt={signal.imageAlt}
          fill
          sizes="(min-width: 1024px) 19rem, (min-width: 640px) 30vw, calc(100vw - 3rem)"
          className="object-cover object-center transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] group-hover:blur-sm group-hover:brightness-[0.42] group-focus-within:scale-[1.02] group-focus-within:blur-sm group-focus-within:brightness-[0.42] motion-reduce:transition-none motion-reduce:transform-none"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,14,0.08),rgba(5,7,14,0.18)_58%,rgba(5,7,14,0.34)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,14,0.18),rgba(5,7,14,0.62)_72%,rgba(5,7,14,0.9)_100%)] opacity-0 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_18%_14%,rgba(82,39,255,0.22),transparent_28%),radial-gradient(circle_at_80%_78%,rgba(255,0,209,0.14),transparent_34%)] opacity-0 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none" />
      </div>

      <div className="relative flex min-h-[12.5rem] items-end p-4 sm:p-5">
        <div className="pointer-events-none w-full rounded-[1.05rem] border border-white/10 bg-black/35 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.34)] backdrop-blur-md opacity-0 translate-y-3 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transition-none motion-reduce:transform-none">
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-white/52">
            {signal.stage}
          </p>
          <p
            id={titleId}
            className="mt-3 text-[1.05rem] uppercase tracking-[0.12em] text-white/92"
          >
            {signal.title}
          </p>
          <p id={detailId} className="mt-2 text-sm leading-6 text-white/72">
            {signal.detail}
          </p>
        </div>
      </div>
    </article>
  );
}
