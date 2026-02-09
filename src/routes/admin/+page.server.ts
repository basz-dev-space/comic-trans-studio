import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/db/prisma';
import { getRepository } from '$lib/server/repository';
import { createAdminSession, validateAdminSession, destroyAdminSession } from '$lib/server/adminSessions';
import bcrypt from 'bcryptjs';

const ADMIN_COOKIE = 'admin_session';

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get(ADMIN_COOKIE);
  const admin = await validateAdminSession(token);
  if (!admin) return { admin: false };

  try {
    const repo = await getRepository();
    const users = await repo.listUsers();
    return { admin: true, users };
  } catch (error) {
    console.error('[admin] Failed to load users', error);
    // Admin access still allowed, but return an empty list if the DB/ repo is
    // unavailable so the page can render without crashing.
    return { admin: true, users: [] };
  }
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = String(data.get('username') ?? '');
    const password = String(data.get('password') ?? '');

    const envUser = process.env.ADMIN_USERNAME ?? '';
    const envPass = process.env.ADMIN_PASSWORD ?? '';

    if (!envUser || !envPass) return fail(500, { error: 'Admin credentials not configured' });

    if (username === envUser && password === envPass) {
      const token = await createAdminSession();
      cookies.set(ADMIN_COOKIE, token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      throw redirect(303, '/admin');
    }

    return fail(401, { error: 'Invalid credentials' });
  },

  logout: async ({ cookies }) => {
    const token = cookies.get(ADMIN_COOKIE);
    await destroyAdminSession(token);
    cookies.delete(ADMIN_COOKIE, { path: '/' });
    throw redirect(303, '/');
  },

  createUser: async ({ request, cookies }) => {
    const token = cookies.get(ADMIN_COOKIE);
    const admin = await validateAdminSession(token);
    if (!admin) return fail(403, { error: 'Forbidden' });

    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '').trim();
    const name = String(data.get('name') ?? '').trim() || 'User';

    if (!email || !password) return fail(400, { error: 'Email and password required' });

    try {
      const prisma = getPrismaClient();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return fail(409, { error: 'User already exists' });

      const hash = await bcrypt.hash(password, 10);
      await prisma.user.create({ data: { email, passwordHash: hash, name } });
      return { success: true };
    } catch (error) {
      console.error('[admin] createUser failed', error);
      return fail(500, { error: 'Failed to create user' });
    }
  }
};
