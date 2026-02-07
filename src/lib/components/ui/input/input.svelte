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
    'flex h-10 w-full rounded-lg border-2 border-[#f0d2b8] bg-white px-4 py-2 text-sm text-[#160204] placeholder:text-[#9d7b82] outline-none transition-all focus:border-[#e18e90] focus:ring-2 focus:ring-[#e18e90]/30',
    className
  )}
/>
