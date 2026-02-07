<script lang="ts">
  import { cn } from '$lib/utils';
  export let className = '';
  export let type = 'text';
  export let value: string | number = '';
  export let name = '';
  export let id = '';
  export let placeholder = '';
  export let required = false;
</script>

<input
  {type}
  {name}
  {id}
  {placeholder}
  {required}
  bind:value
  class={cn(
    'flex h-10 w-full rounded-3xl border border-[#f0d2b8] bg-white px-4 py-2 text-sm text-[#160204] outline-none ring-[#e18e90]/70 transition focus:ring',
    className
  )}
/>
