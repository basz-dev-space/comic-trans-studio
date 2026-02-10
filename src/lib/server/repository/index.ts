import { createPrismaRepository } from './prismaRepository';
import type { Repository } from './types';
import { getPrismaClient, hasDatabaseUrl } from '$lib/server/db/prisma';

let repositoryPromise: Promise<Repository> | null = null;

const createRepository = async (): Promise<Repository> => {
  if (!hasDatabaseUrl()) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
        'Please configure a SQLite database URL (e.g., file:./dev.db) in your .env file.'
    );
  }

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
