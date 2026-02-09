<script lang="ts">
  import { editorStore } from '$lib/stores/editorStore.svelte';
  import { notifications } from '$lib/services/notifications';
  import { Plus, Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-svelte';
  import PageDialog from './PageDialog.svelte';

  interface Props {
    currentPageId?: number;
  }

  let { currentPageId: _currentPageId = 0 }: Props = $props();

  let showPageDialog = $state(false);
  let editingPageId = $state<string | null>(null);

  let pages = $derived(editorStore.pages);
  let activePageId = $derived(editorStore.activePageId);

  function navigateToPage(index: number) {
    if (index >= 0 && index < pages.length) {
      editorStore.activePageId = index;
    }
  }

  function openAddPageDialog() {
    editingPageId = null;
    showPageDialog = true;
  }

  function openEditPageDialog(pageId: string) {
    editingPageId = pageId;
    showPageDialog = true;
  }

  function movePageUp(index: number) {
    if (index > 0) {
      editorStore.movePage(index, index - 1);
    }
  }

  function movePageDown(index: number) {
    if (index < pages.length - 1) {
      editorStore.movePage(index, index + 1);
    }
  }

  async function duplicatePage(pageId: string) {
    const duplicated = editorStore.duplicatePage(pageId);
    if (duplicated) {
      notifications.push({ type: 'success', title: 'Page duplicated', description: `${duplicated.name} has been created` });
    }
  }

  async function deletePage(pageId: string, index: number) {
    if (pages.length <= 1) {
      notifications.push({ type: 'error', title: 'Cannot delete', description: 'You need at least one page' });
      return;
    }

    if (confirm(`Are you sure you want to delete "${pages[index].name}"?`)) {
      const success = editorStore.deletePage(pageId);
      if (success) {
        notifications.push({ type: 'success', title: 'Page deleted', description: 'Page has been removed' });
      }
    }
  }

  function generatePageName(page: typeof pages[0], index: number): string {
    return page.name || `Page ${index + 1}`;
  }
</script>

<div class="flex h-full flex-col bg-[#eef1f5]">
  <div class="flex items-center justify-between border-b border-[#d9dde3] p-3">
    <h3 class="text-sm font-semibold text-[#2f343b]">Pages</h3>
    <button
      class="flex h-7 w-7 items-center justify-center rounded bg-[#e18e90] text-white transition-colors hover:bg-[#d97b7d]"
      onclick={openAddPageDialog}
      title="Add page"
    >
      <Plus class="h-4 w-4" />
    </button>
  </div>

  <div class="flex-1 overflow-y-auto p-2 space-y-1">
    {#each pages as page, index (page.id)}
      <div
        class="group flex w-full items-center justify-between rounded px-2 py-2 text-sm transition-colors {activePageId === index ? 'bg-white font-semibold text-[#21242a]' : 'text-[#555b66] hover:bg-[#f8f9fb]'}"
      >
        <button
          class="flex flex-1 items-center gap-2 text-left"
          onclick={() => navigateToPage(index)}
        >
          <span class="flex h-5 w-5 items-center justify-center rounded bg-[#e18e90] text-center text-xs font-medium text-white">
            {index + 1}
          </span>
          <span class="truncate">{generatePageName(page, index)}</span>
        </button>

        <div class="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 {activePageId === index ? 'opacity-100' : ''}">
          <button
            class="rounded p-1 hover:bg-gray-200"
            onclick={() => openEditPageDialog(page.id)}
            title="Edit page"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            class="rounded p-1 hover:bg-gray-200"
            onclick={() => duplicatePage(page.id)}
            title="Duplicate page"
          >
            <Copy class="h-3.5 w-3.5" />
          </button>
          <button
            class="rounded p-1 hover:bg-gray-200 disabled:opacity-30"
            onclick={() => movePageUp(index)}
            disabled={index === 0}
            title="Move up"
          >
            <ChevronUp class="h-3.5 w-3.5" />
          </button>
          <button
            class="rounded p-1 hover:bg-gray-200 disabled:opacity-30"
            onclick={() => movePageDown(index)}
            disabled={index === pages.length - 1}
            title="Move down"
          >
            <ChevronDown class="h-3.5 w-3.5" />
          </button>
          <button
            class="rounded p-1 text-red-500 hover:bg-red-100"
            onclick={() => deletePage(page.id, index)}
            title="Delete page"
          >
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    {/each}
  </div>

  <div class="border-t border-[#d9dde3] p-3 text-xs text-[#6b7280]">
    {pages.length} page{pages.length !== 1 ? 's' : ''}
  </div>
</div>

<PageDialog
  bind:open={showPageDialog}
  editPageId={editingPageId}
  onClose={() => showPageDialog = false}
/>
