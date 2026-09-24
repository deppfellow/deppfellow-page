---
description: Wiki LLM connections
created: 2026-08-30
tags: [wiki, build]
---

# Wikilink Resolution

## Status
active

## Objective
Render Obsidian wikilinks into working URLs without ever leaking a private title.

## Notes
Update log lives in [[Logs]].

## Resolution samples
Published target by title: [[Memory Layers for Long-Horizon Agents]].
Published target by slug with a label: [[memory-layers-for-long-horizon-agents|how memory layers hold up]].
Unlisted target degrades to plain text: [[Private Draft Notes|draft notes kept out of the registry]].

Embedded plate from _assets: ![[plate.png]]
Missing plate renders alt text only: ![[missing.png]]

## Capture checklist

- [x] resolve published wikilinks to canonical routes
- [ ] keep private targets inert

## Marginalia

Inline tags chip-link to tag pages, e.g. #WikiGraph, and footnotes hold asides.[^1]

[^1]: The footnote body renders at the section end.
