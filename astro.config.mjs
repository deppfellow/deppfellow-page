import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://deppfellow.github.io",
  output: "static",
  build: { format: "directory" },
  markdown: {
    // Astro 7 defaults to the Sätteri processor; T5's resolution pass is a
    // remark/rehype pipeline, so pin unified() explicitly (ADR-0014).
    processor: unified(),
  },
  vite: { plugins: [tailwindcss()] },
});
