import { createPrismaRepository } from './prismaRepository';
import type { Repository } from './types';
import { getPrismaClient, hasDatabaseUrl } from '$lib/server/db/prisma';

let repositoryPromise: Promise<Repository> | null = null;

const createRepository = async (): Promise<Repository> => {
  const prisma = getPrismaClient();

  try {
    await prisma.$connect();
    console.info('[repository] Connected with Prisma repository (SQLite)');
    return createPrismaRepository(prisma);
  } catch (error) {
    console.error('[repository] Failed to connect Prisma.', error);
    await prisma.$disconnect().catch(() => undefined);
    throw error;
  }
};

export const getRepository = async () => {
  repositoryPromise ??= createRepository();
  try {
    return await repositoryPromise;
  } catch (err) {
    repositoryPromise = null;
    throw err;
  }
};
