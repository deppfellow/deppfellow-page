import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { readNotes, readRegistry, vaultRoot } from "./vault";

const EMITTED = /\.(html|xml)$/;

async function builtRoutes(dir: string): Promise<string[]> {
  const routes: string[] = [];
  async function walk(prefix: string, current: string): Promise<void> {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        await walk(`${prefix}${entry.name}/`, join(current, entry.name));
        continue;
      }
      if (!EMITTED.test(entry.name)) continue;
      routes.push(
        entry.name === "index.html" ? prefix : `${prefix}${entry.name}`,
      );
    }
  }
  await walk("/", dir);
  return routes.sort();
}

function countByCategory(
  items: { category: string }[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items)
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  return counts;
}

export function routeManifest(): AstroIntegration {
  return {
    name: "deppfellow-route-manifest",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const root = vaultRoot();
        const categories = await readRegistry(root);
        const { notes, foundByCategory } = await readNotes(root, () => {});
        const parsed = countByCategory(notes);
        const routes = await builtRoutes(fileURLToPath(dir));

        const manifest = {
          categories,
          routes,
          articles: parsed["Articles"] ?? 0,
          articleFiles: foundByCategory["Articles"] ?? 0,
        };
        await writeFile(
          join(fileURLToPath(dir), "manifest.json"),
          `${JSON.stringify(manifest, null, 2)}\n`,
        );
        logger.info(
          `route manifest: ${routes.length} routes, ${manifest.articles} Articles`,
        );
      },
    },
  };
}
