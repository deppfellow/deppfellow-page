#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const CDP_HTTP = process.env.CDP_ENDPOINT ?? "http://127.0.0.1:9222";
const CHROME =
  process.env.CHROME_PATH ??
  `${process.env.HOME}/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`;
const OUT_ROOT = process.env.OUT_ROOT ?? ".docs/references/packs";

const TARGETS = [
  { slug: "lucumr-about", url: "https://lucumr.pocoo.org/about/", note: "index/about pattern" },
  { slug: "morg-timeline", url: "https://morg.systems/78550a77", note: "articles list pattern" },
  { slug: "lucumr-index", url: "https://lucumr.pocoo.org/", note: "posts list pattern" },
  { slug: "rasyidanaf-notes", url: "https://rasyidanaf.com/notes/", note: "logs list pattern", toggleDark: true },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  { name: "mobile", width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
];

function dump() {
  const out = { meta: {}, body: {}, containers: [], fonts: [], colors: { text: [], backgrounds: [] }, headings: [], links: {}, rows: {}, rules: [], nav: [], images: [], rhythm: [] };
  const style = (el) => (el ? getComputedStyle(el) : null);
  const pick = (selectors) => {
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el) return [s, el];
    }
    return [null, null];
  };
  const box = (el) => {
    const cs = style(el);
    if (!cs) return null;
    const r = el.getBoundingClientRect();
    return {
      width: Math.round(r.width),
      contentWidth: Math.round(el.clientWidth) - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0),
      height: Math.round(r.height),
      display: cs.display,
      gridTemplateColumns: cs.gridTemplateColumns,
      flexDirection: cs.flexDirection,
      gap: cs.gap === "normal" ? null : cs.gap,
      paddingLeft: cs.paddingLeft,
      paddingRight: cs.paddingRight,
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
      marginTop: cs.marginTop,
      marginBottom: cs.marginBottom,
      borderLeft: cs.borderLeftWidth === "0px" ? null : `${cs.borderLeftWidth} ${cs.borderLeftStyle} ${cs.borderLeftColor}`,
      borderTop: cs.borderTopWidth === "0px" ? null : `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
      backgroundColor: cs.backgroundColor === "rgba(0, 0, 0, 0)" ? null : cs.backgroundColor,
    };
  };
  const measureCh = (el) => {
    if (!el) return null;
    const cs = style(el);
    const probe = document.createElement("span");
    probe.style.cssText = `position:absolute;visibility:hidden;width:1ch;font-family:${cs.fontFamily};font-size:${cs.fontSize};font-weight:${cs.fontWeight};letter-spacing:${cs.letterSpacing}`;
    document.body.appendChild(probe);
    const chPx = probe.getBoundingClientRect().width;
    probe.remove();
    if (!chPx) return null;
    const inner = el.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
    return { chPx: Math.round(chPx * 100) / 100, ch: Math.round((inner / chPx) * 10) / 10 };
  };
  const textOf = (el) => (el?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 120);

  out.meta = {
    url: location.href,
    title: document.title,
    viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio },
    docHeight: document.documentElement.scrollHeight,
    docWidth: document.documentElement.scrollWidth,
    prefersDark: matchMedia("(prefers-color-scheme: dark)").matches,
  };

  const bcs = style(document.body);
  out.body = {
    fontFamily: bcs.fontFamily,
    fontSize: bcs.fontSize,
    lineHeight: bcs.lineHeight,
    fontWeight: bcs.fontWeight,
    color: bcs.color,
    backgroundColor: bcs.backgroundColor,
    padding: bcs.padding,
    margin: bcs.margin,
  };

  const chrome = (el) => el.closest("header, nav, footer, aside") != null;
  const tagged = (el) => {
    let node = el;
    while (node && node !== document.body) {
      if (/^(MAIN|ARTICLE|SECTION|DIV)$/.test(node.tagName)) return node;
      node = node.parentElement;
    }
    return document.body;
  };
  const contentScores = new Map();
  for (const p of document.querySelectorAll("p, li, h2, h3, blockquote")) {
    if (chrome(p)) continue;
    const len = (p.textContent ?? "").trim().length;
    if (len < 40) continue;
    const host = tagged(p);
    const entry = contentScores.get(host) ?? { score: 0, blocks: 0 };
    entry.score += Math.min(len, 400);
    entry.blocks += 1;
    contentScores.set(host, entry);
  }
  const contentRoot = [...contentScores.entries()].sort((a, b) => b[1].score - a[1].score)[0]?.[0] ?? document.body;
  out.meta.contentRoot = { tag: contentRoot.tagName.toLowerCase(), class: contentRoot.className || null, blocks: contentScores.get(contentRoot)?.blocks ?? 0 };
  for (const [label, el] of [["contentRoot", contentRoot], ["main", document.querySelector("main")], ["article", document.querySelector("article")], ["body", document.body]]) {
    if (el) out.containers.push({ sel: label, text: textOf(el), box: box(el), measure: measureCh(el) });
  }
  for (const sel of ["h1", "p", "time", "[class*=date]", "[class*=meta]", "header", "nav"]) {
    const el = document.querySelector(sel);
    if (el) out.containers.push({ sel, text: textOf(el), box: box(el), measure: measureCh(el) });
  }

  const fontCount = new Map();
  const textCount = new Map();
  const bgCount = new Map();
  const all = document.querySelectorAll("body *");
  const limit = Math.min(all.length, 4000);
  for (let i = 0; i < limit; i++) {
    const el = all[i];
    if (!el.textContent?.trim() && el.children.length) continue;
    const cs = style(el);
    const key = `${cs.fontFamily}|${cs.fontSize}|${cs.fontWeight}|${cs.lineHeight}|${cs.letterSpacing}|${cs.color}`;
    fontCount.set(key, (fontCount.get(key) ?? 0) + 1);
    if (el.textContent?.trim()) textCount.set(cs.color, (textCount.get(cs.color) ?? 0) + 1);
    if (cs.backgroundColor !== "rgba(0, 0, 0, 0)") bgCount.set(cs.backgroundColor, (bgCount.get(cs.backgroundColor) ?? 0) + 1);
  }
  out.fonts = [...fontCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([key, count]) => {
      const [fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, color] = key.split("|");
      return { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, color, count };
    });
  out.colors.text = [...textCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([color, count]) => ({ color, count }));
  out.colors.backgrounds = [...bgCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([color, count]) => ({ color, count }));

  for (const tag of ["h1", "h2", "h3", "h4"]) {
    for (const el of [...document.querySelectorAll(tag)].slice(0, 4)) {
      const cs = style(el);
      out.headings.push({
        tag,
        text: textOf(el),
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        color: cs.color,
        fontStyle: cs.fontStyle,
        marginTop: cs.marginTop,
        marginBottom: cs.marginBottom,
        textTransform: cs.textTransform,
      });
    }
  }

  const link = document.querySelector("main a, article a, a[href]");
  if (link) {
    const cs = style(link);
    out.links = {
      color: cs.color,
      textDecorationLine: cs.textDecorationLine,
      textDecorationStyle: cs.textDecorationStyle,
      textDecorationColor: cs.textDecorationColor,
      textUnderlineOffset: cs.textUnderlineOffset,
      fontWeight: cs.fontWeight,
      borderBottom: cs.borderBottomWidth === "0px" ? null : `${cs.borderBottomWidth} ${cs.borderBottomColor}`,
      sampleText: textOf(link),
    };
  }

  const rowCandidates = [];
  for (const el of document.querySelectorAll("ul, ol, div, section, article, main")) {
    if (chrome(el) || el === contentRoot) continue;
    const kids = [...el.children];
    const withLink = kids.filter((k) => k.querySelector("a[href]") && (k.textContent ?? "").trim().length > 3);
    if (withLink.length >= 4) rowCandidates.push({ el, kids: withLink });
  }
  rowCandidates.push(...[...document.querySelectorAll("main > *, article > *")].map((el) => ({ el: el.parentElement, kids: [...el.parentElement.children].filter((k) => k.querySelector("a[href]") && (k.textContent ?? "").trim().length > 3) })).filter((c) => c.kids.length >= 4));
  const listPick = rowCandidates.sort((a, b) => b.kids.length - a.kids.length)[0];
  if (listPick) {
    const row = listPick.kids[0];
    const rowCs = style(row);
    const parentCs = style(row.parentElement);
    const dateEl = row.querySelector("time, .date, [class*=date], [class*=meta]") ?? row.firstElementChild;
    const nextRow = row.nextElementSibling;
    const gapPx = nextRow ? Math.round(nextRow.getBoundingClientRect().top - row.getBoundingClientRect().bottom) : null;
    const rowHeight = nextRow ? Math.round(nextRow.getBoundingClientRect().top - row.getBoundingClientRect().top) : null;
    out.rows = {
      listContainer: { tag: listPick.el.tagName.toLowerCase(), class: listPick.el.className || null, rows: listPick.kids.length, box: box(listPick.el) },
      secondRow: textOf(listPick.kids[1] ?? null),
      sampleText: textOf(row),
      rowDisplay: rowCs.display,
      rowGridTemplateColumns: rowCs.gridTemplateColumns,
      rowGap: rowCs.gap === "normal" ? null : rowCs.gap,
      rowPaddingY: `${rowCs.paddingTop} / ${rowCs.paddingBottom}`,
      listDisplay: parentCs.display,
      listGap: parentCs.gap === "normal" ? null : parentCs.gap,
      listPaddingLeft: parentCs.paddingLeft,
      listStyle: parentCs.listStyleType,
      gapBetweenRowsPx: gapPx,
      rowStridePx: rowHeight,
      dateElement: dateEl
        ? {
            tag: dateEl.tagName.toLowerCase(),
            text: textOf(dateEl),
            fontFamily: style(dateEl).fontFamily,
            fontSize: style(dateEl).fontSize,
            fontStyle: style(dateEl).fontStyle,
            color: style(dateEl).color,
            textTransform: style(dateEl).textTransform,
            width: Math.round(dateEl.getBoundingClientRect().width),
          }
        : null,
      titleElement: (() => {
        const el = row.querySelector("a[href]") ?? row.querySelector("h2, h3");
        if (!el) return null;
        const cs = style(el);
        const anchor = row.querySelector("a[href]");
        const after = anchor ? (anchor.nextElementSibling ?? anchor.parentElement?.nextElementSibling) : null;
        return {
          text: textOf(el),
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          color: cs.color,
          textDecorationLine: cs.textDecorationLine,
          description: after && !after.querySelector("a[href]") ? { text: textOf(after), fontSize: style(after).fontSize, color: style(after).color, fontFamily: style(after).fontFamily } : null,
        };
      })(),
    };
  }

  for (const el of [...document.querySelectorAll("hr, [role=separator]")].slice(0, 5)) {
    const cs = style(el);
    out.rules.push({ tag: el.tagName.toLowerCase(), borderTop: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`, backgroundColor: cs.backgroundColor, marginTop: cs.marginTop, marginBottom: cs.marginBottom, opacity: cs.opacity });
  }

  for (const a of [...document.querySelectorAll("header a, nav a")].slice(0, 12)) {
    const cs = style(a);
    out.nav.push({
      text: textOf(a),
      href: a.getAttribute("href"),
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      textTransform: cs.textTransform,
      color: cs.color,
      textDecorationLine: cs.textDecorationLine,
      padding: cs.padding,
      borderRadius: cs.borderRadius,
      backgroundColor: cs.backgroundColor === "rgba(0, 0, 0, 0)" ? null : cs.backgroundColor,
    });
  }

  for (const img of [...document.querySelectorAll("img")].slice(0, 8)) {
    const cs = style(img);
    const r = img.getBoundingClientRect();
    out.images.push({ src: img.currentSrc || img.src, alt: img.alt, width: Math.round(r.width), height: Math.round(r.height), borderRadius: cs.borderRadius, objectFit: cs.objectFit });
  }

  const blocks = [...document.querySelectorAll("main p, article p, main li, article li, main h2, article h2, main h1, article h1")].slice(0, 14);
  for (let i = 1; i < blocks.length; i++) {
    const dy = Math.round(blocks[i].getBoundingClientRect().top - blocks[i - 1].getBoundingClientRect().bottom);
    const cs = style(blocks[i]);
    out.rhythm.push({ tag: blocks[i].tagName.toLowerCase(), text: textOf(blocks[i]), gapFromPrevPx: dy, marginTop: cs.marginTop, marginBottom: cs.marginBottom, lineHeight: cs.lineHeight });
  }

  return out;
}

async function rpc(ws) {
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(`${msg.error.message} (${JSON.stringify(msg.error.data ?? "")})`)) : resolve(msg.result);
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
      return new Promise((resolve, reject) => pending.set(message.id, { resolve, reject }));
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

async function ensureBrowser() {
  try {
    const res = await fetch(`${CDP_HTTP}/json/version`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) return "attached";
  } catch {}
  if (!existsSync(CHROME)) throw new Error(`no browser on ${CDP_HTTP} and no chrome at ${CHROME}`);
  spawn(
    CHROME,
    ["--headless=new", `--remote-debugging-port=${new URL(CDP_HTTP).port}`, "--user-data-dir=/tmp/pi-cdp-profile", "--no-first-run", "--no-default-browser-check", "--window-size=1440,900", "about:blank"],
    { detached: true, stdio: "ignore" },
  ).unref();
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await fetch(`${CDP_HTTP}/json/version`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) return "launched";
    } catch {}
  }
  throw new Error("browser did not come up");
}

const mode = await ensureBrowser();
const { webSocketDebuggerUrl } = await (await fetch(`${CDP_HTTP}/json/version`)).json();
const ws = new WebSocket(webSocketDebuggerUrl);
const cdp = await rpc(ws);
const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
await cdp.send("Page.enable", {}, sessionId);
await cdp.send("Runtime.enable", {}, sessionId);
await cdp.send("Network.enable", {}, sessionId);

const report = { capturedAt: new Date().toISOString(), browser: mode, endpoint: CDP_HTTP, targets: [] };

for (const target of TARGETS) {
  const dir = path.join(OUT_ROOT, target.slug);
  await mkdir(dir, { recursive: true });
  const entry = { ...target, viewports: {} };
  for (const vp of VIEWPORTS) {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: vp.deviceScaleFactor, mobile: vp.mobile }, sessionId);
    await cdp.send("Emulation.setEmulatedMedia", { media: "screen", features: [{ name: "prefers-color-scheme", value: "dark" }] }, sessionId);
    const loaded = cdp.once("Page.loadEventFired", sessionId);
    await cdp.send("Page.navigate", { url: target.url }, sessionId);
    try {
      await loaded;
    } catch (err) {
      entry.viewports[vp.name] = { error: err.message };
      continue;
    }
    await new Promise((r) => setTimeout(r, 1500));
    if (target.toggleDark) {
      await cdp.send(
        "Runtime.evaluate",
        { expression: `(() => { const toggle = [...document.querySelectorAll("a, button")].find((el) => /^\\[?dark\\]?$/i.test((el.textContent ?? "").trim())); if (toggle) { toggle.click(); return "clicked"; } return "no toggle"; })()`, returnByValue: true },
        sessionId,
      ).then((r) => console.log(`  ${target.slug}: dark toggle -> ${r.result?.value}`));
      await new Promise((r) => setTimeout(r, 800));
    }
    const dumpResult = await cdp.send("Runtime.evaluate", { expression: `(${dump.toString()})()`, returnByValue: true, awaitPromise: true }, sessionId);
    const data = dumpResult.result?.value ?? null;
    const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
    const shotPath = path.join(dir, `${vp.name}.png`);
    await writeFile(shotPath, Buffer.from(shot.data, "base64"));
    await writeFile(path.join(dir, `${vp.name}.json`), JSON.stringify(data, null, 2));
    entry.viewports[vp.name] = { screenshot: shotPath, tokens: path.join(dir, `${vp.name}.json`), meta: data?.meta ?? null };
    console.log(`${target.slug} ${vp.name}: ${shotPath}`);
  }
  report.targets.push(entry);
}

await writeFile(path.join(OUT_ROOT, "capture-report.json"), JSON.stringify(report, null, 2));
await cdp.send("Target.closeTarget", { targetId });
cdp.close();
console.log(`\nreport: ${path.join(OUT_ROOT, "capture-report.json")}`);
