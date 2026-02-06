import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/data';

export const load: PageServerLoad = ({ locals }) => {
  const user = locals.user;
  if (!user) throw redirect(303, '/login');

  return {
    user: { id: user.id, name: user.name },
    projects: db.getProjectsByOwner(user.id)
  };
};

export const actions: Actions = {
  createProject: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) throw redirect(303, '/login');

    const data = await request.formData();
    const name = String(data.get('name') ?? '').trim() || 'Untitled Project';
    db.createProject(user.id, name);
    return { success: true };
  }
};
