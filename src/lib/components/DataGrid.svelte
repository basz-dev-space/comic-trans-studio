<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  type TextRow = {
    id: string;
    text: string;
    x: number;
    y: number;
  };

  export let store: any;
  export let pageId = 0;

  let rows: TextRow[] = [];
  let changeUnsubscribe: undefined | (() => void);
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let internalUpdate = false;

  const loadRows = () => {
    if (!store?.pages?.[pageId]) {
      rows = [];
      return;
    }

    const page = store.pages[pageId];
    rows = page.children
      .filter((item: any) => item.type === 'text')
      .map((item: any) => ({
        id: item.id,
        text: item.text || '',
        x: Number(item.x || 0),
        y: Number(item.y || 0)
      }));
  };

  const scheduleRowsReload = () => {
    if (internalUpdate) return;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      loadRows();
    }, 100);
  };

  const updateItem = (id: string, key: 'text' | 'x' | 'y', value: string) => {
    const page = store?.pages?.[pageId];
    if (!page) return;

    const item = page.children.find((child: any) => child.id === id);
    if (!item) return;

    internalUpdate = true;
    if (key === 'text') {
      item.set({ text: value });
    } else {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        item.set({ [key]: parsed });
      }
    }

    loadRows();
    setTimeout(() => {
      internalUpdate = false;
    }, 0);
  };

  $: if (store && typeof pageId === 'number') {
    loadRows();
  }

  onMount(() => {
    if (!store) return;

    changeUnsubscribe = store.onChange(() => {
      scheduleRowsReload();
    });

    loadRows();
  });

  onDestroy(() => {
    if (changeUnsubscribe) changeUnsubscribe();
    if (debounceTimer) clearTimeout(debounceTimer);
  });
</script>

<div class="h-full overflow-hidden border-l bg-white">
  <div class="border-b px-4 py-3 text-sm font-semibold">Text Data Grid</div>
  <div class="h-[calc(100%-45px)] overflow-auto">
    <table class="w-full border-collapse text-xs">
      <thead class="sticky top-0 bg-slate-100">
        <tr>
          <th class="border-b px-2 py-2 text-left">ID</th>
          <th class="border-b px-2 py-2 text-left">Text</th>
          <th class="border-b px-2 py-2 text-left">X</th>
          <th class="border-b px-2 py-2 text-left">Y</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row}
          <tr class="align-top">
            <td class="max-w-[80px] truncate border-b px-2 py-2 font-mono">{row.id}</td>
            <td class="border-b px-2 py-2">
              <input
                class="w-full rounded border px-2 py-1"
                value={row.text}
                on:input={(event) => updateItem(row.id, 'text', (event.target as HTMLInputElement).value)}
              />
            </td>
            <td class="border-b px-2 py-2">
              <input
                class="w-20 rounded border px-2 py-1"
                value={row.x}
                on:input={(event) => updateItem(row.id, 'x', (event.target as HTMLInputElement).value)}
              />
            </td>
            <td class="border-b px-2 py-2">
              <input
                class="w-20 rounded border px-2 py-1"
                value={row.y}
                on:input={(event) => updateItem(row.id, 'y', (event.target as HTMLInputElement).value)}
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
