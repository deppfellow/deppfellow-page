---
status: accepted
date: 2026-08-24
superseded-by: 0011-obsidian-web-clipper-capture
---

# (Superseded) On-demand URL capture script

Phase 1 deferred the ingest pipeline (ADR-0007); a per-source Python capture script (`_scripts/capture.py`, trafilatura + yt-dlp) plus an agent skill was built to fetch URLs on demand into `Private/Sources/`. This was superseded by ADR-0011: the user switched to the Obsidian Web Clipper, which covers blogs, Reddit, Twitter, and YouTube with zero custom tooling. The script and skill were removed.
