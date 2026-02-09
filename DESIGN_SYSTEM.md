# Design System Documentation

This document defines the design system for comic-trans-studio. All AI agents must follow these guidelines when creating or modifying UI components and pages.

## Color Palette

### Primary Colors

| Token                  | Hex       | Usage                                 |
| ---------------------- | --------- | ------------------------------------- |
| `--primary`            | `#e18e90` | Primary buttons, accents, focus rings |
| `--primary-hover`      | `#d97b7d` | Button hover state                    |
| `--primary-foreground` | `#ffffff` | Text on primary backgrounds           |

### Secondary Colors

| Token               | Hex       | Usage                       |
| ------------------- | --------- | --------------------------- |
| `--secondary`       | `#f0d2b8` | Secondary borders, outlines |
| `--secondary-hover` | `#fff2e3` | Secondary hover backgrounds |

### Neutral Colors

| Token          | Hex       | Usage                    |
| -------------- | --------- | ------------------------ |
| `--background` | `#f3f5f8` | Page backgrounds         |
| `--surface`    | `#ffffff` | Card/popover backgrounds |
| `--foreground` | `#131722` | Primary text             |
| `--muted`      | `#707684` | Secondary text, labels   |
| `--border`     | `#dde2e9` | Borders, dividers        |
| `--input`      | `#ccd3dc` | Input borders            |

### Utility Colors

| Token       | Hex       | Usage          |
| ----------- | --------- | -------------- |
| `--success` | `#22c55e` | Success states |
| `--error`   | `#ef4444` | Error states   |
| `--warning` | `#f59e0b` | Warning states |

## Typography

### Font Stack

- Primary: System UI fonts (San Francisco, Segoe UI, Roboto)
- Monospace: `font-mono` for code/credentials

### Text Sizes

| Class              | Size          | Weight   | Usage                                     |
| ------------------ | ------------- | -------- | ----------------------------------------- |
| `.text-display-lg` | 3rem/5xl      | Semibold | Hero headings                             |
| `.text-display-md` | 2.25rem/4xl   | Semibold | Page titles                               |
| `.text-heading-lg` | 1.5rem/2xl    | Semibold | Section headings                          |
| `.text-heading-md` | 1.25rem/xl    | Semibold | Subsection headings                       |
| `.text-body-md`    | 0.875rem/sm   | Normal   | Body text                                 |
| `.badge-label`     | 0.688rem/11px | Semibold | Labels, badges (uppercase, tracking-wide) |

### Text Colors

- Headings: `text-[#171d27]`
- Body: `text-[#242c39]`
- Muted: `text-[#707684]`
- Labels: `text-[#586173]`

## Spacing

### Scale

- Base unit: `4px` (0.25rem)
- Small: `0.5rem` (8px)
- Medium: `1rem` (16px)
- Large: `1.5rem` (24px)
- XLarge: `2rem` (32px)

### Container Widths

- Max content: `1560px`
- Forms/cards: `max-w-md` (448px)
- Tables: `max-w-4xl` (896px)

## Components

### Button

**Location:** `src/lib/components/ui/button/button.svelte`

**Variants:**
| Variant | Class | Usage |
|---------|-------|-------|
| `default` | `bg-[#e18e90] text-white` | Primary actions |
| `outline` | `border-2 border-[#f0d2b8] bg-white` | Secondary actions |
| `ghost` | `text-[#160204]` | Tertiary actions |

**Props:**

```typescript
export let variant: 'default' | 'outline' | 'ghost' = 'default';
export let className = '';
export let type: 'button' | 'submit' | 'reset' = 'button';
```

**Usage Example:**

```svelte
<Button variant="default" type="submit">Submit</Button>
<Button variant="outline" type="button">Cancel</Button>
<Button variant="ghost" type="button">More</Button>
```

**Design Specs:**

- Height: `h-10` (40px)
- Padding: `px-5 py-2`
- Border radius: `rounded-full`
- Font: `text-sm font-semibold`
- Focus ring: `focus-visible:ring-2 focus-visible:ring-[#e18e90]`

### Input

**Location:** `src/lib/components/ui/input/input.svelte`

**Props:**

```typescript
export let className = '';
export let type = 'text';
export let value: string | number = '';
export let name = '';
export let id = '';
export let placeholder = '';
export let required = false;
```

**Usage Example:**

```svelte
<Input id="email" name="email" type="email" bind:value={email} placeholder="user@example.com" required />
```

**Design Specs:**

- Height: `h-10` (40px)
- Border: `border-2 border-[#f0d2b8]`
- Border on focus: `focus:border-[#e18e90]`
- Focus ring: `focus:ring-2 focus:ring-[#e18e90]/30`
- Border radius: `rounded-lg`
- Text: `text-sm text-[#160204]`
- Placeholder: `placeholder:text-[#9d7b82]`

### Card

**Location:** `src/lib/components/ui/card/card.svelte`

**Usage:**

```svelte
<Card className="p-6">
  <slot />
</Card>
```

**Design Specs:**

- Background: `surface-card` (white with rounded corners)
- Border radius: `rounded-lg`

### Page Layout Pattern

**Standard Page Structure:**

```svelte
<div class="min-h-[76vh] py-6">
  <div class="mx-auto w-full max-w-[1560px] px-2 sm:px-4">
    <div class="surface-card overflow-hidden">
      <!-- Header -->
      <div class="border-b border-[#dde2e9] bg-[#f8fafc] px-6 py-5">
        <p class="badge-label">SECTION LABEL</p>
        <h1 class="mt-1 text-3xl font-semibold text-[#171d27]">Page Title</h1>
      </div>

      <!-- Content -->
      <div class="p-6">
        <slot />
      </div>
    </div>
  </div>
</div>
```

### Form Layout Pattern

**Form with Labels:**

```svelte
<div class="space-y-4">
  <div class="space-y-1.5">
    <label class="text-sm font-semibold text-[#242c39]" for="fieldId">Label</label>
    <Input id="fieldId" bind:value={value} className="h-10 rounded border-[#ccd3dc] bg-white" />
  </div>
</div>
```

**Inline Form Actions:**

```svelte
<div class="mt-4">
  <Button type="submit" className="h-10 rounded bg-[#ff8b31] text-sm font-semibold text-white hover:bg-[#f57e22]">
    Submit
  </Button>
</div>
```

### Table Pattern

**Data Table:**

```svelte
<div class="overflow-hidden rounded-lg border border-[#dde2e9]">
  <table class="w-full">
    <thead class="bg-[#f8fafc]">
      <tr class="border-b border-[#dde2e9] text-left text-sm font-semibold text-[#586173]">
        <th class="px-4 py-3">Column 1</th>
        <th class="px-4 py-3">Column 2</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-[#dde2e9]">
      <tr class="text-sm text-[#242c39]">
        <td class="px-4 py-3">Data</td>
        <td class="px-4 py-3">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Alert/Message Pattern

**Info Box:**

```svelte
<div class="rounded border border-[#dde2e9] bg-[#f8fafc] p-3 text-sm">
  <p class="font-semibold">Title</p>
  <p>Message content</p>
</div>
```

**Error Box:**

```svelte
<div class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
  <p class="font-semibold">Error Title</p>
  <p>Error message</p>
</div>
```

## Utility Classes

### Shell Layout

| Class                   | Purpose                            |
| ----------------------- | ---------------------------------- |
| `.app-shell`            | Main app container with min-height |
| `.app-container`        | Constrained width container        |
| `.surface-card`         | Card/popover surface               |
| `.topbar`, `.footerbar` | Toolbar containers                 |

### Shadows

- No elevation shadows used (`shadow-elevation-1`, `shadow-elevation-2` are explicitly set to `none`)

### Buttons (Legacy)

| Class          | Purpose               |
| -------------- | --------------------- |
| `.action-btn`  | Small action button   |
| `.primary-btn` | Primary action button |

## CSS Variables

Defined in `src/app.css`:

```css
:root {
  --background: 220 15% 96%;
  --foreground: 222 22% 12%;
  --card: 0 0% 100%;
  --card-foreground: 222 22% 12%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 22% 12%;
  --primary: 24 95% 56%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 16% 92%;
  --secondary-foreground: 222 18% 24%;
  --muted: 220 16% 94%;
  --muted-foreground: 220 10% 42%;
  --accent: 24 95% 56%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 78% 55%;
  --destructive-foreground: 0 0% 100%;
  --border: 220 14% 88%;
  --input: 220 14% 84%;
  --ring: 24 95% 56%;
  --radius: 0.75rem;
}
```

## Tailwind Configuration

The `tailwind.config.js` maps CSS variables to color tokens:

```javascript
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: 'hsl(var(--card))',
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  muted: 'hsl(var(--muted))',
  accent: 'hsl(var(--accent))',
  destructive: 'hsl(var(--destructive))',
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))'
}
```

## Checklist for New Pages/Components

- [ ] Use `surface-card` for card containers
- [ ] Use `.badge-label` for section labels (uppercase, tracking-wide)
- [ ] Use `text-3xl font-semibold text-[#171d27]` for page titles
- [ ] Use `.text-sm font-semibold text-[#242c39]` for section headings
- [ ] Use `Button` component with appropriate variant
- [ ] Use `Input` component with proper labels
- [ ] Use `rounded-lg` for cards, inputs, tables
- [ ] Use `border border-[#dde2e9]` for container borders
- [ ] Use `bg-[#f8fafc]` for table headers and form backgrounds
- [ ] Use `text-[#586173]` for table header text
- [ ] Use `text-[#242c39]` for body text
- [ ] Use `text-[#707684]` for muted text
- [ ] Use `focus:border-[#e18e90]` and `focus:ring` for input focus states
- [ ] Use `space-y-4` and `space-y-1.5` for form spacing
- [ ] Use `grid` for multi-column layouts
- [ ] Follow the "Page Layout Pattern" for new pages
- [ ] Follow the "Form Layout Pattern" for forms
- [ ] Follow the "Table Pattern" for data tables
