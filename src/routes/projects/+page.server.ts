import type { Actions, PageServerLoad } from './$types';
import { getRepository } from '$lib/server/repository';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user!;
  const repo = await getRepository();

  return {
    user: { id: user.id, name: user.name },
    projects: await repo.getProjectsByOwner(user.id)
  };
};

export const actions: Actions = {
  createProject: async ({ request, locals }) => {
    const user = locals.user!;
    const data = await request.formData();
    const name = String(data.get('name') ?? '').trim() || 'Untitled Project';
    const repo = await getRepository();
    await repo.createProject(user.id, name);
    return { success: true };
  }
};
