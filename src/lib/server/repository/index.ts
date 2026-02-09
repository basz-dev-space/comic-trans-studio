import { createPrismaRepository } from './prismaRepository';
import { memoryRepository } from './memoryRepository';
import type { Repository } from './types';
import { getDatabaseUrlInfo, getPrismaClient, hasDatabaseUrl } from '$lib/server/db/prisma';

let repositoryPromise: Promise<Repository> | null = null;

const createRepository = async (): Promise<Repository> => {
  if (!hasDatabaseUrl()) {
    console.info('[repository] No DB env detected, using in-memory repository');
    return memoryRepository;
  }

  const envInfo = getDatabaseUrlInfo();
  const prisma = getPrismaClient();

  try {
    await prisma.$connect();
    console.info(`[repository] Connected with Prisma repository using ${envInfo?.key ?? 'unknown env key'}`);
    return createPrismaRepository(prisma);
  } catch (error) {
    console.error('[repository] Failed to connect Prisma.', error);
    await prisma.$disconnect().catch(() => undefined);
    // Do not fall back to in-memory repository in production scenarios.
    // Surface the original error so callers can observe the root cause and
    // so the process can react (health checks, restarts).
    throw error;
  }
};

export const getRepository = async () => {
  repositoryPromise ??= createRepository();
  try {
    return await repositoryPromise;
  } catch (err) {
    // Reset cache so transient failures can be retried on subsequent calls.
    repositoryPromise = null;
    throw err;
  }
};
