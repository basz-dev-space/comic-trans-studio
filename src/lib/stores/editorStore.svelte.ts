import {
  ProjectSchema,
  TextBoxSchema,
  type ProjectData,
  type PageData,
  type TextBox
} from '$lib/schemas/editor';

export type { TextBox, PageData, ProjectData };

const uuid = () => crypto.randomUUID();

export type HistoryEntry = {
  timestamp: number;
  project: ProjectData;
};

function createEditorStore() {
  let project = $state<ProjectData>({
    id: 'project-local',
    name: 'Untitled chapter',
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    pages: [],
    activePageId: 0,
    selectedTextBoxId: null,
    showInpainted: true
  });

  // eslint-disable-next-line no-unused-vars
  let listeners = new Set<(project: ProjectData) => void>();
  let history: HistoryEntry[] = [];
  let historyIndex = -1;
  const maxHistory = 100;
  // eslint-disable-next-line no-unused-vars
  let autoSaveCallback: ((project: ProjectData) => void) | undefined;

  function initDefaultProject() {
    project = ProjectSchema.parse({
      id: 'project-local',
      name: 'Untitled chapter',
      metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      pages: [
        {
          id: `page_${uuid()}`,
          name: 'Page 1',
          width: 900,
          height: 1200,
          textBoxes: []
        }
      ],
      activePageId: 0,
      selectedTextBoxId: null,
      showInpainted: true
    });
    saveToHistory();
  }

  function notify() {
    project.metadata.updatedAt = new Date().toISOString();
    triggerAutoSave();
    for (const listener of listeners) {
      listener(project);
    }
  }

  function triggerAutoSave() {
    if (autoSaveCallback) {
      autoSaveCallback(project);
    }
  }

  function saveToHistory() {
    const snapshot = JSON.parse(JSON.stringify(project));
    if (historyIndex < history.length - 1) {
      history = history.slice(0, historyIndex + 1);
    }
    history.push({ timestamp: Date.now(), project: snapshot });
    if (history.length > maxHistory) {
      history = history.slice(1);
    } else {
      historyIndex++;
    }
  }

  function restoreFromHistory() {
    if (historyIndex < 0 || historyIndex >= history.length) return;
    const entry = history[historyIndex];
    project = ProjectSchema.parse(JSON.parse(JSON.stringify(entry.project)));
    notify();
  }

  initDefaultProject();

  return {
    get project() {
      return project;
    },

    get pages() {
      return project.pages;
    },
    get activePageId() {
      return project.activePageId;
    },
    set activePageId(value: number) {
      if (value >= 0 && value < project.pages.length) {
        project.activePageId = value;
        notify();
      }
    },
    get selectedTextBoxId() {
      return project.selectedTextBoxId;
    },
    set selectedTextBoxId(value: string | null) {
      project.selectedTextBoxId = value;
      notify();
    },
    get showInpainted() {
      return project.showInpainted;
    },
    set showInpainted(value: boolean) {
      project.showInpainted = value;
      notify();
    },

    onChange(
      /* eslint-disable-next-line no-unused-vars */
      listener: (project: ProjectData) => void
    ) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    setAutoSaveCallback(
      /* eslint-disable-next-line no-unused-vars */
      callback: (project: ProjectData) => void
    ) {
      autoSaveCallback = callback;
    },

    undo() {
      if (!this.canUndo()) return false;
      historyIndex--;
      restoreFromHistory();
      return true;
    },

    redo() {
      if (!this.canRedo()) return false;
      historyIndex++;
      restoreFromHistory();
      return true;
    },

    canUndo() {
      return historyIndex > 0;
    },

    canRedo() {
      return historyIndex < history.length - 1;
    },

    loadProject(data: unknown) {
      project = ProjectSchema.parse(data);
      history = [];
      historyIndex = -1;
      saveToHistory();
      notify();
    },

    addPage(options?: {
      width?: number;
      height?: number;
      name?: string;
      imageUrl?: string;
      inpaintedImageUrl?: string;
    }) {
      const newPage: PageData = {
        id: `page_${uuid()}`,
        name: options?.name ?? `Page ${project.pages.length + 1}`,
        width: options?.width ?? 900,
        height: options?.height ?? 1200,
        imageUrl: options?.imageUrl,
        inpaintedImageUrl: options?.inpaintedImageUrl,
        textBoxes: []
      };

      project.pages.push(newPage);
      project.activePageId = project.pages.length - 1;
      saveToHistory();
      notify();
      return newPage;
    },

    duplicatePage(pageId: string) {
      const pageIndex = project.pages.findIndex((p) => p.id === pageId);
      if (pageIndex === -1) return null;

      const original = project.pages[pageIndex];
      const duplicated: PageData = {
        ...JSON.parse(JSON.stringify(original)),
        id: `page_${uuid()}`,
        name: `${original.name} (Copy)`
      };

      project.pages.splice(pageIndex + 1, 0, duplicated);
      project.activePageId = pageIndex + 1;
      saveToHistory();
      notify();
      return duplicated;
    },

    deletePage(pageId: string) {
      const pageIndex = project.pages.findIndex((p) => p.id === pageId);
      if (pageIndex === -1) return false;
      if (project.pages.length <= 1) return false;

      project.pages.splice(pageIndex, 1);

      if (project.activePageId >= project.pages.length) {
        project.activePageId = project.pages.length - 1;
      }

      if (project.selectedTextBoxId) {
        const newActivePage = project.pages[project.activePageId];
        if (!newActivePage.textBoxes.find((tb) => tb.id === project.selectedTextBoxId)) {
          project.selectedTextBoxId = null;
        }
      }

      saveToHistory();
      notify();
      return true;
    },

    movePage(oldIndex: number, newIndex: number) {
      const pages = project.pages;
      if (oldIndex < 0 || oldIndex >= pages.length || newIndex < 0 || newIndex >= pages.length)
        return;

      const [item] = pages.splice(oldIndex, 1);
      pages.splice(newIndex, 0, item);

      if (project.activePageId === oldIndex) {
        project.activePageId = newIndex;
      } else if (project.activePageId > oldIndex && project.activePageId <= newIndex) {
        project.activePageId -= 1;
      } else if (project.activePageId < oldIndex && project.activePageId >= newIndex) {
        project.activePageId += 1;
      }

      saveToHistory();
      notify();
    },

    updatePage(pageId: string, updates: Partial<PageData>) {
      const page = project.pages.find((p) => p.id === pageId);
      if (!page) return;

      Object.assign(page, updates);
      saveToHistory();
      notify();
    },

    addTextBox(textBox: Omit<TextBox, 'id'> & { id?: string }) {
      const page = project.pages[project.activePageId];
      if (!page) return null;

      const newTextBox = TextBoxSchema.parse({
        ...textBox,
        id: textBox.id ?? uuid()
      });

      page.textBoxes.push(newTextBox);
      project.selectedTextBoxId = newTextBox.id;
      saveToHistory();
      notify();
      return newTextBox;
    },

    updateTextBox(id: string, updates: Partial<TextBox>) {
      const page = project.pages[project.activePageId];
      if (!page) return null;

      const index = page.textBoxes.findIndex((tb) => tb.id === id);
      if (index === -1) return null;

      const current = page.textBoxes[index];
      const updated = TextBoxSchema.parse({
        ...current,
        ...updates,
        geometry: { ...current.geometry, ...(updates.geometry ?? {}) },
        style: { ...current.style, ...(updates.style ?? {}) }
      });

      page.textBoxes[index] = updated;
      saveToHistory();
      notify();
      return updated;
    },

    removeTextBox(id: string) {
      const page = project.pages[project.activePageId];
      if (!page) return false;

      const index = page.textBoxes.findIndex((tb) => tb.id === id);
      if (index === -1) return false;

      page.textBoxes.splice(index, 1);
      if (project.selectedTextBoxId === id) {
        project.selectedTextBoxId = null;
      }

      saveToHistory();
      notify();
      return true;
    },

    batchUpdateTextBoxes(updates: { id: string; text: string }[]) {
      const page = project.pages[project.activePageId];
      if (!page) return;

      const map = new Map(updates.map((u) => [u.id, u.text]));
      page.textBoxes = page.textBoxes.map((tb) =>
        map.has(tb.id) ? { ...tb, text: map.get(tb.id) ?? tb.text } : tb
      );
      saveToHistory();
      notify();
    },

    getTextBox(id: string) {
      const page = project.pages[project.activePageId];
      return page?.textBoxes.find((tb) => tb.id === id);
    },

    selectTextBox(id: string | null) {
      project.selectedTextBoxId = id;
      notify();
    },

    syncGridToCanvas(id: string, updates: Partial<TextBox>) {
      const page = project.pages[project.activePageId];
      if (!page) return null;
      const index = page.textBoxes.findIndex((tb) => tb.id === id);
      if (index === -1) return null;
      return this.updateTextBox(id, updates);
    },

    syncCanvasToGrid(box: Omit<TextBox, 'id'> & { id?: string }) {
      return this.addTextBox(box);
    },

    toJSON() {
      return JSON.parse(JSON.stringify(project));
    },

    dispose() {
      listeners.clear();
    }
  };
}

export const editorStore = createEditorStore();
