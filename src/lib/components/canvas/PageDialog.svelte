<script lang="ts">
  import { Dialog } from '$lib/components/ui/dialog';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import { editorStore } from '$lib/stores/editorStore.svelte';
  import { compressImage, fileToDataUrl, getImageDimensions } from '$lib/utils/image';
  import { notifications } from '$lib/services/notifications';
  import { ImagePlus } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    onClose?: () => void;
    editPageId?: string | null;
  }

  let { open = $bindable(false), onClose = () => {}, editPageId = null }: Props = $props();

  let name = $state('');
  let width = $state(900);
  let height = $state(1200);
  let imageUrl = $state<string | null>(null);
  let imageFileInput: HTMLInputElement | undefined = $state();
  let isProcessing = $state(false);
  let activeTab: 'settings' | 'upload' = $state('settings');

  let isEditing = $derived(editPageId !== null);
  let existingPage = $derived(isEditing ? editorStore.pages.find(p => p.id === editPageId) : null);

  // Reset form state when dialog opens or edit mode changes
  $effect(() => {
    if (open) {
      if (isEditing && existingPage) {
        name = existingPage.name;
        width = existingPage.width;
        height = existingPage.height;
        imageUrl = existingPage.imageUrl || null;
      } else {
        name = `Page ${editorStore.pages.length + 1}`;
        width = 900;
        height = 1200;
        imageUrl = null;
      }
      activeTab = 'settings';
    }
  });

  const presets = [
    { name: 'Webtoon', width: 800, height: 1280 },
    { name: 'Instagram', width: 1080, height: 1080 },
    { name: 'A4', width: 595, height: 842 },
    { name: 'HD', width: 1920, height: 1080 }
  ];

  function selectPreset(p: typeof presets[0]) {
    width = p.width;
    height = p.height;
  }

  async function handleImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notifications.push({ type: 'error', title: 'Invalid file', description: 'Please select an image file' });
      return;
    }

    // Enforce 10MB file size limit as indicated in UI
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      notifications.push({ type: 'error', title: 'File too large', description: 'Maximum file size is 10MB' });
      return;
    }

    isProcessing = true;
    try {
      const dataUrl = await fileToDataUrl(file);
      const dims = await getImageDimensions(dataUrl);
      width = dims.width;
      height = dims.height;

      const compressed = await compressImage(dataUrl);
      imageUrl = compressed;

      notifications.push({ type: 'success', title: 'Image loaded', description: `${dims.width}x${dims.height}` });
    } catch (error) {
      notifications.push({ type: 'error', title: 'Failed to load image', description: (error as Error).message });
    } finally {
      isProcessing = false;
    }
  }

  function handleSubmit() {
    if (!name.trim()) {
      notifications.push({ type: 'error', title: 'Name required', description: 'Please enter a page name' });
      return;
    }

    if (width < 100 || height < 100) {
      notifications.push({ type: 'error', title: 'Invalid dimensions', description: 'Width and height must be at least 100px' });
      return;
    }

    // Validate maximum dimensions as indicated in UI (5000px)
    const maxDimension = 5000;
    if (width > maxDimension || height > maxDimension) {
      notifications.push({ type: 'error', title: 'Invalid dimensions', description: `Width and height must not exceed ${maxDimension}px` });
      return;
    }

    if (isEditing && editPageId) {
      editorStore.updatePage(editPageId, { name, width, height, imageUrl: imageUrl || undefined });
      notifications.push({ type: 'success', title: 'Page updated', description: `${name} has been updated` });
    } else {
      editorStore.addPage({ name, width, height, imageUrl: imageUrl || undefined });
      notifications.push({ type: 'success', title: 'Page created', description: `${name} has been added` });
    }

    resetAndClose();
  }

  function resetAndClose() {
    // Note: editPageId is a read-only prop in Svelte 5.
    // The parent component is responsible for resetting it via binding or state management.
    // We only reset local state and close the dialog.
    onClose();
  }

  function handleCancel() {
    resetAndClose();
  }
</script>

<Dialog
  {open}
  {onClose}
  title={isEditing ? 'Edit Page' : 'Add New Page'}
  description={isEditing ? 'Configure page settings' : 'Create a new page for your comic'}
  className="max-w-xl"
>
  <div class="space-y-6">
    <div class="flex gap-2 border-b border-gray-200 pb-2">
      <button
        class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'settings' ? 'border-b-2 border-[#e18e90] text-[#e18e90]' : 'text-gray-500 hover:text-gray-700'}"
        onclick={() => activeTab = 'settings'}
      >
        Settings
      </button>
      <button
        class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'upload' ? 'border-b-2 border-[#e18e90] text-[#e18e90]' : 'text-gray-500 hover:text-gray-700'}"
        onclick={() => activeTab = 'upload'}
      >
        Upload Image
      </button>
    </div>

    {#if activeTab === 'settings'}
      <div class="space-y-4">
        <div>
          <Label htmlFor="page-name">Page Name</Label>
          <Input
            id="page-name"
            bind:value={name}
            placeholder="Enter page name"
            className="mt-1"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="page-width">Width (px)</Label>
            <Input
              id="page-width"
              type="number"
              bind:value={width}
              min={100}
              max={5000}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="page-height">Height (px)</Label>
            <Input
              id="page-height"
              type="number"
              bind:value={height}
              min={100}
              max={5000}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Quick Presets</Label>
          <div class="mt-2 flex flex-wrap gap-2">
            {#each presets as preset}
              <button
                class="rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors hover:border-[#e18e90] hover:bg-[#fff2e3]"
                onclick={() => selectPreset(preset)}
              >
                {preset.name}
                <span class="ml-1 text-xs text-gray-500">({preset.width}x{preset.height})</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    {:else}
      <div class="space-y-4">
        {#if imageUrl}
          <div class="relative rounded-lg border border-gray-200 bg-gray-50 p-4">
            <img src={imageUrl} alt="Preview" class="mx-auto max-h-64 rounded" />
            <button
              class="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              onclick={() => imageUrl = null}
              aria-label="Remove image"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {:else}
          <label
            class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-[#e18e90] hover:bg-gray-50"
          >
            <ImagePlus class="h-10 w-10 text-gray-400" />
            <span class="mt-2 text-sm font-medium text-gray-600">Click to upload or drag and drop</span>
            <span class="mt-1 text-xs text-gray-500">PNG, JPG, WebP (max 10MB)</span>
            <input
              bind:this={imageFileInput}
              type="file"
              accept="image/*"
              class="hidden"
              onchange={handleImageUpload}
            />
          </label>
        {/if}

        {#if isProcessing}
          <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Processing image...
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#snippet footer()}
    <Button variant="ghost" onclick={handleCancel}>Cancel</Button>
    <Button onclick={handleSubmit} disabled={isProcessing}>
      {isEditing ? 'Save Changes' : 'Create Page'}
    </Button>
  {/snippet}
</Dialog>
