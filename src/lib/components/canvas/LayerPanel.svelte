<script lang="ts">
  import { editorStore, type TextBox } from '$lib/stores/editorStore.svelte';
  import { notifications } from '$lib/services/notifications';
  import { Trash2, Copy, ChevronUp, ChevronDown, Type } from 'lucide-svelte';

  interface Props {
    currentPageId?: number;
  }

  let { currentPageId = 0 }: Props = $props();

  let textBoxes = $derived(editorStore.pages[currentPageId]?.textBoxes || []);
  let selectedId = $derived(editorStore.selectedTextBoxId);

  function selectLayer(id: string) {
    editorStore.selectTextBox(id);
  }

  function moveLayerUp(index: number) {
    const boxes = [...textBoxes];
    if (index > 0) {
      [boxes[index - 1], boxes[index]] = [boxes[index], boxes[index - 1]];
      editorStore.updatePage(editorStore.pages[currentPageId].id, { textBoxes: boxes });
    }
  }

  function moveLayerDown(index: number) {
    const boxes = [...textBoxes];
    if (index < boxes.length - 1) {
      [boxes[index], boxes[index + 1]] = [boxes[index + 1], boxes[index]];
      editorStore.updatePage(editorStore.pages[currentPageId].id, { textBoxes: boxes });
    }
  }

  function duplicateLayer(id: string) {
    const box = textBoxes.find(tb => tb.id === id);
    if (box) {
      // Destructure to exclude id, letting addTextBox generate a new unique id
      const { id: _, ...boxWithoutId } = box;
      editorStore.addTextBox({
        ...boxWithoutId,
        geometry: {
          ...box.geometry,
          x: box.geometry.x + 10,
          y: box.geometry.y + 10
        }
      });
      notifications.push({ type: 'success', title: 'Layer duplicated' });
    }
  }

  function deleteLayer(id: string) {
    editorStore.removeTextBox(id);
    notifications.push({ type: 'success', title: 'Layer deleted' });
  }

  function getPreviewText(box: TextBox): string {
    return box.text.length > 15 ? box.text.substring(0, 15) + '...' : box.text;
  }
</script>

<div class="flex h-full flex-col bg-[#eef1f5]">
  <div class="border-b border-[#d9dde3] p-3">
    <h3 class="text-sm font-semibold text-[#2f343b]">Layers</h3>
  </div>

  <div class="flex-1 overflow-y-auto p-2 space-y-1">
    {#if textBoxes.length === 0}
      <div class="p-4 text-center text-sm text-gray-500">
        No text layers yet.<br />
        <span class="text-xs">Add text using the toolbar above.</span>
      </div>
    {:else}
      {#each textBoxes.toReversed() as box, index (box.id)}
        {@const actualIndex = textBoxes.length - 1 - index}
        <div
          class="group flex items-center justify-between rounded px-2 py-1.5 text-sm transition-colors {selectedId === box.id ? 'bg-white font-semibold text-[#21242a] shadow-sm' : 'text-[#555b66] hover:bg-[#f8f9fb]'}"
        >
          <button
            class="flex flex-1 items-center gap-2 text-left"
            onclick={() => selectLayer(box.id)}
          >
            <Type class="h-4 w-4 text-gray-400" />
            <span class="truncate">{getPreviewText(box)}</span>
          </button>

          <div class="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 {selectedId === box.id ? 'opacity-100' : ''}">
            <button
              class="rounded p-1 hover:bg-gray-200"
              onclick={() => duplicateLayer(box.id)}
              title="Duplicate"
            >
              <Copy class="h-3.5 w-3.5" />
            </button>
            <button
              class="rounded p-1 hover:bg-gray-200 disabled:opacity-30"
              onclick={() => moveLayerUp(actualIndex)}
              disabled={actualIndex === 0}
              title="Bring forward"
            >
              <ChevronUp class="h-3.5 w-3.5" />
            </button>
            <button
              class="rounded p-1 hover:bg-gray-200 disabled:opacity-30"
              onclick={() => moveLayerDown(actualIndex)}
              disabled={actualIndex === textBoxes.length - 1}
              title="Send backward"
            >
              <ChevronDown class="h-3.5 w-3.5" />
            </button>
            <button
              class="rounded p-1 text-red-500 hover:bg-red-100"
              onclick={() => deleteLayer(box.id)}
              title="Delete"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <div class="border-t border-[#d9dde3] p-3 text-xs text-[#6b7280]">
    {textBoxes.length} layer{textBoxes.length !== 1 ? 's' : ''}
  </div>
</div>
