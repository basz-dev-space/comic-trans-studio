<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import DataGrid from '$lib/components/DataGrid.svelte';
  import Editor from '$lib/components/Editor.svelte';
  import { Button } from '$lib/components/ui/button';
  import { activePageId, debouncedStoreChange, fabricStore } from '$lib/services/fabric';
  import { exportProjectPdf, exportProjectZip } from '$lib/utils/export';
  import { locale, t } from '$lib/i18n';

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

  let leftPanelWidth = 240;
  let rightPanelWidth = 380;
  const minLeft = 180;
  const maxLeft = 420;
  const minRight = 300;
  const maxRight = 520;

  let activeRightTab: 'properties' | 'datagrid' = 'datagrid';

  let detachResizeListeners: undefined | (() => void);

  onMount(() => {
    fabricStore.loadJSON({ pages: data.pages, activePageId: 0 });
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
    saveTimer = setTimeout(async () => {
      await fetch(`/api/project/${data.projectId}/save`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chapterId: data.chapterId, pages: fabricStore.pages })
      });
    }, 400);
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

    page.objects.push({
      id: `obj_${Math.random().toString(36).slice(2, 10)}`,
      type: 'i-text',
      text: 'New text',
      left: 80,
      top: 80,
      fontSize: 42,
      fill: '#111827'
    });

    fabricStore.notify();
  };

  const quickAdd = () => {
    createPage();
    addText();
  };

  const dragResize = (side: 'left' | 'right', event: MouseEvent) => {
    event.preventDefault();
    detachResizeListeners?.();

    const startX = event.clientX;
    const initialLeft = leftPanelWidth;
    const initialRight = rightPanelWidth;

    const onMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;

      if (side === 'left') {
        leftPanelWidth = Math.min(maxLeft, Math.max(minLeft, initialLeft + delta));
        return;
      }

      rightPanelWidth = Math.min(maxRight, Math.max(minRight, initialRight - delta));
    };

    const onUp = () => {
      detachResizeListeners?.();
    };

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

<div class="grid h-full min-h-[80vh] grid-rows-[auto_1fr] gap-5 pb-3">
  <div class="rounded-2xl border border-[#f1d2b8] bg-white p-4 shadow-elevation-1 sm:p-5">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="badge-label">{t($locale, 'chapter.badge')}</p>
        <h1 class="text-heading-lg mt-2 text-[#160204]">{data.chapterName}</h1>
      </div>
      <a class="inline-flex h-10 items-center justify-center gap-1 rounded-full border-2 border-[#e18e90] bg-white px-5 text-sm font-semibold text-[#e18e90] transition-all hover:bg-[#f5e8dd]" href={`/project/${data.projectId}`}>← {t($locale, 'chapter.back')}</a>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 border-t border-[#f0d2b8] pt-4">
      <Button on:click={createPage} className="h-10 rounded-lg bg-[#e18e90] px-4 text-sm font-semibold text-white hover:bg-[#d97b7d]">{t($locale, 'chapter.newPage')}</Button>
      <Button variant="outline" on:click={addText} className="h-10 rounded-lg px-4 text-sm font-semibold">{t($locale, 'chapter.addText')}</Button>
      <Button variant="outline" on:click={quickAdd} className="h-10 rounded-lg bg-[#f5c088] px-4 text-sm font-semibold text-[#160204] hover:bg-[#e6a844]">{t($locale, 'chapter.quick')}</Button>
      <div class="ml-auto flex gap-2">
        <Button variant="outline" on:click={() => exportProjectZip(fabricStore)} className="h-10 rounded-lg px-4 text-sm font-semibold">📦 {t($locale, 'chapter.exportZip')}</Button>
        <Button variant="outline" on:click={() => exportProjectPdf(fabricStore)} className="h-10 rounded-lg px-4 text-sm font-semibold">📄 {t($locale, 'chapter.exportPdf')}</Button>
      </div>
    </div>
  </div>

  <main class="flex min-h-0 gap-2 overflow-hidden">
    <section class="min-h-0 overflow-hidden rounded-2xl border border-[#f1d2b8] bg-white shadow-elevation-1" style={`width:${leftPanelWidth}px`}>
      <div class="sticky top-0 border-b border-[#f0d2b8] bg-white px-4 py-3">
        <h2 class="text-sm font-semibold text-[#160204]">{t($locale, 'chapter.pages')}</h2>
        <p class="mt-1 text-xs text-[#5d3438]">{pageThumbs.length} {t($locale, 'chapter.pageCount')}</p>
      </div>
      <div class="h-[calc(100%-65px)] overflow-auto px-3 py-3">
        <div class="space-y-2">
          {#each pageThumbs as page}
            <button
              class={`w-full rounded-lg border-2 px-3 py-2 text-left text-sm font-medium transition-all ${
                currentPageId === page.index
                  ? 'border-[#e18e90] bg-[#f5c088] text-[#160204] shadow-elevation-1'
                  : 'border-[#f0d2b8] bg-[#fff9fa] text-[#5d3438] hover:border-[#e18e90] hover:bg-white'
              }`}
              on:click={() => activePageId.set(page.index)}
            >
              <span class="mr-2 inline-block h-5 w-5 rounded bg-[#e18e90] text-center text-xs font-bold leading-5 text-white">{page.index + 1}</span>
              {page.name}
            </button>
          {/each}
        </div>
      </div>
    </section>

    <button class="flex w-2 cursor-col-resize items-center justify-center" aria-label="Resize left panel" on:mousedown={(event) => dragResize('left', event)}>
      <div class="h-16 w-1 rounded-full bg-[#e9d4b8]"></div>
    </button>

    <section class="min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#f1d2b8] bg-white shadow-elevation-1">
      <Editor store={fabricStore} pageId={currentPageId} />
    </section>

    <button class="flex w-2 cursor-col-resize items-center justify-center" aria-label="Resize right panel" on:mousedown={(event) => dragResize('right', event)}>
      <div class="h-16 w-1 rounded-full bg-[#e9d4b8]"></div>
    </button>

    <aside class="min-h-0 overflow-hidden rounded-2xl border border-[#f1d2b8] bg-white shadow-elevation-1" style={`width:${rightPanelWidth}px`}>
      <div class="flex border-b border-[#f0d2b8] p-2">
        <button class={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${activeRightTab === 'properties' ? 'bg-[#f5e8dd] text-[#160204]' : 'text-[#5d3438]'}`} on:click={() => (activeRightTab = 'properties')}>{t($locale, 'chapter.properties')}</button>
        <button class={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${activeRightTab === 'datagrid' ? 'bg-[#f5e8dd] text-[#160204]' : 'text-[#5d3438]'}`} on:click={() => (activeRightTab = 'datagrid')}>{t($locale, 'chapter.datagrid')}</button>
      </div>

      {#if activeRightTab === 'properties'}
        <div class="space-y-3 p-4 text-sm text-[#5d3438]">
          <p class="font-semibold text-[#160204]">{t($locale, 'chapter.propertiesHintTitle')}</p>
          <p>{t($locale, 'chapter.propertiesHint')}</p>
          <ul class="list-disc space-y-1 pl-5 text-xs">
            <li>{t($locale, 'chapter.propertiesHintA')}</li>
            <li>{t($locale, 'chapter.propertiesHintB')}</li>
            <li>{t($locale, 'chapter.propertiesHintC')}</li>
          </ul>
        </div>
      {:else}
        <div class="h-[calc(100%-58px)]">
          <DataGrid store={fabricStore} pageId={currentPageId} />
        </div>
      {/if}
    </aside>
  </main>
</div>
