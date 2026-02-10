<script lang="ts">
  import PropertiesPanel from './PropertiesPanel.svelte';
  import DataGrid from '$lib/components/DataGrid.svelte';
  import { editorStore } from '$lib/stores/editorStore.svelte';
  import type { TextBox } from '$lib/stores/editorStore.svelte';

  interface Props {
    selectedTextBox?: TextBox | null;
  }

  let { selectedTextBox = null }: Props = $props();

  let activeTab = $state<'properties' | 'datagrid'>('properties');
</script>

<div class="flex h-full flex-col bg-white">
  <div class="flex border-b border-gray-200">
    <button
      class="flex-1 py-2 text-sm font-medium transition-colors {activeTab === 'properties' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}"
      onclick={() => activeTab = 'properties'}
    >
      Properties
    </button>
    <button
      class="flex-1 py-2 text-sm font-medium transition-colors {activeTab === 'datagrid' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}"
      onclick={() => activeTab = 'datagrid'}
    >
      DataGrid
    </button>
  </div>

  <div class="flex-1 overflow-hidden">
    {#if activeTab === 'properties'}
      <PropertiesPanel {selectedTextBox} />
    {:else}
      <DataGrid store={editorStore} pageId={editorStore.activePageId} />
    {/if}
  </div>
</div>
