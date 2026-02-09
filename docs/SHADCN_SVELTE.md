# shadcn-svelte Components Reference

> shadcn-svelte is a collection of beautifully-designed, accessible components for Svelte and SvelteKit. Built with TypeScript, Tailwind CSS, and Bits UI primitives.

## Installation

```bash
npx shadcn-svelte@latest add [component-name]
```

## Component Categories

### Form & Input

- **Button** - Displays a button or a component that looks like a button
- **Input** - Displays a form input field
- **Textarea** - Displays a form textarea
- **Checkbox** - Toggle between checked and not checked
- **Label** - Accessible label associated with controls
- **Select** - List of options for user to pick from
- **Combobox** - Autocomplete input and command palette
- **Date Picker** - Date picker with range and presets
- **Calendar** - Calendar component for date selection
- **Radio Group** - Checkable buttons where only one can be checked
- **Switch** - Toggle control
- **Slider** - Input for selecting a value within a range
- **Input OTP** - One-time password with copy paste
- **Native Select** - Styled native HTML select
- **Input Group** - Additional information or actions for input
- **Field** - Combined labels, controls, and help text for forms

### Layout & Navigation

- **Accordion** - Interactive headings that reveal content sections
- **Tabs** - Layered sections of content displayed one at a time
- **Sidebar** - Composable, themeable sidebar component
- **Navigation Menu** - Collection of links for website navigation
- **Breadcrumb** - Displays path to current resource
- **Resizable** - Accessible resizable panel groups
- **Scroll Area** - Custom cross-browser scroll functionality
- **Separator** - Visually or semantically separates content

### Overlays & Dialogs

- **Dialog** - Window overlaid on primary content
- **Sheet** - Extends Dialog for supplementary screen content
- **Drawer** - Slide-out drawer component
- **Alert Dialog** - Modal dialog for important content
- **Command** - Fast, composable, unstyled command menu
- **Dropdown Menu** - Menu triggered by a button
- **Context Menu** - Menu triggered by right click
- **Popover** - Rich content in a portal triggered by button
- **Tooltip** - Popup with information on hover/focus
- **Hover Card** - Preview content behind a link
- **Menubar** - Persistent desktop application menu

### Feedback & Status

- **Alert** - Callout for user attention
- **Badge** - Badge component
- **Progress** - Completion progress indicator
- **Skeleton** - Placeholder while content loads
- **Sonner** - Opinionated toast component
- **Spinner** - Loading state indicator
- **Empty** - Empty state display

### Display & Media

- **Card** - Card with header, content, and footer
- **Avatar** - Image element with fallback for users
- **Table** - Responsive table component
- **Data Table** - Powerful table using TanStack Table
- **Carousel** - Motion and swipe carousel using Embla
- **Chart** - Charts built using LayerChart
- **Aspect Ratio** - Content within desired ratio
- **Typography** - Styles for headings, paragraphs, lists
- **Kbd** - Displays keyboard user input

### Misc

- **Pagination** - Page navigation with next/previous links
- **Toggle** - Two-state button (on/off)
- **Toggle Group** - Set of two-state toggleable buttons
- **Collapsible** - Expands/collapses a panel
- **Range Calendar** - Calendar for selecting date ranges

## Dark Mode

```bash
npx shadcn-svelte@latest add dark-mode
```

## Usage Example

```svelte
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
</script>

<Input placeholder="Enter text" />
<Button>Click me</Button>
```
