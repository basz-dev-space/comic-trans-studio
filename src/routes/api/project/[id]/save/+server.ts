import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { getRepository } from '$lib/server/repository';

const SavePayloadSchema = z.object({
  chapterId: z.string().min(1),
  pages: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      width: z.number().positive(),
      height: z.number().positive(),
      backgroundSrc: z.string().optional(),
      objects: z.array(
        z.object({
          id: z.string().min(1),
          type: z.string().min(1),
          text: z.string(),
          left: z.number(),
          top: z.number(),
          width: z.number().positive(),
          height: z.number().positive(),
          angle: z.number(),
          fontSize: z.number().min(1),
          fontFamily: z.string(),
          fill: z.string(),
          lineHeight: z.number().positive()
        })
      )
    })
  )
});

export const POST: RequestHandler = async ({ params, request }) => {
  const payload = SavePayloadSchema.safeParse(await request.json());
  if (!payload.success) {
    throw error(400, 'Invalid save payload');
  }

  const { chapterId, pages } = payload.data;
  const repo = await getRepository();

  const project = await repo.getProjectById(params.id);
  const chapter = await repo.getChapterById(chapterId);
  if (!project || !chapter || chapter.projectId !== project.id) {
    throw error(403, 'Forbidden');
  }

  await repo.saveChapterPages(chapter.id, pages);
  return json({ ok: true });
};
