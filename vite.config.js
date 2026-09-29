import { defineConfig } from 'vite';

// Relative base so the built site works on GitHub Pages or any static host sub-path.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 900 },
});
