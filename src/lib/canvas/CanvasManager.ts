import { Canvas, FabricImage, IText, Rect } from 'fabric';
import type { PageData, TextBox } from '$lib/schemas/editor';

type EventHandlers = {
  onObjectsChanged?: () => void;
  onSelectionChanged?: (
    // eslint-disable-next-line no-unused-vars
    id: string | null
  ) => void;
};

const debounce = (cb: () => void, delay = 100) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(cb, delay);
  };
};

export class CanvasManager {
  private canvas?: Canvas;
  private handlers: EventHandlers;
  private debouncedChange = debounce(() => this.handlers.onObjectsChanged?.(), 120);

  constructor(handlers: EventHandlers = {}) {
    this.handlers = handlers;
  }

  init(canvasElement: HTMLCanvasElement, pageData: PageData) {
    this.canvas?.dispose();
    this.canvas = new Canvas(canvasElement, {
      backgroundColor: '#0b1020',
      preserveObjectStacking: true,
      selectionColor: 'rgba(129, 140, 248, 0.15)',
      selectionBorderColor: '#818cf8'
    });

    this.canvas.on('object:modified', this.debouncedChange);
    this.canvas.on('object:moving', this.debouncedChange);
    this.canvas.on('object:scaling', this.debouncedChange);
    this.canvas.on('text:changed', this.debouncedChange);
    this.canvas.on('selection:created', (evt) =>
      this.handlers.onSelectionChanged?.(String((evt.selected?.[0] as any)?.data?.id || null))
    );
    this.canvas.on('selection:updated', (evt) =>
      this.handlers.onSelectionChanged?.(String((evt.selected?.[0] as any)?.data?.id || null))
    );
    this.canvas.on('selection:cleared', () => this.handlers.onSelectionChanged?.(null));

    return this.render(pageData);
  }

  async render(pageData: PageData) {
    if (!this.canvas) return;

    this.canvas.clear();
    this.canvas.setDimensions({ width: pageData.width, height: pageData.height });

    const background = pageData.inpaintedImageUrl && pageData.inpaintedImageUrl.length > 0
      ? pageData.inpaintedImageUrl
      : pageData.imageUrl;

    if (background) {
      const image = await FabricImage.fromURL(background);
      const scale = Math.min(pageData.width / (image.width || pageData.width), pageData.height / (image.height || pageData.height));
      image.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        scaleX: scale,
        scaleY: scale
      });
      image.set('data', { isBackground: true, id: 'bg_fixed' });
      this.canvas.add(image);
      this.canvas.sendObjectToBack(image);
    }

    pageData.textBoxes.forEach((box) => this.addTextBox(box));
    this.canvas.renderAll();
  }

  addTextBox(box: TextBox) {
    if (!this.canvas) return;

    const bubble = box.style.bubbleShape === 'none'
      ? null
      : new Rect({
          left: box.geometry.x - 10,
          top: box.geometry.y - 8,
          width: box.geometry.w + 20,
          height: box.geometry.h + 16,
          fill: box.style.bgColor ?? 'rgba(15, 23, 42, 0.65)',
          rx: box.style.bubbleShape === 'ellipse' ? box.geometry.h / 2 : 14,
          ry: box.style.bubbleShape === 'ellipse' ? box.geometry.h / 2 : 14,
          selectable: false,
          evented: false
        });

    const text = new IText(box.text, {
      left: box.geometry.x,
      top: box.geometry.y,
      width: box.geometry.w,
      angle: box.geometry.rotation,
      fontSize: box.style.fontSize,
      fontFamily: box.style.fontFamily,
      fill: box.style.color,
      lineHeight: box.style.lineHeight,
      backgroundColor: 'transparent',
      cornerColor: '#ffffff',
      cornerStrokeColor: '#6366f1',
      cornerStyle: 'circle',
      transparentCorners: false
    });

    text.set('data', { id: box.id });
    if (bubble) this.canvas.add(bubble);
    this.canvas.add(text);
  }

  serializeTextObjects() {
    if (!this.canvas) return [];
    return this.canvas
      .getObjects()
      .filter((item: any) => item.type === 'i-text' || item.type === 'textbox')
      .map((item: any) => ({
        id: item.data?.id,
        text: item.text,
        left: item.left,
        top: item.top,
        width: item.width,
        height: item.height,
        angle: item.angle,
        fontSize: item.fontSize,
        fontFamily: item.fontFamily,
        fill: item.fill,
        lineHeight: item.lineHeight
      }));
  }

  removeSelection() {
    const active: any = this.canvas?.getActiveObject();
    if (!active || active.data?.isBackground) return;
    this.canvas?.remove(active);
    this.debouncedChange();
  }

  dispose() {
    this.canvas?.dispose();
  }
}
