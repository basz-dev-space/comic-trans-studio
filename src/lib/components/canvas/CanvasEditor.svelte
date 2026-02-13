<script lang="ts">
  import { onDestroy } from 'svelte';
  import { editorStore } from '$lib/stores/editorStore.svelte';
  import { notifications } from '$lib/services/notifications';
  import { locale, t } from '$lib/i18n';
  import { ArrowLeft, Type, FileText, Box, ChevronUp, ChevronDown, Plus, PanelRightClose, PanelRightOpen } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import Editor from '$lib/components/Editor.svelte';
  import DataGrid from '$lib/components/DataGrid.svelte';
  import PropertiesPanel from '$lib/components/canvas/PropertiesPanel.svelte';
  import PagePanel from '$lib/components/canvas/PagePanel.svelte';
  import LayerPanel from '$lib/components/canvas/LayerPanel.svelte';
  import ExportDialog from '$lib/components/canvas/ExportDialog.svelte';

  interface Props {
    projectId?: string;
    chapterId?: string;
    chapterName?: string;
  }

  let { projectId = '', chapterId: _chapterId = '', chapterName = 'Untitled Chapter' }: Props = $props();

  let currentPageId = $state(0);
  let activeBottomTab: 'properties' | 'datagrid' = $state('datagrid');
  let showPagesPanel = $state(true);
  let showCanvasPanel = $state(true);
  let showBottomPanel = $state(true);
  let showLayersPanel = $state(true);
  let showExportDialog = $state(false);
  let exportDialogFormat = $state<'pdf' | 'zip' | 'png'>('pdf');
  let leftPanelWidth = $state(210);

  const minLeft = 160;
  const maxLeft = 300;

  let selectedTextBox = $derived(
    editorStore.selectedTextBoxId
      ? editorStore.getTextBox(editorStore.selectedTextBoxId)
      : null
  );

  // CanvasEditor intentionally renders Editor.svelte instead of CanvasViewport.svelte.
  // Editor is the active integration point used by the app shell.

  $effect(() => {
    currentPageId = editorStore.activePageId;
  });

  const createPage = () => {
    editorStore.addPage();
  };

  const openExportDialog = (format: 'pdf' | 'zip' | 'png') => {
    exportDialogFormat = format;
    showExportDialog = true;
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

  <div class="border-b border-gray-200 bg-[#eef1f5] px-3 py-2">
    <div class="flex flex-wrap items-center gap-2">
      <Button onclick={createPage} className="h-8 rounded bg-white px-3 text-xs font-semibold text-gray-700">
        <Plus class="mr-1 h-3.5 w-3.5" /> {t($locale, 'chapter.newPage')}
      </Button>

      <button
        class="inline-flex h-8 items-center gap-1 rounded bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100"
        onclick={() => (showLayersPanel = !showLayersPanel)}
      >
        {#if showLayersPanel}
          <PanelRightClose class="h-3.5 w-3.5" /> Hide layers
        {:else}
          <PanelRightOpen class="h-3.5 w-3.5" /> Show layers
        {/if}
      </button>

      <div class="ml-auto flex gap-2">
        <Button variant="outline" onclick={() => openExportDialog('zip')} className="h-8 rounded bg-white px-3 text-xs font-semibold text-gray-700">
          <Box class="mr-1 h-3.5 w-3.5" /> {t($locale, 'chapter.exportZip')}
        </Button>
        <Button variant="outline" onclick={() => openExportDialog('pdf')} className="h-8 rounded bg-white px-3 text-xs font-semibold text-gray-700">
          <FileText class="mr-1 h-3.5 w-3.5" /> {t($locale, 'chapter.exportPdf')}
        </Button>
      </div>
    </div>
  </div>

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

  <div class="flex flex-1 gap-0 overflow-hidden bg-[#eef1f5]">
    {#if showPagesPanel}
      <aside class="flex flex-col overflow-hidden bg-[#eef1f5]" style={`width:${leftPanelWidth}px; flex-shrink: 0;`}>
        <PagePanel currentPageId={currentPageId} />
      </aside>
    {/if}

    {#if showPagesPanel && showCanvasPanel}
      <button
        class="flex w-2 cursor-col-resize items-center justify-center bg-[#d9dde3] hover:bg-[#c9ced7]"
        onmousedown={dragResize}
        aria-label="Resize pages panel"
      >
        <div class="h-full w-0.5 bg-[#c9ced7]"></div>
      </button>
    {/if}

    {#if showCanvasPanel}
      <section class="flex flex-1 flex-col overflow-hidden bg-[#ebedf1] p-4">
        <Editor store={editorStore} pageId={currentPageId} />
      </section>
    {/if}

    {#if showLayersPanel}
      <aside class="w-72 border-l border-[#d9dde3] bg-[#eef1f5]">
        <LayerPanel currentPageId={currentPageId} />
      </aside>
    {/if}
  </div>

  {#if showBottomPanel}
    <section class="border-t border-gray-200 bg-[#f1f3f7]">
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

<ExportDialog open={showExportDialog} initialFormat={exportDialogFormat} onClose={() => (showExportDialog = false)} />
