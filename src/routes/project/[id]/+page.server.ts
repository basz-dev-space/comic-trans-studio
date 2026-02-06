import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/data';

export const load: PageServerLoad = ({ params, locals }) => {
  const user = locals.user;
  if (!user) throw redirect(303, '/login');

  const project = db.getProjectById(params.id);
  if (!project || project.ownerId !== user.id) throw redirect(303, '/projects');

  return {
    project,
    chapters: db.getChaptersByProject(project.id)
  };
};

export const actions: Actions = {
  createChapter: async ({ request, params, locals }) => {
    const user = locals.user;
    if (!user) throw redirect(303, '/login');

    const project = db.getProjectById(params.id);
    if (!project || project.ownerId !== user.id) throw error(403, 'Forbidden');

    const data = await request.formData();
    const name = String(data.get('name') ?? '').trim() || `Chapter ${project.chapterIds.length + 1}`;
    db.createChapter(project.id, name);
    return { success: true };
  },
  renameChapter: async ({ request, params, locals }) => {
    const user = locals.user;
    if (!user) throw redirect(303, '/login');

    const project = db.getProjectById(params.id);
    if (!project || project.ownerId !== user.id) throw error(403, 'Forbidden');

    const data = await request.formData();
    const chapterId = String(data.get('chapterId') ?? '');
    const name = String(data.get('name') ?? '').trim();
    if (chapterId && name) db.renameChapter(chapterId, name);
    return { success: true };
  },
  deleteChapter: async ({ request, params, locals }) => {
    const user = locals.user;
    if (!user) throw redirect(303, '/login');

    const project = db.getProjectById(params.id);
    if (!project || project.ownerId !== user.id) throw error(403, 'Forbidden');

    const data = await request.formData();
    const chapterId = String(data.get('chapterId') ?? '');
    if (chapterId) db.deleteChapter(chapterId);
    return { success: true };
  }
};
