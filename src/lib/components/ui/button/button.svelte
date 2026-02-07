<script lang="ts">
  import { cn } from '$lib/utils';

  export let variant: 'default' | 'outline' | 'ghost' = 'default';
  export let className = '';
  export let type: 'button' | 'submit' | 'reset' = 'button';

  const variants = {
    default: 'bg-[#e18e90] text-white hover:bg-[#d97b7d] shadow-elevation-1 hover:shadow-elevation-2',
    outline: 'border-2 border-[#f0d2b8] bg-white text-[#160204] hover:border-[#e18e90] hover:bg-[#fff2e3]',
    ghost: 'text-[#160204] hover:bg-[#fff2e3]'
  };
</script>

<button
  {type}
  class={cn(
    'inline-flex h-10 items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e18e90] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    className
  )}
  on:click
>
  <slot />
</button>
