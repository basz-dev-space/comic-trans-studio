# Plan

## 0. Context & Legacy Analysis

**Objective:** Transform the legacy codebase (`basz-dev-space/comic-trans-studio`) into a production-ready "Best Design Award" quality application.
**Core Philosophy:**

* **Source of Truth:** The Data Grid (State) is the master. The Canvas is a reactive renderer.
* **Type Safety:** Strict Zod schemas for all data moving between OCR, AI, State, and UI.
* **UX:** "Linear-style" professional aesthetics. Dark mode default. High performance.

### 0.1. Legacy Code Audit (Agent Actions)

* **Analyze** `src/lib/stores` or state management. **Goal:** Identify if state is split. **Action:** Centralize into a single reactive store (e.g., `editorStore.svelte.ts` or Svelte 5 runes) powered by Zod.
* **Analyze** `src/routes/editor`. **Goal:** Check for hardcoded Fabric.js logic. **Action:** Abstract Fabric logic into a `CanvasManager` class.
* **Analyze** UI Components. **Goal:** Identify raw HTML/CSS. **Action:** Replace with `shadcn/ui` components for consistency.

---

## 1. Phase I: Core Architecture & Type Safety

*Build the spine of the application before the visual limbs.*

### 1.1. Data Modeling (Zod)

Create `src/lib/schemas/editor.ts`.

* Define `TextBoxSchema`:
* `id`: UUID
* `text`: string (translated text)
* `originalText`: string (OCR result)
* `geometry`: `{ x, y, w, h, rotation }`
* `style`: `{ fontSize, fontFamily, color, bgColor, bubbleShape }`


* Define `PageSchema`: Array of TextBoxes, Image URL, Inpainted Image URL.
* Define `ProjectSchema`: Metadata + Array of Pages.

### 1.2. State Management (The "Brain")

Create `src/lib/state/editorState.ts` (using Svelte Stores or Runes).

* **Requirement:** State must be serializable.
* **Action:** Implement `syncCanvasToGrid(canvasObject)` and `syncGridToCanvas(rowId)`.
* **Constraint:** When a user edits a cell in the DataGrid, the store updates -> triggers a Canvas re-render (or specific object update). When a user drags a box on Canvas, Fabric event -> updates the store.

---

## 2. Phase II: Advanced Canvas Editor (Fabric.js)

*The visual core. Must be buttery smooth and feature-rich.*

### 2.1. Canvas Manager Class

Refactor inline canvas code into `src/lib/canvas/CanvasManager.ts`.

* **Initialization:** `init(canvasElement, pageData)`
* **Layering:** Ensure Image Layer (Background) is always behind Text Layer.
* **Reactivity:**
* Listen to `object:modified`, `object:moving`, `object:scaling`.
* **Debounce** updates to the global store to prevent performance thrashing.



### 2.2. Smart Text Rendering

* **Auto-Resizing:** Implement logic where text box height grows/shrinks with content (unless fixed).
* **Bubble Rendering:**
* Extend Fabric.js classes or use `Group` (Text + Rect/Ellipse/Path).
* Implement "comic bubble" shapes (rounded rectangles, ellipses) based on `style` prop.


* **Visual Feedback:** Custom controls (handles) for resizing that match the UI theme (e.g., minimal white dots with blue borders).

### 2.3. Viewport Controls

* Implement "Pan & Zoom" (Spacebar + Drag, or Scroll Wheel).
* Add a "Mini-map" navigator if project complexity is high (optional for V1).

---

## 3. Phase III: OCR & AI Integration

*The automation layer.*

### 3.1. OCR Pipeline (External API)

* **Service:** Create `src/lib/services/ocr.ts`.
* **Input:** Image Blob/URL.
* **Output:** JSON list of text blocks with coordinates.
* **Normalization:**
* **Critical:** Convert OCR coordinates (often relative or pixel-based) to Fabric.js canvas coordinates.
* **Auto-Box Creation:** Loop through OCR results -> `zod.parse` -> Push to `editorState`.
* **Result:** Canvas instantly populates with bounding boxes around text.



### 3.2. AI Inpainting (Background Replacement)

* **Service:** Create `src/lib/services/inpaint.ts`.
* **Workflow:**
1. User selects "Clean Page" or Auto-trigger.
2. System generates a mask based on current `TextBox` geometries (or OCR bboxes).
3. Send `Image + Mask` to Inpainting API (Stable Diffusion / Dall-E / Custom).
4. **Hot-Swap:** Receive result URL -> Update `page.inpaintedImageUrl` in State -> Canvas background updates seamlessly.
5. **Toggle:** Add a UI toggle "Show Original" vs "Show Cleaned" in the editor toolbar.



### 3.3. Translation Service

* **Mock Interface:** `src/lib/services/translate.ts` (Provider agnostic).
* **Action:** Button "Translate Page".
* **Logic:** Iterate `editorState.pages[current].textBoxes`, send `originalText` array to LLM.
* **Update:** batch update `text` field in store. Canvas auto-refreshes with translated text.

---

## 4. Phase IV: The DataGrid (The Control Center)

* **Component:** Use `tanstack/svelte-table` or a lightweight wrapper around `ag-grid`.
* **Columns:** ID (Hidden), Original (Read-only), Translated (Editable), Font Size, Line Height.
* **Sync:**
* **Highlight Sync:** Clicking a row highlights the Canvas object (and pans to it).
* **Selection Sync:** Clicking a Canvas object focuses the DataGrid row.



---

## 5. Phase V: UI/UX & Design System ("Best Design Award")

*Target Aesthetic: Vercel / Linear / Raycast. Dark, clean, utility-focused.*

### 5.1. Global Theme (Tailwind + Shadcn)

* **Colors:** Slate/Zinc palette. Accents in Indigo or Violet.
* **Typography:** Inter or Geist Mono.
* **Layout:**
* **Sidebar (Left):** Navigation & Page Thumbnails.
* **Center:** Infinite Canvas (The Editor).
* **Bottom/Right Drawer:** The DataGrid (Collapsible).
* **Floating Toolbar:** Essential tools (Select, Hand, Text, Shape) floating over the canvas.



### 5.2. Micro-interactions

* **Loading States:** Skeleton loaders for images and OCR processing.
* **Toast Notifications:** "OCR Complete", "Translation Saved" (using `sonner`).
* **Transitions:** Svelte transitions (`fly`, `fade`) for panels opening/closing.

---

## 6. Implementation Checklist (for AI Agent)

1. **[Setup]** Install dependencies: `fabric`, `zod`, `shadcn-svelte`, `lucide-svelte`.
2. **[Refactor]** Create `schemas/editor.ts` and migrate existing types.
3. **[Core]** Build `CanvasManager.ts`. Ensure it renders a simple rect from a Zod object.
4. **[Feature]** connect `CanvasManager` to a Svelte Store. Verify two-way binding.
5. **[Integration]** Implement `OCR Service`. Test with a dummy image. Ensure boxes appear in correct coordinates.
6. **[Integration]** Implement `Inpainting Service`. Ensure background swapping works.
7. **[UI]** specific task: Redesign the Toolbar. Make it floating with a glassmorphism effect (`backdrop-blur-md bg-black/50`).
8. **[Refinement]** Optimize Fabric.js for 50+ objects (renderOnAdd = false).

**Final Output Requirement:** The app must export the final visual as a high-res Image or PDF, compositing the Inpainted Background + Translated Text Layers.
