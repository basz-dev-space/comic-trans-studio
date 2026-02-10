import { describe, it, expect } from 'vitest';
import { fileToDataUrl } from './image';

describe('image utilities', () => {
  describe('fileToDataUrl', () => {
    it('should convert file to data URL', async () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      const file = new File([blob], 'test.png', { type: 'image/png' });

      const result = await fileToDataUrl(file);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image')).toBe(true);
    });
  });
});
