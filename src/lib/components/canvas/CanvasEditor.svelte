<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { CanvasManager } from '$lib/canvas/CanvasManager';
  import { editorStore, type TextBox } from '$lib/stores/editorStore.svelte';
  import { notifications } from '$lib/services/notifications';
  import Toolbar from './Toolbar.svelte';
  import PagePanel from './PagePanel.svelte';
  import RightPanel from './RightPanel.svelte';
  import ExportDialog from './ExportDialog.svelte';
  import PageDialog from './PageDialog.svelte';
  import { compressImage, fileToDataUrl } from '$lib/utils/image';
  import { translatePageText } from '$lib/services/translate';
  import { inpaintPage } from '$lib/services/inpaint';
  import { ArrowLeft } from 'lucide-svelte';

  interface Props {
    projectId?: string;
    chapterId?: string;
    chapterName?: string;
  }

  let { projectId = '', chapterId: _chapterId = '', chapterName = 'Untitled Chapter' }: Props = $props();

  let canvasEl: HTMLCanvasElement;
  let wrapperEl: HTMLDivElement;
  let fileInputEl: HTMLInputElement;
  let manager: CanvasManager;

  let currentPage = $derived(editorStore.pages[editorStore.activePageId]);
  let hasBackground = $derived(Boolean(currentPage?.imageUrl || currentPage?.inpaintedImageUrl));
  let hasTextLayers = $derived(Boolean(currentPage?.textBoxes?.length));
  let showCanvasEmptyState = $derived(!hasBackground && !hasTextLayers);

  let selectedTextBox = $state<TextBox | null>(null);
  let isTranslating = $state(false);
  let isCleaning = $state(false);
  let isUploading = $state(false);
  let isEditingText = $state(false);
  let zoomPercent = $state(100);
  let showExportDialog = $state(false);
  let showPageDialog = $state(false);
  let showShortcutsDialog = $state(false);

  let stopChangeWatcher: (() => void) | undefined;
  let removeKeyboardHandler: (() => void) | undefined;
  let wrapperResizeObserver: ResizeObserver | undefined;

  $effect(() => {
    if (editorStore) {
      renderPage();
    }
  });

  $effect(() => {
    const unsubscribe = editorStore.onChange(() => {
      const active = editorStore.getTextBox(editorStore.selectedTextBoxId || '');
      selectedTextBox = active || null;
    });
    return unsubscribe;
  });

  async function renderPage() {
    const page = currentPage;
    if (!page || !manager) return;
    await manager.render(page);
    computeFitScale();
  }

  function computeFitScale() {
    const page = currentPage;
    if (!page || !wrapperEl) return;

    const padding = 40;
    const availW = Math.max(200, wrapperEl.clientWidth - padding);
    const availH = Math.max(200, wrapperEl.clientHeight - padding);
    const scale = Math.max(0.1, Math.min(availW / page.width, availH / page.height));

    zoomPercent = Math.round(scale * 100);
    manager.setZoom(scale);
  }

  function addTextLayer() {
    editorStore.addTextBox({
      text: 'Double-click to edit',
      originalText: 'Double-click to edit',
      geometry: { x: 100, y: 100, w: 300, h: 60, rotation: 0 },
      style: { fontSize: 28, fontFamily: 'Inter', color: '#ffffff', bgColor: 'rgba(15,23,42,0.65)', bubbleShape: 'rounded', lineHeight: 1.2 }
    });
    notifications.push({ type: 'success', title: 'Text added', description: 'Click to select, drag to move' });
  }

  function addShapeLayer() {
    editorStore.addTextBox({
      text: 'Speech Bubble',
      originalText: 'Speech Bubble',
      geometry: { x: 150, y: 150, w: 280, h: 80, rotation: 0 },
      style: { fontSize: 24, fontFamily: 'Inter', color: '#ffffff', bgColor: 'rgba(99, 102, 241, 0.7)', bubbleShape: 'ellipse', lineHeight: 1.2 }
    });
    notifications.push({ type: 'success', title: 'Bubble added', description: 'Select and resize as needed' });
  }

  function deleteSelection() {
    if (editorStore.selectedTextBoxId) {
      editorStore.removeTextBox(editorStore.selectedTextBoxId);
      editorStore.selectTextBox(null);
      selectedTextBox = null;
      notifications.push({ type: 'success', title: 'Deleted', description: 'Text box removed' });
    }
  }

  async function handleUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    isUploading = true;
    try {
      const src = await fileToDataUrl(file);
      const { compressed, originalWidth, originalHeight } = await compressImage(src);

      editorStore.addPage({
        name: file.name.replace(/\.[^/.]+$/, ''),
        width: originalWidth,
        height: originalHeight,
        imageUrl: compressed
      });

      notifications.push({ type: 'success', title: 'Page added', description: `${originalWidth}x${originalHeight}px` });
    } catch (error) {
      notifications.push({ type: 'error', title: 'Upload failed', description: (error as Error).message });
    } finally {
      isUploading = false;
      if (fileInputEl) fileInputEl.value = '';
    }
  }

  async function handleTranslate() {
    const page = currentPage;
    if (!page || !page.textBoxes?.length) {
      notifications.push({ type: 'info', title: 'No text', description: 'Add text layers first' });
      return;
    }

    isTranslating = true;
    try {
      const translated = await translatePageText(page.textBoxes.map(tb => ({ id: tb.id, originalText: tb.originalText })));
      editorStore.batchUpdateTextBoxes(translated);
      notifications.push({ type: 'success', title: 'Translated', description: `${translated.length} text boxes updated` });
    } catch (error) {
      notifications.push({ type: 'error', title: 'Translation failed', description: (error as Error).message });
    } finally {
      isTranslating = false;
    }
  }

  async function handleClean() {
    const page = currentPage;
    if (!page?.imageUrl) {
      notifications.push({ type: 'info', title: 'No image', description: 'Upload a page image first' });
      return;
    }

    isCleaning = true;
    try {
      const resultUrl = await inpaintPage(page.imageUrl, page.textBoxes);
      if (resultUrl && resultUrl !== page.imageUrl) {
        editorStore.updatePage(page.id, { inpaintedImageUrl: resultUrl });
        notifications.push({ type: 'success', title: 'Cleaned', description: 'Background cleaned successfully' });
      } else {
        notifications.push({ type: 'info', title: 'No changes', description: 'Background unchanged' });
      }
    } catch (error) {
      notifications.push({ type: 'error', title: 'Clean failed', description: (error as Error).message });
    } finally {
      isCleaning = false;
    }
  }

  function handleZoomIn() {
    manager.zoomIn();
    zoomPercent = Math.round(manager.getZoom() * 100);
  }

  function handleZoomOut() {
    manager.zoomOut();
    zoomPercent = Math.round(manager.getZoom() * 100);
  }

  function handleZoomReset() {
    const page = currentPage;
    if (!page || !wrapperEl) return;
    const scale = manager.zoomToFit(page.width, page.height, wrapperEl.clientWidth, wrapperEl.clientHeight);
    zoomPercent = Math.round(scale * 100);
  }

  function handleUndo() {
    editorStore.undo();
    setTimeout(renderPage, 50);
  }

  function handleRedo() {
    editorStore.redo();
    setTimeout(renderPage, 50);
  }

  function installKeyboardShortcuts() {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.tagName === 'INPUT' || (event.target as HTMLElement)?.tagName === 'TEXTAREA') return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        notifications.push({ type: 'info', title: 'Auto-save', description: 'Changes are saved automatically' });
        return;
      }

      if (event.key.toLowerCase() === 't' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        addTextLayer();
        return;
      }

      if (event.key.toLowerCase() === 'b' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        addShapeLayer();
        return;
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        handleZoomIn();
        return;
      }

      if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        handleZoomOut();
        return;
      }

      if (event.key === '0') {
        event.preventDefault();
        handleZoomReset();
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (!isEditingText) {
          event.preventDefault();
          deleteSelection();
        }
        return;
      }

      if (event.key === 'Escape') {
        editorStore.selectTextBox(null);
        selectedTextBox = null;
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }

  onMount(() => {
    const managerInstance = new CanvasManager({
      onObjectsChanged: () => {},
      onSelectionChanged: (id) => {
        editorStore.selectTextBox(id);
        selectedTextBox = editorStore.getTextBox(id || '') || null;
      },
      onCanvasReady: () => {},
      onTextEditing: (editing: boolean) => {
        isEditingText = editing;
      }
    });
    manager = managerInstance;

    if (currentPage) {
      (async () => {
        try {
          await manager.init(canvasEl, currentPage);
          computeFitScale();
        } catch (err) {
          notifications.push({ type: 'error', title: 'Canvas failed', description: (err as Error).message });
        }
      })();
    }

    removeKeyboardHandler = installKeyboardShortcuts();
    const onResize = () => computeFitScale();
    window.addEventListener('resize', onResize);
    wrapperResizeObserver = new ResizeObserver(() => requestAnimationFrame(computeFitScale));
    wrapperResizeObserver.observe(wrapperEl);
  });

  onDestroy(() => {
    stopChangeWatcher?.();
    removeKeyboardHandler?.();
    wrapperResizeObserver?.disconnect();
    manager?.dispose();
  });

  const shortcuts = [
    { keys: 'T', action: 'Add text' },
    { keys: 'B', action: 'Add bubble' },
    { keys: 'Delete', action: 'Delete selected' },
    { keys: 'Ctrl+Z', action: 'Undo' },
    { keys: 'Ctrl+Shift+Z', action: 'Redo' },
    { keys: '+ / -', action: 'Zoom in/out' },
    { keys: '0', action: 'Reset zoom' },
    { keys: 'Esc', action: 'Deselect' }
  ];
</script>

<div class="flex h-full flex-col bg-gray-50">
  <header class="flex items-center justify-between bg-white px-4 py-2 border-b border-gray-200">
    <div class="flex items-center gap-3">
      <a href={`/project/${projectId}`} class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft class="h-5 w-5" />
      </a>
      <h1 class="text-lg font-semibold text-gray-900">{chapterName}</h1>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-xs text-gray-500">
        {editorStore.pages.length} page{editorStore.pages.length !== 1 ? 's' : ''}
      </span>
    </div>
  </header>

  <Toolbar
    canUndo={editorStore.canUndo()}
    canRedo={editorStore.canRedo()}
    {isTranslating}
    {isCleaning}
    {isUploading}
    {zoomPercent}
    on:undo={handleUndo}
    on:redo={handleRedo}
    on:addText={addTextLayer}
    on:addBubble={addShapeLayer}
    on:translate={handleTranslate}
    on:clean={handleClean}
    on:upload={() => fileInputEl?.click()}
    on:delete={deleteSelection}
    on:zoomIn={handleZoomIn}
    on:zoomOut={handleZoomOut}
    on:zoomReset={handleZoomReset}
    on:export={() => showExportDialog = true}
    on:showShortcuts={() => showShortcutsDialog = true}
  />

  <div class="flex flex-1 overflow-hidden">
    <aside class="w-64 flex-shrink-0 border-r border-gray-200 bg-white">
      <PagePanel />
    </aside>

    <main class="flex-1 overflow-hidden bg-gray-100 p-4">
      <div
        bind:this={wrapperEl}
        class="flex h-full items-center justify-center overflow-auto rounded-lg bg-white shadow-sm"
      >
        <div class="relative" style="background-color: #f8f9fa; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <canvas bind:this={canvasEl}></canvas>

          {#if showCanvasEmptyState}
            <div class="absolute inset-0 flex items-center justify-center bg-white/90">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Start creating</h3>
                <p class="mt-1 text-sm text-gray-500">Upload an image or add text</p>
                <div class="mt-4 flex justify-center gap-2">
                  <button
                    class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    onclick={() => fileInputEl?.click()}
                  >
                    Upload Image
                  </button>
                  <button
                    class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onclick={addTextLayer}
                  >
                    Add Text
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </main>

    <aside class="w-80 flex-shrink-0 border-l border-gray-200 bg-white overflow-hidden">
      <RightPanel selectedTextBox={selectedTextBox} />
    </aside>
  </div>
</div>

<input bind:this={fileInputEl} type="file" class="hidden" accept="image/*" onchange={handleUpload} />

<ExportDialog bind:open={showExportDialog} onClose={() => showExportDialog = false} />
<PageDialog bind:open={showPageDialog} onClose={() => showPageDialog = false} />

{#if showShortcutsDialog}
  <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-black/50" onclick={() => showShortcutsDialog = false} role="presentation"></div>
    <div class="relative z-50 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
      <h2 class="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
      <p class="mt-1 text-sm text-gray-500">Work faster with keyboard shortcuts</p>
      <div class="mt-4 space-y-2">
        {#each shortcuts as shortcut}
          <div class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
            <span class="text-sm text-gray-700">{shortcut.action}</span>
            <kbd class="rounded bg-white px-2 py-1 text-xs font-mono text-gray-600 shadow-sm">{shortcut.keys}</kbd>
          </div>
        {/each}
      </div>
      <button
        class="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        onclick={() => showShortcutsDialog = false}
      >
        Close
      </button>
    </div>
  </div>
{/if}
