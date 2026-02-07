<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import DataGrid from '$lib/components/DataGrid.svelte';
  import Editor from '$lib/components/Editor.svelte';
  import { Button } from '$lib/components/ui/button';
  import { activePageId, debouncedStoreChange, fabricStore } from '$lib/services/fabric';
  import { exportProjectPdf, exportProjectZip } from '$lib/utils/export';

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

  onDestroy(() => {
    pageStateUnsubscribe();
    storeChangeUnsubscribe();
    if (saveTimer) clearTimeout(saveTimer);
  });
</script>

<div class="h-full w-full overflow-hidden bg-slate-50">
  <header class="fixed left-0 top-0 z-20 flex h-14 w-full items-center justify-between border-b bg-white px-4">
    <div class="text-sm font-semibold">{data.chapterName}</div>
    <div class="flex items-center gap-2">
      <a class="rounded-md border px-3 py-2 text-sm" href={`/project/${data.projectId}`}>Back</a>
      <Button on:click={createPage}>New Page</Button>
      <Button variant="outline" on:click={addText}>Add Text</Button>
      <Button variant="outline" on:click={() => exportProjectZip(fabricStore)}>Export ZIP</Button>
      <Button variant="outline" on:click={() => exportProjectPdf(fabricStore)}>Export PDF</Button>
    </div>
  </header>

  <main class="grid h-full w-full overflow-hidden pt-14" style="grid-template-columns: 260px minmax(0, 1fr) 400px;">
    <aside class="h-full overflow-auto border-r bg-white">
      <div class="border-b px-4 py-3 text-sm font-semibold">Pages</div>
      <div class="space-y-2 p-3">
        {#each pageThumbs as page}
          <button
            class={`w-full rounded-md border p-3 text-left text-sm ${currentPageId === page.index ? 'border-slate-900 bg-slate-100' : 'border-slate-200'}`}
            on:click={() => activePageId.set(page.index)}
          >
            {page.name}
          </button>
        {/each}
      </div>
    </aside>

    <section class="h-full min-w-0 overflow-hidden">
      <Editor store={fabricStore} pageId={currentPageId} />
    </section>

    <section class="h-full overflow-hidden">
      <DataGrid store={fabricStore} pageId={currentPageId} />
    </section>
  </main>
</div>
