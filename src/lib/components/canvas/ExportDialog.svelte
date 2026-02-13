<script lang="ts">
  import { Dialog } from '$lib/components/ui/dialog';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import { editorStore } from '$lib/stores/editorStore.svelte';
  import { exportProjectPdf, exportProjectZip, exportProjectPng } from '$lib/utils/export';
  import { notifications } from '$lib/services/notifications';
  import { Download, FileText, Box, Image } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    onClose?: () => void;
    initialFormat?: 'pdf' | 'zip' | 'png';
  }

  let { open = $bindable(false), onClose = () => {}, initialFormat = 'pdf' }: Props = $props();

  let exportFormat: 'pdf' | 'zip' | 'png' = $state('pdf');
  let exportRange: 'all' | 'current' = $state('all');
  let exportQuality: 'low' | 'medium' | 'high' = $state('high');
  let fileName = $state('');
  let isExporting = $state(false);

  $effect(() => {
    fileName = editorStore.project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  });

  $effect(() => {
    if (open) {
      exportFormat = initialFormat;
    }
  });

  async function handleExport() {
    isExporting = true;
    try {
      const exportOptions = {
        fileName,
        exportRange,
        exportQuality
      };

      if (exportFormat === 'pdf') {
        await exportProjectPdf(editorStore, exportOptions);
        notifications.push({ type: 'success', title: 'PDF exported', description: 'Your project has been exported as PDF' });
      } else if (exportFormat === 'zip') {
        await exportProjectZip(editorStore, exportOptions);
        notifications.push({ type: 'success', title: 'ZIP exported', description: 'Your project has been exported as ZIP' });
      } else if (exportFormat === 'png') {
        // Use the proper PNG export function (ZIP of PNG images)
        await exportProjectPng(editorStore, exportOptions);
        notifications.push({ type: 'success', title: 'PNG exported', description: 'Individual page images exported as ZIP' });
      }
      onClose();
    } catch (error) {
      notifications.push({ type: 'error', title: 'Export failed', description: (error as Error).message });
    } finally {
      isExporting = false;
    }
  }

  const formats = [
    { id: 'pdf', label: 'PDF Document', description: 'Best for sharing and printing' },
    { id: 'zip', label: 'ZIP Archive', description: 'Includes JSON project file' },
    { id: 'png', label: 'PNG Images', description: 'Individual page images' }
  ];

  const qualityOptions = [
    { id: 'low', label: 'Low (72 DPI)', scale: 1 },
    { id: 'medium', label: 'Medium (150 DPI)', scale: 2 },
    { id: 'high', label: 'High (300 DPI)', scale: 4 }
  ];
</script>

<Dialog
  {open}
  {onClose}
  title="Export Project"
  description="Choose export format and options"
  className="max-w-lg"
>
  <div class="space-y-6">
    <div>
      <Label>File Name</Label>
      <Input
        bind:value={fileName}
        placeholder="Enter file name"
        className="mt-1"
      />
    </div>

    <div>
      <Label>Export Format</Label>
      <div class="mt-2 grid grid-cols-3 gap-2">
        {#each formats as format}
          <button
            class="flex flex-col items-center rounded-lg border-2 p-3 transition-colors {exportFormat === format.id ? 'border-[#e18e90] bg-[#fff2e3]' : 'border-gray-200 hover:border-gray-300'}"
            onclick={() => exportFormat = format.id as typeof exportFormat}
          >
            {#if format.id === 'pdf'}
              <FileText class="h-6 w-6 {exportFormat === format.id ? 'text-[#e18e90]' : 'text-gray-500'}" />
            {:else if format.id === 'zip'}
              <Box class="h-6 w-6 {exportFormat === format.id ? 'text-[#e18e90]' : 'text-gray-500'}" />
            {:else}
              <Image class="h-6 w-6 {exportFormat === format.id ? 'text-[#e18e90]' : 'text-gray-500'}" />
            {/if}
            <span class="mt-1 text-sm font-medium">{format.label}</span>
            <span class="text-xs text-gray-500">{format.description}</span>
          </button>
        {/each}
      </div>
    </div>

    <div>
      <Label>Page Range</Label>
      <div class="mt-2 flex gap-2">
        <button
          class="flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors {exportRange === 'all' ? 'border-[#e18e90] bg-[#fff2e3] text-[#e18e90]' : 'border-gray-200 hover:border-gray-300'}"
          onclick={() => exportRange = 'all'}
        >
          All Pages ({editorStore.pages.length})
        </button>
        <button
          class="flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors {exportRange === 'current' ? 'border-[#e18e90] bg-[#fff2e3] text-[#e18e90]' : 'border-gray-200 hover:border-gray-300'}"
          onclick={() => exportRange = 'current'}
        >
          Current Page Only
        </button>
      </div>
    </div>

    {#if exportFormat !== 'zip'}
      <div>
        <Label>Quality</Label>
        <div class="mt-2 flex gap-2">
          {#each qualityOptions as quality}
            <button
              class="flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors {exportQuality === quality.id ? 'border-[#e18e90] bg-[#fff2e3] text-[#e18e90]' : 'border-gray-200 hover:border-gray-300'}"
              onclick={() => exportQuality = quality.id as typeof exportQuality}
            >
              {quality.label}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#snippet footer()}
    <Button variant="ghost" onclick={onClose}>Cancel</Button>
    <Button onclick={handleExport} disabled={isExporting}>
      {#if isExporting}
        <svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Exporting...
      {:else}
        <Download class="mr-2 h-4 w-4" />
      {/if}
      Export {formats.find(f => f.id === exportFormat)?.label}
    </Button>
  {/snippet}
</Dialog>
