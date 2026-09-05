---
title: "Sprint Change Proposal: Align Editor Preview Requirement"
status: approved
created: 2026-06-21
updated: 2026-06-21
project: deppfellow-page
change_scope: minor
decision_source: epics
---

# Sprint Change Proposal: Align Editor Preview Requirement

## 1. Issue Summary

The implementation readiness assessment identified a planning artifact conflict for editor preview behavior.

The current epics define the editor preview as renderer-backed and on demand:

- Preview is requested by clicking a preview button or using a keyboard shortcut.
- Preview calls the FastAPI render endpoint.
- Preview does not auto-run while typing.

The PRD and older context artifacts still described live or debounced preview behavior. Deppfellow confirmed that the epics are the source of truth and that the current decision is preview-on-demand.

## 2. Impact Analysis

### Epic Impact

No epic structure changes are required.

Epic 2 remains correct:

- Story 2.3 defines the split-pane editor shell.
- Story 2.4 defines renderer-backed on-demand preview.
- Stories 2.5 and 2.6 depend on preview being available, but do not require live/debounced rendering.

### Story Impact

No story edits are required. Story 2.4 already contains the correct acceptance criteria:

- Author clicks preview button or uses preview keyboard shortcut.
- Editor sends current Markdown to FastAPI render endpoint.
- Preview does not auto-run while typing.
- Preview uses the same ContentRenderer path as publishing.

### Artifact Conflicts

Updated artifacts:

- `.docs/bmad-output/planning-artifacts/prds/prd-deppfellow-page-2026-05-31/prd.md`
- `.docs/bmad-output/planning-artifacts/briefs/brief-deppfellow-page-2026-05-31/brief.md`
- `.docs/bmad-output/planning-artifacts/research/technical-fastapi-for-current-project-research-2026-06-20.md`

Unaffected source-of-truth artifacts:

- `.docs/bmad-output/planning-artifacts/epics.md`
- `.docs/bmad-output/planning-artifacts/architecture.md`
- `.docs/bmad-output/project-context.md`

Historical artifact left unchanged:

- `.docs/bmad-output/planning-artifacts/implementation-readiness-report-2026-06-21.md`

That report records the pre-correction issue and should be superseded by rerunning implementation readiness after this correction.

### Technical Impact

The preview implementation remains simpler than live/debounced preview:

- No preview request on every typing pause.
- Lower backend render load.
- Clearer error handling because preview is a deliberate action.
- Same renderer parity guarantee remains intact.

## 3. Recommended Approach

Recommended path: Direct Adjustment.

Rationale:

- The epics already contain the approved behavior.
- The architecture already supports FastAPI `/api/render` as the preview path.
- No MVP scope reduction is needed.
- No rollback is needed.
- No new epic or story is needed.

Effort: Low.

Risk: Low.

Timeline impact: None beyond document correction and one follow-up readiness rerun.

## 4. Detailed Change Proposals

### PRD Update

File: `.docs/bmad-output/planning-artifacts/prds/prd-deppfellow-page-2026-05-31/prd.md`

Section: Vision

OLD:

```markdown
The author writes Markdown in a split-pane editor, sees a live preview that matches the published output exactly, and publishes in one click.
```

NEW:

```markdown
The author writes Markdown in a split-pane editor, requests a rendered preview when needed, verifies that preview against the exact published output path, and publishes in one click.
```

Section: UJ-1

OLD:

```markdown
The author opens the editor, writes Markdown with math formulas and code blocks, sees the live preview match the published output exactly, and publishes.
```

NEW:

```markdown
The author opens the editor, writes Markdown with math formulas and code blocks, requests a preview through the preview button or keyboard shortcut, verifies that the rendered preview matches the published output exactly, and publishes.
```

Section: Glossary

OLD:

```markdown
Split-Pane Editor — In-browser Markdown editor with live preview.
```

NEW:

```markdown
Split-Pane Editor — In-browser Markdown editor with an on-demand rendered preview.
```

Section: FR-1

OLD:

```markdown
Preview updates as the author types (debounced at 300ms to avoid excessive API calls).
```

NEW:

```markdown
Preview updates only when the author clicks the preview button or uses the preview keyboard shortcut.
Preview does not auto-run while the author types.
```

Section: Open Questions

OLD:

```markdown
Editor preview API: Should the editor preview call the FastAPI render endpoint, or should it use a client-side Markdown renderer for instant feedback?
```

NEW:

```markdown
Editor preview trigger: Resolved for MVP. Preview calls the FastAPI render endpoint on demand through a preview button or keyboard shortcut.
```

### Product Brief Update

File: `.docs/bmad-output/planning-artifacts/briefs/brief-deppfellow-page-2026-05-31/brief.md`

Changes:

- Replaced "live preview" with "renderer-backed on-demand preview".
- Replaced "instant preview" with "on-demand preview path".
- Updated the v1 scope bullet.
- Updated the document timestamp.

### Technical Research Update

File: `.docs/bmad-output/planning-artifacts/research/technical-fastapi-for-current-project-research-2026-06-20.md`

OLD:

```markdown
The editor preview can use debounced HTTP POST to `/api/render`.
```

NEW:

```markdown
The editor preview uses an on-demand HTTP POST to `/api/render` when the author clicks the preview button or uses the preview keyboard shortcut; it does not auto-run on a debounce while typing.
```

## 5. Checklist Results

### 1. Understand Trigger and Context

- [x] 1.1 Triggering story: Epic 2 Story 2.4, Renderer-Backed On-Demand Preview.
- [x] 1.2 Core problem: artifact drift. PRD and older context retained live/debounced preview language after the epics changed the decision to preview-on-demand.
- [x] 1.3 Evidence: implementation readiness report flagged FR-1 conflict; targeted search found stale preview wording in PRD, brief, and technical research.

### 2. Epic Impact Assessment

- [x] 2.1 Current epic can still be completed as planned.
- [x] 2.2 No epic-level changes needed.
- [x] 2.3 Remaining epics unaffected.
- [x] 2.4 No future epics invalidated; no new epics needed.
- [x] 2.5 No epic order or priority change needed.

### 3. Artifact Conflict and Impact Analysis

- [x] 3.1 PRD required modification to match current FR-1 behavior.
- [x] 3.2 Architecture has no conflicting preview trigger language.
- [N/A] 3.3 No standalone UX spec exists; embedded epic UX requirements already match on-demand preview.
- [x] 3.4 Product brief and technical research contained stale preview wording and were updated.

### 4. Path Forward Evaluation

- [x] 4.1 Direct Adjustment: viable, low effort, low risk.
- [N/A] 4.2 Rollback: not needed.
- [N/A] 4.3 MVP Review: not needed; MVP scope remains intact.
- [x] 4.4 Selected approach: Direct Adjustment.

### 5. Proposal Components

- [x] 5.1 Issue summary documented.
- [x] 5.2 Epic and artifact impact documented.
- [x] 5.3 Recommended path documented.
- [x] 5.4 MVP impact documented: no MVP scope change.
- [x] 5.5 Handoff plan documented.

### 6. Final Review and Handoff

- [x] 6.1 Checklist completion reviewed.
- [x] 6.2 Proposal accuracy verified against updated artifacts.
- [x] 6.3 User approval recorded from explicit instruction: "Epic is the truth... Update drifted docs and align with current decision."
- [N/A] 6.4 Sprint status update: no epic/story add/remove/renumbering required.
- [x] 6.5 Next steps and handoff plan documented.

## 6. Implementation Handoff

Scope classification: Minor.

Routed to: Developer agent for direct continuation.

Developer responsibilities:

- Treat Epic 2 Story 2.4 as the implementation source for preview behavior.
- Implement preview as an explicit action through button or keyboard shortcut.
- Do not implement live preview, debounce-triggered preview, or client-side Markdown preview unless architecture is reopened.
- Preserve renderer parity by using the FastAPI ContentRenderer path.

Success criteria:

- PRD, epics, architecture, brief, and technical research no longer conflict on preview behavior.
- Targeted search finds no source-of-truth requirement for live/debounced preview.
- A rerun of implementation readiness should no longer flag FR-1 as conflicting.

## 7. Next Step

Rerun implementation readiness before sprint planning:

```bash
$bmad-check-implementation-readiness
```
