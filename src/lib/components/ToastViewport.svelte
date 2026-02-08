<script lang="ts">
  import { notifications } from '$lib/services/notifications';
</script>

<div class="pointer-events-none fixed right-4 top-20 z-[100] flex w-full max-w-sm flex-col gap-2">
  {#each $notifications as item (item.id)}
    <article
      class={`pointer-events-auto rounded-xl border p-3 shadow-elevation-1 backdrop-blur ${
        item.type === 'success'
          ? 'border-[#c6eac8] bg-[#f4fff5] text-[#184f1f]'
          : item.type === 'error'
            ? 'border-[#f5c0c0] bg-[#fff5f5] text-[#7f1d1d]'
            : 'border-[#f0d2b8] bg-white text-[#5d3438]'
      }`}
      role="status"
      aria-live="polite"
    >
      <div class="flex items-start gap-2">
        <div class="flex-1">
          <p class="text-sm font-semibold">{item.title}</p>
          {#if item.description}
            <p class="mt-1 text-xs opacity-90">{item.description}</p>
          {/if}
        </div>
        <button class="text-xs font-semibold opacity-70 transition hover:opacity-100" on:click={() => notifications.remove(item.id)}>✕</button>
      </div>
    </article>
  {/each}
</div>
