# Production Implementation Plan

## Goal
Ship a production-grade comic translation platform with reliable persistence, scalable APIs, and a canvas editor that consistently shows full comic pages across device sizes.

## Skills Used
- **skill-creator**: used as a workflow framework to keep this plan concise, phased, and implementation-ready.

## 1) Backend Foundation & ORM Initialization

### 1.1 Technology and Runtime
- Standardize on SvelteKit server routes + PostgreSQL.
- Use **Prisma ORM** for schema management, migrations, and typed queries.
- Add environment validation (`DATABASE_URL`, `JWT_SECRET`, provider API keys) at boot.

### 1.2 ORM Setup Steps
1. Install: `prisma`, `@prisma/client`.
2. Initialize: `npx prisma init`.
3. Configure pooled DB connection string for production.
4. Create baseline migration and shadow DB config for CI.
5. Add seeding script for development fixtures.

### 1.3 Required Non-Functional Guarantees
- Idempotent writes for chapter save endpoint.
- Query timeout and retry strategy for transient DB issues.
- Structured logging with request IDs.

## 2) Schema Design (Domain-Driven)

### 2.1 Core Entities
- `User`: identity, auth provider, role, timestamps.
- `Project`: owner, title, language pair, status.
- `Chapter`: belongs to project, ordering index.
- `Page`: belongs to chapter, width/height, original/cleaned image URLs.
- `TextBox`: belongs to page, geometry/style JSON, original and translated text.
- `Asset`: uploaded files, checksums, MIME, storage path.
- `Job`: async OCR/translate/inpaint pipeline state machine.

### 2.2 Data Integrity Rules
- Unique `(chapterId, pageIndex)` and `(pageId, textBoxId)` constraints.
- Foreign keys with cascade delete from `Project -> Chapter -> Page -> TextBox`.
- Optimistic concurrency on `Chapter` (`version` column) to prevent overwrite races.

### 2.3 Performance Indexes
- `Project(ownerId, updatedAt desc)` for dashboard.
- `Chapter(projectId, orderIndex)` for navigation.
- `Page(chapterId, orderIndex)` and `TextBox(pageId)` for editor loads.

## 3) API Design and Frontend Integration

### 3.1 API Contracts
- `GET /api/projects/:id` – project summary.
- `GET /api/chapters/:id` – chapter payload (pages + text boxes).
- `POST /api/chapters/:id/save` – transactional page/textbox upsert.
- `POST /api/chapters/:id/translate` – async translation job.
- `POST /api/chapters/:id/inpaint` – async cleanup job.

### 3.2 Integration Strategy in Frontend
- Introduce typed API client (`src/lib/server/apiClient.ts`).
- Replace ad-hoc `fetch` payloads with validated request builders.
- Implement optimistic update + rollback for save failures.
- Surface per-job progress in notification system.

### 3.3 Observability and Safety
- Log every save request with project/chapter/page counts.
- Add payload size checks and server-side zod validation.
- Add rate limits for expensive OCR/inpaint endpoints.

## 4) Canvas Editor Quality Goals

### 4.1 Immediate Fix (delivered in this change)
- Ensure the canvas viewport always scales to fully show comic page bounds.
- Reserve layout space for scaled canvas to prevent clipping and accidental crop.
- Recompute fit scale on wrapper resize and window resize.

### 4.2 Next Iteration
- Add “Fit page / Fit width / 100%” zoom presets.
- Add safe-area guides and bleed margins.
- Persist last zoom mode per user.

## 5) Validation Checklist
- `npm run check`
- `npm run lint`
- Manual test: import multiple portrait + landscape pages and verify full-page visibility at each zoom level.
- Manual test: auto-save still triggers after text movement/editing.

## 6) Delivery Criteria
- Zero TypeScript errors.
- No visual clipping of page bounds in editor viewport.
- Save endpoint remains functional after canvas changes.
- Plan is actionable for backend + ORM execution in next implementation PR.


## 7) Implementation Status
- ✅ Prisma schema and repository abstraction were implemented (`prisma/schema.prisma`, `src/lib/server/repository/*`).
- ✅ Project/chapter/auth/save server flows now use repository layer to enable DB-backed persistence.
- ✅ Added DB connectivity probe (`src/routes/api/health/db/+server.ts`) to explicitly test Prisma reachability and report resolved DB secret source (env keys, `*_FILE` keys, and dotenv fallback files).
- ✅ Canvas auto-fit reliability improved with page-switch fit reset and `Ctrl/Cmd+0` fit shortcut.
- ⏳ Pending: production DB migration execution in target environment and full auth hardening.

- ⚠️ Prisma client generation may still be required before first successful connection in restricted environments.
