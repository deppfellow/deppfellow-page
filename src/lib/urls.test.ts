import { strict as assert } from "node:assert";
import test from "node:test";
import {
  absolute,
  normalizeTag,
  notePath,
  tagPath,
  uniqueTags,
} from "./urls.ts";

const date = (iso: string) => new Date(`${iso}T00:00:00Z`);

test("notePath routes Articles and Projects by slug", () => {
  assert.equal(
    notePath({
      category: "Articles",
      slug: "some-note",
      created: date("2026-09-07"),
    }),
    "/articles/some-note/",
  );
  assert.equal(
    notePath({
      category: "Projects",
      slug: "bench-tools",
      created: date("2026-09-07"),
    }),
    "/projects/bench-tools/",
  );
});

test("notePath routes Logs by created date, like [...date].astro", () => {
  assert.equal(
    notePath({
      category: "Logs",
      slug: "whatever",
      created: date("2026-09-07"),
    }),
    "/logs/2026-09-07/",
  );
});

test("tagPath lowercases the tag", () => {
  assert.equal(tagPath("Agents"), "/tags/agents/");
});

test("normalizeTag lowercases and dashes spaces", () => {
  assert.equal(normalizeTag("Agent Memory"), "agent-memory");
});

test("tagPath normalizes uppercase and spaces", () => {
  assert.equal(tagPath("Agent Memory"), "/tags/agent-memory/");
});

test("uniqueTags lowercases, dedupes across notes, and sorts", () => {
  const tags = uniqueTags([
    { tags: ["Agents", "memory"] },
    { tags: ["agents", "LLM"] },
    { tags: [] },
  ]);
  assert.deepEqual(tags, ["agents", "llm", "memory"]);
});

test("uniqueTags normalizes uppercase and space tags", () => {
  assert.deepEqual(uniqueTags([{ tags: ["Agent Memory"] }]), ["agent-memory"]);
});

test("absolute joins against the site root without path prefix surprises", () => {
  assert.equal(
    absolute("/articles/x/", new URL("https://deppfellow.github.io")),
    "https://deppfellow.github.io/articles/x/",
  );
  assert.equal(
    absolute("/", new URL("https://deppfellow.github.io/")),
    "https://deppfellow.github.io/",
  );
});
