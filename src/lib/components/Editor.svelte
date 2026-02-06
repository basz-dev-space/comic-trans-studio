<script lang="ts">
  import { Page, Workspace } from '@polotno/canvas/svelte';

  export let store: any;
  export let pageId = 0;

  $: activePage = store?.pages?.[pageId];

  $: if (store && typeof pageId === 'number' && store.activePageId !== pageId) {
    store.activePageId = pageId;
  }
</script>

<div class="h-full w-full overflow-hidden bg-slate-200">
  {#if activePage}
    <Workspace {store} class="h-full w-full">
      <Page {store} page={activePage} />
    </Workspace>
  {/if}
</div>
