import { writable } from 'svelte/store';
import { editorState } from '$lib/state/editorState';

export const fabricStore = editorState;
export const activePageId = writable(0);
export const debouncedStoreChange = writable(0);

let changeTimeout: ReturnType<typeof setTimeout> | undefined;
editorState.onChange(() => {
  if (changeTimeout) clearTimeout(changeTimeout);

  changeTimeout = setTimeout(() => {
    debouncedStoreChange.update((value) => value + 1);
  }, 120);
});

export const getCurrentPage = () => editorState.pages[editorState.activePageId];
