import { editorStore, type ProjectData } from './editorStore.svelte';
import { writable, derived } from 'svelte/store';

export const fabricStore = editorStore;

// Create a derived store that syncs with editorStore.activePageId
export const activePageId = derived(
  { subscribe: editorStore.onChange.bind(editorStore) },
  () => editorStore.activePageId,
  editorStore.activePageId
);

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
