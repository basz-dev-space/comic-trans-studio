import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/db/prisma';
import {
  createAdminSession,
  validateAdminSession,
  destroyAdminSession
} from '$lib/server/adminSessions';

const ADMIN_COOKIE = 'admin_session';

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get(ADMIN_COOKIE);
  const admin = await validateAdminSession(token);
  if (!admin) return { admin: false };

  try {
    const prisma = getPrismaClient();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, createdAt: true }
    });
    return { admin: true, users };
  } catch (error) {
    console.error('[admin] Failed to load users', error);
    return { admin: true, users: [] };
  }
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = String(data.get('username') ?? '').trim();
    const password = String(data.get('password') ?? '');

    if (!username || !password) {
      return fail(400, { error: 'Username and password required', form: { username } });
    }

    const envUser = process.env.ADMIN_USERNAME ?? '';
    const envPass = process.env.ADMIN_PASSWORD ?? '';

    if (!envUser || !envPass)
      return fail(500, { error: 'Admin credentials not configured', form: { username } });

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

    return fail(401, { error: 'Invalid credentials', form: { username } });
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
    const password = String(data.get('password') ?? '');
    const name = String(data.get('name') ?? '').trim() || 'User';

    if (!email || !password) {
      return fail(400, { error: 'Email and password required', form: { email, name } });
    }

    if (password.length < 6) {
      return fail(400, { error: 'Password must be at least 6 characters', form: { email, name } });
    }

    try {
      const prisma = getPrismaClient();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return fail(409, { error: 'User already exists', form: { email, name } });
      }

      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash(password, 10);
      await prisma.user.create({ data: { email, passwordHash: hash, name } });
      return { success: true, form: { email: '', name: '' } };
    } catch (error) {
      console.error('[admin] createUser failed', error);
      return fail(500, { error: 'Failed to create user', form: { email, name } });
    }
  },

  deleteUser: async ({ request, cookies }) => {
    const token = cookies.get(ADMIN_COOKIE);
    const admin = await validateAdminSession(token);
    if (!admin) return fail(403, { error: 'Forbidden' });

    const data = await request.formData();
    const userId = String(data.get('userId') ?? '').trim();

    if (!userId) {
      return fail(400, { error: 'User ID required' });
    }

    try {
      const prisma = getPrismaClient();
      await prisma.user.delete({ where: { id: userId } });
      return { success: true };
    } catch (error) {
      console.error('[admin] deleteUser failed', error);
      return fail(500, { error: 'Failed to delete user' });
    }
  }
};
