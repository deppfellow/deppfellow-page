// URL shapes for the machine-facing surfaces (rss.xml, sitemap.xml). The
// detail-route keys mirror the getStaticPaths of the page routes: slugs for
// Articles/Projects, the created date for Logs ([...date].astro).
export function notePath(note: {
  category: string;
  slug: string;
  created: Date;
}): string {
  const key =
    note.category === "Logs"
      ? note.created.toISOString().slice(0, 10)
      : note.slug;
  return `/${note.category.toLowerCase()}/${key}/`;
}

export function tagPath(tag: string): string {
  return `/tags/${tag.toLowerCase()}/`;
}

export function uniqueTags(notes: { tags: string[] }[]): string[] {
  return [
    ...new Set(
      notes.flatMap((note) => note.tags.map((tag) => tag.toLowerCase())),
    ),
  ].sort((a, b) => a.localeCompare(b));
}

export function absolute(path: string, site: URL): string {
  return new URL(path, site).href;
}

export function requireSite(site: URL | undefined): URL {
  if (!site)
    throw new Error(
      "astro.config.mjs sets no site; RSS and sitemap require absolute URLs.",
    );
  return site;
}
