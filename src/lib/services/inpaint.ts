import type { TextBox } from '$lib/schemas/editor';

export async function inpaintPage(imageUrl: string | undefined, textBoxes: TextBox[]) {
  if (!imageUrl) return undefined;

  const mask = textBoxes.map((box) => ({
    x: box.geometry.x,
    y: box.geometry.y,
    w: box.geometry.w,
    h: box.geometry.h
  }));

  try {
    const res = await fetch('/api/inpaint', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ imageUrl, mask })
    });

    if (!res.ok) {
      console.warn('Inpaint API returned non-ok response', res.status);
      return imageUrl;
    }

    const payload = await res.json();
    // Expecting { url: string }
    return payload?.url ?? imageUrl;
  } catch (err) {
    console.error('Inpaint failed', err);
    return imageUrl;
  }
}
