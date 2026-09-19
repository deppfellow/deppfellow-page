import { strict as assert } from "node:assert";
import test, { type TestContext } from "node:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import {
  parseNote,
  readNotes,
  vaultRoot,
  type Note,
  type Skipped,
} from "./vault.ts";

const REGISTRY = [
  "---",
  "categories:",
  "  - Articles",
  "  - Projects",
  "---",
  "",
  "# Categories",
  "",
].join("\n");

const ARTICLE_BODY = "# Title\n\nIntro paragraph.\n";

function noteRaw(frontMatter: string, body: string = ARTICLE_BODY): string {
  return `---\n${frontMatter}---\n\n${body}`;
}

function parseRaw(category: string, file: string, raw: string): Note {
  const { data, content } = matter(raw);
  return parseNote(file, category, content.trim(), data);
}

async function makeVault(
  t: TestContext,
  files: Record<string, string>,
  registry: string = REGISTRY,
): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "vault-t1-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "_schema"), { recursive: true });
  await writeFile(join(root, "_schema", "categories.md"), registry);
  for (const [name, raw] of Object.entries(files)) {
    const file = join(root, name);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, raw);
  }
  return root;
}

async function collect(root: string): Promise<{
  notes: Note[];
  skipped: Skipped[];
  warnings: string[];
}> {
  const warnings: string[] = [];
  const { notes, skipped } = await readNotes(root, (message) =>
    warnings.push(message),
  );
  return { notes, skipped, warnings };
}

test("summary prefers the front-matter description over the Objective section", () => {
  const raw = noteRaw(
    'description: "Short summary"\ncreated: 2026-09-11\ntags: [agents]\n',
    "# T\n\n## Objective\nObjective body that must lose to the description.\n",
  );
  const note = parseRaw("Articles", "Articles/t/t.md", raw);
  assert.equal(note.description, "Short summary");
  assert.equal(note.summary, "Short summary");
});

test("summary falls back to a multi-paragraph Objective body flattened to one line", () => {
  const raw = noteRaw(
    "created: 2026-09-11\n",
    [
      "# T",
      "",
      "## Status",
      "draft",
      "",
      "## Objective",
      "First paragraph line one.",
      "Continues here.",
      "",
      "Second paragraph after a blank line.",
      "",
      "## Notes",
      "Trailing section must not leak into the summary.",
      "",
    ].join("\n"),
  );
  const note = parseRaw("Articles", "Articles/t/t.md", raw);
  assert.equal(
    note.summary,
    "First paragraph line one. Continues here. Second paragraph after a blank line.",
  );
});

test("Objective section open at end of body is captured whole, not truncated to the first line", () => {
  const raw = noteRaw(
    "created: 2026-09-11\n",
    [
      "# T",
      "",
      "## Objective",
      "First line of the objective.",
      "Second line continues it.",
      "",
    ].join("\n"),
  );
  const note = parseRaw("Articles", "Articles/t/t.md", raw);
  assert.equal(
    note.summary,
    "First line of the objective. Second line continues it.",
  );
});

test("note with neither description nor Objective loads with summary undefined", () => {
  const note = parseRaw(
    "Articles",
    "Articles/t/t.md",
    noteRaw("created: 2026-09-11\ntags: [notes]\n"),
  );
  assert.equal(note.description, undefined);
  assert.equal(note.summary, undefined);
  assert.equal(note.title, "Title");
});

test("whitespace-only Objective body yields summary undefined", () => {
  const raw = noteRaw("created: 2026-09-11\n", "# T\n\n## Objective\n   \n");
  const note = parseRaw("Articles", "Articles/t/t.md", raw);
  assert.equal(note.summary, undefined);
});

test("blank description normalizes to undefined and defers to the Objective section", () => {
  const raw = noteRaw(
    'description: "   "\ncreated: 2026-09-11\n',
    "# T\n\n## Objective\nObjective body wins over a blank description.\n",
  );
  const note = parseRaw("Articles", "Articles/t/t.md", raw);
  assert.equal(note.description, undefined);
  assert.equal(note.summary, "Objective body wins over a blank description.");
});

test("present-but-not-string description is rejected, not coerced", () => {
  const arrayDesc = noteRaw(
    "description:\n  - not\n  - a string\ncreated: 2026-09-11\n",
  );
  assert.throws(
    () => parseRaw("Articles", "Articles/t/t.md", arrayDesc),
    /invalid description/,
  );
  const numberDesc = noteRaw("description: 42\ncreated: 2026-09-11\n");
  assert.throws(
    () => parseRaw("Articles", "Articles/t/t.md", numberDesc),
    /invalid description/,
  );
});

test("numeric created is malformed, both integer and epoch millis", () => {
  const integer = noteRaw("created: 2026\ntags: [x]\n");
  assert.throws(
    () => parseRaw("Articles", "Articles/t/t.md", integer),
    /invalid created/,
  );
  const epochMillis = noteRaw("created: 1767225600000\ntags: [x]\n");
  assert.throws(
    () => parseRaw("Articles", "Articles/t/t.md", epochMillis),
    /invalid created/,
  );
});

test("unparseable created string is malformed", () => {
  const raw = noteRaw("created: not-a-date\n");
  assert.throws(
    () => parseRaw("Articles", "Articles/t/t.md", raw),
    /invalid created/,
  );
});

test("created loads from a bare YAML date and from an ISO string", () => {
  const bare = parseRaw(
    "Articles",
    "Articles/t/t.md",
    noteRaw("created: 2026-09-11\n"),
  );
  assert.ok(bare.created instanceof Date);
  assert.equal(bare.created.toISOString(), "2026-09-11T00:00:00.000Z");
  const quoted = parseRaw(
    "Articles",
    "Articles/t/t.md",
    noteRaw('created: "2026-09-11"\n'),
  );
  assert.equal(quoted.created.toISOString(), "2026-09-11T00:00:00.000Z");
});

test("tags must be an array of strings when present", () => {
  const scalar = noteRaw("created: 2026-09-11\ntags: not-an-array\n");
  assert.throws(
    () => parseRaw("Articles", "Articles/t/t.md", scalar),
    /invalid tags/,
  );
  const mixed = noteRaw("created: 2026-09-11\ntags: [ok, 42]\n");
  assert.throws(
    () => parseRaw("Articles", "Articles/t/t.md", mixed),
    /invalid tags/,
  );
  const good = parseRaw(
    "Articles",
    "Articles/t/t.md",
    noteRaw("created: 2026-09-11\ntags: [a, b]\n"),
  );
  assert.deepEqual(good.tags, ["a", "b"]);
});

test("retired front-matter field is ignored, never read", () => {
  const withFallback = noteRaw(
    'origin: agent\ndescription: "From description"\ncreated: 2026-09-11\n',
    "# T\n\n## Objective\nObjective body.\n",
  );
  const note = parseRaw("Articles", "Articles/t/t.md", withFallback);
  assert.equal(note.summary, "From description");
  const only = parseRaw(
    "Articles",
    "Articles/t/t.md",
    noteRaw("origin: agent\ncreated: 2026-09-11\n"),
  );
  assert.equal(only.summary, undefined);
});

test("malformed note is skipped with its path while good notes still load", async (t) => {
  const root = await makeVault(t, {
    "Articles/good.md": noteRaw('description: "Fine"\ncreated: 2026-09-11\n'),
    "Articles/bad.md": noteRaw("created: not-a-date\n"),
  });
  const { notes, skipped, warnings } = await collect(root);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].summary, "Fine");
  assert.equal(skipped.length, 1);
  assert.match(skipped[0].path, /Articles\/bad\.md$/);
  assert.ok(!skipped[0].path.startsWith("/"), "skipped path must be relative");
  assert.equal(skipped[0].reason, "invalid created");
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /^skipped .*Articles\/bad\.md: invalid created$/);
});

test("wrong-typed description routes through the skipped path", async (t) => {
  const root = await makeVault(t, {
    "Articles/good.md": noteRaw("created: 2026-09-11\n"),
    "Articles/descbad.md": noteRaw(
      "description:\n  - nope\ncreated: 2026-09-11\n",
    ),
  });
  const { notes, skipped, warnings } = await collect(root);
  assert.equal(notes.length, 1);
  assert.equal(skipped.length, 1);
  assert.match(skipped[0].path, /descbad\.md$/);
  assert.equal(skipped[0].reason, "invalid description");
  assert.match(warnings[0], /invalid description/);
});

test("wrong-typed tags and numeric created land on skipped with repo-relative warnings", async (t) => {
  const root = await makeVault(t, {
    "Articles/good.md": noteRaw("created: 2026-09-11\n"),
    "Articles/tagsbad.md": noteRaw(
      "created: 2026-09-11\ntags: scalar-not-array\n",
    ),
    "Articles/createdint.md": noteRaw("created: 2026\n"),
    "Articles/createdmillis.md": noteRaw("created: 1767225600000\n"),
  });
  const { notes, skipped, warnings } = await collect(root);
  assert.equal(notes.length, 1);
  assert.equal(skipped.length, 3);
  const tagsPath = skipped.find((s) => s.reason === "invalid tags");
  assert.ok(tagsPath);
  assert.match(tagsPath.path, /tagsbad\.md$/);
  const createdPaths = skipped
    .filter((s) => s.reason === "invalid created")
    .map((s) => s.path);
  assert.equal(createdPaths.length, 2);
  assert.ok(createdPaths.some((p) => /createdint\.md$/.test(p)));
  assert.ok(createdPaths.some((p) => /createdmillis\.md$/.test(p)));
  assert.ok(!skipped.some((s) => s.path.startsWith("/")));
  assert.equal(warnings.length, 3);
});

test("language-suffixed files are skipped with the deferred ADR reason", async (t) => {
  const root = await makeVault(t, {
    "Articles/note.ja.md": noteRaw("created: 2026-09-11\n"),
    "Articles/note.md": noteRaw("created: 2026-09-11\n"),
  });
  const { notes, skipped } = await collect(root);
  assert.equal(notes.length, 1);
  assert.match(notes[0].filePath, /note\.md$/);
  assert.equal(skipped.length, 1);
  assert.match(skipped[0].path, /note\.ja\.md$/);
  assert.equal(skipped[0].reason, "language-suffixed (deferred, ADR-0004)");
});

test("missing category registry throws", async (t) => {
  const root = await makeVault(t, {
    "Articles/note.md": noteRaw("created: 2026-09-11\n"),
  });
  await rm(join(root, "_schema"), { recursive: true, force: true });
  await assert.rejects(() => readNotes(root), /Category registry missing/);
});

test("registry listing no categories throws", async (t) => {
  const root = await makeVault(
    t,
    { "Articles/note.md": noteRaw("created: 2026-09-11\n") },
    "---\ncategories: []\n---\n\n# Categories\n",
  );
  await assert.rejects(() => readNotes(root), /lists no categories/);
});

test("zero found notes is legal", async (t) => {
  const root = await makeVault(t, {});
  const { notes, skipped } = await collect(root);
  assert.deepEqual({ notes, skipped }, { notes: [], skipped: [] });
});

test("all found notes skipped throws", async (t) => {
  const root = await makeVault(t, {
    "Articles/bad1.md": noteRaw("created: not-a-date\n"),
    "Articles/bad2.md": noteRaw("created: 2026\n"),
  });
  await assert.rejects(() => readNotes(root), /No parseable notes/);
});

test("vaultRoot throws when WIKI_PATH is unset", (t) => {
  const saved = process.env.WIKI_PATH;
  t.after(() => {
    if (saved === undefined) delete process.env.WIKI_PATH;
    else process.env.WIKI_PATH = saved;
  });
  delete process.env.WIKI_PATH;
  assert.throws(() => vaultRoot(), /No vault found/);
});

test("fixture vault: precedence, skip reporting, and note count hold at repo scale", async () => {
  const root = fileURLToPath(new URL("../../fixtures/vault", import.meta.url));
  const { notes, skipped, warnings } = await collect(root);
  assert.equal(notes.length, 21);
  assert.equal(skipped.length, 1);
  assert.equal(
    skipped[0].path,
    "fixtures/vault/Articles/broken-note/broken-note.md",
  );
  assert.equal(skipped[0].reason, "invalid created");
  assert.deepEqual(warnings, [
    "skipped fixtures/vault/Articles/broken-note/broken-note.md: invalid created",
  ]);

  const wikilink = notes.find((n) => n.slug === "wikilink-resolution");
  assert.ok(wikilink);
  assert.equal(wikilink.description, "Wiki LLM connections");
  assert.equal(wikilink.summary, "Wiki LLM connections");
  assert.ok(wikilink.summary !== undefined);

  const objectiveOnly = notes.find((n) => n.slug === "objective-only");
  assert.ok(objectiveOnly);
  assert.equal(objectiveOnly.description, undefined);
  assert.equal(
    objectiveOnly.summary,
    "A note whose summary comes from the Objective section because front matter has no description.",
  );

  const bare = notes.find((n) => n.slug === "bare-note");
  assert.ok(bare);
  assert.equal(bare.description, undefined);
  assert.equal(bare.summary, undefined);
});
