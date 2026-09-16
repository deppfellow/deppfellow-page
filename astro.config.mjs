import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://deppfellow.github.io",
      output: "static",
      build: { format: "directory" },
      markdown: {
        processor: unified(),
      },
      vite: { plugins: [tailwindcss()] },
});