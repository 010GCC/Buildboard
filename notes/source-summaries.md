# Source Summaries

These are abstract concept references for an **independent AI Build Operations Platform**. The linked documents are used only as conceptual source material. The product is not affiliated with, dependent on, or built to imitate any third-party developer platform.

---

## 1. Agent — orchestration concept
- **Source:** https://docs.replit.com/core-concepts/agent
- **Concept summary:** An "Agent" is a creative orchestrator that turns plain-language intent into a working app. It plans, scaffolds projects, generates code, performs self-checks, repairs failures, supports plan/build modes, captures checkpoints, and hands artifacts to deployment.
- **What we abstract for our platform:** intent capture, plan mode, generation mode, automated verification, checkpoint timeline, hand-off to deploy.

## 2. Workspaces — collaboration container
- **Source:** https://docs.replit.com/core-concepts/workspaces
- **Concept summary:** A Workspace is a top-level container for many projects. It carries teammates, settings, billing/quota, and access controls. It is where org-level decisions live.
- **What we abstract:** team scoping, role/permission model, quota tracking, environment defaults inherited by all child projects.

## 3. Project Editor — home-base IDE concept
- **Source:** https://docs.replit.com/core-concepts/project-editor
- **Concept summary:** The Project Editor is a unified work environment: agent chat on one side, live preview, task board, file tree, plan mode, and collaboration cursors. Imports/templates are first-class.
- **What we abstract:** dual-pane chat + preview, task board, import flow, plan/build toggle.

## 4. Design Canvas — visual board concept
- **Source:** https://docs.replit.com/replitai/canvas
- **Concept summary:** A spatial board where mockups, live previews, and annotations co-exist. Users can compare variants and selectively apply changes back into the working project.
- **What we abstract:** spatial mockup board, variant comparison, annotation pinning, "apply to project" action.

## 5. Projects — code/data/artifacts unit
- **Source:** https://docs.replit.com/replitai/projects
- **Concept summary:** A Project is the unit that ships. It bundles code, data, and artifacts that share a backend and database. A Project is the smallest publishable/deployable unit.
- **What we abstract:** project = deploy unit; artifacts share data layer; publishing is project-scoped.

## 6. Storage — structured vs object storage
- **Source:** https://docs.replit.com/category/storage-and-databases
- **Concept summary:** Distinguishes structured data (SQL/relational, queryable) from object storage (files: images, video, documents). Storage can be provisioned by the agent on demand.
- **What we abstract:** two-tier storage model — SQL for structured records, object store for binary assets; provisioning is automated.

## 7. Integrations — managed external services
- **Source:** https://docs.replit.com/replitai/integrations
- **Concept summary:** Integrations are managed external capabilities: payments (e.g. Stripe), generic REST APIs, MCP-style tool servers scoped per-user, background workers, and many third-party SaaS connectors.
- **What we abstract:** catalog of integration categories — payments, APIs, MCP tool servers, background services — wired in by config, never hard-coded.

---

## Independence note
None of the source materials above are used as a runtime dependency, SDK import, or brand model. The platform builds its own vocabulary, UI, and visual identity. No vendor lock-in is implied or required.
