import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { parseNote, readNotes, vaultRoot } from "./vault.ts";

function makeVault(categories: string[], notes: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "vault-"));
  mkdirSync(join(root, "_schema"), { recursive: true });
  writeFileSync(
    join(root, "_schema", "categories.md"),
    `---\ncategories:\n${categories.map((c) => `  - ${c}`).join("\n")}\n---\n`,
  );
  for (const [rel, body] of Object.entries(notes)) {
    const file = join(root, rel);
    mkdirSync(join(file, ".."), { recursive: true });
    writeFileSync(file, body);
  }
  return root;
}

const GOOD = (overrides: Record<string, string> = {}) =>
  `---\ncreated: 2026-01-01${overrides.description ? `\ndescription: ${overrides.description}` : ""}\n---\n\n# T\n`;

describe("vaultRoot", () => {
  const original = process.env.WIKI_PATH;
  afterEach(() => {
    if (original === undefined) delete process.env.WIKI_PATH;
    else process.env.WIKI_PATH = original;
  });

  it("resolves WIKI_PATH", () => {
    process.env.WIKI_PATH = "/tmp/vault-x";
    assert.equal(vaultRoot(), "/tmp/vault-x");
  });
});

describe("parseNote", () => {
  const parse = (data: Record<string, unknown>, body = "# T") => parseNote("/v/n.md", "Articles", body, data);

  it("exposes description from front matter", () => {
    const note = parse({ created: "2026-01-01", description: "Short" });
    assert.equal(note.description, "Short");
  });

  it("yields undefined description when absent", () => {
    const note = parse({ created: "2026-01-01" });
    assert.equal(note.description, undefined);
  });

  it("does not expose origin", () => {
    const note = parse({ created: "2026-01-01", origin: "agent" });
    assert.equal("origin" in note, false);
  });

  it("resolves summary from description over ## Goal", () => {
    const note = parse(
      { created: "2026-01-01", description: "Short" },
      "# T\n\n## Goal\n\n  Goal   body.  \n",
    );
    assert.equal(note.summary, "Short");
  });

  it("resolves summary from ## Goal when description is absent", () => {
    const note = parse({ created: "2026-01-01" }, "# T\n\n## Goal\n\n  Goal   body.  \n");
    assert.equal(note.summary, "Goal body.");
  });

  it("flattens a multi-paragraph ## Goal body into one line", () => {
    const note = parse(
      { created: "2026-01-01" },
      "# G\n\n## Goal\n\nFirst line of goal.\n\nSecond line continues the goal.\n\n## Next\n\nAfter.\n",
    );
    assert.equal(note.summary, "First line of goal. Second line continues the goal.");
  });

  it("resolves a ## Goal body that runs to end of input", () => {
    const note = parse(
      { created: "2026-01-01" },
      "# G\n\n## Goal\n\nFirst line of goal.\n\nSecond line continues the goal.",
    );
    assert.equal(note.summary, "First line of goal. Second line continues the goal.");
  });

  it("resolves summary to undefined with neither source", () => {
    const note = parse({ created: "2026-01-01" }, "# T\n");
    assert.equal(note.summary, undefined);
  });

  it("throws for an invalid created date", () => {
    assert.throws(() => parse({ created: "not-a-date" }), /invalid created/);
  });

  it("throws for a non-string, non-Date created value", () => {
    assert.throws(() => parse({ created: ["2026-01-04"] }), /invalid created/);
  });

  it("throws for a numeric created value (integer or epoch millis)", () => {
    assert.throws(() => parse({ created: 2026 }), /invalid created/);
    assert.throws(() => parse({ created: 1767225600000 }), /invalid created/);
  });

  it("throws for a non-array tags value", () => {
    assert.throws(() => parse({ created: "2026-01-01", tags: "notanarray" }), /invalid tags/);
  });

  it("throws for non-string tags entries", () => {
    assert.throws(() => parse({ created: "2026-01-01", tags: ["a", 1] }), /invalid tags/);
  });

  it("throws for a non-string description value", () => {
    assert.throws(() => parse({ created: "2026-01-01", description: ["a", "b"] }), /invalid description/);
  });
});

describe("readNotes", () => {
  const CATEGORIES = ["Articles"];
  let root: string;

  beforeEach(() => {
    root = "";
  });

  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
  });

  it("reports malformed and language-suffixed files on one skipped list", async () => {
    root = makeVault(CATEGORIES, {
      "Articles/both/both.md": GOOD({ description: "Short" }) + "\n## Goal\n\nGoal body.\n",
      "Articles/goal/goal.md": GOOD() + "\n## Goal\n\n  Goal   body.  \n",
      "Articles/neither/neither.md": GOOD(),
      "Articles/bad/bad.md": "---\ncreated: not-a-date\n---\n\n# T\n",
      "Articles/ja/ok.ja.md": GOOD(),
    });
    const { notes, skipped } = await readNotes(root);
    const bySlug = new Map(notes.map((n) => [n.slug, n]));
    assert.equal(bySlug.get("both")?.description, "Short");
    assert.equal(bySlug.get("both")?.summary, "Short");
    assert.equal(bySlug.get("goal")?.description, undefined);
    assert.equal(bySlug.get("goal")?.summary, "Goal body.");
    assert.equal(bySlug.get("neither")?.description, undefined);
    assert.equal(bySlug.get("neither")?.summary, undefined);
    assert.ok(!bySlug.has("bad"), "malformed note excluded from the collection");
    assert.deepEqual(
      skipped.sort((a, b) => a.path.localeCompare(b.path)),
      [
        {
          path: join(relative(process.cwd(), root), "Articles/bad/bad.md"),
          reason: "invalid created",
        },
        {
          path: join(relative(process.cwd(), root), "Articles/ja/ok.ja.md"),
          reason: "language-suffixed (deferred, ADR-0004)",
        },
      ],
    );
  });

  it("warns per skipped note with the repo-relative path", async () => {
    root = makeVault(["Articles"], {
      "Articles/good/good.md": GOOD(),
      "Articles/bad/bad.md": "---\ncreated: not-a-date\n---\n\n# T\n",
      "Articles/bad.en.md": GOOD(),
    });
    const warnings: string[] = [];
    const { notes, skipped } = await readNotes(root, (msg) => warnings.push(msg));
    assert.equal(notes.length, 1);
    assert.equal(skipped.length, 2);
    assert.equal(warnings.length, 2);
    assert.match(warnings[0], /skipped .*Articles\/bad\/bad\.md: invalid created/);
    assert.match(warnings[1], /skipped .*Articles\/bad\.en\.md: language-suffixed/);
  });

  it("skips and reports wrong-typed front matter while loading good notes", async () => {
    root = makeVault(["Articles"], {
      "Articles/good/good.md": GOOD(),
      "Articles/tags-array/tags-array.md": "---\ncreated: 2026-01-01\ntags: notanarray\n---\n\n# T\n",
      "Articles/desc-array/desc-array.md": "---\ncreated: 2026-01-01\ndescription:\n  - a\n  - b\n---\n\n# T\n",
      "Articles/created-array/created-array.md": "---\ncreated:\n  - 2026-01-04\n---\n\n# T\n",
    });
    const warnings: string[] = [];
    const { notes, skipped } = await readNotes(root, (msg) => warnings.push(msg));
    assert.deepEqual(notes.map((n) => n.slug), ["good"]);
    assert.deepEqual(
      skipped.sort((a, b) => a.path.localeCompare(b.path)),
      [
        { path: join(relative(process.cwd(), root), "Articles/created-array/created-array.md"), reason: "invalid created" },
        { path: join(relative(process.cwd(), root), "Articles/desc-array/desc-array.md"), reason: "invalid description" },
        { path: join(relative(process.cwd(), root), "Articles/tags-array/tags-array.md"), reason: "invalid tags" },
      ],
    );
    for (const warning of warnings) assert.match(warning, /^skipped .*\.md: invalid (created|tags|description)$/);
  });

  it("allows a fixture-only run with zero notes", async () => {
    root = makeVault(["Articles"], {});
    const { notes, skipped } = await readNotes(root);
    assert.deepEqual({ notes, skipped }, { notes: [], skipped: [] });
  });
});
