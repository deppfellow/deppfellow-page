import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { absolute, notePath, rawPath, requireSite } from "../lib/urls";

type Note = CollectionEntry<"notes">;

// One entry per published note (REQ-30). Neighbors come from the content
// store, where the single resolution pass (content.config.ts) already
// recorded both directions; this surface only absolutizes their routes.
function catalogEntry(note: Note, origin: URL) {
  const { title, category, created, tags, description, neighbors } = note.data;
  return {
    title,
    route: absolute(notePath(note.data), origin),
    category,
    created: created.toISOString(),
    tags,
    ...(description ? { description } : {}),
    rawMarkdownUrl: absolute(rawPath(note.data), origin),
    neighbors: neighbors.map((neighbor) => ({
      ...neighbor,
      route: absolute(neighbor.route, origin),
    })),
  };
}

export const GET: APIRoute = async ({ site }) => {
  const origin = requireSite(site);
  const entries = (await getCollection("notes"))
    .sort(
      (a, b) =>
        a.data.created.getTime() - b.data.created.getTime() ||
        a.data.slug.localeCompare(b.data.slug),
    )
    .map((note) => catalogEntry(note, origin));

  return new Response(`${JSON.stringify(entries, null, 2)}\n`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
