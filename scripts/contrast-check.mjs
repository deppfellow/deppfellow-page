import { readFile } from "node:fs/promises";
import process from "node:process";

// Usage: node scripts/contrast-check.mjs [path-to-global.css]
const path = process.argv[2] ?? "src/styles/global.css";
const css = await readFile(path, "utf8");

const SLOTS = [
  "plate",
  "plate-edge",
  "rule",
  "rule-strong",
  "bone",
  "star",
  "iris",
  "ember",
];

// D-05 roles as amended by D-15: small text 4.5:1, UI marks 3:1. The
// light-world hairlines are hard floors (D-15); the dark-world hairlines are
// decorative and frozen byte-identical, so they are printed but never
// enforced.
const ENFORCED_EVERYWHERE = [
  ["bone", "plate", 4.5],
  ["star", "plate", 4.5],
  ["iris", "plate", 3],
  ["ember", "plate", 3],
];
const ENFORCED_LIGHT_ONLY = [
  ["rule", "plate", 3],
  ["rule-strong", "plate", 3],
];
const DARK_FROZEN = [
  ["rule", "plate"],
  ["rule-strong", "plate"],
];

function parseWorld(name, pattern) {
  const block = css.match(pattern);
  if (!block) {
    console.error(`contrast-check: found no ${name} block in ${path}`);
    process.exit(1);
  }
  const values = {};
  for (const slot of SLOTS) {
    const decl = block[1].match(
      new RegExp(`--color-${slot}\\s*:\\s*(#[0-9a-fA-F]{3,8})`),
    );
    if (!decl) {
      console.error(
        `contrast-check: --color-${slot} is missing from the ${name} block in ${path}`,
      );
      process.exit(1);
    }
    values[slot] = decl[1];
  }
  return values;
}

const dark = parseWorld("dark (@theme)", /@theme\s*\{([^}]*)\}/);
const light = parseWorld(
  'light (html[data-theme="light"])',
  /html\[data-theme="light"\]\s*\{([^}]*)\}/,
);

function channels(hex) {
  const digits = hex.slice(1);
  const full =
    digits.length === 3
      ? digits
          .split("")
          .map((c) => c + c)
          .join("")
      : digits;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
}

function luminance(hex) {
  const [r, g, b] = channels(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

const failures = [];

function check(world, values, [foreground, background, floor]) {
  const got = ratio(values[foreground], values[background]);
  const label = `${foreground}/${background} ${floor}:1`;
  if (got >= floor) {
    console.log(
      `pass  ${world}  ${label.padEnd(22)} ${values[foreground]} on ${values[background]}  got ${got.toFixed(2)}`,
    );
  } else {
    console.log(
      `FAIL  ${world}  ${label.padEnd(22)} ${values[foreground]} on ${values[background]}  got ${got.toFixed(2)}`,
    );
    failures.push(`${world} ${label} (got ${got.toFixed(2)})`);
  }
}

function noteFrozen(world, values, [foreground, background]) {
  const got = ratio(values[foreground], values[background]);
  console.log(
    `note  ${world}  ${foreground}/${background} (no floor)   ${values[foreground]} on ${values[background]}  got ${got.toFixed(2)}  decorative, frozen`,
  );
}

for (const pair of ENFORCED_EVERYWHERE) {
  check("dark", dark, pair);
  check("light", light, pair);
}
for (const pair of ENFORCED_LIGHT_ONLY) {
  check("light", light, pair);
}
for (const pair of DARK_FROZEN) {
  noteFrozen("dark", dark, pair);
}

if (failures.length > 0) {
  console.error(`contrast-check: hard floor missed in ${path}`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}
console.log(`contrast-check: all hard floors met in ${path}`);
