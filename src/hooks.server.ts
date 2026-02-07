import { redirect, type Handle } from '@sveltejs/kit';
import { db } from '$lib/server/data';

const isProtectedPath = (pathname: string) =>
  pathname.startsWith('/projects') || pathname.startsWith('/project') || pathname.startsWith('/api/project');

const unauthorized = (pathname: string) => {
  if (pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'content-type': 'application/json' }
    });
  }

  throw redirect(303, '/login');
};

const forbidden = (pathname: string) => {
  if (pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'content-type': 'application/json' }
    });
  }

  throw redirect(303, '/projects');
};

export const handle: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;
  const token = event.cookies.get('session');
  const user = db.getUserBySession(token);
  event.locals.user = user;

  if (!user && isProtectedPath(pathname)) {
    return unauthorized(pathname);
  }

  if (user && (pathname.startsWith('/project/') || pathname.startsWith('/api/project/'))) {
    const segments = pathname.split('/').filter(Boolean);

    if (segments[0] === 'project' && segments[1] === 'chapter' && segments[2]) {
      const chapter = db.getChapterById(segments[2]);
      const project = chapter ? db.getProjectById(chapter.projectId) : null;
      if (!chapter || !project || project.ownerId !== user.id) {
        return forbidden(pathname);
      }
    } else if (segments[0] === 'project' && segments[1]) {
      const project = db.getProjectById(segments[1]);
      if (!project || project.ownerId !== user.id) {
        return forbidden(pathname);
      }
    }

    if (segments[0] === 'api' && segments[1] === 'project' && segments[2]) {
      const project = db.getProjectById(segments[2]);
      if (!project || project.ownerId !== user.id) {
        return forbidden(pathname);
      }

      if (segments[3] === 'save' && event.request.method === 'POST') {
        try {
          const payload = await event.request.clone().json();
          const chapterId = String(payload.chapterId ?? '');
          const chapter = db.getChapterById(chapterId);
          if (!chapter || chapter.projectId !== project.id) {
            return forbidden(pathname);
          }
        } catch {
          return forbidden(pathname);
        }
      }
    }
  }

  return resolve(event);
};
