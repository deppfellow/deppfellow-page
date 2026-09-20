// Obsidian callouts (ADR-0005): a blockquote whose first paragraph starts
// with `[!type]` becomes one styled block aside. Runs on hast, after
// remark-rehype, so the blockquote keeps rendering as a plain blockquote
// wherever the marker is absent.
type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

// `[!type]`, an optional Obsidian fold marker (`+`/`-`, accepted but not
// rendered), and an optional inline title on the same line. The `m` flag is
// what lets `$` close the match at the paragraph's embedded newline.
const MARKER = /^\[!([A-Za-z]+)\][+-]?[ \t]*(.*)$/m;

export function rehypeCallouts() {
  return (tree: HastNode) => {
    if (!tree.children) return;
    for (const child of tree.children) {
      if (child.type === "element" && child.tagName === "blockquote") {
        promote(child);
      }
    }
  };
}

function promote(blockquote: HastNode): void {
  const children = blockquote.children ?? [];
  // mdast-util-to-hast joins block-level children with newline text nodes,
  // so the marker paragraph can sit behind whitespace.
  let at = 0;
  while (
    at < children.length &&
    children[at]?.type === "text" &&
    !(children[at]?.value ?? "").trim()
  )
    at += 1;

  const first = children[at];
  if (first?.type !== "element" || first.tagName !== "p") return;
  const text = first.children?.[0];
  if (text?.type !== "text") return;

  const match = MARKER.exec(text.value ?? "");
  if (!match) return;

  const [, rawType, inlineTitle] = match;
  const type = rawType.toLowerCase();
  const title = inlineTitle.trim() || type;
  const remainder = (text.value ?? "")
    .slice(match[0].length)
    .replace(/^[ \t]*\n/, "");

  if (remainder) {
    text.value = remainder;
  } else {
    first.children?.shift();
    if ((first.children?.length ?? 0) === 0) children.splice(at, 1);
  }

  children.splice(at, 0, {
    type: "element",
    tagName: "p",
    properties: { className: ["callout-title"] },
    children: [{ type: "text", value: title }],
  });
  blockquote.tagName = "aside";
  blockquote.properties = { className: ["callout"], dataCallout: type };
}
