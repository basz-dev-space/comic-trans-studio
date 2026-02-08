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

  return [
    { text: 'Sample OCR text', x: 0.08, y: 0.1, width: 0.4, height: 0.12 },
    { text: 'Second line', x: 0.12, y: 0.32, width: 0.35, height: 0.1 }
  ];
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
