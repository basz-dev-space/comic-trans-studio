import { z } from 'zod';

export const TextBoxGeometrySchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
  rotation: z.number().default(0)
});

export const TextBoxStyleSchema = z.object({
  fontSize: z.number().min(6).default(32),
  fontFamily: z.string().default('Inter'),
  color: z.string().default('#ffffff'),
  bgColor: z.string().nullable().default(null),
  bubbleShape: z.enum(['none', 'rounded', 'ellipse']).default('rounded'),
  lineHeight: z.number().min(0.8).max(3).default(1.2)
});

export const TextBoxSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  originalText: z.string(),
  geometry: TextBoxGeometrySchema,
  style: TextBoxStyleSchema
});

export const PageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  imageUrl: z.string().optional(),
  inpaintedImageUrl: z.string().optional(),
  textBoxes: z.array(TextBoxSchema).default([])
});

export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  metadata: z.object({
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
  }),
  pages: z.array(PageSchema).default([]),
  activePageId: z.number().int().nonnegative().default(0),
  selectedTextBoxId: z.string().uuid().nullable().default(null),
  showInpainted: z.boolean().default(true)
});

export type TextBox = z.infer<typeof TextBoxSchema>;
export type PageData = z.infer<typeof PageSchema>;
export type ProjectData = z.infer<typeof ProjectSchema>;
