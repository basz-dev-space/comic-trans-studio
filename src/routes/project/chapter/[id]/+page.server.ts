import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getRepository } from '$lib/server/repository';

export const load: PageServerLoad = async ({ params }) => {
  const repo = await getRepository();
  const chapter = await repo.getChapterById(params.id);
  if (!chapter) {
    throw error(404, 'Chapter not found');
  }

  const project = await repo.getProjectById(chapter.projectId);
  if (!project) {
    throw error(404, 'Project not found');
  }

  return {
    chapterId: chapter.id,
    projectId: project.id,
    chapterName: chapter.name,
    pages: chapter.pages
  };
};
