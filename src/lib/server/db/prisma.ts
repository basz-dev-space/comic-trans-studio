import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';

const DATABASE_URL_KEYS = [
  'DATABASE_URL',
  'PRISMA_DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
  'PGDATABASE'
] as const;

const DATABASE_URL_FILE_KEYS = [
  'DATABASE_URL_FILE',
  'PRISMA_DATABASE_URL_FILE',
  'POSTGRES_PRISMA_URL_FILE',
  'POSTGRES_URL_FILE',
  'PGDATABASE_URL_FILE'
] as const;

const DOTENV_CANDIDATES = ['.env.local', '.env', '.env.production.local', '.env.production'];

type DatabaseUrlKey = (typeof DATABASE_URL_KEYS)[number];
type DatabaseUrlFileKey = (typeof DATABASE_URL_FILE_KEYS)[number];

type DatabaseUrlInfo = {
  key: DatabaseUrlKey | DatabaseUrlFileKey | 'dotenv:DATABASE_URL';
  value: string;
};

let cachedDatabaseInfo: DatabaseUrlInfo | null | undefined;

// Persist PrismaClient across HMR / module reloads to avoid connection storms
const GLOBAL_PRISMA_KEY = '__prismaClient';

const parseDotEnv = (content: string) => {
  const parsed: Record<string, string> = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const rawKey = trimmed.slice(0, idx).trim();
    const rawValue = trimmed.slice(idx + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');
    parsed[rawKey] = value;
  }
  return parsed;
};

const readEnvFile = () => {
  // In SvelteKit, .env files are loaded automatically by Vite
  // So we check if DATABASE_URL is available in env
  const url = env.DATABASE_URL?.trim();
  if (url) {
    return {
      key: 'dotenv:DATABASE_URL' as const,
      value: url
    };
  }

  // Fallback: read .env files manually (for edge cases)
  for (const fileName of DOTENV_CANDIDATES) {
    const filePath = resolve(process.cwd(), fileName);
    if (!existsSync(filePath)) continue;

    try {
      const values = parseDotEnv(readFileSync(filePath, 'utf8'));
      const url = values.DATABASE_URL?.trim();
      if (url) {
        return {
          key: 'dotenv:DATABASE_URL' as const,
          value: url
        };
      }
    } catch {
      continue;
    }
  }

  return null;
};

const readEnvFilePath = (): DatabaseUrlInfo | null => {
  for (const key of DATABASE_URL_FILE_KEYS) {
    const pathValue = env[key]?.trim();
    if (!pathValue) continue;
    try {
      const contents = readFileSync(pathValue, 'utf8').trim();
      if (contents) return { key, value: contents };
    } catch {
      continue;
    }
  }

  return null;
};

const findDatabaseUrl = (): DatabaseUrlInfo | null => {
  if (cachedDatabaseInfo !== undefined) return cachedDatabaseInfo;

  for (const key of DATABASE_URL_KEYS) {
    const value = env[key];
    if (value && value.trim().length > 0) {
      cachedDatabaseInfo = { key, value: value.trim() };
      return cachedDatabaseInfo;
    }
  }

  cachedDatabaseInfo = readEnvFilePath() ?? readEnvFile();
  return cachedDatabaseInfo ?? null;
};

export const getDatabaseUrlInfo = () => findDatabaseUrl();

export const hasDatabaseUrl = () => Boolean(findDatabaseUrl());

export const getPrismaClient = () => {
  const globalAny = globalThis as any;
  if (globalAny[GLOBAL_PRISMA_KEY]) return globalAny[GLOBAL_PRISMA_KEY] as PrismaClient;

  const info = findDatabaseUrl();
  const client = new PrismaClient({
    datasources: info ? { db: { url: info.value } } : undefined,
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

  globalAny[GLOBAL_PRISMA_KEY] = client;
  return client;
};

export const checkPrismaConnection = async () => {
  const info = findDatabaseUrl();
  if (!info) {
    return {
      ok: false,
      mode: 'missing_env' as const,
      message: `No database URL found. Checked keys: ${DATABASE_URL_KEYS.join(', ')}, ${DATABASE_URL_FILE_KEYS.join(', ')}, and ${DOTENV_CANDIDATES.join(', ')}`,
      envKey: null
    };
  }

  let prisma: PrismaClient;

  try {
    prisma = getPrismaClient();
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return {
      ok: true,
      mode: 'connected' as const,
      message: 'Connected to database',
      envKey: info.key
    };
  } catch (error) {
    console.error('[db] Prisma connection health check failed', error);
    return {
      ok: false,
      mode: 'connect_error' as const,
      message: 'Unable to connect to the database',
      envKey: info.key
    };
  }
};
