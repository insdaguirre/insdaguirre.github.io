import BuildCard, { type BuildProject } from "@/components/builds/BuildCard";

const projects: BuildProject[] = [
  {
    id: "Build 01",
    label: "Featured System",
    name: "Signal Atlas",
    status: "Shipping",
    description:
      "A product intelligence layer for turning fragmented customer, growth, and operational signals into a fast decision surface.",
    summary:
      "Structured to hold case studies, live links, supporting screenshots, and implementation notes without changing the layout system.",
    tags: ["Next.js", "Analytics", "Workflow Design", "AI Ops"],
    links: [
      {
        href: "https://github.com/insdaguirre",
        label: "GitHub",
        external: true,
      },
    ],
  },
  {
    id: "Build 02",
    name: "Operator Console",
    status: "In Progress",
    description:
      "An internal-facing control plane for managing experiments, instrumentation, and the product decisions that come out of them.",
    tags: ["React", "Design Systems", "Experimentation"],
  },
  {
    id: "Build 03",
    name: "Acquisition Studio",
    status: "Exploring",
    description:
      "A launch environment for shaping narratives, rapid landing pages, and conversion loops around a new product thesis.",
    tags: ["Growth", "Messaging", "Landing Systems"],
  },
];

const operatingPrinciples = [
  "Reusable build cards with room for links, status, and stack metadata.",
  "A layout that scales from one featured build to a larger project index.",
  "Polished enough for today without boxing in future case-study depth.",
] as const;

export default function BuildsShowcase() {
  const [featuredProject, ...secondaryProjects] = projects;

  return (
    <section
      id="projects"
      className="relative z-10 mx-auto -mt-16 w-full max-w-6xl px-6 pb-8 sm:px-8 lg:-mt-20 lg:px-12"
    >
      <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="border-b border-white/8 px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.8fr)] lg:items-end">
            <div className="space-y-4">
              <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/44">
                Main Content
              </p>
              <h2 className="max-w-3xl text-balance text-[clamp(2rem,4vw,3.75rem)] font-light leading-tight tracking-[0.08em] text-white/92">
                A scalable system for selected projects, not a static one-off
                layout.
              </h2>
              <p className="max-w-2xl text-pretty leading-7 text-white/62">
                Each build slot is ready for a richer story later: product
                framing, stack, outcome, external links, and the right amount of
                signal up front.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-5">
              <p className="text-[0.68rem] uppercase tracking-[0.3em] text-white/40">
                Operating Notes
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/60">
                {operatingPrinciples.map((principle) => (
                  <li key={principle}>{principle}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-12">
            <BuildCard project={featuredProject} featured />
          </div>
          {secondaryProjects.map((project) => (
            <div key={project.id} className="lg:col-span-6">
              <BuildCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
