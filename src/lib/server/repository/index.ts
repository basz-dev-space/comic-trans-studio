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
    console.warn('[repository] Failed to connect Prisma. Falling back to in-memory repository.', error);
    await prisma.$disconnect().catch(() => undefined);
    return memoryRepository;
  }
};

export const getRepository = async () => {
  repositoryPromise ??= createRepository();
  return repositoryPromise;
};
