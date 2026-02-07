# ComicTrans Studio

ComicTrans Studio is a SvelteKit application for comic translation workflows. It combines a visual canvas editor with structured text-grid editing so teams can localize chapters and export deliverables from one workspace.

## UX Redesign Scope (LIG-28)

### Target pages
- `/` — product landing page and entry points.
- `/login` — authentication entry with helper credentials and error feedback.
- `/projects` — project dashboard and project creation flow.
- `/project/[id]` — chapter management (create, rename, delete).
- `/project/chapter/[id]` — chapter studio (page list, Fabric canvas, text grid, export actions).

### UX goals
- Redesign all routes with an editorial-style, panel-first layout inspired by the provided references.
- Keep UI interesting but easy to scan: bold hierarchy, clear sections, low visual noise.
- Reduce click-time by exposing direct actions (open chapter, quick add page+text, toolbar exports).
- Support i18n with fast locale switching (EN/TH) from the global header.
- Use the approved color palette:
  - `--text: #160204`
  - `--background: #fff9fa`
  - `--primary: #e18e90`
  - `--secondary: #f5c088`
  - `--accent: #f2bc56`

### Layout system
- Global header/footer shell is implemented in `+layout.svelte`.
- Shared design tokens and reusable shell/surface classes are defined in `src/app.css`.
- i18n messages and locale store are in `src/lib/i18n.ts`.
- Chapter Studio keeps its three-panel workflow (pages, canvas, data grid) with quicker action access.

### Editor Zone conventions (LIG-10)
- The chapter editor is split into three resizable panels: page list, canvas, and right-side inspector/datagrid.
- Right panel supports `Properties` and `Datagrid` tabs; DataGrid edits update Fabric text object state (`text`, `left`, `top`) through shared store notifications.
- Fabric event → state mapping:
  - `object:moving`, `object:scaling`, `object:modified`, `object:removed`, `text:changed` all serialize canvas objects back into `fabricStore.pages[activePage].objects`.
  - Save payload excludes locked background objects (`data.isBackground = true`) to keep persisted overlays clean.
- Background image behavior:
  - Each page can define `backgroundSrc`; background is rendered as a non-selectable Fabric image pinned to page bounds.
  - Background is always sent behind overlays and cannot be transformed by editor actions.
- Production-safe defaults:
  - Auto-save is debounced before API persistence.
  - Panel resize is constrained with min/max widths for layout stability.
  - Empty datagrid states are explicit to avoid ambiguous blank views.

## Tech stack
- **Frontend:** SvelteKit + Svelte 5 + TypeScript
- **Styling:** Tailwind CSS + shadcn-style UI primitives
- **Canvas editor:** Fabric.js
- **Build tooling:** Vite

## Run locally
```bash
npm install
npm run dev
```

## Checks
```bash
npm run check
npm run lint
npm run build
```

For repository governance and AI-agent coordination, see `AGENTS.md`.
