<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { locale, t } from '$lib/i18n';
  import { CanvasManager } from '$lib/canvas/CanvasManager';
  import { translatePageText } from '$lib/services/translate';
  import { inpaintPage } from '$lib/services/inpaint';

  export let store: any;
  export let pageId = 0;

  let canvasEl: HTMLCanvasElement;
  let fileInputEl: HTMLInputElement;
  let manager: CanvasManager;
  let stopChangeWatcher: undefined | (() => void);
  let isApplyingState = false;

  const currentPage = () => store.pages?.[pageId];

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
    } finally {
      isApplyingState = false;
    }
  };

  const addTextLayer = () => {
    store.syncCanvasToGrid({
      text: 'New text',
      originalText: 'New text',
      left: 90,
      top: 90,
      width: 280,
      height: 90,
      fontSize: 34,
      fill: '#ffffff',
      backgroundColor: 'rgba(15,23,42,0.65)',
      bubbleShape: 'rounded'
    });
    store.notify();
  };

  const addShapeLayer = () => {
    store.syncCanvasToGrid({
      text: 'Bubble',
      originalText: 'Bubble',
      left: 130,
      top: 130,
      width: 280,
      height: 120,
      fontSize: 30,
      fill: '#e2e8f0',
      backgroundColor: 'rgba(79,70,229,0.35)',
      bubbleShape: 'ellipse'
    });
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

  const uploadOverlayImage = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const src = await fileToDataUrl(file);
    const page = currentPage();
    if (!page) return;
    page.imageUrl = src;
    store.notify();
    if (fileInputEl) fileInputEl.value = '';
  };

  const runTranslate = async () => {
    const page = currentPage();
    if (!page) return;
    const translated = await translatePageText(
      page.textBoxes.map((item: any) => ({ id: item.id, originalText: item.originalText }))
    );
    store.batchUpdateTranslatedText(translated);
  };

  const runCleanPage = async () => {
    const page = currentPage();
    if (!page) return;
    page.inpaintedImageUrl = await inpaintPage(page.imageUrl, page.textBoxes);
    store.notify();
  };

  const toggleBackground = () => {
    const page = currentPage();
    if (!page) return;
    // Only toggle the viewing flag. Do not overwrite the stored inpainted image URL.
    store.project.showInpainted = !!store.project.showInpainted ? false : true;
    store.notify();
  };

  onMount(async () => {
    manager = new CanvasManager({
      onObjectsChanged: syncFromCanvas,
      onSelectionChanged: (id) => {
        store.project.selectedTextBoxId = id;
        store.notify();
      }
    });

    const page = currentPage();
    if (page) await manager.init(canvasEl, page);

    stopChangeWatcher = store.onChange(() => {
      if (store.activePageId !== pageId) return;
      renderPage();
    });
  });

  $: if (store && typeof pageId === 'number') {
    store.activePageId = pageId;
    renderPage();
  }

  onDestroy(() => {
    stopChangeWatcher?.();
    manager?.dispose();
  });
</script>

<Card className="relative flex h-full w-full min-h-0 flex-col overflow-hidden border border-[#1e293b] bg-[#020617] p-0">
  <div class="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2">
    <div class="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/20 bg-black/50 px-3 py-2 backdrop-blur-md">
      <span class="mr-2 text-xs text-slate-300">{t($locale, 'editor.help')}</span>
      <button class="rounded-md border border-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800" on:click={addTextLayer}>{t($locale, 'editor.addText')}</button>
      <button class="rounded-md border border-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800" on:click={addShapeLayer}>{t($locale, 'editor.addShape')}</button>
      <button class="rounded-md border border-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800" on:click={runTranslate}>Translate page</button>
      <button class="rounded-md border border-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800" on:click={runCleanPage}>Clean page</button>
      <button class="rounded-md border border-indigo-400/70 px-3 py-1 text-xs font-semibold text-indigo-100 hover:bg-indigo-500/20" on:click={toggleBackground}>Show {store.project?.showInpainted ? 'original' : 'cleaned'}</button>
      <button class="rounded-md border border-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800" on:click={() => fileInputEl?.click()}>{t($locale, 'editor.addImage')}</button>
      <button class="rounded-md border border-rose-500/60 px-3 py-1 text-xs font-semibold text-rose-200 hover:bg-rose-500/20" on:click={deleteSelection}>{t($locale, 'editor.remove')}</button>
      <input bind:this={fileInputEl} type="file" class="hidden" accept="image/*" on:change={uploadOverlayImage} />
    </div>
  </div>

  <div class="flex min-h-0 flex-1 overflow-auto p-5 pt-20">
    <div class="mx-auto h-fit w-fit rounded-2xl border border-[#334155] bg-[#0b1120] p-2 shadow-2xl">
      <canvas bind:this={canvasEl}></canvas>
    </div>
  </div>
</Card>
