import { redirect, type Handle } from '@sveltejs/kit';
import { db } from '$lib/server/data';

const isProtectedPath = (pathname: string) =>
  pathname.startsWith('/projects') || pathname.startsWith('/project') || pathname.startsWith('/api/project');

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');
  const user = db.getUserBySession(token);
  event.locals.user = user;

  if (!user && isProtectedPath(event.url.pathname)) {
    if (event.url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'content-type': 'application/json' }
      });
    }
    throw redirect(303, '/login');
  }

  if (user && event.url.pathname.startsWith('/project/')) {
    const segments = event.url.pathname.split('/').filter(Boolean);

    if (segments[1] === 'chapter') {
      const chapter = db.getChapterById(segments[2]);
      const project = chapter ? db.getProjectById(chapter.projectId) : null;
      if (!chapter || !project || project.ownerId !== user.id) {
        throw redirect(303, '/projects');
      }
    } else if (segments[1]) {
      const project = db.getProjectById(segments[1]);
      if (!project || project.ownerId !== user.id) {
        throw redirect(303, '/projects');
      }
    }
  }

  return resolve(event);
};
