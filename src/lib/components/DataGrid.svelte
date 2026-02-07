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
    debounceTimer = setTimeout(loadRows, 30);
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

  const addRow = () => {
    const page = store?.pages?.[pageId];
    if (!page) return;

    if (!Array.isArray(page.objects)) {
      page.objects = [];
    }

    page.objects.push({
      id: `obj_${Math.random().toString(36).slice(2, 10)}`,
      type: 'i-text',
      text: 'New text',
      left: 60,
      top: 60,
      fontSize: 36,
      fill: '#111827'
    });

    store.notify();
    loadRows();
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
  <div class="sticky top-0 flex items-center justify-between border-b border-[#f0d2b8] bg-white px-4 py-3">
    <h2 class="text-sm font-bold text-[#160204]">{t($locale, 'grid.title')}</h2>
    <div class="flex items-center gap-2">
      <span class="rounded-full bg-[#f2bc56] px-3 py-1 text-xs font-semibold text-[#160204]">{rows.length} {t($locale, 'grid.items')}</span>
      <button class="rounded-md border border-[#f0d2b8] px-2 py-1 text-xs font-semibold text-[#160204] hover:bg-[#fff9fa]" on:click={addRow}>{t($locale, 'grid.addRow')}</button>
    </div>
  </div>
  <div class="min-h-0 flex-1 overflow-auto">
    {#if rows.length === 0}
      <div class="p-4 text-xs text-[#5d3438]">{t($locale, 'grid.empty')}</div>
    {:else}
      <table class="w-full border-collapse text-xs">
        <thead class="sticky top-0 bg-[#fff9fa] text-[#160204]">
          <tr class="border-b border-[#f0d2b8]">
            <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">ID</th>
            <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">Text</th>
            <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">X</th>
            <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">Y</th>
          </tr>
        </thead>
        <tbody>
          {#each rows as row, i}
            <tr class="border-b border-[#f0d2b8] transition-colors hover:bg-[#f5e8dd] {i % 2 === 0 ? 'bg-white' : 'bg-[#fff9fa]'}">
              <td class="max-w-[80px] truncate px-3 py-2 font-mono text-xs text-[#5d3438]">{row.id}</td>
              <td class="px-3 py-2">
                <Input
                  className="h-8 border border-[#f0d2b8] bg-white text-xs focus:border-[#e18e90]"
                  value={row.text}
                  on:input={(event) => updateItem(row.id, 'text', (event.target as HTMLInputElement).value)}
                />
              </td>
              <td class="px-3 py-2">
                <Input
                  className="h-8 w-16 border border-[#f0d2b8] bg-white text-xs focus:border-[#e18e90]"
                  value={row.x}
                  on:input={(event) => updateItem(row.id, 'x', (event.target as HTMLInputElement).value)}
                />
              </td>
              <td class="px-3 py-2">
                <Input
                  className="h-8 w-16 border border-[#f0d2b8] bg-white text-xs focus:border-[#e18e90]"
                  value={row.y}
                  on:input={(event) => updateItem(row.id, 'y', (event.target as HTMLInputElement).value)}
                />
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</Card>
