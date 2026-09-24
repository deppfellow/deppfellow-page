import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import type { Loader } from "astro/loaders";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import {
  buildNoteIndex,
  graphNeighbors,
  registerResolveContexts,
  type Neighbor,
} from "./lib/resolve";
import { readAbout, readNotes, vaultRoot } from "./lib/vault";

const TITLE = /^#\s+.+$/m;

// parseNote lifts the first `# ` heading into note.title; rendering drops the
// same line so the reading page's h1 stays the only one (REQ-10).
function stripTitleHeading(body: string): string {
  return body.replace(TITLE, "");
}

const posts: Loader = {
  name: "deppfellow-vault",
  load: async ({
    store,
    parseData,
    generateDigest,
    renderMarkdown,
    logger,
  }) => {
    const root = vaultRoot();
    const { notes } = await readNotes(root, (message) => logger.warn(message));
    const index = buildNoteIndex(notes);
    const contexts = notes.map((note) => ({
      note,
      index,
      assetsDir: join(root, "_assets"),
      outgoing: [] as Neighbor[],
    }));
    registerResolveContexts(contexts);

    // Render every note first so the resolution pass records each outgoing
    // edge before incoming edges are inverted.
    const rendered = new Map<
      string,
      Awaited<ReturnType<typeof renderMarkdown>>
    >();
    for (const context of contexts) {
      rendered.set(
        context.note.id,
        await renderMarkdown(stripTitleHeading(context.note.body), {
          fileURL: pathToFileURL(context.note.filePath),
        }),
      );
    }

    const neighbors = graphNeighbors(contexts);
    for (const context of contexts) {
      const note = context.note;
      const html = rendered.get(note.id);
      if (!html) continue;
      const data = await parseData({
        id: note.id,
        data: {
          title: note.title,
          category: note.category,
          slug: note.slug,
          created: note.created,
          tags: note.tags,
          description: note.description,
          summary: note.summary,
          neighbors: neighbors.get(note.id) ?? [],
        },
      });
      store.set({
        id: note.id,
        data,
        body: note.body,
        rendered: html,
        assetImports: html.metadata?.imagePaths ?? [],
        filePath: relative(process.cwd(), note.filePath),
        digest: generateDigest(note.body),
      });
    }
    logger.info(`Loaded ${notes.length} notes from ${root}`);
  },
};

const about: Loader = {
  name: "deppfellow-about",
  load: async ({ store, parseData, generateDigest, renderMarkdown }) => {
    const note = await readAbout(vaultRoot());
    if (!note) return;
    const data = await parseData({ id: "about", data: {} });
    store.set({
      id: "about",
      data,
      body: note.body,
      rendered: await renderMarkdown(note.body),
      digest: generateDigest(note.body),
    });
  },
};

const notes = defineCollection({
  loader: posts,
  schema: z.object({
    title: z.string(),
    category: z.string(),
    slug: z.string(),
    created: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
    summary: z.string().optional(),
    neighbors: z
      .array(
        z.object({
          title: z.string(),
          route: z.string(),
          direction: z.enum(["outgoing", "incoming"]),
        }),
      )
      .default([]),
  }),
});

const meta = defineCollection({
  loader: about,
  schema: z.object({}),
});

export const collections = { notes, meta };
