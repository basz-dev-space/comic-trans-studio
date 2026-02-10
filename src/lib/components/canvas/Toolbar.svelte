<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    Undo2,
    Redo2,
    Type,
    Sparkles,
    Wand2,
    ImagePlus,
    Trash2,
    Languages,
    Download,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    HelpCircle
  } from 'lucide-svelte';

  interface Props {
    canUndo?: boolean;
    canRedo?: boolean;
    isTranslating?: boolean;
    isCleaning?: boolean;
    isUploading?: boolean;
    zoomPercent?: number;
  }

  let {
    canUndo = false,
    canRedo = false,
    isTranslating = false,
    isCleaning = false,
    isUploading = false,
    zoomPercent = 100
  }: Props = $props();

  const dispatch = createEventDispatcher();

  function handleUndo() {
    dispatch('undo');
  }

  function handleRedo() {
    dispatch('redo');
  }

  function handleAddText() {
    dispatch('addText');
  }

  function handleAddBubble() {
    dispatch('addBubble');
  }

  function handleTranslate() {
    dispatch('translate');
  }

  function handleClean() {
    dispatch('clean');
  }

  function handleUpload() {
    dispatch('upload');
  }

  function handleDelete() {
    dispatch('delete');
  }

  function handleExport() {
    dispatch('export');
  }

  function handleZoomIn() {
    dispatch('zoomIn');
  }

  function handleZoomOut() {
    dispatch('zoomOut');
  }

  function handleZoomReset() {
    dispatch('zoomReset');
  }

  const tooltips: Record<string, string> = {
    undo: 'Undo (Ctrl+Z)',
    redo: 'Redo (Ctrl+Y)',
    addText: 'Add Text (T)',
    addBubble: 'Add Bubble (B)',
    translate: 'Translate Text',
    clean: 'Clean Background',
    upload: 'Upload Image',
    delete: 'Delete (Del)',
    export: 'Export',
    zoomIn: 'Zoom In (+)',
    zoomOut: 'Zoom Out (-)',
    zoomReset: 'Reset Zoom (0)'
  };
</script>

<div class="flex items-center gap-1 rounded-lg bg-white p-1.5 shadow-sm border border-gray-200">
  <div class="flex items-center gap-0.5 pr-2 border-r border-gray-200">
    <button
      class="toolbar-btn"
      onclick={handleUndo}
      disabled={!canUndo}
      title={tooltips.undo}
      aria-label={tooltips.undo}
    >
      <Undo2 class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      onclick={handleRedo}
      disabled={!canRedo}
      title={tooltips.redo}
      aria-label={tooltips.redo}
    >
      <Redo2 class="h-4 w-4" />
    </button>
  </div>

  <div class="flex items-center gap-0.5 px-2 border-r border-gray-200">
    <button
      class="toolbar-btn primary"
      onclick={handleAddText}
      title={tooltips.addText}
      aria-label={tooltips.addText}
    >
      <Type class="h-4 w-4" />
      <span class="ml-1 text-xs font-medium">Text</span>
    </button>
    <button
      class="toolbar-btn"
      onclick={handleAddBubble}
      title={tooltips.addBubble}
      aria-label={tooltips.addBubble}
    >
      <Sparkles class="h-4 w-4" />
    </button>
  </div>

  <div class="flex items-center gap-0.5 px-2 border-r border-gray-200">
    <button
      class="toolbar-btn"
      onclick={handleTranslate}
      disabled={isTranslating}
      title={tooltips.translate}
      aria-label={tooltips.translate}
    >
      <Languages class="h-4 w-4" />
      {#if isTranslating}
        <span class="ml-1 text-xs">...</span>
      {/if}
    </button>
    <button
      class="toolbar-btn"
      onclick={handleClean}
      disabled={isCleaning}
      title={tooltips.clean}
      aria-label={tooltips.clean}
    >
      <Wand2 class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      onclick={handleUpload}
      disabled={isUploading}
      title={tooltips.upload}
      aria-label={tooltips.upload}
    >
      <ImagePlus class="h-4 w-4" />
    </button>
  </div>

  <div class="flex items-center gap-0.5 px-2 border-r border-gray-200">
    <button
      class="toolbar-btn danger"
      onclick={handleDelete}
      title={tooltips.delete}
      aria-label={tooltips.delete}
    >
      <Trash2 class="h-4 w-4" />
    </button>
  </div>

  <div class="flex items-center gap-0.5 px-2">
    <button
      class="toolbar-btn"
      onclick={handleZoomOut}
      title={tooltips.zoomOut}
      aria-label={tooltips.zoomOut}
    >
      <ZoomOut class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn zoom-display"
      onclick={handleZoomReset}
      title={tooltips.zoomReset}
      aria-label={tooltips.zoomReset}
    >
      {zoomPercent}%
    </button>
    <button
      class="toolbar-btn"
      onclick={handleZoomIn}
      title={tooltips.zoomIn}
      aria-label={tooltips.zoomIn}
    >
      <ZoomIn class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      onclick={handleZoomReset}
      title={tooltips.zoomReset}
      aria-label={tooltips.zoomReset}
    >
      <RotateCcw class="h-4 w-4" />
    </button>
  </div>

  <div class="flex items-center gap-0.5 pl-2 ml-auto border-l border-gray-200">
    <button
      class="toolbar-btn"
      onclick={() => dispatch('showShortcuts')}
      title="Keyboard Shortcuts"
      aria-label="Keyboard Shortcuts"
    >
      <HelpCircle class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      onclick={handleExport}
      title={tooltips.export}
      aria-label={tooltips.export}
    >
      <Download class="h-4 w-4" />
    </button>
  </div>
</div>

<style>
  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    min-width: 32px;
    height: 32px;
    padding: 0 0.5rem;
    border: none;
    border-radius: 0.375rem;
    background: transparent;
    color: #4b5563;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .toolbar-btn:hover:not(:disabled) {
    background: #f3f4f6;
    color: #1f2937;
  }

  .toolbar-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .toolbar-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .toolbar-btn.primary {
    background: #6366f1;
    color: white;
  }

  .toolbar-btn.primary:hover:not(:disabled) {
    background: #4f46e5;
  }

  .toolbar-btn.danger {
    color: #ef4444;
  }

  .toolbar-btn.danger:hover:not(:disabled) {
    background: #fef2f2;
  }

  .toolbar-btn.zoom-display {
    min-width: 48px;
    font-family: ui-monospace, SFMono-Regular, 'Menlo', 'Monaco', 'Consolas', monospace;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6366f1;
    cursor: default;
  }

  .toolbar-btn.zoom-display:hover {
    background: transparent;
    color: #4f46e5;
  }
</style>
