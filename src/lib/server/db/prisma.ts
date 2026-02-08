import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

const DATABASE_URL_KEYS = [
  'DATABASE_URL',
  'PRISMA_DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
  'PGDATABASE_URL'
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

let prismaClient: PrismaClient | null = null;

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
    const pathValue = process.env[key]?.trim();
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
  for (const key of DATABASE_URL_KEYS) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return { key, value: value.trim() };
    }
  }

  return readEnvFilePath() ?? readEnvFile();
};

export const getDatabaseUrlInfo = () => findDatabaseUrl();

export const hasDatabaseUrl = () => Boolean(findDatabaseUrl());

export const getPrismaClient = () => {
  if (!prismaClient) {
    const info = findDatabaseUrl();

    prismaClient = new PrismaClient({
      datasources: info ? { db: { url: info.value } } : undefined,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
    });
  }

  return prismaClient;
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
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      mode: 'connect_error' as const,
      message,
      envKey: info.key
    };
  }
};
