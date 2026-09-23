import assert from "node:assert/strict";
import test from "node:test";
import { excerpt } from "./excerpt.ts";

test("excerpt returns the first non-heading paragraph, whitespace collapsed", () => {
  const body = "# 2026-09-07\n\nFirst  paragraph\nspans lines.\n\nSecond.";
  assert.equal(excerpt(body), "First paragraph spans lines.");
});

test("excerpt truncates a longer paragraph with an in-cap ellipsis", () => {
  const result = excerpt(`# Title\n\n${"x".repeat(500)}`);
  assert.equal(result?.length, 240);
  assert.ok(result.endsWith("…"));
  assert.equal(result.slice(0, 239), "x".repeat(239));
});

test("excerpt keeps a paragraph at exactly the cap unchanged", () => {
  const paragraph = "x".repeat(240);
  assert.equal(excerpt(`# Title\n\n${paragraph}`), paragraph);
});

test("excerpt returns undefined when the body has no paragraph", () => {
  assert.equal(excerpt("# 2026-09-09"), undefined);
  assert.equal(excerpt(""), undefined);
});

test("excerpt skips fenced code blocks", () => {
  assert.equal(excerpt("# Title\n\n```\ncode\n```\n\nAfter."), "After.");
});
