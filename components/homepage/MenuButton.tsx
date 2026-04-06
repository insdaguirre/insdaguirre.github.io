"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const navigationItems = [
  {
    href: "/",
    label: "Home",
    description: "Intro sequence and landing experience",
  },
  {
    href: "/about",
    label: "About",
    description: "Background, approach, and product perspective",
  },
  {
    href: "/builds",
    label: "Builds",
    description: "Selected products, systems, and experiments",
  },
] as const;

export default function MenuButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="site-menu"
        onClick={() => setIsOpen((open) => !open)}
        className="group fixed right-6 top-6 z-50 flex min-h-11 min-w-11 flex-col items-end justify-center gap-[6px] rounded-full border border-white/12 bg-black/30 px-4 py-3 text-[0.7rem] uppercase tracking-[0.35em] text-white/90 backdrop-blur-sm transition hover:border-white/28 hover:bg-black/45 sm:right-8 sm:top-8"
      >
        <span
          className={`h-px bg-white transition-all duration-300 ${
            isOpen ? "w-7 translate-y-[3.5px] rotate-45" : "w-7 group-hover:w-8"
          }`}
        />
        <span
          className={`h-px bg-white/75 transition-all duration-300 ${
            isOpen
              ? "w-7 -translate-y-[3.5px] -rotate-45 bg-white"
              : "w-4 group-hover:w-8"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 z-40 bg-black/72 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              id="site-menu"
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="fixed inset-x-4 top-20 z-40 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] shadow-[0_24px_90px_rgba(0,0,0,0.55)] sm:left-auto sm:right-8 sm:w-[24rem]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_72%_34%,rgba(82,39,255,0.18),transparent_22%),radial-gradient(circle_at_66%_70%,rgba(255,0,209,0.12),transparent_18%)]" />
              <div className="relative space-y-8 p-6">
                <div className="space-y-2">
                  <p className="text-[0.68rem] uppercase tracking-[0.34em] text-white/40">
                    Navigation
                  </p>
                  <p className="max-w-xs text-sm leading-6 text-white/58">
                    Product, motion, and build surfaces.
                  </p>
                </div>
                <nav aria-label="Primary">
                  <ul className="space-y-3">
                    {navigationItems.map((item) => {
                      const isActive = pathname === item.href;

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`block rounded-[1.5rem] border px-5 py-4 transition ${
                              isActive
                                ? "border-white/18 bg-white/[0.08]"
                                : "border-white/8 bg-black/18 hover:border-white/16 hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-[0.76rem] uppercase tracking-[0.34em] text-white/44">
                                  {item.label}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-white/64">
                                  {item.description}
                                </p>
                              </div>
                              <span
                                className={`h-2.5 w-2.5 rounded-full transition ${
                                  isActive ? "bg-white" : "bg-white/25"
                                }`}
                              />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
