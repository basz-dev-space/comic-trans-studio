<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Canvas, FabricImage, IText, Textbox } from 'fabric';
  import { Card } from '$lib/components/ui/card';
  import { locale, t } from '$lib/i18n';

  export let store: any;
  export let pageId = 0;

  let canvasEl: HTMLCanvasElement;
  let fabricCanvas: Canvas;
  let isApplyingState = false;
  let isSavingState = false;
  let stopChangeWatcher: undefined | (() => void);

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
      const data = fabricCanvas.getObjects().map((obj: any) => ({
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

  const loadPageState = async () => {
    if (!fabricCanvas || !store.pages[pageId]) return;

    const page = store.pages[pageId];
    isApplyingState = true;

    fabricCanvas.clear();
    fabricCanvas.setDimensions({ width: page.width, height: page.height });

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
    }

    fabricCanvas.renderAll();
    isApplyingState = false;
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

<Card className="flex h-full w-full min-h-0 flex-col overflow-auto p-4">
  <div class="mb-3 flex items-center justify-between text-xs text-[#7A603A]">
    <span>{t($locale, 'editor.title')}</span>
    <span>{t($locale, 'editor.help')}</span>
  </div>
  <div class="mx-auto w-fit rounded-2xl border border-[#E3D5AB] bg-white p-2 ">
    <canvas bind:this={canvasEl}></canvas>
  </div>
</Card>
