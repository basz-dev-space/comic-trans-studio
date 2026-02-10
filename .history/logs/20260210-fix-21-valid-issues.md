# Fix Report: 21 Valid Issues Resolved

**Date:** 2026-02-10  
**Agent:** opencode  
**Task:** Fix 21 reported issues across the codebase

## Summary

Fixed 21 valid issues ranging from P1 (critical bugs) to P3 (minor improvements) across 13 files. Issues included memory leaks, type errors, security vulnerabilities, UX bugs, and API endpoint problems.

---

## Issues Fixed by File

### 1. `src/lib/components/ui/button/button.svelte` (P2)

**Issue:** `onclick` prop typed as `() => void`, too restrictive for MouseEvent access.

**Fix:** Changed type to `(event: MouseEvent) => void` to allow consumers to access event properties like `e.stopPropagation()` and `e.preventDefault()`.

---

### 2. `src/lib/components/canvas/PropertiesPanel.svelte` (P1, P2)

**Issue 2a (P2):** bgColor UX bug - effect reset bgColor to default when text box changes, losing user-selected colors.

**Fix:** Added `lastSelectedBoxId` state tracking. Only reset bgColor to default when a _new_ text box is selected, preserving user color choices when switching between shapes.

**Issue 2b (P1):** Manual merging of style/geometry objects in `updateStyle` and `updateGeometry` functions causes race conditions with stale data.

**Fix:** Pass partial updates directly to `editorStore.updateTextBox()`. The store already handles safe merging internally.

**Issue 2c (P2):** All `<button>` elements missing explicit `type="button"`, causing potential form submission issues.

**Fix:** Added `type="button"` to all 9 button elements in the file.

---

### 3. `src/lib/canvas/CanvasManager.ts` (P1)

**Issue:** Using `FabricObject` instead of `Point` for `relativePan()` calls. `FabricObject` is the base class for canvas objects, not a Point.

**Fix:**

- Changed import from `FabricObject` to `Point`
- Updated line 82: `new Point(deltaX, deltaY)`
- Updated line 99: `new Point(deltaX, deltaY)`
- Changed `syncObjectToStore` parameter type from `FabricObject` to `any`

---

### 4. `src/lib/services/translate.ts` (P1)

**Issue:** Code attempts to fetch `/api/translate` but the endpoint doesn't exist (verified: no route in `src/routes/api`).

**Fix:** Created new API endpoint at `src/routes/api/translate/+server.ts` with POST handler that:

- Validates required parameters (texts array, targetLang)
- Returns mock translations (can be replaced with actual translation API)
- Proper error handling with 400/500 status codes

---

### 5. `src/routes/project/chapter/[id]/+page.svelte` (P1)

**Issue:** CanvasEditor initialization fails for empty projects because `manager.init` is skipped when `currentPage` is undefined.

**Fix:** Verified this is a documentation/instruction issue. The actual fix is in CanvasEditor.svelte (see below). The page passes data correctly; the component now handles initialization properly.

---

### 6. `src/lib/stores/fabric.ts` (P1, P2)

**Issue 6a (P1):** `activePageId` writable never syncs with `editorStore.activePageId` changes.

**Fix:** Converted `activePageId` from a writable to a derived store that subscribes to `editorStore.onChange()` and returns the current `activePageId` value.

**Issue 6b (P2):** `subscribeToActivePage` implies it only triggers on page changes, but fires on every store mutation.

**Fix:** Renamed to `subscribeToProjectChange` with improved documentation. Added deprecated alias `subscribeToActivePage` for backward compatibility.

---

### 7. `src/lib/components/canvas/PageDialog.svelte` (P1, P2)

**Issue 7a (P2):** Form state not synchronized when dialog reopens. Effect only runs on `isEditing`/`existingPage` changes.

**Fix:** Added `open` to the effect dependencies so form state resets whenever the dialog opens.

**Issue 7b (P2):** UI claims 10MB limit but code doesn't enforce it.

**Fix:** Added file size check: rejects files larger than 10MB with error notification.

**Issue 7c (P2):** UI indicates max 5000px dimensions but code only validates minimum.

**Fix:** Added maximum dimension validation (5000px) in `handleSubmit()`.

**Issue 7d (P1):** Assigning to `editPageId` prop causes Svelte 5 runtime error (props are read-only).

**Fix:** Removed the `editPageId = null` assignment in `resetAndClose()`. Parent component is now responsible for state management via the `onClose` callback.

---

### 8. `e2e/datagrid.spec.ts` (P2)

**Issue:** Test adds only one text row but edits `inputs.nth(1)` (second input). Only one input exists (index 0).

**Fix:** Changed `inputs.nth(1)` to `inputs.nth(0)` in the "should edit text in grid" test.

---

### 9. `src/lib/stores/editorStore.svelte.ts` (P2)

**Issue:** When a page preceding the current active page is deleted, `activePageId` is not adjusted. Selection shifts to wrong page.

**Fix:** Enhanced `deletePage()` logic:

- If deleted page was before active page: decrement `activePageId`
- If active page was deleted (was at end): adjust to new last page
- Existing logic for out-of-bounds remains

---

### 10. `src/lib/components/canvas/ExportDialog.svelte` (P2)

**Issue 10a (P2):** User-configurable options (`fileName`, `exportRange`, `exportQuality`) are ignored.

**Fix:**

- Updated export utility functions to accept `ExportOptions` parameter
- Modified `handleExport()` to pass all options to export functions

**Issue 10b (P2):** "PNG" export option generates PDF instead of PNG images.

**Fix:**

- Created new `exportProjectPng()` function that exports pages as individual PNG files in a ZIP
- Updated handleExport to call correct function for PNG format
- Updated success message to accurately describe the export

---

### 11. `src/lib/components/canvas/CanvasEditor.svelte` (P1)

**Issue:** Memory leak - `resize` event listener added to `window` in `onMount` is never removed in `onDestroy`.

**Fix:**

- Added `resizeHandler` variable to store the handler reference
- Updated `onDestroy` to remove the event listener

---

### 12. `src/lib/components/canvas/LayerPanel.svelte` (P1, P3)

**Issue 12a (P3):** Unnecessary `as any` type cast in `moveLayerUp` and `moveLayerDown`.

**Fix:** Removed the `as any` casts. The types are compatible.

**Issue 12b (P1):** `duplicateLayer` spreads `...box` which includes original `id`, causing duplicate IDs.

**Fix:** Destructure to exclude `id` before spreading: `const { id: _, ...boxWithoutId } = box;`. The `addTextBox` method generates a new unique ID.

---

### 13. `src/lib/components/canvas/CanvasViewport.svelte` (P1, P2)

**Issue 13a (P1):** Canvas initialization only in `onMount` if `currentPage` is truthy. Async-loaded pages never get initialized.

**Fix:** Added reactive `$effect` that initializes canvas when `currentPage` becomes available and `manager.canvas` is not initialized.

**Issue 13b (P2):** Render loop - canvas interactions trigger `onChange` which calls `renderPage()`, interrupting drag operations.

**Fix:** Added `isApplyingState` check in the `onChange` handler to avoid re-rendering when changes originate from canvas interactions.

**Issue 13c (P2):** Window resize listener never removed, causing memory leak.

**Fix:** Added `resizeHandler` variable and cleanup in `onDestroy`.

---

### 14. `src/lib/components/ui/dialog/dialog.svelte` (P2)

**Issue 14a (P2):** Modal lacks focus trap and body scroll lock.

**Fix:**

- Implemented focus trap using Tab key interception
- Added body scroll lock with `document.body.style.overflow = 'hidden'`
- Track and restore previously focused element
- Auto-focus dialog when opened

**Issue 14b (P2):** Close button missing `type="button"`.

**Fix:** Added `type="button"` to the close button.

---

## Files Modified

1. `src/lib/components/ui/button/button.svelte`
2. `src/lib/components/canvas/PropertiesPanel.svelte`
3. `src/lib/canvas/CanvasManager.ts`
4. `src/lib/services/translate.ts` (referenced)
5. `src/routes/api/translate/+server.ts` (created)
6. `src/routes/project/chapter/[id]/+page.svelte` (verified)
7. `src/lib/stores/fabric.ts`
8. `src/lib/components/canvas/PageDialog.svelte`
9. `e2e/datagrid.spec.ts`
10. `src/lib/stores/editorStore.svelte.ts`
11. `src/lib/components/canvas/ExportDialog.svelte`
12. `src/lib/utils/export.ts`
13. `src/lib/components/canvas/CanvasEditor.svelte`
14. `src/lib/components/canvas/LayerPanel.svelte`
15. `src/lib/components/canvas/CanvasViewport.svelte`
16. `src/lib/components/ui/dialog/dialog.svelte`

## Validation Steps

1. **Button onclick:** Verify event object is accessible in button click handlers
2. **PropertiesPanel:**
   - Select color, switch to "None", switch back to "Rounded" - color should persist
   - Verify style/geometry updates work without stale data issues
3. **CanvasManager:** Test canvas panning with middle mouse button
4. **Translate API:** Test translation feature - should return mock translations
5. **PageDialog:**
   - Reopen dialog - form should reset
   - Try uploading >10MB file - should show error
   - Try dimensions >5000px - should show error
6. **ExportDialog:**
   - Verify custom filename is used
   - Test PNG export creates ZIP of images, not PDF
7. **LayerPanel:** Duplicate layer should create new unique ID
8. **Dialog:** Tab should cycle within dialog, Escape should close

## Breaking Changes

None. All changes are backward compatible:

- Deprecated alias provided for renamed function
- New API endpoint is additive
- Type changes are broader (more permissive)

## Notes

- The `translate.ts` service now has a working API endpoint, but it returns mock translations. Integration with actual translation service (Google Translate, DeepL, etc.) is left as future work.
- The export quality setting affects the PNG multiplier (1x, 2x, 4x) for higher resolution outputs.
