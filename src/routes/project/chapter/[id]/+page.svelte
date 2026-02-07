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
    pages: { id: string; name: string; width: number; height: number; objects: { id: string; type: string; [key: string]: unknown }[] }[];
  };

  type PageThumb = { id: string; index: number; name: string };

  let currentPageId = fabricStore.activePageId;
  let pageThumbs: PageThumb[] = [];
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

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

  onDestroy(() => {
    pageStateUnsubscribe();
    storeChangeUnsubscribe();
    if (saveTimer) clearTimeout(saveTimer);
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

    <div class="mt-4 flex flex-wrap gap-2 pt-4 border-t border-[#f0d2b8]">
      <Button on:click={createPage} className="h-10 rounded-lg bg-[#e18e90] hover:bg-[#d97b7d] text-white text-sm font-semibold px-4">{t($locale, 'chapter.newPage')}</Button>
      <Button variant="outline" on:click={addText} className="h-10 rounded-lg text-sm font-semibold px-4">{t($locale, 'chapter.addText')}</Button>
      <Button variant="outline" on:click={quickAdd} className="h-10 rounded-lg bg-[#f5c088] hover:bg-[#e6a844] text-[#160204] font-semibold text-sm px-4">{t($locale, 'chapter.quick')}</Button>
      <div class="ml-auto flex gap-2">
        <Button variant="outline" on:click={() => exportProjectZip(fabricStore)} className="h-10 rounded-lg text-sm font-semibold px-4">📦 {t($locale, 'chapter.exportZip')}</Button>
        <Button variant="outline" on:click={() => exportProjectPdf(fabricStore)} className="h-10 rounded-lg text-sm font-semibold px-4">📄 {t($locale, 'chapter.exportPdf')}</Button>
      </div>
    </div>
  </div>

  <main class="grid min-h-0 gap-5 lg:grid-cols-[240px_minmax(0,1fr)_380px]">
    <div class="min-h-0 overflow-hidden rounded-2xl border border-[#f1d2b8] bg-white shadow-elevation-1 flex flex-col">
      <div class="sticky top-0 bg-white border-b border-[#f0d2b8] px-4 py-3">
        <h2 class="text-sm font-semibold text-[#160204]">{t($locale, 'chapter.pages')}</h2>
        <p class="mt-1 text-xs text-[#5d3438]">{pageThumbs.length} {t($locale, 'chapter.pageCount')}</p>
      </div>
      <div class="flex-1 overflow-auto px-3 py-3">
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
              <span class="inline-block w-5 h-5 mr-2 rounded bg-[#e18e90] text-white text-xs text-center leading-5 font-bold">{page.index + 1}</span>
              {page.name}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <section class="min-h-0 overflow-hidden rounded-2xl border border-[#f1d2b8] bg-white shadow-elevation-1">
      <Editor store={fabricStore} pageId={currentPageId} />
    </section>

    <section class="min-h-0 overflow-hidden rounded-2xl border border-[#f1d2b8] bg-white shadow-elevation-1 flex flex-col">
      <DataGrid store={fabricStore} pageId={currentPageId} />
    </section>
  </main>
</div>
