import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/data';

export const POST: RequestHandler = async ({ params, request }) => {
  const payload = await request.json();
  const chapterId = String(payload.chapterId ?? '');
  const pages = Array.isArray(payload.pages) ? payload.pages : [];

  const project = db.getProjectById(params.id);
  const chapter = db.getChapterById(chapterId);
  if (!project || !chapter || chapter.projectId !== project.id) {
    throw error(403, 'Forbidden');
  }

  db.saveChapterPages(chapter.id, pages);
  return json({ ok: true });
};
