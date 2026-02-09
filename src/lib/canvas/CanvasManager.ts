import { Canvas, FabricImage, IText, Rect, FabricObject } from 'fabric';
import type { PageData, TextBox } from '$lib/schemas/editor';
import { editorStore } from '$lib/stores/editorStore.svelte';

type EventHandlers = {
  onObjectsChanged?: () => void;
  onSelectionChanged?: (id: string | null) => void;
  onCanvasReady?: () => void;
  onTextEditing?: (_editing: boolean) => void;
};

interface SyncResult {
  id: string;
  geometry: {
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
  };
  text?: string;
}

export class CanvasManager {
  private canvas?: Canvas;
  private handlers: EventHandlers;
  private backgroundImage?: FabricImage;
  private textObjects = new Map<string, IText>();
  private bubbleObjects = new Map<string, Rect>();
  private isDisposing = false;
  private syncInProgress = false;
  private currentPage?: PageData;

  private isPanning = false;
  private lastPanPosition = { x: 0, y: 0 };

  constructor(handlers: EventHandlers = {}) {
    this.handlers = handlers;
  }

  init(canvasElement: HTMLCanvasElement, pageData: PageData): Promise<void> {
    this.isDisposing = false;

    this.canvas = new Canvas(canvasElement, {
      backgroundColor: '#f8f9fa',
      preserveObjectStacking: true,
      selectionColor: 'rgba(99, 102, 241, 0.15)',
      selectionBorderColor: '#6366f1',
      selection: true,
      renderOnAddRemove: false,
      objectCaching: true,
      stopContextMenu: true,
      fireRightClick: true,
      fireMiddleClick: true
    });

    this.setupEventListeners();
    this.setupPanHandlers();
    return this.render(pageData);
  }

  private setupPanHandlers(): void {
    if (!this.canvas) return;

    this.canvas.on('mouse:down', (opt) => {
      const e = opt.e as MouseEvent;
      if (e.button === 1) {
        this.isPanning = true;
        this.canvas!.selection = false;
        this.lastPanPosition = { x: e.clientX, y: e.clientY };
        (this.canvas!.getElement() as HTMLElement).style.cursor = 'grabbing';
      }
    });

    this.canvas.on('mouse:move', (opt) => {
      if (!this.isPanning) return;
      const e = opt.e as MouseEvent;

      const deltaX = e.clientX - this.lastPanPosition.x;
      const deltaY = e.clientY - this.lastPanPosition.y;

      this.canvas!.relativePan(new (FabricObject as any)(deltaX, deltaY));
      this.lastPanPosition = { x: e.clientX, y: e.clientY };
    });

    this.canvas.on('mouse:up', () => {
      this.isPanning = false;
      this.canvas!.selection = true;
      (this.canvas!.getElement() as HTMLElement).style.cursor = 'default';
    });

    this.canvas.on('mouse:wheel', (opt) => {
      const e = opt.e as WheelEvent;
      if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const deltaX = e.deltaX || 0;
        const deltaY = e.deltaY || 0;
        this.canvas!.relativePan(new (FabricObject as any)(deltaX, deltaY));
        return;
      }

      if (!this.canvas) return;
      const delta = e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 5) zoom = 5;
      if (zoom < 0.1) zoom = 0.1;
      this.canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY } as any, zoom);
      e.preventDefault();
      e.stopPropagation();
    });
  }

  private setupEventListeners(): void {
    if (!this.canvas) return;

    this.canvas.on('object:modified', (e) => this.handleObjectModified(e));
    this.canvas.on('object:moving', (e) => this.handleObjectMoving(e));
    this.canvas.on('object:scaling', (e) => this.handleObjectScaling(e));
    this.canvas.on('object:rotating', (e) => this.handleObjectRotating(e));
    this.canvas.on('object:skewing', (e) => this.handleObjectModified(e));

    this.canvas.on('text:changed', (e) => this.handleTextChanged(e));
    this.canvas.on('text:editing:entered', () => this.handlers.onTextEditing?.(true));
    this.canvas.on('text:editing:exited', (e) => {
      this.handleTextChanged(e);
      this.handlers.onTextEditing?.(false);
    });

    this.canvas.on('selection:created', (e) => this.handleSelectionChange(e));
    this.canvas.on('selection:updated', (e) => this.handleSelectionChange(e));
    this.canvas.on('selection:cleared', () => this.handleSelectionChange(null));
  }

  private handleObjectModified(e: any): void {
    const obj = e.target;
    if (!obj || this.syncInProgress || this.isDisposing) return;
    this.syncObjectToStore(obj);
  }

  private handleObjectMoving(e: any): void {
    const obj = e.target;
    if (!obj || this.syncInProgress || this.isDisposing) return;
    this.syncObjectToStore(obj);
  }

  private handleObjectScaling(e: any): void {
    const obj = e.target;
    if (!obj || this.syncInProgress || this.isDisposing) return;
    this.syncObjectToStore(obj);
  }

  private handleObjectRotating(e: any): void {
    const obj = e.target;
    if (!obj || this.syncInProgress || this.isDisposing) return;
    this.syncObjectToStore(obj);
  }

  private handleTextChanged(e: any): void {
    const obj = e.target;
    if (!obj || !(obj instanceof IText) || this.syncInProgress || this.isDisposing) return;

    const id = (obj as any).data?.id;
    if (!id) return;

    this.syncInProgress = true;
    try {
      editorStore.updateTextBox(id, { text: obj.text });
    } finally {
      this.syncInProgress = false;
    }
  }

  private handleSelectionChange(e: any): void {
    if (this.syncInProgress || this.isDisposing) return;
    const selected = e?.selected?.[0];
    const id = (selected as any)?.data?.id ?? null;
    if (id && this.currentPage) {
      if (!this.currentPage.textBoxes.find((tb: TextBox) => tb.id === id)) return;
    }
    this.handlers.onSelectionChanged?.(id);
  }

  private syncObjectToStore(obj: FabricObject): void {
    const id = (obj as any).data?.id;
    if (!id || this.syncInProgress || this.isDisposing) return;

    const scaleX = obj.scaleX ?? 1;
    const scaleY = obj.scaleY ?? 1;

    const result: SyncResult = {
      id,
      geometry: {
        x: Math.round(obj.left ?? 0),
        y: Math.round(obj.top ?? 0),
        w: Math.round((obj.width ?? 200) * scaleX),
        h: Math.round((obj.height ?? 50) * scaleY),
        rotation: Math.round(obj.angle ?? 0)
      }
    };

    this.syncInProgress = true;
    try {
      editorStore.updateTextBox(id, result as any);
      this.handlers.onObjectsChanged?.();
    } finally {
      this.syncInProgress = false;
    }
  }

  async render(pageData: PageData): Promise<void> {
    if (!this.canvas || this.isDisposing) return;

    this.syncInProgress = true;
    this.currentPage = pageData;
    try {
      this.canvas.clear();
      this.canvas.backgroundColor = '#f8f9fa';
      this.canvas.setDimensions({ width: pageData.width, height: pageData.height });

      this.textObjects.clear();
      this.bubbleObjects.clear();

      if (pageData.imageUrl || pageData.inpaintedImageUrl) {
        await this.setBackground(pageData);
      }

      for (const box of pageData.textBoxes) {
        this.addTextBox(box);
      }

      this.canvas.renderAll();
      this.handlers.onCanvasReady?.();
    } finally {
      this.syncInProgress = false;
    }
  }

  private async setBackground(pageData: PageData): Promise<void> {
    if (!this.canvas) return;

    const bgUrl =
      pageData.inpaintedImageUrl && pageData.inpaintedImageUrl.length > 0
        ? pageData.inpaintedImageUrl
        : pageData.imageUrl;

    if (!bgUrl) return;

    try {
      const image = await FabricImage.fromURL(bgUrl);
      const naturalWidth = image.width || pageData.width;
      const naturalHeight = image.height || pageData.height;

      const scale = Math.min(pageData.width / naturalWidth, pageData.height / naturalHeight, 1);

      const scaledWidth = naturalWidth * scale;
      const scaledHeight = naturalHeight * scale;

      image.set({
        left: (pageData.width - scaledWidth) / 2,
        top: (pageData.height - scaledHeight) / 2,
        selectable: false,
        evented: false,
        scaleX: scale,
        scaleY: scale,
        objectCaching: true
      });

      (image as any).data = { isBackground: true, id: 'bg_fixed' };
      this.backgroundImage = image;
      this.canvas.add(image);
      this.canvas.sendObjectToBack(image);
    } catch (error) {
      console.error('Failed to load background image:', error);
    }
  }

  addTextBox(box: TextBox, selectAfterAdd = false): void {
    if (!this.canvas || this.isDisposing) return;

    this.removeTextBox(box.id);

    const bubble = this.createBubble(box);
    const text = this.createText(box);

    if (bubble) {
      this.canvas.add(bubble);
      this.bubbleObjects.set(box.id, bubble);
    }

    this.canvas.add(text);
    this.textObjects.set(box.id, text);

    if (selectAfterAdd) {
      this.canvas.setActiveObject(text);
      this.canvas.requestRenderAll();
    }
  }

  private createBubble(box: TextBox): Rect | null {
    if (box.style.bubbleShape === 'none') return null;

    return new Rect({
      left: box.geometry.x - 10,
      top: box.geometry.y - 8,
      width: box.geometry.w + 20,
      height: box.geometry.h + 16,
      fill: box.style.bgColor ?? 'rgba(15, 23, 42, 0.65)',
      rx: box.style.bubbleShape === 'ellipse' ? box.geometry.h / 2 : 12,
      ry: box.style.bubbleShape === 'ellipse' ? box.geometry.h / 2 : 12,
      selectable: false,
      evented: false,
      objectCaching: true,
      strokeWidth: 0
    });
  }

  private createText(box: TextBox): IText {
    return new IText(box.text, {
      left: box.geometry.x,
      top: box.geometry.y,
      width: box.geometry.w,
      angle: box.geometry.rotation,
      fontSize: box.style.fontSize,
      fontFamily: box.style.fontFamily,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: box.style.color,
      lineHeight: box.style.lineHeight,
      backgroundColor: 'transparent',
      textAlign: 'left',
      originX: 'left',
      originY: 'top',
      splitByGrapheme: false,

      hasControls: true,
      hasBorders: true,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockMovementX: false,
      lockMovementY: false,
      lockSkewingX: false,
      lockSkewingY: false,
      editable: true,

      cornerColor: '#ffffff',
      cornerStrokeColor: '#6366f1',
      cornerStyle: 'circle',
      cornerSize: 10,
      touchCornerSize: 24,
      transparentCorners: false,
      borderColor: '#6366f1',
      borderDashArray: undefined,
      padding: 4,
      cornerPadding: 4,

      ml: true,
      mr: true,
      mt: true,
      mb: true,
      bl: true,
      br: true,
      tl: true,
      tr: true,
      mtr: true,

      objectCaching: true,
      strokeCaching: true,
      data: { id: box.id } as any
    });
  }

  updateTextBox(box: TextBox): void {
    const existingText = this.textObjects.get(box.id);
    const existingBubble = this.bubbleObjects.get(box.id);

    if (!existingText && !existingBubble) {
      this.addTextBox(box);
      return;
    }

    if (existingText) {
      existingText.set({
        text: box.text,
        left: box.geometry.x,
        top: box.geometry.y,
        width: box.geometry.w,
        angle: box.geometry.rotation,
        fontSize: box.style.fontSize,
        fontFamily: box.style.fontFamily,
        fill: box.style.color,
        lineHeight: box.style.lineHeight
      });
      existingText.setCoords();
      this.textObjects.set(box.id, existingText);
    }

    if (existingBubble) {
      this.canvas?.remove(existingBubble);
      this.bubbleObjects.delete(box.id);
    }

    if (box.style.bubbleShape !== 'none') {
      const newBubble = this.createBubble(box);
      if (newBubble) {
        this.canvas?.add(newBubble);
        this.bubbleObjects.set(box.id, newBubble);
      }
    }

    this.canvas?.renderAll();
  }

  removeTextBox(id: string): void {
    const text = this.textObjects.get(id);
    const bubble = this.bubbleObjects.get(id);

    if (text) {
      this.canvas?.remove(text);
      this.textObjects.delete(id);
    }

    if (bubble) {
      this.canvas?.remove(bubble);
      this.bubbleObjects.delete(id);
    }

    this.canvas?.renderAll();
  }

  selectTextBox(id: string | null): void {
    if (!this.canvas) return;

    if (id) {
      const text = this.textObjects.get(id);
      if (text) {
        this.canvas.setActiveObject(text);
        this.canvas.requestRenderAll();
      }
    } else {
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    }
  }

  getSelectedTextBox(): TextBox | null {
    const active = this.canvas?.getActiveObject();
    if (!active || !(active instanceof IText)) return null;

    const id = (active as any).data?.id;
    if (!id) return null;

    return editorStore.getTextBox(id) ?? null;
  }

  serializeTextObjects(): TextBox[] {
    return Array.from(this.textObjects.entries()).map(([id, text]) => {
      const scaleX = text.scaleX ?? 1;
      const scaleY = text.scaleY ?? 1;
      const box = editorStore.getTextBox(id);

      return {
        id,
        text: text.text,
        originalText: box?.originalText ?? text.text,
        geometry: {
          x: Math.round(text.left ?? 0),
          y: Math.round(text.top ?? 0),
          w: Math.round((text.width ?? 200) * scaleX),
          h: Math.round((text.height ?? 50) * scaleY),
          rotation: Math.round(text.angle ?? 0)
        },
        style: {
          fontSize: text.fontSize ?? 32,
          fontFamily: text.fontFamily ?? 'Inter',
          color: typeof text.fill === 'string' ? text.fill : '#ffffff',
          bgColor: box?.style.bgColor ?? null,
          bubbleShape: box?.style.bubbleShape ?? 'rounded',
          lineHeight: text.lineHeight ?? 1.2
        }
      };
    });
  }

  removeSelection(): void {
    const active = this.canvas?.getActiveObject();
    if (!active || (active as any).data?.isBackground) return;

    const id = (active as any).data?.id;
    if (id) {
      this.removeTextBox(id);
      this.handlers.onSelectionChanged?.(null);
      this.handlers.onObjectsChanged?.();
    }
  }

  deleteAll(): void {
    if (!this.canvas) return;
    this.textObjects.clear();
    this.bubbleObjects.clear();
    this.canvas.clear();
    this.canvas.renderAll();
  }

  zoomToFit(
    pageWidth: number,
    pageHeight: number,
    containerWidth: number,
    containerHeight: number
  ): number {
    if (!this.canvas) return 1;

    const padding = 40;
    const availW = containerWidth - padding;
    const availH = containerHeight - padding;
    const scale = Math.max(0.1, Math.min(availW / pageWidth, availH / pageHeight));

    this.canvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
    return scale;
  }

  setZoom(scale: number): void {
    if (!this.canvas) return;
    this.canvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
  }

  getZoom(): number {
    try {
      const vpt = (this.canvas as any)?.viewportTransform;
      return Array.isArray(vpt) ? (vpt[0] ?? 1) : 1;
    } catch {
      return 1;
    }
  }

  zoomIn(factor = 0.1): void {
    if (!this.canvas) return;
    const zoom = Math.min(5, this.canvas.getZoom() * (1 + factor));
    this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
  }

  zoomOut(factor = 0.1): void {
    if (!this.canvas) return;
    const zoom = Math.max(0.1, this.canvas.getZoom() / (1 + factor));
    this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
  }

  resetZoom(): void {
    if (!this.canvas) return;
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  }

  getCanvas(): Canvas | undefined {
    return this.canvas;
  }

  dispose(): void {
    this.isDisposing = true;

    this.textObjects.clear();
    this.bubbleObjects.clear();

    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = undefined;
    }
  }
}
