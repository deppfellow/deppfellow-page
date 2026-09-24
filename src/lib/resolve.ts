import { existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeTag, tagPath } from "./urls.ts";

export type NeighborDirection = "outgoing" | "incoming";

export type Neighbor = {
  title: string;
  route: string;
  direction: NeighborDirection;
};

export type IndexEntry = { title: string; route: string };

export type NoteIndex = Map<string, IndexEntry>;

export type ResolveNote = {
  id: string;
  title: string;
  slug: string;
  category: string;
  body: string;
  filePath: string;
};

export type NoteContext = {
  note: ResolveNote;
  index: NoteIndex;
  assetsDir: string;
  outgoing: Neighbor[];
};

type ResolveBridge = { contexts: Map<string, NoteContext> };

// astro.config.mjs and src/content.config.ts import this module as two separate
// module instances (config registry vs Vite registry); globalThis is the only
// object space they share, so the bridge lives there.
const globalSlot = globalThis as { __deppfellowResolve?: ResolveBridge };
const bridge: ResolveBridge = (globalSlot.__deppfellowResolve ??= {
  contexts: new Map(),
});

export function routeFor(category: string, slug: string): string {
  return `/${category.toLowerCase()}/${slug}/`;
}

export function buildNoteIndex(notes: readonly ResolveNote[]): NoteIndex {
  const index: NoteIndex = new Map();
  const put = (key: string, entry: IndexEntry) => {
    if (!index.has(key)) index.set(key, entry);
  };
  // Slug keys land first so a slug match outranks an equal title match.
  for (const note of notes) {
    put(note.slug.toLowerCase(), {
      title: note.title,
      route: routeFor(note.category, note.slug),
    });
  }
  for (const note of notes) {
    put(note.title.toLowerCase(), {
      title: note.title,
      route: routeFor(note.category, note.slug),
    });
  }
  return index;
}

export function registerResolveContexts(
  contexts: readonly NoteContext[],
): void {
  bridge.contexts.clear();
  for (const context of contexts) {
    bridge.contexts.set(context.note.filePath, context);
  }
}

export function graphNeighbors(
  contexts: readonly NoteContext[],
): Map<string, Neighbor[]> {
  const routeToId = new Map(
    contexts.map((context) => [
      routeFor(context.note.category, context.note.slug),
      context.note.id,
    ]),
  );
  const incoming = new Map<string, Neighbor[]>();
  for (const context of contexts) {
    const source = {
      title: context.note.title,
      route: routeFor(context.note.category, context.note.slug),
    };
    for (const edge of context.outgoing) {
      const targetId = routeToId.get(edge.route);
      if (!targetId) continue;
      const list = incoming.get(targetId) ?? [];
      if (!list.some((neighbor) => neighbor.route === source.route)) {
        list.push({ ...source, direction: "incoming" });
      }
      incoming.set(targetId, list);
    }
  }
  return new Map(
    contexts.map((context) => [
      context.note.id,
      [...context.outgoing, ...(incoming.get(context.note.id) ?? [])],
    ]),
  );
}

type MdNode = {
  type: string;
  value?: string;
  url?: string;
  alt?: string;
  children?: MdNode[];
};

type MdFile = { path?: unknown };

const EMBED = /!\[\[([^\][|]+)\]\]/;
const WIKILINK = /\[\[([^\][|]+?)(?:\|([^\][]+))?\]\]/;
// #Letter then letters/digits/hyphens; a hyphen only counts when followed by
// an alphanumeric, so the tag never ends on a hyphen (the word boundary).
const TAG = /#([A-Za-z](?:[A-Za-z0-9]|-[A-Za-z0-9])*)/;
const TOKEN = new RegExp(
  `${EMBED.source}|${WIKILINK.source}|(?<![\\w#&/])${TAG.source}`,
  "g",
);

// Remark plugin: rewrites wikilinks, embeds, and inline tags in text nodes.
// Code nodes carry their content in `value`, never in text children, so they
// are structurally out of reach.
export function resolveVaultMarkup() {
  return (tree: MdNode, file: MdFile) => {
    const context = contextFor(file);
    if (context) transformChildren(tree, false, context);
  };
}

// Inline #tags in a note body, in order of appearance. Uses the same TOKEN
// grammar as the rewrite pass, so the route generator sees a superset of the
// /tags/ hrefs rendering can emit (code and headings only ever add
// candidates, never drop one).
export function inlineTags(body: string): string[] {
  const tags: string[] = [];
  for (const match of body.matchAll(TOKEN)) {
    const tag = match[4];
    if (tag !== undefined) tags.push(tag);
  }
  return tags;
}

// The generated /tags/ route set: every note's front-matter tags union its
// inline #tags, keyed by normalized slug, keeping the first-seen original
// casing for the page h1. tags/[tag].astro and sitemap.xml.ts both consume
// this one helper, so sitemap tag locs equal the generated routes by
// construction. Callers pass notes pre-ordered; page rows inherit that order.
export function tagPages<
  N extends { id: string; data: { tags: string[] }; body?: string },
>(notes: readonly N[]): Map<string, { name: string; notes: N[] }> {
  const byTag = new Map<string, { name: string; notes: N[] }>();
  for (const note of notes) {
    for (const tag of [...note.data.tags, ...inlineTags(note.body ?? "")]) {
      const slug = normalizeTag(tag);
      const page = byTag.get(slug) ?? { name: tag, notes: [] };
      if (!page.notes.some((tagged) => tagged.id === note.id)) {
        page.notes.push(note);
      }
      byTag.set(slug, page);
    }
  }
  return byTag;
}

function contextFor(file: MdFile): NoteContext | null {
  if (file.path == null) return null;
  const key =
    file.path instanceof URL ? fileURLToPath(file.path) : String(file.path);
  return bridge.contexts.get(key) ?? null;
}

function transformChildren(
  node: MdNode,
  inHeading: boolean,
  context: NoteContext,
): void {
  if (!node.children) return;
  const heading = inHeading || node.type === "heading";
  const next: MdNode[] = [];
  let replaced = false;
  for (const child of node.children) {
    if (child.type === "text") {
      const parts = splitMarkup(child.value ?? "", heading, context);
      if (parts) {
        replaced = true;
        next.push(...parts);
        continue;
      }
    } else {
      transformChildren(child, heading, context);
    }
    next.push(child);
  }
  if (replaced) node.children = next;
}

function splitMarkup(
  value: string,
  inHeading: boolean,
  context: NoteContext,
): MdNode[] | null {
  TOKEN.lastIndex = 0;
  let parts: MdNode[] | null = null;
  let last = 0;
  for (const match of value.matchAll(TOKEN)) {
    const [raw, embedName, target, label, tag] = match;
    parts ??= [];
    const at = match.index;
    if (at > last) parts.push(textNode(value.slice(last, at)));
    if (embedName !== undefined) {
      parts.push(resolveEmbed(embedName, context));
    } else if (target !== undefined) {
      const { node, neighbor } = resolveWikilink(target, label, context);
      parts.push(node);
      if (neighbor) recordNeighbor(context, neighbor);
    } else if (tag !== undefined && !inHeading) {
      parts.push({
        type: "link",
        url: tagPath(tag),
        children: [textNode(`#${tag}`)],
      });
    } else {
      parts.push(textNode(raw));
    }
    last = at + raw.length;
  }
  if (!parts) return null;
  if (last < value.length) parts.push(textNode(value.slice(last)));
  return parts;
}

function resolveEmbed(name: string, context: NoteContext): MdNode {
  const trimmed = name.trim();
  const alt =
    trimmed
      .split(/[\\/]/)
      .pop()
      ?.replace(/\.[^.]+$/, "") ?? trimmed;
  const asset = join(context.assetsDir, trimmed);
  if (!existsSync(asset)) return textNode(alt);
  const url = relative(dirname(context.note.filePath), asset).replaceAll(
    "\\",
    "/",
  );
  return { type: "image", url, alt };
}

function resolveWikilink(
  target: string,
  label: string | undefined,
  context: NoteContext,
): { node: MdNode; neighbor?: Neighbor } {
  const key = target.trim().toLowerCase();
  const entry = context.index.get(key);
  const text = label?.trim() || entry?.title || target.trim();
  if (!entry) return { node: textNode(text) };
  return {
    node: { type: "link", url: entry.route, children: [textNode(text)] },
    neighbor: {
      title: entry.title,
      route: entry.route,
      direction: "outgoing",
    },
  };
}

function recordNeighbor(context: NoteContext, neighbor: Neighbor): void {
  if (!context.outgoing.some((edge) => edge.route === neighbor.route)) {
    context.outgoing.push(neighbor);
  }
}

function textNode(value: string): MdNode {
  return { type: "text", value };
}
