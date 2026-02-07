<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Canvas, FabricImage, IText, Rect, Textbox } from 'fabric';
  import { Card } from '$lib/components/ui/card';
  import { locale, t } from '$lib/i18n';

  export let store: any;
  export let pageId = 0;

  let canvasEl: HTMLCanvasElement;
  let fabricCanvas: Canvas;
  let isApplyingState = false;
  let isSavingState = false;
  let stopChangeWatcher: undefined | (() => void);
  let fileInputEl: HTMLInputElement;

  const serializeCommon = (obj: any) => ({
    id: obj.data?.id || `obj_${Math.random().toString(36).slice(2, 10)}`,
    type: obj.type,
    left: obj.left,
    top: obj.top,
    width: obj.width,
    height: obj.height,
    scaleX: obj.scaleX,
    scaleY: obj.scaleY,
    angle: obj.angle,
    opacity: obj.opacity,
    flipX: obj.flipX,
    flipY: obj.flipY,
    skewX: obj.skewX,
    skewY: obj.skewY,
    originX: obj.originX,
    originY: obj.originY
  });

  const savePageState = () => {
    if (!fabricCanvas || isApplyingState || !store.pages[pageId]) return;

    isSavingState = true;

    try {
      const data = fabricCanvas
        .getObjects()
        .filter((obj: any) => obj.data?.isBackground !== true)
        .map((obj: any) => ({
          ...serializeCommon(obj),
          src: obj.type === 'image' ? obj.getSrc?.() : undefined,
          text: obj.text,
          fontSize: obj.fontSize,
          fontFamily: obj.fontFamily,
          fontWeight: obj.fontWeight,
          fontStyle: obj.fontStyle,
          textAlign: obj.textAlign,
          lineHeight: obj.lineHeight,
          charSpacing: obj.charSpacing,
          underline: obj.underline,
          linethrough: obj.linethrough,
          overline: obj.overline,
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
          fill: obj.fill,
          backgroundColor: obj.backgroundColor
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

  const buildFabricOptions = (object: any) => ({
    left: object.left ?? 0,
    top: object.top ?? 0,
    width: object.width,
    height: object.height,
    scaleX: object.scaleX ?? 1,
    scaleY: object.scaleY ?? 1,
    angle: object.angle ?? 0,
    opacity: object.opacity ?? 1,
    flipX: object.flipX ?? false,
    flipY: object.flipY ?? false,
    skewX: object.skewX ?? 0,
    skewY: object.skewY ?? 0,
    originX: object.originX,
    originY: object.originY,
    stroke: object.stroke,
    strokeWidth: object.strokeWidth,
    fill: object.fill,
    backgroundColor: object.backgroundColor
  });

  const setBackgroundImage = async (src?: string) => {
    if (!fabricCanvas || !src) return;
    try {
      const page = store.pages[pageId];
      const background = await FabricImage.fromURL(src);
      const scale = Math.min(page.width / background.width!, page.height / background.height!);
      background.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        scaleX: scale,
        scaleY: scale
      });
      background.set('data', { isBackground: true, id: 'bg_fixed' });
      fabricCanvas.add(background);
      fabricCanvas.sendObjectToBack(background);
    } catch {
      // Ignore background loading errors and keep editor usable.
    }
  };

  const loadPageState = async () => {
    if (!fabricCanvas || !store.pages[pageId]) return;

    const page = store.pages[pageId];
    isApplyingState = true;

    fabricCanvas.clear();
    fabricCanvas.setDimensions({ width: page.width, height: page.height });

    if (page.backgroundSrc) {
      await setBackgroundImage(page.backgroundSrc);
    }

    for (const object of page.objects || []) {
      if (object.type === 'i-text' || object.type === 'textbox' || object.type === 'text') {
        const textOptions = {
          ...buildFabricOptions(object),
          fontSize: Number(object.fontSize || 36),
          fontFamily: object.fontFamily,
          fontWeight: object.fontWeight,
          fontStyle: object.fontStyle,
          textAlign: object.textAlign,
          lineHeight: object.lineHeight,
          charSpacing: object.charSpacing,
          underline: object.underline,
          linethrough: object.linethrough,
          overline: object.overline
        };

        const text =
          object.type === 'textbox'
            ? new Textbox(object.text || '', textOptions)
            : new IText(object.text || '', textOptions);

        text.set('data', { id: object.id });
        fabricCanvas.add(text);
      }

      if (object.type === 'image' && object.src) {
        try {
          const image = await FabricImage.fromURL(object.src as string);
          image.set(buildFabricOptions(object));
          image.set('data', { id: object.id });
          fabricCanvas.add(image);
        } catch {
          continue;
        }
      }

      if (object.type === 'rect') {
        const rect = new Rect({
          ...buildFabricOptions(object),
          width: object.width || 240,
          height: object.height || 120
        });
        rect.set('data', { id: object.id });
        fabricCanvas.add(rect);
      }
    }

    fabricCanvas.renderAll();
    isApplyingState = false;
  };

  const addTextLayer = () => {
    const text = new IText('New text', {
      left: 80,
      top: 80,
      fontSize: 42,
      fill: '#111827'
    });
    text.set('data', { id: `obj_${Math.random().toString(36).slice(2, 10)}` });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    savePageState();
  };

  const addShapeLayer = () => {
    const rect = new Rect({
      left: 110,
      top: 110,
      width: 220,
      height: 120,
      fill: '#f5c088',
      stroke: '#d97b7d',
      strokeWidth: 2,
      rx: 12,
      ry: 12
    });
    rect.set('data', { id: `obj_${Math.random().toString(36).slice(2, 10)}` });
    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
    savePageState();
  };

  const deleteSelection = () => {
    const target: any = fabricCanvas?.getActiveObject();
    if (!target || target.data?.isBackground) return;
    fabricCanvas.remove(target);
    savePageState();
  };


  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
      reader.readAsDataURL(file);
    });

  const uploadOverlayImage = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const src = await fileToDataUrl(file);

    try {
      const image = await FabricImage.fromURL(src);
      image.set({ left: 120, top: 120, scaleX: 0.35, scaleY: 0.35 });
      image.set('data', { id: `obj_${Math.random().toString(36).slice(2, 10)}` });
      fabricCanvas.add(image);
      fabricCanvas.setActiveObject(image);
      savePageState();
    } finally {
      if (fileInputEl) fileInputEl.value = '';
    }
  };

  onMount(() => {
    fabricCanvas = new Canvas(canvasEl, {
      backgroundColor: '#ffffff',
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

<Card className="flex h-full w-full min-h-0 flex-col overflow-hidden p-0">
  <div class="flex flex-wrap items-center gap-2 border-b border-[#f0d2b8] bg-white px-4 py-3">
    <span class="mr-auto text-xs text-[#7A603A]">{t($locale, 'editor.help')}</span>
    <button class="rounded-md border border-[#f0d2b8] px-3 py-1 text-xs font-semibold text-[#160204] hover:bg-[#fff9fa]" on:click={addTextLayer}>{t($locale, 'editor.addText')}</button>
    <button class="rounded-md border border-[#f0d2b8] px-3 py-1 text-xs font-semibold text-[#160204] hover:bg-[#fff9fa]" on:click={addShapeLayer}>{t($locale, 'editor.addShape')}</button>
    <button class="rounded-md border border-[#f0d2b8] px-3 py-1 text-xs font-semibold text-[#160204] hover:bg-[#fff9fa]" on:click={() => fileInputEl?.click()}>{t($locale, 'editor.addImage')}</button>
    <button class="rounded-md border border-[#e18e90] px-3 py-1 text-xs font-semibold text-[#e18e90] hover:bg-[#fff9fa]" on:click={deleteSelection}>{t($locale, 'editor.remove')}</button>
    <input bind:this={fileInputEl} type="file" class="hidden" accept="image/*" on:change={uploadOverlayImage} />
  </div>

  <div class="flex min-h-0 flex-1 overflow-auto p-4">
    <div class="mx-auto h-fit w-fit rounded-2xl border border-[#E3D5AB] bg-[#f8f8f7] p-2">
      <canvas bind:this={canvasEl}></canvas>
    </div>
  </div>
</Card>
