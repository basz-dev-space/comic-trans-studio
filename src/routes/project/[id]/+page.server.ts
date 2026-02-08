import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getRepository } from '$lib/server/repository';

export const load: PageServerLoad = async ({ params }) => {
  const repo = await getRepository();
  const project = await repo.getProjectById(params.id);
  if (!project) throw error(404, 'Project not found');

  return {
    project,
    chapters: await repo.getChaptersByProject(project.id)
  };
};

export const actions: Actions = {
  createChapter: async ({ request, params }) => {
    const repo = await getRepository();
    const project = await repo.getProjectById(params.id);
    if (!project) throw error(404, 'Project not found');

    const data = await request.formData();
    const name = String(data.get('name') ?? '').trim() || `Chapter ${project.chapterIds.length + 1}`;
    await repo.createChapter(project.id, name);
    return { success: true };
  },
  renameChapter: async ({ request, params }) => {
    const repo = await getRepository();
    const data = await request.formData();
    const chapterId = String(data.get('chapterId') ?? '');
    const name = String(data.get('name') ?? '').trim();
    const chapter = await repo.getChapterById(chapterId);

    if (!chapter || chapter.projectId !== params.id) {
      throw error(403, 'Forbidden');
    }

    if (name) {
      const updated = await repo.renameChapter(chapterId, name);
      if (!updated) {
        return { success: false, error: 'Could not rename chapter' };
      }
    }

    return { success: true };
  },
  deleteChapter: async ({ request, params }) => {
    const repo = await getRepository();
    const data = await request.formData();
    const chapterId = String(data.get('chapterId') ?? '');
    const chapter = await repo.getChapterById(chapterId);

    if (!chapter || chapter.projectId !== params.id) {
      throw error(403, 'Forbidden');
    }

    await repo.deleteChapter(chapterId);
    return { success: true };
  }
};
