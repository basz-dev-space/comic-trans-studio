import { editorStore, type ProjectData } from './editorStore.svelte';
import { writable } from 'svelte/store';

export const fabricStore = editorStore;

// Custom store that syncs with editorStore.activePageId and emits immediately
function createActivePageStore() {
  const { subscribe, set } = writable<number>(editorStore.activePageId);

  const unsubscribe = editorStore.onChange((project) => {
    set(project.activePageId);
  });

  return {
    subscribe,
    unsubscribe
  };
}

export const activePageId = createActivePageStore();

export const debouncedStoreChange = writable<number>(0);

let changeTimeout: ReturnType<typeof setTimeout> | undefined;

editorStore.onChange(() => {
  if (changeTimeout) clearTimeout(changeTimeout);

  changeTimeout = setTimeout(() => {
    debouncedStoreChange.update((value) => value + 1);
  }, 120);
});

export const getCurrentPage = () => editorStore.pages[editorStore.activePageId];

/**
 * Subscribe to all project changes.
 * Note: This triggers on every project mutation (e.g., text edits, selection changes),
 * not just page changes. For page-specific subscriptions, filter by activePageId.
 */
export function subscribeToProjectChange /* eslint-disable-next-line no-unused-vars */(
  callback: (project: ProjectData) => void
) {
  return editorStore.onChange(callback);
}

// Deprecated alias for backward compatibility
/** @deprecated Use subscribeToProjectChange instead */
export const subscribeToActivePage = subscribeToProjectChange;
