import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { SITE_DESCRIPTION, SITE_NAME } from "../lib/site";
import { absolute, notePath, requireSite } from "../lib/urls";

const FEED_CAP = 50;

// RSS 2.0 text nodes; escaping quotes too keeps this safe if items ever
// move into attributes.
function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function itemXml(note: CollectionEntry<"notes">, site: URL): string[] {
  const link = absolute(notePath(note.data), site);
  const lines = [
    "    <item>",
    `      <title>${escapeXml(note.data.title)}</title>`,
    `      <link>${link}</link>`,
    `      <guid isPermaLink="true">${link}</guid>`,
    `      <pubDate>${note.data.created.toUTCString()}</pubDate>`,
  ];
  if (note.data.summary)
    lines.push(
      `      <description>${escapeXml(note.data.summary)}</description>`,
    );
  lines.push("    </item>");
  return lines;
}

export const GET: APIRoute = async ({ site }) => {
  const origin = requireSite(site);
  const items = (await getCollection("notes"))
    .filter(
      ({ data }) =>
        data.category === "Articles" || data.category === "Projects",
    )
    .sort(
      (a, b) =>
        b.data.created.getTime() - a.data.created.getTime() ||
        a.data.slug.localeCompare(b.data.slug),
    )
    .slice(0, FEED_CAP);

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${escapeXml(SITE_NAME)}</title>`,
    `    <link>${absolute("/", origin)}</link>`,
    `    <description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    ...items.flatMap((note) => itemXml(note, origin)),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
