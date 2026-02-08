<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import DataGrid from '$lib/components/DataGrid.svelte';
  import Editor from '$lib/components/Editor.svelte';
  import { Button } from '$lib/components/ui/button';
  import {
    Image as ImageIcon,
    FileText,
    Box,
    PanelLeftClose,
    PanelLeftOpen,
    PanelBottomClose,
    PanelBottomOpen,
    PanelTopClose,
    PanelTopOpen,
    House,
    Type,
    Component,
    Table
  } from 'lucide-svelte';
  import { activePageId, debouncedStoreChange, fabricStore } from '$lib/services/fabric';
  import { exportProjectPdf, exportProjectZip } from '$lib/utils/export';
  import JSZip from 'jszip';
  import { locale, t } from '$lib/i18n';
  import { notifications } from '$lib/services/notifications';
  import { withRetry, normalizeError } from '$lib/utils/async';

  export let data: {
    chapterId: string;
    chapterName: string;
    projectId: string;
    pages: { id: string; name: string; width: number; height: number; backgroundSrc?: string; objects: { id: string; type: string; [key: string]: unknown }[] }[];
  };

  type PageThumb = { id: string; index: number; name: string };
  let currentPageId = fabricStore.activePageId;
  let pageThumbs: PageThumb[] = [];
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let isSaving = false;
  let isDirty = false;
  let lastSavedAt: Date | null = null;
  let saveError = '';
  let saveAttempt = 0;

  let leftPanelWidth = 210;
  const minLeft = 160;
  const maxLeft = 300;

  let activeBottomTab: 'properties' | 'datagrid' = 'datagrid';
  let showPagesPanel = true;
  let showCanvasPanel = true;
  let showBottomPanel = true;

  let detachResizeListeners: undefined | (() => void);
  let importInputEl: HTMLInputElement;

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
      reader.readAsDataURL(file);
    });

  const loadImageSize = (src: string) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth || 900, height: image.naturalHeight || 1200 });
      image.onerror = () => reject(new Error('Unable to load image'));
      image.src = src;
    });

  const appendImagePage = async (src: string, name: string) => {
    const { width, height } = await loadImageSize(src);
    const nextPage = {
      id: `page_${Math.random().toString(36).slice(2, 10)}`,
      name,
      width,
      height,
      imageUrl: src,
      textBoxes: []
    };

    const firstPage = fabricStore.pages[0];
    const canReplaceFirst =
      fabricStore.pages.length === 1 &&
      !firstPage?.imageUrl &&
      (!Array.isArray(firstPage?.textBoxes) || firstPage.textBoxes.length === 0);

    if (canReplaceFirst) {
      fabricStore.pages[0] = { ...nextPage, name: firstPage?.name || name };
      return;
    }

    fabricStore.pages.push(nextPage);
  };

  const importImageFiles = async (files: File[]) => {
    for (const file of files) {
      const src = await readFileAsDataUrl(file);
      await appendImagePage(src, file.name || `Page ${fabricStore.pages.length + 1}`);
    }
  };

  const importZipAsPages = async (file: File) => {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const imageEntries = Object.values(zip.files).filter((entry) => !entry.dir && /\.(png|jpe?g|webp)$/i.test(entry.name));

    for (const entry of imageEntries) {
      const blob = await entry.async('blob');
      const src = await readFileAsDataUrl(new File([blob], entry.name, { type: blob.type || 'image/png' }));
      await appendImagePage(src, entry.name.split('/').pop() || `Page ${fabricStore.pages.length + 1}`);
    }
  };

  const renderPdfPage = async (pdfPage: any) => {
    const viewport = pdfPage.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return '';

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await pdfPage.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL('image/png');
  };

  const importPdfAsPages = async (file: File) => {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer(), disableWorker: true } as any);
    const pdf = await loadingTask.promise;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const pdfPage = await pdf.getPage(pageNum);
      const src = await renderPdfPage(pdfPage);
      if (!src) continue;
      await appendImagePage(src, `${file.name}-p${pageNum}`);
    }
  };

  const handleImportFiles = async (event: Event) => {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    if (!files.length) return;

    for (const file of files) {
      if (file.type.startsWith('image/')) await importImageFiles([file]);
      else if (/\.zip$/i.test(file.name)) await importZipAsPages(file);
      else if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) await importPdfAsPages(file);
    }

    activePageId.set(Math.max(0, fabricStore.pages.length - 1));
    fabricStore.notify();
    (event.target as HTMLInputElement).value = '';
  };

  onMount(() => {
    const mappedPages = data.pages.map((page, index) => ({
      id: page.id,
      name: page.name || `Page ${index + 1}`,
      width: page.width,
      height: page.height,
      imageUrl: page.backgroundSrc,
      textBoxes: (page.objects || [])
        .filter((obj: any) => obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text')
        .map((obj: any) => ({
          id: String(obj.id || crypto.randomUUID()),
          text: String(obj.text || ''),
          originalText: String(obj.text || ''),
          geometry: {
            x: Number(obj.left || 60),
            y: Number(obj.top || 60),
            w: Math.max(20, Number(obj.width || 280)),
            h: Math.max(20, Number(obj.height || 90)),
            rotation: Number(obj.angle || 0)
          },
          style: {
            fontSize: Number(obj.fontSize || 32),
            fontFamily: String(obj.fontFamily || 'Inter'),
            color: String(obj.fill || '#ffffff'),
            bgColor: null,
            bubbleShape: 'rounded',
            lineHeight: Number(obj.lineHeight || 1.2)
          }
        }))
    }));

    fabricStore.loadProject({
      id: data.chapterId,
      name: data.chapterName,
      metadata: {},
      pages: mappedPages,
      activePageId: 0,
      selectedTextBoxId: null,
      showInpainted: true
    });
    activePageId.set(0);
    syncPageThumbs();
  });

  const syncPageThumbs = () => {
    pageThumbs = fabricStore.pages.map((page: any, index: number) => ({
      id: page.id,
      index,
      name: page.name || `Page ${index + 1}`
    }));
  };

  const saveChapter = () => {
    if (saveTimer) clearTimeout(saveTimer);
    isDirty = true;
    saveTimer = setTimeout(async () => {
      isSaving = true;
      saveError = '';

      try {
        await withRetry(async () => {
          const response = await fetch(`/api/project/${data.projectId}/save`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              chapterId: data.chapterId,
              pages: fabricStore.pages.map((page: any) => ({
                id: page.id,
                name: page.name,
                width: page.width,
                height: page.height,
                backgroundSrc: page.imageUrl,
                objects: page.textBoxes.map((box: any) => ({
                  id: box.id,
                  type: 'i-text',
                  text: box.text,
                  left: box.geometry.x,
                  top: box.geometry.y,
                  width: box.geometry.w,
                  height: box.geometry.h,
                  angle: box.geometry.rotation,
                  fontSize: box.style.fontSize,
                  fontFamily: box.style.fontFamily,
                  fill: box.style.color,
                  lineHeight: box.style.lineHeight
                }))
              }))
            })
          });
          if (!response.ok) throw new Error(`Save failed (${response.status})`);
        }, { retries: 2, delayMs: 350 });

        saveAttempt += 1;
        lastSavedAt = new Date();
        isDirty = false;
        if (saveAttempt === 1 || saveAttempt % 5 === 0) {
          notifications.push({ type: 'success', title: t($locale, 'chapter.saveSuccess'), timeoutMs: 1800 });
        }
      } catch (error) {
        const normalized = normalizeError(error, t($locale, 'chapter.saveFailed'));
        saveError = normalized.message;
        notifications.push({ type: 'error', title: t($locale, 'chapter.saveFailed'), description: normalized.message, timeoutMs: 3600 });
      } finally {
        isSaving = false;
      }
    }, 450);
  };

  const pageStateUnsubscribe = activePageId.subscribe((value) => {
    currentPageId = value;
    fabricStore.activePageId = value;
    syncPageThumbs();
  });

  const storeChangeUnsubscribe = debouncedStoreChange.subscribe(() => {
    currentPageId = fabricStore.activePageId;
    syncPageThumbs();
    saveChapter();
  });

  const createPage = () => {
    fabricStore.addPage();
    activePageId.set(fabricStore.activePageId);
  };

  const addText = () => {
    const page = fabricStore.pages[currentPageId];
    if (!page) return;
    fabricStore.syncCanvasToGrid({ text: 'New text', originalText: 'New text', left: 80, top: 80, width: 260, height: 90, fontSize: 42, fill: '#ffffff', backgroundColor: 'rgba(15,23,42,0.65)' });
    fabricStore.notify();
  };

  const quickAdd = () => {
    createPage();
    addText();
  };

  const togglePanel = (panel: 'pages' | 'canvas' | 'bottom') => {
    if (panel === 'pages') showPagesPanel = !showPagesPanel;
    if (panel === 'canvas') showCanvasPanel = !showCanvasPanel;
    if (panel === 'bottom') showBottomPanel = !showBottomPanel;

    if (!showPagesPanel && !showCanvasPanel) {
      showCanvasPanel = true;
      notifications.push({ type: 'info', title: 'Canvas kept open', description: 'At least one top panel stays visible.', timeoutMs: 1800 });
    }
  };

  const dragResize = (event: MouseEvent) => {
    event.preventDefault();
    detachResizeListeners?.();
    const startX = event.clientX;
    const initialLeft = leftPanelWidth;

    const onMove = (moveEvent: MouseEvent) => {
      leftPanelWidth = Math.min(maxLeft, Math.max(minLeft, initialLeft + (moveEvent.clientX - startX)));
    };

    const onUp = () => detachResizeListeners?.();

    detachResizeListeners = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      detachResizeListeners = undefined;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  onDestroy(() => {
    pageStateUnsubscribe();
    storeChangeUnsubscribe();
    if (saveTimer) clearTimeout(saveTimer);
    detachResizeListeners?.();
  });
</script>

<div class="rounded-xl bg-[#f3f5f8]">
  <div class="px-4 py-2">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm font-semibold text-[#2e3137]">{data.chapterName}</span>
      <div class="ml-auto flex items-center gap-2 text-xs">
        <span class="rounded bg-white px-2 py-1 text-[#4a4e57]">{isSaving ? t($locale, 'chapter.saveSaving') : saveError ? t($locale, 'chapter.saveError') : isDirty ? t($locale, 'chapter.savePending') : t($locale, 'chapter.saveSaved')}</span>
        {#if lastSavedAt}<span class="text-[#6b7280]">{lastSavedAt.toLocaleTimeString()}</span>{/if}
        <a class="rounded bg-white px-3 py-1 font-semibold text-[#444]" href={`/project/${data.projectId}`}>Back</a>
      </div>
    </div>
  </div>

  <div class="bg-[#eef1f5] px-3 py-2">
    <div class="flex flex-wrap items-center gap-2">
      <button class="inline-flex items-center gap-1 rounded bg-white px-3 py-1.5 text-sm font-semibold text-[#2f343b]"><House class="h-4 w-4" /> Menu</button>
      <button class="inline-flex items-center gap-1 rounded bg-white px-3 py-1.5 text-sm font-semibold text-[#2f343b]"><Type class="h-4 w-4" /> Text</button>
      <button class="inline-flex items-center gap-1 rounded bg-white px-3 py-1.5 text-sm font-semibold text-[#2f343b]"><Component class="h-4 w-4" /> Component</button>
      <button class="inline-flex items-center gap-1 rounded bg-white px-3 py-1.5 text-sm font-semibold text-[#2f343b]"><Table class="h-4 w-4" /> DataGrid</button>

      <div class="ml-auto flex gap-2">
        <Button on:click={createPage} className="h-8 rounded bg-white px-3 text-xs font-semibold text-[#2f343b]">{t($locale, 'chapter.newPage')}</Button>
        <Button variant="outline" on:click={addText} className="h-8 rounded bg-white px-3 text-xs font-semibold text-[#2f343b]">{t($locale, 'chapter.addText')}</Button>
        <Button variant="outline" on:click={quickAdd} className="h-8 rounded bg-white px-3 text-xs font-semibold text-[#2f343b]">{t($locale, 'chapter.quick')}</Button>
        <Button variant="outline" on:click={() => importInputEl?.click()} className="h-8 rounded bg-white px-3 text-xs font-semibold text-[#2f343b]"><ImageIcon class="mr-1 h-3.5 w-3.5" /> {t($locale, 'chapter.importPages')}</Button>
        <Button variant="outline" on:click={() => exportProjectZip(fabricStore)} className="h-8 rounded bg-white px-3 text-xs font-semibold text-[#2f343b]"><Box class="mr-1 h-3.5 w-3.5" /> {t($locale, 'chapter.exportZip')}</Button>
        <Button variant="outline" on:click={() => exportProjectPdf(fabricStore)} className="h-8 rounded bg-white px-3 text-xs font-semibold text-[#2f343b]"><FileText class="mr-1 h-3.5 w-3.5" /> {t($locale, 'chapter.exportPdf')}</Button>
      </div>
      <input bind:this={importInputEl} type="file" class="hidden" accept="image/*,.zip,.pdf,application/pdf" multiple on:change={handleImportFiles} />
    </div>
  </div>

  <div class="bg-white px-3 py-2">
    <div class="flex flex-wrap gap-2">
      <button class="inline-flex items-center gap-1 rounded bg-[#f8f9fb] px-2.5 py-1 text-xs" on:click={() => togglePanel('pages')}>{#if showPagesPanel}<PanelLeftClose class="h-3 w-3" />Hide pages{:else}<PanelLeftOpen class="h-3 w-3" />Show pages{/if}</button>
      <button class="inline-flex items-center gap-1 rounded bg-[#f8f9fb] px-2.5 py-1 text-xs" on:click={() => togglePanel('canvas')}>{#if showCanvasPanel}<PanelTopClose class="h-3 w-3" />Hide canvas{:else}<PanelTopOpen class="h-3 w-3" />Show canvas{/if}</button>
      <button class="inline-flex items-center gap-1 rounded bg-[#f8f9fb] px-2.5 py-1 text-xs" on:click={() => togglePanel('bottom')}>{#if showBottomPanel}<PanelBottomClose class="h-3 w-3" />Hide datagrid{:else}<PanelBottomOpen class="h-3 w-3" />Show datagrid{/if}</button>
    </div>
  </div>

  <div class="flex h-[calc(100vh-280px)] gap-0 bg-[#eef1f5]">
    {#if showPagesPanel}
      <aside class="flex flex-col bg-[#eef1f5] overflow-hidden" style={`width:${leftPanelWidth}px; flex-shrink: 0;`}>
        <div class="border-b border-[#d9dde3] p-3 text-sm font-semibold text-[#2f343b]">Pages</div>
        <div class="flex-1 space-y-1 overflow-y-auto p-2">
          {#each pageThumbs as page}
            <div class="flex w-full items-center justify-between rounded px-2 py-2 text-sm">
              <button class={`flex items-center gap-2 text-left ${currentPageId === page.index ? 'bg-white font-semibold text-[#21242a]' : 'text-[#555b66] hover:bg-[#f8f9fb]'}`} on:click={() => activePageId.set(page.index)}>
                <span class="h-5 w-5 rounded bg-white text-center text-xs leading-5">{page.index + 1}</span>
                <span class="truncate">{page.name}</span>
              </button>
              <div class="ml-2 flex items-center gap-1">
                <button class="rounded p-1 hover:bg-white" on:click={() => fabricStore.movePage(page.index, Math.max(0, page.index - 1))} aria-label="Move up">▲</button>
                <button class="rounded p-1 hover:bg-white" on:click={() => fabricStore.movePage(page.index, Math.min(fabricStore.pages.length - 1, page.index + 1))} aria-label="Move down">▼</button>
              </div>
            </div>
          {/each}
        </div>
      </aside>
    {/if}

    {#if showPagesPanel && showCanvasPanel}
      <button class="w-2 cursor-col-resize items-center justify-center bg-[#d9dde3] hover:bg-[#c9ced7] flex" on:mousedown={dragResize} aria-label="Resize pages panel">
        <div class="h-full w-0.5 bg-[#c9ced7]"></div>
      </button>
    {/if}

    {#if showCanvasPanel}
      <section class="flex-1 bg-[#ebedf1] p-4 overflow-hidden">
        <Editor store={fabricStore} pageId={currentPageId} />
      </section>
    {/if}
  </div>

  {#if showBottomPanel}
    <section class="bg-[#f1f3f7]">
      <div class="flex bg-[#e9edf2] px-3 py-2 text-sm">
        <button class={`rounded px-3 py-1 font-semibold ${activeBottomTab === 'properties' ? 'bg-white text-[#1f242b]' : 'text-[#636a75]'}`} on:click={() => (activeBottomTab = 'properties')}>Properties</button>
        <button class={`rounded px-3 py-1 font-semibold ${activeBottomTab === 'datagrid' ? 'bg-white text-[#1f242b]' : 'text-[#636a75]'}`} on:click={() => (activeBottomTab = 'datagrid')}>DataGrid</button>
      </div>
      {#if activeBottomTab === 'properties'}
        <div class="p-4 text-sm text-[#4f5560]">
          <p class="mb-2 font-semibold text-[#242a31]">{t($locale, 'chapter.propertiesHintTitle')}</p>
          <p>{t($locale, 'chapter.propertiesHint')}</p>
        </div>
      {:else}
        <div class="h-[340px]">
          <DataGrid store={fabricStore} pageId={currentPageId} />
        </div>
      {/if}
    </section>
  {/if}
</div>
