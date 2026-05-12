# QA & Handoff

## Build
- Command: `npm run build`
- Output: `dist/public/` (static frontend) + `dist/index.cjs` (backend stub, unused by frontend logic).
- The Express backend is left in place from the template but exposes no app routes — the entire UI is frontend-rendered.

## Local dev
- Command: `npm run dev`
- Port: 5000 (Express + Vite on the same port).

## QA performed
- Production build passed with `npm run build`.
- Production server smoke-tested with `NODE_ENV=production node dist/index.cjs` on port 5000.
- Playwright headless run at 1600×900 (desktop) and 390×844 (mobile).
- Functional smoke: hash routing, module search, stage filter, module detail navigation, workflow checklist interactivity, readiness-score recalculation, dependency graph node selection, prompt-backend QA capture, `project.md` generation, prompt package generation, project prompt package save/load/delete, implementation-plan generation, named-plan save/load/delete, theme toggle, notes library selection.
- Visual smoke: desktop dashboard and mobile module list inspected for layout coherence, accessible control placement, and horizontal overflow. No horizontal overflow found at either viewport.

## Conventions
- All interactive elements carry `data-testid="{action}-{target}"`.
- Dynamic list items use `data-testid="card-module-{id}"` and workflow checkboxes use `checkbox-step-{stage-id}-{checklist-id}` so repeated checklist items remain uniquely targetable.
- Theme: `useState` only, with no browser persistence layer.
- Routes: hash routing only; never anchor-link to `#section`.

## Known follow-ups
- Notes view renders markdown as preformatted text plus a heading parser; no full Markdown engine — keeps the bundle small.
- Dependency graph is conceptual and manually positioned for readability; it is not a force-directed graph engine.
- Saved named plans are backend database snapshots, not account-scoped collaborative records.
- Prompt backend generates LLM-ready packages but does not call an LLM at runtime.
- Agent/Editor sub-stages are summarized; deeper sub-flows can be added as separate routes if scope expands.

## Independence audit
- No imports from `@replit/*` or any vendor SDK.
- No vendor logos, color tokens, or copy lifted from source documents.
- Source URLs are surfaced only as outbound reference links on module cards.
