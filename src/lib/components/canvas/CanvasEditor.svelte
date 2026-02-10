<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { editorStore } from '$lib/stores/editorStore.svelte';
  import { notifications } from '$lib/services/notifications';
  import { locale, t } from '$lib/i18n';
  import { ArrowLeft, ImagePlus, Type, FileText, Box, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import Editor from '$lib/components/Editor.svelte';
  import DataGrid from '$lib/components/DataGrid.svelte';
  import PropertiesPanel from '$lib/components/canvas/PropertiesPanel.svelte';
  import { exportProjectPdf, exportProjectZip } from '$lib/utils/export';

  interface Props {
    projectId?: string;
    chapterId?: string;
    chapterName?: string;
  }

  let { projectId = '', chapterId = '', chapterName = 'Untitled Chapter' }: Props = $props();

  let currentPageId = $state(0);
  let activeBottomTab: 'properties' | 'datagrid' = $state('datagrid');
  let showPagesPanel = $state(true);
  let showCanvasPanel = $state(true);
  let showBottomPanel = $state(true);
  let leftPanelWidth = $state(210);
  
  const minLeft = 160;
  const maxLeft = 300;

  let selectedTextBox = $derived(
    editorStore.selectedTextBoxId 
      ? editorStore.getTextBox(editorStore.selectedTextBoxId) 
      : null
  );

  // Subscribe to store changes
  $effect(() => {
    currentPageId = editorStore.activePageId;
  });

  const createPage = () => {
    editorStore.addPage();
  };

  const deletePage = (pageId: string) => {
    if (editorStore.pages.length <= 1) {
      notifications.push({ type: 'info', title: 'Cannot delete', description: 'At least one page is required' });
      return;
    }
    editorStore.deletePage(pageId);
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' 
      ? Math.max(0, index - 1) 
      : Math.min(editorStore.pages.length - 1, index + 1);
    if (newIndex !== index) {
      editorStore.movePage(index, newIndex);
    }
  };

  const togglePanel = (panel: 'pages' | 'canvas' | 'bottom') => {
    if (panel === 'pages') showPagesPanel = !showPagesPanel;
    if (panel === 'canvas') showCanvasPanel = !showCanvasPanel;
    if (panel === 'bottom') showBottomPanel = !showBottomPanel;

    if (!showPagesPanel && !showCanvasPanel) {
      showCanvasPanel = true;
      notifications.push({ type: 'info', title: 'Canvas kept open', description: 'At least one top panel stays visible.', timeoutMs: 1800 });
    }
  };

  let detachResizeListeners: (() => void) | undefined;

  const dragResize = (event: MouseEvent) => {
    event.preventDefault();
    detachResizeListeners?.();
    const startX = event.clientX;
    const initialLeft = leftPanelWidth;

    const onMove = (moveEvent: MouseEvent) => {
      leftPanelWidth = Math.min(maxLeft, Math.max(minLeft, initialLeft + (moveEvent.clientX - startX)));
    };

    const onUp = () => detachResizeListeners?.();

    detachResizeListeners = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      detachResizeListeners = undefined;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  onDestroy(() => {
    detachResizeListeners?.();
  });
</script>

<div class="flex h-full flex-col bg-[#f3f5f8]">
  <!-- Header -->
  <header class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
    <div class="flex items-center gap-3">
      <a href={`/project/${projectId}`} class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft class="h-5 w-5" />
      </a>
      <h1 class="text-lg font-semibold text-gray-900">{chapterName}</h1>
    </div>
    <div class="flex items-center gap-2 text-xs">
      <span class="rounded bg-gray-100 px-2 py-1 text-gray-600">
        {editorStore.pages.length} page{editorStore.pages.length !== 1 ? 's' : ''}
      </span>
    </div>
  </header>

  <!-- Toolbar -->
  <div class="border-b border-gray-200 bg-[#eef1f5] px-3 py-2">
    <div class="flex flex-wrap items-center gap-2">
      <Button onclick={createPage} className="h-8 rounded bg-white px-3 text-xs font-semibold text-gray-700">
        <Plus class="mr-1 h-3.5 w-3.5" /> {t($locale, 'chapter.newPage')}
      </Button>
      
      <div class="ml-auto flex gap-2">
        <Button variant="outline" onclick={() => exportProjectZip(editorStore)} className="h-8 rounded bg-white px-3 text-xs font-semibold text-gray-700">
          <Box class="mr-1 h-3.5 w-3.5" /> {t($locale, 'chapter.exportZip')}
        </Button>
        <Button variant="outline" onclick={() => exportProjectPdf(editorStore)} className="h-8 rounded bg-white px-3 text-xs font-semibold text-gray-700">
          <FileText class="mr-1 h-3.5 w-3.5" /> {t($locale, 'chapter.exportPdf')}
        </Button>
      </div>
    </div>
  </div>

  <!-- Panel Toggles -->
  <div class="border-b border-gray-200 bg-white px-3 py-2">
    <div class="flex flex-wrap gap-2">
      <button 
        class="inline-flex items-center gap-1 rounded bg-gray-50 px-2.5 py-1 text-xs hover:bg-gray-100"
        onclick={() => togglePanel('pages')}
      >
        {#if showPagesPanel}
          <ChevronUp class="h-3 w-3" /> Hide pages
        {:else}
          <ChevronDown class="h-3 w-3" /> Show pages
        {/if}
      </button>
      <button 
        class="inline-flex items-center gap-1 rounded bg-gray-50 px-2.5 py-1 text-xs hover:bg-gray-100"
        onclick={() => togglePanel('canvas')}
      >
        {#if showCanvasPanel}
          <ChevronUp class="h-3 w-3" /> Hide canvas
        {:else}
          <ChevronDown class="h-3 w-3" /> Show canvas
        {/if}
      </button>
      <button 
        class="inline-flex items-center gap-1 rounded bg-gray-50 px-2.5 py-1 text-xs hover:bg-gray-100"
        onclick={() => togglePanel('bottom')}
      >
        {#if showBottomPanel}
          <ChevronUp class="h-3 w-3" /> Hide datagrid
        {:else}
          <ChevronDown class="h-3 w-3" /> Show datagrid
        {/if}
      </button>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="flex flex-1 gap-0 overflow-hidden bg-[#eef1f5]">
    <!-- Pages Panel -->
    {#if showPagesPanel}
      <aside 
        class="flex flex-col overflow-hidden bg-[#eef1f5]"
        style={`width:${leftPanelWidth}px; flex-shrink: 0;`}
      >
        <div class="border-b border-[#d9dde3] p-3 text-sm font-semibold text-[#2f343b]">
          Pages
        </div>
        <div class="flex-1 space-y-1 overflow-y-auto p-2">
          {#each editorStore.pages as page, index (page.id)}
            <div class="flex w-full items-center justify-between rounded px-2 py-2 text-sm">
              <button 
                class={`flex flex-1 items-center gap-2 text-left ${currentPageId === index ? 'bg-white font-semibold text-[#21242a] shadow-sm' : 'text-[#555b66] hover:bg-[#f8f9fb]'}`}
                onclick={() => editorStore.activePageId = index}
              >
                <span class="h-5 w-5 rounded bg-white text-center text-xs leading-5">{index + 1}</span>
                <span class="truncate">{page.name}</span>
              </button>
              <div class="ml-2 flex items-center gap-1">
                <button 
                  class="rounded p-1 hover:bg-white disabled:opacity-30" 
                  onclick={() => movePage(index, 'up')}
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  <ChevronUp class="h-3 w-3" />
                </button>
                <button 
                  class="rounded p-1 hover:bg-white disabled:opacity-30" 
                  onclick={() => movePage(index, 'down')}
                  disabled={index === editorStore.pages.length - 1}
                  aria-label="Move down"
                >
                  <ChevronDown class="h-3 w-3" />
                </button>
                <button 
                  class="rounded p-1 text-red-500 hover:bg-red-50"
                  onclick={() => deletePage(page.id)}
                  aria-label="Delete page"
                >
                  <Trash2 class="h-3 w-3" />
                </button>
              </div>
            </div>
          {/each}
        </div>
      </aside>
    {/if}

    <!-- Resize Handle -->
    {#if showPagesPanel && showCanvasPanel}
      <button 
        class="flex w-2 cursor-col-resize items-center justify-center bg-[#d9dde3] hover:bg-[#c9ced7]"
        onmousedown={dragResize}
        aria-label="Resize pages panel"
      >
        <div class="h-full w-0.5 bg-[#c9ced7]"></div>
      </button>
    {/if}

    <!-- Canvas Area -->
    {#if showCanvasPanel}
      <section class="flex flex-1 flex-col overflow-hidden bg-[#ebedf1] p-4">
        <Editor store={editorStore} pageId={currentPageId} />
      </section>
    {/if}
  </div>

  <!-- Bottom Panel (DataGrid) -->
  {#if showBottomPanel}
    <section class="border-t border-gray-200 bg-[#f1f3f7]">
      <!-- Tabs -->
      <div class="flex border-b border-gray-200 bg-[#e9edf2] px-3">
        <button 
          class={`px-4 py-2 text-sm font-semibold transition-colors ${activeBottomTab === 'properties' ? 'border-b-2 border-indigo-500 bg-white text-indigo-700' : 'text-gray-600 hover:text-gray-800'}`}
          onclick={() => (activeBottomTab = 'properties')}
        >
          Properties
        </button>
        <button 
          class={`px-4 py-2 text-sm font-semibold transition-colors ${activeBottomTab === 'datagrid' ? 'border-b-2 border-indigo-500 bg-white text-indigo-700' : 'text-gray-600 hover:text-gray-800'}`}
          onclick={() => (activeBottomTab = 'datagrid')}
        >
          DataGrid
        </button>
      </div>
      
      <!-- Content -->
      <div class="h-[280px]">
        {#if activeBottomTab === 'properties'}
          <div class="h-full overflow-auto bg-white p-4">
            {#if selectedTextBox}
              <PropertiesPanel {selectedTextBox} />
            {:else}
              <div class="flex h-full items-center justify-center text-sm text-gray-500">
                <div class="text-center">
                  <Type class="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p class="font-semibold text-gray-700">No text box selected</p>
                  <p class="mt-1">Click on a text box in the canvas to edit its properties</p>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <DataGrid store={editorStore} pageId={currentPageId} />
        {/if}
      </div>
    </section>
  {/if}
</div>
