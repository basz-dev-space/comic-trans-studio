import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { texts, targetLang, sourceLang } = await request.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      throw error(400, { message: 'Texts array is required' });
    }

    if (!targetLang) {
      throw error(400, { message: 'Target language is required' });
    }

    // Mock translation service - replace with actual translation API integration
    // This could integrate with Google Translate API, DeepL, Azure Translator, etc.
    const translations = texts.map((item: { id: string; original: string }) => ({
      id: item.id,
      translated: `[${targetLang.toUpperCase()}] ${item.original}`
    }));

    return json({ translations });
  } catch (err: any) {
    console.error('Translation API error:', err);
    throw error(500, { message: err.message || 'Translation failed' });
  }
};
