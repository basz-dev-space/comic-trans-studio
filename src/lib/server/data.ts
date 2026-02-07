import { randomBytes, randomUUID } from 'node:crypto';

export type ChapterPage = {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundSrc?: string;
  objects: Record<string, unknown>[];
};

export type Chapter = {
  id: string;
  projectId: string;
  name: string;
  pages: ChapterPage[];
};

export type Project = {
  id: string;
  ownerId: string;
  name: string;
  chapterIds: string[];
};

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
};

const users: User[] = [
  { id: 'u_demo', email: 'demo@comictrans.local', password: 'demo123', name: 'Demo User' }
];

const projects: Project[] = [
  { id: 'p_demo', ownerId: 'u_demo', name: 'Demo Manga', chapterIds: ['c_demo_1'] }
];

const chapters: Chapter[] = [
  {
    id: 'c_demo_1',
    projectId: 'p_demo',
    name: 'Chapter 1',
    pages: [{ id: 'page_1', name: 'Page 1', width: 900, height: 1200, objects: [] }]
  }
];

const sessions = new Map<string, string>();

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const secureToken = () => {
  try {
    return randomUUID();
  } catch {
    return randomBytes(32).toString('hex');
  }
};

export const db = {
  findUserByCredentials(email: string, password: string) {
    return users.find((user) => user.email === email && user.password === password) ?? null;
  },
  getUserById(userId: string | null) {
    if (!userId) return null;
    return users.find((user) => user.id === userId) ?? null;
  },
  createSession(userId: string) {
    const token = secureToken();
    sessions.set(token, userId);
    return token;
  },
  destroySession(token: string) {
    sessions.delete(token);
  },
  getUserBySession(token: string | undefined) {
    if (!token) return null;
    const userId = sessions.get(token) ?? null;
    return this.getUserById(userId);
  },
  getProjectsByOwner(ownerId: string) {
    return projects.filter((project) => project.ownerId === ownerId);
  },
  createProject(ownerId: string, name: string) {
    const project: Project = { id: uid('p'), ownerId, name, chapterIds: [] };
    const chapter: Chapter = {
      id: uid('c'),
      projectId: project.id,
      name: 'Chapter 1',
      pages: [{ id: uid('page'), name: 'Page 1', width: 900, height: 1200, objects: [] }]
    };
    project.chapterIds.push(chapter.id);
    projects.push(project);
    chapters.push(chapter);
    return project;
  },
  getProjectById(projectId: string) {
    return projects.find((project) => project.id === projectId) ?? null;
  },
  getChaptersByProject(projectId: string) {
    return chapters.filter((chapter) => chapter.projectId === projectId);
  },
  createChapter(projectId: string, name: string) {
    const chapter: Chapter = {
      id: uid('c'),
      projectId,
      name,
      pages: [{ id: uid('page'), name: 'Page 1', width: 900, height: 1200, objects: [] }]
    };
    chapters.push(chapter);
    const project = this.getProjectById(projectId);
    if (project) project.chapterIds.push(chapter.id);
    return chapter;
  },
  renameChapter(chapterId: string, name: string) {
    const chapter = chapters.find((candidate) => candidate.id === chapterId);
    if (chapter) chapter.name = name;
    return chapter ?? null;
  },
  deleteChapter(chapterId: string) {
    const chapterIndex = chapters.findIndex((chapter) => chapter.id === chapterId);
    if (chapterIndex === -1) return false;

    const [chapter] = chapters.splice(chapterIndex, 1);
    const project = projects.find((candidate) => candidate.id === chapter.projectId);
    if (project) project.chapterIds = project.chapterIds.filter((id) => id !== chapterId);
    return true;
  },
  getChapterById(chapterId: string) {
    return chapters.find((chapter) => chapter.id === chapterId) ?? null;
  },
  saveChapterPages(chapterId: string, pages: ChapterPage[]) {
    const chapter = chapters.find((candidate) => candidate.id === chapterId);
    if (!chapter) return null;
    chapter.pages = pages;
    return chapter;
  }
};
