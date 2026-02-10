<script lang="ts">
  import { cn } from '$lib/utils';

  export let htmlFor = '';
  export let className = '';
</script>

<label for={htmlFor} class={cn('block text-sm font-medium text-gray-700', className)}>
  <slot />
</label>
