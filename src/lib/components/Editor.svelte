<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { locale, t } from '$lib/i18n';
  import { CanvasManager } from '$lib/canvas/CanvasManager';
  import { translatePageText } from '$lib/services/translate';
  import { inpaintPage } from '$lib/services/inpaint';
  import { notifications } from '$lib/services/notifications';
  import { Wand2, Languages, ImagePlus, Trash2, Sparkles, SquarePen, ZoomIn, ZoomOut, RotateCcw, Undo2, Redo2, Minus, Plus } from 'lucide-svelte';
  import type { editorStore } from '$lib/stores/editorStore.svelte';
  import type { TextBox } from '$lib/schemas/editor';

  interface Props {
    store: typeof editorStore;
    pageId?: number;
  }

  let { store, pageId = 0 }: Props = $props();

  let canvasEl: HTMLCanvasElement;
  let fileInputEl: HTMLInputElement;
  let wrapperEl: HTMLDivElement;
  let manager: CanvasManager;
  let stopChangeWatcher: undefined | (() => void);
  let removeKeyboardHandler: undefined | (() => void);
  let wrapperResizeObserver: ResizeObserver | undefined;
  let renderDebounceTimer: number | undefined;
  let initialized = $state(false);
  let isRendering = $state(false);
  let isApplyingState = false;
  let needsRender = false;
  let isTranslating = $state(false);
  let isCleaning = $state(false);
  let isUploading = $state(false);
  let zoomPercent = $state(100);
  let lastPageForZoom = $state(0);

  const currentPage = () => store.pages?.[pageId];
  let current = $derived(currentPage());
  let hasBackground = $derived(Boolean(current?.imageUrl || current?.inpaintedImageUrl));
  let hasTextLayers = $derived(Boolean(current?.textBoxes?.length));
  let showCanvasEmptyState = $derived(!hasBackground && !hasTextLayers);

  const syncFromCanvas = () => {
    if (isApplyingState) return;
    const items = manager.serializeTextObjects();
    items.forEach((item) => {
      if (item.id) {
        store.syncGridToCanvas(item.id, {
          text: item.text,
          geometry: {
            x: item.geometry.x,
            y: item.geometry.y,
            w: item.geometry.w,
            h: item.geometry.h,
            rotation: item.geometry.rotation
          }
        });
      }
    });
  };

  const renderPage = async () => {
    const page = currentPage();
    if (!page || !manager) return;

    if (isRendering) {
      needsRender = true;
      return;
    }

    isApplyingState = true;
    isRendering = true;
    try {
      await manager.render(page);
      zoomPercent = Math.round(manager.getZoom() * 100);
    } finally {
      isRendering = false;
      isApplyingState = false;
      if (needsRender) {
        needsRender = false;
        queueMicrotask(() => {
          void renderPage();
        });
      }
    }
  };

  const computeFitScale = () => {
    const page = currentPage();
    if (!page || !wrapperEl || !manager) return;
    const scale = manager.zoomToFit(page.width, page.height, wrapperEl.clientWidth - 48, wrapperEl.clientHeight - 48);
    zoomPercent = Math.round(scale * 100);
  };

  const addTextLayer = () => {
    store.syncCanvasToGrid({
      text: 'New text',
      originalText: 'New text',
      geometry: { x: 90, y: 90, w: 280, h: 90, rotation: 0 },
      style: { 
        fontSize: 34, 
        fontFamily: 'Inter', 
        color: '#ffffff', 
        bgColor: 'rgba(15,23,42,0.65)', 
        bubbleShape: 'rounded', 
        lineHeight: 1.2 
      }
    } as Omit<TextBox, 'id'>);
  };

  const addShapeLayer = () => {
    store.syncCanvasToGrid({
      text: 'Bubble',
      originalText: 'Bubble',
      geometry: { x: 130, y: 130, w: 280, h: 120, rotation: 0 },
      style: { 
        fontSize: 30, 
        fontFamily: 'Inter', 
        color: '#e2e8f0', 
        bgColor: 'rgba(79,70,229,0.35)', 
        bubbleShape: 'ellipse', 
        lineHeight: 1.2 
      }
    } as Omit<TextBox, 'id'>);
  };

  const deleteSelection = () => {
    const id = store.selectedTextBoxId;
    manager.removeSelection();
    if (id) {
      store.removeTextBox(id);
      store.selectTextBox(null);
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
      store.updatePage(page.id, { imageUrl: src });
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
      const translated = await translatePageText(page.textBoxes.map((item: any) => ({ 
        id: item.id, 
        originalText: item.originalText 
      })));
      
      // Convert to format expected by batchUpdateTextBoxes
      const updates = translated.map(t => ({ id: t.id, text: t.text }));
      store.batchUpdateTextBoxes(updates);
      
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
      const resultUrl = await inpaintPage(page.imageUrl, page.textBoxes);
      if (resultUrl && resultUrl !== page.imageUrl) {
        store.updatePage(page.id, { inpaintedImageUrl: resultUrl });
        notifications.push({ type: 'success', title: 'Cleaned background generated', timeoutMs: 1800 });
      }
    } catch (error) {
      notifications.push({ type: 'error', title: 'Clean page failed', description: (error as Error)?.message });
    } finally {
      isCleaning = false;
    }
  };

  const zoomIn = () => {
    manager.zoomIn();
    zoomPercent = Math.round(manager.getZoom() * 100);
  };
  const zoomOut = () => {
    manager.zoomOut();
    zoomPercent = Math.round(manager.getZoom() * 100);
  };
  const zoomToFit = () => computeFitScale();
  const canUndo = () => store.canUndo();
  const canRedo = () => store.canRedo();
  const performUndo = () => store.undo();
  const performRedo = () => store.redo();

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
    lastPageForZoom = pageId;
    manager = new CanvasManager({
      onObjectsChanged: syncFromCanvas,
      onSelectionChanged: (id) => {
        store.selectTextBox(id);
      }
    });

    const page = currentPage();
    if (page) {
      (async () => {
        try {
          await manager.init(canvasEl, page);
          initialized = true;
          zoomToFit();
        } catch (err) {
          notifications.push({ type: 'error', title: 'Canvas initialization failed', description: (err as Error)?.message });
        }
      })();
    }

    stopChangeWatcher = store.onChange(() => {
      if (store.activePageId !== pageId) return;
      window.clearTimeout(renderDebounceTimer);
      renderDebounceTimer = window.setTimeout(() => {
        renderPage();
      }, 100);
    });

    removeKeyboardHandler = installKeyboardShortcuts();
    const onResize = () => computeFitScale();
    window.addEventListener('resize', onResize);
    wrapperResizeObserver = new ResizeObserver(() => requestAnimationFrame(computeFitScale));
    wrapperResizeObserver.observe(wrapperEl);
    
    return () => {
      window.removeEventListener('resize', onResize);
      wrapperResizeObserver?.disconnect();
    };
  });

  $effect(() => {
    if (store && typeof pageId === 'number' && initialized && !isRendering) {
      if (pageId !== lastPageForZoom) {
        zoomToFit();
        lastPageForZoom = pageId;
      }
      store.activePageId = pageId;
      renderPage();
    }
  });

  onDestroy(() => {
    stopChangeWatcher?.();
    window.clearTimeout(renderDebounceTimer);
    removeKeyboardHandler?.();
    wrapperResizeObserver?.disconnect();
    manager?.dispose();
  });
</script>

<div class="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-[#e9edf1]">
  <div class="mx-auto mt-3 inline-flex flex-wrap items-center gap-1 rounded bg-[#161c29] px-2 py-1 text-[#d4d9e4] shadow">
    <button class="rounded px-2 py-1 hover:bg-[#242b3a] disabled:opacity-40" onclick={performUndo} disabled={!canUndo()}><Undo2 class="h-3.5 w-3.5" /></button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a] disabled:opacity-40" onclick={performRedo} disabled={!canRedo()}><Redo2 class="h-3.5 w-3.5" /></button>
    <div class="mx-1 h-5 w-px bg-[#3a4252]"></div>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" onclick={addTextLayer}><SquarePen class="h-3.5 w-3.5" /></button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" onclick={addShapeLayer}><Sparkles class="h-3.5 w-3.5" /></button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" onclick={runTranslate} disabled={isTranslating}><Languages class="h-3.5 w-3.5" /></button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" onclick={runCleanPage} disabled={isCleaning}><Wand2 class="h-3.5 w-3.5" /></button>
    <button class="rounded px-2 py-1 hover:bg-[#242b3a]" onclick={openUploadPicker} disabled={isUploading}><ImagePlus class="h-3.5 w-3.5" /></button>
    <button class="rounded px-2 py-1 text-[#ffb5b5] hover:bg-[#2d1f25]" onclick={deleteSelection}><Trash2 class="h-3.5 w-3.5" /></button>
    <input bind:this={fileInputEl} type="file" class="hidden" accept="image/*" onchange={uploadOverlayImage} />
  </div>

  <div bind:this={wrapperEl} class="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-5">
    <div class="rounded bg-[#cfd4db] p-6 flex-shrink-0">
      <div>
        <canvas bind:this={canvasEl}></canvas>
      </div>
    </div>

    {#if showCanvasEmptyState}
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div class="pointer-events-auto rounded bg-white/90 px-5 py-4 text-center text-sm text-[#4b5565] shadow-sm">
          <p class="font-semibold text-[#273041]">Canvas is ready</p>
          <p class="mt-1 text-xs">Import an image/PDF or add a text layer to start editing.</p>
          <div class="mt-3 flex justify-center gap-2">
            <button class="rounded bg-[#ff8b31] px-3 py-1.5 text-xs font-semibold text-white" onclick={openUploadPicker}>Import page</button>
            <button class="rounded bg-[#1f2937] px-3 py-1.5 text-xs font-semibold text-white" onclick={addTextLayer}>Add text</button>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <div class="flex items-center justify-end gap-2 bg-[#e3e7ec] px-3 py-2 text-xs text-[#464d58]">
    <span>{t($locale, 'editor.title')}</span>
    <button class="rounded bg-white px-1.5 py-1" onclick={zoomOut}><Minus class="h-3 w-3" /></button>
    <button class="rounded bg-white px-1.5 py-1" onclick={zoomToFit} title="Fit page"><RotateCcw class="h-3 w-3" /></button>
    <button class="rounded bg-white px-1.5 py-1" onclick={zoomIn}><Plus class="h-3 w-3" /></button>
    <span class="w-10 text-right font-semibold">{zoomPercent}%</span>
    <ZoomIn class="h-3.5 w-3.5" />
    <ZoomOut class="h-3.5 w-3.5" />
  </div>
</div>
