import type { PageServerLoad } from './$types';
import { db } from '$lib/server/data';

export const load: PageServerLoad = ({ params }) => {
  const chapter = db.getChapterById(params.id)!;
  const project = db.getProjectById(chapter.projectId)!;

  return {
    chapterId: chapter.id,
    projectId: project.id,
    chapterName: chapter.name,
    pages: chapter.pages
  };
};
