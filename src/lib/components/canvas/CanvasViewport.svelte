<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { CanvasManager } from '$lib/canvas/CanvasManager';
  import { editorStore } from '$lib/stores/editorStore.svelte';
  import { notifications } from '$lib/services/notifications';
  import { SquarePen, Sparkles, Wand2, ImagePlus, Trash2, Languages, ZoomIn, ZoomOut, RotateCcw, Minus, Plus, Undo2, Redo2 } from 'lucide-svelte';

  interface Props {
    pageId?: number;
  }

  let { pageId = 0 }: Props = $props();

  let canvasEl: HTMLCanvasElement;
  let wrapperEl: HTMLDivElement;
  let fileInputEl: HTMLInputElement;
  let manager: CanvasManager;

  let zoomPercent = $state(100);
  let fitScale = $state(1);
  let isUploading = $state(false);
  let isTranslating = $state(false);
  let isCleaning = $state(false);
  let isApplyingState = $state(false);

  let currentPage = $derived(editorStore.pages[pageId]);
  let canvasScale = $derived(fitScale * (zoomPercent / 100));
  let viewportWidth = $derived(Math.max(0, Math.round((currentPage?.width || 0) * canvasScale)));
  let viewportHeight = $derived(Math.max(0, Math.round((currentPage?.height || 0) * canvasScale)));

  let stopChangeWatcher: (() => void) | undefined;
  let removeKeyboardHandler: (() => void) | undefined;
  let wrapperResizeObserver: ResizeObserver | undefined;

  let hasBackground = $derived(Boolean(currentPage?.imageUrl || currentPage?.inpaintedImageUrl));
  let hasTextLayers = $derived(Boolean(currentPage?.textBoxes?.length));
  let showCanvasEmptyState = $derived(!hasBackground && !hasTextLayers);

  function syncFromCanvas() {
    if (isApplyingState) return;
    const items = manager.serializeTextObjects();
    items.forEach(item => editorStore.updateTextBox(item.id!, item));
  }

  async function renderPage() {
    const page = currentPage;
    if (!page || !manager) return;

    isApplyingState = true;
    try {
      await manager.render(page);
      computeFitScale();
    } finally {
      isApplyingState = false;
    }
  }

  function computeFitScale() {
    const page = currentPage;
    if (!page || !wrapperEl) {
      fitScale = 1;
      return;
    }
    const paddingW = 88;
    const paddingH = 88;
    const availW = Math.max(32, wrapperEl.clientWidth - paddingW);
    const availH = Math.max(32, wrapperEl.clientHeight - paddingH);
    fitScale = Math.max(0.05, Math.min(availW / page.width, availH / page.height));
  }

  function addTextLayer() {
    editorStore.addTextBox({
      text: 'New text',
      originalText: 'New text',
      geometry: { x: 90, y: 90, w: 280, h: 90, rotation: 0 },
      style: { fontSize: 34, fontFamily: 'Inter', color: '#ffffff', bgColor: 'rgba(15,23,42,0.65)', bubbleShape: 'rounded', lineHeight: 1.2 }
    });
  }

  function addShapeLayer() {
    editorStore.addTextBox({
      text: 'Bubble',
      originalText: 'Bubble',
      geometry: { x: 130, y: 130, w: 280, h: 120, rotation: 0 },
      style: { fontSize: 30, fontFamily: 'Inter', color: '#e2e8f0', bgColor: 'rgba(79,70,229,0.35)', bubbleShape: 'ellipse', lineHeight: 1.2 }
    });
  }

  function deleteSelection() {
    const id = editorStore.selectedTextBoxId;
    manager.removeSelection();
    if (id) {
      editorStore.removeTextBox(id);
      editorStore.selectTextBox(null);
    }
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
      reader.readAsDataURL(file);
    });
  }

  async function uploadOverlayImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    isUploading = true;
    try {
      const src = await fileToDataUrl(file);
      const page = currentPage;
      if (!page) return;
      editorStore.updatePage(page.id, { imageUrl: src });
      notifications.push({ type: 'success', title: 'Background image updated', timeoutMs: 1800 });
    } catch (error) {
      notifications.push({ type: 'error', title: 'Image import failed', description: (error as Error)?.message });
    } finally {
      isUploading = false;
      if (fileInputEl) fileInputEl.value = '';
    }
  }

  async function runTranslate() {
    const page = currentPage;
    if (!page || !page.textBoxes?.length) return;

    isTranslating = true;
    try {
      const translated = page.textBoxes.map(item => ({ id: item.id, text: `Translated: ${item.text}` }));
      editorStore.batchUpdateTextBoxes(translated);
      notifications.push({ type: 'success', title: 'Page text translated', timeoutMs: 1600 });
    } catch (error) {
      notifications.push({ type: 'error', title: 'Translation failed', description: (error as Error)?.message });
    } finally {
      isTranslating = false;
    }
  }

  async function runCleanPage() {
    const page = currentPage;
    if (!page || !page.imageUrl) return;

    isCleaning = true;
    try {
      notifications.push({ type: 'info', title: 'Background cleaning', description: 'This feature requires API configuration' });
    } catch (error) {
      notifications.push({ type: 'error', title: 'Clean page failed', description: (error as Error)?.message });
    } finally {
      isCleaning = false;
    }
  }

  function zoomIn() {
    zoomPercent = Math.min(220, zoomPercent + 10);
  }

  function zoomOut() {
    zoomPercent = Math.max(50, zoomPercent - 10);
  }

  function zoomToFit() {
    zoomPercent = 100;
  }

  function canUndo() {
    return editorStore.canUndo();
  }

  function canRedo() {
    return editorStore.canRedo();
  }

  function performUndo() {
    editorStore.undo();
  }

  function performRedo() {
    editorStore.redo();
  }

  function installKeyboardShortcuts() {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.tagName === 'INPUT' || (event.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 't') {
        event.preventDefault();
        addTextLayer();
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        addShapeLayer();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === '0') {
        event.preventDefault();
        zoomToFit();
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelection();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }

  onMount(() => {
    manager = new CanvasManager({
      onObjectsChanged: syncFromCanvas,
      onSelectionChanged: (id) => {
        editorStore.selectTextBox(id);
      }
    });

    const page = currentPage;
    if (page) {
      (async () => {
        try {
          await manager.init(canvasEl, page);
        } catch (err) {
          notifications.push({ type: 'error', title: 'Canvas initialization failed', description: (err as Error)?.message });
        }
      })();
    }

    stopChangeWatcher = editorStore.onChange(() => {
      if (editorStore.activePageId !== pageId) return;
      renderPage();
    });

    removeKeyboardHandler = installKeyboardShortcuts();
    const onResize = () => computeFitScale();
    window.addEventListener('resize', onResize);
    wrapperResizeObserver = new ResizeObserver(() => requestAnimationFrame(computeFitScale));
    wrapperResizeObserver.observe(wrapperEl);
  });

  $effect(() => {
    if (editorStore && typeof pageId === 'number') {
      if (pageId !== editorStore.activePageId - 0) {
        zoomToFit();
      }
      editorStore.activePageId = pageId;
      renderPage();
    }
  });

  onDestroy(() => {
    stopChangeWatcher?.();
    removeKeyboardHandler?.();
    wrapperResizeObserver?.disconnect();
    manager?.dispose();
  });
</script>

<div class="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-[#e9edf1]">
  <div class="mx-auto mt-3 inline-flex flex-wrap items-center gap-1 rounded bg-[#161c29] px-2 py-1 text-[#d4d9e4] shadow">
    <button class="rounded px-2 py-1 hover:bg-[#242b3a] disabled:opacity-40" onclick={performUndo} disabled={!canUndo()}>
      <Undo2 class="h-3.5 w-3.5" />
    </button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a] disabled:opacity-40" onclick={performRedo} disabled={!canRedo()}>
      <Redo2 class="h-3.5 w-3.5" />
    </button>
    <div class="mx-1 h-5 w-px bg-[#3a4252]"></div>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" onclick={addTextLayer}>
      <SquarePen class="h-3.5 w-3.5" />
    </button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" onclick={addShapeLayer}>
      <Sparkles class="h-3.5 w-3.5" />
    </button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" onclick={runTranslate} disabled={isTranslating}>
      <Languages class="h-3.5 w-3.5" />
    </button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" onclick={runCleanPage} disabled={isCleaning}>
      <Wand2 class="h-3.5 w-3.5" />
    </button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" onclick={() => fileInputEl?.click()} disabled={isUploading}>
      <ImagePlus class="h-3.5 w-3.5" />
    </button>
    <button class="rounded px-2 py-1 text-[#ffb5b5] hover:bg-[#2d1f25]" onclick={deleteSelection}>
      <Trash2 class="h-3.5 w-3.5" />
    </button>
    <input bind:this={fileInputEl} type="file" class="hidden" accept="image/*" onchange={uploadOverlayImage} />
  </div>

  <div bind:this={wrapperEl} class="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-5">
    <div class="rounded bg-[#cfd4db] p-6 flex-shrink-0">
      <div class="transition-[width,height] duration-150" style={`width:${viewportWidth}px; height:${viewportHeight}px;`}>
        <div style={`transform: scale(${canvasScale}); transform-origin: top left;`} class="transition-transform duration-150">
          <canvas bind:this={canvasEl}></canvas>
        </div>
      </div>
    </div>

    {#if showCanvasEmptyState}
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div class="pointer-events-auto rounded bg-white/90 px-5 py-4 text-center text-sm text-[#4b5565] shadow-sm">
          <p class="font-semibold text-[#273041]">Canvas is ready</p>
          <p class="mt-1 text-xs">Import an image/PDF or add a text layer to start editing.</p>
          <div class="mt-3 flex justify-center gap-2">
            <button class="rounded bg-[#ff8b31] px-3 py-1.5 text-xs font-semibold text-white" onclick={() => fileInputEl?.click()}>Import page</button>
            <button class="rounded bg-[#1f2937] px-3 py-1.5 text-xs font-semibold text-white" onclick={addTextLayer}>Add text</button>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <div class="flex items-center justify-end gap-2 bg-[#e3e7ec] px-3 py-2 text-xs text-[#464d58]">
    <button class="rounded bg-white px-1.5 py-1" onclick={zoomOut}>
      <Minus class="h-3 w-3" />
    </button>
    <button class="rounded bg-white px-1.5 py-1" onclick={zoomToFit} title="Fit page">
      <RotateCcw class="h-3 w-3" />
    </button>
    <button class="rounded bg-white px-1.5 py-1" onclick={zoomIn}>
      <Plus class="h-3 w-3" />
    </button>
    <span class="w-10 text-right font-semibold">{zoomPercent}%</span>
    <ZoomIn class="h-3.5 w-3.5" />
    <ZoomOut class="h-3.5 w-3.5" />
  </div>
</div>
