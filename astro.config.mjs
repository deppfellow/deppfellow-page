import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { resolveVaultMarkup } from "./src/lib/resolve.ts";
import { rehypeCallouts } from "./src/lib/callouts.ts";
import { routeManifest } from "./src/lib/manifest.ts";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://deppfellow.github.io",
  output: "static",
  integrations: [routeManifest()],
  build: { format: "directory" },
  markdown: {
    // Astro 7 defaults to the Sätteri processor; T5's resolution pass is a
    // remark/rehype pipeline, so pin unified() explicitly (ADR-0014). The
    // plugin reads its per-note context through the globalThis bridge that
    // src/content.config.ts populates. Math renders at build time (REQ-08);
    // callouts promote Obsidian blockquotes (ADR-0005). Code fences render
    // plain inside a CSS hairline frame — no highlighter ink in the plate.
    syntaxHighlight: false,
    processor: unified({
      remarkPlugins: [resolveVaultMarkup, remarkMath],
      rehypePlugins: [rehypeCallouts, rehypeKatex],
    }),
  },
  vite: { plugins: [tailwindcss()] },
});
