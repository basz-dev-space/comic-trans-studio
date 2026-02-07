import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { FabricImage, IText, StaticCanvas, Textbox } from 'fabric';

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const buildFabricOptions = (object: any) => ({
  left: object.left ?? 0,
  top: object.top ?? 0,
  width: object.width,
  height: object.height,
  scaleX: object.scaleX ?? 1,
  scaleY: object.scaleY ?? 1,
  angle: object.angle ?? 0,
  opacity: object.opacity ?? 1,
  flipX: object.flipX ?? false,
  flipY: object.flipY ?? false,
  skewX: object.skewX ?? 0,
  skewY: object.skewY ?? 0,
  originX: object.originX,
  originY: object.originY,
  stroke: object.stroke,
  strokeWidth: object.strokeWidth,
  fill: object.fill,
  backgroundColor: object.backgroundColor
});

const buildPageCanvasDataUrl = async (page: any): Promise<string> => {
  const el = document.createElement('canvas');
  const canvas = new StaticCanvas(el, {
    width: page.width || 900,
    height: page.height || 1200,
    backgroundColor: '#ffffff'
  });

  if (page.backgroundSrc) {
    try {
      const background = await FabricImage.fromURL(page.backgroundSrc);
      const scale = Math.min((page.width || 900) / background.width!, (page.height || 1200) / background.height!);
      background.set({ left: 0, top: 0, selectable: false, evented: false, scaleX: scale, scaleY: scale });
      canvas.add(background);
      canvas.sendObjectToBack(background);
    } catch {
      // ignore background rendering errors
    }
  }

  for (const object of page.objects || []) {
    if (object.type === 'image' && object.src) {
      try {
        const image = await FabricImage.fromURL(object.src);
        image.set(buildFabricOptions(object));
        canvas.add(image);
      } catch {
        continue;
      }
    }

    if (object.type === 'i-text' || object.type === 'textbox' || object.type === 'text') {
      const textOptions = {
        ...buildFabricOptions(object),
        fontSize: Number(object.fontSize || 36),
        fontFamily: object.fontFamily,
        fontWeight: object.fontWeight,
        fontStyle: object.fontStyle,
        textAlign: object.textAlign,
        lineHeight: object.lineHeight,
        charSpacing: object.charSpacing,
        underline: object.underline,
        linethrough: object.linethrough,
        overline: object.overline
      };

      const text =
        object.type === 'textbox'
          ? new Textbox(object.text || '', textOptions)
          : new IText(object.text || '', textOptions);

      canvas.add(text);
    }
  }

  canvas.renderAll();
  const out = canvas.toDataURL({ format: 'png', multiplier: 2 });
  canvas.dispose();
  return out;
};

export const exportProjectZip = async (store: any) => {
  const zip = new JSZip();
  zip.file('project.json', JSON.stringify(store.toJSON(), null, 2));

  for (let i = 0; i < store.pages.length; i += 1) {
    const dataUrl = await buildPageCanvasDataUrl(store.pages[i]);
    const base64Data = dataUrl.split(',')[1] || '';
    zip.file(`page-${i + 1}.png`, base64Data, { base64: true });
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, 'comictrans-export.zip');
};

export const exportProjectPdf = async (store: any) => {
  if (!store.pages.length) return;

  const firstDataUrl = await buildPageCanvasDataUrl(store.pages[0]);
  const firstImg = new Image();
  await new Promise<void>((resolve) => {
    firstImg.onload = () => resolve();
    firstImg.src = firstDataUrl;
  });

  const pdf = new jsPDF({
    orientation: firstImg.width >= firstImg.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [firstImg.width, firstImg.height]
  });

  pdf.addImage(firstDataUrl, 'PNG', 0, 0, firstImg.width, firstImg.height);

  for (let i = 1; i < store.pages.length; i += 1) {
    const dataUrl = await buildPageCanvasDataUrl(store.pages[i]);
    const pageImg = new Image();
    await new Promise<void>((resolve) => {
      pageImg.onload = () => resolve();
      pageImg.src = dataUrl;
    });

    pdf.addPage([pageImg.width, pageImg.height], pageImg.width >= pageImg.height ? 'landscape' : 'portrait');
    pdf.addImage(dataUrl, 'PNG', 0, 0, pageImg.width, pageImg.height);
  }

  pdf.save('comictrans-export.pdf');
};
