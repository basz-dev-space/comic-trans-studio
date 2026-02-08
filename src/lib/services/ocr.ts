import { TextBoxSchema, type TextBox } from '$lib/schemas/editor';

export type OcrBlock = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function runOCR(image: Blob | string): Promise<OcrBlock[]> {
  if (!image) return [];
  try {
    // If image is a blob, send as FormData; if string (data URL), send JSON
    let res: Response;
    if (typeof image === 'string') {
      res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imageUrl: image })
      });
    } else {
      const fd = new FormData();
      fd.append('file', image as Blob, 'image.png');
      res = await fetch('/api/ocr', { method: 'POST', body: fd });
    }

    if (!res.ok) {
      console.warn('OCR API returned non-ok response', res.status);
      return [];
    }

    const payload = await res.json();
    // Expecting payload.blocks: OcrBlock[]
    if (Array.isArray(payload?.blocks)) return payload.blocks as OcrBlock[];
    return [];
  } catch (err) {
    console.error('runOCR failed', err);
    return [];
  }
}

export function normalizeOCRToTextBoxes(
  blocks: OcrBlock[],
  canvas: { width: number; height: number }
): TextBox[] {
  return blocks.map((block) =>
    TextBoxSchema.parse({
      id: crypto.randomUUID(),
      text: block.text,
      originalText: block.text,
      geometry: {
        x: Math.round(block.x * canvas.width),
        y: Math.round(block.y * canvas.height),
        w: Math.round(block.width * canvas.width),
        h: Math.round(block.height * canvas.height),
        rotation: 0
      },
      style: {
        fontSize: 28,
        fontFamily: 'Inter',
        color: '#ffffff',
        bgColor: 'rgba(15,23,42,0.65)',
        bubbleShape: 'rounded',
        lineHeight: 1.2
      }
    })
  );
}
