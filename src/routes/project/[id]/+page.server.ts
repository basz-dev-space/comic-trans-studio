import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/data';

export const load: PageServerLoad = ({ params }) => {
  const project = db.getProjectById(params.id)!;

  return {
    project,
    chapters: db.getChaptersByProject(project.id)
  };
};

export const actions: Actions = {
  createChapter: async ({ request, params }) => {
    const project = db.getProjectById(params.id)!;

    const data = await request.formData();
    const name = String(data.get('name') ?? '').trim() || `Chapter ${project.chapterIds.length + 1}`;
    db.createChapter(project.id, name);
    return { success: true };
  },
  renameChapter: async ({ request, params }) => {
    const data = await request.formData();
    const chapterId = String(data.get('chapterId') ?? '');
    const name = String(data.get('name') ?? '').trim();
    const chapter = db.getChapterById(chapterId);

    if (!chapter || chapter.projectId !== params.id) {
      throw error(403, 'Forbidden');
    }

    if (name) db.renameChapter(chapterId, name);
    return { success: true };
  },
  deleteChapter: async ({ request, params }) => {
    const data = await request.formData();
    const chapterId = String(data.get('chapterId') ?? '');
    const chapter = db.getChapterById(chapterId);

    if (!chapter || chapter.projectId !== params.id) {
      throw error(403, 'Forbidden');
    }

    db.deleteChapter(chapterId);
    return { success: true };
  }
};
