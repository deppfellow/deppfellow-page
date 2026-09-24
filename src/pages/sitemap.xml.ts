import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { readRegistry, vaultRoot } from "../lib/vault";
import {
  absolute,
  notePath,
  requireSite,
  tagPath,
  uniqueTags,
} from "../lib/urls";

export const GET: APIRoute = async ({ site }) => {
  const origin = requireSite(site);
  const [categories, notes] = await Promise.all([
    readRegistry(vaultRoot()),
    getCollection("notes"),
  ]);

  // Only routes this build actually generates may enter the sitemap. Tag
  // pages join as soon as T9 lands src/pages/tags/, never before - a sitemap
  // entry that 404s is worse than a missing one.
  const tagPages = import.meta.glob("/src/pages/tags/*.astro");
  const paths = [
    "/",
    ...categories.map((category) => `/${category.toLowerCase()}/`),
    ...notes.map((note) => notePath(note.data)),
    ...(Object.keys(tagPages).length > 0
      ? uniqueTags(notes.map(({ data }) => data)).map(tagPath)
      : []),
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
