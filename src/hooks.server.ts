import { redirect, type Handle } from '@sveltejs/kit';
import { getRepository } from '$lib/server/repository';

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
  const repo = await getRepository();
  const user = await repo.getUserBySession(token);
  event.locals.user = user;

  if (!user && isProtectedPath(pathname)) {
    return unauthorized(pathname);
  }

  if (user && (pathname.startsWith('/project/') || pathname.startsWith('/api/project/'))) {
    const segments = pathname.split('/').filter(Boolean);

    if (segments[0] === 'project' && segments[1] === 'chapter' && segments[2]) {
      const chapter = await repo.getChapterById(segments[2]);
      const project = chapter ? await repo.getProjectById(chapter.projectId) : null;
      if (!chapter || !project || project.ownerId !== user.id) {
        return forbidden(pathname);
      }
    } else if (segments[0] === 'project' && segments[1]) {
      const project = await repo.getProjectById(segments[1]);
      if (!project || project.ownerId !== user.id) {
        return forbidden(pathname);
      }
    }

    if (segments[0] === 'project' && segments[1] && event.request.method === 'POST') {
      const actionKeys = [...event.url.searchParams.keys()];
      const actionKey = actionKeys[0] ?? '';
      const requiresChapterValidation = actionKey === '/renameChapter' || actionKey === '/deleteChapter';

      if (requiresChapterValidation) {
        try {
          const form = await event.request.clone().formData();
          const chapterId = String(form.get('chapterId') ?? '');
          const chapter = await repo.getChapterById(chapterId);
          if (!chapter || chapter.projectId !== segments[1]) {
            return forbidden(pathname);
          }
        } catch {
          return forbidden(pathname);
        }
      }
    }

    if (segments[0] === 'api' && segments[1] === 'project' && segments[2]) {
      const project = await repo.getProjectById(segments[2]);
      if (!project || project.ownerId !== user.id) {
        return forbidden(pathname);
      }

      if (segments[3] === 'save' && event.request.method === 'POST') {
        try {
          const payload = await event.request.clone().json();
          const chapterId = String(payload.chapterId ?? '');
          const chapter = await repo.getChapterById(chapterId);
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
