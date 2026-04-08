"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./StaggeredMenu.module.css";

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  panelEyebrow?: string;
  panelDescription?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  changeMenuColorOnOpen?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  isFixed?: boolean;
}

export default function StaggeredMenu({
  position = "right",
  colors = [
    "linear-gradient(180deg, rgba(10, 10, 14, 0.98), rgba(16, 11, 27, 0.94))",
    "linear-gradient(180deg, rgba(20, 15, 36, 0.98), rgba(40, 23, 72, 0.94))",
    "linear-gradient(180deg, rgba(54, 32, 104, 0.98), rgba(82, 39, 255, 0.9))",
  ],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  panelEyebrow = "Diego Aguirre",
  panelDescription = "Builder, Technologist, & Founder",
  menuButtonColor = "rgba(245, 245, 250, 0.92)",
  openMenuButtonColor = "#f5f5ff",
  changeMenuColorOnOpen = true,
  accentColor = "#8b5cf6",
  isFixed = true,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
}: StaggeredMenuProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [textLines, setTextLines] = useState<string[]>(["Menu", "Close"]);
  const openRef = useRef(false);
  const busyRef = useRef(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const textInnerRef = useRef<HTMLSpanElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Timeline | null>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);

  const resetPanelChildren = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    const introEls = Array.from(
      panel.querySelectorAll<HTMLElement>("[data-sm-intro]")
    );
    const itemEls = Array.from(
      panel.querySelectorAll<HTMLElement>("[data-sm-panel-item-label]")
    );
    const numberEls = Array.from(
      panel.querySelectorAll<HTMLElement>("[data-sm-panel-item]")
    );
    const socialTitle = panel.querySelector<HTMLElement>("[data-sm-social-title]");
    const socialLinks = Array.from(
      panel.querySelectorAll<HTMLElement>("[data-sm-social-link]")
    );

    if (introEls.length) {
      gsap.set(introEls, {
        y: reducedMotion ? 0 : 18,
        opacity: reducedMotion ? 1 : 0,
      });
    }

    if (itemEls.length) {
      gsap.set(itemEls, {
        yPercent: reducedMotion ? 0 : 125,
        rotate: reducedMotion ? 0 : 6,
        opacity: reducedMotion ? 1 : 0,
      });
    }

    if (numberEls.length) {
      gsap.set(numberEls, { "--sm-num-opacity": reducedMotion ? 0.45 : 0 });
    }

    if (socialTitle) {
      gsap.set(socialTitle, {
        y: reducedMotion ? 0 : 12,
        opacity: reducedMotion ? 1 : 0,
      });
    }

    if (socialLinks.length) {
      gsap.set(socialLinks, {
        y: reducedMotion ? 0 : 18,
        opacity: reducedMotion ? 1 : 0,
      });
    }
  }, [reducedMotion]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const backdrop = backdropRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      const toggleButton = toggleBtnRef.current;

      if (!panel || !plusH || !plusV || !icon || !textInner || !toggleButton) {
        return;
      }

      const preLayers = preContainer
        ? Array.from(
            preContainer.querySelectorAll<HTMLElement>("[data-sm-prelayer]")
          )
        : [];

      preLayerElsRef.current = preLayers;

      const offscreen = position === "left" ? -104 : 104;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });
      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });
      gsap.set(plusH, { rotate: 0, transformOrigin: "50% 50%" });
      gsap.set(plusV, { rotate: 90, transformOrigin: "50% 50%" });
      gsap.set(textInner, { yPercent: 0 });
      gsap.set(toggleButton, { color: menuButtonColor });
      resetPanelChildren();
    }, rootRef);

    return () => ctx.revert();
  }, [menuButtonColor, position, resetPanelChildren]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const layers = preLayerElsRef.current;

    if (!panel || !backdrop) {
      return null;
    }

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    resetPanelChildren();

    const introEls = Array.from(
      panel.querySelectorAll<HTMLElement>("[data-sm-intro]")
    );
    const itemEls = Array.from(
      panel.querySelectorAll<HTMLElement>("[data-sm-panel-item-label]")
    );
    const numberEls = Array.from(
      panel.querySelectorAll<HTMLElement>("[data-sm-panel-item]")
    );
    const socialTitle = panel.querySelector<HTMLElement>("[data-sm-social-title]");
    const socialLinks = Array.from(
      panel.querySelectorAll<HTMLElement>("[data-sm-social-link]")
    );

    const layerStates = layers.map((el) => ({
      el,
      start: Number(gsap.getProperty(el, "xPercent")),
    }));
    const panelStart = Number(gsap.getProperty(panel, "xPercent"));

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      backdrop,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: reducedMotion ? 0.16 : 0.42,
        ease: "power2.out",
      },
      0
    );

    layerStates.forEach((layerState, index) => {
      tl.fromTo(
        layerState.el,
        { xPercent: layerState.start },
        {
          xPercent: 0,
          duration: reducedMotion ? 0.2 : 0.58,
          ease: reducedMotion ? "power2.out" : "power4.out",
        },
        reducedMotion ? 0.02 * index : index * 0.07
      );
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = reducedMotion ? 0.22 : 0.66;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      {
        xPercent: 0,
        duration: panelDuration,
        ease: reducedMotion ? "power2.out" : "power4.out",
      },
      panelInsertTime
    );

    if (introEls.length) {
      tl.to(
        introEls,
        {
          y: 0,
          opacity: 1,
          duration: reducedMotion ? 0.14 : 0.48,
          ease: "power3.out",
          stagger: reducedMotion ? 0.03 : 0.08,
        },
        panelInsertTime + panelDuration * 0.14
      );
    }

    if (itemEls.length) {
      const itemStart = panelInsertTime + panelDuration * 0.22;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: reducedMotion ? 0.2 : 0.9,
          ease: reducedMotion ? "power2.out" : "power4.out",
          stagger: reducedMotion ? 0.04 : 0.09,
        },
        itemStart
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            "--sm-num-opacity": 0.48,
            duration: reducedMotion ? 0.14 : 0.54,
            ease: "power2.out",
            stagger: reducedMotion ? 0.03 : 0.07,
          },
          itemStart + (reducedMotion ? 0.02 : 0.08)
        );
      }
    }

    if (socialTitle) {
      tl.to(
        socialTitle,
        {
          y: 0,
          opacity: 1,
          duration: reducedMotion ? 0.14 : 0.44,
          ease: "power2.out",
        },
        panelInsertTime + panelDuration * 0.52
      );
    }

    if (socialLinks.length) {
      tl.to(
        socialLinks,
        {
          y: 0,
          opacity: 1,
          duration: reducedMotion ? 0.16 : 0.48,
          ease: "power3.out",
          stagger: reducedMotion ? 0.03 : 0.07,
        },
        panelInsertTime + panelDuration * 0.58
      );
    }

    openTlRef.current = tl;
    return tl;
  }, [reducedMotion, resetPanelChildren]);

  const playOpen = useCallback(() => {
    if (busyRef.current) {
      return;
    }

    busyRef.current = true;
    const tl = buildOpenTimeline();

    if (!tl) {
      busyRef.current = false;
      return;
    }

    tl.eventCallback("onComplete", () => {
      busyRef.current = false;
    });
    tl.play(0);
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const layers = preLayerElsRef.current;

    if (!panel || !backdrop) {
      return;
    }

    busyRef.current = true;
    openTlRef.current?.kill();
    openTlRef.current = null;
    closeTweenRef.current?.kill();

    const offscreen = position === "left" ? -104 : 104;

    closeTweenRef.current = gsap.timeline({
      onComplete: () => {
        resetPanelChildren();
        busyRef.current = false;
      },
    });

    closeTweenRef.current.to(
      backdrop,
      {
        autoAlpha: 0,
        duration: reducedMotion ? 0.12 : 0.24,
        ease: "power2.inOut",
      },
      0
    );

    closeTweenRef.current.to(
      [panel, ...layers],
      {
        xPercent: offscreen,
        duration: reducedMotion ? 0.18 : 0.34,
        ease: reducedMotion ? "power2.inOut" : "power3.in",
        stagger: reducedMotion ? 0.01 : 0.02,
        overwrite: "auto",
      },
      0
    );
  }, [position, reducedMotion, resetPanelChildren]);

  const animateIcon = useCallback(
    (opening: boolean) => {
      const icon = iconRef.current;

      if (!icon) {
        return;
      }

      spinTweenRef.current?.kill();
      spinTweenRef.current = gsap.to(icon, {
        rotate: opening ? 225 : 0,
        duration: reducedMotion ? 0.18 : opening ? 0.8 : 0.35,
        ease: opening ? "power4.out" : "power3.inOut",
        overwrite: "auto",
      });
    },
    [reducedMotion]
  );

  const animateColor = useCallback(
    (opening: boolean) => {
      const button = toggleBtnRef.current;

      if (!button) {
        return;
      }

      colorTweenRef.current?.kill();

      if (!changeMenuColorOnOpen) {
        gsap.set(button, { color: menuButtonColor });
        return;
      }

      colorTweenRef.current = gsap.to(button, {
        color: opening ? openMenuButtonColor : menuButtonColor,
        delay: reducedMotion ? 0 : 0.12,
        duration: reducedMotion ? 0.12 : 0.26,
        ease: "power2.out",
      });
    },
    [
      changeMenuColorOnOpen,
      menuButtonColor,
      openMenuButtonColor,
      reducedMotion,
    ]
  );

  const animateText = useCallback(
    (opening: boolean) => {
      const inner = textInnerRef.current;

      if (!inner) {
        return;
      }

      textCycleAnimRef.current?.kill();

      if (reducedMotion) {
        setTextLines([opening ? "Menu" : "Close", opening ? "Close" : "Menu"]);
        gsap.set(inner, { yPercent: -50 });
        return;
      }

      const currentLabel = opening ? "Menu" : "Close";
      const targetLabel = opening ? "Close" : "Menu";
      const sequence = [currentLabel, targetLabel, currentLabel, targetLabel];

      setTextLines(sequence);
      gsap.set(inner, { yPercent: 0 });

      const finalShift = ((sequence.length - 1) / sequence.length) * 100;
      textCycleAnimRef.current = gsap.to(inner, {
        yPercent: -finalShift,
        duration: 0.68,
        ease: "power4.out",
      });
    },
    [reducedMotion]
  );

  const openMenu = useCallback(() => {
    if (openRef.current) {
      return;
    }

    openRef.current = true;
    setOpen(true);
    onMenuOpen?.();
    playOpen();
    animateIcon(true);
    animateColor(true);
    animateText(true);
  }, [animateColor, animateIcon, animateText, onMenuOpen, playOpen]);

  const closeMenu = useCallback(() => {
    if (!openRef.current) {
      return;
    }

    openRef.current = false;
    setOpen(false);
    onMenuClose?.();
    playClose();
    animateIcon(false);
    animateColor(false);
    animateText(false);
  }, [animateColor, animateIcon, animateText, onMenuClose, playClose]);

  const toggleMenu = useCallback(() => {
    if (openRef.current) {
      closeMenu();
      return;
    }

    openMenu();
  }, [closeMenu, openMenu]);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    const button = toggleBtnRef.current;

    if (!button) {
      return;
    }

    gsap.set(button, {
      color:
        changeMenuColorOnOpen && openRef.current
          ? openMenuButtonColor
          : menuButtonColor,
    });
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, open]);

  const showSocials = displaySocials && socialItems.length > 0;
  const rootStyle = { "--sm-accent": accentColor } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={[
        styles.wrapper,
        isFixed ? styles.fixedWrapper : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle}
      data-position={position}
      data-open={open || undefined}
    >
      <div
        ref={backdropRef}
        className={styles.backdrop}
        aria-hidden="true"
        onClick={closeOnClickAway ? closeMenu : undefined}
      >
        <div className={styles.backdropGlow} />
      </div>

      <div ref={preLayersRef} className={styles.prelayers} aria-hidden="true">
        {colors.map((color, index) => (
          <div
            key={`${color}-${index}`}
            data-sm-prelayer
            className={styles.prelayer}
            style={{ background: color }}
          />
        ))}
      </div>

      <header className={styles.header} aria-label="Main navigation header">
        <button
          ref={toggleBtnRef}
          className={styles.toggle}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={toggleMenu}
          type="button"
        >
          <span className={styles.toggleTextWrap} aria-hidden="true">
            <span ref={textInnerRef} className={styles.toggleTextInner}>
              {textLines.map((line, index) => (
                <span key={`${line}-${index}`} className={styles.toggleLine}>
                  {line}
                </span>
              ))}
            </span>
          </span>

          <span ref={iconRef} className={styles.icon} aria-hidden="true">
            <span ref={plusHRef} className={styles.iconLine} />
            <span ref={plusVRef} className={`${styles.iconLine} ${styles.iconLineVertical}`} />
          </span>
        </button>
      </header>

      <aside
        id="site-menu"
        ref={panelRef}
        className={styles.panel}
        aria-hidden={!open}
      >
        <div className={styles.panelAmbient} aria-hidden="true" />
        <div className={styles.panelInner}>
          <div className={styles.panelIntro}>
            <p data-sm-intro className={styles.panelEyebrow}>
              {panelEyebrow}
            </p>
            <p data-sm-intro className={styles.panelDescription}>
              {panelDescription}
            </p>
          </div>

          <nav aria-label="Primary" className={styles.nav}>
            <ul
              className={styles.panelList}
              role="list"
              data-numbering={displayItemNumbering || undefined}
            >
              {items.map((item, index) => {
                const isActive = pathname === item.link;

                return (
                  <li className={styles.panelItemWrap} key={`${item.link}-${index}`}>
                    <Link
                      href={item.link}
                      data-sm-panel-item
                      data-active={isActive || undefined}
                      className={styles.panelItem}
                      aria-label={item.ariaLabel}
                      onClick={closeMenu}
                    >
                      <span
                        data-sm-panel-item-label
                        className={styles.panelItemLabel}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {showSocials ? (
            <div className={styles.socials} aria-label="Social links">
              <h3 data-sm-social-title className={styles.socialsTitle}>
                Elsewhere
              </h3>
              <ul className={styles.socialsList} role="list">
                {socialItems.map((socialItem, index) => (
                  <li key={`${socialItem.link}-${index}`} className={styles.socialsItem}>
                    <a
                      href={socialItem.link}
                      target="_blank"
                      rel="noreferrer"
                      data-sm-social-link
                      className={styles.socialsLink}
                      onClick={closeMenu}
                    >
                      {socialItem.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
