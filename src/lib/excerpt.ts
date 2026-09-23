const HEADING = /^#{1,6}\s/;
const CODE_FENCE = /^(```|~~~)/;
const EXCERPT_CAP = 240;
const ELLIPSIS = "…";

function firstParagraph(body: string): string | undefined {
  for (const block of body.split(/\n{2,}/)) {
    const paragraph = block.trim();
    if (!paragraph) continue;
    if (HEADING.test(paragraph) || CODE_FENCE.test(paragraph)) continue;
    return paragraph.replace(/\s+/g, " ");
  }
  return undefined;
}

export function excerpt(body: string): string | undefined {
  const paragraph = firstParagraph(body);
  if (paragraph === undefined) return undefined;
  if (paragraph.length <= EXCERPT_CAP) return paragraph;
  return paragraph.slice(0, EXCERPT_CAP - 1) + ELLIPSIS;
}
