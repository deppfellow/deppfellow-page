import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { tagPages } from "../lib/resolve";
import { readRegistry, vaultRoot } from "../lib/vault";
import { absolute, notePath, requireSite, tagPath } from "../lib/urls";

export const GET: APIRoute = async ({ site }) => {
  const origin = requireSite(site);
  const [categories, notes] = await Promise.all([
    readRegistry(vaultRoot()),
    getCollection("notes"),
  ]);

  // Tag locs come from the same tagPages helper that generates the
  // /tags/ routes, so the sitemap can never list a tag page that the
  // build does not produce.
  const paths = [
    "/",
    ...categories.map((category) => `/${category.toLowerCase()}/`),
    ...notes.map((note) => notePath(note.data)),
    ...[...tagPages(notes).keys()].map(tagPath),
  ].sort();

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((path) => `  <url><loc>${absolute(path, origin)}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
