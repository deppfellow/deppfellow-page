import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import matter from "gray-matter";

const MARKDOWN = /\.md$/i;
const LANGUAGE_SUFFIX = /\.(en|id|ja)\.md$/i;
const TITLE = /^#\s+(.+)$/m;

export type Note = {
  id: string;
  slug: string;
  category: string;
  title: string;
  created: Date;
  tags: string[];
  description?: string;
  body: string;
  filePath: string;
};

export type Skipped = { path: string; reason: string };

export function vaultRoot(): string {
  if (process.env.WIKI_PATH) return resolve(process.env.WIKI_PATH);
  throw new Error(
    "No vault found. Set WIKI_PATH to the vault checkout."
  );
}

export async function readRegistry(root: string): Promise<string[]> {
  const file = join(root, "_schema", "categories.md");
  if (!existsSync(file)) {
    throw new Error(
      `Category registry missing at ${file}. The registry is the publication boundary.`
    )
  };
  
  const { data } = matter(await readFile(file, "utf8"));
  const categories = Array.isArray(data.categories) ? data.categories.map(String) : [];
  if (categories.length === 0) {
    throw new Error(`Category registry at ${file} lists no categories.`)
  };
  
  return categories;
}

async function noteFiles(root: string, category: string): Promise<string[]> {
  const dir = join(root, category);
  if (!existsSync(dir)) return [];

  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const inner = await readdir(full, { withFileTypes: true });
      for (const child of inner) {
        if (child.isFile() && MARKDOWN.test(child.name)) files.push(join(full, child.name));
      }
      continue;
    }

    if (entry.isFile() && MARKDOWN.test(entry.name)) files.push(full);
  }

  return files;
}

export function parseNote(
  file: string,
  category: string,
  body: string,
  data: Record<string, unknown>)
  : Note {
    const slug = file.split("/").slice(-1)[0].replace(MARKDOWN, "");
    const created = data.created instanceof Date 
      ? data.created 
      : new Date(typeof data.created === "string" ? data.created : "");
    
    if (Number.isNaN(created.getTime())) throw new Error("invalid created");
    
    const rawTags = data.tags;
    if (rawTags !== undefined 
      && (!Array.isArray(rawTags) || !rawTags.every((t) => typeof t === "string"))) {
        throw new Error("invalid tags");
    }

    const description = typeof data.description === "string" && data.description.trim()
      ? data.description
      : undefined;
    const titleMatch = body.match(TITLE);
    return {
      id: `${category.toLowerCase()}/${slug}`,
      slug,
      category,
      title: titleMatch ? titleMatch[1].trim() : slug,
      created,
      tags: Array.isArray(rawTags) ? rawTags : [],
      description,
      body,
      filePath: file,
    };
}

export async function readNotes(
  root: string,
  warn: (message: string) => void = (message) => console.warn(message),
): Promise<{ notes: Note[]; skipped: Skipped[] }> {
  const categories = await readRegistry(root);
  const notes: Note[] = [];
  const skipped: Skipped[] = [];

  let found = 0;
  for (const category of categories) {
    for (const file of await noteFiles(root, category)) {
      found++;
      const path = relative(process.cwd(), file);
      if (LANGUAGE_SUFFIX.test(file)) {
        const reason = "language-suffixed (deferred, ADR-0004)";
        skipped.push({ path, reason });
        warn(`skipped ${path}: ${reason}`);
        continue;
      }

      try {
        const raw = await readFile(file, "utf8");
        const { data, content } = matter(raw);
        notes.push(parseNote(file, category, content.trim(), data));
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        skipped.push({ path, reason });
        warn(`skipped ${path}: ${reason}`);
      }
    }
  }

  if (found > 0 && notes.length === 0) {
    throw new Error(`No parseable notes in ${root} (all ${found} skipped).`);
  }
  return { notes, skipped };
}

export async function readAbout(root: string): Promise<{ title: string; body: string } | null> {
  const file = join(root, "ABOUT.md");
  if (!existsSync(file)) return null;
  const { data, content } = matter(await readFile(file, "utf8"));
  const match = content.match(TITLE);
  
  return { title: match
    ? match[1].trim()
    : String(data.title ?? "About"), body: content.trim()
  };
}