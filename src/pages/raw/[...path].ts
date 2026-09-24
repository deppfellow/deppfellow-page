import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { rawPath } from "../../lib/urls";

// The vault file body of each published note at a stable path mirrored by the
// catalog's rawMarkdownUrl. Only registered notes reach the content store, so
// only they get a raw file (registry boundary).
export const getStaticPaths: GetStaticPaths = async () => {
  const notes = await getCollection("notes");
  return notes.map((note) => ({
    params: { path: rawPath(note.data).slice("/raw/".length) },
    props: { markdown: note.body ?? "" },
  }));
};

export const GET: APIRoute = async ({ props }) =>
  new Response(props.markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
