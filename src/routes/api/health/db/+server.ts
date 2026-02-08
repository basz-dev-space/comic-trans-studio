import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { checkPrismaConnection, getDatabaseUrlInfo, hasDatabaseUrl } from '$lib/server/db/prisma';

export const GET: RequestHandler = async () => {
  const result = await checkPrismaConnection();
  const urlInfo = getDatabaseUrlInfo();

  const status = result.ok ? 200 : hasDatabaseUrl() ? 503 : 500;

  return json(
    {
      ok: result.ok,
      mode: result.mode,
      message: result.message,
      hasDatabaseUrl: hasDatabaseUrl(),
      envKey: result.envKey,
      configuredEnvKey: urlInfo?.key ?? null
    },
    { status }
  );
};
