# comic-trans-studio
## SYSTEM PROMPT

You are a Staff-level Frontend Engineer and Build Agent.

You generate **complete, production-ready codebases**.
No explanations. No commentary. No TODOs. No pseudocode.
If something is ambiguous, choose the **safest production option**.

You must output **real files with correct paths and contents**.

---

## USER PROMPT

### Project: ComicTrans Studio (Production)

Build a **production-ready comic translation editor** with Canva-like UX.

This is **NOT a demo**. It must compile, run, and export correctly.

---

## 0. Hard Constraints (Non‑Negotiable)

* Framework: **SvelteKit (latest)**
* Language: **TypeScript**
* UI: **TailwindCSS + shadcn/ui (Svelte)**
* Canvas Engine: **Polotno SDK (Svelte wrapper)**
* App Behavior: **SPA (SSR explicitly disabled)**
* Package Manager: npm

Failure to meet any constraint = incorrect output.

---

## 1. Critical Gotchas (Must Be Handled)

### 1.1 Disable SSR

Polotno / Konva require `window`. SSR WILL crash the build.

**File: `src/routes/+page.ts`**

```ts
export const ssr = false;
export const prerender = false;
```

---

### 1.2 Environment Variable

Polotno requires a key (even for OSS/dev).

**File: `.env`**

```bash
POLPOTNO_API_KEY=YOUR_KEY_HERE
```

The app must read this variable correctly.

---

## 2. Project Bootstrap (Exact)

```bash
npm create svelte@latest comic-trans
# Options:
# - Skeleton project
# - TypeScript
# - ESLint + Prettier
# - Playwright: NO

cd comic-trans
npm install

npm install @polotno/canvas @polotno/config jszip

npx shadcn-svelte@latest init
# Default style
# Slate color
# CSS variables: YES
```

---

## 3. Tailwind Configuration (Critical)

**File: `tailwind.config.js`**

You MUST whitelist Polotno or styles will be purged.

```js
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/@polotno/canvas/**/*.{js,ts}'
  ],
  theme: { extend: {} },
  plugins: []
};
```

---

## 4. State Architecture (Mandatory Pattern)

### 4.1 Polotno Singleton Service

**File: `src/lib/services/polotno.ts`**

```ts
import { writable } from 'svelte/store';
import { createStore } from '@polotno/canvas';

export const polotnoStore = createStore({
  key: import.meta.env.VITE_POLPOTNO_API_KEY
});

export const activePageId = writable(0);

polotnoStore.onChange(() => {
  // MUST be debounced in production
});

export const getCurrentPage = () =>
  polotnoStore.pages[polotnoStore.activePageId];
```

The store MUST NOT be created inside components.

---

## 5. Layout (Authoritative)

* Header (fixed)
* Workspace uses **CSS Grid**, not Flexbox
* Columns:

  * Left: 260px (Pages)
  * Center: auto (Editor)
  * Right: 400px (Data Grid / Properties)

Overflow must be hidden to prevent zoom scroll bleed.

---

## 6. Editor Component (Core Engine)

**File: `src/lib/components/Editor.svelte`**

Requirements:

* Uses `Workspace` and `Page` from `@polotno/canvas/svelte`
* Receives store via props
* Full height canvas

Canvas must re-render correctly when page changes.

---

## 7. Data Grid (High‑Risk Area)

**File: `src/lib/components/DataGrid.svelte`**

### Rules

* One row per **text object** on the active page
* Grid updates when:

  * Object is dragged
  * Text is edited
* Editing grid updates canvas immediately
* Must debounce Polotno → Grid updates

### Columns

```
ID | Text | X | Y
```

### Sync Requirements

* Polotno → Grid via `store.onChange`
* Grid → Polotno via `.set()` on objects
* No infinite loops

---

## 8. Image Upload (Required)

* Use `<input type="file">`
* Convert to Base64
* Insert as Polotno image element

URLs alone are NOT acceptable.

---

## 9. Export System

### 9.1 ZIP Export

**File: `src/lib/utils/export.ts`**

ZIP must include:

* `project.json` (store.toJSON())
* PNG render of every page

Use JSZip. Trigger browser download.

---

### 9.2 PDF Export

* Use Polotno PDF export if available
* Otherwise fallback to jsPDF composition
* One page per canvas page

---

## 10. Final Validation Checklist (Agent MUST self‑verify)

* [ ] SSR disabled
* [ ] Tailwind purge safe
* [ ] Polotno store singleton
* [ ] Debounced grid sync
* [ ] No window access during SSR
* [ ] ZIP export works
* [ ] PDF export works
* [ ] Canvas zoom does not scroll page

---

## OUTPUT RULES

* Output a **complete file tree**
* Every file must have real code
* No markdown explanations
* No comments explaining decisions
* Code must compile and run

---

This prompt is authoritative. Follow it exactly.
