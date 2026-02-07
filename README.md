# ComicTrans Studio

Production-ready comic translation editor built with SvelteKit + TypeScript + Tailwind + Fabric.js.

## Features

## Run
# ComicTrans Studio

ComicTrans Studio is a fullstack web application for translating and editing comics. It provides a canvas-first editor (Fabric.js) and content workflows powered by SvelteKit, TypeScript, Vite, and Tailwind CSS.

**Overview:**
- Frontend: SvelteKit + Svelte 5, Vite, Tailwind CSS.
- Canvas: Fabric.js for drawing and layout.
- Backend: SvelteKit server routes and APIs bundled with the app.
- Extensibility: AI agent "skills" live under `.agents/skills/` and provide modular automation for tasks like code generation, design, or content processing.

**Agents & Integrations:**
- This project is integrated with multiple agent/assistant tools and may use several providers concurrently. Examples in use or setup notes:
	- https://chatgpt.com/codex (Leader / main)
	- https://cto.new/account/workspace/tasks
	- https://app.kilo.ai/cloud
	- VS Code Copilot
	- Additional agents may be added in the future; skills are stored in `.agents/skills/`.

**Quick start (dev):**
```bash
npm install
npm run dev
```

**Build & preview:**
```bash
npm run build
npm run preview
```

For contributor notes and agent governance, see `AGENTS.md`.
