# Action Log — ORM env key resolution + DB connection attempt

- **Change:**
  - Updated `src/lib/server/db/prisma.ts` to resolve database URL from multiple env keys (`DATABASE_URL`, `PRISMA_DATABASE_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, `PGDATABASE_URL`) and pass the resolved URL directly into Prisma datasource config.
  - Updated `src/lib/server/repository/index.ts` to log which env key is used when Prisma connects.
  - Updated `/api/health/db` response with `envKey` and `configuredEnvKey` fields for easier operational debugging.

- **Why:**
  - User requested DB connection using secret from environment settings, but runtime showed `DATABASE_URL` missing.
  - To avoid silent misconfiguration, we now detect common alternate env key names and return actionable diagnostics.

- **How to validate:**
  1. `npm run check`
  2. `npm run lint`
  3. `node --input-type=module -e "import { checkPrismaConnection, getDatabaseUrlInfo } from './src/lib/server/db/prisma.ts'; console.log('urlInfo=', getDatabaseUrlInfo()); const r=await checkPrismaConnection(); console.log('probe=', r);"`
  4. `npm run dev -- --host 0.0.0.0 --port 4173` then `curl -i http://127.0.0.1:4173/api/health/db`

- **Skill(s) used:**
  - `skill-creator`: used to produce a minimal, production-safe, debuggable increment focused on runtime observability.

- **History & logs location:**
  - `.history/logs/20260208-095012-codex-orm-env-key-resolution-and-db-attempt.md`

- **Follow-ups / TODOs:**
  - Ensure the environment secret is exposed to this runtime process (current probe reports all supported DB env keys absent).
  - Once env is visible, re-run `/api/health/db` expecting `ok=true` and `mode=connected`.
