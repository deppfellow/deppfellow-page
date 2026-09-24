#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const CDP_HTTP = process.env.CDP_ENDPOINT ?? "http://127.0.0.1:9222";
const CHROME =
  process.env.CHROME_PATH ??
  `${process.env.HOME}/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`;
const url = process.argv[2];
const outDir = process.argv[3] ?? ".impeccable/review";

if (!url) {
  console.error("usage: review-capture.mjs <url> [out-dir]");
  process.exit(1);
}

const VIEWPORTS = [
  {
    name: "desktop",
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  },
  {
    name: "mobile",
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  },
];

async function rpc(ws) {
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) {
        reject(new Error(msg.error.message));
      } else {
        resolve(msg.result);
      }
    } else if (msg.method) {
      for (const fn of listeners) fn(msg);
    }
  });
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  return {
    send(method, params = {}, sessionId) {
      const message = { id: ++id, method, params };
      if (sessionId) message.sessionId = sessionId;
      ws.send(JSON.stringify(message));
      return new Promise((resolve, reject) =>
        pending.set(message.id, { resolve, reject }),
      );
    },
    once(method, sessionId, timeoutMs = 20000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          listeners.delete(fn);
          reject(new Error(`timeout waiting for ${method}`));
        }, timeoutMs);
        const fn = (msg) => {
          if (msg.method !== method) return;
          if (sessionId && msg.sessionId !== sessionId) return;
          clearTimeout(timer);
          listeners.delete(fn);
          resolve(msg.params);
        };
        listeners.add(fn);
      });
    },
    close() {
      ws.close();
    },
  };
}

try {
  const probe = await fetch(`${CDP_HTTP}/json/version`, {
    signal: AbortSignal.timeout(1500),
  });
  if (!probe.ok) throw new Error("not ok");
} catch {
  if (!existsSync(CHROME))
    throw new Error(`no browser on ${CDP_HTTP} and none at ${CHROME}`);
  spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${new URL(CDP_HTTP).port}`,
      "--user-data-dir=/tmp/pi-cdp-profile",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { detached: true, stdio: "ignore" },
  ).unref();
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await fetch(`${CDP_HTTP}/json/version`, {
        signal: AbortSignal.timeout(1000),
      });
      if (res.ok) break;
    } catch {
      // Chrome not accepting connections yet; keep polling
    }
  }
}

const { webSocketDebuggerUrl } = await (
  await fetch(`${CDP_HTTP}/json/version`)
).json();
const ws = new WebSocket(webSocketDebuggerUrl);
const cdp = await rpc(ws);
const { targetId } = await cdp.send("Target.createTarget", {
  url: "about:blank",
});
const { sessionId } = await cdp.send("Target.attachToTarget", {
  targetId,
  flatten: true,
});
await cdp.send("Page.enable", {}, sessionId);
await cdp.send("Runtime.enable", {}, sessionId);
await mkdir(outDir, { recursive: true });

for (const vp of VIEWPORTS) {
  await cdp.send(
    "Emulation.setDeviceMetricsOverride",
    {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.deviceScaleFactor,
      mobile: vp.mobile,
    },
    sessionId,
  );
  await cdp.send(
    "Emulation.setEmulatedMedia",
    {
      media: "screen",
      features: [{ name: "prefers-color-scheme", value: "dark" }],
    },
    sessionId,
  );
  // Park the pointer off-canvas so residual hover state never differs between captures.
  await cdp.send(
    "Input.dispatchMouseEvent",
    { type: "mouseMoved", x: -1, y: -1 },
    sessionId,
  );
  const loaded = cdp.once("Page.loadEventFired", sessionId);
  await cdp.send("Page.navigate", { url }, sessionId);
  await loaded;
  await new Promise((r) => setTimeout(r, 600));
  await cdp.send(
    "Input.dispatchMouseEvent",
    { type: "mouseMoved", x: -1, y: -1 },
    sessionId,
  );
  const shot = await cdp.send(
    "Page.captureScreenshot",
    { format: "png", captureBeyondViewport: true },
    sessionId,
  );
  const file = path.join(outDir, `${vp.name}.png`);
  await writeFile(file, Buffer.from(shot.data, "base64"));
  const metrics = await cdp.send(
    "Runtime.evaluate",
    {
      expression: `JSON.stringify({ title: document.title, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth, bodyBg: getComputedStyle(document.body).backgroundColor, bodyFont: getComputedStyle(document.body).fontFamily, bodySize: getComputedStyle(document.body).fontSize, bodyColor: getComputedStyle(document.body).color, scripts: document.querySelectorAll("script").length, firstRow: (() => { const el = document.querySelector("ol li time"); return el ? { text: el.textContent, size: getComputedStyle(el).fontSize, font: getComputedStyle(el).fontFamily } : null; })() })`,
      returnByValue: true,
    },
    sessionId,
  );
  console.log(`${vp.name}: ${file}`);
  console.log(`  ${metrics.result.value}`);
}

await cdp.send("Target.closeTarget", { targetId });
cdp.close();
