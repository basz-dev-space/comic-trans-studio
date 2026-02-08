import type { Actions, PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getRepository } from '$lib/server/repository';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user!;
  const repo = await getRepository();

  try {
    const projects = await repo.getProjectsByOwner(user.id);
    return {
      user: { id: user.id, name: user.name },
      projects
    };
  } catch (err) {
    console.error('[projects] Failed to load projects', err);
    throw error(503, 'Service unavailable');
  }
};

export const actions: Actions = {
  createProject: async ({ request, locals }) => {
    const user = locals.user!;
    const data = await request.formData();
    const name = String(data.get('name') ?? '').trim() || 'Untitled Project';
    const repo = await getRepository();
    try {
      await repo.createProject(user.id, name);
      return { success: true };
    } catch (err) {
      console.error('[projects] createProject failed', err);
      return fail(500, { error: 'Could not create project' });
    }
  }
};
