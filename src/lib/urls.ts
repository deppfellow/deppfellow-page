// URL shapes for the machine-facing surfaces (rss.xml, sitemap.xml, the agent
// catalog, raw Markdown) and the tag slug shared by every /tags/ emitter
// (chips, inline tags, sitemap, tags/[tag].astro). The detail-route keys
// mirror the getStaticPaths of the page routes: slugs for Articles/Projects,
// the created date for Logs ([...date].astro), normalized tags for
// tags/[tag].astro.
export function normalizeTag(tag: string): string {
  return tag.toLowerCase().replaceAll(" ", "-");
}

function noteKey(note: {
  category: string;
  slug: string;
  created: Date;
}): string {
  return note.category === "Logs"
    ? note.created.toISOString().slice(0, 10)
    : note.slug;
}

export function notePath(note: {
  category: string;
  slug: string;
  created: Date;
}): string {
  return `/${note.category.toLowerCase()}/${noteKey(note)}/`;
}

export function rawPath(note: {
  category: string;
  slug: string;
  created: Date;
}): string {
  return `/raw/${note.category.toLowerCase()}/${noteKey(note)}.md`;
}

export function tagPath(tag: string): string {
  return `/tags/${normalizeTag(tag)}/`;
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
