import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE_DESCRIPTION, SITE_NAME } from "../lib/site";
import { absolute, requireSite } from "../lib/urls";
import { readRegistry, vaultRoot } from "../lib/vault";

export const GET: APIRoute = async ({ site }) => {
  const origin = requireSite(site);
  const [categories, notes] = await Promise.all([
    readRegistry(vaultRoot()),
    getCollection("notes"),
  ]);

  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "The Public Projection of the wiki: every published note renders as a static page, and this build also emits a machine-readable catalog plus the raw Markdown behind each page.",
    "",
    "## Catalog",
    "",
    `- [catalog.json](${absolute("/catalog.json", origin)}): one entry per published note - title, route, category, created, tags, description when present, rawMarkdownUrl, and wikilink-graph neighbors in both directions`,
    "",
    "## Categories",
    "",
    ...categories.map((category) => {
      const count = notes.filter(
        (note) => note.data.category === category,
      ).length;
      return `- [${category}](${absolute(`/${category.toLowerCase()}/`, origin)}): ${count} notes`;
    }),
    "",
    "## Raw Markdown",
    "",
    `The Markdown source of every published note is served under ${absolute("/raw/", origin)}<category>/<note>.md (Logs use their created date as the note name). Each catalog entry carries its exact URL as rawMarkdownUrl.`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
