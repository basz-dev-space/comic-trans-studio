import { writable } from 'svelte/store';

export type CanvasObject = {
  id: string;
  type: string;
  text?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  src?: string;
  [key: string]: unknown;
};

export type PageSnapshot = {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundSrc?: string;
  objects: CanvasObject[];
};

let idCounter = 1;
const uid = () => `id_${idCounter++}`;

const defaultPage = (): PageSnapshot => ({
  id: uid(),
  name: 'Page 1',
  width: 900,
  height: 1200,
  objects: []
});

class FabricProjectStore {
  pages: PageSnapshot[] = [defaultPage()];
  activePageId = 0;
  private listeners = new Set<() => void>();

  onChange(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) listener();
  }

  addPage() {
    const next = defaultPage();
    next.name = `Page ${this.pages.length + 1}`;
    this.pages.push(next);
    this.activePageId = this.pages.length - 1;
    this.notify();
  }

  toJSON() {
    return {
      pages: this.pages,
      activePageId: this.activePageId
    };
  }

  loadJSON(data: { pages?: PageSnapshot[]; activePageId?: number }) {
    if (!data.pages?.length) {
      this.pages = [defaultPage()];
      this.activePageId = 0;
      this.notify();
      return;
    }

    this.pages = data.pages.map((page, index) => ({
      ...page,
      id: page.id || uid(),
      name: page.name || `Page ${index + 1}`,
      objects: Array.isArray(page.objects) ? page.objects : []
    }));

    this.activePageId = Math.min(Math.max(data.activePageId ?? 0, 0), this.pages.length - 1);
    this.notify();
  }
}

export const fabricStore = new FabricProjectStore();
export const activePageId = writable(0);
export const debouncedStoreChange = writable(0);

let changeTimeout: ReturnType<typeof setTimeout> | undefined;
fabricStore.onChange(() => {
  if (changeTimeout) clearTimeout(changeTimeout);

  changeTimeout = setTimeout(() => {
    debouncedStoreChange.update((value) => value + 1);
  }, 120);
});

export const getCurrentPage = () => fabricStore.pages[fabricStore.activePageId];
