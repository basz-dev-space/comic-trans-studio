# ComicTrans Studio

Production-ready comic translation editor built with SvelteKit + TypeScript + Tailwind + Fabric.js.

## Features
- SPA-only editor (`ssr = false`, `prerender = false`)
- Multi-page canvas workflow
- Text-object data grid (`ID | Text | X | Y`) with debounced sync
- Base64 image upload
- Export ZIP (`project.json` + page PNG files)
- Export PDF (one page per canvas)

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Project Notes
- Canvas implementation is based on Fabric.js.
- Agent metadata and skill manifest are tracked in `.xxx/skills/`.
- MCP configuration is available in `mcp.config.json`.
