<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';

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

<Card className="flex h-full min-h-0 flex-col overflow-hidden p-0">
  <div class="flex items-center justify-between border-b border-[#E3D5AB] px-4 py-3">
    <h2 class="text-sm font-semibold text-[#4A351B]">{t($locale, 'grid.title')}</h2>
    <span class="rounded-full bg-white px-2 py-0.5 text-xs text-[#7A603A]">{rows.length} {t($locale, 'grid.items')}</span>
  </div>
  <div class="min-h-0 flex-1 overflow-auto px-2 pb-2">
    <table class="w-full border-collapse text-xs">
      <thead class="sticky top-0 bg-white text-[#7A603A] ">
        <tr>
          <th class="border-b border-[#E3D5AB] px-2 py-2 text-left font-medium">ID</th>
          <th class="border-b border-[#E3D5AB] px-2 py-2 text-left font-medium">Text</th>
          <th class="border-b border-[#E3D5AB] px-2 py-2 text-left font-medium">X</th>
          <th class="border-b border-[#E3D5AB] px-2 py-2 text-left font-medium">Y</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row}
          <tr class="align-top hover:bg-[#FCEFCB]">
            <td class="max-w-[90px] truncate border-b border-[#E3D5AB] px-2 py-2 font-mono text-[#7A603A]">{row.id}</td>
            <td class="border-b border-[#E3D5AB] px-2 py-2">
              <Input
                className="h-8 rounded-lg bg-white"
                value={row.text}
                on:input={(event) => updateItem(row.id, 'text', (event.target as HTMLInputElement).value)}
              />
            </td>
            <td class="border-b border-[#E3D5AB] px-2 py-2">
              <Input
                className="h-8 w-20 rounded-lg bg-white"
                value={row.x}
                on:input={(event) => updateItem(row.id, 'x', (event.target as HTMLInputElement).value)}
              />
            </td>
            <td class="border-b border-[#E3D5AB] px-2 py-2">
              <Input
                className="h-8 w-20 rounded-lg bg-white"
                value={row.y}
                on:input={(event) => updateItem(row.id, 'y', (event.target as HTMLInputElement).value)}
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Card>
