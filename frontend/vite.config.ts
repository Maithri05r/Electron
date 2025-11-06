// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// export default defineConfig({
//   plugins: [react()],
//   resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
//   server: { port: 5173 }
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
  },
  base: mode === 'development' ? '/' : './', // ✅ Key fix for Electron build
  build: {
    outDir: 'dist', // will output to frontend/dist
    emptyOutDir: true,
  },
}));
