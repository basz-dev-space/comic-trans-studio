import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/data';

export const load: PageServerLoad = ({ params }) => {
  const chapter = db.getChapterById(params.id);
  if (!chapter) {
    throw error(404, 'Chapter not found');
  }

  const project = db.getProjectById(chapter.projectId);
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
