export interface TranslationRequest {
  texts: { id: string; original: string }[];
  targetLang: string;
  sourceLang?: string;
}

export interface TranslationResponse {
  translations: { id: string; translated: string }[];
}

class TranslationService {
  private apiEndpoint = '/api/translate';

  async translate(
    texts: { id: string; original: string }[],
    targetLang: string,
    sourceLang?: string
  ): Promise<TranslationResponse> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          texts,
          targetLang,
          sourceLang
        })
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: 'Translation request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Translation service error:', error);
      throw error;
    }
  }

  async translateText(text: string, targetLang: string, sourceLang?: string): Promise<string> {
    const response = await this.translate(
      [{ id: 'single', original: text }],
      targetLang,
      sourceLang
    );

    return response.translations[0]?.translated || text;
  }
}

export const translationService = new TranslationService();

export async function translatePageText(
  textBoxes: { id: string; originalText: string }[],
  targetLang: string = 'en',
  sourceLang?: string
): Promise<{ id: string; text: string }[]> {
  try {
    const formattedTexts = textBoxes.map((tb) => ({ id: tb.id, original: tb.originalText }));
    const response = await translationService.translate(formattedTexts, targetLang, sourceLang);
    return response.translations.map((t) => ({ id: t.id, text: t.translated }));
  } catch (error) {
    console.error('Translation failed, using fallback:', error);
    return textBoxes.map((tb) => ({
      id: tb.id,
      text: `[Translated: ${tb.originalText}]`
    }));
  }
}
