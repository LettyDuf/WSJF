import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'node:path';

// Build d'un fichier HTML autoportant. Le plugin viteSingleFile inline JS et CSS.
// Sortie : dist/index.html, déployable sur Confluence, SharePoint, ou en double-clic local.
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, './src/domain'),
      '@ports': path.resolve(__dirname, './src/ports'),
      '@adapters': path.resolve(__dirname, './src/adapters'),
      '@ui': path.resolve(__dirname, './src/ui'),
    },
  },
  plugins: [viteSingleFile()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000_000,
    // Désactivé pour compatibilité dossiers réseau / volumes montés avec permissions restrictives.
    // Sur usage local Mac, peut être réactivé sans souci.
    emptyOutDir: false,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
