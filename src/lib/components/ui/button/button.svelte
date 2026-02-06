<script lang="ts">
  import { cn } from '$lib/utils';

  export let variant: 'default' | 'outline' | 'ghost' = 'default';
  export let className = '';
  export let type: 'button' | 'submit' | 'reset' = 'button';

  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };
</script>

<button
  {type}
  class={cn(
    'inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    className
  )}
  on:click
>
  <slot />
</button>
