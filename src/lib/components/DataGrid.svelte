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
  let unsubscribe: undefined | (() => void);
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let internalUpdate = false;

  const loadRows = () => {
    const page = store?.pages?.[pageId];
    if (!page) {
      rows = [];
      return;
    }

    rows = (page.objects || [])
      .filter((item: any) => item.type === 'i-text' || item.type === 'textbox' || item.type === 'text')
      .map((item: any) => ({
        id: item.id,
        text: String(item.text || ''),
        x: Number(item.left || 0),
        y: Number(item.top || 0)
      }));
  };

  const scheduleRowsReload = () => {
    if (internalUpdate) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadRows, 120);
  };

  const updateItem = (id: string, key: 'text' | 'x' | 'y', value: string) => {
    const page = store?.pages?.[pageId];
    if (!page) return;

    const item = (page.objects || []).find((obj: any) => obj.id === id);
    if (!item) return;

    internalUpdate = true;

    if (key === 'text') item.text = value;
    if (key === 'x' && !Number.isNaN(Number(value))) item.left = Number(value);
    if (key === 'y' && !Number.isNaN(Number(value))) item.top = Number(value);

    store.notify();
    loadRows();

    setTimeout(() => {
      internalUpdate = false;
    }, 0);
  };

  onMount(() => {
    loadRows();
    unsubscribe = store.onChange(scheduleRowsReload);
  });

  $: if (store && typeof pageId === 'number') {
    loadRows();
  }

  onDestroy(() => {
    unsubscribe?.();
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
