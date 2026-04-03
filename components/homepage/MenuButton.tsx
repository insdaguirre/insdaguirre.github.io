"use client";

export default function MenuButton() {
  return (
    <button
      type="button"
      aria-label="Open menu"
      className="group fixed right-6 top-6 z-50 flex min-h-11 min-w-11 flex-col items-end justify-center gap-[6px] rounded-full border border-white/12 bg-black/30 px-4 py-3 text-[0.7rem] uppercase tracking-[0.35em] text-white/90 backdrop-blur-sm transition hover:border-white/28 hover:bg-black/45 sm:right-8 sm:top-8"
    >
      <span className="h-px w-7 bg-white transition-all duration-300 group-hover:w-8" />
      <span className="h-px w-4 bg-white/75 transition-all duration-300 group-hover:w-8" />
    </button>
  );
}
