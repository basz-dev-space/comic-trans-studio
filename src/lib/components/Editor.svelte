<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Canvas, FabricImage, IText } from 'fabric';

  export let store: any;
  export let pageId = 0;

  let canvasEl: HTMLCanvasElement;
  let fabricCanvas: Canvas;
  let isApplyingState = false;
  let isSavingState = false;
  let stopChangeWatcher: undefined | (() => void);

  const ensureObjectId = (obj: any) => {
    if (!obj.data?.id) {
      obj.set('data', { ...(obj.data || {}), id: `obj_${Math.random().toString(36).slice(2, 10)}` });
    }
  };

  const savePageState = () => {
    if (!fabricCanvas || isApplyingState || !store.pages[pageId]) return;

    isSavingState = true;

    try {
      const data = fabricCanvas.getObjects().map((obj: any) => ({
        id: obj.data?.id || `obj_${Math.random().toString(36).slice(2, 10)}`,
        type: obj.type,
        text: obj.text,
        left: obj.left,
        top: obj.top,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        src: obj.type === 'image' ? obj.getSrc?.() : undefined,
        fontSize: obj.fontSize,
        fill: obj.fill
      }));

      store.pages[pageId] = {
        ...store.pages[pageId],
        width: fabricCanvas.getWidth(),
        height: fabricCanvas.getHeight(),
        objects: data
      };

      store.notify();
    } finally {
      isSavingState = false;
    }
  };

  const loadPageState = async () => {
    if (!fabricCanvas || !store.pages[pageId]) return;

    const page = store.pages[pageId];
    isApplyingState = true;

    fabricCanvas.clear();
    fabricCanvas.setDimensions({ width: page.width, height: page.height });

    for (const object of page.objects || []) {
      if (object.type === 'i-text' || object.type === 'textbox' || object.type === 'text') {
        const text = new IText(object.text || '', {
          left: object.left ?? 80,
          top: object.top ?? 80,
          fontSize: Number(object.fontSize || 36),
          fill: (object.fill as string) || '#111827'
        });
        text.set('data', { id: object.id });
        fabricCanvas.add(text);
      }

      if (object.type === 'image' && object.src) {
        try {
          const image = await FabricImage.fromURL(object.src as string);
          image.set({
            left: object.left ?? 0,
            top: object.top ?? 0,
            scaleX: object.scaleX ?? 1,
            scaleY: object.scaleY ?? 1
          });
          image.set('data', { id: object.id });
          fabricCanvas.add(image);
        } catch {
          continue;
        }
      }
    }

    fabricCanvas.renderAll();
    isApplyingState = false;
  };

  export const addTextObject = () => {
    if (!fabricCanvas) return;

    const text = new IText('New text', {
      left: 80,
      top: 80,
      fontSize: 42,
      fill: '#111827'
    });
    ensureObjectId(text);
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    savePageState();
  };

  export const addImageObject = async (src: string) => {
    if (!fabricCanvas) return;

    const image = await FabricImage.fromURL(src);
    image.set({ left: 20, top: 20, scaleX: 1, scaleY: 1 });
    ensureObjectId(image);
    fabricCanvas.add(image);
    fabricCanvas.setActiveObject(image);
    fabricCanvas.renderAll();
    savePageState();
  };

  onMount(() => {
    fabricCanvas = new Canvas(canvasEl, {
      backgroundColor: '#f8fafc',
      preserveObjectStacking: true
    });

    const onChanged = () => savePageState();
    fabricCanvas.on('object:modified', onChanged);
    fabricCanvas.on('object:moving', onChanged);
    fabricCanvas.on('object:scaling', onChanged);
    fabricCanvas.on('object:removed', onChanged);
    fabricCanvas.on('text:changed', onChanged);

    loadPageState();

    stopChangeWatcher = store.onChange(() => {
      if (isSavingState) return;
      if (store.activePageId !== pageId) return;
      loadPageState();
    });
  });

  $: if (store && typeof pageId === 'number') {
    store.activePageId = pageId;
    if (fabricCanvas) {
      loadPageState();
    }
  }

  onDestroy(() => {
    stopChangeWatcher?.();
    fabricCanvas?.dispose();
  });
</script>

<div class="h-full w-full overflow-auto bg-slate-200 p-4">
  <div class="mx-auto w-fit rounded bg-white p-2 shadow">
    <canvas bind:this={canvasEl}></canvas>
  </div>
</div>
