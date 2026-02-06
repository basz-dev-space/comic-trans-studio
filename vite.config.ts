import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [sveltekit()],
    define: {
      'import.meta.env.VITE_POLPOTNO_API_KEY': JSON.stringify(
        env.VITE_POLPOTNO_API_KEY || env.POLPOTNO_API_KEY || ''
      )
    }
  };
});
