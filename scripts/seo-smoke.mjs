import fs from "node:fs";
import path from "node:path";

const siteUrl = "https://diego-aguirre.com";
const outDir = path.join(process.cwd(), "out");

const routeExpectations = [
  {
    route: "/",
    title: "Diego Aguirre | Product Engineer, Founder, and Builder",
    descriptionIncludes:
      "Product-minded software engineer and founder building AI products",
    schemaIncludes: ["ProfilePage"],
    expectDefaultOgImage: true,
  },
  {
    route: "/about/",
    title: "About Diego Aguirre",
    descriptionIncludes:
      "About Diego Aguirre, a product-minded software engineer and founder",
    schemaIncludes: ["AboutPage"],
    expectDefaultOgImage: true,
  },
  {
    route: "/builds/",
    title: "Builds by Diego Aguirre",
    descriptionIncludes:
      "Selected AI products, experiments, and workflow systems by Diego Aguirre",
    schemaIncludes: ["CollectionPage", "ItemList"],
    expectDefaultOgImage: true,
  },
  {
    route: "/builds/narrative/",
    title: "Narrative | Higher-Ed Intelligence Platform by Diego Aguirre",
    descriptionIncludes:
      "Narrative is a higher-ed intelligence and response platform by Diego Aguirre",
    schemaIncludes: ["SoftwareApplication"],
    expectDefaultOgImage: false,
  },
  {
    route: "/builds/craiive/",
    title: "CRAIIVE | AI Food Inventory App by Diego Aguirre",
    descriptionIncludes:
      "CRAIIVE is an AI-powered food inventory app by Diego Aguirre",
    schemaIncludes: ["SoftwareApplication"],
    expectDefaultOgImage: false,
  },
  {
    route: "/builds/nestiq/",
    title: "NestIQ | Seller Intelligence Platform by Diego Aguirre",
    descriptionIncludes:
      "NestIQ is a seller intelligence platform concept by Diego Aguirre",
    schemaIncludes: ["SoftwareApplication"],
    expectDefaultOgImage: false,
  },
];

function routeToHtmlFile(route) {
  const trimmedRoute = route.replace(/^\//, "").replace(/\/$/, "");

  return trimmedRoute
    ? path.join(outDir, trimmedRoute, "index.html")
    : path.join(outDir, "index.html");
}

function canonicalUrl(route) {
  return new URL(route, `${siteUrl}/`).toString();
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(haystack, needle, message) {
  assert(haystack.includes(needle), `${message}\nMissing: ${needle}`);
}

function assertHtmlRoute(expectation) {
  const htmlFile = routeToHtmlFile(expectation.route);
  assert(fs.existsSync(htmlFile), `Expected route output was not generated: ${htmlFile}`);

  const html = readText(htmlFile);
  const canonical = canonicalUrl(expectation.route);

  assertIncludes(html, `<title>${expectation.title}</title>`, `Expected title for ${expectation.route}`);
  assertIncludes(
    html,
    `<meta name="description" content="${expectation.descriptionIncludes}`,
    `Expected meta description for ${expectation.route}`
  );
  assertIncludes(
    html,
    `rel="canonical" href="${canonical}"`,
    `Expected canonical tag for ${expectation.route}`
  );
  assertIncludes(
    html,
    `property="og:title" content="${expectation.title}"`,
    `Expected Open Graph title for ${expectation.route}`
  );
  assertIncludes(
    html,
    `property="og:description" content="${expectation.descriptionIncludes}`,
    `Expected Open Graph description for ${expectation.route}`
  );
  assertIncludes(
    html,
    `property="og:url" content="${canonical}"`,
    `Expected Open Graph URL for ${expectation.route}`
  );
  assertIncludes(
    html,
    'name="twitter:card" content="summary_large_image"',
    `Expected Twitter card tag for ${expectation.route}`
  );
  assertIncludes(
    html,
    `name="twitter:title" content="${expectation.title}"`,
    `Expected Twitter title for ${expectation.route}`
  );
  assertIncludes(
    html,
    `name="twitter:description" content="${expectation.descriptionIncludes}`,
    `Expected Twitter description for ${expectation.route}`
  );
  assertIncludes(
    html,
    '<script type="application/ld+json">',
    `Expected JSON-LD script for ${expectation.route}`
  );
  assertIncludes(
    html,
    'rel="icon" href="/icon.svg" type="image/svg+xml"',
    `Expected icon link for ${expectation.route}`
  );

  expectation.schemaIncludes.forEach((marker) => {
    assertIncludes(html, marker, `Expected JSON-LD marker ${marker} for ${expectation.route}`);
  });

  if (expectation.expectDefaultOgImage) {
    assertIncludes(
      html,
      `property="og:image" content="${siteUrl}/og/diego-aguirre-preview.png"`,
      `Expected default social image for ${expectation.route}`
    );
    assertIncludes(
      html,
      `name="twitter:image" content="${siteUrl}/og/diego-aguirre-preview.png"`,
      `Expected default Twitter image for ${expectation.route}`
    );
  } else {
    assertIncludes(html, 'property="og:image" content="', `Expected Open Graph image for ${expectation.route}`);
    assertIncludes(html, 'name="twitter:image" content="', `Expected Twitter image for ${expectation.route}`);
  }
}

function assertRobotsAndSitemap() {
  const robotsPath = path.join(outDir, "robots.txt");
  const sitemapPath = path.join(outDir, "sitemap.xml");

  assert(fs.existsSync(robotsPath), "Expected robots.txt to exist in build output");
  assert(fs.existsSync(sitemapPath), "Expected sitemap.xml to exist in build output");

  const robots = readText(robotsPath);
  const sitemap = readText(sitemapPath);

  assertIncludes(robots, "User-Agent: *", "Expected robots.txt user agent rule");
  assertIncludes(robots, "Allow: /", "Expected robots.txt allow rule");
  assertIncludes(
    robots,
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "Expected robots.txt sitemap declaration"
  );

  routeExpectations.forEach((expectation) => {
    assertIncludes(
      sitemap,
      `<loc>${canonicalUrl(expectation.route)}</loc>`,
      `Expected sitemap entry for ${expectation.route}`
    );
  });
}

function assertStaticAssets() {
  const iconPath = path.join(outDir, "icon.svg");
  const socialImagePath = path.join(outDir, "og", "diego-aguirre-preview.png");

  assert(fs.existsSync(iconPath), "Expected icon.svg to exist in build output");
  assert(
    fs.existsSync(socialImagePath),
    "Expected default social preview image to exist in build output"
  );
}

function main() {
  assert(fs.existsSync(outDir), "Expected build output directory at ./out");

  routeExpectations.forEach(assertHtmlRoute);
  assertRobotsAndSitemap();
  assertStaticAssets();

  console.log(`SEO smoke test passed for ${routeExpectations.length} routes.`);
}

main();