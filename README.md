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
