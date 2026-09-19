import { resolve } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Builds the popup only. The content script is bundled separately by
 * `scripts/build.mjs`, because a content script must be a classic IIFE and
 * cannot use the ES module output Vite produces.
 */
export default defineConfig(() => {
  const target = process.env.YCC_TARGET ?? 'chrome';

  return {
    root: resolve(import.meta.dirname, 'src/popup'),
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': resolve(import.meta.dirname, 'src') },
    },
    build: {
      outDir: resolve(import.meta.dirname, 'dist', target, 'popup'),
      emptyOutDir: true,
      target: 'es2022',
    },
  };
});
