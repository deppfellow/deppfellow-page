import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import matter from "gray-matter";

const LANGUAGE_SUFFIX = /\.(en|id|ja)\.md$/i;
const MARKDOWN = /\.md$/i;
const TITLE = /^#\s+(.+)$/m;
const GOAL = /^##\s+Goal\s*\n+([\s\S]*?)(?=\n##\s|\s*$)/m;

export type Note = {
  id: string;
  slug: string;
  category: string;
  title: string;
  created: Date;
  tags: string[];
  origin: string;
  summary?: string;
  body: string;
  filePath: string;
};

// WIKI_PATH wins; otherwise the sibling vault checkout; fixtures only keep local
// development alive while the public categories are still empty.
export function vaultRoot(): string {
  if (process.env.WIKI_PATH) return resolve(process.env.WIKI_PATH);
  const sibling = resolve(process.cwd(), "../deppfellow-wiki");
  if (existsSync(sibling)) return sibling;
  const fixtures = resolve(process.cwd(), "fixtures/vault");
  if (existsSync(fixtures)) return fixtures;
  throw new Error(
    `No vault found. Set WIKI_PATH to the vault, or check out the wiki next to this repo. Tried ${sibling} and ${fixtures}.`,
  );
}

export async function readRegistry(root: string): Promise<string[]> {
  const file = join(root, "_schema", "categories.md");
  if (!existsSync(file)) throw new Error(`Category registry missing at ${file}. The registry is the publication boundary.`);
  const { data } = matter(await readFile(file, "utf8"));
  const categories = Array.isArray(data.categories) ? data.categories.map(String) : [];
  if (categories.length === 0) throw new Error(`Category registry at ${file} lists no categories.`);
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

export function parseNote(file: string, category: string, body: string, data: Record<string, unknown>): Note {
  const slug = file
    .split("/")
    .slice(-1)[0]
    .replace(MARKDOWN, "");
  const isLog = /^\d{4}-\d{2}-\d{2}$/.test(slug);
  const key = isLog ? slug : slug;
  const titleMatch = body.match(TITLE);
  const goalMatch = body.match(GOAL);
  const created = data.created ? new Date(String(data.created)) : new Date(Number.NaN);
  if (Number.isNaN(created.getTime())) throw new Error(`Note ${file} has no valid "created" date.`);
  return {
    id: `${category.toLowerCase()}/${key}`,
    slug: key,
    category,
    title: titleMatch ? titleMatch[1].trim() : key,
    created,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    origin: data.origin ? String(data.origin) : "human",
    summary: goalMatch ? goalMatch[1].replace(/\s+/g, " ").trim() : undefined,
    body,
    filePath: file,
  };
}

export async function readNotes(root: string): Promise<{ notes: Note[]; skipped: string[] }> {
  const categories = await readRegistry(root);
  const notes: Note[] = [];
  const skipped: string[] = [];
  for (const category of categories) {
    for (const file of await noteFiles(root, category)) {
      if (LANGUAGE_SUFFIX.test(file)) {
        skipped.push(file);
        continue;
      }
      const raw = await readFile(file, "utf8");
      const { data, content } = matter(raw);
      notes.push(parseNote(file, category, content.trim(), data));
    }
  }
  return { notes, skipped };
}

export async function readAbout(root: string): Promise<{ title: string; body: string } | null> {
  const file = join(root, "ABOUT.md");
  if (!existsSync(file)) return null;
  const { data, content } = matter(await readFile(file, "utf8"));
  const titleMatch = content.match(TITLE);
  return { title: titleMatch ? titleMatch[1].trim() : String(data.title ?? "About"), body: content.trim() };
}
