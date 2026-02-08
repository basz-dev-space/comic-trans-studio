<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { locale, t } from '$lib/i18n';
  import { CanvasManager } from '$lib/canvas/CanvasManager';
  import { translatePageText } from '$lib/services/translate';
  import { inpaintPage } from '$lib/services/inpaint';
  import { notifications } from '$lib/services/notifications';
  import { Wand2, Languages, ImagePlus, Trash2, Sparkles, SquarePen, ZoomIn, ZoomOut, RotateCcw, Undo2, Redo2, Minus, Plus } from 'lucide-svelte';

  export let store: any;
  export let pageId = 0;

  let canvasEl: HTMLCanvasElement;
  let fileInputEl: HTMLInputElement;
  let wrapperEl: HTMLDivElement;
  let manager: CanvasManager;
  let stopChangeWatcher: undefined | (() => void);
  let removeKeyboardHandler: undefined | (() => void);
  let wrapperResizeObserver: ResizeObserver | undefined;
  let isApplyingState = false;
  let isTranslating = false;
  let isCleaning = false;
  let isUploading = false;
  let zoomPercent = 100;
  let lastPageForZoom = pageId;

  const currentPage = () => store.pages?.[pageId];
  $: current = currentPage();
  $: hasBackground = Boolean(current?.imageUrl || current?.inpaintedImageUrl);
  $: hasTextLayers = Boolean(current?.textBoxes?.length);
  $: showCanvasEmptyState = !hasBackground && !hasTextLayers;
  let fitScale = 1;
  $: canvasScale = fitScale * (zoomPercent / 100);
  $: viewportWidth = Math.max(0, Math.round((current?.width || 0) * canvasScale));
  $: viewportHeight = Math.max(0, Math.round((current?.height || 0) * canvasScale));

  const syncFromCanvas = () => {
    if (isApplyingState) return;
    manager.serializeTextObjects().forEach((item) => store.syncCanvasToGrid(item));
    store.notify();
  };

  const renderPage = async () => {
    const page = currentPage();
    if (!page || !manager) return;

    isApplyingState = true;
    try {
      await manager.render(page);
      computeFitScale();
    } finally {
      isApplyingState = false;
    }
  };

  const computeFitScale = () => {
    const page = currentPage();
    if (!page || !wrapperEl) return (fitScale = 1);
    const paddingW = 88; // wrapper + frame paddings
    const paddingH = 88;
    const availW = Math.max(32, wrapperEl.clientWidth - paddingW);
    const availH = Math.max(32, wrapperEl.clientHeight - paddingH);
    fitScale = Math.max(0.05, Math.min(availW / page.width, availH / page.height));
  };

  const addTextLayer = () => {
    store.syncCanvasToGrid({ text: 'New text', originalText: 'New text', left: 90, top: 90, width: 280, height: 90, fontSize: 34, fill: '#ffffff', backgroundColor: 'rgba(15,23,42,0.65)', bubbleShape: 'rounded' });
    store.notify();
  };

  const addShapeLayer = () => {
    store.syncCanvasToGrid({ text: 'Bubble', originalText: 'Bubble', left: 130, top: 130, width: 280, height: 120, fontSize: 30, fill: '#e2e8f0', backgroundColor: 'rgba(79,70,229,0.35)', bubbleShape: 'ellipse' });
    store.notify();
  };

  const deleteSelection = () => {
    const id = store?.project?.selectedTextBoxId ?? null;
    manager.removeSelection();
    if (id) {
      store.removeTextBox(id);
      store.project.selectedTextBoxId = null;
      store.notify();
    }
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
      reader.readAsDataURL(file);
    });

  const openUploadPicker = () => fileInputEl?.click();

  const uploadOverlayImage = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    isUploading = true;
    try {
      const src = await fileToDataUrl(file);
      const page = currentPage();
      if (!page) return;
      page.imageUrl = src;
      store.notify();
      notifications.push({ type: 'success', title: 'Background image updated', timeoutMs: 1800 });
    } catch (error) {
      notifications.push({ type: 'error', title: 'Image import failed', description: (error as Error)?.message });
    } finally {
      isUploading = false;
      if (fileInputEl) fileInputEl.value = '';
    }
  };

  const runTranslate = async () => {
    const page = currentPage();
    if (!page || !page.textBoxes?.length) return;

    isTranslating = true;
    try {
      const translated = await translatePageText(page.textBoxes.map((item: any) => ({ id: item.id, originalText: item.originalText })));
      store.batchUpdateTranslatedText(translated);
      notifications.push({ type: 'success', title: 'Page text translated', timeoutMs: 1600 });
    } catch (error) {
      notifications.push({ type: 'error', title: 'Translation failed', description: (error as Error)?.message });
    } finally {
      isTranslating = false;
    }
  };

  const runCleanPage = async () => {
    const page = currentPage();
    if (!page || !page.imageUrl) return;

    isCleaning = true;
    try {
      page.inpaintedImageUrl = await inpaintPage(page.imageUrl, page.textBoxes);
      store.notify();
      notifications.push({ type: 'success', title: 'Cleaned background generated', timeoutMs: 1800 });
    } catch (error) {
      notifications.push({ type: 'error', title: 'Clean page failed', description: (error as Error)?.message });
    } finally {
      isCleaning = false;
    }
  };

  const zoomIn = () => (zoomPercent = Math.min(220, zoomPercent + 10));
  const zoomOut = () => (zoomPercent = Math.max(50, zoomPercent - 10));
  const zoomToFit = () => (zoomPercent = 100);
  const announceHistoryPlaceholder = (type: 'undo' | 'redo') => notifications.push({ type: 'info', title: type === 'undo' ? 'Undo is coming next' : 'Redo is coming next', timeoutMs: 1400 });

  const installKeyboardShortcuts = () => {
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
  };

  onMount(() => {
    manager = new CanvasManager({
      onObjectsChanged: syncFromCanvas,
      onSelectionChanged: (id) => {
        store.project.selectedTextBoxId = id;
        store.notify();
      }
    });

    const page = currentPage();
    if (page) {
      manager.init(canvasEl, page);
    }

    stopChangeWatcher = store.onChange(() => {
      if (store.activePageId !== pageId) return;
      renderPage();
    });

    removeKeyboardHandler = installKeyboardShortcuts();
    const onResize = () => computeFitScale();
    window.addEventListener('resize', onResize);
    wrapperResizeObserver = new ResizeObserver(() => computeFitScale());
    wrapperResizeObserver.observe(wrapperEl);
    return () => {
      window.removeEventListener('resize', onResize);
      wrapperResizeObserver?.disconnect();
    };
  });

  $: if (store && typeof pageId === 'number') {
    if (pageId !== lastPageForZoom) {
      zoomToFit();
      lastPageForZoom = pageId;
    }
    store.activePageId = pageId;
    renderPage();
  }

  onDestroy(() => {
    stopChangeWatcher?.();
    removeKeyboardHandler?.();
    wrapperResizeObserver?.disconnect();
    manager?.dispose();
  });
</script>

<div class="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-[#e9edf1]">
  <div class="mx-auto mt-3 inline-flex flex-wrap items-center gap-1 rounded bg-[#161c29] px-2 py-1 text-[#d4d9e4] shadow">
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" on:click={() => announceHistoryPlaceholder('undo')}><Undo2 class="h-3.5 w-3.5" /></button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" on:click={() => announceHistoryPlaceholder('redo')}><Redo2 class="h-3.5 w-3.5" /></button>
    <div class="mx-1 h-5 w-px bg-[#3a4252]"></div>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" on:click={addTextLayer}><SquarePen class="h-3.5 w-3.5" /></button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" on:click={addShapeLayer}><Sparkles class="h-3.5 w-3.5" /></button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" on:click={runTranslate} disabled={isTranslating}><Languages class="h-3.5 w-3.5" /></button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" on:click={runCleanPage} disabled={isCleaning}><Wand2 class="h-3.5 w-3.5" /></button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" on:click={() => fileInputEl?.click()} disabled={isUploading}><ImagePlus class="h-3.5 w-3.5" /></button>
    <button class="rounded px-2 py-1 text-[#ffb5b5] hover:bg-[#2d1f25]" on:click={deleteSelection}><Trash2 class="h-3.5 w-3.5" /></button>
    <input bind:this={fileInputEl} type="file" class="hidden" accept="image/*" on:change={uploadOverlayImage} />
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
              <button class="rounded bg-[#ff8b31] px-3 py-1.5 text-xs font-semibold text-white" on:click={openUploadPicker}>Import page</button>
              <button class="rounded bg-[#1f2937] px-3 py-1.5 text-xs font-semibold text-white" on:click={addTextLayer}>Add text</button>
            </div>
          </div>
        </div>
      {/if}
    </div>

  <div class="flex items-center justify-end gap-2 bg-[#e3e7ec] px-3 py-2 text-xs text-[#464d58]">
    <span>{t($locale, 'editor.title')}</span>
    <button class="rounded bg-white px-1.5 py-1" on:click={zoomOut}><Minus class="h-3 w-3" /></button>
    <button class="rounded bg-white px-1.5 py-1" on:click={zoomToFit} title="Fit page"><RotateCcw class="h-3 w-3" /></button>
    <button class="rounded bg-white px-1.5 py-1" on:click={zoomIn}><Plus class="h-3 w-3" /></button>
    <span class="w-10 text-right font-semibold">{zoomPercent}%</span>
    <ZoomIn class="h-3.5 w-3.5" />
    <ZoomOut class="h-3.5 w-3.5" />
  </div>
</div>
