<script lang="ts">
  import { cn } from '$lib/utils';
  export let className = '';
</script>

<div class={cn('surface-card', className)}>
  <slot />
</div>
