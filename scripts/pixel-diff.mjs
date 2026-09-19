#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const [, , aPath, bPath, diffOut] = process.argv;
if (!aPath || !bPath) {
  console.error("usage: pixel-diff.mjs <a.png> <b.png> [diff-out.png]");
  process.exit(1);
}

const [a, b] = await Promise.all([readFile(aPath), readFile(bPath)]).then(
  (buffers) => buffers.map((buf) => PNG.sync.read(buf)),
);
if (a.width !== b.width || a.height !== b.height) {
  console.error(
    `size mismatch: ${a.width}x${a.height} vs ${b.width}x${b.height}`,
  );
  process.exit(1);
}

const diff = new PNG({ width: a.width, height: a.height });
const count = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
  threshold: 0.1,
});
console.log(
  `${count} differing pixels of ${a.width * a.height} (${a.width}x${a.height})`,
);

if (count > 0 && diffOut) {
  await writeFile(diffOut, PNG.sync.write(diff));
  console.log(`diff image: ${diffOut}`);
}
process.exit(count === 0 ? 0 : 1);
