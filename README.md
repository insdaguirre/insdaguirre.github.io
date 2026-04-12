# diego-aguirre.com

`diego-aguirre.com` is Diego Aguirre's personal website, but it is built more like a product surface than a portfolio template.

The repo exists to do three jobs well:

- communicate engineering quality through the experience itself
- present current work and archived projects with narrative clarity
- act as a durable public layer for a builder operating across product, AI, and founder-led execution

It is a statically deployed Next.js site with a deliberately cinematic front end: scroll choreography on the homepage, custom 3D and canvas-based interaction primitives, a curated builds system, and typed SEO infrastructure that makes the public surface machine-readable as well as human-legible.

## What The Site Actually Is

This codebase powers a three-part identity layer:

- `/` is the landing sequence: a sticky scroll theater with an ASCII-rendered hero, an interactive 3D car stage, progressive identity statements, and a narrative section that frames the work.
- `/about` is the operating-model page: values, personal context, and the kind of product work Diego wants to compound.
- `/builds` is the proof page: featured products, current work signals, and an archive of earlier public projects presented through both an interactive dome and a recruiter-friendly scan index.

That structure is intentional. The site is not trying to be a resume in webpage form. It is trying to make product taste, technical range, and ambition visible through composition, interaction, and curation.

The current builds layer is concrete, not abstract. It highlights Narrative, CRAIIVE, and NestIQ as present-tense work, then preserves earlier public repos in an archive that is both expressive and fast to scan.

## Technical Posture

The implementation choices are deliberate:

- **Next.js 15 + App Router + TypeScript** for a modern React stack with typed page boundaries and metadata primitives.
- **Static export** via `output: "export"` so deployment stays simple, fast, and portable. Production output is emitted to `out/`.
- **Tailwind CSS** for layout and visual composition, with custom CSS and CSS modules where interaction details need tighter control.
- **Framer Motion** for scroll-linked choreography and staged transitions.
- **GSAP** for the staggered navigation system and inertial canvas effects.
- **React Three Fiber + Drei + Three.js** for the interactive 3D model experience used on the homepage and reveal footer.
- **Typed metadata and structured data helpers** for canonical URLs, Open Graph, Twitter cards, JSON-LD, `robots.txt`, and `sitemap.xml`.

This is a front-end-heavy site, but not a generic animation showcase. The motion and visual systems are doing product work: guiding attention, sequencing narrative, and signaling standards.

## Differentiators In The Repo

Several parts of the implementation are stronger than the usual personal-site baseline:

- The homepage is built as a **scroll timeline**, not a stack of sections. A sticky intro sequence coordinates hero text, 3D presence, and identity copy using a shared motion progress value.
- The hero uses a custom **ASCII text renderer** built with Three.js shaders and a canvas-based ASCII filter instead of a static wordmark.
- The primary 3D object is not dropped in with default controls. The car model uses **pointer-driven arcball interaction**, spring-based return behavior, preloading, bounds fitting, and reduced-motion fallbacks.
- The builds archive includes a custom **3D dome gallery** with layout math, drag inertia, focus states, and a separate scan index so the archive is both expressive and usable.
- Background systems such as **DotGrid**, **Waves**, and **Lightning** are custom interaction primitives, not stock assets.
- Content is intentionally **authored in code** through typed data modules. For a site this small and curated, direct authorship is a better fit than bolting on a CMS.

## Architecture Notes

High-level project shape:

```text
app/                      App Router pages, layout, sitemap, robots
components/homepage/      Scroll theater, hero, model stage, narrative sections
components/builds/        Featured builds, archive dome, project data types
components/about/         About page sections
components/shared/        Reusable visual and interaction primitives
components/navigation/    Staggered menu system
lib/                      Site config, metadata helpers, structured data helpers
public/                   3D assets, icon, OG image, CNAME
.github/workflows/        GitHub Pages deployment workflow
```

Two authoring files matter more than most:

- [builds-content.ts](/Users/diego/DeegzDev-Alpha/components/builds/builds-content.ts) holds the curated builds and archive data.
- [site.ts](/Users/diego/DeegzDev-Alpha/lib/site.ts) centralizes site-wide metadata and canonical identity settings.

SEO and machine-readable identity are handled through:

- [structured-data.ts](/Users/diego/DeegzDev-Alpha/lib/structured-data.ts)
- [JsonLd.tsx](/Users/diego/DeegzDev-Alpha/components/seo/JsonLd.tsx)
- [sitemap.ts](/Users/diego/DeegzDev-Alpha/app/sitemap.ts)
- [robots.ts](/Users/diego/DeegzDev-Alpha/app/robots.ts)

## Local Development

Use Node 20 to match CI and deployment.

Install dependencies:

```bash
npm ci
```

Start the local dev server:

```bash
npm run dev
```

Build the production export:

```bash
npm run build
```

That command generates the static site in `out/`.

Run type checking:

```bash
npm run typecheck
```

`typecheck` depends on Next-generated types in `.next/types`, so run `npm run dev` or `npm run build` first in a clean checkout.

## Deployment

Deployment is wired for **GitHub Pages**.

- The GitHub Actions workflow lives at [deploy-pages.yml](/Users/diego/DeegzDev-Alpha/.github/workflows/deploy-pages.yml).
- Pushes to the `prod` branch trigger a Pages build.
- The workflow runs `npm ci`, then `npm run build`, and uploads `./out`.
- The custom domain is configured through `CNAME` as `diego-aguirre.com`.

This setup fits the project well: no runtime server requirement, low hosting complexity, and predictable static artifacts.

## Verification Notes

Current branch behavior:

- `npm run build` completes successfully and exports the site.
- `npm run typecheck` passes after Next has generated `.next/types`.
- `npm run lint` still points to deprecated `next lint` and currently opens Next's interactive ESLint setup flow rather than acting as a stable CI check.

In practice, `build` is the authoritative verification path today.

## Positioning

The value of this repo is not that it lists projects.

The value is that it treats a personal website as an engineered brand surface: one that makes taste, product judgment, and technical credibility visible in the implementation, not just in the copy.
