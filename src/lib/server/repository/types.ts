/* eslint-disable no-unused-vars */
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
  createdAt: Date;
};

export interface Repository {
  findUserByCredentials(email: string, password: string): Promise<User | null>;
  getUserById(userId: string | null): Promise<User | null>;
  createSession(userId: string): Promise<string>;
  destroySession(token: string): Promise<void>;
  getUserBySession(token: string | undefined): Promise<User | null>;
  getProjectsByOwner(ownerId: string): Promise<Project[]>;
  createProject(ownerId: string, name: string): Promise<Project>;
  getProjectById(projectId: string): Promise<Project | null>;
  getChaptersByProject(projectId: string): Promise<Chapter[]>;
  createChapter(projectId: string, name: string): Promise<Chapter>;
  renameChapter(chapterId: string, name: string): Promise<Chapter | null>;
  deleteChapter(chapterId: string): Promise<boolean>;
  getChapterById(chapterId: string): Promise<Chapter | null>;
  saveChapterPages(chapterId: string, pages: ChapterPage[]): Promise<Chapter | null>;
  listUsers(): Promise<User[]>;
}
