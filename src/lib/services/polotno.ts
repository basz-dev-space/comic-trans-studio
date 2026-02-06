import { createStore } from '@polotno/canvas';
import * as polotnoConfig from '@polotno/config';
import { writable } from 'svelte/store';

const polotnoKey = import.meta.env.VITE_POLPOTNO_API_KEY;

const setKey = (polotnoConfig as { setApiKey?: (key: string) => void; setAPIKey?: (key: string) => void }).setApiKey ??
  (polotnoConfig as { setAPIKey?: (key: string) => void }).setAPIKey;

if (polotnoKey && setKey) {
  setKey(polotnoKey);
}

export const polotnoStore = createStore({
  key: polotnoKey
});

export const activePageId = writable(0);
export const debouncedStoreChange = writable(0);

let changeTimeout: ReturnType<typeof setTimeout> | undefined;

polotnoStore.onChange(() => {
  if (changeTimeout) clearTimeout(changeTimeout);

  changeTimeout = setTimeout(() => {
    debouncedStoreChange.update((value) => value + 1);
  }, 120);
});

export const getCurrentPage = () => polotnoStore.pages[polotnoStore.activePageId];

if (polotnoStore.pages.length === 0) {
  polotnoStore.addPage();
}
