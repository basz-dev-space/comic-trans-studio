import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getRepository } from '$lib/server/repository';

export const load: PageServerLoad = ({ locals }) => {
  if (locals.user) {
    throw redirect(303, '/projects');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '');
    const password = String(data.get('password') ?? '');
    const repo = await getRepository();

    const user = await repo.findUserByCredentials(email, password);
    if (!user) {
      return fail(400, { error: 'Invalid credentials', email });
    }

    const token = await repo.createSession(user.id);
    cookies.set('session', token, { path: '/', httpOnly: true, sameSite: 'lax' });
    throw redirect(303, '/projects');
  }
};
