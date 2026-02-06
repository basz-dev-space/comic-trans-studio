<script lang="ts">
  import { onDestroy } from 'svelte';
  import DataGrid from '$lib/components/DataGrid.svelte';
  import Editor from '$lib/components/Editor.svelte';
  import { Button } from '$lib/components/ui/button';
  import { activePageId, debouncedStoreChange, polotnoStore } from '$lib/services/polotno';
  import { exportProjectPdf, exportProjectZip } from '$lib/utils/export';

  type PageThumb = { id: string; index: number; name: string };

  let currentPageId = polotnoStore.activePageId;
  let pageThumbs: PageThumb[] = [];
  let changeTick = 0;

  const syncPageThumbs = () => {
    pageThumbs = polotnoStore.pages.map((page: any, index: number) => ({
      id: page.id,
      index,
      name: page.name || `Page ${index + 1}`
    }));
  };

  const activePageUnsubscribe = activePageId.subscribe((value) => {
    currentPageId = value;
    polotnoStore.activePageId = value;
  });

  const changeUnsubscribe = debouncedStoreChange.subscribe((value) => {
    changeTick = value;
  });

  $: if (changeTick >= 0) {
    currentPageId = polotnoStore.activePageId;
    activePageId.set(currentPageId);
    syncPageThumbs();
  }

  const createPage = () => {
    polotnoStore.addPage();
    activePageId.set(polotnoStore.pages.length - 1);
  };

  const addText = () => {
    const page = polotnoStore.pages[currentPageId];
    if (!page) return;

    page.addElement({
      type: 'text',
      text: 'New text',
      x: 80,
      y: 80,
      fontSize: 42,
      fill: 'black'
    });
  };

  const handleImageUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });

    const page = polotnoStore.pages[currentPageId];
    if (!page) return;

    page.addElement({
      type: 'image',
      src: dataUrl,
      x: 0,
      y: 0,
      width: 800,
      height: 1200
    });

    input.value = '';
  };

  const openProjectJson = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const text = await file.text();
    polotnoStore.loadJSON(JSON.parse(text));

    const nextPageId = Math.min(currentPageId, Math.max(polotnoStore.pages.length - 1, 0));
    activePageId.set(nextPageId);
    input.value = '';
  };

  onDestroy(() => {
    activePageUnsubscribe();
    changeUnsubscribe();
  });
</script>

<div class="h-full w-full overflow-hidden bg-slate-50">
  <header class="fixed left-0 top-0 z-20 flex h-14 w-full items-center justify-between border-b bg-white px-4">
    <div class="text-sm font-semibold">ComicTrans Studio</div>
    <div class="flex items-center gap-2">
      <Button on:click={createPage}>New Page</Button>
      <Button variant="outline" on:click={addText}>Add Text</Button>
      <label
        class="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-100"
      >
        Upload Image
        <input type="file" accept="image/*" class="hidden" on:change={handleImageUpload} />
      </label>
      <label
        class="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-100"
      >
        Open JSON
        <input type="file" accept="application/json" class="hidden" on:change={openProjectJson} />
      </label>
      <Button variant="outline" on:click={() => exportProjectZip(polotnoStore)}>Export ZIP</Button>
      <Button variant="outline" on:click={() => exportProjectPdf(polotnoStore)}>Export PDF</Button>
    </div>
  </header>

  <main
    class="grid h-full w-full overflow-hidden pt-14"
    style="grid-template-columns: 260px minmax(0, 1fr) 400px;"
  >
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
      <Editor store={polotnoStore} pageId={currentPageId} />
    </section>

    <section class="h-full overflow-hidden">
      <DataGrid store={polotnoStore} pageId={currentPageId} />
    </section>
  </main>
</div>
