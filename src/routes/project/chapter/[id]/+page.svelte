<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import DataGrid from '$lib/components/DataGrid.svelte';
  import Editor from '$lib/components/Editor.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
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

<div class="grid h-full min-h-[72vh] grid-rows-[auto_1fr] gap-4 pb-2">
  <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#5d3438]">{t($locale, 'chapter.badge')}</p>
      <div class="text-sm font-semibold text-[#160204]">{data.chapterName}</div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <a class="inline-flex h-10 items-center justify-center rounded-3xl border border-[#f0d2b8] bg-white px-4 text-sm font-medium text-[#160204] hover:bg-[#fff2e3]" href={`/project/${data.projectId}`}>{t($locale, 'chapter.back')}</a>
      <Button on:click={createPage} className="rounded-3xl">{t($locale, 'chapter.newPage')}</Button>
      <Button variant="outline" on:click={addText} className="rounded-3xl">{t($locale, 'chapter.addText')}</Button>
      <Button variant="outline" on:click={quickAdd} className="rounded-3xl bg-[#f5c088]">{t($locale, 'chapter.quick')}</Button>
      <Button variant="outline" on:click={() => exportProjectZip(fabricStore)} className="rounded-3xl">{t($locale, 'chapter.exportZip')}</Button>
      <Button variant="outline" on:click={() => exportProjectPdf(fabricStore)} className="rounded-3xl">{t($locale, 'chapter.exportPdf')}</Button>
    </div>
  </Card>

  <main class="grid min-h-0 gap-4 lg:grid-cols-[220px_minmax(0,1fr)_360px]">
    <Card className="min-h-0 overflow-auto p-3">
      <div class="mb-2 px-1 text-sm font-semibold text-[#5d3438]">{t($locale, 'chapter.pages')}</div>
      <div class="space-y-2">
        {#each pageThumbs as page}
          <button
            class={`w-full rounded-3xl border px-3 py-2 text-left text-sm font-medium transition ${
              currentPageId === page.index
                ? 'border-[#e18e90] bg-[#f5c088] text-[#160204]'
                : 'border-[#f0d2b8] bg-white text-[#5d3438] hover:border-[#e18e90] hover:bg-[#fff2e3]'
            }`}
            on:click={() => activePageId.set(page.index)}
          >
            {page.name}
          </button>
        {/each}
      </div>
    </Card>

    <section class="min-h-0 overflow-hidden">
      <Editor store={fabricStore} pageId={currentPageId} />
    </section>

    <section class="min-h-0 overflow-hidden">
      <DataGrid store={fabricStore} pageId={currentPageId} />
    </section>
  </main>
</div>
