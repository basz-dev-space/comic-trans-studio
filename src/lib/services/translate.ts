// eslint-disable-next-line no-unused-vars
export type TranslateProvider = (input: string[]) => Promise<string[]>;

const mockProvider: TranslateProvider = async (input) =>
  input.map((line) => `[Translated] ${line}`);

export async function translatePageText(lines: { id: string; originalText: string }[]) {
  const translated = await mockProvider(lines.map((line) => line.originalText));
  return lines.map((line, index) => ({ id: line.id, text: translated[index] ?? line.originalText }));
}
