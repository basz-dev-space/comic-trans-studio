import { ProjectSchema, TextBoxSchema, type ProjectData, type TextBox } from '$lib/schemas/editor';

const defaultProject = (): ProjectData =>
  ProjectSchema.parse({
    id: 'project-local',
    name: 'Untitled chapter',
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    pages: [
      {
        id: 'page_1',
        name: 'Page 1',
        width: 900,
        height: 1200,
        textBoxes: []
      }
    ]
  });

const uuid = () => crypto.randomUUID();

export type GridPatch = Partial<Omit<TextBox, 'id'>>;

class EditorState {
  project: ProjectData = defaultProject();
  private listeners = new Set<() => void>();

  get pages() {
    return this.project.pages;
  }

  get activePageId() {
    return this.project.activePageId;
  }

  set activePageId(value: number) {
    this.project.activePageId = value;
  }

  onChange(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.project.metadata.updatedAt = new Date().toISOString();
    for (const listener of this.listeners) listener();
  }

  addPage(imageUrl?: string) {
    this.project.pages.push({
      id: `page_${Math.random().toString(36).slice(2, 10)}`,
      name: `Page ${this.project.pages.length + 1}`,
      width: 900,
      height: 1200,
      imageUrl,
      textBoxes: []
    });
    this.activePageId = this.project.pages.length - 1;
    this.notify();
  }

  loadProject(data: unknown) {
    this.project = ProjectSchema.parse(data);
    this.notify();
  }

  toJSON() {
    return this.project;
  }

  syncCanvasToGrid(canvasObject: {
    id?: string;
    text?: string;
    originalText?: string;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    angle?: number;
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    backgroundColor?: string;
    lineHeight?: number;
    bubbleShape?: 'none' | 'rounded' | 'ellipse';
  }) {
    const page = this.project.pages[this.project.activePageId];
    if (!page) return;

    const incomingId = canvasObject.id ?? uuid();
    const existing = page.textBoxes.find((box) => box.id === incomingId);

    const next: TextBox = {
      id: incomingId,
      text: canvasObject.text ?? existing?.text ?? 'New text',
      originalText: canvasObject.originalText ?? existing?.originalText ?? canvasObject.text ?? 'New text',
      geometry: {
        x: canvasObject.left ?? existing?.geometry.x ?? 60,
        y: canvasObject.top ?? existing?.geometry.y ?? 60,
        w: Math.max(20, canvasObject.width ?? existing?.geometry.w ?? 280),
        h: Math.max(20, canvasObject.height ?? existing?.geometry.h ?? 80),
        rotation: canvasObject.angle ?? existing?.geometry.rotation ?? 0
      },
      style: {
        fontSize: canvasObject.fontSize ?? existing?.style.fontSize ?? 32,
        fontFamily: canvasObject.fontFamily ?? existing?.style.fontFamily ?? 'Inter',
        color: canvasObject.fill ?? existing?.style.color ?? '#ffffff',
        bgColor: (canvasObject.backgroundColor as string | null | undefined) ?? existing?.style.bgColor ?? null,
        bubbleShape: canvasObject.bubbleShape ?? existing?.style.bubbleShape ?? 'rounded',
        lineHeight: canvasObject.lineHeight ?? existing?.style.lineHeight ?? 1.2
      }
    };

    const parsed = TextBoxSchema.parse(next);

    if (existing) {
      const index = page.textBoxes.findIndex((box) => box.id === incomingId);
      page.textBoxes[index] = parsed;
    } else {
      page.textBoxes.push(parsed);
    }
  }

  syncGridToCanvas(rowId: string, patch: GridPatch) {
    const page = this.project.pages[this.project.activePageId];
    if (!page) return;

    const current = page.textBoxes.find((box) => box.id === rowId);
    if (!current) return;

    const merged = TextBoxSchema.parse({
      ...current,
      ...patch,
      geometry: { ...current.geometry, ...(patch.geometry ?? {}) },
      style: { ...current.style, ...(patch.style ?? {}) }
    });

    const index = page.textBoxes.findIndex((box) => box.id === rowId);
    page.textBoxes[index] = merged;
    this.notify();
  }

  removeTextBox(id: string) {
    const page = this.project.pages[this.project.activePageId];
    if (!page) return;
    page.textBoxes = page.textBoxes.filter((box) => box.id !== id);
    this.notify();
  }

  batchUpdateTranslatedText(values: { id: string; text: string }[]) {
    const page = this.project.pages[this.project.activePageId];
    if (!page) return;

    const map = new Map(values.map((item) => [item.id, item.text]));
    page.textBoxes = page.textBoxes.map((box) =>
      map.has(box.id) ? { ...box, text: map.get(box.id) ?? box.text } : box
    );
    this.notify();
  }
}

export const editorState = new EditorState();
