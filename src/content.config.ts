import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import type { Loader } from "astro/loaders";
import { relative } from "node:path";
import { readAbout, readNotes, vaultRoot } from "./lib/vault";

const posts: Loader = {
  name: "deppfellow-vault",
  load: async ({ store, parseData, generateDigest, renderMarkdown, logger }) => {
    const root = vaultRoot();
    const { notes } = await readNotes(root, (message) => logger.warn(message));
    for (const note of notes) {
      const data = await parseData({
        id: note.id,
        data: {
          title: note.title,
          category: note.category,
          slug: note.slug,
          created: note.created,
          tags: note.tags,
          description: note.description,
        },
      });
      store.set({
        id: note.id,
        data,
        body: note.body,
        rendered: await renderMarkdown(note.body),
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
  }),
});

const meta = defineCollection({
  loader: about,
  schema: z.object({}),
});

export const collections = { notes, meta };
