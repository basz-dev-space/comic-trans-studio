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
    // Surface the error so the runtime (or deploy) can detect infrastructure issues.
    throw new Error('Failed to connect to the database');
  }
};

export const getRepository = async () => {
  repositoryPromise ??= createRepository();
  return repositoryPromise;
};
