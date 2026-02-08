import bcrypt from 'bcryptjs';
import type { Chapter, Project, Repository, User } from './types';

const mapUser = (row: any): User => ({
  id: row.id,
  email: row.email,
  password: row.passwordHash,
  name: row.name
});

const mapProject = (row: any): Project => ({
  id: row.id,
  ownerId: row.ownerId,
  name: row.name,
  chapterIds: (row.chapters ?? []).map((chapter: any) => chapter.id)
});

const mapChapter = (row: any): Chapter => ({
  id: row.id,
  projectId: row.projectId,
  name: row.name,
  pages: (row.pages ?? [])
    .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
    .map((page: any) => ({
      id: page.id,
      name: page.name,
      width: page.width,
      height: page.height,
      backgroundSrc: page.backgroundSrc ?? undefined,
      objects: (page.textBoxes ?? []).map((box: any) => ({
        id: box.stableId,
        type: box.type,
        text: box.text,
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        angle: box.angle,
        fontSize: box.fontSize,
        fontFamily: box.fontFamily,
        fill: box.fill,
        lineHeight: box.lineHeight
      }))
    }))
});

export const createPrismaRepository = (prisma: any): Repository => ({
  async findUserByCredentials(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? mapUser(user) : null;
  },
  async getUserById(userId) {
    if (!userId) return null;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? mapUser(user) : null;
  },
  async createSession(userId) {
    const session = await prisma.session.create({ data: { userId, token: crypto.randomUUID() } });
    return session.token;
  },
  async destroySession(token) {
    await prisma.session.deleteMany({ where: { token } });
  },
  async getUserBySession(token) {
    if (!token) return null;
    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
    return session?.user ? mapUser(session.user) : null;
  },
  async getProjectsByOwner(ownerId) {
    const rows = await prisma.project.findMany({ where: { ownerId }, include: { chapters: true }, orderBy: { updatedAt: 'desc' } });
    return rows.map(mapProject);
  },
  async createProject(ownerId, name) {
    const project = await prisma.project.create({
      data: {
        ownerId,
        name,
        chapters: {
          create: {
            name: 'Chapter 1',
            orderIndex: 0,
            pages: { create: { name: 'Page 1', width: 900, height: 1200, orderIndex: 0 } }
          }
        }
      },
      include: { chapters: true }
    });
    return mapProject(project);
  },
  async getProjectById(projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId }, include: { chapters: true } });
    return project ? mapProject(project) : null;
  },
  async getChaptersByProject(projectId) {
    const chapters = await prisma.chapter.findMany({
      where: { projectId },
      include: { pages: { include: { textBoxes: true }, orderBy: { orderIndex: 'asc' } } },
      orderBy: { orderIndex: 'asc' }
    });
    return chapters.map(mapChapter);
  },
  async createChapter(projectId, name) {
    const maxOrder = await prisma.chapter.aggregate({ where: { projectId }, _max: { orderIndex: true } });
    const orderIndex = (maxOrder._max.orderIndex ?? -1) + 1;
    const chapter = await prisma.chapter.create({
      data: {
        projectId,
        name,
        orderIndex,
        pages: { create: { name: 'Page 1', width: 900, height: 1200, orderIndex: 0 } }
      },
      include: { pages: { include: { textBoxes: true } } }
    });
    return mapChapter(chapter);
  },
  async renameChapter(chapterId, name) {
    const chapter = await prisma.chapter.update({ where: { id: chapterId }, data: { name }, include: { pages: { include: { textBoxes: true } } } }).catch(() => null);
    return chapter ? mapChapter(chapter) : null;
  },
  async deleteChapter(chapterId) {
    const deleted = await prisma.chapter.deleteMany({ where: { id: chapterId } });
    return deleted.count > 0;
  },
  async getChapterById(chapterId) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { pages: { include: { textBoxes: true }, orderBy: { orderIndex: 'asc' } } }
    });
    return chapter ? mapChapter(chapter) : null;
  },
  async saveChapterPages(chapterId, pages) {
    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter) return null;

    // To avoid unique constraint collisions when updating orderIndex, first move
    // all existing pages to a high temporary offset, then write final indexes.
    const OFFSET = 100000;

    await prisma.$transaction(async (tx: any) => {
      const existingPages = await tx.page.findMany({ where: { chapterId } });
      const existingPageIds = new Set(existingPages.map((page: any) => page.id));
      const incomingPageIds = new Set(pages.map((page) => page.id));

      // Move existing pages to a high offset to avoid per-statement unique collisions
      for (const existing of existingPages) {
        await tx.page.update({ where: { id: existing.id }, data: { orderIndex: existing.orderIndex + OFFSET } });
      }

      // Delete pages that are no longer present
      for (const existing of existingPages) {
        if (!incomingPageIds.has(existing.id)) {
          await tx.page.delete({ where: { id: existing.id } });
        }
      }

      // Create or update incoming pages with final indexes
      for (const [index, page] of pages.entries()) {
        if (existingPageIds.has(page.id)) {
          await tx.page.update({
            where: { id: page.id },
            data: {
              orderIndex: index,
              name: page.name,
              width: Math.round(page.width),
              height: Math.round(page.height),
              backgroundSrc: page.backgroundSrc ?? null
            }
          });
        } else {
          await tx.page.create({
            data: {
              id: page.id,
              chapterId,
              orderIndex: index,
              name: page.name,
              width: Math.round(page.width),
              height: Math.round(page.height),
              backgroundSrc: page.backgroundSrc ?? null
            }
          });
        }

        await tx.textBox.deleteMany({ where: { pageId: page.id } });
        if (page.objects.length > 0) {
          await tx.textBox.createMany({
            data: page.objects.map((obj: any) => ({
              pageId: page.id,
              stableId: String(obj.id),
              type: String(obj.type ?? 'i-text'),
              text: String(obj.text ?? ''),
              left: Number(obj.left ?? 0),
              top: Number(obj.top ?? 0),
              width: Number(obj.width ?? 1),
              height: Number(obj.height ?? 1),
              angle: Number(obj.angle ?? 0),
              fontSize: Number(obj.fontSize ?? 16),
              fontFamily: String(obj.fontFamily ?? 'Inter'),
              fill: String(obj.fill ?? '#ffffff'),
              lineHeight: Number(obj.lineHeight ?? 1.2)
            }))
          });
        }
      }
    });

    const refreshed = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { pages: { include: { textBoxes: true }, orderBy: { orderIndex: 'asc' } } }
    });

    return refreshed ? mapChapter(refreshed) : null;
  }
});
