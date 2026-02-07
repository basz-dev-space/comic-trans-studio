# comic-trans-studio Project Documentation

## Overview
comic-trans-studio is a single-application solution that streamlines comic translation workflows by combining OCR, AI translation, and a rich canvas editor. It automates repetitive tasks (mask creation, text cleanup) while giving translators a familiar visual editing surface similar to Photoshop or Canva.

## Goals
- Enable fast, accurate translation of comics and graphic novels.
- Automate pre- and post-processing (OCR, mask generation, old-text removal).
- Provide a collaborative, saveable project/draft workflow.

## Target Users
- Translators (primary)
- Readers who want AI-assisted translations
- Editors/project managers who review and export translated assets

## Core Features (detailed)
- Canvas Editor: edit text, textboxes, shapes, and layers; position and style translated text; supports font selection and basic typographic controls.
- OCR Pipeline: extract text from pages, output bounding boxes and confidence scores.
- Mask Generation: create masks for extracted text to isolate regions for cleaning or inpainting.
- Image Cleaning: remove old text using OpenCV pre-processing and LaMa (or an equivalent image inpainting model) for clean backgrounds.
- AI Translation: integrated model or API (configurable provider) to translate extracted text with context-aware suggestions.
- Autosave & Drafts: per-project autosave, manual save, and versioned drafts.
- Import/Export: upload ZIP/PDF (chapter-level import), export translated pages as images or packaged archives.
- Batch Operations: run OCR/translation/cleanup across many pages with progress and error reporting.

## Typical User Workflow
1. Create Project: create a project and configure language pairs and translation provider.
2. Upload: upload ZIP/PDF (each upload maps to a chapter and pages are extracted as images).
3. OCR: run OCR to detect text, produce bounding boxes, and generate initial text content.
4. Auto-clean (optional): run automated cleaning to remove current text from images using OpenCV + LaMa pipeline.
5. Translate: use AI Translation to produce a translated text draft for each detected textbox.
6. Canvas Edit: fine-tune translations on the canvas editor (adjust placement, fonts, styles, and shapes).
7. Save/Draft: save progress, create named drafts, or revert to previous draft.
8. Export: export images or packages for publishing.

## Suggested Architecture

- Frontend: SvelteKit (existing codebase) for a responsive canvas editor and project UI.
- Backend: Node.js/TypeScript server for file handling, OCR orchestration, and job queueing.
- Storage: S3-compatible object storage for raw uploads and processed images; Postgres or SQLite for metadata.
- OCR: Tesseract or cloud OCR as fallback; store bounding boxes and confidences.
- Image Processing: OpenCV for pre- and post-processing; LaMa (or equivalent) for inpainting/cleanup.
- Translation: Configurable provider (OpenAI, local LLM, or other translation APIs) with configurable prompts and post-edit hooks.
- Job Queue: Redis + Bull or equivalent to schedule long-running tasks (OCR, cleaning, large-batch translation).

## Data Model (high-level)
- Project
	- id, name, sourceLang, targetLang, settings, createdAt
- Chapter
	- id, projectId, title, uploadId
- Page
	- id, chapterId, pageNumber, imagePath, processedPath
- TextBox
	- id, pageId, bbox, sourceText, translatedText, confidence, status

## Automation & Reliability
- Long-running tasks (OCR, cleaning) run as queued jobs with retry policies and progress tracking.
- Autosave frequency and draft versioning to prevent data loss.

## Developer & Agent Guidelines
- Follow `AGENTS.md` for planning, skill usage, and logging.
- When implementing a feature, include a short plan, list the skills used, and provide validation steps in the PR.

## Security & Privacy
- Protect uploads and translation data at rest and in transit (TLS + encryption for sensitive data).
- Consider data retention policies and an option to purge uploads after export.

## Testing & CI
- Unit tests for processing logic, integration tests for OCR/translation pipeline (can be mocked), and end-to-end tests for upload->translate->export flows.
- CI pipeline should run linting, tests, and a lightweight build before PR approval.

## Roadmap (near-term)
1. Core canvas editor with text/shape layers and autosave.
2. Basic OCR pipeline with bounding-box export.
3. AI translation integration with manual edit support.
4. Image cleaning (OpenCV + LaMa) with a toggle for automated or manual modes.
5. Batch operations and job queueing.

## Open Questions (please answer to refine docs)
- Preferred AI translation provider (OpenAI, Anthropic, local LLM)?
- Which languages should be prioritized first?
- Hosting preference: self-hosted, managed cloud, hybrid?
- Do you want per-user accounts and permissions, or a simpler project-only model?

## Next Steps for Development
1. Finalize tech choices for OCR and translation.
2. Build a minimal MVP: upload -> OCR -> translate -> canvas edit -> export.
3. Add autosave, job queue, and inpainting cleanup in subsequent iterations.

---
If you confirm the open questions, I'll generate a prioritized MVP plan and break it into implementation tasks.
