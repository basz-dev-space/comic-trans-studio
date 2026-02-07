<script lang="ts">
  import { cn } from '$lib/utils';

  export let variant: 'default' | 'outline' | 'ghost' = 'default';
  export let className = '';
  export let type: 'button' | 'submit' | 'reset' = 'button';

  const variants = {
    default: 'bg-[#e18e90] text-[#160204] hover:bg-[#d97b7d]',
    outline: 'border border-[#f0d2b8] bg-white text-[#160204] hover:bg-[#fff2e3]',
    ghost: 'text-[#160204] hover:bg-[#fff2e3]'
  };
</script>

<button
  {type}
  class={cn(
    'inline-flex h-10 items-center justify-center rounded-3xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    className
  )}
  on:click
>
  <slot />
</button>
