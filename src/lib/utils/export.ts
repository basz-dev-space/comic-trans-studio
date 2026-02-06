import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};

export const exportProjectZip = async (store: any) => {
  const zip = new JSZip();
  zip.file('project.json', JSON.stringify(store.toJSON(), null, 2));

  for (let i = 0; i < store.pages.length; i += 1) {
    const page = store.pages[i];
    const dataUrl = await page.toDataURL({ pixelRatio: 2, mimeType: 'image/png' });
    const base64Data = dataUrl.split(',')[1] || '';
    zip.file(`page-${i + 1}.png`, base64Data, { base64: true });
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, 'comictrans-export.zip');
};

export const exportProjectPdf = async (store: any) => {
  if (typeof store.toPDFDataURL === 'function') {
    const pdfDataUrl = await store.toPDFDataURL();
    const blob = await dataUrlToBlob(pdfDataUrl);
    downloadBlob(blob, 'comictrans-export.pdf');
    return;
  }

  if (!store.pages.length) return;

  const firstPageDataUrl = await store.pages[0].toDataURL({ pixelRatio: 2, mimeType: 'image/png' });
  const firstImage = new Image();
  await new Promise<void>((resolve) => {
    firstImage.onload = () => resolve();
    firstImage.src = firstPageDataUrl;
  });

  const pdf = new jsPDF({
    orientation: firstImage.width >= firstImage.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [firstImage.width, firstImage.height]
  });

  pdf.addImage(firstPageDataUrl, 'PNG', 0, 0, firstImage.width, firstImage.height);

  for (let i = 1; i < store.pages.length; i += 1) {
    const pageDataUrl = await store.pages[i].toDataURL({ pixelRatio: 2, mimeType: 'image/png' });
    const pageImage = new Image();
    await new Promise<void>((resolve) => {
      pageImage.onload = () => resolve();
      pageImage.src = pageDataUrl;
    });

    pdf.addPage([pageImage.width, pageImage.height], pageImage.width >= pageImage.height ? 'landscape' : 'portrait');
    pdf.addImage(pageDataUrl, 'PNG', 0, 0, pageImage.width, pageImage.height);
  }

  pdf.save('comictrans-export.pdf');
};
