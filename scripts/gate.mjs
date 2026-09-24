import { readFile } from "node:fs/promises";

const REQUIRED_STATIC = ["/rss.xml", "/search/", "/404.html", "/sitemap.xml"];

const manifest = JSON.parse(await readFile("dist/manifest.json", "utf8"));

const required = [
  ...manifest.categories.map((category) => `/${category.toLowerCase()}/`),
  ...REQUIRED_STATIC,
];

const missing = required.filter((route) => !manifest.routes.includes(route));
if (missing.length > 0) {
  console.error(
    `Gate failed: the build emitted no route for:\n${missing.map((route) => `  - ${route}`).join("\n")}`,
  );
  process.exit(1);
}

if (manifest.articles === 0) {
  if (manifest.articleFiles > 0) {
    console.error(
      `Gate failed: ${manifest.articleFiles} Article files in the vault but none parsed.`,
    );
    process.exit(1);
  }
  console.log(
    "::warning::The vault carries no Articles yet; deploying the shell (staged gate, D-29).",
  );
}

console.log(
  `Gate passed: ${required.length} required routes present, ${manifest.articles} Articles.`,
);
