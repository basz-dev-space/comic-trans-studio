<script lang="ts">
  import { editorStore, type TextBox } from '$lib/stores/editorStore.svelte';

  interface Props {
    selectedTextBox?: TextBox | null;
  }

  let { selectedTextBox = null }: Props = $props();

  let fontSize = $state(32);
  let fontFamily = $state('Inter');
  let textColor = $state('#ffffff');
  let bgColor = $state('rgba(15,23,42,0.65)');
  let bubbleShape = $state<'none' | 'rounded' | 'ellipse'>('rounded');
  let lineHeight = $state(1.2);
  let text = $state('');
  let lastSelectedBoxId = $state<string | null>(null);

  const fontFamilies = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Verdana', label: 'Verdana' }
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72];

  const colors = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b',
    '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4',
    '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#d946ef', '#ec4899', '#f43f5e'
  ];

  $effect(() => {
    if (selectedTextBox) {
      const isNewSelection = lastSelectedBoxId !== selectedTextBox.id;
      lastSelectedBoxId = selectedTextBox.id;

      fontSize = selectedTextBox.style.fontSize;
      fontFamily = selectedTextBox.style.fontFamily;
      textColor = selectedTextBox.style.color;
      // Only reset bgColor to default if this is a new text box selection
      // and the incoming value is null, otherwise preserve current selection
      if (isNewSelection) {
        bgColor = selectedTextBox.style.bgColor || 'rgba(15,23,42,0.65)';
      } else if (selectedTextBox.style.bgColor !== null) {
        // Update if there's an actual value from the store
        bgColor = selectedTextBox.style.bgColor;
      }
      bubbleShape = selectedTextBox.style.bubbleShape;
      lineHeight = selectedTextBox.style.lineHeight;
      text = selectedTextBox.text;
    } else {
      lastSelectedBoxId = null;
    }
  });

  function updateStyle(updates: Partial<TextBox['style']>) {
    if (!selectedTextBox) return;
    editorStore.updateTextBox(selectedTextBox.id, {
      style: { ...selectedTextBox.style, ...updates }
    });
  }

  function updateText() {
    if (!selectedTextBox) return;
    editorStore.updateTextBox(selectedTextBox.id, { text });
  }

  function updateGeometry(updates: Partial<TextBox['geometry']>) {
    if (!selectedTextBox) return;
    editorStore.updateTextBox(selectedTextBox.id, {
      geometry: { ...selectedTextBox.geometry, ...updates }
    });
  }
</script>

<div class="flex h-full flex-col bg-white border-l border-gray-200">
  <div class="border-b border-gray-200 p-3">
    <h3 class="text-sm font-semibold text-gray-900">Properties</h3>
  </div>

  {#if !selectedTextBox}
    <div class="flex flex-1 items-center justify-center p-4 text-center">
      <div class="text-sm text-gray-500">
        <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <p>Select a text box to edit its properties</p>
      </div>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto p-3 space-y-4">
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">Text</label>
        <textarea
          bind:value={text}
          onblur={updateText}
          rows="3"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Enter text..."
        ></textarea>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Font</label>
          <select
            bind:value={fontFamily}
            onchange={() => updateStyle({ fontFamily })}
            class="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {#each fontFamilies as font}
              <option value={font.value}>{font.label}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Size</label>
          <select
            bind:value={fontSize}
            onchange={() => updateStyle({ fontSize })}
            class="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {#each fontSizes as size}
              <option value={size}>{size}px</option>
            {/each}
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-700 mb-2">Text Color</label>
        <div class="flex flex-wrap gap-1.5">
          {#each colors as color}
            <button
              type="button"
              class="h-6 w-6 rounded border border-gray-300 shadow-sm"
              style="background-color: {color}"
              onclick={() => updateStyle({ color })}
              aria-label="Select color {color}"
            ></button>
          {/each}
          <input
            type="color"
            bind:value={textColor}
            onchange={() => updateStyle({ color: textColor })}
            class="h-6 w-6 rounded border border-gray-300 cursor-pointer"
            aria-label="Custom color"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-700 mb-2">Background</label>
        <div class="flex flex-wrap gap-1.5">
          <button
            type="button"
            class="h-6 w-6 rounded border border-gray-300 shadow-sm"
            style="background: transparent"
            onclick={() => updateStyle({ bgColor: null, bubbleShape: 'none' })}
            aria-label="No background"
          >
            <svg class="h-4 w-4 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {#each colors as color}
            <button
              type="button"
              class="h-6 w-6 rounded border border-gray-300 shadow-sm"
              style="background-color: {color}"
              onclick={() => updateStyle({ bgColor: color, bubbleShape: 'rounded' })}
              aria-label="Select background {color}"
            ></button>
          {/each}
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-700 mb-2">Bubble Shape</label>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium transition-colors {bubbleShape === 'none' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
            onclick={() => updateStyle({ bubbleShape: 'none', bgColor: null })}
          >
            None
          </button>
          <button
            type="button"
            class="flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium transition-colors {bubbleShape === 'rounded' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
            onclick={() => updateStyle({ bubbleShape: 'rounded', bgColor: bgColor || 'rgba(15,23,42,0.65)' })}
          >
            Rounded
          </button>
          <button
            type="button"
            class="flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium transition-colors {bubbleShape === 'ellipse' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
            onclick={() => updateStyle({ bubbleShape: 'ellipse', bgColor: bgColor || 'rgba(15,23,42,0.65)' })}
          >
            Ellipse
          </button>
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">
          Line Height: {lineHeight.toFixed(1)}
        </label>
        <input
          type="range"
          min="0.8"
          max="2.5"
          step="0.1"
          bind:value={lineHeight}
          onchange={() => updateStyle({ lineHeight })}
          class="w-full"
        />
      </div>

      <div class="pt-3 border-t border-gray-200">
        <label class="block text-xs font-medium text-gray-700 mb-2">Position</label>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-gray-500">X</label>
            <input
              type="number"
              value={Math.round(selectedTextBox.geometry.x)}
              onchange={(e) => updateGeometry({ x: Number((e.target as HTMLInputElement).value) })}
              class="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">Y</label>
            <input
              type="number"
              value={Math.round(selectedTextBox.geometry.y)}
              onchange={(e) => updateGeometry({ y: Number((e.target as HTMLInputElement).value) })}
              class="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">Width</label>
            <input
              type="number"
              value={Math.round(selectedTextBox.geometry.w)}
              onchange={(e) => updateGeometry({ w: Number((e.target as HTMLInputElement).value) })}
              class="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">Height</label>
            <input
              type="number"
              value={Math.round(selectedTextBox.geometry.h)}
              onchange={(e) => updateGeometry({ h: Number((e.target as HTMLInputElement).value) })}
              class="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
