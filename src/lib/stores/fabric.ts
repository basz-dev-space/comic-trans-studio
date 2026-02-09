import { editorStore, type ProjectData } from './editorStore.svelte';
import { writable } from 'svelte/store';

export const fabricStore = editorStore;
export const activePageId = writable<number>(0);
export const debouncedStoreChange = writable<number>(0);

let changeTimeout: ReturnType<typeof setTimeout> | undefined;

editorStore.onChange(() => {
  if (changeTimeout) clearTimeout(changeTimeout);

  changeTimeout = setTimeout(() => {
    debouncedStoreChange.update((value) => value + 1);
  }, 120);
});

export const getCurrentPage = () => editorStore.pages[editorStore.activePageId];

export function subscribeToActivePage /* eslint-disable-next-line no-unused-vars */(
  callback: (project: ProjectData) => void
) {
  return editorStore.onChange(callback);
}
