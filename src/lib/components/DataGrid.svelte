<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';

  type TextRow = {
    id: string;
    originalText: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
  };

  export let store: any;
  export let pageId = 0;

  let rows: TextRow[] = [];
  let unsubscribe: undefined | (() => void);

  const loadRows = () => {
    const page = store?.pages?.[pageId];
    rows = (page?.textBoxes || []).map((item: any) => ({
      id: item.id,
      originalText: String(item.originalText || ''),
      text: String(item.text || ''),
      x: Number(item.geometry?.x || 0),
      y: Number(item.geometry?.y || 0),
      fontSize: Number(item.style?.fontSize || 0)
    }));
  };

  const updateItem = (id: string, key: 'text' | 'x' | 'y' | 'fontSize', value: string) => {
    if (key === 'text') store.syncGridToCanvas(id, { text: value });
    if (key === 'x' && !Number.isNaN(Number(value)))
      store.syncGridToCanvas(id, { geometry: { x: Number(value) } });
    if (key === 'y' && !Number.isNaN(Number(value)))
      store.syncGridToCanvas(id, { geometry: { y: Number(value) } });
    if (key === 'fontSize' && !Number.isNaN(Number(value)))
      store.syncGridToCanvas(id, { style: { fontSize: Number(value) } });
    loadRows();
  };

  const addRow = () => {
    store.syncCanvasToGrid({
      text: 'New text',
      originalText: 'New text',
      left: 60,
      top: 60,
      width: 260,
      height: 90,
      fontSize: 32,
      fill: '#ffffff',
      backgroundColor: 'rgba(15,23,42,0.65)'
    });
    store.notify();
    loadRows();
  };

  onMount(() => {
    loadRows();
    unsubscribe = store.onChange(loadRows);
  });

  $: if (store && typeof pageId === 'number') {
    loadRows();
  }

  onDestroy(() => {
    unsubscribe?.();
  });
</script>

<Card className="flex h-full min-h-0 flex-col overflow-hidden p-0">
  <div class="sticky top-0 flex items-center justify-between border-b border-[#2a3555] bg-[#0b1020] px-4 py-3">
    <h2 class="text-sm font-bold text-white">{t($locale, 'grid.title')}</h2>
    <div class="flex items-center gap-2">
      <span class="rounded-full bg-[#3730a3] px-3 py-1 text-xs font-semibold text-white">{rows.length} {t($locale, 'grid.items')}</span>
      <button class="rounded-md border border-[#334155] px-2 py-1 text-xs font-semibold text-white hover:bg-[#1e293b]" on:click={addRow}>{t($locale, 'grid.addRow')}</button>
    </div>
  </div>
  <div class="min-h-0 flex-1 overflow-auto">
    {#if rows.length === 0}
      <div class="p-4 text-xs text-slate-300">{t($locale, 'grid.empty')}</div>
    {:else}
      <table class="w-full border-collapse text-xs">
        <thead class="sticky top-0 bg-[#0f172a] text-slate-100">
          <tr class="border-b border-[#1e293b]">
            <th class="px-3 py-2 text-left">Original</th>
            <th class="px-3 py-2 text-left">Translated</th>
            <th class="px-3 py-2 text-left">X</th>
            <th class="px-3 py-2 text-left">Y</th>
            <th class="px-3 py-2 text-left">Font</th>
          </tr>
        </thead>
        <tbody>
          {#each rows as row, i}
            <tr class="border-b border-[#1e293b] transition-colors hover:bg-[#1e293b] {i % 2 === 0 ? 'bg-[#0b1020]' : 'bg-[#0f172a]'}">
              <td class="max-w-[170px] truncate px-3 py-2 text-slate-300">{row.originalText}</td>
              <td class="px-3 py-2">
                <Input className="h-8 border border-[#334155] bg-[#0f172a] text-xs text-white" value={row.text} on:input={(e) => updateItem(row.id, 'text', (e.target as HTMLInputElement).value)} />
              </td>
              <td class="px-3 py-2"><Input className="h-8 w-16 border border-[#334155] bg-[#0f172a] text-xs text-white" value={row.x} on:input={(e) => updateItem(row.id, 'x', (e.target as HTMLInputElement).value)} /></td>
              <td class="px-3 py-2"><Input className="h-8 w-16 border border-[#334155] bg-[#0f172a] text-xs text-white" value={row.y} on:input={(e) => updateItem(row.id, 'y', (e.target as HTMLInputElement).value)} /></td>
              <td class="px-3 py-2"><Input className="h-8 w-16 border border-[#334155] bg-[#0f172a] text-xs text-white" value={row.fontSize} on:input={(e) => updateItem(row.id, 'fontSize', (e.target as HTMLInputElement).value)} /></td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</Card>
