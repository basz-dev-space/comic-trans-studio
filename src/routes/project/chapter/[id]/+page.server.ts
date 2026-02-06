import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/data';

export const load: PageServerLoad = ({ params, locals }) => {
  const user = locals.user;
  if (!user) throw redirect(303, '/login');

  const chapter = db.getChapterById(params.id);
  if (!chapter) throw redirect(303, '/projects');

  const project = db.getProjectById(chapter.projectId);
  if (!project || project.ownerId !== user.id) throw redirect(303, '/projects');

  return {
    chapterId: chapter.id,
    projectId: project.id,
    chapterName: chapter.name,
    pages: chapter.pages
  };
};
