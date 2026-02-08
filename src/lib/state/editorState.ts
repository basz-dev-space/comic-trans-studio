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
  // simple undo/redo stacks storing serialized project snapshots
  private past: string[] = [];
  private future: string[] = [];
  private lastSnapshot: string | null = null;

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
    this.pushSnapshotIfNeeded();
    for (const listener of this.listeners) listener();
  }

  private serializeProject() {
    try {
      return JSON.stringify(this.project);
    } catch {
      return '';
    }
  }

  private pushSnapshotIfNeeded() {
    const snap = this.serializeProject();
    if (!snap) return;
    if (this.lastSnapshot === snap) return;
    this.past.push(this.lastSnapshot ?? snap);
    // cap history
    if (this.past.length > 100) this.past.shift();
    this.lastSnapshot = snap;
    // clear redo stack when new change occurs
    this.future = [];
  }

  undo() {
    if (!this.canUndo()) return false;
    const current = this.serializeProject();
    if (current) this.future.push(current);
    const previous = this.past.pop() as string;
    try {
      this.project = ProjectSchema.parse(JSON.parse(previous));
      this.lastSnapshot = previous;
      this.notify();
      return true;
    } catch (e) {
      return false;
    }
  }

  redo() {
    if (!this.canRedo()) return false;
    const current = this.serializeProject();
    if (current) this.past.push(current);
    const next = this.future.pop() as string;
    try {
      this.project = ProjectSchema.parse(JSON.parse(next));
      this.lastSnapshot = next;
      this.notify();
      return true;
    } catch (e) {
      return false;
    }
  }

  canUndo() {
    return this.past.length > 0;
  }

  canRedo() {
    return this.future.length > 0;
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

  movePage(oldIndex: number, newIndex: number) {
    const pages = this.project.pages;
    if (oldIndex < 0 || oldIndex >= pages.length || newIndex < 0 || newIndex >= pages.length) return;
    const [item] = pages.splice(oldIndex, 1);
    pages.splice(newIndex, 0, item);
    // adjust active page if needed
    if (this.project.activePageId === oldIndex) {
      this.project.activePageId = newIndex;
    } else if (this.project.activePageId > oldIndex && this.project.activePageId <= newIndex) {
      this.project.activePageId -= 1;
    } else if (this.project.activePageId < oldIndex && this.project.activePageId >= newIndex) {
      this.project.activePageId += 1;
    }
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
