# SEO Audit And Implementation Plan

## Executive Summary

This repository is a small Next.js 15 App Router site statically exported to GitHub Pages and served from `https://diego-aguirre.com`. The current site has strong visual identity, but its SEO foundation is materially underbuilt:

- metadata is minimal and inconsistent across pages
- there are no canonical URLs, Open Graph tags, Twitter cards, robots rules, or sitemap generation
- there is no structured data
- the homepage is visually distinctive but text-light and framed too generically for recruiter, founder, and technical search intent
- the builds archive is visually interesting, but much of its value is hidden behind an interactive gallery rather than exposed as clear crawlable content
- there is no favicon/social asset pipeline, which weakens SERP presentation and link-sharing quality

The highest-ROI work is not “doing more SEO things.” It is making the site legible to crawlers and humans in the same move:

1. centralize robust metadata
2. add crawl/discovery primitives
3. add structured data
4. improve the homepage and builds page so the site explains what Diego actually does
5. expose portfolio/project entities more clearly for indexing and visitor conversion

The goal is to improve branded search quality, increase recruiter/founder confidence on landing, and create a stronger base for compounding value over time.

## Repo Architecture

### Framework / Stack

- Framework: Next.js 15 with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Animation / interaction: Framer Motion, GSAP, React Three Fiber / Drei
- Font: Geist Sans

### Routing Approach

- App Router pages live in `app/`
- Current routed surfaces:
  - `/` from `app/page.tsx`
  - `/about/` from `app/about/page.tsx`
  - `/builds/` from `app/builds/page.tsx`

### Rendering Model

- `next.config.ts` sets `output: "export"` and `trailingSlash: true`
- the site is statically exported into `out/`
- the homepage currently uses a client page component for the full route, while the about/builds routes are server-rendered pages with static HTML output
- deployment target is GitHub Pages

### Deployment Model

- custom domain from `CNAME`: `diego-aguirre.com`
- GitHub Actions workflow in `.github/workflows/deploy-pages.yml`
- deploys on push to the `prod` branch
- workflow runs `npm ci`, `npm run build`, and publishes `./out`

### Content Surfaces

- Homepage: brand-first hero, identity statements, navigation to deeper pages
- About page: biography, values, personal context, product philosophy
- Builds page: current products, recent work signals, archive of earlier projects
- Footer/navigation: internal links plus GitHub and Instagram

### Reusable Layout / Metadata Patterns

- shared page shell via `components/shared/RevealFooterLayout.tsx`
- global metadata currently defined only in `app/layout.tsx`
- page-level metadata only exists for `about` and `builds`
- no reusable SEO utility layer exists today

### Pages That Matter Most For SEO

1. `/`
   - primary branded landing page
   - most likely entry point for searches on Diego Aguirre
   - should immediately communicate role, capabilities, and relevance

2. `/builds/`
   - strongest proof-of-work surface
   - most useful page for recruiter/founder/technical validation
   - best candidate for ranking on branded + project-related intent

3. `/about/`
   - supports trust, authority, and context once users land
   - useful for branded queries around background and product philosophy

## Current-State Findings

### Metadata And Head Tags

Observed in `app/layout.tsx`, `app/about/page.tsx`, `app/builds/page.tsx`, and exported HTML in `out/`.

- global title is just `Diego Aguirre`
- global description is just `Builder. Technologist. Founder.`
- about/builds descriptions exist but are still thin
- no `metadataBase`
- no canonical URLs
- no Open Graph metadata
- no Twitter card metadata
- no social image metadata
- no author/creator/site-name metadata
- no title template strategy

### Crawl And Discovery Infrastructure

Observed by searching `app/`, `public/`, and generated `out/`.

- no `robots.txt`
- no sitemap generation
- no manifest
- no favicon or app icon assets

### Structured Data

- no JSON-LD anywhere in the app
- no `Person`, `WebSite`, `AboutPage`, `CollectionPage`, or `ItemList` schema

### Homepage SEO Posture

Observed in `app/page.tsx`, `components/homepage/HeroSection.tsx`, and `components/homepage/IdentitySection.tsx`.

- the route is fully declared as a client page
- the homepage is visually memorable but semantically light
- the visible copy is broad and personality-led, but underspecified for likely search/referral intent
- current hero text does not clearly say “software engineer”, “product engineer”, “founder”, “AI products”, “systems”, or similar role-defining language in a durable way
- the main H1 is screen-reader-only and only says `Diego Aguirre`
- the page has limited crawlable explanatory content beyond the hero sequence

### About Page

Observed in `components/about/AboutHero.tsx` and `components/about/AboutContent.tsx`.

- semantic structure is generally sound
- copy quality is decent, but some phrasing is overly casual for high-intent recruiter/founder visitors
- there are small credibility nicks:
  - typo: `andthe`
  - label `Ethical Work!!`
- page lacks structured data and stronger metadata framing

### Builds Page

Observed in `components/builds/*` and exported HTML.

- strong raw material: live work, beta work, validation-stage concept, plus earlier archive
- current page is one of the best SEO assets in the repo
- however, the archive is primarily presented through `ArchiveDomeGallery`, which is interaction-rich but not the clearest crawlable directory of work
- current build cards are readable, but the page could better explain why these projects matter and what categories of work Diego ships
- no structured data for project collection or portfolio entities

### Internal Linking

- internal linking exists through nav/footer and homepage CTA pills
- there are only three routes, so link graph depth is limited
- no contextual internal-link modules on homepage clarifying where to go next

### Image / Social Preview Posture

- project images have alt text in many places
- no default social preview image
- no page-specific preview treatment

### Performance / Rendering Notes Relevant To SEO

- the site is statically exported, which is good for crawlability
- the homepage currently bundles client-side interaction across the whole page rather than isolating the interactive sequence
- the builds page preloads several large images; not necessarily broken, but worth avoiding unnecessary metadata/image bloat during implementation

### Indexing Blockers

- no hard indexing blockers were found
- the main blocker is not technical exclusion, it is weak semantic packaging

## Major Issues

### P0

1. Missing foundational metadata system
   - no canonical, OG, Twitter, metadata base, or strong page titles
   - impact: high
   - effort: low
   - regression risk: low

2. Missing robots and sitemap
   - impact: high
   - effort: low
   - regression risk: low

3. No structured data
   - impact: medium-high
   - effort: low-medium
   - regression risk: low

4. Homepage under-explains Diego’s role and value proposition
   - impact: high
   - effort: medium
   - regression risk: medium

### P1

5. Builds archive is not exposed as a straightforward crawlable project index
   - impact: medium-high
   - effort: medium
   - regression risk: low-medium

6. Weak social-preview setup
   - impact: medium
   - effort: low
   - regression risk: low

7. Minor copy credibility issues on the about page
   - impact: medium
   - effort: low
   - regression risk: low

## Quick Wins

1. Add centralized site constants and page metadata helpers.
2. Set `metadataBase` to `https://diego-aguirre.com`.
3. Add canonical URLs for `/`, `/about/`, and `/builds/`.
4. Add Open Graph and Twitter card metadata with a default social image.
5. Add `app/robots.ts` and `app/sitemap.ts`.
6. Add favicon/app icon support.
7. Add `Person` and `WebSite` JSON-LD.
8. Tighten homepage intro copy so role and capability are explicit.
9. Fix about-page copy nicks that reduce polish.

## High-Impact Structural Improvements

### 1. Refactor Homepage Into A Server Route With Isolated Client Experience

Observed issue:
- `app/page.tsx` is currently a client component because it owns animation logic.

Plan:
- move the animated sequence into a dedicated client component
- make `app/page.tsx` a server component again
- add crawlable, static content sections below the hero

Why it matters:
- improves semantic clarity
- keeps interactive branding while making the page more indexable and easier to reason about
- reduces the homepage being “just a visual shell”

### 2. Add A High-Signal Homepage Narrative Section

Plan:
- add a section explaining Diego as a product-minded software engineer/founder
- add a short “what you’ll find here” layer linking to builds and about
- surface current work categories and/or named projects in plain HTML

Why it matters:
- improves branded search landing quality
- improves recruiter/founder comprehension in the first scroll
- increases internal-link clarity

### 3. Expose The Builds Archive As An Explicit Project Directory

Observed issue:
- current interactive gallery is attractive but not the clearest semantic listing of archived work

Plan:
- keep the gallery
- add a supplementary crawlable archive index under it with direct links

Why it matters:
- preserves design
- increases indexable project/entity coverage
- improves usability for visitors who want fast scanning rather than interaction

## Content Recommendations

### Positioning To Emphasize

The site should consistently frame Diego around terms that are honest, credible, and aligned with likely visitor intent:

- product-minded software engineer
- founder / builder
- AI product builder
- systems and workflow designer
- product, engineering, and operational execution

### Realistic Query Themes For A Personal Site

Branded:
- Diego Aguirre
- Diego Aguirre founder
- Diego Aguirre engineer
- Diego Aguirre portfolio
- Diego Aguirre builds

Project / proof-of-work:
- Narrative Diego Aguirre
- CRAIIVE Diego Aguirre
- NestIQ Diego Aguirre
- Diego Aguirre GitHub

Adjacency / relevance:
- product engineer portfolio
- AI product builder portfolio
- founder engineer portfolio

The site should not pretend it will rank broadly for hyper-competitive head terms. The right strategy is to dominate branded intent, earn project/entity visibility, and convert high-intent visitors well.

### Copy Changes Worth Implementing

- improve homepage intro language so it signals role and capability clearly
- add concise homepage sections that explain the site’s structure and Diego’s work surface
- sharpen builds-page framing around AI products, operating systems, and execution range
- clean up low-signal phrasing on about

## Implementation Priorities

### Priority 1: Highest Impact, Lowest Risk

- centralize metadata and site constants
- add canonical URLs, OG, Twitter, metadata base
- add robots and sitemap
- add social-preview and icon assets
- add `Person` and `WebSite` JSON-LD

### Priority 2: High Impact, Moderate Effort

- refactor homepage route architecture so the page shell is server-rendered
- add meaningful homepage crawlable sections
- improve home/about/builds copy where it materially improves clarity

### Priority 3: Medium Impact, Low-Moderate Risk

- add crawlable project directory on the builds page
- add builds/about page structured data

## Risks / Tradeoffs

1. Overwriting the site’s visual character in the name of SEO would be a mistake.
   - mitigation: keep the hero system and visual language intact; only add supportive structure underneath it

2. Over-optimizing copy for search would make the site feel generic.
   - mitigation: target clarity and relevance, not keyword density

3. Adding metadata routes and icons must remain compatible with static export.
   - mitigation: use App Router metadata primitives that are compatible with `output: "export"` and verify generated `out/` artifacts

4. Structured data can become noisy if over-typed.
   - mitigation: use a small set of high-confidence schema types only

## Validation Plan

1. Run `npm run typecheck`
2. Run `npm run build`
3. Run linting if the current repo/tooling supports it cleanly
4. Inspect generated `out/` output for:
   - canonical tags
   - OG/Twitter tags
   - robots.txt
   - sitemap.xml
   - icon/social assets
5. Inspect exported HTML for the homepage and builds page to confirm:
   - stronger static text presence
   - structured data scripts
   - correct canonical URLs
6. Confirm there are no broken internal links or static export regressions

## Deployment Notes

### Inferred Deployment Workflow

- push changes to the `prod` branch
- GitHub Actions workflow `Deploy GitHub Pages` builds and publishes `out/`
- custom domain is already configured via `CNAME`

### Post-Deploy Verification

After deployment, verify:

- `https://diego-aguirre.com/robots.txt`
- `https://diego-aguirre.com/sitemap.xml`
- page-source metadata on `/`, `/about/`, `/builds/`
- social preview with a debugger tool
- Google Search Console sitemap submission if not already configured

## Planned Implementation Scope For This Pass

This pass should implement:

- metadata system improvements
- robots + sitemap
- structured data
- homepage content/architecture improvements
- builds-page crawlability improvements
- light about-page content polish
- social/icon assets where practical within the repo

This pass will likely not implement:

- brand-new route expansion for every project
- long-form writing/blog infrastructure
- resume/contact flows that require new external assets or user-provided information

