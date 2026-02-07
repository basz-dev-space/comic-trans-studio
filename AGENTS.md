# AGENTS.md

## Repository Rules
- Always keep project automation docs and integration configs up to date after any feature or tooling change.
- Always auto-update AI agent documentation when architecture, dependencies, or workflows change.
- Keep this repository SPA-safe for browser-only canvas rendering.
- Prefer deterministic, production-safe defaults.

## AI Update Rule
- Any AI agent modifying this repository must also update:
  - `AGENTS.md` when behavioral or governance rules change.
  - `.agents/skills/` metadata when agent skills are added or removed.
  - `mcp.config.json` when MCP endpoints are added or changed.
