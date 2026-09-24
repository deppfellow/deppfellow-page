import assert from "node:assert/strict";
import test from "node:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL, URL } from "node:url";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import {
  buildNoteIndex,
  graphNeighbors,
  registerResolveContexts,
  resolveVaultMarkup,
  routeFor,
  tagPages,
} from "./resolve.ts";
import { readNotes } from "./vault.ts";

// Mirrors Astro's pipeline order (@astrojs/markdown-remark createMarkdownProcessor):
// parse -> gfm -> user remark plugins -> remark-rehype -> stringify.
function processor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(resolveVaultMarkup)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true });
}

function noteRaw(frontMatter, body) {
  return `---\n${frontMatter}---\n\n${body}`;
}

const REGISTRY = [
  "---",
  "categories:",
  "  - Articles",
  "---",
  "",
  "# Categories",
  "",
].join("\n");

async function makeVault(t, files) {
  const root = await mkdtemp(join(tmpdir(), "vault-t5-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "_schema"), { recursive: true });
  await writeFile(join(root, "_schema", "categories.md"), REGISTRY);
  for (const [name, content] of Object.entries(files)) {
    const file = join(root, name);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, content);
  }
  return root;
}

// Registers every note for resolution and renders each one through the local
// pipeline, exactly like src/content.config.ts drives the real processor.
async function renderNotes(notes, assetsDir) {
  const index = buildNoteIndex(notes);
  const contexts = notes.map((note) => ({
    note,
    index,
    assetsDir,
    outgoing: [],
  }));
  registerResolveContexts(contexts);
  const rendered = new Map();
  for (const context of contexts) {
    rendered.set(
      context.note.id,
      await processor().process({
        value: context.note.body,
        path: pathToFileURL(context.note.filePath),
      }),
    );
  }
  return { contexts, rendered };
}

async function makeT5Vault(t) {
  const privateNote = noteRaw(
    "created: 2026-09-12\n",
    "# Private Draft Notes\n\nNever scanned by the loader.\n",
  );
  const root = await makeVault(t, {
    "Articles/memory-layers/memory-layers.md": noteRaw(
      "created: 2026-09-01\n",
      "# Memory Layers\n\nHolds [[Current Note]] together.\n",
    ),
    "Articles/current-note/current-note.md": noteRaw(
      "created: 2026-09-02\n",
      [
        "# Current Note",
        "",
        "Public by title: [[Memory Layers]].",
        "Alias by slug: [[memory-layers|layered memory]].",
        "Unlisted: [[Private Draft Notes|draft notes kept out of the registry]].",
        "Missing: [[No Such Note]].",
        "",
        "Embed: ![[plate.png]]",
        "Missing embed: ![[missing.png]]",
        "",
        "- [x] done task",
        "- [ ] open task",
        "",
        "A footnote.[^1] And a tag #WikiGraph inline.",
        "",
        "Inline code `[[Not A Link]] #NotATag` stays literal.",
        "",
        "```md",
        "[[Not A Link]] #NotATag in a fence",
        "```",
        "",
        "## Heading with #NotATag inside",
        "",
        "[^1]: Footnote body.",
        "",
      ].join("\n"),
    ),
    // Outside the registry: readNotes must never see it.
    "_drafts/private/private.md": privateNote,
    "_assets/plate.png": "png",
  });
  return root;
}

test("routeFor lowercases the category and anchors the slug", () => {
  assert.equal(routeFor("Articles", "some-slug"), "/articles/some-slug/");
  assert.equal(
    routeFor("Projects", "td-orchestration"),
    "/projects/td-orchestration/",
  );
  assert.equal(routeFor("Logs", "2026-09-07"), "/logs/2026-09-07/");
});

test("buildNoteIndex matches slug first when a title equals another slug", () => {
  const index = buildNoteIndex([
    { id: "articles/alpha", title: "A", slug: "alpha", category: "Articles" },
    { id: "articles/beta", title: "Alpha", slug: "beta", category: "Articles" },
  ]);
  assert.equal(index.get("alpha").route, "/articles/alpha/");
  assert.equal(index.get("beta").route, "/articles/beta/");
  assert.equal(index.get("a").route, "/articles/alpha/");
});

test("contract mapping table over a synthetic vault", async (t) => {
  const root = await makeT5Vault(t);
  const { notes, skipped } = await readNotes(root);
  assert.equal(
    notes.length,
    2,
    "registry bounds the index: private note not loaded",
  );
  assert.deepEqual(skipped, []);

  const { contexts, rendered } = await renderNotes(
    notes,
    join(root, "_assets"),
  );
  const current = contexts.find((c) => c.note.slug === "current-note");
  const html = rendered.get(current.note.id).value;

  const published = '<a href="/articles/memory-layers/">Memory Layers</a>';
  assert.match(
    html,
    new RegExp(
      `<p>Public by title: ${published}\\.\\nAlias by slug: ${published.replace(
        "Memory Layers",
        "layered memory",
      )}\\.\\nUnlisted: draft notes kept out of the registry\\.\\nMissing: No Such Note\\.</p>`,
    ),
  );
  assert.ok(!html.includes("Private Draft Notes"));
  assert.ok(!html.includes("private-draft-notes"));

  assert.match(html, /Missing: No Such Note\.<\/p>/);
  assert.ok(!html.includes("no-such-note"));

  assert.match(
    html,
    /<p>Embed: <img src="\.\.\/\.\.\/_assets\/plate\.png" alt="plate">\nMissing embed: missing<\/p>/,
  );
  assert.ok(!html.includes("missing.png"));

  assert.match(html, /<input type="checkbox" checked disabled>/);
  assert.match(html, /<input type="checkbox" disabled>/);

  assert.match(html, /data-footnotes/);
  assert.match(html, /id="user-content-fn-1"/);

  assert.match(html, /<a href="\/tags\/wikigraph\/">#WikiGraph<\/a>/);
  assert.ok(!html.includes("/tags/notatag"), "heading text is not tag-linked");

  assert.match(
    html,
    /<code>\[\[Not A Link\]\] #NotATag<\/code>/,
    "inline code is structurally skipped",
  );
  assert.match(
    html,
    /\[\[Not A Link\]\] #NotATag in a fence/,
    "fenced code is structurally skipped",
  );
});

test("graph neighbors merge outgoing edges with inverted incoming edges", async (t) => {
  const root = await makeT5Vault(t);
  const { notes } = await readNotes(root);
  const { contexts } = await renderNotes(notes, join(root, "_assets"));

  const current = contexts.find((c) => c.note.slug === "current-note");
  const layers = contexts.find((c) => c.note.slug === "memory-layers");

  assert.deepEqual(
    current.outgoing,
    [
      {
        title: "Memory Layers",
        route: "/articles/memory-layers/",
        direction: "outgoing",
      },
    ],
    "duplicate edges to one target dedupe",
  );

  const neighbors = graphNeighbors(contexts);
  assert.deepEqual(neighbors.get(current.note.id), [
    {
      title: "Memory Layers",
      route: "/articles/memory-layers/",
      direction: "outgoing",
    },
    {
      title: "Memory Layers",
      route: "/articles/memory-layers/",
      direction: "incoming",
    },
  ]);
  assert.deepEqual(neighbors.get(layers.note.id), [
    {
      title: "Current Note",
      route: "/articles/current-note/",
      direction: "outgoing",
    },
    {
      title: "Current Note",
      route: "/articles/current-note/",
      direction: "incoming",
    },
  ]);
});

test("real fixture vault: T5 setup note renders the full contract table", async () => {
  const root = fileURLToPath(new URL("../../fixtures/vault", import.meta.url));
  const { notes } = await readNotes(root);
  assert.equal(notes.length, 21, "fixture contract count holds");

  const { contexts, rendered } = await renderNotes(
    notes,
    join(root, "_assets"),
  );
  const fixture = contexts.find((c) => c.note.slug === "wikilink-resolution");
  assert.ok(fixture, "fixture note is registry-bound and loaded");
  const html = rendered.get(fixture.note.id).value;

  assert.match(
    html,
    /Published target by title: <a href="\/articles\/memory-layers-for-long-horizon-agents\/">Memory Layers for Long-Horizon Agents<\/a>\./,
  );
  assert.match(
    html,
    /Published target by slug with a label: <a href="\/articles\/memory-layers-for-long-horizon-agents\/">how memory layers hold up<\/a>\./,
  );
  assert.match(
    html,
    /Unlisted target degrades to plain text: draft notes kept out of the registry\.<\/p>/,
  );
  assert.ok(!html.includes("Private Draft Notes"));
  assert.ok(!html.includes("private-draft-notes"));

  assert.match(html, /<img src="\.\.\/\.\.\/_assets\/plate\.png" alt="plate">/);
  assert.match(html, /Missing plate renders alt text only: missing<\/p>/);
  assert.ok(!html.includes("missing.png"));

  assert.match(html, /<input type="checkbox" checked disabled>/);
  assert.match(html, /data-footnotes/);
  assert.match(html, /<a href="\/tags\/wikigraph\/">#WikiGraph<\/a>/);
  assert.match(
    html,
    /<p>Update log lives in Logs\.<\/p>/,
    "unregistered target [[Logs]] degrades to text",
  );

  const neighbors = graphNeighbors(contexts).get(fixture.note.id);
  assert.deepEqual(
    neighbors,
    [
      {
        title: "Memory Layers for Long-Horizon Agents",
        route: "/articles/memory-layers-for-long-horizon-agents/",
        direction: "outgoing",
      },
    ],
    "L-AC-05: graph neighbors carry the published target (no fixture note links back)",
  );
});

test("real fixture vault: private target leaks through no rendered note", async () => {
  const root = fileURLToPath(new URL("../../fixtures/vault", import.meta.url));
  const { notes } = await readNotes(root);
  const { rendered } = await renderNotes(notes, join(root, "_assets"));
  const everything = [...rendered.values()]
    .map((file) => file.value)
    .join("\n");
  assert.ok(!everything.includes("private-draft-notes"));
  assert.ok(!everything.includes("Private Draft Notes"));
});

test("tagPages is the normalized union of front-matter and inline tags", () => {
  const pages = tagPages([
    {
      id: "a",
      data: { tags: ["Agents", "Agent Memory"] },
      body: "carries #agents inline too, plus #LLM",
    },
    { id: "b", data: { tags: ["agents"] }, body: "repeats #agents inline" },
    { id: "c", data: { tags: [] } },
  ]);

  assert.deepEqual([...pages.keys()], ["agents", "agent-memory", "llm"]);
  assert.equal(pages.get("agents")?.name, "Agents");
  assert.equal(pages.get("agent-memory")?.name, "Agent Memory");
  assert.deepEqual(
    pages.get("agents")?.notes.map((note) => note.id),
    ["a", "b"],
  );
});
