<script lang="ts">
  import { X } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    onClose?: () => void;
    title?: string;
    description?: string;
    className?: string;
    children: Snippet;
    footer?: Snippet;
  }

  let {
    open = $bindable(false),
    onClose = () => {},
    title = '',
    description = '',
    className = '',
    children,
    footer
  }: Props = $props();

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      onclick={handleBackdropClick}
      role="presentation"
    ></div>

    <div
      class={cn(
        'relative z-50 w-full max-w-lg scale-100 rounded-xl bg-white p-6 shadow-elevation-3 transition-all',
        'max-h-[90vh] overflow-auto',
        className
      )}
    >
      <button
        class="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e18e90]"
        onclick={onClose}
        aria-label="Close dialog"
      >
        <X class="h-5 w-5" />
      </button>

      {#if title}
        <h2 id="dialog-title" class="text-lg font-semibold text-gray-900">
          {title}
        </h2>
      {/if}

      {#if description}
        <p id="dialog-description" class="mt-1 text-sm text-gray-500">
          {description}
        </p>
      {/if}

      <div class="mt-4">
        {@render children()}
      </div>

      {#if footer}
        <div class="mt-6 flex justify-end gap-3">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
