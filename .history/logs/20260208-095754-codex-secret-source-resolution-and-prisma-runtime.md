# Action Log — Secret source resolution and Prisma runtime hardening

- **Change:**
  - Extended DB URL resolution in `src/lib/server/db/prisma.ts` to support:
    - direct env keys (`DATABASE_URL`, `PRISMA_DATABASE_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, `PGDATABASE_URL`),
    - file-based secret keys (`*_FILE` variants),
    - dotenv fallback files (`.env.local`, `.env`, `.env.production.local`, `.env.production`).
  - Hardened connection probe to gracefully return `connect_error` when Prisma client initialization fails (instead of throwing).

- **Why:**
  - User indicated secret exists in Codex environment; runtime still showed missing env.
  - Production systems often provide secrets via mounted files or dotenv artifacts; the app should discover these automatically.

- **How to validate:**
  1. `npm run check`
  2. `npm run lint`
  3. `node --input-type=module -e "import { getDatabaseUrlInfo, checkPrismaConnection } from './src/lib/server/db/prisma.ts'; console.log('default', getDatabaseUrlInfo()); console.log(await checkPrismaConnection());"`
  4. `DATABASE_URL='postgresql://invalid:invalid@localhost:5432/app' node --input-type=module -e "import { getDatabaseUrlInfo, checkPrismaConnection } from './src/lib/server/db/prisma.ts'; console.log('with-env', getDatabaseUrlInfo()?.key); console.log(await checkPrismaConnection());"`

- **Skill(s) used:**
  - `skill-creator`: used to apply a structured, production-safe enhancement for secret-source compatibility and runtime diagnostics.

- **History & logs location:**
  - `.history/logs/20260208-095754-codex-secret-source-resolution-and-prisma-runtime.md`

- **Follow-ups / TODOs:**
  - Ensure Prisma client generation can run in CI/runtime network policy (`prisma generate` currently blocked by engine download restrictions here).
  - After client generation and secret exposure, verify `/api/health/db` returns `ok=true` / `mode=connected`.
