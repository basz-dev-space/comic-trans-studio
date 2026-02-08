<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';
  import { Search, ArrowUpDown, Trash2, Type, EyeOff, Filter, Group, PaintBucket, Share2 } from 'lucide-svelte';
  import { notifications } from '$lib/services/notifications';

  type TextRow = {
    id: string;
    originalText: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    lineHeight: number;
  };

  type SortKey = 'originalText' | 'text' | 'x' | 'y' | 'fontSize' | 'lineHeight';

  export let store: any;
  export let pageId = 0;

  let rows: TextRow[] = [];
  let unsubscribe: undefined | (() => void);
  let query = '';
  let sortKey: SortKey = 'y';
  let sortDirection: 'asc' | 'desc' = 'asc';
  let selectedIds = new Set<string>();
  let bulkFontSize = '36';

  const loadRows = () => {
    const page = store?.pages?.[pageId];
    rows = (page?.textBoxes || []).map((item: any) => ({
      id: item.id,
      originalText: String(item.originalText || ''),
      text: String(item.text || ''),
      x: Number(item.geometry?.x || 0),
      y: Number(item.geometry?.y || 0),
      fontSize: Number(item.style?.fontSize || 0),
      lineHeight: Number(item.style?.lineHeight || 1.2)
    }));

    selectedIds = new Set([...selectedIds].filter((id) => rows.some((row) => row.id === id)));
  };

  const updateItem = (id: string, key: 'text' | 'x' | 'y' | 'fontSize' | 'lineHeight', value: string) => {
    if (key === 'text') store.syncGridToCanvas(id, { text: value });
    if (key === 'x' && !Number.isNaN(Number(value))) store.syncGridToCanvas(id, { geometry: { x: Number(value) } });
    if (key === 'y' && !Number.isNaN(Number(value))) store.syncGridToCanvas(id, { geometry: { y: Number(value) } });
    if (key === 'fontSize' && !Number.isNaN(Number(value))) store.syncGridToCanvas(id, { style: { fontSize: Number(value) } });
    if (key === 'lineHeight' && !Number.isNaN(Number(value))) store.syncGridToCanvas(id, { style: { lineHeight: Number(value) } });
    loadRows();
  };

  const addRow = () => {
    store.syncCanvasToGrid({ text: 'New text', originalText: 'New text', left: 60, top: 60, width: 260, height: 90, fontSize: 32, fill: '#ffffff', backgroundColor: 'rgba(15,23,42,0.65)' });
    store.notify();
    loadRows();
  };

  const toggleSort = (nextKey: SortKey) => {
    if (sortKey === nextKey) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }
    sortKey = nextKey;
    sortDirection = 'asc';
  };

  const toggleSelection = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    selectedIds = next;
  };

  const selectAllVisible = (checked: boolean) => {
    selectedIds = checked ? new Set(filteredRows.map((row) => row.id)) : new Set<string>();
  };

  const deleteSelected = () => {
    if (!selectedIds.size) return;
    for (const id of selectedIds) store.removeTextBox(id);
    selectedIds = new Set<string>();
    loadRows();
    notifications.push({ type: 'success', title: 'Selected rows deleted', timeoutMs: 1600 });
  };

  const applyBulkFontSize = () => {
    const value = Number(bulkFontSize);
    if (Number.isNaN(value) || value < 6) {
      notifications.push({ type: 'error', title: 'Invalid font size', description: 'Use a value >= 6.' });
      return;
    }
    if (!selectedIds.size) {
      notifications.push({ type: 'info', title: 'No rows selected', description: 'Select rows first.' });
      return;
    }

    for (const id of selectedIds) store.syncGridToCanvas(id, { style: { fontSize: value } });
    loadRows();
    notifications.push({ type: 'success', title: `Applied font size ${value}`, timeoutMs: 1500 });
  };

  const isAllVisibleSelected = () => filteredRows.length > 0 && filteredRows.every((row) => selectedIds.has(row.id));

  const bySort = (a: TextRow, b: TextRow) => {
    const left = a[sortKey];
    const right = b[sortKey];
    if (typeof left === 'number' && typeof right === 'number') return sortDirection === 'asc' ? left - right : right - left;
    return sortDirection === 'asc' ? String(left).localeCompare(String(right)) : String(right).localeCompare(String(left));
  };

  $: filteredRows = rows
    .filter((row) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return row.originalText.toLowerCase().includes(q) || row.text.toLowerCase().includes(q);
    })
    .sort(bySort);

  onMount(() => {
    loadRows();
    unsubscribe = store.onChange(loadRows);
  });

  $: if (store && typeof pageId === 'number') loadRows();

  onDestroy(() => unsubscribe?.());
</script>

<div class="flex h-full min-h-0 flex-col overflow-hidden bg-[#eef1f5]">
  <div class="bg-[#f7f9fb] px-3 py-2">
    <div class="flex flex-wrap items-center gap-2 text-xs text-[#4e5663]">
      <button class="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-white"><EyeOff class="h-3.5 w-3.5" /> Hide fields</button>
      <button class="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-white"><Filter class="h-3.5 w-3.5" /> Filter</button>
      <button class="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-white"><Group class="h-3.5 w-3.5" /> Group</button>
      <button class="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-white"><ArrowUpDown class="h-3.5 w-3.5" /> Sort</button>
      <button class="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-white"><PaintBucket class="h-3.5 w-3.5" /> Color</button>
      <button class="ml-auto inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-white"><Share2 class="h-3.5 w-3.5" /> Share and sync</button>
    </div>
  </div>

  <div class="bg-white px-3 py-2">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm font-semibold text-[#2d3440]">{t($locale, 'grid.title')}</span>
      <span class="rounded bg-[#edf1f5] px-2 py-1 text-xs text-[#5b6370]">{filteredRows.length}/{rows.length}</span>
      <button class="ml-auto rounded bg-white px-2 py-1 text-xs" on:click={addRow}>{t($locale, 'grid.addRow')}</button>
    </div>

    <div class="mt-2 flex flex-wrap items-center gap-2">
      <label class="relative min-w-[220px] flex-1">
        <Search class="pointer-events-none absolute left-2 top-2 h-4 w-4 text-[#8a94a5]" />
        <Input className="h-8 border-[#ccd3dc] bg-[#f8fafc] pl-8 text-xs" value={query} on:input={(e) => (query = (e.target as HTMLInputElement).value)} placeholder="Search..." />
      </label>

      <div class="inline-flex items-center gap-1 rounded bg-white p-1">
        <Type class="h-3.5 w-3.5 text-[#656f7f]" />
        <Input className="h-6 w-14 border-0 px-1 text-xs" value={bulkFontSize} on:input={(e) => (bulkFontSize = (e.target as HTMLInputElement).value)} />
        <button class="rounded bg-[#f1f4f8] px-2 py-0.5 text-xs" on:click={applyBulkFontSize}>Apply</button>
      </div>

      <button class="rounded bg-white px-2 py-1 text-xs" on:click={() => selectAllVisible(!isAllVisibleSelected())}>{isAllVisibleSelected() ? 'Unselect all' : 'Select all'}</button>
      <button class="inline-flex items-center gap-1 rounded bg-[#fff6f6] px-2 py-1 text-xs text-[#9b1f2e] disabled:opacity-40" on:click={deleteSelected} disabled={!selectedIds.size}><Trash2 class="h-3.5 w-3.5" /> Delete ({selectedIds.size})</button>
    </div>
  </div>

  <div class="min-h-0 flex-1 overflow-auto bg-white">
    <table class="w-full border-collapse text-xs">
      <thead class="sticky top-0 z-10 bg-[#f7f9fc] text-[#49515f]">
        <tr class="border-b border-[#e5e9ef]">
          <th class="w-8 px-2 py-2 text-left"><input type="checkbox" checked={isAllVisibleSelected()} on:change={(e) => selectAllVisible((e.target as HTMLInputElement).checked)} /></th>
          {#each [
            { key: 'originalText', label: 'Original' },
            { key: 'text', label: 'Translated' },
            { key: 'x', label: 'X' },
            { key: 'y', label: 'Y' },
            { key: 'fontSize', label: 'Font' },
            { key: 'lineHeight', label: 'Line Height' }
          ] as column}
            <th class="px-3 py-2 text-left font-semibold">
              <button class="inline-flex items-center gap-1" on:click={() => toggleSort(column.key as SortKey)}>{column.label}<ArrowUpDown class="h-3 w-3" /></button>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if filteredRows.length === 0}
          <tr><td colspan="7" class="px-3 py-6 text-center text-[#7a8391]">{t($locale, 'grid.empty')}</td></tr>
        {:else}
          {#each filteredRows as row, i}
            <tr class={`border-b border-[#edf1f6] ${selectedIds.has(row.id) ? 'bg-[#f4f8ff]' : i % 2 === 0 ? 'bg-white' : 'bg-[#fbfcfe]'}`}>
              <td class="px-2 py-2"><input type="checkbox" checked={selectedIds.has(row.id)} on:change={(e) => toggleSelection(row.id, (e.target as HTMLInputElement).checked)} /></td>
              <td class="max-w-[180px] truncate px-3 py-2 text-[#586070]">{row.originalText}</td>
              <td class="px-3 py-2"><Input className="h-7 border border-[#d8dee7] bg-white text-xs" value={row.text} on:input={(e) => updateItem(row.id, 'text', (e.target as HTMLInputElement).value)} /></td>
              <td class="px-3 py-2"><Input className="h-7 w-16 border border-[#d8dee7] bg-white text-xs" value={row.x} on:input={(e) => updateItem(row.id, 'x', (e.target as HTMLInputElement).value)} /></td>
              <td class="px-3 py-2"><Input className="h-7 w-16 border border-[#d8dee7] bg-white text-xs" value={row.y} on:input={(e) => updateItem(row.id, 'y', (e.target as HTMLInputElement).value)} /></td>
              <td class="px-3 py-2"><Input className="h-7 w-16 border border-[#d8dee7] bg-white text-xs" value={row.fontSize} on:input={(e) => updateItem(row.id, 'fontSize', (e.target as HTMLInputElement).value)} /></td>
              <td class="px-3 py-2"><Input className="h-7 w-16 border border-[#d8dee7] bg-white text-xs" value={row.lineHeight} on:input={(e) => updateItem(row.id, 'lineHeight', (e.target as HTMLInputElement).value)} /></td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>
