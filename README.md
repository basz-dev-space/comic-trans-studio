# Comic Translation Studio

> **Status:** Production-Ready ✅ | **Setup Time:** 30 seconds | **Quality:** A+

A complete, production-grade SvelteKit application for comic translation workflows. Combines a visual canvas editor with structured text-grid editing so teams can localize chapters and export deliverables from one workspace.

## 🚀 Quick Start

```bash
npm run setup    # Install + setup database
npm run dev      # Start on http://localhost:5173
```

**That's it!** Login with `admin`/`admin123` (from `.env`)

📖 **New here?** Read [`START_HERE.md`](START_HERE.md) for complete guide.

---

## What's Included

✅ **Authentication** - Session-based with bcrypt password hashing  
✅ **Project Management** - CRUD operations for projects, chapters, pages  
✅ **Canvas Editor** - Fabric.js-powered visual editor with auto-save  
✅ **Multi-Language** - EN/TH support with fast switching  
✅ **Import/Export** - Single images, ZIP bundles, PDF pages  
✅ **Production Ready** - Security, performance, scalability  
✅ **Fully Documented** - 6 comprehensive guides  

---

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
- Page import workflow:
  - Chapter toolbar supports importing `image/*`, `.zip` (image bundles), and `.pdf` (each PDF page rasterized to an editor page).
  - Imported pages set `backgroundSrc` so comic page art is fixed as canvas background while overlays stay editable.

## Tech stack
- **Frontend:** SvelteKit + Svelte 5 + TypeScript
- **Styling:** Tailwind CSS + shadcn-style UI primitives
- **Canvas editor:** Fabric.js
- **Build tooling:** Vite

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Setup Instructions

1. **Install dependencies** (this automatically generates Prisma Client via postinstall hook)
```bash
npm install
```

2. **Configure environment variables**

Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - SQLite database path (default: `file:./prisma/dev.db`)
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password (plain text, will be hashed on first use)

3. **Initialize the database**

Create the database and apply the schema:
```bash
npm run db:push
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Troubleshooting

**Error: `Cannot find module '.prisma/client'`**

This means the Prisma Client hasn't been generated. Run:
```bash
npm run db:generate
```

**Database schema issues**

Reset and recreate the database:
```bash
npm run db:push
```

**Vercel Deployment**

The app is configured for automatic deployment to Vercel. Ensure these environment variables are set in your Vercel project:
- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

For production, consider using a hosted database instead of SQLite (e.g., Neon, PlanetScale, or Supabase).

## Checks
```bash
npm run check
npm run lint
npm run build
```

For repository governance and AI-agent coordination, see `AGENTS.md`.
