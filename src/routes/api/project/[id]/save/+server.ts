import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/data';

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const user = locals.user;
  if (!user) throw error(403, 'Unauthorized');

  const project = db.getProjectById(params.id);
  if (!project || project.ownerId !== user.id) throw error(403, 'Forbidden');

  const payload = await request.json();
  const chapterId = String(payload.chapterId ?? '');
  const pages = Array.isArray(payload.pages) ? payload.pages : [];

  const chapter = db.getChapterById(chapterId);
  if (!chapter || chapter.projectId !== project.id) throw error(403, 'Forbidden');

  db.saveChapterPages(chapter.id, pages);
  return json({ ok: true });
};
