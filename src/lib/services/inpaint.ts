import type { TextBox } from '$lib/schemas/editor';

export async function inpaintPage(imageUrl: string | undefined, textBoxes: TextBox[]) {
  if (!imageUrl) return undefined;

  const mask = textBoxes.map((box) => ({
    x: box.geometry.x,
    y: box.geometry.y,
    w: box.geometry.w,
    h: box.geometry.h
  }));

  void mask;

  return imageUrl;
}
