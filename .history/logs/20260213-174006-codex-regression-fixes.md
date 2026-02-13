# Regression fixes for Canvas export + render scheduling

- Change: Updated `src/lib/components/canvas/CanvasEditor.svelte` and `src/lib/components/canvas/ExportDialog.svelte` so ZIP/PDF toolbar buttons open the export dialog with the corresponding format preselected.
- Why: The ZIP button opened the dialog with default PDF selected, which could export the wrong format unless manually changed.
- How to validate: Click ZIP/PDF export actions and confirm the dialog highlights ZIP/PDF respectively before pressing Export.
- Skills used: `skill-creator` (used as a structured plan-first execution and traceability workflow).

- Change: Updated `src/lib/components/canvas/CanvasViewport.svelte` and `src/lib/components/Editor.svelte` render scheduling to queue a follow-up render when updates arrive during an active render.
- Why: Debounced updates could be dropped because `renderPage` exited early when `isRendering` was true.
- How to validate: Trigger rapid updates while canvas is rendering (e.g., grid edits/undo-redo bursts) and confirm the canvas eventually reflects latest state.
- Skills used: `skill-creator` (used to structure root-cause validation and targeted implementation).

- Change: Made `initialized` and `isRendering` reactive (`$state`) in `src/lib/components/Editor.svelte`.
- Why: Effect guards relying on plain locals are not tracked by `$effect`, which can block reruns after init/render state transitions.
- How to validate: Switch pages and confirm render effect reliably reruns after init and after render completion.
- Skills used: `skill-creator` (used to enforce concise, testable change records).
