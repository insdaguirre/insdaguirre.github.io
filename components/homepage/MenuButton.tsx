"use client";

import StaggeredMenu from "@/components/navigation/StaggeredMenu";

const navigationItems = [
  {
    link: "/",
    label: "Home",
    ariaLabel: "Go to the home page",
  },
  {
    link: "/about",
    label: "About",
    ariaLabel: "Go to the about page",
  },
  {
    link: "/builds",
    label: "Builds",
    ariaLabel: "Go to the builds page",
  },
] as const;

const socialItems = [
  {
    label: "GitHub",
    link: "https://github.com/insdaguirre",
  },
] as const;

export default function MenuButton() {
  return (
    <StaggeredMenu
      position="right"
      items={[...navigationItems]}
      socialItems={[...socialItems]}
      displaySocials={socialItems.length > 0}
      displayItemNumbering
      panelEyebrow="Diego Aguirre"
      panelDescription="Builder, Technologist, & Founder"
      menuButtonColor="rgba(245, 245, 250, 0.92)"
      openMenuButtonColor="#ffffff"
      changeMenuColorOnOpen
      accentColor="#8b5cf6"
      colors={[
        "linear-gradient(180deg, rgba(8, 8, 12, 0.96), rgba(10, 10, 16, 0.94))",
        "linear-gradient(180deg, rgba(17, 13, 29, 0.97), rgba(33, 20, 58, 0.94))",
        "linear-gradient(180deg, rgba(43, 24, 84, 0.98), rgba(82, 39, 255, 0.9))",
      ]}
      isFixed
    />
  );
}
