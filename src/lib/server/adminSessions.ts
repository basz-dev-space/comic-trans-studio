import { randomBytes, randomUUID } from 'node:crypto';

const sessions = new Map<string, { expiresAt: number }>();
const TTL_MS = Number(process.env.ADMIN_SESSION_TTL_MS ?? String(1000 * 60 * 60 * 24)); // 24h default

const secureToken = () => {
  try {
    return randomUUID();
  } catch {
    return randomBytes(32).toString('hex');
  }
};

const cleanup = () => {
  const now = Date.now();
  for (const [k, v] of sessions) if (v.expiresAt < now) sessions.delete(k);
};

setInterval(cleanup, 1000 * 60 * 30).unref?.(); // cleanup every 30 minutes

export const createAdminSession = async () => {
  const token = secureToken();
  sessions.set(token, { expiresAt: Date.now() + TTL_MS });
  return token;
};

export const validateAdminSession = async (token: string | undefined) => {
  if (!token) return false;
  const meta = sessions.get(token);
  if (!meta) return false;
  if (meta.expiresAt < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
};

export const destroyAdminSession = async (token: string | undefined) => {
  if (!token) return;
  sessions.delete(token);
};

export const _adminSessions_internal = { sessions };
