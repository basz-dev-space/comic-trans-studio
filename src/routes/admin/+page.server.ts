import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/db/prisma';
import bcrypt from 'bcryptjs';

const ADMIN_COOKIE = 'admin_session';

export const load: PageServerLoad = async ({ cookies }) => {
  const admin = cookies.get(ADMIN_COOKIE) === '1';
  if (!admin) return { admin: false };

  const prisma = getPrismaClient();
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } });
  return { admin: true, users };
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
      cookies.set(ADMIN_COOKIE, '1', { path: '/', httpOnly: true, sameSite: 'lax' });
      throw redirect(303, '/admin');
    }

    return fail(401, { error: 'Invalid credentials' });
  },

  logout: async ({ cookies }) => {
    cookies.delete(ADMIN_COOKIE, { path: '/' });
    throw redirect(303, '/');
  },

  createUser: async ({ request, cookies }) => {
    const admin = cookies.get(ADMIN_COOKIE) === '1';
    if (!admin) return fail(403, { error: 'Forbidden' });

    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '').trim();
    const name = String(data.get('name') ?? '').trim() || 'User';

    if (!email || !password) return fail(400, { error: 'Email and password required' });

    const prisma = getPrismaClient();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail(409, { error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, passwordHash: hash, name } });
    return { success: true };
  }
};
